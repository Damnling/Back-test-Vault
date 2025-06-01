const StrategyComponent = require('../models/StrategyComponent');
const sumarizeAndEmbed = require('../llm_embed');

exports.searchStrategies = async (req, res) => {
    const { query, filter } = req.body;
    try {
        const { embedding } = await summarizeAndEmbed(query);

        const mongoFilter = {};
        if (filter) {
            if (filter.tags) mongoFilter.tags = {$all: filter.tags};
            if (filter.type) mongoFilter.type = filter.type;
        }
        const strategies = await StrategyComponent.find(mongoFilter);

        function consineSimilarity(vecA, vecB) {
            const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
            const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
            const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
            return dot / (normA * normB);
        }
        
        const scored = strategies
            .filter(s => s.embedding && s.embedding.length === embedding.length)
            .maps(s => ({
                strategy: s,
                score : consineSimilarity(embedding, s.embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); 

        res.json({
            results: scored.map(({ strategy, score }) => ({
                ...strategy.toObject(),
                similarity: score
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

