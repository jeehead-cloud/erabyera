# EraByEra — Deployment and Operations

**Status:** Local application foundation; not deployed
**Last updated:** 2026-07-17
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This document is the operational source of truth for running, validating,
> building, and later deploying EraByEra.

---

## 1. Current State

EraByEra is a client-side React, TypeScript, and Vite application. F1 provides the application shell and routes, but no production, staging, CI/CD workflow, or hosting provider is configured.

The production build is a static `dist/` directory. There is no server process, backend, database, migration, or runtime secret in F1.

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

These scripts exist and were verified on 2026-07-17:

```powershell
npm run typecheck
npm run lint
npm run build
```

The scripts perform:

- `typecheck`: TypeScript project-reference checking without emitted application files;
- `lint`: ESLint checks for the repository, excluding generated and design-reference directories;
- `build`: TypeScript checking followed by a Vite production build into `dist/`.

There is currently no `test`, `data:validate`, or `preview` script. Do not report those checks as run, and add them only when a milestone introduces real test, data-validation, or preview requirements.

On Windows systems where PowerShell blocks `npm.ps1`, invoke the same scripts through `npm.cmd`, for example `npm.cmd run lint`.

---

## 5. Client-Side Routing

F1 uses React Router's `createBrowserRouter` and defines `/map`, `/explore`, and `/sources` as client-side routes. `/` redirects to `/map`, and unknown client routes render the application not-found page.

A static host must rewrite unresolved application paths to `/index.html`. Without this fallback, opening or refreshing `/map`, `/explore`, or `/sources` directly may produce a host-level 404 before the application loads.

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

Candidate providers remain Cloudflare Pages, Vercel, Netlify, and GitHub Pages. No provider has been selected, and provider-specific configuration must not be added without owner instruction.

---

## 7. Basemap, Data, and Asset Operations

No map, historical data, external image, or external webfont ships in F1.

Before later public deployment:

- confirm the basemap and dataset licenses;
- document required attribution and keep it visible in the product;
- confirm tile-provider production terms and request limits;
- avoid undocumented free tile endpoints;
- confirm icons, fonts, flags, and historical assets may be redistributed.

Never commit private tokens. If a future browser-safe public token is required, document its variable name, exposure model, local setup, hosting setup, and usage limits here.

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

---

## 10. When to Update This Document

Update this document when actual commands change, tests or data validation are introduced, a hosting provider or production URL is selected, environment variables or CI/CD are added, or the deployment architecture changes.

---

## Guiding Rule

**Keep operations as simple as the actual product requires, and document licenses as carefully as code.**
