/* ============================================================
   PAYMENT
   ============================================================
   Recomputes the displayed total when the quantity changes.
   Price is read from window.KAJIKI_SERIE_READY (serie.js).
   ============================================================ */

(function () {

  // Show/hide the payment screen
  var paymentScreen = document.getElementById('payment');
  var openTrigger   = document.querySelector('a[href="#payment"]');
  var closeTrigger  = document.querySelector('.payment-close');

  if (paymentScreen && openTrigger) {
    openTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      paymentScreen.classList.add('is-open');
      paymentScreen.dispatchEvent(new CustomEvent('payment:open'));
      requestAnimationFrame(function () {
        paymentScreen.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  if (paymentScreen && closeTrigger) {
    closeTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      paymentScreen.classList.remove('is-open');
      var retrait = document.getElementById('retrait');
      if (retrait) retrait.scrollIntoView({ behavior: 'smooth' });
    });
  }

  var PRICE_PER_UNIT = 0;

  const quantityEl = document.querySelector("[data-payment-quantity]");
  const dayEl      = document.querySelector("[data-payment-day]");
  const totalEl    = document.querySelector("[data-payment-total]");
  const detailEl   = document.querySelector("[data-payment-detail]");

  if (!quantityEl || !dayEl || !totalEl || !detailEl) return;

  function getQuantity() {
    const selected = quantityEl.querySelector(".select-option[aria-selected='true']");
    return selected ? parseInt(selected.dataset.value, 10) : 1;
  }

  function getDayFullLabel() {
    const selected = dayEl.querySelector(".select-option[aria-selected='true']");
    return selected ? (selected.dataset.fullLabel || selected.textContent) : '';
  }

  function getDayWindow() {
    const selected = dayEl.querySelector(".select-option[aria-selected='true']");
    if (!selected || !window.KAJIKI_SERIE) return '';
    const day = window.KAJIKI_SERIE.pickup.days.find(function (d) {
      return d.value === selected.dataset.value;
    });
    return day ? (day.window || '') : '';
  }

  function renderTotal() {
    totalEl.textContent = (getQuantity() * PRICE_PER_UNIT) + "€";
  }

  function renderDetail() {
    const qty     = getQuantity();
    const plateau = qty === 1 ? 'plateau' : 'plateaux';
    const label   = getDayFullLabel().toLowerCase();
    const window  = getDayWindow();
    const tail    = window ? ', entre ' + window : '';
    detailEl.innerHTML = qty + ' ' + plateau + '.<br>À retirer le ' + label + tail + '.';
  }

  quantityEl.addEventListener("select:change", renderTotal);
  quantityEl.addEventListener("select:change", renderDetail);
  dayEl.addEventListener("select:change", renderDetail);

  (window.KAJIKI_SERIE_READY || Promise.resolve(null))
    .then(function (data) {
      if (data) PRICE_PER_UNIT = Math.round(data.series.price_per_unit_cents / 100);
      renderTotal();
      renderDetail();
    });
})();
