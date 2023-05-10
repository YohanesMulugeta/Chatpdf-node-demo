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

    // console.log(req.fileName);
    cb(null, name);
  },
});

const upload = multer({ storage: storage, fileFilter: multerFilter });

// --------------------- UPLOAD PDF
exports.uploadPdf = upload.single('document');

// ------------------------ Check Token LImit
exports.checkTokenLimit = function (req, res, next) {
  if (req.user.tokenLimit <= 0)
    return next(new AppError('You dont have enough token to perform this action.', 400));

  next();
};

// ----------------------- PROCESS pdf
exports.processDocument = catchAsync(async function (req, res, next) {
  const file = req.fileName || req.body.text;

  const fileNameOnPine = await loadPdf(file, req.fileName);

  res.status(200).json({ status: 'success', fileName: fileNameOnPine });
});

// --------------------------- Chat
exports.chat = catchAsync(async function (req, res, next) {
  const { question, history, nameSpace } = req.body;

  if (!question || question.trim() === '')
    return next(new AppError('You have to provide question!', 400));

  if (!nameSpace) return next(new AppError('Chat has to have nameSpace.', 400));

  // OPEN-AI recommendation to replace new lines with space
  const sanitizedQuestion = question.replace('/n', ' ').trim();
  const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);

  // vectore store
  const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
    pineconeIndex,
    namespace: nameSpace,
  });

  // const model = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.3 });
  // const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
  //   k: 1,
  //   returnSourceDocuments: true,
  // });
  // const response = await chain.call({ query: sanitizedQuestion });

  const chain = makeChain(vectorStore);
  //Ask a question using chat history
  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: history || [],
  });

  res.status(200).json({ status: 'success', data: { response } });
});

exports.checkReference = catchAsync(async function (req, res, next) {
  const { formated } = req;

  if (formated.length > 1)
    return next(
      new AppError(
        'Wow there, are you trying to check a book. You got to be kidding! Please a little smaller pages',
        400
      )
    );

  // console.log(formated.length);
  const summaryPromptPrefix =
    'The followings are responses made by you about. if the number of responses listed are one just return that one';
  const systemContent =
    '"Assistant is an intelligent chatbot designed to help users to know the cited contents in their document are actually taken from the references listed. Instructions: - generate a report wether the cited contents are from the corresponding reference list or not. - If you are unsure of an answer, you can say "I don\'t know" or "I\'m not sure"';
  const userContentPreFix =
    '"Check every cited content in the document and check if the content is from the corresponding reference in the reference list.';
  // "he cited contents in the document from the corresponding reference in the reference list?"';
  // '"Generate a report on wether the cited contents are from the coresponding reference in the reference list."';

  const extractFrom = {
    formated,
    systemContent,
    userContentPreFix,
    user: req.user,
    res,
    summaryPromptPrefix,
  };

  createComplianceReport(extractFrom);
});

// ////////////////// //
//      HELPERS       //
// ///////////////// //

// ------------------- SUMMARISE RESPONSE
async function createAsummarisedResponse({
  data,
  summaryPromptPrefix,
  usedTokens,
  res,
  user,
}) {
  let prompt = '';

  // join the responses with responseNumber
  data.forEach((content, i) => {
    prompt += `response: ${content}`;
  });

  const responseChunks = await loadPdf(prompt, false, false);

  if (
    responseChunks.length > 1 &&
    responseChunks[responseChunks.length - 1].length <= 500
  ) {
    const lastResChunk = responseChunks.pop();
    const toBeLast = responseChunks.pop() + lastResChunk;
    responseChunks.push(toBeLast);
  }

  if (responseChunks.length === 1) {
    prompt = summaryPromptPrefix + responseChunks[0].pageContent;
  } else if (responseChunks.length > 1) {
    // add the prefix
    // const systemContent =
    //   '"Assistant is an intelligent chatbot designed to help users get the list of references used. return only the list of references used';
    const systemContent =
      '"Assistant is an intelligent chatbot designed to help users create the combined and summerised form of responses.';

    return createComplianceReport({
      formated: responseChunks,
      summaryPromptPrefix,
      res,
      user,
      systemContent,
      usedTokens,
    });
    // then continue
  }

  const userToUpdate = await User.findById(user._id).select('tokenLimit');
  userToUpdate.tokenLimit = userToUpdate.tokenLimit - usedTokens;
  await userToUpdate.save({ validateBeforeSave: false });

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 500,
    temperature: 0.5,
  });

  // const summery = response.data.choices[0].text.split(/however/i)[0];

  res.status(200).json({
    status: 'success',
    data: response.data.choices[0].text,
  });
}

// -------------------------- CREATE COMPLIANCE REPORT
async function createComplianceReport({
  formated,
  userContentPreFix = '',
  userContentPostFix = '',
  systemContent,
  summaryPromptPrefix,
  usedTokens = 0,
  res,
  user,
}) {
  const responses = [];
  let usedTokensNew = usedTokens;

  async function checkCompliance(content, end) {
    const { data } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        {
          role: 'user',
          content: userContentPreFix + content + userContentPostFix,
        },
      ],
      max_tokens: 250,
      temperature: 0,
    });

    // console.log(data);
    responses.push(data.choices[0].message.content);

    usedTokensNew += data.usage.total_tokens;

    if (end) {
      const options = {
        data: responses,
        summaryPromptPrefix,
        res,
        usedTokens: usedTokensNew,
        user,
      };
      createAsummarisedResponse(options);
    }
  }

  const reqRateInterval = formated.length > 3 ? 21000 : 100;

  formated.forEach((text, i) => {
    setTimeout(
      checkCompliance,
      i * reqRateInterval,
      text.pageContent,
      i === formated.length - 1 ? true : false
    );
  });
}
