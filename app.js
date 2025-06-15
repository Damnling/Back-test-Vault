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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });



// Health check route
app.get('/api/health', (req, res) => res.send('OK'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
