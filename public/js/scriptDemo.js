import Chat from './chat/chat.js';
import renderChatBtns, { handleChatBtns } from './chat/renderChats.js';
import fetchAndDisplay from './upload.js';

//TOGGLER MOBILE VERSION
const btnDropSection = document.querySelector('.button-dropsection');
// const btnTools = document.querySelector('.button-tools');

const chatColumnLeft = document.querySelector('.chat-column-left');
const chatTools = document.querySelector('.chat-tools');
const leftColumn = document.querySelector('.chat-column-left');
const sideBar = document.querySelector('.chat-column-left-row-one');

//DRAG AND DROP || UPLOAD FILE
const dropZone = document.querySelector('.drop-zone');
const input = document.querySelector('input[type="file"]');
const dropDesc = document.getElementById('#drop-description');

const fileInfo = document.querySelector('.file-info');

btnDropSection.addEventListener('click', () => {
  chatColumnLeft.classList.remove('mobile-hidden');
});

leftColumn.addEventListener('click', handleLeftColHide);

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

export function handleLeftColHide(e) {
  if (e) if (!e.target.closest('.btn-chat') && !e.target.closest('.close-btn')) return;

  chatColumnLeft.classList.add('mobile-hidden');
}
