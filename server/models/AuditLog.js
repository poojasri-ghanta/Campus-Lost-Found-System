const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userEmail: {
      type: String,
      default: 'System'
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entityType: {
      type: String,
      enum: ['USER', 'LOST_ITEM', 'FOUND_ITEM', 'CLAIM', 'HANDOVER', 'MATCH', 'SYSTEM'],
      required: true
    },
    entityId: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
