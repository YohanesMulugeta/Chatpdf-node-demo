const express = require('express');

const viewController = require('../controllers/viewController');

const router = express.Router();

router.route('/').get(viewController.home);

module.exports = router;
