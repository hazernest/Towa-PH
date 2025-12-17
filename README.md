# Towa-PH
Static marketing/support site for Towa Semiconductor Equipment Philippines — molding &amp; singulation focus, Netlify-ready with Netlify Functions.

## Customer Portal & Serverless functions

This repo includes a simple Customer Portal and Netlify Functions that integrate with Supabase. For full functionality you should configure the following environment variables in Netlify (or your deployment environment):

- `SUPABASE_URL` — your Supabase REST endpoint base URL (e.g. `https://xyz.supabase.co`).
- `SUPABASE_ANON_KEY` — optional read-only key for public reads (required for `get-tickets`).
- `SUPABASE_SERVICE_ROLE_KEY` — server-only service role key used by `create-request` if available (keep this secret).

If env vars are not set, the functions return mocked data to make local dev easier.

### Files added

- `customer.html` — basic Customer Portal UI to view requests.
- `netlify/functions/get-tickets.js` — serverless function returning recent requests (reads Supabase or returns mock data).
- `netlify/functions/create-request.js` — improved validation and JSON responses for request submissions.

### Deploy notes

1. Add the environment variables to Netlify: `SUPABASE_URL`, and at minimum `SUPABASE_ANON_KEY`. For secure inserts, add `SUPABASE_SERVICE_ROLE_KEY` as a protected secret.
2. Deploy via GitHub / Netlify as a static site (no build step required by default). `netlify.toml` is configured to publish the repository root and use `netlify/functions` for functions.

Security: keep `SUPABASE_SERVICE_ROLE_KEY` server-only and do not expose it to clients. Verify RLS policies in Supabase if using anon keys.
