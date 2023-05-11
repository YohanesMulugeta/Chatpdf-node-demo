import { handleLogin, handleLogout } from './login.js';
import handleSignup from './signup.js';
import handleForgot from './forgotPassowrd.js';
import handleUpdateMe from './updateMe.js';
import handleUpdatePassword from './updatePassword.js';
import { analyzePdf, checkReference } from './DocAnalyzer.js';
import handleGetStarted from './checkout.js';

const formAnalyser = document.getElementById('analyser-form');
const formChecker = document.getElementById('checker-form');
const signup = document.querySelector('.signup-form');
const login = document.querySelector('.login-form');
const logout = document.querySelector('.btn-logout');
const forgotPassword = document.getElementById('forgot-password');
const passowrd = document.getElementById('password-container');
const updateMe = document.getElementById('form-updateMe');
const updatePassword = document.getElementById('form-updatePassword');

const btnLoginNow = document.querySelector('.btn-loginnow');

// Pricing section
const sectionPricing = document.querySelector('.section-pricing');

login?.addEventListener('submit', handleLogin);
logout?.addEventListener('click', handleLogout);
signup?.addEventListener('submit', handleSignup);
formAnalyser?.addEventListener('submit', analyzePdf);
formChecker?.addEventListener('submit', checkReference);
updateMe?.addEventListener('submit', handleUpdateMe);
updatePassword?.addEventListener('submit', handleUpdatePassword);
sectionPricing?.addEventListener('click', handleGetStarted);

forgotPassword?.addEventListener('click', (e) => {
  e.preventDefault();
  passowrd.remove();
  forgotPassword.remove();
  btnLoginNow.textContent = 'Send Reset Link';

  // romobing already existing event with new one
  login.removeEventListener('submit', handleLogin);
  login.addEventListener('submit', handleForgot);
});
