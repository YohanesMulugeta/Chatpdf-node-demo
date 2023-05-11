import { showProgress, removeProgress } from '../showProgressBtn.js';
import { showAlert } from '../alert.js';
import { handleDocDelete } from './handleDeleteYes.js';
import showError from '../showError.js';
import garbageCollector from './modalEventSetterRemover.js';

const modalDelete = document.getElementById('deleteModal');
const modalTitle = modalDelete?.querySelector('.modal-title');
const modalDescription = modalDelete?.querySelector('.modal-description');

// console.log(document.querySelector('.btn-delete-yes'));

const formEditUser = document.querySelector('.form-edit-user');
const modalEditUser = document.querySelector('.modal-edit-user');
const modalEditTitle = modalEditUser?.querySelector('.modal-title');
const emailIn = modalEditUser?.querySelector('#email');
const passwordIn = modalEditUser?.querySelector('#password');
const planIn = modalEditUser?.querySelector('#plan');

const nameIn = modalEditUser?.querySelector('#name');
const roleIn = modalEditUser?.querySelector('#role');

const btnSaveChanges = modalEditUser?.querySelector('.btn-save-changes');

// ------------------------------ EDIT USER
async function handleSaveChanges(e) {
  try {
    e.preventDefault();

    const email = emailIn.value.trim() ? emailIn.value.trim() : this.email;
    const name = nameIn.value.trim() ? nameIn.value.trim() : this.name;
    const password = passwordIn.value.trim() ? passwordIn.value.trim() : undefined;
    const role = roleIn.value.trim() ? roleIn.value.trim().toLowerCase() : this.role;
    const plan = planIn.value.trim() ? planIn.value.trim() : this.paln;

    // show progress btn
    showProgress(btnSaveChanges);

    const updated = await axios.patch(`/api/v1/users/${this._id}`, {
      email,
      plan,
      name,
      password,
      role,
    });

    formEditUser.removeEventListener('submit', this.handler);

    // show success alert and remobe the progress button
    showAlert('success', 'Update Successful');
    removeProgress(btnSaveChanges, 'Successfuly updated');

    // Reload after some time
    setTimeout(() => {
      location.reload(true);
    }, 3000);
  } catch (err) {
    showError(err, btnSaveChanges, 'Save Changes');
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
  emailIn.value = user.email;
  planIn.value = user.subscription.name;
  roleIn.value = user.role;

  // use garbage collector
  garbageCollector(modalEditUser, {
    bindOpt: { ...user },
    target: formEditUser,
    handler: handleSaveChanges,
    event: 'submit',
  });
}
