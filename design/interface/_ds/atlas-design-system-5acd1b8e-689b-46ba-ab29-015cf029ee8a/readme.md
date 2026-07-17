# Atlas Design System

A scalable design system for browser-based strategy and simulation games. Atlas provides reusable foundations for maps, editors, dashboards, game sessions, contextual panels, and notifications — with room to grow into future gameplay systems such as cities, units, technologies, diplomacy, and combat. The system keeps the game world visually dominant while making dense information easy to scan and manage.

**Sources:** This system was built from scratch — no existing codebase, Figma file, brand guide, or deck was provided. All tokens, components, and UI kits below are original, designed for the brief ("scalable design system for browser-based strategy/sim games," civilization/map-table aesthetic). There is nothing to cross-reference against; if a real Atlas codebase, Figma library, or brand kit exists, attach it and this system should be revised to match it as ground truth.

## Visual direction

Civilization / map-table: parchment and ink neutrals, brass-gold accents, carved-panel rounding rather than soft SaaS rounding. Two surface families carry the whole system — **Paper** (flat parchment, warm shadow, for menus/dashboards/editor) and **Field** (dark glass, blurred, brass-edged, for HUD chrome floating over the game world).

## Fonts — ⚠️ substitution flagged

No brand font files were supplied. Nearest Google Fonts matches stand in:
- **Cinzel** (display/headlines) — inscriptional serif, evokes carved stone/historical titling.
- **Public Sans** (UI/body) — clean humanist sans for dense interface text.
- **IBM Plex Mono** (data) — coordinates, resource counters, editor values.

**Ask:** if Atlas has real brand typefaces, please attach the font files (or a Google/Adobe Fonts link) and this system will be updated to use them instead.

## Content fundamentals

- **Voice:** confident, economical, slightly formal — a steward's report, not a chat message. Short declarative sentences. No exclamation points, no hype.
- **Person:** second person for instructions and settings ("Select a tile to inspect"), third person / in-world voice for game events and notifications ("Fort Kessa under siege," "Harvest complete").
- **Casing:** Title Case for headings, labels, and button text ("End Turn", "Recruit"). Sentence case for body copy and descriptions. Small uppercase tracked labels (e.g. "TURN 84", "PROVINCE OF KESSA") mark metadata/context, not actions.
- **Numbers:** always formatted with thousands separators (18,204 not 18204); deltas are signed (+142/turn, -1.2%).
- **Emoji:** never used. Status is communicated with color + a small dot badge instead.
- **Tone examples:** "Granary output has stabilized" / "Trade income from the eastern road covers the shortfall through winter. No action is required this turn." / "Your forces will withdraw and morale will drop for two turns." — informative, consequence-forward, no filler.

## Visual foundations

- **Color:** warm parchment/ink neutral ramp (`--parchment-*`, `--ink-*`) plus a single brass accent ramp (`--brass-*`) for all primary actions and highlights. Semantic status colors (moss/success, amber/warning, brick/danger, teal/info) are desaturated, never neon. Four categorical accents exist for map factions/legend keys — used sparingly, never as a rainbow palette.
- **Type:** Cinzel for display/headlines (all-caps friendly, historical), Public Sans for all UI/body copy, IBM Plex Mono for coordinates/counters/logs. Scale runs 11px–64px; UI text never drops below 13px.
- **Spacing:** 4px base unit (4/8/12/16/24/32/48/64…). Consistent gaps, no arbitrary values.
- **Backgrounds:** no photographic imagery, no gradients-as-decoration, no repeating textures. The map itself (procedurally-tiled placeholder in the Game Session kit) is the only "busy" surface — chrome around it stays flat and quiet so the world stays dominant.
- **Two surface systems:** **Paper** (`--surface-paper*`) — flat, warm-shadowed, hairline brown border, used for dashboards/editor/dialogs. **Field** (`--surface-field*`) — dark translucent glass with `backdrop-filter: blur`, a brass hairline border, and an inset brass/black bevel (`--inset-field-bevel`) that reads as a carved metal panel — used for HUD chrome over the map.
- **Animation:** minimal and functional only — 120–150ms ease transitions on hover/active/focus (background, box-shadow, border-color). No bounce, no infinite decorative loops, no page-transition choreography. This is a dense-information tool; motion should never distract from the map or the numbers.
- **Hover / press states:** hover lightens brass fills one step (`--accent-primary-hover`) or tints a soft brass wash for ghost/icon buttons; press darkens one step further (`--accent-primary-active`) and nudges the button down 1px. No opacity-fade hover — colors shift instead, since translucent Field surfaces already use opacity for elevation.
- **Focus:** a soft 3px brass ring (`--focus-ring`), never a browser-default blue outline.
- **Borders & shadows:** hairline borders everywhere (1–1.5px), never a heavy stroke. Paper shadows are soft and warm-toned (brown, not black). Field shadows are tighter and darker, paired with the inset bevel so panels read as sitting above the map rather than floating with a generic drop shadow.
- **Corner radii:** modest — 4/8/12/18px. Pills reserved for badges and switches only; buttons, cards, and inputs stay rectangular-with-rounding, never fully rounded, to keep the "carved panel" feel rather than a soft app look.
- **Transparency & blur:** used specifically for Field-surface HUD chrome (`backdrop-filter: blur(6–8px)` + translucent dark background) so panels feel like glass sitting over the game world. Paper surfaces are always fully opaque.
- **Cards:** `Card` component — Paper variant is opaque parchment with a soft shadow and hairline border; Field variant is translucent dark glass with a brass hairline, blur, and inset bevel. Both use `--radius-lg` (12px).

