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

    this.generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.sendQuestion(this.promptInput.value);
      this.promptInput.value = '';
    });

    //generate using click enter
    this.promptInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        this.sendQuestion(this.promptInput.value);
      }
    });
  }

  // sendQuestion
  async sendQuestion(question) {
    try {
      this.addUserMessage(question);
      this.addBotMessage('Loading...');

      const dataTobeSent = { question: question };

      const { data } = await makeRequest({ dataTobeSent, url: this.url, method: 'post' });
      this.replaceTypingEffect(data.response.text);
    } catch (err) {
      showError(err, generateBtn, 'Try Again!');
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
    botDiv.className = 'message text-bot';
    botDiv.innerHTML = `<span class="text generated-bot-text typing-dots">${resultText} </span>`;
    botDiv.classList.add('last-bot-message');
    this.chatContainer.appendChild(botDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  replaceTypingEffect(botText) {
    const lastBotMessage = document.querySelector('.last-bot-message');
    lastBotMessage.textContent = botText;
    // const botTextDOM = document.querySelectorAll('.generated-bot-text');
    // botTextDOM.forEach((botTextDiv) => {
    //   if (botTextDiv.innerText === 'Loading...') {
    //     botTextDiv.classList.remove('typing-dots');
    //     botTextDiv.innerText = botText;
    //   }
    // });
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  collectGarbage() {}
}

export default Chat;
