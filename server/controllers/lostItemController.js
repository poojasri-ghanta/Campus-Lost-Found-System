const LostItem = require('../models/LostItem');
const Match = require('../models/Match');
const matchingEngine = require('../services/matchingEngine');
const auditService = require('../services/auditService');

// @desc    Create a lost item report
// @route   POST /api/lost-items
// @access  Private
const createLostItem = async (req, res, next) => {
  try {
    const { category, title, description, color, brand, model, location, lostDate, image, tags } = req.body;

    const lostItem = await LostItem.create({
      reportedBy: req.user._id,
      category,
      title,
      description,
      color,
      brand: brand || '',
      model: model || '',
      location,
      lostDate: lostDate || new Date(),
      image: image || '',
      tags: tags || [],
      status: 'REPORTED'
    });

    // Run matching engine asynchronously to find potential found items
    try {
      await matchingEngine.generateMatchesForLostItem(lostItem._id);
    } catch (matchErr) {
      console.error('[MatchingEngine] Non-fatal error during auto-matching:', matchErr.message);
    }

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'LOST_ITEM_REPORTED',
      entityType: 'LOST_ITEM',
      entityId: lostItem._id,
      metadata: { title: lostItem.title, category: lostItem.category },
      req
    });

    const populatedItem = await LostItem.findById(lostItem._id).populate('reportedBy', 'name email department profileImage');

    res.status(201).json({
      success: true,
      message: 'Lost item report submitted successfully. Matching engine scan initiated.',
      data: populatedItem
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all lost items with search & filters
// @route   GET /api/lost-items
// @access  Public / Private
const getLostItems = async (req, res, next) => {
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
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
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
      query.color = { $regex: color, $options: 'i' };
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.lostDate = {};
      if (startDate) query.lostDate.$gte = new Date(startDate);
      if (endDate) query.lostDate.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      LostItem.find(query)
        .populate('reportedBy', 'name email department profileImage')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      LostItem.countDocuments(query)
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

// @desc    Get single lost item by ID
// @route   GET /api/lost-items/:id
// @access  Public / Private
const getLostItemById = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate('reportedBy', 'name email department phone profileImage');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item report not found',
        error: 'NOT_FOUND'
      });
    }

    // Retrieve active matches
    const matches = await Match.find({ lostItemId: item._id, status: { $ne: 'DISMISSED' } })
      .populate({
        path: 'foundItemId',
        populate: { path: 'reportedBy', select: 'name email profileImage department' }
      })
      .sort({ matchScore: -1 });

    res.json({
      success: true,
      data: item,
      matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reports created by current user
// @route   GET /api/lost-items/my
// @access  Private
const getMyLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find({ reportedBy: req.user._id })
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

// @desc    Update lost item
// @route   PUT /api/lost-items/:id
// @access  Private (Owner or Admin)
const updateLostItem = async (req, res, next) => {
  try {
    let item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this report.'
      });
    }

    const allowedFields = ['title', 'description', 'color', 'brand', 'model', 'location', 'lostDate', 'image', 'status', 'tags'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.body.status === 'CLOSED' || req.body.status === 'RETURNED') {
      item.resolvedAt = new Date();
    }

    await item.save();

    // Re-run matching if key attributes modified
    matchingEngine.generateMatchesForLostItem(item._id).catch(() => {});

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'LOST_ITEM_UPDATED',
      entityType: 'LOST_ITEM',
      entityId: item._id,
      metadata: { status: item.status },
      req
    });

    res.json({
      success: true,
      message: 'Lost item report updated successfully',
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete lost item
// @route   DELETE /api/lost-items/:id
// @access  Private (Owner or Admin)
const deleteLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this report.'
      });
    }

    await LostItem.findByIdAndDelete(req.params.id);
    await Match.deleteMany({ lostItemId: req.params.id });

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'LOST_ITEM_DELETED',
      entityType: 'LOST_ITEM',
      entityId: req.params.id,
      req
    });

    res.json({
      success: true,
      message: 'Lost item report removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLostItem,
  getLostItems,
  getLostItemById,
  getMyLostItems,
  updateLostItem,
  deleteLostItem
};
