/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51Ras4g2Y6ZSvrFp39CWxkgRRBL9DgrvMneVoJ3dKIeUszxo6PPD3rcROsQFdgkqMQzimXTNfZ9WWQLTIgUoMMy5d00nxui5JZa'
); 

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};