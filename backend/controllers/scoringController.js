const ScoringRule = require('../models/ScoringRule');

// @desc    Get all scoring rules
// @route   GET /api/scoring
// @access  Private/Admin
const getScoringRules = async (req, res) => {
    try {
        const rules = await ScoringRule.find({}).sort({ category: 1, name: 1 });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create scoring rule
// @route   POST /api/scoring
// @access  Private/Admin
const createScoringRule = async (req, res) => {
    try {
        const { name, category, description, points, weight } = req.body;

        const rule = await ScoringRule.create({
            name,
            category,
            description,
            points,
            weight
        });

        res.status(201).json(rule);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Rule with this name already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update scoring rule
// @route   PUT /api/scoring/:id
// @access  Private/Admin
const updateScoringRule = async (req, res) => {
    try {
        const { name, category, description, points, weight, isActive } = req.body;

        const rule = await ScoringRule.findById(req.params.id);

        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        rule.name = name || rule.name;
        rule.category = category || rule.category;
        rule.description = description || rule.description;
        rule.points = points !== undefined ? points : rule.points;
        rule.weight = weight !== undefined ? weight : rule.weight;
        rule.isActive = isActive !== undefined ? isActive : rule.isActive;

        const updatedRule = await rule.save();
        res.json(updatedRule);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Rule with this name already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete scoring rule
// @route   DELETE /api/scoring/:id
// @access  Private/Admin
const deleteScoringRule = async (req, res) => {
    try {
        const rule = await ScoringRule.findById(req.params.id);

        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        await ScoringRule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk update scoring rules
// @route   PUT /api/scoring/bulk
// @access  Private/Admin
const bulkUpdateScoringRules = async (req, res) => {
    try {
        const { rules } = req.body;

        if (!Array.isArray(rules)) {
            return res.status(400).json({ message: 'Rules must be an array' });
        }

        const results = await Promise.all(
            rules.map(async (rule) => {
                if (rule._id) {
                    return await ScoringRule.findByIdAndUpdate(rule._id, rule, { new: true });
                } else {
                    return await ScoringRule.create(rule);
                }
            })
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getScoringRules,
    createScoringRule,
    updateScoringRule,
    deleteScoringRule,
    bulkUpdateScoringRules
};