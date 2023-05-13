import { setCurrentChat } from '../scriptDemo.js';
import Chat from './chat.js';

const sideBar = document.querySelector('.chat-column-left-row-one');
const loaderChatBtn = document.querySelector('.loader-chatbtns ');

export default function renderChatBtns(e) {
  const chats = localStorage.getItem('chatsChatpdf');
  if (!chats) return;

  const parsed = Object.entries(JSON.parse(chats));

  parsed.sort((a, b) => +b[1].lastUpdatedDate - +a[1].lastUpdatedDate);

  loaderChatBtn.remove();

  parsed.forEach((chat) => {
    sideBar.insertAdjacentHTML(
      'beforeend',
      `
      <div class='chat-btn-delete-container'>
        <button data-docname=${chat[0]} data-chattitle=${chat[1].chatTitle} class='btn-sample-pdf btn btn-primary btn-chat'>
          <i class='bi bi-file-earmark-pdf'></i> ${chat[1].chatTitle}
        </button>
        <button class='btn-danger btn btn-delete-chat'>
          <i class='bi bi-archive'></i> 
        </button>
      </div>`
    );
  });
}

export function handleChatBtns(e) {
  const chatBtn = e.target.closest('.btn-chat');
  if (!chatBtn) return;

  // making previous chatbtn available
  const prevActiveBtn = document.querySelector('.active-chat-btn');
  prevActiveBtn?.classList.remove('active-chat-btn');
  prevActiveBtn?.removeAttribute('disabled');

  // Disabling current active chat btn
  chatBtn.classList.add('active-chat-btn');
  chatBtn.setAttribute('disabled', true);

  const chat = new Chat(chatBtn.dataset.chattitle, chatBtn.dataset.docname);
  setCurrentChat(chat);
}
