import { handleUserDeleteAndEdit } from './manageUser.js';
import { handlePlanEdition } from './managePlans.js';

const planTable = document.getElementById('table-plans');
const userTabel = document.querySelector('.table-user');

userTabel?.addEventListener('click', handleUserDeleteAndEdit);
planTable?.addEventListener('click', handlePlanEdition);
