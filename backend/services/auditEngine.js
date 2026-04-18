/**
 * Audit Engine Logger
 * Used to log important actions in the system for auditing purposes.
 */

const logAction = (action, userId, leadId, details = {}) => {
  // In a full production app, this would write to an AuditLogs collection
  // For now, we log to console as requested.
  console.log(`[AUDIT] Action: ${action} | User: ${userId} | Lead: ${leadId} | Details:`, JSON.stringify(details));
};

module.exports = {
  logAction,
};
