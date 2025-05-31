const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo_connect');
const StrategyComponent = require('./models/StrategyComponent');
const summarizeAndEmbed = require('./llm_embed'); // Import the embedding function
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// Upload a new strategy (already present)
app.post('/api/strategies', async (req, res) => {
    try {
        const strategy = new StrategyComponent(req.body);
        await strategy.save();
        res.json({ status: 'success', strategy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all strategies (already present)
app.get('/api/strategies', async (req, res) => {
    try {
        const strategies = await StrategyComponent.find({});
        res.json(strategies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------- NEW: Semantic + Filtered Search -----------
app.post('/api/search-strategies', async (req, res) => {
    const { query, filters } = req.body; // query: string, filters: object
    try {
        // 1. Get semantic embedding for the query
        const { embedding } = await summarizeAndEmbed(query);

        // 2. Build MongoDB filter
        const mongoFilter = {};
        if (filters) {
            if (filters.tags) mongoFilter.tags = { $all: filters.tags };
            if (filters.type) mongoFilter.type = filters.type;
            // Add more filters as needed (e.g., performance, market_conditions)
            // Example:
            // if (filters.sharpeMin) mongoFilter['performance.sharpe'] = { $gte: filters.sharpeMin };
            // if (filters.maxDrawdown) mongoFilter['performance.max_drawdown'] = { $lte: filters.maxDrawdown };
        }

        // 3. Find filtered strategies
        const strategies = await StrategyComponent.find(mongoFilter);

        // 4. Compute cosine similarity for each strategy
        function cosineSimilarity(vecA, vecB) {
            const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
            const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
            const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
            return dot / (normA * normB);
        }

        const scored = strategies
            .filter(s => s.embedding && s.embedding.length === embedding.length)
            .map(s => ({
                strategy: s,
                score: cosineSimilarity(embedding, s.embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10 results

        res.json({
            results: scored.map(({ strategy, score }) => ({
                ...strategy.toObject(),
                similarity: score
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));

