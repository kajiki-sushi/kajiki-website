# KAJIKI — what the site is

*Context for discussing positioning, marketing and communication.*

*This doc describes the model and the register — the things that hold still. It deliberately does not reproduce site copy or enumerate every page, because those change and a doc that mirrors them goes stale silently. For exact current wording, read `index.html` and `pages/`; for current dates and prices, read `data/serie.json`.*

---

## The business

KAJIKI sells Mediterranean sushi in **limited monthly runs called *séries***, by preorder, for pickup in Montpellier. The fish comes from the criée de Sète.

The defining constraint, and the thing the whole brand is built on: **the composition is not decided in advance.** It's determined after the catch, by what the criée actually landed that day. The site sells a série before anyone — KAJIKI included — knows exactly what will be in it.

One série is live at a time. There is no menu, no catalogue, and no permanent product.

## The série lifecycle

1. A série goes up on the site with its dates, a preorder deadline and a price.
2. Customers preorder and pay in full, choosing a quantity and a pickup day.
3. The deadline passes and preorders close automatically.
4. The fishing happens **after** the close — so the run is sized to real demand rather than guessed.
5. Customers collect on their chosen day at the announced spot.
6. The finished série moves into the site's Archive with its composition, its catch date and the boats it came from.

There are only two states: preorders **open** or **closed**. The série stays visible either way — closing locks the order button, it doesn't take the série down.

## What one unit is

A box of sushi, futomaki and maki — 16 pieces, ~500 g net, with ginger, soy and wasabi. Made by KAJIKI. Recent séries have priced in the 90–100 € range; the live figure is always in `data/serie.json`.

## The customer journey

The homepage is a **vertical stack of full-screen panels**, each holding a single idea, met in sequence: the premise → product photography → the spec of what's in the box → the live série with its deadline and the PRÉCOMMANDER button → the payment form → the Archive.

That order is the argument. The customer meets the *idea* — monthly, composition determined after the catch, from the criée de Sète — before they meet the product, and the price before they meet the form. The Archive sits last as evidence: proof that previous séries happened, and what was in them.

Payment is inline. It opens as a panel rather than sending the customer to a checkout page, and closing it returns them to where they were. After paying they get a confirmation email carrying the pickup day, window and address.

Supporting pages sit in the footer rather than in the flow — pickup details, allergens, cancellations, contact and legal, privacy. Each exists to answer one question and get out of the way. The current set is in `pages/`.

## The register

French throughout for customers. Sparse and declarative: noun phrases over sentences, almost no adjectives, no exclamation. *"Série mensuelle. Composition déterminée après la pêche."* Facts, stated once, not sold.

Visually: black on white, one typeface, no color anywhere in the system. Specification sheets — label left, value right — carry most of the information. The site reads like a technical document about fish.

The intended feeling: **a brand that studies things, and the studying is resolved.** Controlled, surgical, unhurried. Nothing on the page is trying to persuade; the restraint is the persuasion.

## What the site deliberately doesn't do

Each of these is a decision rather than an omission, so it's worth knowing before proposing anything:

- No color, no illustration, no decorative motion.
- No hero copy, no tagline, no "about us" story page.
- No newsletter capture, no popups, no urgency devices — no countdown timers, no "only X left".
- No account system. An order is an email address and a card, nothing more.
- No ecommerce catalogue. Never more than one thing for sale.
- No claims about sustainability, craft or provenance beyond the plain facts: criée de Sète, named boats, catch date.

The scarcity here is real and structural, which is exactly why it's never dramatised. That restraint is the brand's main asset and the easiest thing to spend by accident.

## Where the current facts live

| | |
|---|---|
| Live série — name, dates, deadline, price, pickup days | `data/serie.json` |
| Past séries — composition, catch date, boats | `data/archive.json` |
| Homepage copy and panel order | `index.html` |
| Footer pages | `pages/` |
| How a série is launched and run | `KAJIKI_Operations.md` |
| How the systems connect — Stripe, Make, Airtable, Resend | `KAJIKI_Systems.md` |
| Code rules and design decisions | `CLAUDE.md` |

Anything time-sensitive should be read from those rather than assumed from this doc.
