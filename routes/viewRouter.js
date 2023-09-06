const express = require('express');

const viewController = require('../controllers/viewController');

const router = express.Router();

router.route('/').get(viewController.home);
router.route('/login').get(viewController.login);

module.exports = router;
