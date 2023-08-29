import { showAlert } from '../reusables/alert.js';
import makeRequest from '../reusables/fetch.js';
import showError from '../reusables/showError.js';
import { removeProgress, showProgress } from '../reusables/showProgressBtn.js';

export let currentChat;
const messagesInputContainer = document.querySelector('.chat-container');
const modalExportableChatbot = document.getElementById('exportable-chatbot-tags');
const chatTitleInput = modalExportableChatbot?.querySelector('input');
const linkCopyContainer = modalExportableChatbot?.querySelector('.link-copy-container');
const linkContainer = modalExportableChatbot?.querySelector('.link-container');
const btnGenerateChatbot = modalExportableChatbot?.querySelector('.btn-generate-chatbot');

class Chat {
  promptInput = document.getElementById('user-input');
  generateBtn = document.querySelector('.btn-ask');
  state = { docName: '', chatTitle: '', history: [] };
  copyBtnMarkup = `<button class="btn-copy btn btn-outline-primary">
                      <i class="bi bi-clipboard2"></i>
                   </button>`;

  constructor({ name: chatTitle, _id, chatHistory }) {
    this.state.chatTitle = chatTitle;
    this.state.docName = chatTitle;
    this.state.history = chatHistory ? chatHistory : [];
    this.state.chatId = _id;
    this.url = `wss://${location.hostname}${
      location.port ? ':' + location.port : ''
    }/api/v1/chat/${_id}`;
    // this.url = `wss://${
    //   location.hostname === 'localhost' ? 'localhost:8000' : location.hostname
    // }/api/v1/pdf/chat/${_id}`;

    this.socket = new WebSocket(this.url);
    // this.socket = new WebSocket(`wss://${location.hostname}/api/v1/pdf/chat/${_id}`);

    this.setCurrentChat(this);

    this.init();
  }

  // initialize
  init() {
    this.socket.onmessage = this.addWebsocketResponse;
    this.socket.onclose = this.handleSocketClose;
    resetMessageInputContainer();
    this.chatContainer = document.querySelector('.messages-container');
    this.enabelInputAndBtn();
    this.addListnersForInput();
    this.chatContainer.addEventListener('click', this.handleCopy);
    this.populateHistory();
  }

  // --------------- populate history to chat container
  populateHistory() {
    if (this.state.history.length === 0) {
      this.addBotMessage(
        `Hello, I am here to help assist you with any question related to the document: ${this.state?.chatTitle}`
      );
    } else {
      this.state.history.forEach((hist) => {
        this.addUserMessage(hist[0].trim().replace(/question:/i, ''));
        this.addBotMessage(hist[1].trim().replace(/answer:/i, ''));
      });
    }
  }

  // ------------- passer to the send qustion function from the input
  handleGenerateBtn = (e) => {
    e.preventDefault();
    const value = this.promptInput.value;
    this.sendQuestion(value);
    this.promptInput.value = '';
  };

  handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      this.sendQuestion(this.promptInput.value);
      this.promptInput.value = '';
    }
  };

  // ---------------------- SENDS QUESTION TO THE BACK END
  sendQuestion(question) {
    this.addUserMessage(question);
    this.addBotMessage('Loading...', true);

    // Check websocket status and make a reset if needed
    if (
      this.socket.readyState === WebSocket.CLOSED ||
      this.socket.readyState === WebSocket.CLOSING
    ) {
      this.resetWebsocket(question);

      return;
    }

    this.socket.send(question);
    this.removeListnerForInput();
  }

  addWebsocketResponse = (event) => {
    const message = JSON.parse(event.data);
    const lastBotMessage = document.querySelector('.last-bot-message');
    if (message.event === 'data') {
      // console.log(message.data);
      lastBotMessage.querySelector('.text-to-be-copy').innerText += message.data;

      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    if (message.event === 'source') {
      this.replaceTypingEffect();
      message.source.forEach((source, i) => {
        const formatedPageContent = window.markdownit().render(source.pageContent);
        this.renderSourceAccordion(formatedPageContent, lastBotMessage, i);
      });
    }

    if (message.event === 'error') {
      this.removeListnerForInput();
      this.addListnersForInput();
      showAlert(
        'danger',
        message.statusCode === 500
          ? 'Something Went wrong. Please Try again!'
          : message.error
      );
      document.querySelector('.last-bot-message')?.remove();
      return console.log(message.error);
    }
  };

  // --------------------- THSI WILL REPLACE THE LOADING BOT WITH THE ACTULA MESSAGE
  replaceTypingEffect() {
    if (currentChat !== this) return;
    this.addListnersForInput();

    document.querySelector('.loader-chat-bot')?.remove();
    document
      .querySelector('.last-bot-message')
      ?.insertAdjacentHTML('beforeend', this.copyBtnMarkup);

    // this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  // ---------------- RENDERS USER QUESTION
  addUserMessage(message) {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message message';
    userDiv.innerHTML = message;
    this.chatContainer.appendChild(userDiv);
    // userDiv.scrollIntoView();
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  //--------------- create new html instance for BOT message
  addBotMessage(resultText, load = false) {
    const formatedText = load
      ? `<div class='text-to-be-copy'></div>
        <div class='d-flex justify-content-start loader-chat-bot'>
          <div class='spinner-grow text-primary loader' role='status'>
        </div>`
      : ` <div class='text-to-be-copy'>${window.markdownit().render(resultText)}</div>${
          this.copyBtnMarkup
        }`;

    document.querySelector('.last-bot-message')?.classList.remove('last-bot-message');
    const botDiv = document.createElement('div');
    botDiv.className = 'bot-message message';
    botDiv.innerHTML = formatedText;

    botDiv.classList.add('last-bot-message');
    this.chatContainer.appendChild(botDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  // -------------------- SOURCE RENDERER
  renderSourceAccordion(source, botMessage, i) {
    const containerId = `c-${Date.now()}`;
    const headingId = `h-${Date.now()}`;
    const contentId = `co-${Date.now()}`;
    botMessage.insertAdjacentHTML(
      'beforeend',
      `<div id='${containerId}' class='accordion'>
            <div class='accordion-item'>
              <h2 id='${headingId}' class='accordion-header'>
                <button class='button accordion-button' type="button" data-bs-toggle="collapse" data-bs-target="#${contentId}" aria-expanded="false" aria-controls="${contentId}">
                  Source ${i + 1}
                </button>
              </h2>
              <div id='${contentId}' class='accordion-collapse collapse' aria-labelledby='${headingId}' data-bs-parent="#${containerId}">
                <div class='accordion-body'>${source}</div>
              </div>
            </div>
          </div>`
    );
  }

  // -------------------- COPY BTN HANDLER
  handleCopy = (e) => {
    const copyBtn = e.target.closest('.btn-copy');
    if (!copyBtn) return;

    const text = this.getBotMess(copyBtn);

    navigator.clipboard.writeText(text);

    copyBtn.innerHTML = '<i class="bi bi-clipboard2-check-fill"></i>';
  };

  // ----------------- CONVERSATION DOWNLOADER
  handleDownloadConversation() {
    const conversations = document.querySelectorAll('.message');

    let formatedConversation = '';

    conversations.forEach((mess) => {
      formatedConversation += mess.classList.contains('bot-message')
        ? `BOT: ${this.getBotMess(mess)} \n \n`
        : `USER: ${mess.innerText} \n`;
    });

    const downloadHiddenEl = document.createElement('a');
    downloadHiddenEl.setAttribute(
      'href',
      'data:text/plain;charset=urf-8,' + encodeURIComponent(formatedConversation)
    );
    downloadHiddenEl.setAttribute('download', this.state.chatId + '.txt');
    downloadHiddenEl.style.display = 'none';
    downloadHiddenEl.click();
    downloadHiddenEl.remove();
  }

  // ---------- CURRENT CHAT SETTER
  setCurrentChat(chat) {
    currentChat?.collectGarbage();
    currentChat = chat;
  }

  // --------------- Input placeholder
  enabelInputAndBtn() {
    this.promptInput.removeAttribute('disabled');
    this.generateBtn.removeAttribute('disabled');
    this.promptInput.placeholder = `Chat with ${this.state.chatTitle
      .split('-')
      .join(' ')}`;
  }

  // ------------ add Event listners for the input filed
  addListnersForInput() {
    this.generateBtn.addEventListener('click', this.handleGenerateBtn);
    this.promptInput.addEventListener('keyup', this.handleEnterKey);
  }

  // ---------------- Remove Listners
  removeListnerForInput() {
    this.generateBtn.removeEventListener('click', this.handleGenerateBtn);
    this.promptInput.removeEventListener('keyup', this.handleEnterKey);
  }

  // ---------- HELPER TO GET BOT MESSAGE
  getBotMess(el) {
    return el.closest('.bot-message').querySelector('.text-to-be-copy').innerText;
  }

  // ------------ GARBAGE COLLECTOR
  collectGarbage() {
    this.socket.onclose = undefined;
    this.socket.onmessage = undefined;
    this.socket.close();
    this.generateBtn.removeEventListener('click', this.handleGenerateBtn);
    this.promptInput.removeEventListener('keyup', this.handleEnterKey);
    this.chatContainer.removeEventListener('click', this.handleCopy);
  }

  // -------- handleClose
  handleSocketClose = () => {
    if (this !== currentChat) return;

    if (document.querySelector('.loader-chat-bot')) {
      showAlert('danger', 'websocket disconnected while streamin resul.');
      document.querySelector('.loader-chat-bot').closest('.bot-message').remove();
    }

    this.removeListnerForInput();
    this.addListnersForInput();

    this.socket = new WebSocket(this.url);
    this.socket.onmessage = this.addWebsocketResponse;
    this.socket.onclose = this.handleSocketClose;
  };

  // ----------------- RESET SOCKET
  resetWebsocket(question) {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = this.addWebsocketResponse;
    this.socket.onclose = this.handleSocketClose;

    setTimeout(() => {
      this.socket.readyState === WebSocket.OPEN && this.socket.send(question);
      if (
        this.socket.readyState === WebSocket.CLOSED ||
        this.socket.readyState === WebSocket.CLOSING
      ) {
        showAlert(
          'danger',
          'Something went wrong on trying to connect to the websocket. please try again'
        );
        setTimeout(() => {
          location.reload(true);
        }, 1000);
      }
    }, 3000);
  }
}

export default Chat;

export function resetMessageInputContainer() {
  document.querySelector('.messages-container').remove();
  messagesInputContainer.insertAdjacentHTML(
    'afterbegin',
    `<div class='messages-container'>
        <div class='d-flex justify-content-center chat-loader hidden'>
          <div class='spinner-grow text-primary loader' role="status"></div> 
        </div>
      </div>`
  );

  currentChat.chatContainer = document.querySelector('.messages-container');
}

modalExportableChatbot?.addEventListener('click', handleExportableChatbotModal);

// Generate HTML tags
async function handleGenerateChatbot(e) {
  const btnGenerateChatbot = e.target.closest('.btn-generate-chatbot');
  const chatTitle = chatTitleInput.value.trim();

  const { chatid } = modalExportableChatbot.dataset;

  if (!chatTitle) return showAlert('danger', 'Please Give a Name for Your ChatBot');

  try {
    // ----------- Show progresses
    showProgress(btnGenerateChatbot);
    linkContainer.innerHTML = ` <div class='d-flex justify-content-center loader-chat-bot align-items-center'>
          <div class='spinner-grow text-primary loader' role='status'>
        </div>`;

    const {
      data: { cssLink, scriptTag, markDown },
    } = await makeRequest({
      method: 'post',
      url: `/api/v1/users/generatechatbotlink/${chatid}`,
      dataTobeSent: { chatTitle },
    });

    linkContainer.closest('.link-copy-container').classList.add('has-links');

    linkContainer.innerText = `
    ${cssLink} \n
    ${markDown}\n
   ${scriptTag}\n
    `;

    // ------- Remove progress
    removeProgress(btnGenerateChatbot, 'Genrate Again');
    showAlert('success', 'Success on generating your chatbot.');
  } catch (err) {
    showError(err, btnGenerateChatbot, 'Try Again');
  }
}

// ---------- Copy html tags
function handleCopyChatbot(linkCopyContainer) {
  navigator.clipboard.writeText(linkContainer.innerText);
  linkCopyContainer.querySelector('.copy-status').innerText = 'Copied!';
}

function handleExportableChatbotModal(e) {
  // gnerate Script tags
  if (e.target.closest('.btn-generate-chatbot')) return handleGenerateChatbot(e);

  // Handle copy chatbot
  if (e.target.closest('.link-copy-container'))
    return handleCopyChatbot(e.target.closest('.link-copy-container '));
}

// Reset Modal
modalExportableChatbot?.addEventListener('show.bs.modal', (e) => {
  chatTitleInput.value = '';
  linkCopyContainer.classList.remove('has-links');
  linkContainer.innerText =
    'Type the name your chatbot to be called and click generate to get your chatbot';
  btnGenerateChatbot.innerText = 'Generate ChatBot';
});
