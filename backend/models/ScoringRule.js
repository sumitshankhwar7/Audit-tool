const mongoose = require('mongoose');

const scoringRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: ['business', 'seo', 'social', 'compliance']
    },
    description: String,
    points: {
        type: Number,
        required: true,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    weight: {
        type: Number,
        default: 1,
        min: 0,
        max: 10
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScoringRule', scoringRuleSchema);