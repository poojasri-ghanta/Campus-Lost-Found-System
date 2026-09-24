const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getClaimById,
  getClaimsForItem,
  reviewClaim,
  submitMoreInfo,
  withdrawClaim
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const { claimValidator } = require('../validators/itemValidator');
const { validateRequest } = require('../middleware/validator');

router.use(protect);

router.post('/', claimValidator, validateRequest, createClaim);
router.get('/my', getMyClaims);
router.get('/item/:foundItemId', getClaimsForItem);
router.get('/:id', getClaimById);
router.put('/:id/review', reviewClaim);
router.post('/:id/more-info', submitMoreInfo);
router.put('/:id/cancel', withdrawClaim);

module.exports = router;
