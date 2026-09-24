const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
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
    // PUBLIC FIELDS: Visible to all students and searchers
    publicDescription: {
      type: String,
      required: [true, 'Public description is required'],
      trim: true
    },
    publicImage: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      required: [true, 'Found location is required'],
      trim: true
    },
    foundDate: {
      type: Date,
      required: [true, 'Found date is required']
    },
    publicColor: {
      type: String,
      required: [true, 'Public color is required'],
      trim: true
    },
    
    // PRIVATE VERIFICATION DETAILS: Strictly concealed from normal endpoints
    privateDetails: {
      brand: { type: String, default: '', trim: true },
      model: { type: String, default: '', trim: true },
      scratches: { type: String, default: '', trim: true },
      caseDetails: { type: String, default: '', trim: true },
      wallpaper: { type: String, default: '', trim: true },
      serialNumber: { type: String, default: '', trim: true },
      specificContents: { type: String, default: '', trim: true },
      uniqueMarks: { type: String, default: '', trim: true },
      additionalSecret: { type: String, default: '', trim: true }
    },
    
    // Custom verification questions generated for claimants
    verificationQuestions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        fieldKey: { type: String, required: true },
        hint: { type: String, default: '' },
        weight: { type: Number, default: 20 }
      }
    ],

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
      default: 'ACTIVE'
    },
    claimCount: {
      type: Number,
      default: 0
    },
    isDisputed: {
      type: Boolean,
      default: false
    },
    approvedClaimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim'
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

foundItemSchema.index({ category: 1, location: 1, foundDate: 1 });
foundItemSchema.index({ title: 'text', publicDescription: 'text' });

// Method to safely sanitize found item for public viewing
foundItemSchema.methods.toPublicJSON = function (viewerUser = null) {
  const itemObj = this.toObject();
  
  const isOwner = viewerUser && itemObj.reportedBy && (
    (itemObj.reportedBy._id ? itemObj.reportedBy._id.toString() : itemObj.reportedBy.toString()) === viewerUser._id.toString()
  );
  const isAdmin = viewerUser && viewerUser.role === 'ADMIN';
  
  if (!isOwner && !isAdmin) {
    delete itemObj.privateDetails;
  }
  
  return itemObj;
};

const FoundItem = mongoose.model('FoundItem', foundItemSchema);
module.exports = FoundItem;
