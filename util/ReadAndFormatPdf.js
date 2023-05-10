const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { Document } = require('langchain/document');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const AppError = require('./AppError');

const client = new PineconeClient();

(async () => {
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });

  console.log('success on initializing pincone client');
})();

// const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

async function loadPdf(file, isFile, check = true) {
  // TODO: split into meaningful chuncks
  const loader = new PDFLoader(`${__dirname}/../temp/uploads/${file}`, {
    splitPages: false,
  });

  // console.log('Loading ....');
  const docs = await loader.load();
  if (docs.length === 0)
    throw new AppError(
      'Please Provide Readable or Selectable pdf. Please Try Agan!',
      400
    );

  const text = removeDuplicates(docs[0].pageContent);

  const splitted = await spiltText(text, check);

  // TODO: store in the pinecone
  const fileNameOnPine = await storeToPinecone(splitted);

  // TODO: return the pinecone name_space for the vectors
  return fileNameOnPine;
  // if (!isFile) return spiltText(file, check);
}

async function spiltText(text, check = true) {
  if (check)
    if (!text || text?.length < 300)
      throw new AppError('No readable text stream or very small readable data');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: process.env.CHUCK_SIZE,
    chunkOverlap: 200,
  });

  const output = await splitter.createDocuments([text]);

  return output;
}

async function storeToPinecone(doc) {
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX_NAME);

  const fileNameOnPine = `pine-${Date.now()}`;

  await PineconeStore.fromDocuments(doc, new OpenAIEmbeddings(), {
    pineconeIndex,
    namespace: fileNameOnPine,
  });

  console.log(fileNameOnPine);
  return fileNameOnPine;
}

function removeDuplicates(text) {
  const formated = text.split('\n').join('').split('\t').join(' ');

  return formated;
}

// ERRORS EMPITY DOCUMENT THAT IS DOCS = []
module.exports = loadPdf;
