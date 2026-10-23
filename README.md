# Changelog (Release Stream)

A browser-local release-notes list: two seed lines (0.2.0, 0.1.0), search by title, details or state, append a line
(title, details, Draft or Released) and delete one. Lines stay in this browser (localStorage). There is no feed from
the portfolio repositories.

Live: https://changelog.bookchaowalit.com (deployed by Vercel CLI; it can lag `main`, see `PRODUCT.md`).

## What it does not do

- No aggregation of release notes across portfolio projects, no commit links, no per-project subscriptions.
- No account, sync or export; nothing leaves the browser.
- `/api/mcp` answers `initialize` and an empty `tools/list` and rejects every tool call, because the lines live in
  the browser.

## Run

```bash
npm ci
npm run dev
```

## Checks

```bash
npm test           # Vitest: changelog logic, local store, MCP route, home page render, Sentry scrubbing
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs the shared Node workflow (lint, typecheck, tests with a line-coverage gate,
build) and the shared security scan on every push and PR to `main`.

## Code map

- `lib/changelog.ts`: statuses, seed lines (fixed dates), parse, filter, add, remove and UTC date formatting.
- `lib/local-store.ts`: small `useSyncExternalStore` store over localStorage (server and hydration see the seed,
  storage failures fall back to memory).
- `app/api/mcp/route.ts`: stateless JSON-RPC endpoint with no tools (see above).
- `lib/sentry.ts` + `instrumentation*.ts`: error reporting to Sentry, errors only, personal data stripped; off when
  `NEXT_PUBLIC_SENTRY_DSN` is unset.
- `app/more-projects/page.tsx`: shared portfolio link page (copied per repository, not a package).
