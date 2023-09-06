import { handleLogin } from './login.js';

const login = document.getElementById('form-login');
login?.addEventListener('submit', handleLogin);
