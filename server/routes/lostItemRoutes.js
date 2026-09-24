const express = require('express');
const router = express.Router();
const {
  createLostItem,
  getLostItems,
  getLostItemById,
  getMyLostItems,
  updateLostItem,
  deleteLostItem
} = require('../controllers/lostItemController');
const { protect, optionalProtect } = require('../middleware/auth');
const { lostItemValidator } = require('../validators/itemValidator');
const { validateRequest } = require('../middleware/validator');

router.route('/')
  .get(optionalProtect, getLostItems)
  .post(protect, lostItemValidator, validateRequest, createLostItem);

router.get('/my', protect, getMyLostItems);

router.route('/:id')
  .get(optionalProtect, getLostItemById)
  .put(protect, updateLostItem)
  .delete(protect, deleteLostItem);

module.exports = router;
