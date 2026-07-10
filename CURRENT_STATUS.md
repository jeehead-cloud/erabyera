# EraByEra вЂ” Current Status

**Status:** Pre-development planning
**Last updated:** 2026-07-10
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This file records what is actually implemented today.
> It must remain factual and must be reviewed after every Cursor iteration
> (every user prompt that results in repository inspection, decisions, code,
> data, configuration, documentation, or validation work). Update it whenever
> the iteration produced repository-relevant information.

---

## 1. Current Development Phase

EraByEra currently exists as a product concept and documentation set. No application implementation, data pipeline, or deployment is claimed as complete in this document.

Local working tree at `C:\Projects\erabyera` contains the six project documents. A GitHub remote exists at `https://github.com/jeehead-cloud/erabyera.git`. As of 2026-07-10 the local directory is not a git working tree (no `.git`), so branch and `git status` cannot be verified locally until the repository is cloned or initialized and linked to that remote.

The immediate goal is to establish a proper local git checkout and build the smallest vertical slice:

```text
physical map в†’ selected year в†’ a few historical places в†’ detail card в†’ source link
```

---

## 2. Milestone Status

### M0 вЂ” Project foundation вЂ” Planned

Scope:

- create repository;
- scaffold React + TypeScript + Vite;
- install MapLibre integration, Zustand, Zod, and Vitest;
- add the six project documents;
- establish npm scripts;
- create a basic responsive app shell;
- verify production build.

Implemented:

- project concept documented;
- initial product scope documented;
- proposed architecture documented;
- AI-agent operating rules documented;
- GitHub remote identified: `https://github.com/jeehead-cloud/erabyera.git`;
- local documentation set present at `C:\Projects\erabyera`.

Not yet implemented:

- local git checkout / `.git` linkage to the remote;
- application files;
- package configuration;
- map rendering;
- tests;
- data files;
- CI or deployment.

### M1 вЂ” Map shell вЂ” Planned

Not started.

Target outcome:

- physical basemap without modern political labels;
- pan and zoom;
- responsive layout;
- visible attribution;
- basic map-state handling.

### M2 вЂ” Timeline and temporal filtering вЂ” Planned

Not started.

Target outcome:

- selected year state;
- historical year formatting;
- direct year input and slider;
- temporal filter utilities with tests;
- URL persistence.

### M3 вЂ” Places and detail cards вЂ” Planned

Not started.

Target outcome:

- validated place data;
- place visibility by selected year;
- time-dependent names and ownership;
- zoom-dependent importance;
- detail panel with source links.

### M4 вЂ” Polities and territories вЂ” Planned

Not started.

Target outcome:

- polity metadata;
- time-bounded GeoJSON territory features;
- fill/boundary layers;
- polity detail cards;
- uncertainty indicator.

### M5 вЂ” Events, battles, and journeys вЂ” Planned

Not started.

### M6 вЂ” Search and navigation вЂ” Planned

Not started.

### M7 вЂ” Data-quality tooling вЂ” Planned

Not started.

### M8 вЂ” Content expansion and polish вЂ” Planned

Not started.

---

## 3. Decisions Already Made

- EraByEra is a solo hobby project.
- The MVP should be narrow in historical scope.
- The application should start client-side and backend-free.
- Data should be stored as versioned JSON / GeoJSON, even if authored in Google Sheets.
- Historical records need sources and uncertainty metadata.
- Modern borders and labels should not appear in the default basemap.
- MapLibre is the proposed map foundation.
- React + TypeScript + Vite is the proposed frontend stack.
- GitHub repository remote is `https://github.com/jeehead-cloud/erabyera.git`.
- `CURRENT_STATUS.md` must be reviewed after every Cursor iteration; recent minor history is retained for approximately three months; significant changes are retained permanently; agents classify significant changes themselves.

---

## 4. Open Decisions

These decisions must be made during M0/M1, not silently by an agent:

- Exact first region and time period.
- Basemap source and license.
- Initial design language and UI language.
- Whether historical content source files are JSON-first or generated from CSV.
- Exact timeline min/max for the first slice.
- Hosting provider.

---

## 5. Known Risks

- Scope can expand from one historical slice to вЂњall historyвЂќ too early.
- Historical data research may consume more time than development.
- Territory geometry can create false precision.
- Basemap or dataset licensing may block public deployment.
- Rendering logic may become entangled with content unless data boundaries are enforced early.
- Local path is not yet a git working tree, so agents cannot rely on `git status` / branch checks until clone or init is completed.

---

## 6. Nearest Next Steps

1. Clone or initialize git at `C:\Projects\erabyera`, link remote `https://github.com/jeehead-cloud/erabyera.git`, and confirm branch/working-tree state on `main`.
2. Ensure the six root documents are committed in the repository.
3. Scaffold the Vite/React/TypeScript application.
4. Add MapLibre, Zustand, Zod, and Vitest.
5. Choose and document the first historical slice.
6. Implement the map shell with a legally usable physical basemap.
7. Add a tiny validated dataset with 3вЂ“5 places and confirm year filtering.

---

## 7. Maintenance Rule

Review this document at the end of every Cursor iteration, before the completion summary.

Update it when the iteration produced any repository-relevant information, including when:

- a milestone starts or finishes;
- a feature becomes actually usable;
- a known issue is discovered or fixed;
- the next 3вЂ“7 tasks change;
- a proposed decision becomes a real repository decision;
- documentation, configuration, validation, or project policy changes;
- implementation is incomplete, validation fails, or an issue is found but not fixed.

Also keep the factual sections synchronized with current reality (phase, milestones, implemented functionality, known issues, decisions, open decisions, next steps, validation/deployment status). Remove or correct statements that are no longer true.

Record ordinary work under **Recent Changes вЂ” Rolling Three-Month History**. Record lasting decisions and milestones under **Significant Changes вЂ” Permanent History**. When uncertain, classify as significant if forgetting the change could cause a future agent to make a wrong architectural, product, historical-data, deployment, or roadmap decision.

Do not claim validation, deployment, or implementation that was not actually performed.
Do not add empty, repetitive, or purely conversational entries.

---

## Recent Changes вЂ” Rolling Three-Month History

<!-- Newest first. Keep approximately three months.
Remove older entries only after confirming they are not significant
and that any still-current facts are represented elsewhere. -->

### 2026-07-10 вЂ” Iteration-level CURRENT_STATUS maintenance introduced

- Documented that agents must review and update `CURRENT_STATUS.md` after every Cursor iteration, not only after a meaningful feature block.
- Added rolling recent-change and permanent significant-change history sections.
- Corrected the repository field to the verified remote and noted that the local path is not yet a git working tree.

---

## Significant Changes вЂ” Permanent History

<!-- Newest first. Never delete entries because of age.
Correct, consolidate, or mark entries as superseded without losing
the historical decision and its rationale. -->

### 2026-07-10 вЂ” Mandatory post-iteration CURRENT_STATUS review

- `CURRENT_STATUS.md` must now be reviewed after every Cursor prompt/iteration that touches repository state, decisions, code, data, configuration, documentation, or validation.
- Recent minor history is retained for approximately three months; older non-significant entries may be removed only after confirming current facts live elsewhere.
- Significant changes are retained permanently and may only be corrected, clarified, consolidated, or marked superseded.
- AI agents must classify significant changes themselves using the вЂњwould forgetting this cause a wrong lasting decision?вЂќ test.
- Why it matters: a new chat or agent can recover factual state, recent work, lasting decisions, and nearest next steps without relying on chat history.

---

## Guiding Rule

**This file describes reality, not intention.**
