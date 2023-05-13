const multer = require('multer');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { VectorDBQAChain } = require('langchain/chains');
const { Configuration, OpenAIApi } = require('openai');
const { OpenAI } = require('langchain/llms/openai');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const User = require('../model/userModel');

const { pineconeClient, loadPdf } = require('../util/ReadAndFormatPdf');
const makeChain = require('../util/makeChain');
const catchAsync = require('../util/catchAsync');
const multerFilter = require('../util/multerFilter');
const AppError = require('../util/AppError');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${__dirname}/../temp/uploads`;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const name = `document-${Date.now()}.pdf`;
    req.fileName = name;
    req.originalName = file.originalname || req.originalname;
    // console.log(req.fileName);
    cb(null, name);
  },
});

const upload = multer({ storage: storage, fileFilter: multerFilter });

// --------------------- UPLOAD PDF
exports.uploadPdf = upload.single('document');

// ----------------------- Store to Pine Cone
exports.toPinecone = catchAsync(async function (req, res, next) {});

// ----------------------- PROCESS pdf
exports.processDocument = catchAsync(async function (req, res, next) {
  const file = req.fileName || req.body.text;
  const originalName =
    req.originalName?.trim() || req.body.originalName || `document-${Date.now()}`;

  const fileNameOnPine = await loadPdf(file, req.fileName);

  res.status(200).json({
    status: 'success',
    docName: fileNameOnPine,
    chatTitle: originalName,
  });
});

// --------------------------- Chat
exports.chat = catchAsync(async function (req, res, next) {
  // const { chatId } = req.params;
  const { question, history, docName: nameSpace } = req.body;

  if (!question || question.trim() === '')
    return next(new AppError('You have to provide question!', 400));

  // OPEN-AI recommendation to replace new lines with space
  const sanitizedQuestion = question.replace('/n', ' ').trim();
  const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);

  // vectore store
  const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
    pineconeIndex,
    namespace: nameSpace,
  });

  // Get chat history
  const chatHistory = history.slice(-5);

  const chain = makeChain(vectorStore);

  //Ask a question using chat history
  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: chatHistory,
  });

  res.status(200).json({ status: 'success', data: { response } });
});

// ------------------- delete chat
exports.deleteChat = catchAsync(async function (req, res, next) {
  const { vectorName } = req.params;

  const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);

  await pineconeIndex.delete1({ deleteAll: true, namespace: vectorName });

  res.status(203).json({ message: 'success' });
});

// // --------------------- Translate
// exports.translateDocument = catchAsync(async function (req, res, next) {
//   if (!req.body.language) return next();
// });
