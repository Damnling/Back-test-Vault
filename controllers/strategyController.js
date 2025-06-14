const StrategyComponent = require('../models/strategycomponent');

// Create a new strategy
exports.createStrategy = async (req, res) => {
  try {
    const strategyData = req.body;
    // Optionally: generate unique id here if needed
    const newStrategy = new StrategyComponent(strategyData);
    await newStrategy.save();
    res.status(201).json(newStrategy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all strategies
exports.getAllStrategies = async (req, res) => {
  try {
    const strategies = await StrategyComponent.find();
    res.json(strategies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

