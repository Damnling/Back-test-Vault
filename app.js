const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo_connect');
require('dotenv').config();

// Import routers
const strategiesRouter = require('./routes/strategies');
const searchStrategiesRouter = require('./routes/searchStrategies');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount routers
app.use('/api/strategies', strategiesRouter);
app.use('/api/search-strategies', searchStrategiesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
