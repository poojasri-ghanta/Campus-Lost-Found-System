const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'MATCH_FOUND',
        'CLAIM_SUBMITTED',
        'CLAIM_UNDER_REVIEW',
        'CLAIM_APPROVED',
        'CLAIM_REJECTED',
        'MORE_INFO_REQUESTED',
        'HANDOVER_SCHEDULED',
        'HANDOVER_CONFIRMED',
        'ITEM_RETURNED',
        'DISPUTE_RAISED',
        'DISPUTE_RESOLVED',
        'SYSTEM_ALERT'
      ],
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    },
    relatedModel: {
      type: String,
      enum: ['LostItem', 'FoundItem', 'Claim', 'Match', 'Handover', 'User'],
      default: 'FoundItem'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
