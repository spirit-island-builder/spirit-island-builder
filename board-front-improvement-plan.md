# board_front.js Improvement Plan

Staged cleanup of `static/template/_global/js/board_front.js` (~6800 lines), focused on the
Growth pipeline. Based on a code survey done 2026-07-28.

There is no test framework in this repo, so every stage is scoped to be **manually verifiable**:
each stage lists what to type into the Spirit Board tab and what you should see. Stages marked
*refactor* must produce **zero visual change** — verify by comparing the rendered board (or an
exported PNG) before and after. Do one stage at a time; each is independently shippable.

How to verify anything here: `npm run dev`, open the Spirit Board tab, load an example from the
Examples modal (or paste the listed growth strings into a growth group's *values* field), and watch
the preview.

**Important:** files under `static/template/_global/` are outside Vite's HMR graph, and the preview
iframe loads them once when its document is created. After editing them, **hard-refresh the browser
tab (Ctrl+F5)** — form edits alone re-run `startMain()` against the already-loaded old script.

---

## Stage 1 — Correctness quick wins  ✅ (applied 2026-07-28)

Three small, high-confidence fixes.

### 1a. Fix the `x_is_zero` string-vs-number bug (bug fix)

`gain-energy(...)` and `fear(...)` options come from `String.split`, so the old check
`options[0] === 0` was never true — a leading `0` (meaning "no flat gain, scaling only") still
rendered a flat "+0" icon. Now compares numerically.

**Verify:** growth value `gain-energy(0,dahan)` → should show *only* the per-dahan scaling icons,
no flat energy icon. Same for `fear(0,town)`. Flat forms (`gain-energy(2)`, `fear(2)`) unchanged.

### 1b. Guard the automatic row-wrap loop (crash fix)

In `dynamicResizing`, the loop that moves growth groups onto a second row ran
`while (totalWidth > 1090 || tallGrowthText)`. If a *single* group was wider than 1090px (or every
group had tall text), it drained the first table empty and crashed `startMain` mid-render, leaving
a half-built board. Now stops while at least one group remains in the top row.

**Verify:** make one growth group with many actions (e.g. 8+ semicolon-separated values) so it
alone exceeds the row width → board still renders (one overwide row) instead of going blank.
Normal multi-group boards still wrap onto two rows as before.

### 1c. Extract shared flat+scaling gain helper (refactor — zero visual change)

The `gain-energy` and `fear` cases in `getGrowthActionTextAndIcons` were ~55 duplicated lines
differing only in tag names. Both now call `getScalingGainTextAndIcons(options, tags, prefix)`,
so fixes like 1a land once. The 1a fix lives inside this helper.

**Verify (should look identical to before):**
`gain-energy(2)` · `gain-energy(2,dahan)` · `gain-energy(dahan,2)` ·
`gain-energy(text,Custom Text,sun)` · `fear(2)` · `fear(1,blight)` · `fear(0,town,2)`

---

## Stage 2 — Markup integrity  ✅ (applied 2026-07-28)

The generated HTML doubles as the save format, so malformed markup is a data-integrity issue.

1. Removed the stray `</icon>` in custom growth costs (`writeGrowthGroup`, the
   `growth-cost class='custom'` branch). No visual change (the parser was dropping it).
2. Fixed `incarna(add-token,…)`: the two `<icon>` elements are now closed and the second
   `<add-token-lower>` is the closing tag it was meant to be, mirroring the well-formed
   `add-move` case. Checked before fixing: the parser's error recovery produced the intended
   tree plus one stray *empty* `add-token-lower` nested inside the incarna icon (zero-width,
   invisible per the CSS), so this should be visually identical — but it's the one Stage 2
   change worth eyeballing.
3. Deleted the empty `case "conditional":` — it was referenced nowhere (no docs, no
   autocomplete entry, no templates) and produced an "error! check syntax" cell via a caught
   TypeError. It now falls through to the default renderer and behaves like any other unknown
   keyword.

**Verify:** a growth group with a custom cost (e.g. `cost="2,time"`), and
`incarna(add-token,vitality)` — the official *Towering Roots of the Jungle* example uses this,
so loading that example before/after is the easiest check.

*Side observation from this stage:* the Towering Roots template
(`static/template/MyCustomContent/MySpirit/OFFICIAL_Towering Roots of the Jungle.html`) has a
doubled `))` typo in `incarna(add-token,vitality,incarna-roots))`. Harmless today because the
option regex stops at the first `)`, but worth fixing in the template eventually.

## Stage 3 — Attribute escaping helper  ✅ (applied 2026-07-28)

Added `attrHTML(name, value)` (top of the growth section) which always double-quotes and
entity-escapes (`&`, `"`, `<`, `>`), and switched the growth emit sites to it: `customName` on
the section title, and `header` / `special-title` / `special-title-left` / `tint` (both the
attribute and the inline `background-color` style) on growth groups. Previously an apostrophe in
a special title, a quote in a custom heading, or a `rgb(…, …)` tint with spaces silently
shattered the generated tag.

Downstream consumers read these back via `getAttribute`, which decodes entities, so values
round-trip unchanged. Future emit sites for user text in attributes should use this helper.

**Verify:** growth special-title containing `'` (e.g. `Island's Gift`), custom section name
containing `"`, and a tint of `rgb(200, 180, 90)` → all render correctly. Plain boards unchanged.

## Stage 4 — Error handling & DSL robustness (behavior improvements)

### 4.1 + 4.2  ✅ (applied 2026-07-29)

1. Error cells now name the offending action ("error in: \<action\>") via a new
   `writeGrowthErrorCell()`, built directly rather than routed through the `custom(...)` syntax —
   the failing text can itself contain the commas/parens that syntax splits on. The caught error
   is also logged to the console with the action string. Bonus fix: error cells previously all got
   click-to-edit ID `s0g0a0` (a collision); they now carry their real cell ID.
2. `add-presence` without parentheses now throws a descriptive error ("add-presence requires
   options, e.g. add-presence(1)") instead of logging and then crashing into the catch on the next
   line. Net behavior: same error cell, but a meaningful console message.

Also extracted `escapeHTML()` (element-content escaping) out of `attrHTML()` for reuse.

**Verify (remember Ctrl+F5):** growth value `gain-energy(` → cell reads "error in: gain-energy(";
`add-presence` bare → error cell + the new console message. Valid boards unchanged.

### 4.4  ✅ (applied 2026-07-29)

`groupIndex` in `buildGrowthPanel` now increments unconditionally per group written, instead of
only when the next sibling is a `growth-group`. Cell IDs (`s0g1a2`) therefore stay unique even if
an unexpected element sits between groups in a hand-edited file. Verified against the ID contract
first: the outer app consumes these IDs only as unique region keys (the export/metadata path in
`spirit-board/index.svelte` ~line 888), and for all app-generated content the numbering is
unchanged — only previously-colliding degenerate cases get different (now unique) IDs.

**Verify:** any multi-group / multi-set example renders with the same IDs as before (inspect a
`growth-cell` in the iframe if curious); nothing visible changes.

*Side observation:* the `bordered` check in `buildGrowthPanel` is
`getAttribute("bordered") !== undefined`, but `getAttribute` returns `null` when absent — so the
branch fires for every sub-growth with a successor, bordered or not. Harmless in practice
(generateHTML and every template put `bordered` on all but the last sub-growth, matching what the
branch does anyway), but if it's ever "fixed" to `!== null`, hand-written files that omit
`bordered` would lose their double borders — decide deliberately.

### 4.3 (pending)

`or(presence-node(...), …)` is silently broken (renders a garbage icon name) — make it an
explicit error cell, or implement it.

### 4.5  ✅ (applied 2026-07-29 — found by the snapshot suite)

`add-presence(x,token,y,instead)` had never rendered: in `IconName` the token `case "instead"`
never assigned `localize`, so `localize[lang]` threw and the action always became an error cell.
The case now has localized text in all nine languages ("Add a \<token\> instead of a Presence"),
phrased to match its `and`/`or` siblings. Snapshot rebaselined — the diff shows exactly this one
fixture flipping from error cell to real render.

**Verify:** growth value `add-presence(1,token,badlands,instead)` renders a cell instead of an
error.

*Post-fix context from the author:* this is a **legacy** option, superseded by the dedicated
`add-token(...)` action — which is why the text side was never finished. The fix stays (old
hand-written files now degrade gracefully instead of erroring), but the icon side's odd look
(`+presence` with an empty requirement ring) is a **won't-fix**; both `instead` cases are now
commented as legacy in the code. Don't document the syntax; point people at `add-token`.

---

## Snapshot test suite  ✅ (added 2026-07-29)

`npm run testGrowth` — snapshot suite for the growth *generation* pipeline (`buildGrowthPanel`
and everything under it), run in Node via jsdom (devDependency, pinned `^22` for Node 16
compatibility). `npm run testGrowthUpdate` refreshes baselines after an intentional output change
— review the snapshot diff like code.

Two layers, under `tests/growth/`:

- **Corpus** — every spirit template in `static/template/MyCustomContent/MySpirit/` with a
  `<board>` + `<growth>` (59 files) is rendered end-to-end through `buildGrowthPanel`; the
  resulting growth panel HTML is compared to `snapshots/corpus/*.snap.txt`.
- **Synthetic** — ~120 `writeGrowthGroup` fixtures in `fixtures.js` covering every case of the
  action switch, or/then/presence-node wrappers, `^repeat` / `*override` modifiers, group costs,
  tints, special titles, and deliberately malformed inputs (which snapshot the error-cell
  fallback). Compared to `snapshots/synthetic.snap.txt`.

Known limits, on purpose:

- **Generation only.** `dynamicResizing()` needs real layout (offsetWidth etc.); jsdom has no
  layout engine, so sizing/wrapping behavior still needs browser eyeballs.
- Snapshots are `.txt` because the lint-staged hook runs prettier on staged `.html`/`.json`,
  which would reformat baselines and break comparison. Do not rename them.
- Some templates' `<style>` blocks have `icon.custom` rules without `data-iconname`, which
  crashes `setupCustomIcons` when fed raw (can't happen in-app — the app regenerates that style
  block). The runner catches this per-file, renders without custom icon names, and logs a note.
- The harness loads the scripts as real `<script>` elements (`runScripts: "dangerously"`), not
  `window.eval` — `board_front.js` is strict-mode, so eval would keep its functions scoped to
  the eval call instead of on `window`.

The suite was mutation-tested: a one-character change to generated output fails it. It found
4.5 above on day one. Stage 5's "pixel-identical" requirement is now mechanically checkable for
generation; run `npm run testGrowth` after every conversion step.

## Stage 5 — Structural refactor of `getGrowthActionTextAndIcons` (refactor — zero visual change)

The big one; do only after Stages 1–4 have settled.

1. Convert the 870-line `switch` into a dispatch table
   (`const GROWTH_RENDERERS = { reclaim: fn, "add-presence": fn, … }`), each renderer receiving
   pre-extracted, trimmed options. The shared prelude (`^repeat`, `*override`) stays in one place,
   and the table's keys become the documented growth vocabulary.
2. Extract the duplicated ellipse-of-icons math shared by `gain-element` and `element-marker`.
3. Give `getPresenceNodeHtml` an extra-classes parameter and delete the parse-mutate-reserialize
   div-wrapper trick in `writeGrowthAction`.
4. Hoist the per-function regex literals to module level alongside `_iconNameRegex`.

**Verify:** load every spirit in the Examples modal plus the canonical templates under
`static/template/MyCustomContent/`, compare previews (or exported PNGs) before/after — pixel-identical.

## Stage 6 — Consistency & polish (no visual change)

1. One module-level `DEBUG` flag replacing the per-function `let debug = true/false` and ungated
   `console.log`s. Renders get dramatically quieter.
2. Name the growth layout constants (`MAX_GROWTH_ROW_WIDTH = 1090`, the 57/70/75/50 text-height
   thresholds, the 10px-per-cost CSS coupling, the 130px banner height) at the top of the file.
3. Delete dead code (commented `require`, commented icon loop in `custom`); keep
   `add-presence-custom` but comment that it exists for old-save-file compatibility.

**Verify:** console output during a render, and one before/after preview comparison.

## Stage 7 — Performance (behavioral: faster render)

1. Batch layout reads (`offsetWidth`, `getBoundingClientRect`) before writes (`style.width`) in
   `dynamicResizing` to stop forced-reflow churn.
2. Replace the fixed `waitPromise(200)` in `startMain` with `document.fonts.ready` + a
   `requestAnimationFrame` — the file's own comment flags this race; fonts-ready is the actual
   condition the 200ms is guessing at.

**Verify:** preview updates feel snappier; resize math still correct on a font-heavy board
(growth text widths depend on loaded fonts — this is the main regression risk, test with a
fresh cache / hard reload).
