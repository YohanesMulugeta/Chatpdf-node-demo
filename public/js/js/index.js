import { handleLogin, handleLogout } from './login.js';
import handleSignup from '../signup.js';
import handleUpdateMe from '../updateMe.js';
import handleUpdatePassword from '../updatePassword.js';
import handleForgot from '../forgotPassowrd.js';
import handleGenerate from './queryForm.js';

const login = document.querySelector('.login-form');
const signup = document.querySelector('.signup-form');
const logout = document.querySelector('.btn-logout');
const updateMe = document.getElementById('form-updateMe');
const updatePassword = document.getElementById('form-updatePassword');
const forgotPassword = document.getElementById('forgot-password');
const remember = document.getElementById('remember-container');
const passowrd = document.getElementById('password-container');
const btnLoginNow = document.querySelector('.btn-loginnow');
const queryForm = document.getElementById('generate-form');

const blogContent = document.getElementById('blog-content');

login?.addEventListener('submit', handleLogin);
logout?.addEventListener('click', handleLogout);
signup?.addEventListener('submit', handleSignup);
updateMe?.addEventListener('submit', handleUpdateMe);
updatePassword?.addEventListener('submit', handleUpdatePassword);
forgotPassword?.addEventListener('click', (e) => {
  e.preventDefault();
  remember.remove();
  passowrd.remove();
  forgotPassword.remove();
  btnLoginNow.textContent = 'Send Reset Link';

  // romobing already existing event with new one
  login.removeEventListener('submit', handleLogin);
  login.addEventListener('submit', handleForgot);
});

queryForm?.addEventListener('submit', handleGenerate);

blogContent && (blogContent.innerHTML = blogContent.textContent);
