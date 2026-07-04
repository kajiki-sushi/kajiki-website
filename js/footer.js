function getFooterContext() {
  const path = window.location.pathname;
  const currentPage = path.split("/").pop();
  const isInPages = path.includes("/pages/");
  const base = isInPages ? "" : "pages/";

  return {
    currentPage,
    isInPages,
    base,
    isAllergens:   currentPage === "allergenes",
    isCancellations: currentPage === "annulations",
    isPrivacy:     currentPage === "confidentialite",
    isContact:     currentPage === "contact"
  };
}

function buildFooterLink({ href, label, isActive = false, isExternal = false }) {
  return `<a href="${href}" class="detail-text quiet-link"${isActive ? ' aria-current="page"' : ''}${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
}

function buildFooter() {
  const ctx = getFooterContext();

  const leftLinks = [
    buildFooterLink({ href: `${ctx.base}contact`,                  label: "Contact",          isActive: ctx.isContact }),
    buildFooterLink({ href: `${ctx.base}allergenes`,               label: "Allergènes",      isActive: ctx.isAllergens }),
    buildFooterLink({ href: `${ctx.base}annulations`,              label: "Annulations",     isActive: ctx.isCancellations }),
    buildFooterLink({ href: `${ctx.base}confidentialite`, label: "Confidentialité", isActive: ctx.isPrivacy })
  ].join("");

  return `
    <div class="footer-layout">
      <div class="footer-col">
        ${leftLinks}
      </div>
      <div class="footer-col footer-col--right">
        <a href="https://www.instagram.com/sushi.kajiki/" class="footer-social-link quiet-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5"></rect>
            <circle cx="12" cy="12" r="4.8"></circle>
            <circle cx="17.4" cy="6.6" r="0.9"></circle>
          </svg>
        </a>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const footerMount = document.getElementById("site-footer");
  if (!footerMount) return;

  footerMount.innerHTML = buildFooter();
});
