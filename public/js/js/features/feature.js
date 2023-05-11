// import generateText from "../fetch.js";

// class Feature {
//   constructor(promptTemplate, featureId) {
//     this.promptTemplate = promptTemplate;
//     this.featureForm = document.getElementById(featureId);
//     this.resultDisplay = document.getElementById("output");
//   }

//   // ----------------------- check for empity fields
//   isThereEmptyInputField() {
//     // checking for impity input fields
//     for (const field of this.featureForm.querySelectorAll("input"))
//       if (field.value.trim() === "") return true;

//     for (const area of this.featureForm.querySelectorAll("textarea"))
//       if (area.value.trim() === "") return true;

//     // no Empty input field
//     return false;
//   }

//   //   Create Prompt message
//   createPrompt() {
//     let newPrompt = this.promptTemplate;

//     // replace input fields value place holder
//     this.featureForm.querySelectorAll("input").forEach((inp, i) => {
//       newPrompt = newPrompt.replace(`<INPUT${i + 1}>`, inp.value);
//     });

//     // replace TEXTAREA place holders
//     this.featureForm.querySelectorAll("textarea").forEach((tex, i) => {
//       newPrompt = newPrompt.replace(`<TEXTAREA${i + 1}>`, tex.value);
//     });

//     return newPrompt;
//   }

//   // Copy to clip
//   renderCopyBtn() {
//     const copyBtn = this.resultDisplay.querySelector(".copy");

//     copyBtn?.addEventListener("click", (e) => {
//       e.preventDefault();

//       const text = document.getElementById("text-to-copy").innerText;

//       navigator.clipboard.writeText(text);

//       copyBtn.innerHTML = '<i class="bi bi-clipboard2-check-fill"></i>Copied!';
//     });
//   }

//   //  ----------------------- Display result
//   removeAndDisplayResult(message) {
//     this.resultDisplay.querySelector("p")?.remove();
//     this.resultDisplay.querySelector(".result-section")?.remove();

//     this.resultDisplay.insertAdjacentHTML(
//       "beforeEnd",
//       `<div class='result-section'>${message}</div>`
//     );

//     this.renderCopyBtn();
//   }

//   // --------------------- generate texxt
//   async generateText(e) {
//     try {
//       e.preventDefault();

//       // check for empiy fields
//       if (this.isThereEmptyInputField()) {
//         this.removeAndDisplayResult(
//           `<p class="alert alert-danger"><i class="bi bi-exclamation-circle"></i> Please Enter The required Data before submit!</p>`
//         );
//         return;
//       }

//       //  Display Lodding
//       this.removeAndDisplayResult(
//         "<p class='alert alert-info'>Loading..... Please Wait!"
//       );

//       // Create Prompt
//       const prompt = this.createPrompt();

//       // generate text}
//       const data = await generateText(prompt);

//       const formatedText = window
//         .markdownit()
//         .render(data.data.choices[0].text);
//       // Display the result
//       this.removeAndDisplayResult(
//         `<div class="grid"><button class="copy btn btn-primary"><i class="bi bi-clipboard2"></i>Copy Text</button> <div id="text-to-copy" class="mt-4">${formatedText}</div></div>`
//       );
//     } catch (err) {
//       // Display Error Message
//       this.removeAndDisplayResult(
//         `<p class="alert alert-danger"><i class="bi bi-exclamation-circle"></i>${
//           err.response?.data?.status === "Fail"
//             ? err.response.data.message
//             : "Something went wrong. Please try again."
//         }</p>`
//       );
//     }
//   }
// }

// export default Feature;
