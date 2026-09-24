const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem'
    },
    answers: [
      {
        questionId: { type: String, required: true },
        question: { type: String, required: true },
        claimantAnswer: { type: String, required: true },
        matchedCriteria: { type: String },
        fieldKey: { type: String },
        scoreAwarded: { type: Number, default: 0 },
        maxScore: { type: Number, default: 20 },
        matchQuality: {
          type: String,
          enum: ['EXACT', 'PARTIAL', 'NO_MATCH', 'MANUAL_REVIEW'],
          default: 'MANUAL_REVIEW'
        }
      }
    ],
    additionalEvidence: {
      type: String,
      default: ''
    },
    verificationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    confidenceRating: {
      type: String,
      enum: ['STRONG_MATCH', 'NEEDS_REVIEW', 'LOW_CONFIDENCE'],
      default: 'NEEDS_REVIEW'
    },
    scoreBreakdown: {
      categoryScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      dateScore: { type: Number, default: 0 },
      colorScore: { type: Number, default: 0 },
      brandScore: { type: Number, default: 0 },
      uniqueFeaturesScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'UNDER_REVIEW',
        'MORE_INFORMATION_REQUIRED',
        'APPROVED',
        'REJECTED',
        'DISPUTED',
        'CANCELLED',
        'COMPLETED'
      ],
      default: 'PENDING'
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewerComments: {
      type: String,
      default: ''
    },
    disputeNotes: {
      type: String,
      default: ''
    },
    moreInfoRequestedQuestion: {
      type: String,
      default: ''
    },
    moreInfoResponse: {
      type: String,
      default: ''
    },
    timeline: [
      {
        status: { type: String, required: true },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

claimSchema.index({ foundItemId: 1, claimantId: 1 });
claimSchema.index({ status: 1 });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
