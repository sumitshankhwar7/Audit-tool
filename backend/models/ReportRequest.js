const mongoose = require('mongoose');

const reportRequestSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditSubmission',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  reportUrl: {
    type: String,
  },
  generatedAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReportRequest', reportRequestSchema);
