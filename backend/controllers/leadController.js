const Lead = require('../models/Lead');
const { logAction } = require('../services/auditEngine');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const businessName = req.body.businessName?.trim();
    const contactName = req.body.contactName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const phone = req.body.phone?.trim();
    const source = req.body.source?.trim() || 'Manual';

    console.log('Backend: Creating lead with data:', req.body);
    console.log('Backend: User ID from token:', req.user?._id);

    // Check for existing lead by email or phone
    const existingLead = await Lead.findOne({ $or: [{ email }, { phone }] });
    if (existingLead) {
      console.log('Backend: Lead already exists:', existingLead.email);
      return res.status(400).json({ message: 'Lead with this email or phone already exists' });
    }

    const lead = await Lead.create({
      businessName,
      contactName,
      email,
      phone,
      source,
      assignedTo: req.user._id,
    });

    console.log('Backend: Lead created successfully:', lead._id);
    logAction('LEAD_CREATED', req.user._id, lead._id, { source });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Backend: Error creating lead:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate email or phone detected in database' });
    }
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({ message: firstError?.message || 'Invalid lead data' });
    }
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });
    console.log(`Backend: Found ${leads.length} leads for user ${req.user._id}`);
    res.json(leads);
  } catch (error) {
    console.error('Backend: Error fetching leads:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead
const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add note to a lead
// @route   POST /api/leads/:id/notes
// @access  Private (sales, admin)
const addNote = async (req, res) => {
  try {
    const { content, dueDate } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const note = {
      content,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    };

    lead.notes.push(note);
    await lead.save();

    res.status(201).json(lead);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
};
