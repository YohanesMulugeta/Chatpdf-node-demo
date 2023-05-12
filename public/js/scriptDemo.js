import renderChatBtns, { handleChatBtns } from './chat/renderChats.js';
import fetchAndDisplay from './upload.js';

//TOGGLER MOBILE VERSION
const btnDropSection = document.querySelector('.button-dropsection');
const btnTools = document.querySelector('.button-tools');

const chatColumnLeft = document.querySelector('.chat-column-left');
const chatTools = document.querySelector('.chat-tools');
const returnToChat = document.querySelector('.close-btn');
const sideBar = document.querySelector('.chat-column-left-row-one');

//DRAG AND DROP || UPLOAD FILE
const dropZone = document.querySelector('.drop-zone');
const input = document.querySelector('input[type="file"]');
const dropDesc = document.getElementById('#drop-description');
const loadingText = document.querySelector('.loader');
const fileInfo = document.querySelector('.file-info');
const fileName = document.querySelector('.chat-title');

btnDropSection.addEventListener('click', () => {
  chatColumnLeft.classList.remove('mobile-hidden');
});
returnToChat.addEventListener('click', () => {
  chatColumnLeft.classList.add('mobile-hidden');
});

btnTools.addEventListener('click', () => {
  chatTools.classList.toggle('mobile-hidden');
});

let currentChat;

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drop-zone--active');
});

dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drop-zone--active');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('drop-zone--active');

  fetchAndDisplay(e);
});

dropZone.addEventListener('click', () => {
  input.click();
});

input.addEventListener('change', async () => {
  if (input.files[0]) fetchAndDisplay(input.files[0], true);
});

window.addEventListener('load', renderChatBtns);

sideBar.addEventListener('click', handleChatBtns);

export const setCurrentChat = (chat) => {
  currentChat?.collectGarbage();
  currentChat = chat;
};
