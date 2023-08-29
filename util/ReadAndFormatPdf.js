const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { DocxLoader } = require('langchain/document_loaders/fs/docx');
const { CSVLoader } = require('langchain/document_loaders/fs/csv');
const { EPubLoader } = require('langchain/document_loaders/fs/epub');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { Document } = require('langchain/document');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const AppError = require('./AppError');
const { v4: uuidv4 } = require('uuid');

const client = new PineconeClient();
exports.pineconeClient = client;

(async () => {
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });

  console.log('success on initializing pincone client');
})();
// const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

exports.loadDoc = async function loadPdf({ file, fileType, check = true, originalName }) {
  let text, loader, opt;

  const fileDir = `${__dirname}/../temp/uploads/${file}`;
  //  split into meaningful chuncks
  switch (fileType) {
    case 'doc':
      loader = new DocxLoader(fileDir);
      break;

    case 'csv':
      loader = new CSVLoader(fileDir);
      break;

    case 'pdf':
      loader = new PDFLoader(fileDir, {
        splitPages: false,
      });
      break;

    case 'epub':
      loader = new EPubLoader(fileDir, {
        splitChapters: false,
      });
      break;

    default:
      text = removeDuplicates(file);
  }

  // console.log('Loading ....');

  const docs = text ? text : await loader.load();

  if (docs.length === 0)
    throw new AppError(
      'Please Provide Readable or Selectable pdf. Please Try Agan!',
      400
    );

  text = text ? text : docs.map((doc) => removeDuplicates(doc.pageContent)).join(' ');

  const tokens = text.length / 3.8;

  const splitted = await spiltText(text, check, originalName);

  // console.log(tokens);

  //  store in the pinecone

  //  return the pinecone name_space for the vectors
  return { splitted, tokens };
  // if (!isFile) return spiltText(file, check);
};

async function spiltText(text, check = true, originalName) {
  if (check)
    if (!text || text?.length < 100)
      throw new AppError('No readable text stream or very small readable data');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: process.env.CHUCK_SIZE,
    chunkOverlap: 200,
  });

  const output = await splitter.createDocuments([text]);

  if (originalName)
    output.forEach((out) => {
      out.pageContent += `Document-title: ${originalName}`;
    });

  // console.log('parsed end///////');

  return output;
}

// --------------- STORE DOCUMENT TO PINECONE
exports.storeToPinecone = async function ({ docs, nameSpace, indexName }) {
  const pineconeIndex = client.Index(indexName || process.env.PINECONE_INDEX_NAME);

  const fileNameOnPine = nameSpace || `${uuidv4()}-${(Date.now() + '').slice(-7)}`;

  const maxVector = 200;

  for (let i = 0; i < docs.length; i += maxVector) {
    await PineconeStore.fromDocuments(
      docs.slice(i, i + maxVector + 1),
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
        namespace: fileNameOnPine,
      }
    );
  }

  console.log('success');

  return fileNameOnPine;
};

function removeDuplicates(text) {
  const formated = text.split('\n').join('').split('\t').join(' ');

  return formated;
}
// --------------- Helpers
