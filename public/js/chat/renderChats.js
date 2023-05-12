const sideBar = document.querySelector('.chat-column-left-row-one');

export default function renderChats(e) {
  const chats = localStorage.getItem('chatsChatpdf');
  if (!chats) return;

  const parsed = Object.entries(JSON.parse(chats));

  parsed.sort((a, b) => a[1].lastUpdatedDate - b[1].lastUpdatedDate);

  parsed.forEach((chat) => {
    sideBar.insertAdjacentHTML(
      'beforeend',
      `<button data-docName=${chat[0]} class='btn-sample-pdf btn btn-primary btn-chat'>
        <i class='bi bi-file-earmark-pdf'>${chat[1].chatTitle}</i>
      </button>`
    );
  });
}
