import { showProgress, removeProgress } from '../reusables/showProgressBtn.js';
import { showAlert } from '../reusables/alert.js';
import showError from '../reusables/showError.js';
import garbageCollector from './modalEventSetterRemover.js';
import { handleSaveChanges } from './manageUser.js';

const btnDisable = document.querySelector('.btn-disable');
const disableModal = document.getElementById('disableSubModal');
const editModal = document.querySelector('.edit-plans');
const btnSave = editModal?.querySelector('.btn-save');
const planForm = document.getElementById('formPlans');
const nameIn = planForm?.querySelector('#name');
const priceIn = planForm?.querySelector('#price');
const conversationTokensIn = planForm?.querySelector('#conversationTokenLimit');
const uploadTokenIn = planForm?.querySelector('#uloadTokenLimit');
const maxChatIn = planForm?.querySelector('#maxChats');

const planTitle = editModal?.querySelector('#edit-title');

async function handleEdit(e) {
  try {
    e.preventDefault();

    const name = nameIn.value.trim() ? nameIn.value.trim() : this.name;
    const price = priceIn.value.trim() ? +priceIn.value.trim() : this.price;

    showProgress(btnSave);

    await axios.patch(`/api/v1/plans/${this.name}`, {
      name,
      price,
    });

    removeProgress(btnSave, 'Updated Successfully');
    showAlert('success', 'Plan update successful');

    setTimeout(() => {
      location.reload(true);
    }, 1500);
  } catch (err) {
    const data = err.response?.data;

    showAlert(
      'danger',
      data ? data.message : 'Something went wrong on trying to update plan.'
    );
    removeProgress(btnSave, 'Save Changes');

    console.log(err);
  }
}

async function handleDisable(e) {
  try {
    showProgress(btnDisable);
    await axios.patch(`/api/v1/plans/${this._id}`, { enabled: !this.enabled });
    removeProgress(btnDisable, 'Updated');
    showAlert('success', 'Plan updated successful');

    setTimeout(() => {
      location.reload(true);
    }, 1500);
  } catch (err) {
    showError(err, btnDisable, 'Yes');
  }
}

export async function handlePlanEdition(e) {
  // Guard key
  if (!e.target.closest('.btn-edit') && !e.target.closest('.btn-disable')) return;

  const plan = JSON.parse(e.target.closest('.plan').dataset.plan);

  if (e.target.closest('.btn-disable')) {
    document.querySelector('.modal-title--disable').textContent = `${
      plan.enabled ? 'DISABLE' : 'ENABLE'
    } SUBSCRIPTION: ${plan.name}`;
    document.querySelector('.modal-desc--disable').textContent = `Are you sure want to ${
      plan.enabled ? 'disable' : 'enable'
    } the Subscription: ${plan.name.slice(0, 1).toUpperCase() + plan.name.slice(1)}`;

    garbageCollector(disableModal, {
      bindOpt: { ...plan },
      target: btnDisable,
      event: 'click',
      handler: handleDisable,
    });

    return;
  }

  nameIn.value = plan.name;
  priceIn.value = plan.price;
  maxChatIn.value = plan.maxChats;
  conversationTokensIn.value = plan.conversationTokenLimit;
  uploadTokenIn.value = plan.uloadTokenLimit;

  planTitle.textContent = `EDIT SUBSCRIPTION: ${
    plan.name.slice(0, 1).toUpperCase() + plan.name.slice(1)
  }`;

  //  passing the plan as the this key word
  garbageCollector(editModal, {
    target: planForm,
    bindOpt: { ...plan, endpoint: `/api/v1/plans/${plan._id}` },
    handler: handleSaveChanges,
    event: 'click',
  });
}
