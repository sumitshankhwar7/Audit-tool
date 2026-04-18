const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Generator Service
 * Generates a PDF report from the submitted questionnaire data.
 */
const generateReportPDF = (submissionData, leadData, requestId) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Ensure the uploads/reports directory exists
      const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `report_${requestId}.pdf`;
      const filePath = path.join(reportsDir, fileName);
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Audit Report', { align: 'center' });
      doc.moveDown();

      // Lead Info
      doc.fontSize(14).text(`Business Name: ${leadData.businessName || 'N/A'}`);
      doc.fontSize(12).text(`Contact Name: ${leadData.contactName || 'N/A'}`);
      doc.text(`Email: ${leadData.email || 'N/A'}`);
      doc.text(`Phone: ${leadData.phone || 'N/A'}`);
      doc.moveDown();

      // Questionnaire Data
      doc.fontSize(14).text('Questionnaire Details', { underline: true });
      doc.moveDown(0.5);

      const qData = submissionData.questionnaireData || {};
      
      doc.fontSize(12).text(`Company Name: ${qData.companyName || 'N/A'}`);
      doc.text(`Annual Revenue: $${qData.annualRevenue || 'N/A'}`);
      doc.text(`Employee Count: ${qData.employeeCount || 'N/A'}`);
      doc.text(`Compliance Status: ${qData.complianceStatus || 'N/A'}`);
      doc.text(`Risk Score: ${qData.riskScore || 'N/A'}`);
      if (qData.auditDate) {
        doc.text(`Audit Date: ${new Date(qData.auditDate).toLocaleDateString()}`);
      }
      doc.moveDown();

      doc.fontSize(12).text('Comments:');
      doc.fontSize(10).text(qData.comments || 'No comments provided.');

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text(`Report generated on: ${new Date().toLocaleString()}`, { align: 'center', color: 'grey' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/reports/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateReportPDF,
};
