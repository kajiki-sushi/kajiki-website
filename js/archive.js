/* ============================================================
   ARCHIVE
   ============================================================
   Actif (série en cours) :
     La première entrée a des "poissons" — pas de "upcoming".

   Dormant (série à venir) :
     Ajouter en tête de liste :
     { upcoming: true, numero: "XX", date: "Mois AAAA" }

   Archiver une série terminée :
     Ajouter en tête de liste (après l'éventuelle entrée upcoming) :
     { numero: "XX", poissons: "Espèce 1<br>Espèce 2", date: "Mois AAAA" }
   ============================================================ */

const archiveData = [
  {
    numero: "01",
    poissons: "Thon Rouge",
    date: "Avril 2026"
  }
];

(function () {
  const isDormant = archiveData.length > 0 && archiveData[0].upcoming === true;
  const displayData = isDormant
    ? archiveData
    : archiveData.filter(function (e) { return !e.upcoming; });

  let current = 0;

  function renderContent(entry) {
    if (entry.upcoming) {
      return '<div class="specsheet--archive">'
        + '<div class="specsheet-value">Série en préparation<br>' + entry.date + '</div>'
        + '<a href="pages/series-suivantes.html" class="specsheet-value text-link">Être Notifié</a>'
        + '</div>';
    }
    return '<div class="specsheet--archive">'
      + '<div class="specsheet-value">' + entry.date + '</div>'
      + '<div class="specsheet-value">' + entry.poissons + '</div>'
      + '</div>';
  }

  function setDisabled(btn, state) {
    btn.classList.toggle("is-disabled", state);
    if (state) btn.setAttribute("aria-disabled", "true");
    else btn.removeAttribute("aria-disabled");
  }

  function render(index) {
    const entry = displayData[index];
    document.getElementById("archive-numero").textContent = entry.numero;
    document.getElementById("archive-content").innerHTML = renderContent(entry);
    setDisabled(document.querySelector("[data-archive='prev']"), index >= displayData.length - 1);
    setDisabled(document.querySelector("[data-archive='next']"), index <= 0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (isDormant) document.body.classList.add("is-dormant");

    document.querySelector("[data-archive='prev']").addEventListener("click", function () {
      if (current < displayData.length - 1) render(++current);
    });
    document.querySelector("[data-archive='next']").addEventListener("click", function () {
      if (current > 0) render(--current);
    });

    render(0);
  });
})();
