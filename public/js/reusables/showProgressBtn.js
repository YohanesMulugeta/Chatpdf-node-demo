export function showProgress(btn, content) {
  // console.log(content);
  btn.setAttribute('disabled', true);
  btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>${
    content ? content : 'Loading...'
  }`;
}

export function removeProgress(btn, innerHTML) {
  btn.innerHTML = innerHTML;
  btn.removeAttribute('disabled');
}
