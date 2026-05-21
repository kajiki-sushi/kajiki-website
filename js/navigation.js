(function () {

  // Take manual control — prevent browser from fighting our restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Scroll-down button: smooth on desktop, instant on mobile
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.scroll-down-btn');
    if (!btn) return;
    var targetId = btn.getAttribute('href').replace('#', '');
    var target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    var isDesktop = window.matchMedia('(min-width: 800px)').matches;
    var top = target.getBoundingClientRect().top + window.scrollY;
    isDesktop
      ? window.scrollTo({ top: top, behavior: 'smooth' })
      : window.scrollTo(0, top);
  });

  // Before navigating away via a quiet link, save the screen the link lives in
  document.addEventListener('click', function (event) {
    const link = event.target.closest('.quiet-link');
    if (!link) return;
    if (link.getAttribute('aria-current') === 'page') return;
    if (link.target === '_blank') return;

    const screen = link.closest('.screen');
    const anchor = screen && screen.id ? screen.id : null;
    try {
      sessionStorage.setItem('anchor:' + window.location.pathname, anchor || 'top');
    } catch (_) {}
  });

  // On back/forward navigation, restore to the saved screen anchor
  document.addEventListener('DOMContentLoaded', function () {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (!navEntry || navEntry.type !== 'back_forward') return;

    const key = 'anchor:' + window.location.pathname;
    let saved;
    try {
      saved = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
    } catch (_) { return; }

    if (!saved) return;

    const isDesktop = window.matchMedia('(min-width: 800px)').matches;

    requestAnimationFrame(function () {
      if (saved === 'top') {
        isDesktop
          ? window.scrollTo({ top: 0, behavior: 'smooth' })
          : window.scrollTo(0, 0);
        return;
      }

      const target = document.getElementById(saved);
      if (!target) return;

      // getBoundingClientRect + scrollY gives the absolute page position
      // at DOMContentLoaded scrollY is 0, so this equals the element's page offset
      const top = target.getBoundingClientRect().top + window.scrollY;
      isDesktop
        ? window.scrollTo({ top: top, behavior: 'smooth' })
        : window.scrollTo(0, top);
    });
  });

})();
