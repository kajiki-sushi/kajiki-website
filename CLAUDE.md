# KAJIKI — working rules

Static site, no build step: `index.html` + `pages/*.html`, one stylesheet, vanilla JS modules, Vercel serverless functions in `api/`. Deploy is a push to `main`.

**Read the code for facts.** It's ~2,500 lines and it's always current. This file holds only what the code can't tell you: decisions, prohibitions, and contracts with systems outside this repo.

---

## Context — Notion

**Operational documentation lives in Notion, not this repo.** Before working on the site, its functions, Make, Airtable or Resend, fetch the KAJIKI Index:

https://app.notion.com/p/3d79c5815e1d818ebc7cebb18f4faf6c

Fetch what the task touches — usually **Website**, **Services** or **Operations**.

**You own those three pages** — and the Index. If you create, rename, move or retire a page under KAJIKI › System, update the Index entry in the same session; a wrong Index sends a session to the wrong place with no signal that anything is off. Read the three pages against the live code before working; if one no longer matches reality, correct it in that same session and update its *Last verified* date. **Don't edit the Doctrine pages** — those are written from the Claude app.

**If Notion is unreachable, say so before proceeding.**

---

## Aesthetic law

Minimalist, brutalist, laboratory. Black `#111` on white.

**Opacity is the only modulation. No color enters the system, ever.** Anything that would use color elsewhere uses opacity here.

**Opacity means interactive state** — quiet links at rest, hover, disabled. Never apply it to static text as a hierarchy or secondary-information device.

**Everything centers.** Header and footer are the only exceptions.

Mobile-first: mobile is the default, one breakpoint at `800px`, and that block redefines tokens only — never structure.

---

## Architecture invariants

**Per-série values live in `data/*.json`, never in HTML or JS.** If a value would change from one série to the next, it belongs in JSON. Stable values can live elsewhere.

**Tokens are canonical.** A value that repeats or scales goes in `:root`. Introduce a token rather than hardcode one. Where a hardcoded value has to survive, mark it `/* FLAG: hardcoded */` so it stays findable — never leave one silent.

**`preorder_deadline_iso` is the only deadline with teeth.** It's enforced server-side and client-side. `preorder_deadline` is display text and must never be read by logic.

**A série is always visible. There is no dormant or off state.** Preorders open when `serie.json` describes a future deadline and the Airtable record exists; they close otherwise. Closing hides the payment screen and locks the button — it never takes the série down.

**JS reads and writes `data-*`; CSS styles classes.** The two roles don't mix. The single exception is `data-serie-*`, which doubles as a CSS selector for the loading-opacity rule, because there the hook and the visibility are the same concern.

---

## Don't

These are decisions, not observations. The code won't tell you them, and each one has been arrived at deliberately.

- **Don't add a base `.specsheet` class.** `--design` and `--admin` are standalone variants on purpose.
- **Don't drift the specsheet variants toward each other.** The register difference — designed object vs. reference table — is the point of having two.
- **Don't treat `.archive-sheet` as a third variant.** It's layout only, and deliberately frameless.
- **Don't add a fifth type style** without removing an unused one.
- **Don't hardcode pickup-day options** in HTML. `serie.js` builds them from `serie.json`.
- **Don't leave dead code** behind a change — selectors, classes, elements, downstream references all go with it. Nothing survives on "might come back."

---

## Contracts with the outside world

**Stripe metadata → Make.** These keys are read by a Make scenario that lives outside this repo. Renaming one breaks order logging silently, on the Make side, where it isn't visible from here:

`series_name` · `quantity` · `pickup_day_short` · `pickup_day_full` · `pickup_window` · `pickup_location_html` · `pickup_location_link` · `customer_name` · `customer_email`

**The série name is one exact string across three systems** — `serie.json` → `series.name`, the Airtable Séries record, and what Stripe/Make match on. Accents, capitalisation and spacing included. Names are never reused: sold-out counting is per name, so a reused name would count old orders against new stock.

**Price is computed server-side** from `serie.json`, in cents. The client cannot influence the amount.

**The Airtable gate fails open.** `serie.js` asks `/api/serie-status` whether the série's Airtable record exists and locks preorders when it doesn't — so a série launched without its record reads as closed rather than taking orders Make can't log. If Airtable is unreachable, or any of the four `AIRTABLE_*` Vercel env vars is unset, the check is skipped and preorders stay open. It's a UX gate, not a hard server guard; Make's visible error is the real backstop.

**Known gap: no rate limiting.** Vercel serverless has no built-in throttling. The `ALLOWED_ORIGINS` check stops naive curl spam but not a determined attacker; Stripe's own limits are the final backstop. Real protection needs Upstash Redis or similar — unbuilt, tracked as future work.

---

## Code practices

**Language discipline.** Class names, JS identifiers and comments: English. Anything a customer reads: French. Non-negotiable.

**Naming.** Components `block` / `block-element` / `block--modifier`. Utilities single-level and descriptive. State classes `is-` prefixed. JS hooks are `data-*` attributes.

**Cache-bust.** `.js` and `.css` are cached by a `?v=N` on their tags. When a file's contents change, its `?v=` goes up in *every* HTML page that loads it — otherwise returning visitors keep running the old copy. Data JSON is served `no-store` and needs none.

**Tab titles.** `KAJIKI®` on the homepage, `KAJIKI® — [Page name]` everywhere else. Registered mark, em dash, French capitalisation rules.

**Coherence over novelty.** Reuse needs no justification. A new pattern needs one.

---

## Keeping the docs true

A change that outdates a doc updates it **in the same commit**. Not afterwards, not when someone notices. Docs that lag the code stop being trusted, and an untrusted doc is worse than no doc.

What to check, and only when the change actually touches it:

- **This file** — only when a *decision* changes: a new prohibition, a dropped one, a new cross-system contract. Never for a change the code now describes on its own. Keeping it small is the point; adding to it needs the same justification as a new pattern.
- **Notion → Services** — when the Stripe metadata keys change, when a Make module or its error handling changes, when the Airtable schema changes, or when a new env var appears. Its facts came from inspecting the live systems; re-inspect rather than guess.
- **Notion → Operations** — when a recipe's steps change, or when something moves between "Claude does" and "you do".
- **Notion → Website** — only when the *model* changes: how ordering works, what a unit is, the lifecycle. Not for copy edits or a new page. It points at the code for wording on purpose.

Before writing a line into any of them, apply the same test that produced them: **could a session work this out by reading the code?** If yes, don't write it. Only decisions, prohibitions, and things living outside this repo earn a line.

Say what you updated, and say when you deliberately updated nothing.

---

## Design assets

`design/` holds self-contained static templates — Instagram stories, print menus — named `[format]-[subject].html`. Each imports `design/tokens.css`, which mirrors the site's `:root`; change a global token for every template there and nowhere else. Per-série edits are documented in a comment at the top of each template's `<style>`.
