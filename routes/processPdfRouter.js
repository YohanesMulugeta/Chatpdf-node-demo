const express = require('express');

const pdfController = require('../controllers/pdfController');

const router = express.Router();

router.route('/processpdf').post(pdfController.uploadPdf, pdfController.processDocument);

router.route('/chat').post(pdfController.chat);

router.route('/:vectorName').delete(pdfController.deleteChat);

module.exports = router;
