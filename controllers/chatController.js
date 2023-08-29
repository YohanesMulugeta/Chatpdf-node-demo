const { promisify } = require('util');
// const jwt = require('jsonwebtoken');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');

const Chat = require('../model/chatModel');
const makeChain = require('../util/makeChain');
const { pineconeClient } = require('../util/ReadAndFormatPdf');
const AppError = require('../util/AppError');

// ------------------------ WEBSOCKET Chat
exports.chat = async (ws, req) => {
  try {
    const { chatId } = req.params;
    const { nameSpace, indexName } = await Chat.findById(chatId).select('+chatHistory');
    // OPEN-AI recommendation to replace new lines with space

    await pineconeClient.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const pineconeIndex = pineconeClient.Index(
      indexName || process.env.PINECONE_INDEX_NAME
    );

    // vectore store
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
      pineconeIndex,
      namespace: nameSpace,
    });

    // Get chat history

    // question and answer
    ws.on('message', async (question) => {
      try {
        const chatN = await Chat.findById(chatId).select('+chatHistory');

        const { chatHistory } = chatN;

        // Cut the creation of new question from reaching to the user
        let space = 0;

        const streamHandler = {
          handleLLMNewToken(token) {
            if (space < 2 && chatHistory.length > 0) {
              // console.log(token, '/////////');
              if (token === '') space += 1;
              else space = 0;
              return;
            }

            ws.send(JSON.stringify({ data: token, event: 'data' }));
          },
        };

        const chain = makeChain(vectorStore, streamHandler);

        //Ask a question using chat history
        const sanitizedQuestion = question.replace('/n', ' ').trim();

        // call the chain for new questions
        const response = await chain.call({
          question: sanitizedQuestion,
          chat_history: chatHistory,
        });

        // ---------- Sending the source with source event
        ws.send(JSON.stringify({ source: response.sourceDocuments, event: 'source' }));

        // Updating users chat history
        chatN.chatHistory.push([`Question: ${question}`, `Answer: ${response.text}`]);

        await chatN.save({ validateBeforeSave: false });
      } catch (err) {
        // ------ Handle Errors
        ws.send(
          JSON.stringify({
            event: 'error',
            error: err.message,
            statusCode: err.statusCode ? err.statusCode : 500,
          })
        );
      }
    });
  } catch (err) {
    ws.send(
      JSON.stringify({
        event: 'error',
        error: err.message,
        statusCode: err.statusCode ? err.statusCode : 500,
      })
    );
  }
};
