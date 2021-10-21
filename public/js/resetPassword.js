import axios from 'axios';
import { showAlert } from './alerts';

export const resetUserPassword = async (password, confirmPassword, token) => {
  try {
    const result = await axios.patch(`/api/v1/users/reset-password/${token}`, {
      password,
      confirmPassword,
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Successfully reset your password.');

      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const sendPasswordReset = async (email) => {
  try {
    const result = await axios.post(`/api/v1/users/forgot-password`, {
      email,
    });
    if (result.data.status === 'success') {
      showAlert('success', `an email sent to the inbox of ${email}`);

      window.setTimeout(() => {
        location.assign('/login');
      }, 3000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
