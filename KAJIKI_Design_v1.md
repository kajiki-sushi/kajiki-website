# KAJIKI — Design Guidelines

*Version 1.3 — May 2026*
*Internal reference. Pairs with KAJIKI_Positioning_v5.md and KAJIKI_Communication_v1.md.*
*Specific values (type sizes, spacing tokens, breakpoint values) live in the CSS. This doc holds the principles.*

*Update from v1.2: Added Foolproof launch checklist — Airtable record must exist before `active: true` is set in `serie.json`. Silent data loss otherwise.*

*Update from v1.1: Fields are underlined rather than boxed; underline opacity follows the text-link convention (rest → hover/focus). Added paiement screen on index — the PRÉCOMMANDER button now scrolls to an in-page payment form rather than navigating to a separate page. Orphaned /pages/precommande.html removed.*

*Update from v1: Added footer active-state specification and history-restored state (smooth scroll on back navigation via quiet links). All quiet links site-wide now use `aria-current="page"` for unified current-page detection.*

---

## Foolproof — Launching a new Série

**Before setting `"active": true` in `data/serie.json`, the Série record must already exist in Airtable.**

Order of operations — do not skip, do not reorder:

1. **Airtable first.** Create the Série record in Airtable (name, dates, pickup details). Without it, Make has nowhere to write the order data when a payment comes in.
2. **Update `data/serie.json`.** Set prices, pickup days, and dates to match. Commit and push.
3. **Update `index.html`.** Sync the visible copy (title, price, specsheet, dates) with `serie.json`. Also update the `data-full-label` attribute on each day option in the retrait selector (e.g. `data-full-label="Jeudi 28 mai"`) — the paiement recap text is generated from these at runtime.
4. **Set `"active": true` in `serie.json`.** Only once steps 1–3 are done.
5. **Remove the `"upcoming"` entry** from `js/archive.js` to exit dormant state.

If you set `active: true` without the Airtable record in place, payments will go through but orders will fail to log — silent data loss.

---

## Approach

Mobile-first. Default layout is mobile; tablet and desktop are exceptions. One structural breakpoint, applied through token redefinition.

Goal aesthetic: minimalist, brutalist, laboratory. Black text, white background. Color is not in the system — opacity does the work color would do elsewhere.

Goal message: this is controlled, surgical. A brand that studies things, and the studying is resolved.

---

## Layout

**Screen system.** The page is composed of vertically stacked screens. Each screen is at least 100vh, contains one centered content block, and presents one piece of the story.

**Centering rule.** Everything centers. Header and footer are the only exceptions.

**Header behavior.** The header is a structural element that frames the page. It sits outside the centering rule. Specific behavior — static or sticky, what it contains, how it relates to scroll — is determined per build by the architecture of the moment.

**Footer behavior.** Two variants — a links column or a single signature line. Info pages use a different footer pattern (admin links bottom-left, signature bottom-right). Footer links are quiet links; the link corresponding to the current page remains at full opacity (100%), while all other footer links stay at reduced opacity. Current page detection uses the `aria-current="page"` attribute. This pattern applies to all quiet links site-wide for consistency. This provides wayfinding without requiring user interaction.

**Storytelling logic.** Screen-by-screen progression is logical and inevitable, not marketed. Each screen earns its place by saying something the previous one didn't.

---

## Components

**Buttons.** All buttons share the same appearance — black background, white text, uppercase. One hover state, applied uniformly. No per-button variations.

**Fields.** All fields share the same appearance — transparent background, single-pixel bottom border (underline), no horizontal padding, muted placeholder. On hover and focus the underline opacity increases, mirroring the text-link convention. The notifications form is the documented exception (narrower field, button-height variant). The paiement card row is a documented compound — three inputs share a single underline (No. de Carte / MM/AA / CVC), reading as one field with three slots.

**Quiet links.** Lower opacity at rest, full opacity on hover or active. Used for footer links and any secondary navigation that should be present without competing for attention.

**Specsheets.** Two modes, same job (presenting structured data), different register:

- *Admin specsheets* — for clarity. Contact, confidentialité, mentions légales. Left-aligned text, no exterior border, vertical separator between columns, asymmetric column widths. Read like reference tables.
- *Design specsheets* — for desire. Drop details, pickup point details. Centered text, exterior border, no vertical separator, equal column widths. Read like designed objects.

The distinction is intentional. Admin = reference. Design = object. Don't drift them toward each other.

**Image displays.** Two systems: single-image (landscape or portrait variants) and gallery. Both stay resolved in CSS even when not currently in use, so swapping orientation or activating a gallery is a content change rather than a rebuild.

**Arrow nav.** A two-arrow toggle pattern for moving between adjacent items. Used wherever the architecture calls for stepping between siblings in a small set.

---

## Type

Five-tier system, single typeface, three weights only (light, regular, medium). Sizes scale once at the breakpoint. Specifics live in the CSS root.

Three named registers: titles (large, tight letter-spacing), body (light or regular weight, generous line-height), meta and footnotes (smaller, lighter). Use the named text styles rather than overriding sizes ad hoc.

---

## States

**Active.** Default rendering.

**Hover.** Each component type has one hover treatment, applied uniformly to all instances of that type. Quiet links have one hover; buttons have another; fields have their own. Per-element custom hovers are not introduced.

**Disabled / submitted.** Reduced opacity, pointer events removed. Used when a form has been submitted or an action is unavailable.

**Dormant.** When no Série is active, the website has an explicitly designed dormant state — header reads `HORS PRÉCOMMANDE`, the active entry is replaced by the notifications form, archive remains. The dormant state is itself part of the system, not the absence of it.

**History-restored.** When a user navigates away from a page via a quiet link and returns using the browser back button, the page smoothly scrolls to center the screen where the user was positioned before navigating. Each screen has an anchor; navigation captures the current screen's anchor and restores to it on return. This applies to all quiet links site-wide (footer, info pages, secondary navigation). Desktop only; mobile uses instant restoration. The centered screen provides predictable wayfinding without disorientation.

---

## Practice

**Inactive code is removed by default.** When a change makes code unused, that code is cleaned up — including downstream references, links, and orphaned classes. The codebase doesn't accumulate dead weight under "might come back someday" protection.

Exception: a small explicit list of staged components is preserved with comments noting their staged status. Currently:
- `.gallery-*` — staged for future image accumulation.
- `.single-image-frame-landscape` — landscape variant staged; portrait is in use.
- `.arrow-nav` — staged for future toggle patterns (pickup days, omakase navigation, archive stepping).

The list lives at the top of the CSS as a comment. Components on the list are preserved with their reason; everything else not currently active is presumed dead. To add to the list, write the comment and the reason.

**Coherence over novelty.** Spacing, type, and component patterns are repetitive on purpose. Recurrence is the system. New patterns require justification; reuse does not.

**Substance-forward.** Every visual element earns its presence by serving the work. Decorative-without-function is rejected. If an element can't be defended on functional grounds, remove it.

**Tokens are canonical.** All values that should be tokens are tokens. Don't introduce hardcoded values; flag any that exist.

**Language discipline.** Class names, identifiers, and code comments are in English. User-facing text and content are in French. This separates code maintenance from brand voice. Vocabulary across the codebase converges on consistent terms — new naming inconsistencies are flagged and resolved, not absorbed.

---

## Use

This doc holds the principles. The CSS holds the values. The positioning doc holds the brand. The communication doc holds the voice. When the four agree, the system is intact.

---

*End of v1.3.*
