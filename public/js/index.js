/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe'; 
import { showAlert } from './alert';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour'); 

// Delegate events
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('Login form submitted! Attempting to send request...');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// Event listener for logout button
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

// MODIFIED: User Data Update Logic
if (userDataForm) {
  userDataForm.addEventListener('submit', async e => { // MODIFIED: Added 'async'
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    // NEW: Pass the FormData object to updateSettings
    await updateSettings(form, 'data'); // Pass the 'form' object
  });
}

// MODIFIED: User Password Update Logic (completely rewritten from your previous version)
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => { // MODIFIED: Added 'async'
    e.preventDefault();

    // NEW: Select the button and change its text for feedback
    const passwordButton = document.querySelector('.btn--save-password'); // Select the button
    if (passwordButton) { // Ensure button exists before trying to change text
      passwordButton.textContent = 'Updating...'; // Change button text
    }

    // NEW: Get the password values from the input fields
    const passwordCurrent = userPasswordForm.querySelector('#password-current').value;
    const password = userPasswordForm.querySelector('#password-new').value;
    const passwordConfirm = userPasswordForm.querySelector('#password-new-confirm').value;

    // MODIFIED: Call updateSettings with password data and type 'password'
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    // NEW: Reset button text after the API call is finished
    if (passwordButton) { // Ensure button exists before trying to reset text
      passwordButton.textContent = 'Save password'; // Reset button text
    }

    // NEW: Clear password fields after successful update
    userPasswordForm.querySelector('#password-current').value = '';
    userPasswordForm.querySelector('#password-new').value = '';
    userPasswordForm.querySelector('#password-new-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

/*//For Stripe implementation
// Alert message display (ADD THIS BLOCK)
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20); // Show for 20 seconds*/