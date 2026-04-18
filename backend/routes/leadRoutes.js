const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { validateLeadCreation } = require('../middleware/validationMiddleware');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(validateLeadCreation, createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

// Add note to a lead
router.route('/:id/notes')
  .post(addNote);

module.exports = router;
