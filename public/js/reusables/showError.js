import { showAlert } from './alert.js';
import { removeProgress } from './showProgressBtn.js';

export default function (err, btn, btnContent) {
  const data = err.response?.data;

  showAlert('danger', data ? data.message : 'Something went wrong. Please try again!');

  console.log(err);

  removeProgress(btn, btnContent);
}
