# KAJIKI — Design Guidelines

*Version 2.1 — May 2026*
*Internal reference. Pairs with KAJIKI_Positioning and KAJIKI_Communication.*
*Specific values (type sizes, spacing tokens, breakpoint values) live in the CSS. The operational state lives in `data/*.json`. This doc holds the principles.*

---

## Launching a new Série

**Create the Airtable record before launching.** The Make scenario looks it up by `series_name` from Stripe metadata — if the record doesn't exist when payments come in, the Make scenario errors visibly (no silent data loss). As a front-line guard, `serie.js` consults `/api/serie-status` on load and locks the PRÉCOMMANDER button whenever the record is missing, so a série launched without its Airtable record shows as closed rather than taking orders it can't log — the customer never sees an error. The check **fails open**: if it can't reach Airtable, preorders stay available and Make's error reporting remains the backstop.

A série is always live on the site — there is no dormant/off state. The lifecycle is continuous: while one série's pickup is underway, launching the next one simply overwrites `data/serie.json`. Preorders open the moment `serie.json` describes a série with a future deadline, and close automatically once that deadline passes.

**The step-by-step lives in the operations manual, not here.** See `KAJIKI_Operations.md` → *Launch a new série* for the exact fields, the Airtable step, and who-does-what. In short: create the Airtable record, prepend the finished série to `data/archive.json`, edit `data/serie.json` (the single source of truth for live state), push.

The deadline auto-closes preorders when reached — no manual intervention needed at the cutoff moment. Both API and front-end honor this: the série stays visible, the PRÉCOMMANDER button locks, payment is hidden. Inventory also auto-closes orders once `max_total_quantity` is reached.

---

## Approach

Mobile-first. Default layout is mobile; tablet and desktop are exceptions handled by token redefinition at one breakpoint (`800px`).

Aesthetic: minimalist, brutalist, laboratory. Black text (`#111`), white background. Opacity is the only modulation — no color is added to the system. Every visual decision that would use color elsewhere uses opacity here. Reduced opacity is reserved for interactive states only (quiet links at rest, hover, disabled) — never applied to static text as a hierarchy or secondary-info device.

Goal message: controlled, surgical. A brand that studies things, and the studying is resolved.

---

## Data files

Operational state lives in JSON, not in HTML or JS. `index.html` carries only structure + hooks; values come from JSON at runtime.

**`data/serie.json`** — live state. Fields are grouped by visibility frequency: things you edit every série at top of each block, stable things at bottom. Loaded by `serie.js`, populated into the DOM via `data-serie-*` hooks. Used server-side too by `api/create-payment-intent.js` for amount calculation and Stripe metadata.

**`data/archive.json`** — append-only history, newest entry first. Each entry: `header` (big numeral, shown large above), `fish` (array of fish names, stacked one per line), `month` (display string, e.g. `"Juillet 2026"`). `fish` and `month` render as two stacked cells inside `.specsheet--archive` — fish on top, the month as a bottom label cell separated by a border.

Both files are served with `Cache-Control: no-store` (set in `vercel.json`) — updates show immediately, no stale browser caches.

The split exists so the live operational payload (`serie.json`) stays small and clean; archive history can grow to dozens of entries without polluting the live data fetch or Stripe metadata.

---

## Layout

**Screen system.** The page is composed of vertically stacked screens. Each screen is `min-height: 100vh`, centered on one `.page-content` block, and presents one idea. Screens stack in `<main>` with no gaps.

**Info pages.** Footer pages (contact, confidentialité, etc.) use `.info-page` + `.info-content` — a single full-viewport centered block, not a scrolling screen stack. The `.info-title` class overrides display size on mobile where the default is too large.

**Centering rule.** Everything centers. Header and footer are explicit exceptions.

**Header.** `.site-header` — absolutely positioned, top of the first screen, spans full width. The `.signature` mark sits top-left. A fixed white-to-transparent gradient behind it keeps it legible while scrolling. Consistent across all pages. No per-page variation.

