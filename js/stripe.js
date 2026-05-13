/* ============================================================
   STRIPE — paiement
   ============================================================
   Initialises Stripe Elements (deferred mode) on first entry
   to #paiement, updates amount on quantity change, and
   confirms payment on submit. Redirects to /pages/merci.html
   on success.
   ============================================================ */

(function () {
  const PRICE_PER_UNIT_CENTS = 12000;

  let stripe = null;
  let elements = null;
  let initialised = false;

  function getQty() {
    const opt = document.querySelector(
      '[data-paiement-quantity] .select-option[aria-selected="true"]'
    );
    return opt ? parseInt(opt.dataset.value, 10) : 1;
  }

  function getDay() {
    const opt = document.querySelector(
      '[data-paiement-day] .select-option[aria-selected="true"]'
    );
    return opt ? opt.dataset.value : '';
  }

  function getEmail() {
    const el = document.querySelector('[data-paiement-email]');
    return el ? el.value.trim() : '';
  }

  function getName() {
    const el = document.querySelector('[data-paiement-name]');
    return el ? el.value.trim() : '';
  }

  function getAmountCents() {
    return getQty() * PRICE_PER_UNIT_CENTS;
  }

  function initStripe() {
    if (initialised) return;
    if (typeof Stripe === 'undefined') {
      console.error('Stripe.js not loaded.');
      return;
    }
    if (!window.KAJIKI_STRIPE_PK) {
      console.error('Stripe publishable key missing.');
      return;
    }

    initialised = true;
    stripe = Stripe(window.KAJIKI_STRIPE_PK);
    elements = stripe.elements({
      mode: 'payment',
      amount: getAmountCents(),
      currency: 'eur',
      paymentMethodTypes: ['card']
    });

    const paymentElement = elements.create('payment', {
      layout: 'tabs',
      fields: { billingDetails: 'never' }
    });
    paymentElement.mount('#payment-element');

    const qtyEl = document.querySelector('[data-paiement-quantity]');
    if (qtyEl) qtyEl.addEventListener('select:change', updateAmount);
  }

  function updateAmount() {
    if (elements) elements.update({ amount: getAmountCents() });
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault();

    const email = getEmail();
    const name = getName();
    if (!email || !name) {
      alert('Veuillez remplir email et nom.');
      return;
    }

    if (!elements) {
      console.error('Stripe Elements not initialised.');
      return;
    }

    const btn = event && event.currentTarget;
    if (btn) btn.disabled = true;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      if (btn) btn.disabled = false;
      console.error(submitError);
      return;
    }

    let clientSecret;
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: getQty(),
          pickup_day: getDay(),
          email,
          name
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      clientSecret = data.client_secret;
    } catch (err) {
      if (btn) btn.disabled = false;
      console.error('Server error:', err);
      alert('Une erreur est survenue. Veuillez réessayer.');
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/pages/merci.html',
        payment_method_data: { billing_details: { email, name } }
      }
    });

    if (error) {
      if (btn) btn.disabled = false;
      console.error(error);
      alert(error.message || 'Le paiement a échoué.');
    }
  }

  function init() {
    const trigger = document.querySelector('a[href="#paiement"]');
    if (trigger) trigger.addEventListener('click', initStripe);
    if (window.location.hash === '#paiement') initStripe();

    const submitBtn = document.querySelector('.paiement-form .button--full');
    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
