// import showError from './admin/showError.js';
// import { showProgress } from './showProgressBtn.js';

import { showAlert } from './alert.js';

// console.log('script start');

// // SELECT PAYpay btn
const pricingCardContainer = document.querySelector('.pricing-card-container');
const modalPay = document.getElementById('modal-pay');
let paypalContainer = document.getElementById('paypal-button-container');
const btnPaypal = document.querySelector('.btn-paypal');

// // baseurl: /checkout-session/paypal/planId
const baseurl = '/api/v1/plans/checkout-session';

// // Listen to events on getstarted buttons
pricingCardContainer.addEventListener('click', (e) => {
  if (!e.target.closest('.btn-get-started')) return;
  const planId = e.target.closest('.plan-card').dataset.planId;

  paypal
    .Buttons({
      // Order is created on the server and the order id is returned
      createOrder() {
        return fetch(`${baseurl}/paypal/${planId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // use the "body" param to optionally pass additional order information
          // like product skus and quantities
          body: JSON.stringify({
            planId,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((order) => order.id);
      },
      // Finalize the transaction on the server after payer approval
      onApprove(data) {
        return fetch(`${baseurl}/excute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderID: data.orderID,
          }),
        })
          .then((response) => response.json())
          .then((orderData) => {
            {
              if (orderData.status === 'Error')
                showAlert(
                  'danger',
                  `${JSON.parse(orderData.message)
                    .name.split('_')
                    .join(' ')}. Please try again!`
                );
            }

            const successStr = `<h4> Purchase of ${orderData.plan.name.toUpperCase()} subscription is successfull, Now you can enjoy your ${
              orderData.plan.name === 'diamond'
                ? 'unlimited subscription'
                : new Intl.NumberFormat().format(orderData.plan.wordsLimit)
            } for a month</h4>`;

            showAlert('success', successStr);
            setTimeout(() => {
              location.assign(orderData.redirectUrl);
            }, 3000);
          });
      },
    })
    .render('#paypal-button-container');
});

// RESET THE PAY PAL BUTTON
modalPay.addEventListener('hide.bs.modal', (e) => {
  btnPaypal.removeChild(paypalContainer);
  btnPaypal.insertAdjacentHTML('beforeend', '<div id="paypal-button-container"><div/>');
  paypalContainer = document.getElementById('paypal-button-container');
});
