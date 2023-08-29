import { showProgress, removeProgress } from '../reusables/showProgressBtn.js';
import { showAlert } from '../reusables/alert.js';
import { handleDocDelete } from './handleDeleteYes.js';
import showError from '../reusables/showError.js';
import garbageCollector from './modalEventSetterRemover.js';

const modalDelete = document.getElementById('deleteModal');
const modalTitle = modalDelete?.querySelector('.modal-title');
const modalDescription = modalDelete?.querySelector('.modal-description');

// console.log(document.querySelector('.btn-delete-yes'));

const formEditUser = document.querySelector('.form-edit-user');
const modalEditUser = document.querySelector('.modal-edit-user');
const modalEditTitle = modalEditUser?.querySelector('.modal-title');
const emailIn = modalEditUser?.querySelector('#email');
const planIn = modalEditUser?.querySelector('#plan');
const conversationalTokenIn = modalEditUser?.querySelector('#conversationTokens');
const uploadTokenIn = modalEditUser?.querySelector('#uploadTokens');
const emailVerifiedIn = modalEditUser?.querySelector('#emailVerified');

const nameIn = modalEditUser?.querySelector('#name');
const roleIn = modalEditUser?.querySelector('#role');

// ------------------------------ EDIT USER
export async function handleSaveChanges(e) {
  try {
    e.preventDefault();
    if (!e.target.closest('.btn-update-input')) return;

    const inputField = e.target
      .closest('.update-input-container')
      ?.querySelector('.form-control');
    const inputFieldId = inputField.id;
    const inputFieldValue =
      inputFieldId === 'emailVerified'
        ? inputField.value === 'false'
          ? false
          : true
        : inputField.value;

    showProgress(e.target, ' ');

    const updated = await axios.patch(this.endpoint, {
      [inputFieldId]: inputFieldValue,
    });

    // show success alert and remobe the progress button
    showAlert('success', 'Update Successful');
    removeProgress(e.target, `<i class="bi bi-check-circle"></i>`);
    e.target.classList.remove('btn-primary');
    e.target.style.backgroundColor = '#51cf66';
    e.target.style.color = '#fff';

    // Remove the green
    setTimeout(() => {
      e.target.classList.add('btn-primary');
      e.target.innerHTML = 'Update';
    }, 3000);
  } catch (err) {
    showError(err, e.target, 'Update');
  }
}

// ------------------------------------ DELETE and EDIT USER
export function handleUserDeleteAndEdit(e) {
  // guard key
  if (!e.target.closest('.btn-delete') && !e.target.closest('.btn-edit')) return;

  // getting the user object
  const user = JSON.parse(e.target.closest('.user').dataset.user);

  if (e.target.closest('.btn-delete')) {
    // // Including the user full name and user name in the modal
    modalTitle.innerHTML = `DELETE USER: ${user.name}`;
    modalDescription.innerHTML = `Are you sure want to delete the user: ${user.name} ?`;

    return handleDocDelete(e, { ...user, urlExtension: 'users' });
  }

  modalEditTitle.innerHTML = `Edit User: ${user.name}`;
  nameIn.value = user.name;
  emailVerifiedIn.value = user.emailVerified === false ? 'false' : 'true';
  emailIn.value = user.email;
  planIn.value = user.subscription.name;
  roleIn.value = user.role;
  conversationalTokenIn.value = user.conversationTokens.toFixed(0);
  uploadTokenIn.value = user.uploadTokens.toFixed(0);

  // use garbage collector
  garbageCollector(modalEditUser, {
    bindOpt: { ...user, endpoint: `/api/v1/users/${user._id}` },
    target: formEditUser,
    handler: handleSaveChanges,
    event: 'click',
  });
}
