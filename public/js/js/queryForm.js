import generateText from './fetch.js';

const featureForm = document.getElementById('generate-form');
const resultDisplay = document.getElementById('output');

function renderCopyBtn() {
  const copyBtn = resultDisplay.querySelector('.copy');

  copyBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    const text = document.getElementById('text-to-copy').innerText;

    navigator.clipboard.writeText(text);

    copyBtn.innerHTML = '<i class="bi bi-clipboard2-check-fill"></i>Copied!';
  });
}

function createPrompt() {
  let newPrompt = this.promptTemplate;

  // replace input fields value place holder
  featureForm.querySelectorAll('input').forEach((inp, i) => {
    newPrompt = newPrompt.replace(`INPUT${i + 1}`, inp.value);
  });

  // replace TEXTAREA place holders
  featureForm.querySelectorAll('textarea').forEach((tex, i) => {
    newPrompt = newPrompt.replace(`TEXTAREA${i + 1}`, tex.value);
  });

  return newPrompt;
}

// result renderer
function removeAndDisplayResult(message) {
  resultDisplay.querySelector('p')?.remove();
  resultDisplay.querySelector('.result-section')?.remove();

  resultDisplay.insertAdjacentHTML(
    'beforeEnd',
    `<div class='result-section'>${message}</div>`
  );

  renderCopyBtn();
}

// Check for enpity enput field
function isThereEmptyInputField() {
  // checking for impity input fields
  for (const field of featureForm.querySelectorAll('input'))
    if (field.value.trim() === '') return true;

  for (const area of featureForm.querySelectorAll('textarea'))
    if (area.value.trim() === '') return true;

  // no Empty input field
  return false;
}

export default async function (e) {
  try {
    e.preventDefault();

    // PARSE FEATURE DATA
    const feature = JSON.parse(e.target.dataset.feature);

    // CHECK FOR EMPITY FIELDS
    if (isThereEmptyInputField()) {
      removeAndDisplayResult(
        `<p class="alert alert-danger"><i class="bi bi-exclamation-circle"></i> Please Enter The required Data before submit!</p>`
      );
      return;
    }

    // SHOW LOADING
    removeAndDisplayResult("<p class='alert alert-info'>Loading..... Please Wait!");

    // CREATE PROMPT
    const prompt = createPrompt.bind(feature)();

    // GENERATE TEXT
    const data = await generateText(prompt);

    // FOTMATE TEXT
    const formatedText = window.markdownit().render(data.data.choices[0].text);

    // Display the result
    removeAndDisplayResult(
      `<div class="grid"><button class="copy btn btn-primary"><i class="bi bi-clipboard2"></i>Copy Text</button> <div id="text-to-copy" class="mt-4">${formatedText}</div></div>`
    );
  } catch (err) {
    removeAndDisplayResult(
      `<p class="alert alert-danger"><i class="bi bi-exclamation-circle"></i>${
        err.response?.data?.status === 'Fail'
          ? err.response.data.message
          : 'Something went wrong. Please try again.'
      }</p>`
    );
  }
}