## Iconography

No icon font, sprite sheet, or icon SVGs were supplied with the brief. **Lucide** (CDN, `unpkg.com/lucide`) is used throughout as the icon set — flagged as a substitution. It was chosen for its plain geometric stroke style, which reads clearly at small HUD sizes and doesn't compete with the parchment/brass palette. No emoji, no unicode glyphs-as-icons. If Atlas has its own icon library, attach it and every `data-lucide` reference in the UI kits/components should be swapped for the real set.

## No logo

No logo or brand mark was supplied. Wherever a mark would go, the plain-type wordmark "ATLAS" (set in Cinzel) is used instead — see `guidelines/wordmark.html`. Do not generate or approximate a logo; attach a real one when available.

## Intentional additions

The brief specified no component source, so the standard primitive set was authored from scratch, sized to the six surfaces requested (map, editor, dashboards, game session, contextual panels, notifications):
- **Button, IconButton, Card, Badge, Tag** — core
- **Input, Select, Checkbox, Radio, Switch** — forms
- **Dialog, Toast, Tooltip** — feedback
- **Tabs** — navigation

No components beyond this set were added.

## Index

- `styles.css` — root stylesheet, imports everything under `tokens/`.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `shadows.css`, `fonts.css` (Google Fonts substitution, flagged above).
- `guidelines/` — 15 foundation specimen cards (Colors ×4, Type ×4, Spacing ×3, Brand ×4) shown in the Design System tab.
- `components/core/` — Button, IconButton, Card, Badge, Tag (+ `core.card.html`).
- `components/forms/` — Input, Select, Checkbox, Radio, Switch (+ `forms.card.html`).
- `components/feedback/` — Dialog, Toast, Tooltip (+ `feedback.card.html`).
- `components/navigation/` — Tabs (+ `navigation.card.html`).
- `ui_kits/game-session/` — the primary in-game view (map + HUD + contextual inspector + notifications).
- `ui_kits/dashboard/` — empire-management dashboard (stats, trade chart, provinces table).
- `ui_kits/editor/` — scenario/level editor (toolbar, layers, tile canvas, properties).
- `SKILL.md` — Claude Code / Agent Skills–compatible entry point for this system.

## Caveats & ask

This entire system was designed from scratch with no source material — fonts, icons, colors, and all six surfaces are original interpretations of the brief, not recreations of an existing product. Please review against any real Atlas materials you have and tell me what to correct:
1. **Fonts** — attach real brand typefaces if they exist; Cinzel/Public Sans/IBM Plex Mono are placeholders.
2. **Icons** — attach a real icon set if Atlas has one; Lucide is a substitution.
3. **Logo** — attach a real mark if one exists; a plain wordmark stands in for now.
4. **Color/tone** — confirm the parchment/brass "civilization" direction is right, or point me at real screens/brand guidelines to match instead.
5. **Gameplay systems** — cities, units, technologies, diplomacy, and combat panels aren't built yet; tell me which to prioritize next.
