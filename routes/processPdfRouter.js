const express = require('express');

const authController = require('../controllers/authController');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

router.use(authController.protect, pdfController.checkTokenLimit);



module.exports = router;
