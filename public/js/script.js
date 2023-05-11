//TOGGLER MOBILE VERSION
const btnDropSection = document.querySelector('.button-dropsection');
const btnTools = document.querySelector('.button-tools');

const chatColumnLeft = document.querySelector('.chat-column-left');
const chatTools = document.querySelector('.chat-tools');
const returnToChat = document.querySelector('.close-btn');

btnDropSection.addEventListener('click', () => {
  chatColumnLeft.classList.remove('mobile-hidden');
});
returnToChat.addEventListener('click', () => {
  chatColumnLeft.classList.add('mobile-hidden');
});

btnTools.addEventListener('click', () => {
  chatTools.classList.toggle('mobile-hidden');
});
//DRAG AND DROP || UPLOAD FILE

const dropZone = document.querySelector('.drop-zone');
const input = document.querySelector('input[type="file"]');
const loadingText = document.querySelector('.loader');
const fileInfo = document.querySelector('.file-info');
const fileName = document.querySelector('.chat-title');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drop-zone--active');
});

dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drop-zone--active');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drop-zone--active');
  handleFiles(e.dataTransfer.files);
});

dropZone.addEventListener('click', () => {
  input.click();
});

input.addEventListener('change', () => {
  handleFiles(input.files);
});

//Call back
function handleFiles(files) {
  loadingText.style.display = 'block';

  setTimeout(() => {
    loadingText.style.display = 'none';
    const fileSizeInKB = (files[0].size / 1024).toFixed(2);
    fileInfo.innerHTML = `<div class="file-name"><span>Name: ${files[0].name}</span> <span>Size: ${fileSizeInKB} KB</span></div>  `;
    fileName.innerHTML = `<h5 class="file-name-header">${files[0].name}</h5>`;

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const text =
        files.type === 'application/pdf'
          ? await extractTextFromPdf(files)
          : await extractTextFromTxt(files);
      console.log(text);
    };
    fileReader.readAsArrayBuffer(files);
  }, 1000);
}
//PDF Parser
async function extractTextFromPdf(file) {
  const typedArray = new Uint8Array(await file.arrayBuffer());
  const pdfDocument = await pdfjsLib.getDocument({ data: typedArray }).promise;
  const page = await pdfDocument.getPage(1);
  const textContent = await page.getTextContent();
  const text = textContent.items.map((item) => item.str).join('');
  return text;
}
//TXT Parser
async function extractTextFromTxt(file) {
  const text = await file.text();
  return text;
}

//FOR DEMO PURPOSE ONLY JS CHAT
const API_KEY = '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';
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
// Get references to the UI elements
const promptInput = document.getElementById('user-input');
const generateBtn = document.getElementById('submit-button');

const resultText = document.querySelector('.text-bot');
const userText = document.querySelector('.text-user');
const chatContainer = document.querySelector('.messages-chat');

//Enabling to rememeber history
let history = [
  {
    role: 'system',
    content:
      'you are a book analyser. - If you are unsure of an answer, you can say "I don\'t know" or "I\'m not sure. And Dont include your suggetions',
  },
];
console.log(history);
const generate = async () => {
  // Alert the user if no prompt value
  if (!promptInput.value) {
    alert('Please enter a prompt.');
    return;
  }
  //display user text
  addUserMessage(promptInput.value);
  addBotMessage('Typing...');
  // Disable the generate button and enable the stop button
  generateBtn.disabled = true;

  // initalize response
  let responseHistory;
  //input text
  const input_text = promptInput.value;
  //save user history
  history.push({ role: 'user', content: input_text });
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: history,
        max_tokens: 250,
      }),
    });
    //textarea clean
    promptInput.value = '';
    const data = await response.json();
    const botText = data.choices[0].message.content;

    replaceTypingEffect(botText);
    responseHistory = botText;
    //save bot history
    history.push({ role: 'assistant', content: responseHistory });
  } catch (error) {
    // Handle fetch request errors

    console.error('Error:', error);
    resultText.innerText = `The API KEY provided finished its quota , please use paid API KEY !`;
  } finally {
    // Enable the generate button and disable the stop button
    generateBtn.disabled = false;
  }
};

//generate using click enter
promptInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    generate();
  }
});
//generate using button
generateBtn.addEventListener('click', generate);

//create new html instance for USER message
function addUserMessage(message) {
  const userDiv = document.createElement('div');
  userDiv.className = 'message text-only text-user';
  userDiv.innerHTML = `<div class="user-input"><span class="text ">${message}</span></div>`;
  chatContainer.appendChild(userDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
//create new html instance for BOT message
function addBotMessage(resultText) {
  const botDiv = document.createElement('div');
  botDiv.className = 'message text-bot';
  botDiv.innerHTML = `<span class="text generated-bot-text typing-dots">${resultText} </span>`;
  chatContainer.appendChild(botDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
//Typing Effect
function replaceTypingEffect(botText) {
  const botTextDOM = document.querySelectorAll('.generated-bot-text');
  botTextDOM.forEach((botTextDiv) => {
    if (botTextDiv.innerText === 'Typing...') {
      botTextDiv.classList.remove('typing-dots');
      botTextDiv.innerText = botText;
    }
  });
  //Scroll to the end of chat message
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
