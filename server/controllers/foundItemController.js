const FoundItem = require('../models/FoundItem');
const User = require('../models/User');
const Claim = require('../models/Claim');
const matchingEngine = require('../services/matchingEngine');
const verificationEngine = require('../services/verificationEngine');
const auditService = require('../services/auditService');

// @desc    Report a found item
// @route   POST /api/found-items
// @access  Private
const createFoundItem = async (req, res, next) => {
  try {
    const {
      category,
      title,
      publicDescription,
      publicImage,
      location,
      foundDate,
      publicColor,
      privateDetails = {},
      customQuestions = []
    } = req.body;

    // Build item doc
    const foundItem = new FoundItem({
      reportedBy: req.user._id,
      category,
      title,
      publicDescription,
      publicImage: publicImage || '',
      location,
      foundDate: foundDate || new Date(),
      publicColor,
      privateDetails: {
        brand: privateDetails.brand || '',
        model: privateDetails.model || '',
        scratches: privateDetails.scratches || '',
        caseDetails: privateDetails.caseDetails || '',
        wallpaper: privateDetails.wallpaper || '',
        serialNumber: privateDetails.serialNumber || '',
        specificContents: privateDetails.specificContents || '',
        uniqueMarks: privateDetails.uniqueMarks || '',
        additionalSecret: privateDetails.additionalSecret || ''
      },
      status: 'ACTIVE'
    });

    // Generate dynamic verification questions based on private details provided
    const autoQuestions = verificationEngine.generateVerificationQuestions(foundItem);
    foundItem.verificationQuestions = customQuestions.length > 0 ? customQuestions : autoQuestions;

    await foundItem.save();

    // If user was STUDENT role, upgrade perspective awareness
    if (req.user.role === 'STUDENT') {
      // User acts as finder for this item
    }

    // Trigger auto-matching with existing lost reports
    try {
      await matchingEngine.generateMatchesForFoundItem(foundItem._id);
    } catch (matchErr) {
      console.error('[MatchingEngine] Non-fatal error matching found item:', matchErr.message);
    }

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'FOUND_ITEM_REPORTED',
      entityType: 'FOUND_ITEM',
      entityId: foundItem._id,
      metadata: { title: foundItem.title, category: foundItem.category, location: foundItem.location },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Found item registered with progressive disclosure security. Private details protected.',
      data: foundItem.toPublicJSON(req.user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all found items (Sanitized Public View)
// @route   GET /api/found-items
// @access  Public / Private
const getFoundItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      status,
      color,
      startDate,
      endDate,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { publicDescription: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'ALL') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (location && location !== 'ALL') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (color && color !== 'ALL') {
      query.publicColor = { $regex: color, $options: 'i' };
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.foundDate = {};
      if (startDate) query.foundDate.$gte = new Date(startDate);
      if (endDate) query.foundDate.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    // Explicitly exclude privateDetails from listing
    const [items, total] = await Promise.all([
      FoundItem.find(query)
        .select('-privateDetails')
        .populate('reportedBy', 'name email department profileImage')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      FoundItem.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single found item by ID
// @route   GET /api/found-items/:id
// @access  Public / Private
const getFoundItemById = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('reportedBy', 'name email department phone profileImage');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Found item report not found',
        error: 'NOT_FOUND'
      });
    }

    const viewer = req.user || null;
    const isReporter = viewer && (item.reportedBy._id.toString() === viewer._id.toString());
    const isAdmin = viewer && viewer.role === 'ADMIN';

    // Fetch existing claims summary if finder or admin
    let claims = [];
    if (isReporter || isAdmin) {
      claims = await Claim.find({ foundItemId: item._id })
        .populate('claimantId', 'name email department studentId profileImage')
        .sort({ createdAt: -1 });
    }

    // Check if the current logged in viewer already submitted a claim for this item
    let userActiveClaim = null;
    if (viewer && !isReporter) {
      userActiveClaim = await Claim.findOne({
        foundItemId: item._id,
        claimantId: viewer._id
      });
    }

    const sanitizedData = item.toPublicJSON(viewer);

    res.json({
      success: true,
      data: sanitizedData,
      isReporter,
      isAdmin,
      claims: isReporter || isAdmin ? claims : undefined,
      userActiveClaim
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get found items reported by current user (Finder view)
// @route   GET /api/found-items/my
// @access  Private
const getMyFoundItems = async (req, res, next) => {
  try {
    const items = await FoundItem.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update found item
// @route   PUT /api/found-items/:id
// @access  Private (Finder or Admin)
const updateFoundItem = async (req, res, next) => {
  try {
    let item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this found item report.'
      });
    }

    const {
      title,
      publicDescription,
      publicColor,
      location,
      foundDate,
      publicImage,
      privateDetails,
      status
    } = req.body;

    if (title) item.title = title;
    if (publicDescription) item.publicDescription = publicDescription;
    if (publicColor) item.publicColor = publicColor;
    if (location) item.location = location;
    if (foundDate) item.foundDate = foundDate;
    if (publicImage !== undefined) item.publicImage = publicImage;
    if (status) item.status = status;

    if (privateDetails && typeof privateDetails === 'object') {
      item.privateDetails = {
        ...item.privateDetails.toObject(),
        ...privateDetails
      };
      // Regenerate questions if needed
      item.verificationQuestions = verificationEngine.generateVerificationQuestions(item);
    }

    await item.save();

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'FOUND_ITEM_UPDATED',
      entityType: 'FOUND_ITEM',
      entityId: item._id,
      metadata: { status: item.status },
      req
    });

    res.json({
      success: true,
      message: 'Found item updated successfully',
      data: item.toPublicJSON(req.user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete found item
// @route   DELETE /api/found-items/:id
// @access  Private (Finder or Admin)
const deleteFoundItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this found item report.'
      });
    }

    await FoundItem.findByIdAndDelete(req.params.id);

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'FOUND_ITEM_DELETED',
      entityType: 'FOUND_ITEM',
      entityId: req.params.id,
      req
    });

    res.json({
      success: true,
      message: 'Found item deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getMyFoundItems,
  updateFoundItem,
  deleteFoundItem
};
