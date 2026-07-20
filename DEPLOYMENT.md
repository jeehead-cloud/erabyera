# EraByEra — Deployment and Operations

**Status:** F18 static release candidate; owner deployment verification pending
**Last updated:** 2026-07-20
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This document is the operational source of truth for running, validating,
> building, and later deploying EraByEra.

---

## 1. Current State

EraByEra is a client-side React, TypeScript, and Vite application with a repository-managed static data pipeline. No production, staging, CI/CD workflow, or hosting provider is configured.

The production build is a static `dist/` directory. There is no server process, backend, database, migration, or runtime secret.

---

## 2. Requirements and Installation

Use a Node.js/npm version compatible with the versions locked in `package-lock.json`. From the repository root:

```powershell
cd C:\Projects\erabyera
npm install
```

For reproducible clean installations in CI or a fresh checkout, use:

```powershell
npm ci
```

Do not reinstall dependencies merely because `node_modules` already exists; first confirm `package.json` and the lockfile changed or the installed tree is invalid.

---

## 3. Local Development

Start Vite only when interactive local development is required:

```powershell
npm run dev
```

Use the local URL printed by Vite. It is commonly `http://localhost:5173/`, but the command output is authoritative. Stop the process when the development session ends.

---

## 4. Current Validation Commands

These scripts exist and were verified during F18 on 2026-07-20:

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
npm run data:validate
npm run data:check
```

The scripts perform:

- `typecheck`: TypeScript project-reference checking without emitted application files;
- `lint`: ESLint checks for the repository, excluding generated and design-reference directories;
- `test`: non-interactive Vitest unit tests in a Node environment;
- `build`: TypeScript checking followed by a Vite production build into `dist/`.
- `data:validate`: read-only strict validation of canonical JSON, references, overlap policy, and GeoJSON;
- `data:check`: read-only deterministic comparison of canonical inputs with committed runtime output.

`npm run data:build` intentionally writes the four files in `data/generated/`, including the bundled local `search-index.json`; use it after canonical source, geometry, or search-generation changes, then rerun `data:check`. Generated files are committed and must never be hand-edited. `npm run preview` serves the existing production build for local smoke testing; it is not proof that a deployed host has the required SPA fallback. An optional `npm run test:watch` script runs Vitest in watch mode.

On Windows systems where PowerShell blocks `npm.ps1`, invoke the same scripts through `npm.cmd`, for example `npm.cmd run lint`.

---

## 5. Client-Side Routing

React Router's `createBrowserRouter` defines `/map`, `/explore`, five `/explore/<catalog>` routes, `/collections`, `/collections/:collectionId`, `/sources`, and stable `/place/:id`, `/polity/:id`, `/person/:id`, `/event/:id`, and `/journey/:id` client-side routes. `/` redirects to `/map`, and unknown client routes render the application not-found page.

A static host must rewrite unresolved application paths to `/index.html`. Without this fallback, opening or refreshing any Map, Explore catalog, Collection, Sources, or stable entity route directly may produce a host-level 404 before the application loads.

No provider-specific rewrite file is committed because no hosting provider has been selected. Add and document the provider's fallback only when deployment is authorized.

---

## 6. Static Deployment Model

The expected deployment artifact is `dist/` from:

```powershell
npm run build
```

Any selected static host must:

- serve the generated `dist/` contents;
- use HTTPS;
- provide the client-route fallback described above;
- preserve static asset caching without caching `index.html` indefinitely;
- require no private runtime token for the current F1 application.

The host should avoid long-lived caching for `index.html`, may cache content-hashed `/assets/*` immutably, and may cache the version-controlled `/map-data/*` files with a reviewed invalidation policy.

Candidate providers remain Cloudflare Pages, Vercel, Netlify, and GitHub Pages. No provider has been selected, and provider-specific configuration must not be added without owner instruction.

---

## 7. Basemap, Data, and Asset Operations

F5 ships MapLibre GL JS and four local Natural Earth 1:110m physical GeoJSON files. The application makes no runtime tile-provider request and requires no basemap token, account, environment variable, quota, or rate-limit handling. Natural Earth declares its data public domain; visible attribution still reads “Made with Natural Earth.” Exact provenance, hashes, license links, style exclusions, and limitations are recorded in `docs/BASEMAP.md`.

Static hosting must serve `/map-data/*.geojson` with JSON-compatible content types and should cache the version-controlled files. MapLibre creates a Web Worker and uses WebGL; a future Content Security Policy must follow the official MapLibre requirements, including appropriate `worker-src`/`child-src` blob allowances unless the separate CSP bundle and worker are configured.

Before public release, verify in an ordinary browser that:

- all four same-origin GeoJSON requests succeed;
- WebGL initializes without console errors;
- MapLibre and Natural Earth attribution remain visible at desktop and mobile widths;
- no modern political boundary or settlement label is visible;
- the future host’s bandwidth and caching are appropriate for the roughly 353 KB uncompressed physical dataset.

Never commit private tokens. Any future provider or higher-resolution dataset must be separately reviewed for license, attribution, client-token exposure, production terms, request quotas, caching, and redistribution rights before replacing or extending this local style.

---

## 8. Repository and Git

Verified context:

```text
Repository: erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Main branch: main
Local path: C:\Projects\erabyera
```

Only commit or push when explicitly requested. Before a future commit, inspect the exact status and diff and run all scripts that exist for the milestone.

---

## 9. Deployment Checklist

Before the first public release:

- all configured validation passes;
- the production build succeeds;
- the host serves direct routes and refreshes through the `index.html` fallback;
- browser navigation, console, responsive layout, and keyboard behavior are manually checked;
- basemap and data licenses are documented when those assets exist;
- required attribution is visible;
- no private tokens, local paths, `node_modules`, or build intermediates are published as source;
- `CURRENT_STATUS.md` records the production URL and current limitations.

Smoke-test `/map`, every Explore catalog, one route for each entity type, `/collections/alexanders-world`, and an unknown route by direct address and refresh. Roll back by atomically restoring the previous known-good static artifact/deployment and invalidating `index.html`; never mix assets from different builds. The complete operational gate is in `docs/RELEASE_CHECKLIST.md`.

## 10. Production bundle observation

F18 route-level lazy loading reduced the main application JavaScript chunk from 584.04 kB to 189.54 kB minified in the measured production build. MapLibre remains isolated at 1,027.75 kB minified (272.98 kB gzip) and is the sole chunk above Vite's 500 kB advisory. This warning is accepted foundation debt: suppressing it would not reduce payload, and more brittle manual splitting is not justified.

---

## 11. When to Update This Document

Update this document when actual commands change, tests or data validation are introduced, a hosting provider or production URL is selected, environment variables or CI/CD are added, or the deployment architecture changes.

---

## Guiding Rule

**Keep operations as simple as the actual product requires, and document licenses as carefully as code.**
