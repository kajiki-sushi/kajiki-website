# KAJIKI — Operations Manual

*The month-to-month runbook. Pairs with `KAJIKI_Design_v2.md` (the design system) — that doc is about how the site looks and why; this one is about how you run it.*

---

## How to use this

You have two ways to make any change below:

- **Do it yourself** with the checklist for that operation, or
- **Ask Claude** in plain language — e.g. *"Launch Série 03, dates 20–21 sept, deadline 14 sept, price 95 €, same pickup spot"* or *"Close preorders"* or *"Push the deadline to next Friday."* Each recipe says exactly what changes, so Claude knows what your request implies.

**Who does what:**

| Claude does | You do |
|---|---|
| Edits the code + data files (`serie.json`, `archive.json`, HTML, CSS, JS) | Create/edit the **Airtable** record (Claude can't reach your base) |
| Keeps names/prices/versions in sync, bumps cache-bust `?v=` | **`git push`** to deploy (Vercel auto-builds) |
| Tells you the exact Airtable record to make + when to push | Confirm the result on the live site |

Claude handles the fiddly, easy-to-forget bits for you (cents conversion, cache-bust bumps, keeping the name identical across files). This doc exists so you *can verify* what happened — not so you have to memorise it.

> Automating the Airtable + deploy steps (so a single sentence does everything) is the planned **hybrid Airtable migration** — deliberately not built yet. For now, Airtable and the push are your two manual touchpoints.

---

## The five invariants (ignore these and something breaks)

1. **The série name is ONE string in three places.** `serie.json` → `series.name` **=** the Airtable Séries record's name **=** what Stripe/Make match on. Exact — accents (`é`), capitalisation, spacing, digits (`Série 03`, not `Serie 3`). A mismatch means the button stays locked (the gate can't find the record) **and** Make can't log the order.

2. **Names must be unique per série.** Sold-out counting is per `series.name`. Reusing a past name would make old orders count against the new série's stock. Always a fresh name (`Série 03`, `Série 04`…).

3. **Price is in CENTS.** `price_per_unit_cents: 9500` = 95,00 €. A cents/euros slip mis-charges by 100× (9 500 € instead of 95 €). This is the scariest field — always double-checked.

4. **The deadline with teeth is the ISO one.** `preorder_deadline_iso` (with the `+02:00` timezone) is what's actually enforced — server-side in the payment API *and* client-side to lock the button. `preorder_deadline` is only the words shown on screen. Keep them consistent, but only the ISO field controls anything.

5. **A série is always visible — there is no "off."** The only two states are:
   - **Preorders OPEN** — future deadline **and** the Airtable record exists.
   - **Preorders CLOSED** — past deadline **OR** the Airtable record is missing. The série still shows; the PRÉCOMMANDER button locks and the payment screen hides.

---

## Deploying & the cache-bust rule

- **Deploy = `git push`.** Vercel rebuilds automatically.
- **Data files** (`serie.json`, `archive.json`) are served `no-store` → changes show the instant the deploy lands. No cache-bust needed.
- **Code files** (`.js`, `.css`) are cached by browsers via a `?v=N` on their `<script>`/`<link>` tag. If a code file's *contents* change, its `?v=` must go up in **every** HTML page that loads it, or returning visitors keep running the old copy. **Claude does this automatically** whenever it edits a script or style — you don't have to track it.

---

## Recipes

### ▸ Launch a new série
*Ask: "Launch Série 03 — dates …, deadline …, price …, pickup …"*

1. **You, in Airtable (do this first):** create the Séries record with the name field set to exactly the new name (e.g. `Série 03`). Copy any other fields from a previous série's record — Claude doesn't know your full Airtable schema, only that the name field must match.
2. **Claude, in `serie.json`:** `series.name` (= the Airtable name), `dates`, `preorder_deadline` + `preorder_deadline_iso` (future, `+02:00`), `price_per_unit_cents` (cents), `max_quantity_per_order`, and each `pickup.days[]` entry (`value`, `label`, `full_label`, `window`, `max_quantity`). Plus `pickup.location_html` / `location_link` if the spot changed.
3. **Claude, in `archive.json`:** prepend the série that just finished (see *Update the archive*).
4. **Claude:** swap product photos if you have new ones (see *Swap product photos*).
5. **You:** `git push`.
6. **Verify:** on the live homepage, PRÉCOMMANDER is clickable. If it's locked despite a future deadline → the name doesn't match the Airtable record (invariant #1). Allow ~1 min — the status check is cached ~30 s.

### ▸ Close preorders early (before the deadline)
*Ask: "Close preorders."*

- **Claude, in `serie.json`:** set `preorder_deadline_iso` to now / the past (and match the `preorder_deadline` display string). Since there's no on/off flag, **the deadline is the switch** — this locks the button (client + server) and hides payment; the série stays visible.
- **You:** `git push`.
- *(Reverse it with "Extend preorders" below.)*

### ▸ Reopen / extend preorders
*Ask: "Extend preorders to <date>."*

- **Claude, in `serie.json`:** set `preorder_deadline_iso` to the new future timestamp (`+02:00`) and update the `preorder_deadline` display string to match.
- **You:** `git push`.

### ▸ Change data on the live série (price, dates, pickup times, location, caps)
*Ask: "Change the price to 78 €" / "Saturday pickup is now 15h–19h" / "Cap Friday at 15."*

- **Claude, in `serie.json`:** edits the specific field(s). Price stays in cents.
  - `max_quantity_per_order` also drives the quantity dropdown in `index.html` (hardcoded `1`–`6`) — Claude keeps both in sync if you change it.
  - Per-day stock = `pickup.days[].max_quantity` (the auto sold-out cap for that day).
- **If the série NAME changes:** it must change in Airtable too (invariant #1) — Claude will flag it and hand you the Airtable edit.
- **Note:** a price change applies to **new** orders only. Anyone already paid was charged the old price (that lives in Stripe, not here).
- **You:** `git push`.

### ▸ Update the archive
*Ask: "Add Série 02 to the archive — Juin 2026, Thon Rouge / Crevette Rose / Maquereau."*

- **Claude, in `archive.json`:** prepend an entry (newest first) — `header` (the big numeral, e.g. `"03"`), `month` (e.g. `"Juillet 2026"`), `fish` (array of fish names, stacked one per line, e.g. `["Thon Rouge", "Sériole"]`).
- **You:** `git push`.

### ▸ Swap product photos
*Ask: "Use these two photos for the série."*

- **You:** drop the files in `assets/images/` (or hand them to Claude). Prefer **new filenames** — a new name busts the cache on its own; reusing a filename would serve the old image.
- **Claude:** point the two product `<img>` tags in `index.html` at them (the `#product` and `#product-2` screens).
- **You:** `git push`.

---

## Automatic behaviours (you never touch these)

- **Deadline auto-closes** preorders at `preorder_deadline_iso` — no action needed at the cutoff moment.
- **Per-day sold-out** is automatic: the payment API sums succeeded Stripe orders for that série + day and refuses once `max_quantity` is hit ("Jour complet").
- **Missing-Airtable lock** is automatic: if the série's Airtable record doesn't exist, the button stays locked (see the Airtable gate in `KAJIKI_Design_v2.md`).

---

## What Claude can't do (yet)

- **Reach your Airtable.** It prepares the exact record for you to create/edit; the Airtable step is yours.
- **Push / deploy, or edit Vercel env vars.** Claude leaves the repo edited and ready; you `git push`. The four `AIRTABLE_*` env vars that power the button-gate live in Vercel and are set by you.

Both of these are exactly what the future **hybrid Airtable migration** is meant to fold in.
