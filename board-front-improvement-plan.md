# board_front.js — Cleanup Record & Open Items

Record of the 2026-07 cleanup of `static/template/_global/js/board_front.js` (the inner-frame
script that renders spirit boards), kept as the reference for what's still open, what changed,
and the constraints future edits must respect.

## Open items

1. **`or(presence-node(...), …)` is silently broken** — the presence-node detection sees the
   outer `or` type, so the inner action falls to the default renderer and emits a garbage icon
   name. Fix: explicit error cell, or implement it.
2. **Renderer regex choice is historical** — each growth action uses the inner- or outer-paren
   regex (`_innerParenRegex` / `_outerParenRegex`) matching its old behavior; the difference
   only matters for nested parentheses. Unify only with a snapshot review.
3. **`bordered` check is broken-but-harmless** — `buildGrowthPanel` tests
   `getAttribute("bordered") !== undefined`, which is always true (`getAttribute` returns
   `null`). Real content always sets `bordered` on all but the last sub-growth, so behavior
   matches what the branch does anyway. "Fixing" it to `!== null` would change rendering of
   hand-written files that omit the attribute — decide deliberately.
4. **Template typo** — *Towering Roots of the Jungle* has
   `incarna(add-token,vitality,incarna-roots))` (doubled paren). Harmless today only because
   the option regex stops at the first `)`.
5. **Some template `<style>` blocks have `icon.custom` rules without `data-iconname`** — that
   crashes `setupCustomIcons` when fed raw (can't happen in-app; the app regenerates the style
   block, and the test harness catches it per-file with a note). Template cleanup candidate.
6. **Reflow batching in `dynamicResizing`** — deliberately shelved; speed isn't a priority and
   the measure→mutate→re-measure feedback loops are the feature. If ever revisited: batch only
   loops whose reads provably don't depend on that loop's own writes, keep feedback loops as
   explicit phases, and verify per-loop in a browser (the snapshot suite is blind to layout).

## Decided against — don't "fix" these

- **The div-wrapper trick in `writeGrowthAction`** (parse → `classList.add` → re-serialize) is
  load-bearing: `getPresenceNodeHtml` has two return shapes (including an early-return
  `<split-presence-node>`, reachable from growth), and the wrapper classes whichever root comes
  back. An extra-classes parameter would need the same parsing in the split branch.
- **`add-presence(x,token,y,instead)` is legacy**, superseded by `add-token(...)`. Its text side
  was fixed so old hand-written files render, but the icon side's odd look (`+presence` with an
  empty requirement ring) is a won't-fix. Don't document the syntax; point people at
  `add-token`. Same spirit for `add-presence-custom` (superseded by the `*` override).

## What changed (2026-07-28/29)

**Bug fixes**

- `gain-energy(0,x)` / `fear(0,x)` rendered a flat "+0" icon (string-vs-number compare); logic
  now shared in `getScalingGainTextAndIcons`.
- The auto row-wrap loop crashed `startMain` mid-render when a single overwide growth group
  drained the table; now degrades to one wide row.
- Malformed generated markup repaired: stray `</icon>` in custom costs, unclosed tags in
  `incarna(add-token)`; dead `conditional` case deleted.
- User text in generated attributes is escaped via `attrHTML`/`escapeHTML` — apostrophes in
  special titles and `rgb(…, …)` tints no longer shatter tags. **Any new attribute emission
  must go through `attrHTML`.**
- Error cells name the failing action and keep unique click-to-edit IDs; bare `add-presence`
  throws a descriptive error; `groupIndex` increments unconditionally so cell IDs stay unique.
- `add-presence(x,token,y,instead)` had *never* rendered (`IconName`'s `instead` case never
  assigned `localize`) — found by the suite on its first run; localized text added in all nine
  languages.
- All growth parsing trims edge whitespace (`_splitOptions`, semicolon/or splits, costs,
  overrides) — audited via before/after fixtures; fixed a stray rendered space in the official
  *Breath of Darkness* template, and the icon side now agrees with the (always-trimming) text
  side. Internal spaces in multi-word text survive.

**Structure**

- The ~870-line action `switch` became the `GROWTH_ACTION_RENDERERS` dispatch table — 27 keys
  are the growth vocabulary; actions sharing an implementation point at named `_render*`
  functions; renderers return `[icons, text, optionalOverride]`.
- Duplicated icon-ellipse trig extracted to `_ellipseIconPositions` (defaults reproduce the
  plain circle bit-for-bit). A third, differently-tuned copy lives in the presence-node code.
- File reordered for reading: `startMain` at the top, growth section in call order, renderer
  map after its callers.
- One module-level `DEBUG` flag gates all per-action logging (applied via an espree AST pass —
  40 ungated logs wrapped, 12 per-function flags removed). A production render logs only
  "Spirit Board startMain" plus real errors/warnings.
- Layout constants are named and declared **next to their consumers**: `PRESENCE_NODE_HEIGHT`
  above `addTrackBanners`; `MAX_GROWTH_ROW_WIDTH`, text-height/width thresholds, and
  `GROWTH_COST_WIDTH` (must match the growth-cost CSS) above `dynamicResizing`.
- 18 lines of dead commented-out code removed.

**Render wait**

- `waitPromise(200)` in `startMain` replaced by a forced layout pass (`void board.offsetHeight`,
  which starts lazy `@font-face` fetches) + `await document.fonts.ready` — the condition the
  timer was guessing at, since `dynamicResizing` needs final-font text metrics. Re-renders now
  update instantly; slow connections wait instead of mis-measuring. The 200ms survives only as
  a fallback for browsers without the Font Loading API. Verified in-browser.

## Test suite

`npm run testGrowth` checks; `npm run testGrowthUpdate` rebaselines (review the snapshot diff
like code). Lives in `tests/growth/`, runs under jsdom (devDependency, pinned `^22` for the
repo's Node 16 target).

- **Corpus**: all 59 `MyCustomContent/MySpirit` templates rendered end-to-end through
  `buildGrowthPanel`. **Synthetic**: ~137 `writeGrowthGroup` fixtures — every action, the
  or/then/presence-node wrappers, `^repeat`/`*override`, group costs/tints/titles, spacey
  inputs, and deliberately malformed inputs (pinning the error-cell fallback).
- **Generation only.** `dynamicResizing` and all layout are uncovered — sizing changes need
  browser eyeballs.
- Snapshots are `.txt` on purpose: the lint-staged hook runs prettier on staged `.html`/`.json`
  and would corrupt baselines. Don't rename them.
- The harness loads the scripts as real `<script>` elements (`runScripts: "dangerously"`), not
  `eval` — `board_front.js` is strict-mode, so eval wouldn't attach its functions to `window`.

## Workflow gotcha

Files under `static/template/_global/` are outside Vite's HMR graph and the preview iframe
loads them once per document — after editing them, **hard-refresh the tab (Ctrl+F5)**. Form
edits alone re-run `startMain()` against the already-loaded old script.
