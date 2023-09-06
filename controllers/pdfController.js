const multer = require('multer');

const Chat = require('../model/chatModel');

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const { pineconeClient, loadDoc, storeToPinecone } = require('../util/ReadAndFormatPdf');
const catchAsync = require('../util/catchAsync');
const multerFilter = require('../util/multerFilter');
const AppError = require('../util/AppError');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${__dirname}/../temp/uploads`;

    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const name = `document-${Date.now()}.${req.type}`;

    req.fileName = name;
    req.originalName = file.originalname || req.originalname;
    // console.log(req.fileName);
    cb(null, name);
  },
});

const upload = multer({ storage: storage, fileFilter: multerFilter });

// --------------------- UPLOAD PDF
exports.uploadPdf = upload.single('document');

// ---------------- parse docs
exports.parseDoc = catchAsync(async function (req, res, next) {
  const file = req.fileName || req.body.text;

  const opt = {
    file: file,
    fileType: req.type,
    originalName: req.originalName || req.body.originalName,
  };

  const { splitted: parsedDoc, tokens } = await loadDoc(opt);

  req.parsedDoc = parsedDoc;
  req.tokens = tokens;

  next();
});

// ----------------------- PROCESS pdf
exports.processDocument = catchAsync(async function (req, res, next) {
  const originalName =
    req.originalName?.trim() || req.body.originalName || `document-${Date.now()}`;

  const { parsedDoc } = req;

  const fileNameOnPine = await storeToPinecone({
    docs: parsedDoc,
  });

  // store the new chat
  const chatInfo = {
    name: originalName,
    nameSpace: fileNameOnPine,
    indexName: process.env.PINECONE_INDEX_NAME,
    docs: [originalName],
  };

  const chat = await Chat.create(chatInfo);

  res.status(200).json({
    status: 'success',
    chat,
  });
});

//-------------- Get and pass Chat
exports.getPassChat = catchAsync(async function (req, res, next) {
  const { chatId } = req.params;

  if (!chatId) return next(new AppError('Chatid is required on the params.', 400));

  const chat = await Chat.findById(chatId).select('+chatHistory');

  if (!chat) return next(new AppError('No chat has found with this id', 404));

  req.chat = chat;

  next();
});

// -------------------- Get chat
exports.getChat = catchAsync(async function (req, res, next) {
  const { chat } = req;

  res.status(200).json({
    status: 'success',
    data: { chat },
  });
});

// ------------ Add a document oto analready exsted document
exports.addPdfIntoChat = catchAsync(async function (req, res, next) {
  const { chat } = req;
  const originalName =
    req.originalName?.trim() || req.body.originalName || `document-${Date.now()}`;

  const { parsedDoc } = req;
  const { nameSpace, indexName } = chat;

  await storeToPinecone({
    docs: parsedDoc,
    nameSpace,
    indexName: indexName || process.env.PINECONE_INDEX_NAME,
  });

  chat.docs.push(originalName);

  await chat.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Document added to your chat successFully',
  });
  // const file = req.
});

// ------------------- delete chat
exports.deleteChat = catchAsync(async function (req, res, next) {
  const { indexName, nameSpace: namespace } = req.chat;

  const pineconeIndex = pineconeClient.Index(
    indexName || process.env.PINECONE_INDEX_NAME
  );

  try {
    await pineconeIndex.delete1({ deleteAll: true, namespace });
  } catch (err) {}

  await Chat.findByIdAndDelete(req.chat._id);

  res.status(203).json({ message: 'success' });
});
