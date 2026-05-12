function getFooterContext() {
  const path = window.location.pathname;
  const currentPage = path.split("/").pop();
  const isInPages = path.includes("/pages/");
  const base = isInPages ? "" : "pages/";

  return {
    currentPage,
    isInPages,
    base,
    isAllergens:   currentPage === "allergenes.html",
    isAnnulations: currentPage === "annulations.html",
    isPrivacy:     currentPage === "confidentialite.html",
    isContact:     currentPage === "contact.html"
  };
}

function buildFooterLink({ href, label, isActive = false, isExternal = false }) {
  return `<a href="${href}" class="detail-text quiet-link"${isActive ? ' aria-current="page"' : ''}${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
}

function buildFooter() {
  const ctx = getFooterContext();

  const leftLinks = [
    buildFooterLink({ href: `${ctx.base}contact.html`,                  label: "Contact",          isActive: ctx.isContact }),
    buildFooterLink({ href: `${ctx.base}allergenes.html`,               label: "Allergènes",      isActive: ctx.isAllergens }),
    buildFooterLink({ href: `${ctx.base}annulations.html`,              label: "Annulations",     isActive: ctx.isAnnulations }),
    buildFooterLink({ href: `${ctx.base}confidentialite.html`, label: "Confidentialité", isActive: ctx.isPrivacy })
  ].join("");

  const rightLinks = [
    buildFooterLink({ href: "https://www.instagram.com/sushi.kajiki/", label: "Instagram",        isExternal: true }),
    buildFooterLink({ href: `${ctx.base}series-suivantes.html`,        label: "Séries suivantes" })
  ].join("");

  return `
    <div class="footer-layout">
      <div class="footer-col footer-col--left">
        ${leftLinks}
      </div>
      <div class="footer-col footer-col--right">
        <div class="footer-links-right">
          ${rightLinks}
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const footerMount = document.getElementById("site-footer");
  if (!footerMount) return;

  footerMount.innerHTML = buildFooter();
});
