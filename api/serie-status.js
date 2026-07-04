/* ============================================================
   GET /api/serie-status
   ============================================================
   Reports whether preorders are currently open, so the front-end
   can lock the PRÉCOMMANDER button *before* a customer ever opens
   the payment form — no error is shown on the customer's screen.

   open === true  ⟺  deadline not passed AND the série's Airtable
   record exists (so the order can actually be logged by Make).

   Fails OPEN: if the Airtable check can't run (missing config or
   API error), it reports open and the site behaves exactly as it
   does today — this endpoint can only ever *lock* preorders when
   Airtable is genuinely missing, never break ordering. Slip-throughs
   stay covered by Make's existing charge-through + fix-up fallback.

   Config (Vercel env vars — all four required for the Airtable gate;
   if any is unset the gate is skipped and it falls back to deadline):
     AIRTABLE_TOKEN            — PAT with data.records:read on the base
     AIRTABLE_BASE_ID          — e.g. appXXXXXXXXXXXXXX
     AIRTABLE_SERIES_TABLE     — table holding one record per série
     AIRTABLE_SERIES_NAME_FIELD — field Make matches on (= series.name)
   ============================================================ */

const serie = require('../data/serie.json');

function isPastDeadline(series) {
  if (!series || !series.preorder_deadline_iso) return false;
  return Date.now() >= new Date(series.preorder_deadline_iso).getTime();
}

// null  = check not configured (unknown → caller fails open)
// true  = record found
// false = record definitively missing
async function airtableRecordExists(seriesName) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_SERIES_TABLE;
  const field = process.env.AIRTABLE_SERIES_NAME_FIELD;
  if (!token || !baseId || !table || !field) return null;

  const value = String(seriesName).replace(/'/g, "\\'");
  const formula = `{${field}} = '${value}'`;
  const url = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(table)
    + '?filterByFormula=' + encodeURIComponent(formula) + '&maxRecords=1';

  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) throw new Error('Airtable responded ' + r.status);
  const data = await r.json();
  return Array.isArray(data.records) && data.records.length > 0;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Brief edge cache bounds Airtable calls to ~1/30s regardless of traffic.
  // The deadline is still enforced instantly client-side and in the payment
  // API, so staleness here only ever delays the slow-changing Airtable gate.
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');

  const pastDeadline = isPastDeadline(serie.series);
  let airtableReady = true; // fail open

  if (!pastDeadline) {
    try {
      const exists = await airtableRecordExists(serie.series.name);
      if (exists === false) airtableReady = false;
      // null (not configured) or a thrown error → stays true (fail open)
    } catch (err) {
      console.error('serie-status Airtable check failed:', err.message);
    }
  }

  return res.status(200).json({ open: !pastDeadline && airtableReady });
};
