import { showProgress, removeProgress } from '../showProgressBtn.js';
import { showAlert } from '../alert.js';
import garbageCollector from './modalEventSetterRemover.js';

const btnDeleteYes = document.querySelector('.btn-delete-yes');
const modalDelete = document.getElementById('deleteModal');

// ------------------------ YES DELETE USER
export async function handleDeleteYes(e) {
  try {
    // Show loading progress btn
    showProgress(btnDeleteYes);

    // delete user
    const response = await axios.delete(
      `/api/v1/${this.urlExtension}/${this.param ? this[this.param] : this._id}`
    );

    // remove event listner

    btnDeleteYes.removeEventListener('click', this.handler);

    // remove progress and show success and also show success alert
    removeProgress(btnDeleteYes, 'Success');
    showAlert('success', 'successfully deleted');

    setTimeout(() => {
      location.reload(true);
      //   btnDeleteYes.innerHTML = 'Yes';
    }, 1500);
  } catch (err) {
    // remove progress
    removeProgress(btnDeleteYes, 'Yes');

    btnDeleteYes.addEventListener('click', this.handler);

    const data = err.response;
    // show alert
    showAlert('danger', data?.message ? data.message : 'Something went wrong.');
    console.log(err);
  }
}

export function handleDocDelete(e, bindOpt) {
  // guard key
  if (!e.target.closest('.btn-delete')) return;

  garbageCollector(modalDelete, {
    bindOpt: bindOpt,
    handler: handleDeleteYes,
    target: btnDeleteYes,
    event: 'click',
  });
}
