const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    confidenceTier: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    matchingFactors: [
      {
        factor: { type: String, required: true }, // e.g. "Category", "Location", "Date", "Color", "Brand", "Description"
        weight: { type: Number, required: true },
        score: { type: Number, required: true },
        detail: { type: String, required: true },
        matched: { type: Boolean, default: false }
      }
    ],
    status: {
      type: String,
      enum: ['POTENTIAL', 'VIEWED', 'DISMISSED', 'CLAIMED'],
      default: 'POTENTIAL'
    },
    dismissedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });
matchSchema.index({ matchScore: -1 });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
