const express = require('express');

const authController = require('../controllers/authController');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

router.use(authController.protect, pdfController.checkTokenLimit);

router.route('/').post(pdfController.uploadPdf, pdfController.processDocument);

module.exports = router;
