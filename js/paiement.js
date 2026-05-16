/* ============================================================
   PAIEMENT
   ============================================================
   Recomputes the displayed total when the quantity changes.

   PRICE_PER_UNIT will move into the centralized série data
   (alongside archive + active série) in a later pass.
   ============================================================ */

(function () {

  // Show/hide the paiement screen
  var paiementScreen = document.getElementById('paiement');
  var openTrigger    = document.querySelector('a[href="#paiement"]');
  var closeTrigger   = document.querySelector('.paiement-close');

  if (paiementScreen && openTrigger) {
    openTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      paiementScreen.classList.add('is-open');
      paiementScreen.dispatchEvent(new CustomEvent('paiement:open'));
      requestAnimationFrame(function () {
        paiementScreen.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  if (paiementScreen && closeTrigger) {
    closeTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      paiementScreen.classList.remove('is-open');
      var retrait = document.getElementById('retrait');
      if (retrait) retrait.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const PRICE_PER_UNIT = 120;

  const quantityEl = document.querySelector("[data-paiement-quantity]");
  const dayEl      = document.querySelector("[data-paiement-day]");
  const totalEl    = document.querySelector("[data-paiement-total]");
  const detailEl   = document.querySelector("[data-paiement-detail]");

  if (!quantityEl || !dayEl || !totalEl || !detailEl) return;

  function getQuantity() {
    const selected = quantityEl.querySelector(".select-option[aria-selected='true']");
    return selected ? parseInt(selected.dataset.value, 10) : 1;
  }

  function getDayFullLabel() {
    const selected = dayEl.querySelector(".select-option[aria-selected='true']");
    return selected ? (selected.dataset.fullLabel || selected.textContent) : '';
  }

  function renderTotal() {
    totalEl.textContent = (getQuantity() * PRICE_PER_UNIT) + "€";
  }

  function renderDetail() {
    const qty     = getQuantity();
    const plateau = qty === 1 ? 'plateau' : 'plateaux';
    const label   = getDayFullLabel().toLowerCase();
    detailEl.innerHTML = qty + ' ' + plateau + ' pour 2 personnes.<br>À retirer le ' + label + '.';
  }

  quantityEl.addEventListener("select:change", renderTotal);
  quantityEl.addEventListener("select:change", renderDetail);
  dayEl.addEventListener("select:change", renderDetail);
  renderTotal();
  renderDetail();
})();
