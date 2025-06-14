const StrategyComponent = require('../models/StrategyComponent');
const summarizeAndEmbed = require('../llm_embed');

exports.searchStrategies = async (req, res) => {
    try {
        // Parse query parameters for filtering, sorting, and pagination
        const {
            type,
            tags,
            minSharpe,
            maxDrawdown,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
            query
        } = req.query;

        // Build MongoDB filter
        const mongoFilter = {};
        if (type) mongoFilter.type = type;
        if (tags) mongoFilter.tags = { $all: tags.split(',') };
        if (minSharpe) mongoFilter['performance.sharpe'] = { $gte: parseFloat(minSharpe) };
        if (maxDrawdown) mongoFilter['performance.max_drawdown'] = { $lte: parseFloat(maxDrawdown) };
        if (startDate || endDate) {
            mongoFilter.createdAt = {};
            if (startDate) mongoFilter.createdAt.$gte = new Date(startDate);
            if (endDate) mongoFilter.createdAt.$lte = new Date(endDate);
        }

        // Find matching strategies
        let strategies = await StrategyComponent.find(mongoFilter);

        // If using semantic query, rank by embedding similarity
        if (query) {
            const { embedding } = await summarizeAndEmbed(query);

            function cosineSimilarity(vecA, vecB) {
                const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
                const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
                const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
                return dot / (normA * normB);
            }

            strategies = strategies
                .filter(s => s.embedding && s.embedding.length === embedding.length)
                .map(s => ({
                    strategy: s,
                    score: cosineSimilarity(embedding, s.embedding)
                }))
                .sort((a, b) => b.score - a.score)
                .map(({ strategy, score }) => ({
                    ...strategy.toObject(),
                    similarity: score
                }));
        } else {
            strategies = strategies.map(s => s.toObject());
        }

        // Sorting
        if (sortBy) {
            const order = sortOrder === 'asc' ? 1 : -1;
            strategies = strategies.sort((a, b) => {
                if (sortBy === 'sharpe') {
                    return order * ((b.performance?.sharpe || 0) - (a.performance?.sharpe || 0));
                }
                if (sortBy === 'max_drawdown') {
                    return order * ((a.performance?.max_drawdown || 0) - (b.performance?.max_drawdown || 0)); // lower is better
                }
                // Default: createdAt/date
                return order * (new Date(b.createdAt) - new Date(a.createdAt));
            });
        }

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const startIdx = (pageNum - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const pagedResults = strategies.slice(startIdx, endIdx);

        res.json({
            results: pagedResults,
            total: strategies.length,
            page: pageNum,
            pageSize
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

