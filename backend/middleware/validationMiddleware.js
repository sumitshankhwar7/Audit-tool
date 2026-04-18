const { validateQuestionnaire } = require('../services/auditValidation');

const validateLeadCreation = (req, res, next) => {
  const businessName = req.body.businessName?.trim();
  const contactName = req.body.contactName?.trim();
  const email = req.body.email?.trim();
  const phone = req.body.phone?.trim();

  if (!businessName || !contactName || !email || !phone) {
    return res.status(400).json({ message: 'Please provide all required lead fields' });
  }

  // Modern email validation regex (supports longer TLDs)
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;
  if (!emailRegex.test(email.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  next();
};

const validateAuditSubmission = (req, res, next) => {
  const { questionnaireData } = req.body;

  const validation = validateQuestionnaire(questionnaireData);
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  next();
};

module.exports = {
  validateLeadCreation,
  validateAuditSubmission,
};
