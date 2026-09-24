const crypto = require('crypto');
const Handover = require('../models/Handover');
const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

// Generate 6-digit secure PIN
const generatePIN = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate unique handover reference
const generateReference = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LF-${year}-${random}`;
};

// @desc    Schedule a handover for an approved claim
// @route   POST /api/handovers
// @access  Private (Finder or Claimant or Admin)
const createHandover = async (req, res, next) => {
  try {
    const { claimId, location, scheduledDate, scheduledTime, notes } = req.body;

    const claim = await Claim.findById(claimId)
      .populate('foundItemId')
      .populate('claimantId');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim record not found' });
    }

    if (claim.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Handover can only be scheduled for claims with APPROVED status.'
      });
    }

    const foundItem = claim.foundItemId;
    const finderId = foundItem.reportedBy;
    const ownerId = claim.claimantId._id;

    // Check if handover already exists for this claim
    let existingHandover = await Handover.findOne({ claimId });
    if (existingHandover && existingHandover.status === 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'A handover is already scheduled for this claim.',
        handoverId: existingHandover._id
      });
    }

    const handoverReference = generateReference();
    const verificationCode = generatePIN();

    const handover = await Handover.create({
      handoverReference,
      claimId: claim._id,
      foundItemId: foundItem._id,
      lostItemId: claim.lostItemId || null,
      finderId,
      ownerId,
      location,
      scheduledDate,
      scheduledTime,
      verificationCode,
      notes: notes || '',
      status: 'SCHEDULED'
    });

    // Update item lifecycle status
    foundItem.status = 'HANDOVER_SCHEDULED';
    await foundItem.save();

    if (claim.lostItemId) {
      await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'HANDOVER_SCHEDULED' });
    }

    // Send notifications to both participants
    await notificationService.notifyHandoverScheduled(finderId, handover, foundItem, true);
    await notificationService.notifyHandoverScheduled(ownerId, handover, foundItem, false);

    await auditService.logAction({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'HANDOVER_SCHEDULED',
      entityType: 'HANDOVER',
      entityId: handover._id,
      metadata: {
        handoverReference,
        location,
        scheduledDate,
        scheduledTime
      },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Handover successfully scheduled. Verification code generated.',
      data: handover
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get handovers for current user
// @route   GET /api/handovers
// @access  Private
const getMyHandovers = async (req, res, next) => {
  try {
    const isFinderOrOwner = {
      $or: [{ finderId: req.user._id }, { ownerId: req.user._id }]
    };
    const query = req.user.role === 'ADMIN' ? {} : isFinderOrOwner;

    const handovers = await Handover.find(query)
      .populate('finderId', 'name email department phone profileImage')
      .populate('ownerId', 'name email department phone profileImage')
      .populate('foundItemId', 'title category location publicColor publicImage status')
      .populate('claimId')
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({
      success: true,
      count: handovers.length,
      data: handovers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single handover details
// @route   GET /api/handovers/:id
// @access  Private
const getHandoverById = async (req, res, next) => {
  try {
    const handover = await Handover.findById(req.params.id)
      .populate('finderId', 'name email department phone profileImage studentId')
      .populate('ownerId', 'name email department phone profileImage studentId')
      .populate('foundItemId')
      .populate('lostItemId')
      .populate('claimId');

    if (!handover) {
      return res.status(404).json({ success: false, message: 'Handover record not found' });
    }

    const isParticipant =
      handover.finderId._id.toString() === req.user._id.toString() ||
      handover.ownerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this handover.' });
    }

    res.json({
      success: true,
      data: handover
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm handover using verification code / party confirmation
// @route   PUT /api/handovers/:id/confirm
// @access  Private
const confirmHandover = async (req, res, next) => {
  try {
    const { verificationCode, confirmationType } = req.body; // confirmationType: 'CODE' or 'CONFIRM'
    const handover = await Handover.findById(req.params.id)
      .populate('foundItemId')
      .populate('claimId');

    if (!handover) {
      return res.status(404).json({ success: false, message: 'Handover record not found' });
    }

    if (handover.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This handover has already been completed and verified.'
      });
    }

    const isFinder = handover.finderId.toString() === req.user._id.toString();
    const isOwner = handover.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isFinder && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    let isCompleted = false;

    // Direct Code verification (Finder enters owner's code or vice versa)
    if (verificationCode) {
      if (verificationCode.trim() !== handover.verificationCode.trim() && !isAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please check the 6-digit code shown on the owner/claimant screen.',
          error: 'INVALID_CODE'
        });
      }
      isCompleted = true;
      handover.finderConfirmed = true;
      handover.finderConfirmedAt = new Date();
      handover.ownerConfirmed = true;
      handover.ownerConfirmedAt = new Date();
    } else {
      // Step-by-step confirmation
      if (isFinder) {
        handover.finderConfirmed = true;
        handover.finderConfirmedAt = new Date();
      }
      if (isOwner) {
        handover.ownerConfirmed = true;
        handover.ownerConfirmedAt = new Date();
      }
      if (isAdmin) {
        handover.finderConfirmed = true;
        handover.ownerConfirmed = true;
      }

      if (handover.finderConfirmed && handover.ownerConfirmed) {
        isCompleted = true;
      }
    }

    if (isCompleted) {
      handover.status = 'COMPLETED';
      handover.completedAt = new Date();

      // Update FoundItem to RETURNED / CLOSED
      const foundItem = await FoundItem.findById(handover.foundItemId);
      if (foundItem) {
        foundItem.status = 'RETURNED';
        foundItem.resolvedAt = new Date();
        await foundItem.save();
      }

      // Update LostItem to RETURNED / CLOSED if linked
      if (handover.lostItemId) {
        await LostItem.findByIdAndUpdate(handover.lostItemId, {
          status: 'RETURNED',
          resolvedAt: new Date()
        });
      }

      // Update Claim to COMPLETED
      await Claim.findByIdAndUpdate(handover.claimId, { status: 'COMPLETED' });

      // Trigger completion notifications
      await notificationService.notifyItemReturned(handover.ownerId, foundItem);
      await notificationService.notifyItemReturned(handover.finderId, foundItem);

      await auditService.logAction({
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'HANDOVER_COMPLETED',
        entityType: 'HANDOVER',
        entityId: handover._id,
        metadata: {
          handoverReference: handover.handoverReference,
          foundItemId: handover.foundItemId
        },
        req
      });
    }

    await handover.save();

    res.json({
      success: true,
      message: isCompleted
        ? 'Handover completed and verified! Item status updated to RETURNED.'
        : 'Your confirmation has been recorded. Waiting for the other party to confirm.',
      isCompleted,
      data: handover
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createHandover,
  getMyHandovers,
  getHandoverById,
  confirmHandover
};
