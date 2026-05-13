/* ============================================================
   STRIPE — paiement
   ============================================================
   Mounts individual cardNumber / cardExpiry / cardCvc elements
   (styled to match the design system) on first entry to
   #paiement. Confirms payment on submit via confirmCardPayment,
   then redirects to /pages/merci.html on success.
   ============================================================ */

(function () {
  let stripe      = null;
  let cardNumber  = null;
  let cardExpiry  = null;
  let cardCvc     = null;
  let initialised = false;

  function getQty() {
    const opt = document.querySelector('[data-paiement-quantity] .select-option[aria-selected="true"]');
    return opt ? parseInt(opt.dataset.value, 10) : 1;
  }

  function getDay() {
    const opt = document.querySelector('[data-paiement-day] .select-option[aria-selected="true"]');
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

  function initStripe() {
    if (initialised) return;
    if (typeof Stripe === 'undefined') { console.error('Stripe.js not loaded.'); return; }
    if (!window.KAJIKI_STRIPE_PK)     { console.error('Stripe publishable key missing.'); return; }

    initialised = true;
    stripe = Stripe(window.KAJIKI_STRIPE_PK);

    const root         = getComputedStyle(document.documentElement);
    const fontSize     = root.getPropertyValue('--text-body').trim()          || '10px';
    const letterSpacing = root.getPropertyValue('--letter-spacing-text').trim() || '0.03em';

    const cardStyle = {
      base: {
        fontFamily:    "'Inter', Helvetica, sans-serif",
        fontSize:      fontSize,
        fontWeight:    '200',
        color:         'rgb(17,17,17)',
        letterSpacing: letterSpacing,
        '::placeholder': { color: 'rgba(17,17,17,0.7)' },
      },
      invalid: {
        color:     'rgb(17,17,17)',
        iconColor: 'rgba(17,17,17,0.4)',
      },
    };

    const elements = stripe.elements();

    cardNumber = elements.create('cardNumber', { style: cardStyle, showIcon: false, disableLink: true, placeholder: 'No. de carte' });
    cardExpiry = elements.create('cardExpiry', { style: cardStyle, placeholder: 'MM / AA' });
    cardCvc    = elements.create('cardCvc',    { style: cardStyle, placeholder: 'CVC' });

    cardNumber.mount('#card-number-element');
    cardExpiry.mount('#card-expiry-element');
    cardCvc.mount('#card-cvc-element');
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault();

    const email = getEmail();
    const name  = getName();
    if (!email || !name) { alert('Veuillez remplir email et nom.'); return; }
    if (!cardNumber)      { console.error('Stripe not initialised.'); return; }

    const btn = event && event.currentTarget;
    if (btn) btn.disabled = true;

    let clientSecret;
    try {
      const res  = await fetch('/api/create-payment-intent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ quantity: getQty(), pickup_day: getDay(), email, name }),
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

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumber, billing_details: { name, email } },
    });

    if (error) {
      if (btn) btn.disabled = false;
      console.error(error);
      alert(error.message || 'Le paiement a échoué.');
      return;
    }

    window.location.href = '/pages/merci.html';
  }

  function init() {
    window.addEventListener('hashchange', function () {
      if (window.location.hash === '#paiement') initStripe();
    });
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
