import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51JjmkoJVSMg0D2wqDBM1E21I5KwVT0OWvtrBLO04Oc65RJCzqRVZl46IG89p1CquVa3cCdC03lzr9yWeBfK5zLjf00e3Po0BWS'
  );

  try {
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
