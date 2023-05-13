import makeRequest from '../resusables/fetch.js';
import showError from '../resusables/showError.js';
import { showProgress, removeProgress } from '../resusables/showProgressBtn.js';
import renderChatBtns from './renderChats.js';

class Chat {
  promptInput = document.getElementById('user-input');
  generateBtn = document.querySelector('.btn-ask');
  containerContainer = document.querySelector('.chat-column-right-row-two');
  chatTitle = document.querySelector('.chat-title');
  state = { docName: '', chatTitle: '', history: [] };

  constructor(chatTitle, docName) {
    this.state.chatTitle = chatTitle;
    this.state.docName = docName;
    this.chatTitle.textContent = chatTitle;
    this.url = `api/v1/pdf/chat/`;

    this.init();
  }

  init() {
    this.setState();

    document.querySelector('.messages-chat').remove();
    this.containerContainer.insertAdjacentHTML(
      'afterbegin',
      `<div class="messages-chat">
        <div class='d-flex justify-content-center loader-messages'>
          <div class='spinner-grow text-primary loader'>
          </div>
        </div>
      </div>`
    );
    this.chatContainer = document.querySelector('.messages-chat');
    this.generateBtn.addEventListener('click', this.handleGenerateBtn);
    this.promptInput.addEventListener('keyup', this.handleEnterKey);

    this.populateHistory();
    renderChatBtns();
  }

  populateHistory() {
    const loader = document.querySelector('.loader-messages');
    if (this.state.history.length === 0) {
      this.addBotMessage(
        `Hello, I am here to help assist you with any question related to the document you uploaded`
      );
    } else {
      this.state.history.forEach((hist) => {
        this.addUserMessage(hist[0].trim().replace(/question:/i, ''));
        this.addBotMessage(hist[1].trim().replace(/answer:/i, ''));
      });
    }
    loader.remove();
  }

  handleGenerateBtn = (e) => {
    e.preventDefault();
    const value = this.promptInput.value;
    this.promptInput.value = '';
    this.sendQuestion(value);
  };

  handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      this.sendQuestion(this.promptInput.value);
    }
  };

  // sendQuestion
  async sendQuestion(question) {
    try {
      this.addUserMessage(question);
      this.addBotMessage('Loading...');

      const dataTobeSent = {
        question: question,
        history: this.state.history,
        docName: this.state.docName,
      };

      const { data } = await makeRequest({ dataTobeSent, url: this.url, method: 'post' });

      this.state.history.push([`Question: ${question}`, `Answer: ${data.response.text}`]);
      this.storeStateToLocal();

      this.replaceTypingEffect(data.response.text);
    } catch (err) {
      showError(err, this.generateBtn, 'Try Again!');
      // location.reload(true);
    }
  }

  addUserMessage(message) {
    const userDiv = document.createElement('div');
    userDiv.className = 'message text-only text-user';
    userDiv.innerHTML = `<div class="user-input"><span class="text ">${message}</span></div>`;
    this.chatContainer.appendChild(userDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  //create new html instance for BOT message
  addBotMessage(resultText) {
    document.querySelector('.last-bot-message')?.classList.remove('last-bot-message');
    const botDiv = document.createElement('div');
    botDiv.className = 'message text-bot last-bot-message';
    botDiv.innerHTML = `<span class="text generated-bot-text typing-dots">${resultText} </span>`;
    // botDiv.classList.add('last-bot-message');
    this.chatContainer.appendChild(botDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    botDiv.scrollIntoView();
  }

  replaceTypingEffect(botText) {
    const lastBotMessage = document.querySelector('.last-bot-message');
    lastBotMessage.textContent = botText;
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    lastBotMessage.scrollIntoView();
  }

  collectGarbage() {
    this.generateBtn.removeEventListener('click', this.handleGenerateBtn);
    this.promptInput.removeEventListener('keyup', this.handleEnterKey);
  }

  storeStateToLocal(isnew = false) {
    const chats = JSON.parse(localStorage.getItem('chatsChatpdf'));
    this.state.lastUpdatedDate = Date.now();
    if (isnew) {
      chats[this.state.docName] = this.state;
      return localStorage.setItem('chatsChatpdf', JSON.stringify(chats));
    }

    chats[this.state.docName] = this.state;
    localStorage.setItem('chatsChatpdf', JSON.stringify(chats));
  }

  setState() {
    const storage = localStorage.getItem('chatsChatpdf');

    if (!storage)
      return localStorage.setItem(
        'chatsChatpdf',
        JSON.stringify({ [this.state.docName]: this.state })
      );

    const parsed = JSON.parse(storage);
    const nextState = parsed[this.state.docName];

    if (!nextState) return this.storeStateToLocal(true);

    this.state = nextState;
  }
}

export default Chat;
