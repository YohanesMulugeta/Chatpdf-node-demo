import showError from './resusables/showError.js';
import { showProgress, removeProgress } from './resusables/showProgressBtn.js';
import { showAlert } from './resusables/alert.js';
import makeRequest from './resusables/fetch.js';
import Chat from './chat/chat.js';
import { setCurrentChat } from './scriptDemo.js';

const loader = document.querySelector('.loader-upload')?.querySelector('.loader');
const input = document.querySelector('input[type="file"]');

export function setChatTitle(title) {
  document.querySelector('.chat-title').textContent = title;
}

export default async function fetchAndDisplay(fileContainer, isFile = false) {
  input.setAttribute('disabled', true);
  const file = isFile ? fileContainer : fileContainer.dataTransfer.items[0].getAsFile();
  const fileReader = new FileReader();

  fileReader.onload = async function () {
    try {
      // progress indicators
      loader.style.display = 'block';
      const text =
        file.type === 'application/pdf'
          ? await extractTextFromPdf(file)
          : await extractTextFromTxt(file);

      //   console.log(file);
      //   dataTobeSent.text = text;
      const dataTobeSent = {
        text,
        originalName: file.name,
      };

      const data = await makeRequest({
        dataTobeSent,
        method: 'post',
        url: `/api/v1/pdf/processpdf`,
      });

      // const data = { chatId: 'pupu', chatTitle: 'pupu' };

      //   Creating new chat instance and removing the already existed one
      const chat = new Chat(data.chatTitle, data.docName);
      setCurrentChat(chat);

      // Progress Indicators
      showAlert('success', 'Successful on uploading your document!');

      loader.style.display = 'none';
      input.removeAttribute('disabled');
      setTimeout(() => {
        // samplePdf.innerHTML = 'Yohanes Mulugeta';
        setChatTitle(data.chatTitle);
      }, 1000);
    } catch (err) {
      input.removeAttribute('disabled');
      const message =
        err.response?.data?.message || 'Something Went Wrong. Please try again';
      showAlert('danger', message);

      loader.style.display = 'none';
    }
  };
  fileReader.readAsArrayBuffer(file);
}

// /////////////////// //
//      HELPERS        //
// ////////////////// //

// --------------- from pdf
async function extractTextFromPdf(file) {
  const typedArray = new Uint8Array(await file.arrayBuffer());
  const pdfDocument = await pdfjsLib.getDocument({ data: typedArray }).promise;

  const textContent = [];

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    textContent.push(await page.getTextContent());
  }

  const text = textContent.map((content) => {
    return content.items.map((item) => item.str).join('');
  });
  return text.join('');
}

// ------------ form txt
async function extractTextFromTxt(file) {
  const text = await file.text();
  return text;
}
/////////////////l//////////////////////
