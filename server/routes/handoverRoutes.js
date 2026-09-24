const express = require('express');
const router = express.Router();
const {
  createHandover,
  getMyHandovers,
  getHandoverById,
  confirmHandover
} = require('../controllers/handoverController');
const { protect } = require('../middleware/auth');
const { handoverValidator } = require('../validators/itemValidator');
const { validateRequest } = require('../middleware/validator');

router.use(protect);

router.route('/')
  .get(getMyHandovers)
  .post(handoverValidator, validateRequest, createHandover);

router.get('/:id', getHandoverById);
router.put('/:id/confirm', confirmHandover);

module.exports = router;
