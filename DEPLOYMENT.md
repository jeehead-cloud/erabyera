# EraByEra вЂ” Deployment and Operations

**Status:** Not deployed; repository setup pending
**Last updated:** 2026-07-10
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This document is the operational source of truth for running, building, and later deploying EraByEra.
> Commands below marked вЂњexpectedвЂќ become authoritative only after the repository is created and verified.

---

## 1. Current State

No production, staging, CI/CD workflow, or configured hosting provider is claimed yet.

The planned application is fully client-side for the MVP, so deployment should eventually be static hosting of the Vite `dist/` directory.

---

## 2. Expected Local Development Workflow

After M0 creates the repository:

```powershell
cd C:\Projects\erabyera
npm install
npm run dev
```

Expected local URL is typically:

```text
http://localhost:5173/
```

The actual URL printed by Vite is authoritative.

---

## 3. Expected Validation Commands

```powershell
npm run typecheck
npm run lint
npm run test
npm run data:validate
npm run build
npm run preview
```

The scripts must be confirmed in `package.json`. Until then, they are planned conventions, not guaranteed commands.

---

## 4. Static Deployment Model

With no backend:

- build output: `dist/`;
- no server process;
- no database;
- no migrations;
- no runtime secrets expected for the MVP;
- historical data ships as static assets;
- any static hosting provider can potentially work.

Candidate providers include Cloudflare Pages, Vercel, Netlify, and GitHub Pages. No provider has been selected.

**Do not add provider-specific files without explicit owner instruction.**

---

## 5. Basemap and Asset Operations

Before any public deployment:

- confirm the basemap license;
- confirm whether tiles may be used directly from the provider;
- record required attribution;
- confirm request limits and production terms;
- avoid depending on an undocumented free tile endpoint;
- ensure all icons, flags, fonts, and historical datasets may legally be redistributed.

Attribution must be visible in the application where required.

---

## 6. URL Routing

The initial app is expected to use query parameters rather than server routes for map state, which simplifies static hosting.

If client-side routes are added later, configure static-host fallback to `index.html` and document the provider-specific rule here.

---

## 7. Environment Variables

No environment variables are currently planned for the MVP.

If a tile provider requires a public browser token, document:

- variable name;
- whether it is safe to expose client-side;
- local `.env` setup;
- hosting configuration;
- usage limits.

Never commit private tokens.

---

## 8. Future Backend Trigger

Revisit deployment architecture only if a real feature requires:

- user accounts;
- cloud bookmarks;
- collaborative editing;
- content moderation;
- server-side search;
- private datasets;
- analytics requiring a server component.

A backend introduction requires coordinated updates to `ARCHITECTURE.md`, this file, and relevant data rules.

---

## 9. Repository and Git

Planned context:

```text
Repository: erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Main branch: main
Local path: C:\Projects\erabyera
```

Only commit and push when explicitly requested.

Before committing:

```powershell
git status
git diff --stat
npm run build
```

---

## 10. Deployment Checklist

Before the first public release:

- production build passes;
- preview build tested locally;
- basemap and data licenses documented;
- required attribution visible;
- URL state survives refresh;
- direct public URL opens correctly;
- no private tokens or local paths shipped;
- browser console has no production errors;
- mobile layout is usable;
- large data assets have acceptable load size;
- `CURRENT_STATUS.md` contains the production URL and current limitations.

---

## 11. When to Update This Document

Update when:

- repository remote is created;
- actual local commands differ from the planned commands;
- hosting provider is selected;
- a production URL exists;
- environment variables are introduced;
- CI/CD is added;
- a backend is introduced.

---

## Guiding Rule

**Keep operations as simple as the actual product requires, and document licenses as carefully as code.**
