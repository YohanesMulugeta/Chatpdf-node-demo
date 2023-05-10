const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const AppError = require('./AppError');

async function loadPdf(file, isFile, check = true) {
  if (!isFile) return spiltText(file, check);

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

  return spiltText(text, check);
}

async function spiltText(text, check = true) {
  if (check)
    if (!text || text?.length < 300)
      throw new AppError('No readable text stream or very small readable data');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: process.env.CHUCK_SIZE,
    chunkOverlap: 1000,
  });

  const output = await splitter.createDocuments([text]);

  return output;
}

function removeDuplicates(text) {
  const formated = text.split('\n').join('').split('\t').join(' ');

  return formated;
}

// ERRORS EMPITY DOCUMENT THAT IS DOCS = []
module.exports = loadPdf;
