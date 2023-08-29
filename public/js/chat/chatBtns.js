import { removeProgress, showProgress } from '../reusables/showProgressBtn.js';
import showError from '../reusables/showError.js';
import makeRequest from '../reusables/fetch.js';
import { showAlert } from '../reusables/alert.js';
import fetchAndDisplay, { uploadPdf } from '../uploadN.js';
import Chat, { resetMessageInputContainer, currentChat } from './chatN.js';

const sidebar = document.querySelector('.upload-chat-btn-container');
const dropZone = document.querySelector('.drop-zone');
const btnDropSection = document.querySelector('.button-dropsection');
const input = document.getElementById('file');
const chatColumnLeft = document.querySelector('.chat-column-left');
// const btnTools = document.querySelector('.button-tools');
const expandSideBar = document.querySelector('.btn-open-sidebar');
const chatBtnContainer = document.querySelector('.chat-btn-container');
const chatDocumentsModal = document.getElementById('chat-documents');

const baseUrl = '/api/v1/pdf/';
let handler;

const chatToolsHtml = `
      <div class="chat-tools">
        <buton class="btn-add-document btn btn-tool">
          <i class="bi bi-journal-plus"></i>
          <input id="add-file" type="file" hidden="" accept=".pdf,.txt,.doc,.docx,.csv">
        </buton>
        <buton class="btn-chat-documents btn btn-tool"  data-bs-toggle="modal" data-bs-target="#chat-documents">
          <i class="bi bi-file-arrow-up"></i>
        </buton>
        <buton class="btn-reset-chat btn btn-tool">
          <i class="bi bi-arrow-counterclockwise"></i>
        </buton>
        <buton class="btn-download-chat btn btn-tool">
          <i class="bi bi-download"></i>
        </buton>
      </div>`;

async function handleDeleteChat(e) {
  const targetBtn = e.target.closest('.btn-delete-chat');
  const { chatid } = targetBtn.closest('.chat-btn-delete-container').dataset;
  let intervalId, timeoutId;
  try {
    let time = 3;
    targetBtn.classList.remove('btn-delete-chat');
    const handleInterval = () => {
      targetBtn.innerHTML = `<i class="bi bi-arrow-90deg-left">${time}</i>`;
      time--;
    };

    handleInterval();
    intervalId = setInterval(handleInterval, 1000);
    timeoutId = setTimeout(deleteChat, time * 1100, targetBtn, chatid, intervalId);

    // binding the intercal id an dtarget btn to the undo handler
    const bindOpt = { intervalId, targetBtn, timeoutId };
    const handler = handleUndo.bind(bindOpt);
    bindOpt.handler = handler;

    targetBtn.addEventListener('click', handler);
  } catch (err) {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    showError(err, targetBtn, `<i class='bi bi-archive'></i>`);
  }
}

export async function handleChatBtns(e) {
  const chatBtn = e.target.closest('.btn-chat');
  const innerHTMLBtn = chatBtn?.innerHTML;
  const deleteChatBtn = e.target.closest('.btn-delete-chat');
  const chatTools = e.target.closest('.chat-tools');

  try {
    if (!chatBtn && !deleteChatBtn && !chatTools) return;
    if (deleteChatBtn) return handleDeleteChat(e);
    if (chatTools) return handleChatTools(e);

    // making previous chatbtn available
    resetPrevActiveBtn();

    showProgress(chatBtn);

    // Disabling current active chat btn
    chatBtn.classList.add('active-chat-btn');

    const chatId = getChatId(chatBtn);
    const {
      data: { chat },
    } = await makeRequest({ url: `${baseUrl}chat/${chatId}` });

    chatBtn
      .closest('.chat-btn-delete-container')
      .insertAdjacentHTML('beforeend', chatToolsHtml);

    new Chat(chat);

    // setCurrentChat(chat);

    handleSidebarExpandHide();

    removeProgress(chatBtn, innerHTMLBtn);
    showAlert('success', 'Successful on loading your data');
    // setCurrentChat(chat);
    chatBtn.setAttribute('disabled', true);
  } catch (err) {
    showError(err, chatBtn, innerHTMLBtn);
  }
}

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

// --------- Delete chat
async function deleteChat(btn, chatid, intervalId) {
  try {
    clearInterval(intervalId);
    showProgress(btn);

    // DELETE FROM VECTOR DATABASE
    await makeRequest({ method: 'delete', url: `/api/v1/pdf/chat/${chatid}` });

    const container = btn.closest('.chat-btn-delete-container');
    if (container.querySelector('.active-chat-btn')) currentChat.collectGarbage();

    container.classList.add('success-deletion');
    container.innerHTML = `<i class="bi bi-check-circle-fill"></i>`;

    setTimeout(() => {
      container.remove();
    }, 1500);
  } catch (err) {
    showError(err, btn, `<i class='bi bi-archive'></i>`);
  }
}

