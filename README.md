# Spirit Island Builder

The web app behind [spiritislandbuilder.com](https://spiritislandbuilder.com/) — design custom Spirit Island components in the browser, preview them at print fidelity, and export for play or sharing.

This is an unofficial fan project. Spirit Island and all related materials belong to [Greater Than Games](https://greaterthangames.com/).

## Why use it

Homebrew and custom content for Spirit Island usually means wrestling with image editors, word processors, or incomplete templates. The builder is built for that workflow end-to-end:

- **Design in-browser** — form-driven editors for nearly every game piece, with live preview as you type
- **Match the look of official components** — layout, fonts, icons, and board structure aimed at table-ready output
- **Export what you need** — PNG for printing or sharing, PDF for multi-page sets, Tabletop Simulator JSON for digital play
- **Save and reopen your work** — download HTML (or a multi-component Builder Save JSON), load it later, or store files in Google Drive
- **Start from examples** — load worked examples for spirits, powers, aspects, adversaries, events, and scenarios
- **Share the same format the preview uses** — the HTML of a spirit (or card, adversary, …) *is* the save file, so files round-trip cleanly between sessions and collaborators

## What you can build

| Component | What you get |
|-----------|----------------|
| **Spirit – Play Side** | Full front board: name & art, special rules, growth, presence tracks, innate powers, custom icons, overlays |
| **Spirit – Lore Side** | Back of board: lore art, setup, play style, complexity, powers summary |
| **Power Cards** | Major/minor-style cards (and cardbacks), reorderable sets |
| **Aspects** | Aspect front/back with replacements and innate-like effects |
| **Incarna** | Token art and effects |
| **Adversaries** | Title, loss condition, escalation, leveled fear/effects |
| **Scenarios** | Front/back scenario panels |
| **Blight / Fear / Event / Invader cards** | Matching card builders for those decks |

Additional UI: **Builder Save** (bundle several components into one JSON snapshot), **About**, **Changelog**, and in-app **Instructions**. Partial localization covers auto-generated labels in several languages (EN, DE, PL, FR, ZH, HU, AR, KO, JA).

## Core workflow

1. Open a tab for the component you want (URL hash selects the tab, e.g. `#powerCards`).
2. Fill in the form — name, art, rules text, growth options, tracks, and so on.
3. Watch the **live preview** update; on some tabs you can click a region of the preview to jump to that form section.
4. **Save** as HTML (or use Builder Save / Google Drive), or **export** PNG, PDF, or Tabletop Simulator JSON.

Images you upload become part of the preview (and saved HTML). Printer-friendly and transparent export modes are available on several tabs.

## Develop

Requires **Node 16** (see `.nvmrc`).

```bash
npm install
npm run dev          # Vite dev server
# npm run dev -- --open
```

Useful scripts:

| Script | Purpose |
|--------|---------|
| `npm run build` | Static production build into `build/` |
| `npm run preview` | Serve the production build locally |
| `npm run checkFormatAndLint` | Prettier check + ESLint (what CI *should* use for verification) |
| `npm run writeFormatAndLint` | Auto-fix formatting/lint |
| `npm run svelteCheck` | `svelte-check` |

There is no automated test suite; verify changes with `npm run dev` and exercise the form + preview.

Google Drive save/load needs `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY` — copy `.env.example` to `.env` and follow the comments there. Do not commit real credentials.

## Architecture (short)

Fully static SPA (SvelteKit 1 + `adapter-static`). Two layers:

- **Outer editor** — Svelte UI under `src/routes/` (mostly tab components, not routes)
- **Inner preview** — iframe driven by hand-written CSS/JS under `static/template/_global/`

Form state → `generateHTML()` → custom-tag DOM → iframe → `startMain()` for layout. `readHTML()` reverses that for load. Those two must stay symmetric so user files keep round-tripping.

Work lands on **`dev`**. Pushing to `dev` opens/updates a `dev → main` PR; **`main` is production**. Prefer not committing directly to `main`.

## Contribute

Contributions are welcome, but merges are not guaranteed. Use a fork → branch → pull request workflow against `dev`.

A husky pre-commit hook runs lint-staged (ESLint + Prettier on staged files). Please keep `generateHTML` / `readHTML` in sync when adding fields.

## License / ownership

Unofficial fan project. Game assets and trademarks belong to Greater Than Games, LLC. See the site’s privacy policy for analytics and data handling.
