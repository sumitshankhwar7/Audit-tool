const ReportRequest = require('../models/ReportRequest');
const path = require('path');
const fs = require('fs');

// @desc    Get all reports (admin)
// @route   GET /api/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await ReportRequest.find({})
      .populate('leadId', 'businessName')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get report generation status
// @route   GET /api/reports/status/:requestId
// @access  Private
const getReportStatus = async (req, res) => {
  try {
    const request = await ReportRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Report request not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this report status' });
    }

    res.json({
      status: request.status,
      reportUrl: request.reportUrl,
      generatedAt: request.generatedAt,
      errorMessage: request.errorMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download generated report
// @route   GET /api/reports/download/:requestId
// @access  Private
const downloadReport = async (req, res) => {
  try {
    const request = await ReportRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Report request not found' });
    }

    if (request.status !== 'completed' || !request.reportUrl) {
      return res.status(400).json({ message: 'Report is not ready yet' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to download this report' });
    }

    const filePath = path.join(__dirname, '..', request.reportUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Report file not found on server' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllReports,
  getReportStatus,
  downloadReport,
};
