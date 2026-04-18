const express = require('express');
const router = express.Router();
const {
    getScoringRules,
    createScoringRule,
    updateScoringRule,
    deleteScoringRule,
    bulkUpdateScoringRules
} = require('../controllers/scoringController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getScoringRules)
    .post(createScoringRule);

router.route('/bulk')
    .put(bulkUpdateScoringRules);

router.route('/:id')
    .put(updateScoringRule)
    .delete(deleteScoringRule);

module.exports = router;