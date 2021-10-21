import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const result = await axios.patch(
      `/api/v1/users/${
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
