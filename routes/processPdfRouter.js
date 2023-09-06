const express = require('express');

const pdfController = require('../controllers/pdfController');
// const chatController = require('../controllers/chatController');

const router = express.Router();

router
  .route('/processpdf')
  .post(pdfController.uploadPdf, pdfController.parseDoc, pdfController.processDocument);

router
  .route('/adddocument/:chatId')
  .post(
    pdfController.getPassChat,
    pdfController.uploadPdf,
    pdfController.parseDoc,
    pdfController.addPdfIntoChat
  );

router
  .route('/chat/:chatId')
  .get(pdfController.getPassChat, pdfController.getChat)
  // .post(pdfController.checkTokenLimit, chatController.chat)
  .delete(pdfController.getPassChat, pdfController.deleteChat);

module.exports = router;