**Footer.** Rendered by `footer.js` into `#site-footer` at the bottom of the last screen on any page. Two columns — left for admin/info links, right for brand/external links — but the exact links in each column are not fixed by this doc. Footer links are quiet links; `aria-current="page"` marks the current page link at full opacity.

**Closed state.** A série is always visible. Once the preorder deadline has passed, `serie.js` adds `body.is-closed`: the série stays on screen, the payment screen is hidden, and the PRÉCOMMANDER button locks (`.is-disabled`). Preorders reopen when `serie.json` is updated to the next série. There is no dormant/off state.

---

## Components

**Buttons.** `.button` (element) and `.button-link` (`<a>` acting as button). Same appearance: black background, white text, uppercase. `--full` modifier spans available width. One hover state (opacity only). No per-instance variations.

**Fields.** `.field` — transparent background, single-pixel bottom border (underline), no horizontal padding, muted placeholder. Hover and focus increase underline opacity, matching the quiet-link convention.

**Custom select.** `.select` wraps a `.select-trigger` (extends `.field`) and a `.select-menu`. State is managed via `data-open` on `.select`. The selected option carries `aria-selected="true"`. Changes fire a `select:change` custom event — JS consumers listen to this, not to change on the trigger. Menu opens upward (`bottom: 100%`). Option click handling uses event delegation on `.select-menu` — options can be added dynamically (e.g. day options built by `serie.js`) and still work without re-init.

**Quiet links.** `.quiet-link` — reduced opacity at rest, full opacity on hover or `aria-current="page"`. Footer navigation and secondary links. No underline.

**Text links.** `.text-link` — inherits color, underline at reduced opacity at rest, increases on hover. Used inline within body text only.

**Specsheets.** Three variants, same underlying row/cell structure (`.specsheet-row`, `.specsheet-label`, `.specsheet-value`), different register:

- `.specsheet--design` — exterior border, no vertical separator, equal column widths, centered text. For series details and pickup logistics. Read like a designed object.
- `.specsheet--admin` — no exterior border, vertical `.specsheet-divider` between columns, asymmetric widths (35% / 1px / 1fr), left-aligned text. For contact, legal, reference tables. Read like a reference table.
- `.specsheet--archive` — left border only, no label column, values stacked with border between them. For archive entries.

The variants are standalone classes. There is no base `.specsheet` class — don't add one. Don't drift the variants toward each other; the distinction is intentional.

**Specsheet + action group.** `.specsheet-action-group` — stacks a specsheet and a `.button-link` at `--specsheet-width`, separated by `--button-gap`. Used wherever a specsheet leads directly to an action.

**Payment form.** Hidden by default (`display: none`), visible when `.is-open` is added by JS. Width matches `--specsheet-width` to align with design specsheets on adjacent screens. Contains: quantity and day selects, summary text, email/name/card fields, error slot, confirm button. The close button (`.payment-close`) returns to the retrait screen.

Day options are built by `serie.js` from `data/serie.json` — never hardcoded in HTML. Each option carries `data-value` (API contract), `data-full-label` (summary), `data-window` (used in summary recap text).

If Stripe.js fails to load (CDN blocked/down) or the publishable key is missing, `.payment-error` is unhidden and the submit button is disabled. No silent failure.

The card row (`.payment-card-unified`) is a compound field: one `.field` bottom border shared by three Stripe elements (number / expiry / CVC). Reads as one field with three slots.

**Arrow nav.** `.arrow-nav` — two arrow buttons flanking a centered label, using a three-column grid. At the limits of a set, the endpoint button carries `.is-disabled`. Used in the archive screen.

**Image frame.** `.single-image-frame-portrait` — 4:5 portrait aspect ratio. Content swap (new `src`) only; no layout change needed.

---

## Typography

Four named styles, one typeface (Inter), three weights only (light 200, regular 400, medium 500). Sizes scale at the breakpoint via token redefinition.

