import { setCurrentChat } from '../scriptDemo.js';
import Chat from './chat.js';

const sideBar = document.querySelector('.chat-column-left-row-one');

export default function renderChatBtns(e) {
  const chats = localStorage.getItem('chatsChatpdf');
  if (!chats) return;

  const parsed = Object.entries(JSON.parse(chats));

  parsed.sort((a, b) => +b[1].lastUpdatedDate - +a[1].lastUpdatedDate);

  parsed.forEach((chat) => {
    sideBar.insertAdjacentHTML(
      'beforeend',
      `<button data-docname=${chat[0]} data-chattitle=${chat[1].chatTitle} class='btn-sample-pdf btn btn-primary btn-chat'>
        <i class='bi bi-file-earmark-pdf'></i> ${chat[1].chatTitle}
      </button>`
    );
  });
}

export function handleChatBtns(e) {
  const chatBtn = e.target.closest('.btn-chat');

  if (!chatBtn) return;
  document.querySelector('.active-chat-btn')?.classList.remove('active-chat-btn');
  chatBtn.classList.add('active-chat-btn');
  const chat = new Chat(chatBtn.dataset.chattitle, chatBtn.dataset.docname);
  setCurrentChat(chat);
}
