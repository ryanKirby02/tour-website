import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const result = await axios.post('http://127.0.0.1:5000/api/v1/users/signup', {
      name,
      email,
      password,
      confirmPassword,
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Successfully Signed up for an account');
      window.setTimeout(() => {
        location.assign('/profile');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
