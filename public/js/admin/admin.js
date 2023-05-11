import { handleUserDeleteAndEdit } from './manageUser.js';

const userTabel = document.querySelector('.table-user');

userTabel?.addEventListener('click', handleUserDeleteAndEdit);
