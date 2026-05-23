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
    isContact:     currentPage === "contact",
    isRetrait:     currentPage === "retrait"
  };
}

function buildFooterLink({ href, label, isActive = false, isExternal = false }) {
  return `<a href="${href}" class="detail-text quiet-link"${isActive ? ' aria-current="page"' : ''}${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
}

function buildFooter() {
  const ctx = getFooterContext();

  const leftLinks = [
    buildFooterLink({ href: `${ctx.base}contact`,                  label: "Contact",          isActive: ctx.isContact }),
    buildFooterLink({ href: `${ctx.base}retrait`,                  label: "Retraits",          isActive: ctx.isRetrait }),
    buildFooterLink({ href: `${ctx.base}allergenes`,               label: "Allergènes",      isActive: ctx.isAllergens }),
    buildFooterLink({ href: `${ctx.base}annulations`,              label: "Annulations",     isActive: ctx.isCancellations }),
    buildFooterLink({ href: `${ctx.base}confidentialite`, label: "Confidentialité", isActive: ctx.isPrivacy })
  ].join("");

  const rightLinks = [
    buildFooterLink({ href: "https://www.instagram.com/sushi.kajiki/", label: "Instagram",        isExternal: true }),
    buildFooterLink({ href: `${ctx.base}series-suivantes`,        label: "Séries suivantes" })
  ].join("");

  return `
    <div class="footer-layout">
      <div class="footer-col">
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
