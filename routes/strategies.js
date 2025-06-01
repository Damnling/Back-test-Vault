const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');

router.post('/', strategyController.createStrategy);
router.get('/', strategyController.getAllStrategies);

module.exports = router;
