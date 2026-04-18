const AuditSubmission = require('../models/AuditSubmission');
const Lead = require('../models/Lead');
const ReportRequest = require('../models/ReportRequest');
const { calculateCompletion } = require('../services/auditValidation');
const { queueReportGeneration } = require('../services/reportQueue');
const { logAction } = require('../services/auditEngine');

// @desc    Save an audit draft (handles partial updates)
// @route   POST /api/audit/draft
// @access  Private
const saveDraft = async (req, res) => {
  try {
    const { leadId, questionnaireData } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }

    // Upsert draft
    let draft = await AuditSubmission.findOne({ leadId, status: 'draft' });

    if (draft) {
      // Partial update
      draft.questionnaireData = { ...draft.questionnaireData, ...questionnaireData };
      draft.lastSavedAt = Date.now();
      await draft.save();
    } else {
      // Create new draft
      draft = await AuditSubmission.create({
        leadId,
        telecallerId: req.user._id,
        questionnaireData: questionnaireData || {},
        status: 'draft',
      });
      
      // Update Lead status to draft
      await Lead.findByIdAndUpdate(leadId, { status: 'draft' });
    }

    const completionPercent = calculateCompletion(draft.questionnaireData);
    
    // Log partial save occasionally or just trust lastSavedAt
    // logAction('DRAFT_SAVED', req.user._id, leadId, { completionPercent });

    res.json({ message: 'Draft saved successfully', draft, completionPercent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit draft for a lead
// @route   GET /api/audit/draft/:leadId
// @access  Private
const getDraft = async (req, res) => {
  try {
    const draft = await AuditSubmission.findOne({ 
      leadId: req.params.leadId,
      status: 'draft' 
    });

    if (!draft) {
      return res.status(404).json({ message: 'No draft found' });
    }

    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit audit and trigger report generation
// @route   POST /api/audit/submit
// @access  Private
const submitForReport = async (req, res) => {
  try {
    const { leadId, questionnaireData } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }

    // Find existing draft or create one
    let submission = await AuditSubmission.findOne({ leadId, status: 'draft' });

    if (submission) {
      submission.questionnaireData = { ...submission.questionnaireData, ...questionnaireData };
      submission.status = 'submitted';
      submission.submittedAt = Date.now();
      await submission.save();
    } else {
      submission = await AuditSubmission.create({
        leadId,
        telecallerId: req.user._id,
        questionnaireData: questionnaireData || {},
        status: 'submitted',
        submittedAt: Date.now()
      });
    }

    // Update Lead status
    await Lead.findByIdAndUpdate(leadId, { status: 'submitted' });

    // Create Report Request
    const reportRequest = await ReportRequest.create({
      leadId,
      submissionId: submission._id,
      requestedBy: req.user._id,
      status: 'pending'
    });

    // Trigger async queue
    queueReportGeneration(reportRequest._id);

    logAction('AUDIT_SUBMITTED', req.user._id, leadId, { submissionId: submission._id });

    res.status(200).json({ 
      message: 'Audit submitted successfully. Report is being generated.',
      reportRequestId: reportRequest._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveDraft,
  getDraft,
  submitForReport,
};
