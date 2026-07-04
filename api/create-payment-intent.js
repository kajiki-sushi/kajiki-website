/* ============================================================
   POST /api/create-payment-intent
   ============================================================
   Receives quantity, pickup_day, email, name from the form.
   Creates a Stripe PaymentIntent with all metadata required
   for the email + Airtable record (forwarded via webhook).
   Returns { client_secret } for the front-end to confirm.

   Guards (in order):
     1. Origin allowlist           — blocks naive curl spam
     2. preorder_deadline_iso      — auto cutoff at timestamp
     3. quantity + pickup_day      — input validation
     4. email format               — basic regex
     5. inventory cap              — sums succeeded intents for this
                                     series, refuses if next order
                                     would exceed max_total_quantity
   ============================================================ */

const Stripe = require('stripe');
const serie  = require('../data/serie.json');

const ALLOWED_ORIGINS = [
  'https://kajiki.fr',
  'https://www.kajiki.fr',
  'http://localhost:3000'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPastDeadline(series) {
  if (!series.preorder_deadline_iso) return false;
  return Date.now() >= new Date(series.preorder_deadline_iso).getTime();
}

async function getCommittedQuantityForDay(stripe, seriesName, pickupDayShort) {
  const intents = await stripe.paymentIntents.list({ limit: 100 });
  return intents.data
    .filter(p =>
      p.status === 'succeeded' &&
      p.metadata &&
      p.metadata.series_name === seriesName &&
      p.metadata.pickup_day_short === pickupDayShort
    )
    .reduce((sum, p) => sum + parseInt(p.metadata.quantity || '0', 10), 0);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin || '';
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  if (isPastDeadline(serie.series)) {
    return res.status(403).json({ error: 'Date limite dépassée' });
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
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > serie.series.max_quantity_per_order) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const pickupDay = serie.pickup.days.find(d => d.value === pickup_day);
    if (!pickupDay) {
      return res.status(400).json({ error: 'Invalid pickup day' });
    }

    if (pickupDay.max_quantity) {
      const sold = await getCommittedQuantityForDay(stripe, serie.series.name, pickupDay.label);
      if (sold + qty > pickupDay.max_quantity) {
        return res.status(403).json({ error: 'Jour complet' });
      }
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
        pickup_window: pickupDay.window,
        pickup_location_html: serie.pickup.location_html,
        pickup_location_link: serie.pickup.location_link,
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
