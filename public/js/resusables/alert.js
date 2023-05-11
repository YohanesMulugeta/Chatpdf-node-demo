/* eslint-disable */
export const removeAlert = () => {
  document.querySelector('.alert-custom')?.remove();
};

export const showAlert = (type, message) => {
  removeAlert();
  const markup = `
            <div class="alert alert-custom fixed alert-${type} d-flex align-items-center" role="alert">
              <svg
                class="bi flex-shrink-0 me-2"
                width="24"
                height="24"
                role="img"
                aria-label=${
                  type === 'primary'
                    ? 'info'
                    : type.slice(0, 1).toUpperCase() + type.slice(1)
                }
              >
                <use xlink:href=${
                  type === 'primary'
                    ? '#info-fill'
                    : type === 'danger'
                    ? '#exclamation-triangle-fill'
                    : '#check-circle-fill'
                } />
              </svg>
              <div>${message}</div>
          </div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(() => {
    removeAlert();
  }, 10000);
};
