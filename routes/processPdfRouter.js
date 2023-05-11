const express = require('express');

const authController = require('../controllers/authController');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

router.use(authController.protect, pdfController.checkTokenLimit);

router.route('/processpdf').post(pdfController.uploadPdf, pdfController.processDocument);

router.route('/chat/:chatId').post(pdfController.chat);

router.route('/:chatId').delete(pdfController.deleteChat);

module.exports = router;
