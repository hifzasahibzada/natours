/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login', // Correct URL
      data: {
        email,    // Correct data being sent
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/'); // Correct redirect
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message); // Correct error handling
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    console.error('Error logging out:', err);
    showAlert('error', 'Error logging out! Try again.');
  }
};