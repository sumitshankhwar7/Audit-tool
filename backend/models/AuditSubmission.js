const mongoose = require('mongoose');

const auditSubmissionSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  telecallerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionnaireData: {
    companyName: String,
    annualRevenue: Number,
    employeeCount: Number,
    complianceStatus: String,
    riskScore: Number,
    documentUrl: String,
    auditDate: Date,
    comments: String,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft',
  },
  completedSections: [{
    type: String,
  }],
  lastSavedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  }
}, {
  timestamps: true
});

// Index for quick lookup by lead
auditSubmissionSchema.index({ leadId: 1 });

module.exports = mongoose.model('AuditSubmission', auditSubmissionSchema);
