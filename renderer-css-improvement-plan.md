# Renderer CSS — Cleanup Record & Open Items

Record of the 2026-07 cleanup of `static/template/_global/css/` (the inner-frame stylesheets that
render every component), kept as the reference for what's still open, what changed, and the
constraints future edits must respect. Companion to `board-front-improvement-plan.md` (the JS side).

Every step was verified pixel-identical with the visual-regression harness in `tools/visreg/`
(local-only tooling, excluded from git via `.git/info/exclude`; see its README for the workflow).

## The element icon layer

Element art (sun/moon/fire/…) comes in two sets: the colored **fancy** gems (`Sun.png`, the
default) and the flat **simple** set (`element_simple_*.png`). One layer in `global.css` now owns
all of it:

- `:root` defines the palettes as `--el-fancy-<el>` / `--el-simple-<el>` custom properties, and
  each `icon.<element>` rule reads `background-image: var(--el-<el>, var(--el-fancy-<el>))`.
- A context opts into simple art by joining the **simple context list** in `global.css`
  (`growth, special-rule, innate-power, note, threshold, rules, aspect-subtext, …`). Nested
  contexts flip back via the **fancy revert list** (`gain, special-rules-track, aspect
  growth-group`). Inheritance follows the DOM, so nesting works without specificity games.
- A whole page opts in with a `:root { --el-*: var(--el-simple-*) }` block in its component sheet
  (see `event.css`, `adversary.css`).
- **Keep every literal `url()` in `global.css`** — relative URLs inside custom properties resolve
  against the declaring stylesheet, and the component sheets live at different depths.
- There is no simple star; `icon.star` is always the fancy art.
- Not yet converted (still explicit URL rules, which win the cascade normally): incarna's element
  table (coupled to per-rule `contrast` filters), the `modified-reclaim` / `discard-element`
  fancy overrides inside growth, and the `:lang(de)` terrain block.

## Open items

1. **`:lang(de)` terrain block** in `global.css` (~90 lines) — same custom-property treatment as
   the element layer would collapse it and the terrain singular/plural alias pairs.
2. **`JosefinSans-Regular`'s `@font-face` stays duplicated per-sheet, deliberately** — declaring
   it earlier (in `global.css`) changes when the fetch starts, and `card.js` / `adversary.js` /
   `aspect.js` measure text without awaiting fonts, so cold-load rendering becomes a coin flip
   (card-title squish, adversary level heights). Fix those scripts to await
   `document.fonts.ready` like `board_front.js` does, then hoist. (Note also sits in
   `global.css` above the bootstrap.)
3. **Per-context pixel tables for token icons** (`special-rule icon.*`, `note icon.*`,
   `effect icon.*`, `threshold icon.*`, `presence-req icon.*`, …) are the biggest remaining
   sprawl. Candidate fix: size inline icons in `em` against each context's font-size. Layout
   changes — needs the harness plus eyeballs, one context at a time.
4. **Singular/plural class aliases** (`sand/sands`, `wetland/wetlands`, `beast/beasts`, …) double
   dozens of selectors. Better handled by normalizing the class name once in the JS that already
   post-processes the DOM.
5. **`printer-clean`** exists as four near-identical blocks (adversary/aspect/scenario/board_lore)
   plus different spirit-board rules — consolidation needs a deliberate shared-frame decision.
6. **`icon.fast` / `icon.slow` scope leak** — `growth-options.css` redefines them *unscoped*, so
   the power-speed art overrides `global.css`'s default everywhere on spirit-board and aspect
   pages. Probably should be `growth`-scoped; change it deliberately and review the diffs.
7. **Three "prohibited" overlay mechanisms** coexist in `global.css` (`icon.no`, `no-icon`,
   `icon.is-no::after`); the first two look legacy. Verify emitters before deleting.
8. **`* { box-sizing: border-box }` is per-sheet**, and `card.css` / `board_lore.css` lack it.
   Adding it globally changes their layout — decide deliberately, don't hoist casually.
9. **Native CSS nesting** is used in ~10 places amid otherwise flat CSS. It's shipped and fine;
   standardize toward it rather than away.
10. **Unit stragglers**: `pt` sizes in fear/blight/event/board_lore, `%`-tops mixed with px-tops
    in the same files, and unnamed pt→px conversions (22.66px, 26.66px, …) everywhere.
11. **Unused-selector candidates from the 2026-07 audit** (aspect `icon.or`, `contrast-wrapper`,
    `level-info`, `div.level-difficulty`, `aspect.round-border`, …) — verify emitters, then
    delete.

## Decided against — don't "fix" these

- **`rules icon.sacred-site rules icon.wetland-presence`** (the fused selector in `card.css`) was
  fixed by *dropping* the sacred-site fragment, not by splitting into two selectors — a dedicated
  `rules icon.sacred-site` rule earlier in the file would otherwise lose and sacred-site would
  silently shrink.
- **Re-adding per-context element URL tables.** Any new context joins the lists in `global.css`;
  art must never depend on stylesheet load order again.

## What changed (2026-07-29/30)

All verified pixel-identical across the 87-file corpus at each step; net **−820 lines**
(990 deleted / 170 added) across 17 files.

- **Deleted dead code**: `card-back.css` (orphan, superseded by `card.css`), `global.css.bak`
  (stale backup that was being publicly deployed), `fear_card.css`'s unreachable blight-banner
  block (~80 lines the fear-card renderer can never emit).
- **Latent bug fixes** (no corpus coverage, so no visual change — the fixes make dead selectors
  matchable and 404 URLs valid): the fused selector above; `aspect-subtext icon.*` and
  `custom-energy` pointed at nonexistent `../../images/` paths and rendered blank; aspect's
  `dev-overlay` was missing the `z-index` its seven siblings had.
- **Page bootstrap hoisted into `global.css`**: the `html`/`body` reset, `html` sizing, and one
  canonical `dev-overlay` rule (8 copies → 1 + three one-line `background-size` overrides).
  Doubled `body {}` blocks in fear/blight/invader merged; double-parse `@import "global.css"`
  removed from `aspect.css` / `incarna.css`.
- **Element icon layer** (above) replacing 12 per-context URL tables across 9 sheets.
- Alongside the refactor: spirit-board fidelity adjustments (growth spacing/sizing) and
  `DKSnemandTall.otf` swapped for a re-centered cut fixing a baseline issue (resonant).

## Regression workflow

`tools/visreg/` — Playwright screenshots of the `MyCustomContent` corpus through a
PreviewFrame-equivalent wrapper, pixel-diffed against a baseline. Key facts:

- The harness renders each file **twice** (startMain → `fonts.ready` → restore raw body →
  startMain) because several component scripts measure text before their fonts load; a single
  pass is bistable. The double render reproduces the app's steady state.
- ~1 in 30 renders still lands in one of two stable antialiasing states for a downscaled icon
  (image-raster race, ≤ ~180 px). `compare.js` reports diffs under `--min-px` (default 300) as
  NOISE; the smallest real regression measured 803 px. Noise converges when the file is re-shot;
  real changes reproduce.
- Baselines are machine-specific; re-shoot `shots/baseline` before starting a refactor and after
  intentional visual changes land.
- After editing anything under `static/template/_global/`, hard-refresh the app tab (Ctrl+F5) —
  the preview iframe re-runs the *old* script otherwise.