// ------------- render new chat btn
export function renderBtn(chat) {
  resetPrevActiveBtn();

  getSidebar().insertAdjacentHTML(
    'afterbegin',
    `<div class="chat-btn-delete-container" data-chatid=${chat.chatId} data-chattitle=${chat.chatTitle}>
      <div class="btn-chat-delete">
        <button class="btn-sample-pdf btn btn-primary btn-chat active-chat-btn" disabled="true">
          <i class="bi bi-file-earmark-pdf"></i><p>${chat.chatTitle}</p>
        </button>
        <button class="btn-danger btn btn-delete-chat">
          <i class="bi bi-archive"></i>
        </button>
      </div>
      ${chatToolsHtml}
    </div>`
  );
}

export async function handleChatTools(e) {
  if (e.target.closest('#add-file')) return;
  const btnGenerateChatbot = e.target.closest('.btn-getchatbot');
  const btnChatDocuments = e.target.closest('.btn-chat-documents');

  try {
    const addDocumentInput = document.getElementById('add-file');
    if (e.target.closest('.btn-reset-chat')) return handleResetChat(e);
    if (e.target.closest('.btn-download-chat'))
      return currentChat.handleDownloadConversation();

    if (btnChatDocuments) {
      chatDocumentsModal.querySelector('.chat-documents-body').innerHTML = `
      <div class='spinner-container'>
        <div class="spinner-grow text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      `;
      return handleChatDocuments(btnChatDocuments);
    }

    if (btnGenerateChatbot) {
      const { chatid } = btnGenerateChatbot.closest('.chat-btn-delete-container').dataset;
      document.getElementById('exportable-chatbot-tags').dataset.chatid = chatid;

      return;
    }

    addDocumentInput.value = '';
    addDocumentInput?.removeEventListener('change', inputChangeHandler);
    addDocumentInput?.addEventListener('change', inputChangeHandler);

    if (e.target.closest('.btn-add-document')) {
      addDocumentInput.click();
      // console.log('clicked');
    }
  } catch (err) {}
}

async function handleChatDocuments(btn) {
  try {
    const chatId = getChatId(btn);
    const {
      data: { chat: data },
    } = await makeRequest({ url: `${baseUrl}chat/${chatId}` });
    const chatDocumentsBody = chatDocumentsModal.querySelector('.chat-documents-body');
    chatDocumentsBody.querySelector('.spinner-container')?.remove();

    chatDocumentsBody.innerText = data.docs
      ?.map((doc, i) => `${i + 1}) ${doc}\n`)
      .join('');
  } catch (err) {
    showAlert('danger', 'Something went wrong trying to display your documents.');
  }
}

function inputChangeHandler(e) {
  const chatId = getChatId(e.target);

  // e.target.setAttribute('disabled', true);
  addDocument(chatId, e.target);
}

async function addDocument(chatId, inputField) {
  const url = `${baseUrl}adddocument/${chatId}`;

  await uploadPdf({ file: inputField.files[0], endPoint: url, inputField });
}

async function handleResetChat(e) {
  const btnReset = e.target.closest('.btn-reset-chat');
  const chatLoader = document.querySelector('.chat-loader');
  try {
    const chatId = getChatId(e.target);
    btnReset.setAttribute('disabled', true);

    chatLoader?.classList.remove('hidden');

    await makeRequest({ method: 'patch', url: `${baseUrl}chat/${chatId}` });
    resetMessageInputContainer();

    showAlert('success', 'Chat history cleared successfully');
  } catch (err) {
    showAlert(
      'danger',
      err.response?.data?.message || err.message || 'Something went wrong '
    );
  }
  chatLoader?.classList.add('hidden');
  btnReset.removeAttribute('disabled');
}

// ///////////// //
//    HELEPERS  //
//  ////////// //

// helpers
function getChatId(el) {
  return el.closest('.chat-btn-delete-container').dataset.chatid;
}

function resetPrevActiveBtn() {
  const prevActiveBtn = document.querySelector('.active-chat-btn');
  prevActiveBtn
    ?.closest('.chat-btn-delete-container')
    ?.querySelector('.chat-tools')
    ?.remove();

  prevActiveBtn?.classList.remove('active-chat-btn');
  prevActiveBtn?.removeAttribute('disabled');
}

function getSidebar() {
  return document.querySelector('.chat-btn-container');
}

export function handleLeftColHide(e) {
  if (e) if (!e.target.closest('.btn-chat') && !e.target.closest('.close-btn')) return;

  sidebar.classList.add('mobile-hidden');
}

export function handleSidebarExpandHide() {
  sidebar.classList.toggle('mobile-hidden');
}

// Open chat btns
chatBtnContainer?.addEventListener('click', handleChatBtns);

// DrodDown
dropZone?.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drop-zone--active');
});

dropZone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drop-zone--active');
});

expandSideBar?.addEventListener('click', handleSidebarExpandHide);

dropZone?.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('drop-zone--active');

  fetchAndDisplay(e);
});

dropZone?.addEventListener('click', () => {
  input.value = '';
  input.click();
});

input?.addEventListener('change', async () => {
  if (input.files[0]) fetchAndDisplay(input.files[0], true);
});
