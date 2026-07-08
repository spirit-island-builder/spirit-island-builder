# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The web app behind https://spiritislandbuilder.com/ — users build custom components (spirit boards, power cards,
adversaries, scenarios, …) for the board game Spirit Island, preview them, and export to PNG/PDF/Tabletop Simulator.
Unofficial fan project; game assets belong to Greater Than Games.

SvelteKit 1.x + Svelte 3, `adapter-static` with `fallback: "index.html"` — a fully static SPA, no server code.

## Commands

```bash
npm run dev                # vite dev server
npm run build              # static build into build/
npm run preview            # serve the production build
npm run checkFormatAndLint # prettier --check + eslint  (CI runs the --write variant)
npm run writeFormatAndLint # prettier --write + eslint  (use this to fix)
npm run svelteCheck        # svelte-check
```

Node 16. There is **no test framework** in this repo — nothing to run, and no `test` script. Verification is manual:
`npm run dev`, open the tab, exercise the form, watch the preview.

A husky `pre-commit` hook runs `lint-staged` (eslint + prettier on staged `js/svelte/css/json/html`).

## Branching

Work lands directly on `dev`. Pushing to `dev` triggers `.github/workflows/prod-pr.yaml`, which auto-opens a
`dev → main` PR; `main` is production. Don't commit to `main`.

## Architecture: the two layers

The single most important thing to understand. There is an **outer** app (Svelte, the editor UI) and an **inner**
page (plain HTML/CSS/JS, the rendered game piece). They share no framework and communicate only through the DOM.

### Outer: the editor

Despite the directory layout, `src/routes/` is **not** mostly routes. SvelteKit 1.x only routes `+page.svelte`, so
there are exactly three pages: `/` (`+page.svelte`), `/instructions`, `/privacypolicy`.

Everything else — `spirit-board/index.svelte`, `power-cards/index.svelte`, `adversary/index.svelte`, and so on — is
a plain component imported into `+page.svelte` and rendered as a **tab**. The active tab is chosen by URL hash
(`#powerCards`, with a pile of aliases normalized in a `switch` at the top of `+page.svelte`).

Each tab directory follows the same shape:

- `index.svelte` — tab root: holds the state object, `generateHTML()`, `readHTML()`, mounts `<PreviewFrame>`
- `*.svelte` siblings — form sections (`growth.svelte`, `innate-powers.svelte`, `name-and-art.svelte`, …)
- `examples.json` — prebuilt examples for the Examples modal
- `tts-*.json` — Tabletop Simulator object templates

### Inner: the preview iframe

`$lib/preview-frame/index.svelte` owns an `<iframe>` driven by `srcdoc`. Its `<head>` comes from a `slot="head"`
that **each tab supplies**, pointing at absolute paths under `/template/_global/`:

```svelte
<PreviewFrame bind:this={previewFrame} on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/board_front.css" rel="stylesheet" />
    <script src="/template/_global/js/common.js"></script>
    <script src="/template/_global/js/board_front.js"></script>
  </svelte:fragment>
</PreviewFrame>
```

So `static/template/_global/{css,js,fonts,images}` is the inner website's entire source. It is hand-written
CSS and script — **not** processed by Vite, not imported by Svelte. `_global/js/<component>.js` each define a
`startMain()` that lays out the piece after the body is swapped in.

### The render cycle

```
form edit → state object (plain JS, e.g. `spiritBoard`)
          → generateHTML(state)  →  DocumentFragment of custom tags
          → previewFrame.copyHTMLFrom(fragment)   (replaces iframe body)
          → previewFrame.startMain()              (calls inner window.startMain())
```

`startMain()` returns a **status number** (1 = spirit board, 2 = cards, 3 = aspect, 4 = adversary). `PreviewFrame`
switches on it to decide which custom tags get click-to-edit handlers — click a region of the preview, jump to that
form section.

This gates **only** the clickable interface, which is deliberately incomplete: most tabs have no branch here, so
their previews render fine but aren't click-to-edit. That's unimplemented, not broken — don't "fix" it. Wiring up a
new tab means returning a fresh status number from its `_global/js/<component>.js` and adding the matching branch in
`preview-frame/index.svelte`.

### The custom-tag vocabulary _is_ the save format

The inner page is built from non-standard elements — `<board>`, `<spirit-name>`, `<growth>`, `<presence-tracks>`,
`<innate-powers>`, `<level threshold="...">`, `<special-rules-container>`, `<icon class="custom1">`. They are not
web components; they're unknown tags that `_global/css` styles and `_global/js` post-processes.

That HTML **is** the persistence format. Saving downloads it; loading parses it back:

- `generateHTML(state)` — state → custom-tag DOM
- `readHTML(htmlElement, baseURI)` — custom-tag DOM → state

**These two must stay symmetric.** Adding a field to a tab means touching both, or you silently break round-tripping
of every existing user file. Image paths inside a loaded file are resolved against its `baseURI` via
`Lib.maybeResolveURL` — that's why `readHTML` takes a `baseURI`.

`static/template/MyCustomContent/My*/` holds the canonical templates, blanks, and worked examples in this format.
They're both the examples served to users and the reference for what `generateHTML` must emit.

## Export paths

- **PNG** — `$lib/preview-frame/take-screenshot.js` is injected into the iframe as a module worker
  (`import ... from "./take-screenshot?worker&url"`) and called across the frame boundary.
- **PDF** — `PreviewFrame.getPDF()` screenshots each element, then tiles them onto jsPDF pages.
- **Tabletop Simulator** — `$lib/tts.js` templates `tts-savegame.json` / `bag-template.json` with `json-e`,
  filled from each tab's `tts-*.json`.

## Notable gotchas

- `src/routes/lib.js` (~650 lines) is shared state-mutation helpers, but most of it (`addGrowthSet`,
  `addPresenceTrack`, `addInnatePower`, …) is spirit-board-specific despite the neutral name.
- Dev only: `installHotReloadEvent()` (`$lib/hmr-helper.js`) uses undocumented `svelte-hmr` internals so tabs can
  re-render the iframe on HMR. If it breaks after a Svelte upgrade, look there first.
- 14 template HTML files under `static/template/` load `_global/js/general.js`, which **does not exist** (the file
  is now `common.js`). Harmless in-app, since the preview iframe supplies its own `<head>` and ignores the
  template's — but those files are broken if opened standalone in a browser.
- Two `<style>`-based extension points in templates: `icon.custom1/2/3` background images for user-supplied icons.
