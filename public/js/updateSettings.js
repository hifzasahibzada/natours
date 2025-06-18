// public/js/updateSettings.js

/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// Changed function name from updateData to updateSettings
// Now accepts 'data' (an object) and 'type' (a string: 'password' or 'data')
export const updateSettings = async (data, type) => { // MODIFIED: Function signature
  try {
    const url = // NEW: Ternary operator for URL based on type
      type === 'password'
        ? '/api/v1/users/updateMyPassword' // For password updates
        : '/api/v1/users/updateMe'; // For data updates

    const res = await axios({
      method: 'PATCH', // MODIFIED: Method is PATCH for both
      url, // MODIFIED: Use dynamic URL
      data // MODIFIED: Directly pass the data object
    });

    if (res.data.status === 'success') {
      // MODIFIED: Dynamic success message
      showAlert('success', `${type.toUpperCase()} updated successfully!`); // Convert type to uppercase
      window.setTimeout(() => {
        location.reload(true); // Reload the page after success
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};