| Class | Weight | Use |
|---|---|---|
| `.display-title` | medium | Section titles, large numerals |
| `.body-text` | light | Primary body content |
| `.body-text-medium` | medium | Totals, key values |
| `.detail-text` | light | Footer links, footnotes, captions |

Use named classes. Don't override sizes ad hoc. Don't introduce a fifth style without removing an unused one.

---

## Tokens

All values that repeat or scale are tokens in `:root`. The `@media (min-width: 800px)` block redefines tokens only — no structural CSS changes at the breakpoint.

**What belongs in `:root`:** colors, opacity values, animation durations, type sizes/weights/tracking/line-heights, spacing values, component dimensions.

**What doesn't belong:** values unique to one element that will not recur. If a value appears twice, it's a token.

**Flagging.** Any hardcoded value that should eventually become a token is marked `/* FLAG: hardcoded */`. This makes it findable. Don't leave hardcoded values silent.

---

## States

**Hover.** One treatment per component type, applied uniformly. Quiet links and arrow buttons use opacity via color token. Buttons use opacity directly. Fields use underline color. No custom per-element hovers.

**Disabled / submitted.** `opacity: var(--opacity-disabled)` + `pointer-events: none`. Applied to a form or section when it's been submitted or is unavailable. Class: element-specific (e.g., `is-submitted` on a form section).

