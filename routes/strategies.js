const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');

// Route to create a new strategy component
router.post('/', strategyController.createStrategy);

// Route to get all strategy components
router.get('/', strategyController.getAllStrategies);

module.exports = router;

