import makeRequest from '../resusables/fetch.js';
import showError from '../resusables/showError.js';
import { showProgress, removeProgress } from '../resusables/showProgressBtn.js';

class Chat {
  chatContainer = document.querySelector('.messages-chat');
  promptInput = document.getElementById('user-input');
  generateBtn = document.querySelector('.btn-ask');

  constructor(chatId, chatTitle, history = []) {
    this.chatId = chatId;
    this.chatTitle = chatTitle;
    this.history = history;
    this.url = `api/v1/pdf/chat/${this.chatId}`;

    if (history.length === 0)
      this.addBotMessage(
        `Hello, I am here to help assist you with any question related to the document you just uploaded: ${this.chatTitle}`
      );

    this.init();
  }

  init() {
    this.generateBtn.addEventListener('click', this.handleGenerateBtn);
    this.promptInput.addEventListener('keyup', this.handleEnterKey);
    if (this.history.length > 0) {
      this.history.forEach((hist) => {
        this.addUserMessage(hist[0].trim().replace(/question:/i, ''));
        this.addBotMessage(hist[1].trim().replace(/answer:/i, ''));
      });
    }
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

      const dataTobeSent = { question: question };

      const { data } = await makeRequest({ dataTobeSent, url: this.url, method: 'post' });
      this.replaceTypingEffect(data.response.text);
    } catch (err) {
      showError(err, this.generateBtn, 'Try Again!');
      location.reload(true);
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
}

export default Chat;