**Is-disabled.** `.is-disabled` on interactive elements (arrow nav at range limit, button-links that can't be used). Same opacity + pointer-events off.

**Closed.** `body.is-closed` — set by `serie.js` when `now >= preorder_deadline_iso`, or when `/api/serie-status` reports the série isn't orderable yet (its Airtable record is missing). The série stays visible; CSS hides the payment screen (`#payment`) and the PRÉCOMMANDER button receives `.is-disabled`.

The `preorder_deadline_iso` is the single source of truth for the cutoff; the human-readable `preorder_deadline` string is for display only — never used in logic.

**Payment open.** `#payment.is-open` — the screen becomes visible. Managed entirely by `payment.js`.

**Loading.** Variable elements with `data-serie-*` hooks start at `opacity: 0` (CSS rule). `serie.js` fades them in once `data/serie.json` resolves. Avoids flash of stale data between page load and JSON fetch.

**History-restored.** When navigating away via a quiet link and returning via browser back, the page scrolls to the screen the user left from. Each `.screen` has an `id`; `navigation.js` stores the anchor in `sessionStorage` before navigating and restores it on `back_forward` navigation. Desktop: smooth scroll. Mobile: instant. Applies to all quiet links site-wide.

---

## Safeguards

Every order pathway has a defended boundary. The API (`api/create-payment-intent.js`) refuses requests that:

- Come from an unlisted origin (basic spam protection — see `ALLOWED_ORIGINS`)
- Hit while past `preorder_deadline_iso` (deadline is enforced server-side, not just decorative)
- Have a malformed email (basic regex check)
- Have invalid quantity (`> max_quantity_per_order`) or invalid pickup_day
- Would exceed `max_total_quantity` (inventory cap — see below)

Price is always computed server-side from `serie.json` — the client cannot influence amount.

**Inventory cap (per day).** Each pickup day in `serie.json` carries a `max_quantity` field. Before creating a PaymentIntent, the API queries Stripe for succeeded intents matching this `series_name` + `pickup_day_short`, sums their quantities, and refuses if adding the new order would exceed that day's cap. Each day is tracked independently — Thursday's inventory can't be sold out by Saturday orders. Stripe is the source of truth, no separate counter to maintain. Slight eventual-consistency caveat: under heavy concurrent buying in the same minute, could let through 1–2 oversells. Not realistic at KAJIKI's scale.

**Stripe metadata contract** (read by Make scenario; rename = break the scenario):
`series_name`, `quantity`, `pickup_day_short`, `pickup_day_full`, `pickup_window`, `pickup_location_html`, `pickup_location_link`, `customer_name`, `customer_email`.

**Known limitations:**
- **Rate limiting.** Vercel serverless has no built-in request throttling. The Origin check blocks naive curl spam but won't stop a determined attacker. Real protection requires Upstash Redis (or similar) — track as future infrastructure work. Stripe's own rate limits provide a final backstop.
- **Airtable record existence.** The front-end locks preorders when the record is missing (`/api/serie-status`, see "Launching a new Série"), so a normal customer never reaches the form. This is a UX gate, not a hard server guard — it fails open, and a direct or race-window request could still create a PaymentIntent. Such a slip-through is caught by Make's visible error: the customer is charged and the order is recoverable from Stripe metadata, but won't be auto-logged until the record is created and the Make run retried. Requires four Vercel env vars (`AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_SERIES_TABLE`, `AIRTABLE_SERIES_NAME_FIELD`); with any unset, the gate is skipped and behaviour falls back to deadline-only.

---

## Code Practices

**Data centralization.** Per-série values live in `data/*.json`, never in HTML or JS. If a value would change per série, it's in JSON. If it's stable across all series, it can live elsewhere.

**Unused code is removed.** When a change makes code dead, that code goes — selectors, classes, elements, downstream references. No dead weight under "might come back."

**Coherence over novelty.** Patterns repeat on purpose. Reuse needs no justification. A new pattern needs one.

**Substance-forward.** Every visual element earns its place functionally. Remove what can't be defended.

**Language discipline.** Class names, JS identifiers, code comments: English. User-facing text: French. Non-negotiable.

**Naming conventions.**
- Component classes: `block`, `block-element`, `block--modifier` (BEM-lite).
- Utility classes: single-level, descriptive (`.quiet-link`, `.text-link`, `.text-block`).
- State classes: `is-` prefix (`.is-open`, `.is-disabled`, `.is-closed`, `.is-submitted`).
- JS hooks: `data-*` attributes (`[data-payment-quantity]`, `[data-serie-number]`). Style via classes only; `data-*` attributes are for JS, not CSS selectors. Exception: `data-serie-*` hooks double as CSS selectors for the loading-state opacity rule, because the hook and the visibility are the same concern.

**Data attributes vs. classes.** JS reads and writes `data-*` attributes for hooks and state it controls. CSS uses classes for visual state. The two roles don't mix (see the loading-state exception above).

**Tokens are canonical.** Introduce a token rather than a hardcoded value. Flag any that exist. Don't let them accumulate.

**Tab titles.** `KAJIKI®` for the homepage. `KAJIKI® — [Page name]` for all other pages — registered mark, em dash, page name in sentence case. French page names follow French capitalisation rules.

---

## Design assets

Static design files (Instagram stories, print menus, future formats) live in `design/`. Each is a self-contained HTML file sized for its output format.

**`design/tokens.css`** — shared source of truth for all templates. Mirrors the site's `:root` tokens: font family, weights, tracking, colors, opacity values. Every template imports it via `<link rel="stylesheet" href="tokens.css">`. Template-specific layout CSS stays in the HTML file itself.

To change the font or any global token across all templates: edit `tokens.css` only.

**Naming convention:** `[format]-[subject].html` — e.g. `story-serie.html`, `menu-a4.html`.

**Export workflow (Chrome DevTools):**
1. Open the HTML file in Chrome.
2. DevTools → device toolbar → custom size matching the canvas dimensions.
3. Three-dot menu → "Capture screenshot" → exact-pixel PNG saved to Downloads.
4. Transfer to phone → upload as story or send to printer.

**What to edit per série** is documented in a comment block at the top of each template's `<style>` tag.

---

## Use

This doc holds the principles. The CSS holds the visual values. The `data/*.json` files hold the operational state. The `design/` folder holds static design assets. The positioning doc holds the brand. The communication doc holds the voice. When all of them agree, the system is intact.

---

*End of v2.1.*
