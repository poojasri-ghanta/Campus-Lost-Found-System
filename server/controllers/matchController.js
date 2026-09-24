const Match = require('../models/Match');
const LostItem = require('../models/LostItem');
const matchingEngine = require('../services/matchingEngine');

// @desc    Get all active matches for current user's lost items
// @route   GET /api/matches
// @access  Private
const getMyMatches = async (req, res, next) => {
  try {
    const userLostItems = await LostItem.find({ reportedBy: req.user._id }).select('_id');
    const lostItemIds = userLostItems.map(item => item._id);

    const matches = await Match.find({
      lostItemId: { $in: lostItemIds },
      status: { $ne: 'DISMISSED' }
    })
      .populate('lostItemId', 'title category location lostDate image')
      .populate({
        path: 'foundItemId',
        select: 'title category location foundDate publicColor publicImage status reportedBy',
        populate: { path: 'reportedBy', select: 'name email profileImage department' }
      })
      .sort({ matchScore: -1 });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get match by ID with detailed factor explanation
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate({
        path: 'foundItemId',
        select: '-privateDetails',
        populate: { path: 'reportedBy', select: 'name email department profileImage' }
      });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match record not found' });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually trigger matching engine re-scan
// @route   POST /api/matches/generate
// @access  Private
const generateMatches = async (req, res, next) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    let matches = [];

    if (lostItemId) {
      matches = await matchingEngine.generateMatchesForLostItem(lostItemId);
    } else if (foundItemId) {
      matches = await matchingEngine.generateMatchesForFoundItem(foundItemId);
    } else {
      // Scan all active lost items for user
      const userItems = await LostItem.find({
        reportedBy: req.user._id,
        status: { $in: ['REPORTED', 'ACTIVE', 'POTENTIAL_MATCH'] }
      });
      for (const item of userItems) {
        const itemMatches = await matchingEngine.generateMatchesForLostItem(item._id);
        matches.push(...itemMatches);
      }
    }

    res.json({
      success: true,
      message: `Matching engine executed successfully. Found ${matches.length} matches.`,
      count: matches.length,
      data: matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dismiss a match recommendation
// @route   PUT /api/matches/:id/dismiss
// @access  Private
const dismissMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    match.status = 'DISMISSED';
    match.dismissedBy = req.user._id;
    await match.save();

    res.json({
      success: true,
      message: 'Match dismissed'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyMatches,
  getMatchById,
  generateMatches,
  dismissMatch
};
