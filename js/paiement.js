/* ============================================================
   PAIEMENT
   ============================================================
   Recomputes the displayed total when the quantity changes.

   PRICE_PER_UNIT will move into the centralized série data
   (alongside archive + active série) in a later pass.
   ============================================================ */

(function () {
  const PRICE_PER_UNIT = 120;

  const quantityEl = document.querySelector("[data-paiement-quantity]");
  const totalEl = document.querySelector("[data-paiement-total]");

  if (!quantityEl || !totalEl) return;

  function getQuantity() {
    const selected = quantityEl.querySelector(".select-option[aria-selected='true']");
    return selected ? parseInt(selected.dataset.value, 10) : 0;
  }

  function renderTotal() {
    totalEl.textContent = (getQuantity() * PRICE_PER_UNIT) + "€";
  }

  quantityEl.addEventListener("select:change", renderTotal);
  renderTotal();
})();
