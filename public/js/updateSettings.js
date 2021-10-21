import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const result = await axios.patch(
      `http://127.0.0.1:5000/api/v1/users/${
        type === 'data' ? 'update-profile' : 'update-password'
      }`,
      data
    );
    if (result.data.status === 'success') {
      showAlert('success', 'Successfully updated your settings');
      location.reload;
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
