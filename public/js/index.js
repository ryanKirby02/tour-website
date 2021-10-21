import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import '@babel/polyfill';
import { signup } from './signup';
import { resetUserPassword, sendPasswordReset } from './resetPassword';
import { bookTour } from './stripe';

//DOM EMEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const signupForm = document.querySelector('.form-signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateFormSettings = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const passwordResetForm = document.querySelector('.form-passwordReset');
const forgotPasswordForm = document.querySelector('.form-forgotPassword');
const bookBtn = document.getElementById('book-tour');

//VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    signup(name, email, password, confirmPassword);
  });
}

if (updateFormSettings) {
  updateFormSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);

    updateSettings(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'updating...';

    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm').value;

    await updateSettings({ password, newPassword, confirmNewPassword }, 'password');

    document.querySelector('.btn--save-password').textContent = 'save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (passwordResetForm) {
  passwordResetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = document.querySelector('.btn--new-pass').dataset.token;

    await resetUserPassword(password, confirmPassword, token);
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    await sendPasswordReset(email);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourid } = e.target.dataset;
    bookTour(tourid);
  });
}
