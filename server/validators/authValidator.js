const { check } = require('express-validator');

const registerValidator = [
  check('name', 'Full name is required and must be between 2 and 80 characters')
    .trim()
    .isLength({ min: 2, max: 80 }),
  check('email', 'Please provide a valid email address')
    .isEmail()
    .normalizeEmail(),
  check('password', 'Password must be at least 6 characters long')
    .isLength({ min: 6 })
];

const loginValidator = [
  check('email', 'Valid email is required').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];

module.exports = {
  registerValidator,
  loginValidator
};
