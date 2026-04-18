const express = require('express');
const router = express.Router();
const {
  getAllReports,
  getReportStatus,
  downloadReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllReports);
router.get('/all', getAllReports);
router.get('/status/:requestId', getReportStatus);
router.get('/download/:requestId', downloadReport);

module.exports = router;
