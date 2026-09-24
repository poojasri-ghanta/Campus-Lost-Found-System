const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type, relatedId, relatedModel }) => {
  try {
    if (!userId) return null;
    return await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedModel: relatedModel || 'FoundItem'
    });
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err.message);
    return null;
  }
};

const notifyMatchFound = async (userId, lostItem, foundItem, matchScore) => {
  return await createNotification({
    userId,
    title: `Potential Match Detected (${matchScore}% Match)`,
    message: `We found an item matching your lost "${lostItem.title}" located near "${foundItem.location}". Review to verify ownership.`,
    type: 'MATCH_FOUND',
    relatedId: foundItem._id,
    relatedModel: 'FoundItem'
  });
};

const notifyClaimSubmitted = async (finderId, foundItem, claimant) => {
  return await createNotification({
    userId: finderId,
    title: 'New Ownership Claim Submitted',
    message: `${claimant.name} submitted an ownership claim with verification answers for "${foundItem.title}".`,
    type: 'CLAIM_SUBMITTED',
    relatedId: foundItem._id,
    relatedModel: 'FoundItem'
  });
};

const notifyClaimStatusUpdate = async (claimantId, foundItem, status, comments = '') => {
  let title = 'Claim Status Updated';
  let message = `Your claim for "${foundItem.title}" is now ${status.replace(/_/g, ' ')}.`;
  let type = 'CLAIM_UNDER_REVIEW';

  if (status === 'APPROVED') {
    title = 'Claim Approved!';
    message = `Your claim for "${foundItem.title}" has been APPROVED. You can now schedule your secure item handover!`;
    type = 'CLAIM_APPROVED';
  } else if (status === 'REJECTED') {
    title = 'Claim Not Approved';
    message = `Your claim for "${foundItem.title}" was declined. Reason: ${comments || 'Insufficient ownership verification.'}`;
    type = 'CLAIM_REJECTED';
  } else if (status === 'MORE_INFORMATION_REQUIRED') {
    title = 'More Information Requested';
    message = `The finder requested additional details for your claim on "${foundItem.title}". Message: ${comments}`;
    type = 'MORE_INFO_REQUESTED';
  }

  return await createNotification({
    userId: claimantId,
    title,
    message,
    type,
    relatedId: foundItem._id,
    relatedModel: 'FoundItem'
  });
};

const notifyHandoverScheduled = async (userId, handover, foundItem, isFinder = false) => {
  const roleText = isFinder ? 'claimant' : 'finder';
  return await createNotification({
    userId,
    title: 'Item Handover Scheduled',
    message: `Handover for "${foundItem.title}" is set for ${new Date(handover.scheduledDate).toLocaleDateString()} at ${handover.scheduledTime} (${handover.location}). Ref: ${handover.handoverReference}`,
    type: 'HANDOVER_SCHEDULED',
    relatedId: handover._id,
    relatedModel: 'Handover'
  });
};

const notifyItemReturned = async (userId, foundItem) => {
  return await createNotification({
    userId,
    title: 'Item Return Confirmed',
    message: `Handover complete for "${foundItem.title}". The case has been marked as RETURNED and closed.`,
    type: 'ITEM_RETURNED',
    relatedId: foundItem._id,
    relatedModel: 'FoundItem'
  });
};

const notifyDisputeCreated = async (adminUsers, foundItem, claimCount) => {
  for (const admin of adminUsers) {
    await createNotification({
      userId: admin._id,
      title: 'Disputed Item Claim Alert',
      message: `Item "${foundItem.title}" has received ${claimCount} conflicting claims. Admin dispute review required.`,
      type: 'DISPUTE_RAISED',
      relatedId: foundItem._id,
      relatedModel: 'FoundItem'
    });
  }
};

module.exports = {
  createNotification,
  notifyMatchFound,
  notifyClaimSubmitted,
  notifyClaimStatusUpdate,
  notifyHandoverScheduled,
  notifyItemReturned,
  notifyDisputeCreated
};
