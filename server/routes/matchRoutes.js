const express = require('express');
const router = express.Router();
const {
  getMyMatches,
  getMatchById,
  generateMatches,
  dismissMatch
} = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyMatches);
router.post('/generate', generateMatches);
router.get('/:id', getMatchById);
router.put('/:id/dismiss', dismissMatch);

module.exports = router;
