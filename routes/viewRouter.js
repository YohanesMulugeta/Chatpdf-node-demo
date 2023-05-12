const express = require('express');

const viewController = require('../controllers/viewController');

const router = express.Router();

// router.get('/resetpassword/:token', viewController.resetPassword);

router.route('/').get(viewController.chatpdf);

// router.route('/').get(viewController.home);

module.exports = router;
