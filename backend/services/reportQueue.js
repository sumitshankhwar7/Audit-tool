const ReportRequest = require('../models/ReportRequest');
const AuditSubmission = require('../models/AuditSubmission');
const Lead = require('../models/Lead');
const { generateReportPDF } = require('./pdfGenerator');
const { logAction } = require('./auditEngine');

/**
 * Report Queue Service (In-Memory)
 * Simulates a background worker processing report requests.
 */
const processReportQueue = async (reportRequestId) => {
  try {
    // Fetch the request
    const request = await ReportRequest.findById(reportRequestId);
    if (!request) return;

    // Update status to processing
    request.status = 'processing';
    await request.save();

    // Fetch related data
    const submission = await AuditSubmission.findById(request.submissionId);
    const lead = await Lead.findById(request.leadId);

    if (!submission || !lead) {
      throw new Error('Associated Submission or Lead not found');
    }

    // Simulate some async processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate the PDF
    const pdfUrl = await generateReportPDF(submission, lead, request._id);

    // Update request with success
    request.status = 'completed';
    request.reportUrl = pdfUrl;
    request.generatedAt = new Date();
    await request.save();

    logAction('REPORT_GENERATED', request.requestedBy, request.leadId, { reportRequestId });

  } catch (error) {
    console.error('Report Generation Error:', error);
    
    // Update request with failure
    try {
      const request = await ReportRequest.findById(reportRequestId);
      if (request) {
        request.status = 'failed';
        request.errorMessage = error.message;
        await request.save();
      }
    } catch (dbError) {
      console.error('Failed to update report status to failed:', dbError);
    }
  }
};

const queueReportGeneration = async (reportRequestId) => {
  // Fire and forget (in a real app, send to BullMQ/RabbitMQ)
  processReportQueue(reportRequestId);
};

module.exports = {
  queueReportGeneration,
};
