const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const User = require('../models/User');
const verificationEngine = require('../services/verificationEngine');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

// @desc    Submit an ownership claim with verification questionnaire answers
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const { foundItemId, lostItemId, answers, additionalEvidence } = req.body;

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    // Prevent finder from claiming their own found item
    if (foundItem.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an ownership claim on an item that you reported finding.'
      });
    }

    // Check if user already submitted a non-cancelled claim
    const existingClaim = await Claim.findOne({
      foundItemId,
      claimantId: req.user._id,
      status: { $nin: ['CANCELLED', 'REJECTED'] }
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active claim submitted for this item.',
        existingClaimId: existingClaim._id
      });
    }

    let claimantLostItem = null;
    if (lostItemId) {
      claimantLostItem = await LostItem.findById(lostItemId);
    }

    // Evaluate answers against private item details
    const evaluation = verificationEngine.evaluateClaim(answers, foundItem, claimantLostItem);

    const claim = await Claim.create({
      foundItemId,
      claimantId: req.user._id,
      lostItemId: lostItemId || null,
      answers: evaluation.answersEvaluated,
      additionalEvidence: additionalEvidence || '',
      verificationScore: evaluation.verificationScore,
      confidenceRating: evaluation.confidenceRating,
      scoreBreakdown: evaluation.scoreBreakdown,
      status: 'PENDING',
      timeline: [
        {
          status: 'PENDING',
          actor: req.user._id,
          note: `Claim submitted with verification confidence score: ${evaluation.verificationScore}% (${evaluation.confidenceRating})`
        }
      ]
    });

    // Update found item metrics & status
    foundItem.claimCount = (foundItem.claimCount || 0) + 1;
    if (foundItem.claimCount > 1) {
      foundItem.isDisputed = true;
      foundItem.status = 'DISPUTED';
      
      // Notify Admin team about dispute
      const admins = await User.find({ role: 'ADMIN', isActive: true });
      await notificationService.notifyDisputeCreated(admins, foundItem, foundItem.claimCount);
    } else if (foundItem.status === 'ACTIVE' || foundItem.status === 'REPORTED') {
      foundItem.status = 'CLAIM_REQUESTED';
    }
    await foundItem.save();

    // Notify Finder
    await notificationService.notifyClaimSubmitted(foundItem.reportedBy, foundItem, req.user);

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'CLAIM_SUBMITTED',
      entityType: 'CLAIM',
      entityId: claim._id,
      metadata: {
        foundItemId,
        verificationScore: evaluation.verificationScore,
        confidenceRating: evaluation.confidenceRating
      },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Ownership claim submitted successfully. The finder has been notified.',
      claim: {
        _id: claim._id,
        foundItemId: claim.foundItemId,
        status: claim.status,
        verificationScore: claim.verificationScore,
        confidenceRating: claim.confidenceRating,
        scoreBreakdown: claim.scoreBreakdown,
        createdAt: claim.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all claims submitted by the current user
// @route   GET /api/claims/my
// @access  Private
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate({
        path: 'foundItemId',
        select: 'title category location foundDate publicColor publicImage status reportedBy',
        populate: { path: 'reportedBy', select: 'name email profileImage' }
      })
      .populate('lostItemId', 'title lostDate location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get claim details by ID
// @route   GET /api/claims/:id
// @access  Private (Claimant, Finder, or Admin)
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimantId', 'name email department studentId phone profileImage')
      .populate('reviewerId', 'name email role')
      .populate('lostItemId')
      .populate({
        path: 'foundItemId',
        populate: { path: 'reportedBy', select: 'name email department phone profileImage' }
      });

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isClaimant = claim.claimantId._id.toString() === req.user._id.toString();
    const isFinder = claim.foundItemId?.reportedBy?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isClaimant && !isFinder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this claim.'
      });
    }

    // If claimant is viewing, conceal the exact private details from the populated foundItem
    const claimObj = claim.toObject();
    if (claimObj.foundItemId && !isFinder && !isAdmin) {
      delete claimObj.foundItemId.privateDetails;
    }

    res.json({
      success: true,
      data: claimObj,
      isClaimant,
      isFinder,
      isAdmin
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get claims for a specific found item (Finder / Admin)
// @route   GET /api/claims/item/:foundItemId
// @access  Private (Finder or Admin)
const getClaimsForItem = async (req, res, next) => {
  try {
    const foundItem = await FoundItem.findById(req.params.foundItemId);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    const isFinder = foundItem.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isFinder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or an administrator can inspect item claims.'
      });
    }

    const claims = await Claim.find({ foundItemId: req.params.foundItemId })
      .populate('claimantId', 'name email department studentId phone profileImage')
      .populate('lostItemId')
      .sort({ verificationScore: -1, createdAt: -1 });

    res.json({
      success: true,
      count: claims.length,
      item: foundItem,
      data: claims
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review and approve/reject/request info on a claim
// @route   PUT /api/claims/:id/review
// @access  Private (Finder or Admin)
const reviewClaim = async (req, res, next) => {
  try {
    const { status, reviewerComments, moreInfoQuestion } = req.body;
    
    if (!['UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'APPROVED', 'REJECTED', 'DISPUTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid claim status provided.' });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('foundItemId')
      .populate('claimantId');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const foundItem = claim.foundItemId;
    const isFinder = foundItem.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isFinder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the reporting finder or an administrator can review this claim.'
      });
    }

    claim.status = status;
    claim.reviewerId = req.user._id;
    claim.reviewerComments = reviewerComments || claim.reviewerComments;

    if (status === 'MORE_INFORMATION_REQUIRED' && moreInfoQuestion) {
      claim.moreInfoRequestedQuestion = moreInfoQuestion;
    }

    claim.timeline.push({
      status,
      actor: req.user._id,
      note: reviewerComments || `Claim transitioned to ${status}`
    });

    await claim.save();

    // Handle FoundItem state updates
    if (status === 'APPROVED') {
      foundItem.status = 'APPROVED';
      foundItem.approvedClaimId = claim._id;
      await foundItem.save();

      // Put other pending claims on hold / reject
      await Claim.updateMany(
        { foundItemId: foundItem._id, _id: { $ne: claim._id }, status: 'PENDING' },
        {
          status: 'REJECTED',
          reviewerComments: 'Another claimant successfully verified ownership.'
        }
      );
    } else if (status === 'REJECTED') {
      const remainingActiveClaims = await Claim.countDocuments({
        foundItemId: foundItem._id,
        status: { $in: ['PENDING', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'] }
      });
      if (remainingActiveClaims === 0) {
        foundItem.status = 'ACTIVE';
        foundItem.isDisputed = false;
        await foundItem.save();
      }
    }

    // Send notifications
    await notificationService.notifyClaimStatusUpdate(
      claim.claimantId._id,
      foundItem,
      status,
      reviewerComments || moreInfoQuestion
    );

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: `CLAIM_${status}`,
      entityType: 'CLAIM',
      entityId: claim._id,
      metadata: { foundItemId: foundItem._id, status, comments: reviewerComments },
      req
    });

    res.json({
      success: true,
      message: `Claim successfully updated to ${status}.`,
      data: claim
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Claimant responds to requested more information
// @route   POST /api/claims/:id/more-info
// @access  Private (Claimant)
const submitMoreInfo = async (req, res, next) => {
  try {
    const { responseText } = req.body;
    const claim = await Claim.findById(req.params.id).populate('foundItemId');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (claim.claimantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    claim.moreInfoResponse = responseText;
    claim.status = 'UNDER_REVIEW';
    claim.timeline.push({
      status: 'UNDER_REVIEW',
      actor: req.user._id,
      note: `Claimant submitted requested information: "${responseText.substring(0, 80)}..."`
    });

    await claim.save();

    // Notify Finder
    await notificationService.createNotification({
      userId: claim.foundItemId.reportedBy,
      title: 'Claimant Provided Additional Verification Details',
      message: `The claimant for "${claim.foundItemId.title}" replied to your clarification request.`,
      type: 'CLAIM_UNDER_REVIEW',
      relatedId: claim.foundItemId._id,
      relatedModel: 'FoundItem'
    });

    res.json({
      success: true,
      message: 'Additional information submitted for review.',
      data: claim
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Withdraw / Cancel claim
// @route   PUT /api/claims/:id/cancel
// @access  Private (Claimant)
const withdrawClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (claim.claimantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    claim.status = 'CANCELLED';
    claim.timeline.push({
      status: 'CANCELLED',
      actor: req.user._id,
      note: 'Claim voluntarily withdrawn by claimant.'
    });

    await claim.save();

    res.json({
      success: true,
      message: 'Claim withdrawn successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaimById,
  getClaimsForItem,
  reviewClaim,
  submitMoreInfo,
  withdrawClaim
};
