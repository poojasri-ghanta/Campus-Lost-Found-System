const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    },
    brand: {
      type: String,
      default: '',
      trim: true
    },
    model: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Lost location is required'],
      trim: true
    },
    lostDate: {
      type: Date,
      required: [true, 'Lost date is required']
    },
    image: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'REPORTED',
        'ACTIVE',
        'POTENTIAL_MATCH',
        'CLAIM_REQUESTED',
        'UNDER_VERIFICATION',
        'APPROVED',
        'HANDOVER_SCHEDULED',
        'RETURNED',
        'CLOSED',
        'REJECTED',
        'EXPIRED',
        'DISPUTED',
        'CANCELLED'
      ],
      default: 'REPORTED'
    },
    tags: [String],
    potentialMatchCount: {
      type: Number,
      default: 0
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

lostItemSchema.index({ category: 1, location: 1, lostDate: 1 });
lostItemSchema.index({ title: 'text', description: 'text', brand: 'text' });

const LostItem = mongoose.model('LostItem', lostItemSchema);
module.exports = LostItem;
