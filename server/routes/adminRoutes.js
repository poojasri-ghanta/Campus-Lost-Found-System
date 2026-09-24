const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUser,
  getDisputes,
  resolveDispute,
  getAuditLogs,
  getAnalytics,
  getCategories,
  createCategory
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect and restrict all sub-routes to ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/disputes', getDisputes);
router.post('/disputes/:itemId/resolve', resolveDispute);
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);
router.get('/categories', getCategories);
router.post('/categories', createCategory);

module.exports = router;
