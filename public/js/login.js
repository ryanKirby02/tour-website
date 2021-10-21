import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const result = await axios.post('http://127.0.0.1:5000/api/v1/users/login', {
      email,
      password,
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Logged In Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/v1/users/logout');
    if (res.data.status === 'success') {
      await location.reload(true);
      location.assign('/');
    }
  } catch (error) {
    showAlert('error', 'There was an error logging you out, please try again.');
  }
};
