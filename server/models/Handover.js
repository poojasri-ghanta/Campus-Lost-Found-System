const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema(
  {
    handoverReference: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem'
    },
    finderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: String,
      required: [true, 'Handover location is required'],
      trim: true
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
      trim: true
    },
    verificationCode: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
      default: 'SCHEDULED'
    },
    finderConfirmed: {
      type: Boolean,
      default: false
    },
    finderConfirmedAt: {
      type: Date
    },
    ownerConfirmed: {
      type: Boolean,
      default: false
    },
    ownerConfirmedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

handoverSchema.index({ finderId: 1, ownerId: 1 });
handoverSchema.index({ handoverReference: 1 });

const Handover = mongoose.model('Handover', handoverSchema);
module.exports = Handover;
