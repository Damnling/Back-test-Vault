const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo_connect');
const StrategyComponent = require('./models/StrategyComponent');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.post('/api/strategies', async (req, res) => {
    try {
        const strategy = new StrategyComponent(req.body);
        await strategy.save();
        res.json({ status: 'success', strategy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/strategies', async (req, res) => {
    try {
        const strategies = await StrategyComponent.find({});
        res.json(strategies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

