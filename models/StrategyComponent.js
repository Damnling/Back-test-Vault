const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    sharpe: Number,
    max_drawdown: Number,
}, {_id: false});

const strategyComponentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    description: String,
    tags: [String],
    code_snippet: String,
    performance: performanceSchema,
    market_conditions: [String],
    summary: String,
    embedding: [Number],
});

module.exports = mongoose.model('StrategyComponent', strategyComponentSchema);

