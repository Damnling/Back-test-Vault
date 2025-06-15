const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    sharpe: Number,
    max_drawdown: Number,
}, { _id: false });

const strategyComponentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['entry', 'exit', 'filter', 'risk', 'other'] // only these values allowed
    },
    description: String,
    tags: [String],
    code_snippet: { type: String, required: true }, // now required
    performance: performanceSchema,
    market_conditions: [String],
    summary: String,
    embedding: [Number],
}, { timestamps: true });

module.exports = mongoose.model('StrategyComponent', strategyComponentSchema);

