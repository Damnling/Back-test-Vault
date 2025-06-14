const express = require
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/search', searchController.searchStrategies);

router.get('/similar/:id', searchController.similarStrategies);

module.exports = router;

