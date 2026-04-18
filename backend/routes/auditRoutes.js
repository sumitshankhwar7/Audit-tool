const express = require('express');
const router = express.Router();
const {
  saveDraft,
  getDraft,
  submitForReport
} = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { validateAuditSubmission } = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/draft', saveDraft);
router.get('/draft/:leadId', getDraft);
router.post('/submit', validateAuditSubmission, submitForReport);

module.exports = router;
