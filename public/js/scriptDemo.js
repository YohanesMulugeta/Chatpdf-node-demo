import fetchAndDisplay from './upload.js';

//TOGGLER MOBILE VERSION
const btnDropSection = document.querySelector('.button-dropsection');
const btnTools = document.querySelector('.button-tools');

const chatColumnLeft = document.querySelector('.chat-column-left');
const chatTools = document.querySelector('.chat-tools');
const returnToChat = document.querySelector('.close-btn');

btnDropSection.addEventListener('click', () => {
  chatColumnLeft.classList.remove('mobile-hidden');
});
returnToChat.addEventListener('click', () => {
  chatColumnLeft.classList.add('mobile-hidden');
});

btnTools.addEventListener('click', () => {
  chatTools.classList.toggle('mobile-hidden');
});
//DRAG AND DROP || UPLOAD FILE

const dropZone = document.querySelector('.drop-zone');
const input = document.querySelector('input[type="file"]');
const dropDesc = document.getElementById('#drop-description');
const loadingText = document.querySelector('.loader');
const fileInfo = document.querySelector('.file-info');
const fileName = document.querySelector('.chat-title');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drop-zone--active');
});

dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drop-zone--active');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drop-zone--active');
  fetchAndDisplay(e);
});

dropZone.addEventListener('click', () => {
  input.click();
});

input.addEventListener('change', () => {
  if (input.files[0]) fetchAndDisplay(input.files[0], true);
});

/////////////////////////////////////////////////

// async function fetchAndDisplay(fileContainer, isFile = false) {
//   const file = isFile ? fileContainer : fileContainer.dataTransfer.items[0].getAsFile();
//   const fileReader = new FileReader();

//   const samplePdf = document.querySelector('.btn-sample-pdf');
//   fileReader.onload = async function () {
//     try {
//       // progress indicators
//       showProgress(samplePdf);

//       const text =
//         file.type === 'application/pdf'
//           ? await extractTextFromPdf(file)
//           : await extractTextFromTxt(file);

//       //   console.log(file);
//       //   dataTobeSent.text = text;
//       const dataTobeSent = {
//         text,
//         originalName: file.name,
//       };

//       const data = await makeRequest({
//         dataTobeSent,
//         method: 'post',
//         url: `/api/v1/pdf/processpdf`,
//       });

//       //   const chat = new Chat(10000000, 'Yohanes Mulugeta', history);
//       const chat = new Chat(data.chatId, data.chatTitle);

//       // Progress Indicators
//       removeProgress(samplePdf, 'Done');
//       showAlert('success', 'Successful on uploading your document!');

//       setTimeout(() => {
//         // samplePdf.innerHTML = 'Yohanes Mulugeta';
//         samplePdf.innerHTML = data.chatTitle;
//       }, 1000);
//     } catch (err) {
//       showError(err, samplePdf, 'TryAgain');
//     }
//   };
//   fileReader.readAsArrayBuffer(file);
// }

// // /////////////////// //
// //      HELPERS        //
// // ////////////////// //

// // --------------- from pdf
// async function extractTextFromPdf(file) {
//   const typedArray = new Uint8Array(await file.arrayBuffer());
//   const pdfDocument = await pdfjsLib.getDocument({ data: typedArray }).promise;

//   const textContent = [];

//   for (let i = 1; i <= pdfDocument.numPages; i++) {
//     const page = await pdfDocument.getPage(i);
//     textContent.push(await page.getTextContent());
//   }

//   const text = textContent.map((content) => {
//     return content.items.map((item) => item.str).join('');
//   });
//   return text.join('');
// }

// // ------------ form txt
// async function extractTextFromTxt(file) {
//   const text = await file.text();
//   return text;
// }
// /////////////////l//////////////////////
