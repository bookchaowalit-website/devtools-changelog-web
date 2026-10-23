# Changelog — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `changelog`, evidence Prototype) on 2026-10-23.

## What it is

A client-side release-notes list kept in the visitor's browser, seeded with two sample lines.

## Who it is for

A portfolio visitor (or the owner) who wants a quick scratch list of release lines.

## What works today

1. Append a line with a title, details and state (Draft or Released); a blank title is refused.
2. Search title, details and state (case-insensitive); delete a line.
3. Lines persist in localStorage (`changelog-v1`) in this browser only. Dates print in UTC.
4. `/api/mcp` answers JSON-RPC `initialize` and an empty `tools/list`, echoes the request id and returns JSON-RPC
   errors for tool calls and unknown methods.
5. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No aggregation of release notes across portfolio projects, no commit links, no per-project subscriptions (claims
  removed from the portfolio card in the 2026-10 review).
- The two seed lines are sample copy, not real releases. The unused `data/changes.json` template was deleted on
  2026-10-23.
- No account, sync, export or sharing; clearing site data loses the lines.

## Live URL and deploy state

- Live: https://changelog.bookchaowalit.com (HTTP 200 on 2026-10-23).
- The Vercel project `bookchaowalit-changelog-frontend` is deployed only by CLI. Last production deploy:
  2026-10-08, CLI, commit e253bf4 (Next 16.3.8). The CVE patch (Next 16.4.2) was not deployed before Vercel's daily
  deployment quota ran out on 2026-10-23; the coordinator deploys the latest green `main` after the quota resets.
  Its Git link names the old repository `bookchaowalit/bookchaowalit-changelog-frontend`, so a push to `main` does
  not deploy until the owner reconnects Vercel Git to `bookchaowalit-website/devtools-changelog-web` (owner action D9).
- `NEXT_PUBLIC_SENTRY_DSN` is set on the Vercel project (Sentry project `devtools-changelog-web`, org `personal-yu0`).

## Boundaries

- Browser-only apart from the stateless `/api/mcp` route. No personal data is collected.
