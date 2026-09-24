const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');
const Handover = require('../models/Handover');
const AuditLog = require('../models/AuditLog');
const Category = require('../models/Category');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

// @desc    Get Admin Overview Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalLostItems,
      totalFoundItems,
      activeClaims,
      returnedItems,
      disputedItems,
      recentAuditLogs
    ] = await Promise.all([
      User.countDocuments(),
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      Claim.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'] } }),
      FoundItem.countDocuments({ status: 'RETURNED' }),
      FoundItem.countDocuments({ isDisputed: true }),
      AuditLog.find().sort({ createdAt: -1 }).limit(8)
    ]);

    const totalRecoverable = totalLostItems + totalFoundItems;
    const recoveryRate = totalRecoverable > 0 ? Math.round((returnedItems / (totalFoundItems || 1)) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalLostItems,
        totalFoundItems,
        activeClaims,
        returnedItems,
        disputedItems,
        recoveryRate: Math.min(100, recoveryRate)
      },
      recentActivity: recentAuditLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (status && status !== 'ALL') {
      query.isActive = status === 'ACTIVE';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status / role (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, suspensionReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (suspensionReason !== undefined) user.suspensionReason = suspensionReason;

    await user.save();

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ADMIN_USER_UPDATED',
      entityType: 'USER',
      entityId: user._id,
      metadata: { targetUser: user.email, role: user.role, isActive: user.isActive },
      req
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Disputed Items with multiple claims (Admin)
// @route   GET /api/admin/disputes
// @access  Private (Admin)
const getDisputes = async (req, res, next) => {
  try {
    const disputedFoundItems = await FoundItem.find({
      $or: [{ isDisputed: true }, { status: 'DISPUTED' }, { claimCount: { $gte: 2 } }]
    }).populate('reportedBy', 'name email department phone profileImage');

    const disputesList = [];

    for (const item of disputedFoundItems) {
      const claims = await Claim.find({ foundItemId: item._id })
        .populate('claimantId', 'name email department studentId phone profileImage')
        .populate('lostItemId')
        .sort({ verificationScore: -1, createdAt: 1 });

      disputesList.push({
        item,
        claimsCount: claims.length,
        claims
      });
    }

    res.json({
      success: true,
      count: disputesList.length,
      data: disputesList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve a dispute by awarding to a specific claim (Admin)
// @route   POST /api/admin/disputes/:itemId/resolve
// @access  Private (Admin)
const resolveDispute = async (req, res, next) => {
  try {
    const { winningClaimId, resolutionNotes } = req.body;
    const foundItem = await FoundItem.findById(req.params.itemId);

    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    const winningClaim = await Claim.findById(winningClaimId).populate('claimantId');
    if (!winningClaim) {
      return res.status(404).json({ success: false, message: 'Selected winning claim not found' });
    }

    // Approve the winning claim
    winningClaim.status = 'APPROVED';
    winningClaim.reviewerId = req.user._id;
    winningClaim.reviewerComments = resolutionNotes || 'Approved by Campus Administration dispute resolution.';
    winningClaim.timeline.push({
      status: 'APPROVED',
      actor: req.user._id,
      note: `Dispute resolved by Admin. Selected as legitimate owner.`
    });
    await winningClaim.save();

    // Reject all competing claims
    await Claim.updateMany(
      { foundItemId: foundItem._id, _id: { $ne: winningClaimId } },
      {
        status: 'REJECTED',
        reviewerId: req.user._id,
        reviewerComments: 'Dispute closed: verified ownership awarded to another claimant based on identifying marks.'
      }
    );

    // Update FoundItem status
    foundItem.status = 'APPROVED';
    foundItem.isDisputed = false;
    foundItem.approvedClaimId = winningClaim._id;
    await foundItem.save();

    // Notify winner
    await notificationService.notifyClaimStatusUpdate(
      winningClaim.claimantId._id,
      foundItem,
      'APPROVED',
      'Administration has verified your ownership through dispute resolution. Proceed to schedule handover.'
    );

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ADMIN_DISPUTE_RESOLVED',
      entityType: 'FOUND_ITEM',
      entityId: foundItem._id,
      metadata: {
        winningClaimId,
        winnerEmail: winningClaim.claimantId.email,
        resolutionNotes
      },
      req
    });

    res.json({
      success: true,
      message: 'Dispute resolved successfully. Winning claim approved and all other claims settled.',
      data: {
        item: foundItem,
        winningClaim
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Audit Logs (Admin)
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action && action !== 'ALL') {
      query.action = action;
    }

    if (entityType && entityType !== 'ALL') {
      query.entityType = entityType;
    }

    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Analytics Breakdown Data (Admin)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    // 1. By Category (Lost vs Found)
    const [lostByCategory, foundByCategory, itemsByLocation, monthlyTrends] = await Promise.all([
      LostItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      FoundItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      FoundItem.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      FoundItem.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$foundDate' },
              year: { $year: '$foundDate' }
            },
            foundCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        lostByCategory,
        foundByCategory,
        itemsByLocation,
        monthlyTrends
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Categories
// @route   GET /api/admin/categories
// @access  Public / Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Category (Admin)
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, verificationFields } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name,
      slug,
      icon: icon || 'Package',
      description: description || '',
      verificationFields: verificationFields || []
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  getDisputes,
  resolveDispute,
  getAuditLogs,
  getAnalytics,
  getCategories,
  createCategory
};
