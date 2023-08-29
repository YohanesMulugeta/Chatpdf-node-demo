import showError from './reusables/showError.js';
import { showProgress, removeProgress } from './reusables/showProgressBtn.js';
import { showAlert } from './reusables/alert.js';
import makeRequest from './reusables/fetch.js';
import Chat from './chat/chatN.js';
import { handleLeftColHide, renderBtn } from './chat/chatBtns.js';

const loader = document.querySelector('.loader-upload')?.querySelector('.loader');
const input = document.querySelector('input[type="file"]');

export function setChatTitle(title) {
  // document.querySelector('.chat-title')?.textContent = title;
}

export default async function fetchAndDisplay(fileContainer, isFile = false) {
  input.setAttribute('disabled', true);
  const file = isFile ? fileContainer : fileContainer.dataTransfer.items[0].getAsFile();
  uploadPdf({ file });
}

// /////////////////// //
//      HELPERS        //
// ////////////////// //

// --------------- from pdf
async function extractTextFromPdf(file) {
  const typedArray = new Uint8Array(await file.arrayBuffer());
  const pdfDocument = await pdfjsLib.getDocument({ data: typedArray }).promise;

  const textContent = [];

  // if (pdfDocument.numPages > 50) throw new Error('Please dont use large pdfs. Thank you');

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const pageContent = await page.getTextContent();
    pageContent.items.push({ str: ` Page-num: ${i + 1} ` });
    textContent.push(pageContent);
  }

  const text = textContent.map((content) => {
    return content.items.map((item) => item.str).join('');
  });
  return text.join('');
}

// ------------ form txt
async function extractTextFromTxt(file) {
  const text = await file.text();
  // console.log(text);
  return text;
}

/////////////////l//////////////////////
export async function uploadPdf({ file, endPoint, inputField }) {
  const fileReader = new FileReader();

  fileReader.onload = async function () {
    try {
      inputField && inputField.setAttribute('disabled', true);
      // progress indicators
      loader.style.display = 'block';
      const { type } = file;
      let text;
      let document;

      switch (type) {
        case 'text/csv':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
        case 'application/epub+zip':
          document = handleOtherfiles(file);
          break;

        case 'application/pdf':
          text = await extractTextFromPdf(file);
          break;

        case 'text/plain':
          text = await extractTextFromTxt(file);
          break;

        default:
          throw new Error(`This file format ${type} is not supported.`);
      }

      // if (type !== 'application/pdf' && type !== 'text/plain')
      //   throw new Error();

      // return console.log(file.type);
      //   console.log(file);
      //   dataTobeSent.text = text;
      const dataTobeSent = document
        ? document
        : {
            text,
            originalName: file.name,
          };

      const { chat: data } = await makeRequest({
        dataTobeSent,
        method: 'post',
        url: endPoint || `/api/v1/pdf/processpdf`,
      });

      console.log(data);

      // RETURNED DATA WILL CONTAIN
      // chatInfo={
      // name: originalName,
      // nameSpace: fileNameOnPine,
      // indexName: process.env.PINECONE_INDEX_NAME,
      // docs: [originalName],
      // }

      // {chatId, chatTitle,docName} = data

      //   Creating new chat instance and removing the already existed one
      if (!endPoint) {
        const chat = new Chat(data);
        renderBtn(chat.state);
      }
      loader.style.display = 'none';

      // Progress Indicators
      showAlert('success', 'Successful on uploading your document!');
      // handleSidebarExpandHide();
      handleLeftColHide();
      (inputField && inputField.removeAttribute('disabled')) ||
        input.removeAttribute('disabled');

      setTimeout(() => {
        // samplePdf.innerHTML = 'Yohanes Mulugeta';
        endPoint || setChatTitle(data.chatTitle);
      }, 1000);
    } catch (err) {
      (inputField && inputField.removeAttribute('disabled')) ||
        input.removeAttribute('disabled');

      const message = err.response?.data?.message || err.message;
      showAlert('danger', message);

      loader.style.display = 'none';
    }
  };
  fileReader.readAsArrayBuffer(file);
}

function handleOtherfiles(file) {
  const form = new FormData();
  form.append('document', file);

  return form;
}
