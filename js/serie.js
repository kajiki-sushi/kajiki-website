/* ============================================================
   SÉRIE
   ============================================================
   Fetches /data/serie.json + /data/archive.json. Populates all
   variable content: série screen, retrait screen, payment day
   options, archive. Sets body.is-dormant when active is false.
   Schedule (Jeu·18h–22h ...) is generated from days[].
   Exposes window.KAJIKI_SERIE_READY (Promise) for payment.js.
   ============================================================ */

window.KAJIKI_SERIE_READY = Promise.all([
  fetch('/data/serie.json').then(function (r) { return r.json(); }),
  fetch('/data/archive.json').then(function (r) { return r.json(); })
]).then(function (results) {
  var data = results[0];
  data.archive = results[1];
  // Deadline auto-flips active → false. Single source of truth downstream.
  if (data.active && isPastDeadline(data.series)) data.active = false;
  window.KAJIKI_SERIE = data;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { render(data); });
  } else {
    render(data);
  }
  return data;
});

function isPastDeadline(series) {
  if (!series || !series.preorder_deadline_iso) return false;
  return Date.now() >= new Date(series.preorder_deadline_iso).getTime();
}

function render(data) {
  if (!data.active) document.body.classList.add('is-dormant');

  setText('[data-serie-number]',   data.series.name);
  setText('[data-serie-dates]',    data.series.dates);
  setText('[data-serie-price]',    Math.round(data.series.price_per_unit_cents / 100) + '€');
  setText('[data-serie-deadline]', data.series.preorder_deadline);

  setContent('[data-serie-location]', data.pickup.location_html, data.pickup.location_link);
  setHTML('[data-serie-hours]', buildSchedule(data.pickup.days));

  buildDayOptions(data.pickup.days);
  renderArchive(data);
}

function buildSchedule(days) {
  if (!days || !days.length) return '';
  return days.map(function (d) {
    return d.label.slice(0, 3) + ' · ' + d.window;
  }).join('<br>');
}

function reveal(el) {
  el.style.transition = 'opacity var(--duration-smooth)';
  requestAnimationFrame(function () { el.style.opacity = '1'; });
}

function setText(selector, value) {
  var el = document.querySelector(selector);
  if (!el || value == null) return;
  el.textContent = value;
  reveal(el);
}

function setHTML(selector, value) {
  var el = document.querySelector(selector);
  if (!el || value == null) return;
  el.innerHTML = value;
  reveal(el);
}

function setContent(selector, html, href) {
  var el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = html;
  if (href) el.href = href;
  reveal(el);
}

function buildDayOptions(days) {
  if (!days || !days.length) return;
  var selectEl = document.querySelector('[data-payment-day]');
  if (!selectEl) return;
  var menu    = selectEl.querySelector('.select-menu');
  var trigger = selectEl.querySelector('.select-value');
  if (!menu) return;

  menu.innerHTML = days.map(function (d, i) {
    return '<li class="select-option" role="option"'
      + ' data-value="' + d.value + '"'
      + ' data-full-label="' + d.full_label + '"'
      + (i === 0 ? ' aria-selected="true"' : '')
      + '>' + d.label + '</li>';
  }).join('');

  if (trigger && days[0]) trigger.textContent = days[0].label;
}

function renderArchive(data) {
  var archive     = data.archive || [];
  var displayData = data.active
    ? archive.filter(function (e) { return !e.upcoming; })
    : archive;

  if (!displayData.length) return;

  var current = 0;

  function entryHTML(entry) {
    var cell_2_node = entry.cell_2_url
      ? '<a href="' + entry.cell_2_url + '" class="specsheet-value text-link">' + (entry.cell_2 || '') + '</a>'
      : '<div class="specsheet-value">' + (entry.cell_2 || '') + '</div>';
    return '<div class="specsheet--archive">'
      + '<div class="specsheet-value">' + (entry.cell_1 || '') + '</div>'
      + cell_2_node
      + '</div>';
  }

  function setDisabled(btn, state) {
    btn.classList.toggle('is-disabled', state);
    if (state) btn.setAttribute('aria-disabled', 'true');
    else btn.removeAttribute('aria-disabled');
  }

  function draw(index) {
    var entry   = displayData[index];
    var numero  = document.getElementById('archive-numero');
    var content = document.getElementById('archive-content');
    var prev    = document.querySelector('[data-archive="prev"]');
    var next    = document.querySelector('[data-archive="next"]');
    if (numero)  numero.textContent = entry.header || '';
    if (content) content.innerHTML  = entryHTML(entry);
    if (prev)    setDisabled(prev, index >= displayData.length - 1);
    if (next)    setDisabled(next, index <= 0);
  }

  var prev = document.querySelector('[data-archive="prev"]');
  var next = document.querySelector('[data-archive="next"]');

  if (prev) prev.addEventListener('click', function () {
    if (current < displayData.length - 1) draw(++current);
  });
  if (next) next.addEventListener('click', function () {
    if (current > 0) draw(--current);
  });

  draw(0);
}
