/* ============================================================
   SELECT
   ============================================================
   Custom dropdown for any .select component on the page.
   Dispatches a "select:change" CustomEvent with { value } on
   selection — consumers (e.g. paiement.js) listen for this.
   ============================================================ */

(function () {

  function openSelect(select) {
    select.dataset.open = "true";
    select.querySelector(".select-trigger").setAttribute("aria-expanded", "true");
    select.querySelector(".select-menu").hidden = false;
  }

  function closeSelect(select) {
    delete select.dataset.open;
    select.querySelector(".select-trigger").setAttribute("aria-expanded", "false");
    select.querySelector(".select-menu").hidden = true;
  }

  function closeAll(except) {
    document.querySelectorAll(".select").forEach(function (sel) {
      if (sel !== except) closeSelect(sel);
    });
  }

  function selectOption(select, option) {
    select.querySelectorAll(".select-option").forEach(function (opt) {
      opt.setAttribute("aria-selected", opt === option ? "true" : "false");
    });
    select.querySelector(".select-value").textContent = option.textContent;
    select.dispatchEvent(new CustomEvent("select:change", {
      detail: { value: option.dataset.value }
    }));
  }

  function init() {
    document.querySelectorAll(".select").forEach(function (select) {
      const trigger = select.querySelector(".select-trigger");
      const options = select.querySelectorAll(".select-option");

      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        if (select.dataset.open === "true") {
          closeSelect(select);
        } else {
          closeAll(select);
          openSelect(select);
        }
      });

      options.forEach(function (option) {
        option.addEventListener("click", function () {
          selectOption(select, option);
          closeSelect(select);
        });
      });
    });

    document.addEventListener("click", function () {
      closeAll();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
