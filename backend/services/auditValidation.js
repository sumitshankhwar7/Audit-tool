/**
 * Audit Validation Service
 * Validates the questionnaire data and calculates completion percentage.
 */

const EXPECTED_FIELDS = [
  'companyName', 
  'annualRevenue', 
  'employeeCount', 
  'complianceStatus', 
  'riskScore', 
  'auditDate'
];

const validateQuestionnaire = (data) => {
  if (!data) return { isValid: false, errors: ['No data provided'] };

  const errors = [];
  
  EXPECTED_FIELDS.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

const calculateCompletion = (data) => {
  if (!data) return 0;
  
  // Total fields including optional ones
  const allFields = [...EXPECTED_FIELDS, 'documentUrl', 'comments'];
  
  let filledCount = 0;
  allFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      filledCount++;
    }
  });

  return Math.round((filledCount / allFields.length) * 100);
};

module.exports = {
  validateQuestionnaire,
  calculateCompletion,
};
