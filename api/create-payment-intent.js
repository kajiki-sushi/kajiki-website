/* ============================================================
   POST /api/create-payment-intent
   ============================================================
   Receives quantity, pickup_day, email, name from the form.
   Creates a Stripe PaymentIntent with all metadata required
   for the email + Airtable record (forwarded via webhook).
   Returns { client_secret } for the front-end to confirm.
   ============================================================ */

const Stripe = require('stripe');
const serie = require('../data/serie.json');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not set in environment variables' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { quantity, pickup_day, email, name } = req.body || {};

    if (!quantity || !pickup_day || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > serie.series.max_quantity_per_order) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const pickupDay = serie.pickup.days.find(d => d.value === pickup_day);
    if (!pickupDay) {
      return res.status(400).json({ error: 'Invalid pickup day' });
    }

    const amountCents = qty * serie.series.price_per_unit_cents;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        series_name: serie.series.name,
        quantity: String(qty),
        pickup_day_short: pickupDay.label,
        pickup_day_full: pickupDay.full_label,
        pickup_window: serie.pickup.window,
        pickup_location: serie.pickup.location,
        customer_name: name,
        customer_email: email
      }
    });

    return res.status(200).json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error('PaymentIntent error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};
