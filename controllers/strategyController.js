const StrategyComponent = require('../models/StrategyComponent');

exports.createStrategy = async (requestAnimationFrame, res) => {
    try {
        const strategy = new StrategyComponent(req.body);
        await strategy.save();
        res.jason({ status: 'success', strategy });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });

    }
};

exports.getAllStrategies = async (req, res) => {
    try {
        const strategies = await StrategyComponent.find({});
        res.json(strategies);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });

    }
};

