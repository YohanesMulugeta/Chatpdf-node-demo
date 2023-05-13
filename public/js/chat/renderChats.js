import { setCurrentChat } from '../scriptDemo.js';
import { removeProgress, showProgress } from '../resusables/showProgressBtn.js';
import Chat from './chat.js';
import showError from '../resusables/showError.js';
import makeRequest from '../resusables/fetch.js';

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
      <div class='chat-btn-delete-container' data-docname=${chat[0]} data-chattitle=${chat[1].chatTitle}>
        <button class='btn-sample-pdf btn btn-primary btn-chat'>
          <i class='bi bi-file-earmark-pdf'></i> ${chat[1].chatTitle}
        </button>
        <button class='btn-danger btn btn-delete-chat'>
          <i class='bi bi-archive'></i> 
        </button>
      </div>`
    );
  });
}

async function handleDeleteChat(e) {
  const targetBtn = e.target.closest('.btn-delete-chat');
  const { docname } = targetBtn.closest('.chat-btn-delete-container').dataset;
  try {
    let time = 3;
    targetBtn.classList.remove('btn-delete-chat');
    const handleInterval = () => {
      console.log('lala');
      targetBtn.innerHTML = `<i class="bi bi-arrow-90deg-left">${time}</i>`;
      time--;
    };

    handleInterval();
    const intervalId = setInterval(handleInterval, 1000);
    const timeoutId = setTimeout(deleteChat, time * 1100, targetBtn, docname, intervalId);

    // binding the intercal id an dtarget btn to the undo handler
    const bindOpt = { intervalId, targetBtn, timeoutId };
    const handler = handleUndo.bind(bindOpt);
    bindOpt.handler = handler;

    targetBtn.addEventListener('click', handler);
  } catch (err) {
    showError(err, targetBtn, `<i class='bi bi-archive'></i> `);
  }
}

export function handleChatBtns(e) {
  const chatBtn = e.target.closest('.btn-chat');
  const deleteChatBtn = e.target.closest('.btn-delete-chat');
  if (!chatBtn && !deleteChatBtn) return;
  if (deleteChatBtn) return handleDeleteChat(e);

  // making previous chatbtn available
  const prevActiveBtn = document.querySelector('.active-chat-btn');
  prevActiveBtn?.classList.remove('active-chat-btn');
  prevActiveBtn?.removeAttribute('disabled');

  // Disabling current active chat btn
  chatBtn.classList.add('active-chat-btn');
  chatBtn.setAttribute('disabled', true);

  const chat = new Chat(
    chatBtn.closest('.chat-btn-delete-container').dataset.chattitle,
    chatBtn.closest('.chat-btn-delete-container').dataset.docname
  );
  setCurrentChat(chat);
}

// ///////////// //
//    HELEPERS  //
//  ////////// //

function handleUndo(e) {
  // garbage collection
  this.targetBtn.removeEventListener('click', this.handler);
  this.targetBtn.innerHTML = `<i class='bi bi-archive'></i>`;
  clearInterval(this.intervalId);
  clearTimeout(this.timeoutId);

  // adding the class list after the event has bubbled already
  setTimeout(() => {
    this.targetBtn.classList.add('btn-delete-chat');
  }, 1000);
}

async function deleteChat(btn, docname, intervalId) {
  clearInterval(intervalId);
  showProgress(btn);
  await makeRequest({ method: 'delete', url: `/api/v1/pdf/${docname}` });
  removeProgress(btn, `<i class='bi bi-archive'></i>`);
}
