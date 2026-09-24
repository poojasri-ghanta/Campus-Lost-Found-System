const express = require('express');
const router = express.Router();
const {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getMyFoundItems,
  updateFoundItem,
  deleteFoundItem
} = require('../controllers/foundItemController');
const { protect, optionalProtect } = require('../middleware/auth');
const { foundItemValidator } = require('../validators/itemValidator');
const { validateRequest } = require('../middleware/validator');

router.route('/')
  .get(optionalProtect, getFoundItems)
  .post(protect, foundItemValidator, validateRequest, createFoundItem);

router.get('/my', protect, getMyFoundItems);

router.route('/:id')
  .get(optionalProtect, getFoundItemById)
  .put(protect, updateFoundItem)
  .delete(protect, deleteFoundItem);

module.exports = router;
