const { check } = require('express-validator');

const lostItemValidator = [
  check('title', 'Item title is required').trim().notEmpty().isLength({ max: 120 }),
  check('category', 'Item category is required').trim().notEmpty(),
  check('description', 'Detailed description is required').trim().notEmpty(),
  check('color', 'Color is required').trim().notEmpty(),
  check('location', 'Lost location is required').trim().notEmpty(),
  check('lostDate', 'Valid lost date is required').notEmpty()
];

const foundItemValidator = [
  check('title', 'Item title is required').trim().notEmpty().isLength({ max: 120 }),
  check('category', 'Item category is required').trim().notEmpty(),
  check('publicDescription', 'Public description is required').trim().notEmpty(),
  check('publicColor', 'General color is required').trim().notEmpty(),
  check('location', 'Found location is required').trim().notEmpty(),
  check('foundDate', 'Valid found date is required').notEmpty()
];

const claimValidator = [
  check('foundItemId', 'Found item ID is required').isMongoId(),
  check('answers', 'Verification answers are required').isArray({ min: 1 })
];

const handoverValidator = [
  check('claimId', 'Claim ID is required').isMongoId(),
  check('location', 'Handover meetup location is required').trim().notEmpty(),
  check('scheduledDate', 'Scheduled date is required').notEmpty(),
  check('scheduledTime', 'Scheduled time is required').trim().notEmpty()
];

module.exports = {
  lostItemValidator,
  foundItemValidator,
  claimValidator,
  handoverValidator
};
