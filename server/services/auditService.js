const AuditLog = require('../models/AuditLog');

const logAction = async ({ userId, userEmail, action, entityType, entityId, metadata = {}, req = null }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
      : '';
      
    await AuditLog.create({
      userId,
      userEmail: userEmail || (req?.user?.email) || 'System',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      metadata,
      ipAddress
    });
  } catch (err) {
    console.error('[AuditService] Failed to record audit log:', err.message);
  }
};

module.exports = {
  logAction
};
