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

## The power-speed icon layer

Same shape as the element layer, for `icon.fast` / `icon.slow`. Two art sets: the small **plain**
speed pips (the default, matching the `<info-speed>` / `<innate-info-speed>` banners) and the
larger **power** art used inline in rule text.

- `:root` in `global.css` defines `--speed-plain-<speed>` / `--speed-power-<speed>`, and each
  `icon.<speed>` rule reads `background-image: var(--speed-<speed>, var(--speed-plain-<speed>))`.
- A context opts into the power art by setting `--speed-fast` / `--speed-slow`; a nested context
  flips back by pointing them at the plain tokens.
- Page-wide opt-ins live in `board_front.css`, `aspect.css` and `adversary.css`; `card.css` opts in
  on `rules-container` only.
- The `<info-speed>` / `<innate-info-speed>` **banners are different elements** and keep their own
  plain art — they're not `<icon>` and this layer doesn't touch them.
- This replaced five override pairs, two of which (`growth-options.css`, `adversary.css`) were
  _unscoped_ `icon.fast` / `icon.slow` rules that won purely on load order — item 6. The two scoped
  ones (`special-rule icon.fast`, `innate-power effect icon.fast`) were redundant once the pages
  that load those sheets opt in page-wide, and are gone.

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
   sprawl — 646 `icon` rules, 306 of which set a size, 237 setting _both_ width and height, and
   127 carrying a negative margin. See "Icon sizing rework" below: step 1 (the ratio data layer)
   has landed; steps 2–3 have not.

   Sizing in `em` was the earlier candidate and was **rejected**: font-size is already load-bearing
   for text in these sheets, so it would couple every typography tweak to icon layout. The
   `--icon-h` custom property does the same job without the coupling.

4. **Singular/plural class aliases** (`sand/sands`, `wetland/wetlands`, `beast/beasts`, …) double
   dozens of selectors. Better handled by normalizing the class name once in the JS that already
   post-processes the DOM.
5. **`printer-clean`** exists as four near-identical blocks (adversary/aspect/scenario/board_lore)
   plus different spirit-board rules — consolidation needs a deliberate shared-frame decision.
6. **`icon.fast` / `icon.slow` scope leak** — _restructured, not yet narrowed._ The art now goes
   through the power-speed layer in `global.css` (see below), so which set wins is **declared**
   instead of falling out of `@import` order. The resolution is unchanged on purpose: spirit-board,
   aspect and adversary still opt in page-wide, cards still only inside `<rules-container>`.

   What's left is the deliberate call the old note asked for. Aspect pages get power art page-wide
   only because `aspect.css` imports `growth-options.css`; `MyAspect/Intensify_Aspect.html` has
   `{fast}` in a bare `<td>`, outside growth/special-rule/effect, and picks it up that way.
   Narrowing is now a one-line edit — swap a `:root` opt-in for a context list — and it _will_
   change pixels, so re-baseline first.

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
12. **Growth DOM vocabulary** — ~44 cell-interior element types that are really five shapes.
    Mapped in full below ("Growth vocabulary consolidation"); batches 1–7 done — see the status block there.

## Icon sizing rework

Why both dimensions get set everywhere: **a `background-image` contributes nothing to layout**. A
background has no intrinsic size for its box, so `width: auto` on a background-driven `<icon>`
computes to zero. That single fact is what forces all 237 width+height pairs, and it's why the
negative margins exist — e.g. `icon.explorer` sits in a 25×25 box while the art is 200×343, so
`background-size: contain` paints it 14.6px wide and leaves ~10px of dead space that gets clawed
back with a margin. Change the box in one context and the margin is wrong in the next.

Three steps. **Step 1 is done; 2 and 3 are not.**

1. **Ratio data layer (landed).** `npm run genIconRatios` (`scripts/gen-icon-ratios.js`) reads
   intrinsic dimensions out of the PNG `IHDR` / JPEG `SOF` headers into 159 ratio tokens, and
   points every icon `background-image` at the one for its art. Details below.
2. **Base rule opts in**: `icon { aspect-ratio: var(--icon-ratio); height: var(--icon-h, 25px);
width: auto }`. Note `aspect-ratio` is ignored while a rule still sets both dimensions, so this
   only takes effect per context as step 3 converts them.
3. **One context at a time**, deleting `width` and the now-pointless negative margins as each is
   converted. Contexts declare `--icon-h` once (`special-rule { --icon-h: 30px }`,
   `threshold { --icon-h: 45px }`, …) instead of maintaining per-class pixel tables. This is the
   same proximity-beats-specificity trick as the element icon layer above — custom properties
   resolve by position in the DOM, so nesting composes and the source-order fights disappear.
   Start with `special-rules.css` (34 icon rules); leave `growth-options.css` (160) for last.

### Probe result (2026-08-03): convert `special-rules.css`, then revert

Step 2+3 were trialled on `special-rules.css` and **reverted**. The mechanism works — art stayed
pixel-identical, text did _not_ re-wrap, and the existing negative margins held up — but it costs
more than it saves:

|                              | before | after |
| ---------------------------- | ------ | ----- |
| px width/height declarations | 57     | 51    |
| icon rules                   | 32     | 35    |
| file lines                   | 444    | 456   |

Six fewer numbers for twelve more lines, and 32 of 45 spirit boards changed (mostly 0.02–0.5%; one
at 1.6%). The cost comes from two places: rules whose classes bind on _different_ axes have to be
split in two, and a third of the rules target classes with no art to derive a ratio from
(`.element`, `.range-plus-*`, and the `.tiny`/`.small`/`.medium`/`.large`/`.huge` size modifiers).

Two findings that reshape the plan:

1. **`--icon-h` per context can't work.** Ratios in `special-rule` alone span 0.583 (`explorer`) to
   5.818 (`range`); a shared `--icon-h: 30px` would make `icon.range` 174px wide. Height is not the
   shared dimension.
2. **The square box is load-bearing.** `width: 30px; height: 30px` + `contain` means "fit inside a
   30px square" — it normalizes icons by _bounding box_, which is what keeps a tall `explorer` and
   a wide `sacred-site` looking balanced side by side. Any single-dimension scheme replaces that
   with height- or width-normalization, which is a visual design change, not a refactor.

**What to do instead — collapse the square boxes.** 119 of the 234 both-dimension rules are square,
i.e. 238 numbers that are really 119. Those want one variable, not `aspect-ratio`:

```css
icon {
  width: var(--icon-size, 25px);
  height: var(--icon-size, 25px);
}
special-rule {
  --icon-size: 30px;
} /* whole per-context tables collapse */
special-rule icon.star {
  --icon-size: 41px;
}
```

This keeps `contain`'s bounding-box normalization exactly, so it is **pixel-identical** — no
re-baseline, no visual review — and it delivers the per-context single-number goal that motivated
the rework. Most common square sizes: 25px (×16), 30px (×13), 45px (×10), 35px (×8), 40px (×8).

The 115 rectangular rules are the remaining question. `aspect-ratio` is the right tool for the ones
whose box is genuinely wrong — `special-rule icon.range` paints 43×7.4 inside a 43×40 box, 82% dead
space — but the probe says treat those as individual bugs, not as a mechanical sweep.

**Why `aspect-ratio` and not intrinsic sizing.** `content: url()` on a `::before`, or a real
`<img>`, would size correctly with no per-icon data at all — but the size is only known _after the
image decodes_. `board_front.js` measures `getBoundingClientRect().width` to lay out growth cells
and thresholds (≈ lines 6379, 6391, 6409, 6880), so intrinsic sizing makes every one of those
measurements race the network — the same bistable-render failure as the font race in item 2.
`aspect-ratio` is known at parse time. (`content: url()` would also break the composite icons —
`icon.push > icon`, `icon.your-land > icon` — the `background-position: bottom` crop in
`innate-power.css`, and the existing `icon.is-no::after`.)

**Every ratio number is declared exactly once.** A ratio belongs to the _image file_, so the
generated `icon-ratios.css` holds one `--art-<image>-ratio` token per image (141 of them), and each
rule that paints that art references it:

```css
/* icon-ratios.css — generated */
:root {
  --art-sacred-site-ratio: 253 / 150;
}
/* global.css */
icon.sacred-site {
  background-image: url(".../sacred_site.png");
  --icon-ratio: var(--art-sacred-site-ratio);
}
```

Without the token layer the same number gets restated wherever the art is: before this, 31 images
repeated across 2–6 rules apiece, 80 sites in total.

**Any url()-valued custom property is an art token too**, so `--el-fancy-sun` and
`--speed-power-fast` get ratio siblings that _point at_ the image's `--art-*` token rather than
restating it:

```css
--el-fancy-sun: url("../images/board/Sun.png");
--el-fancy-sun-ratio: var(--art-sun-ratio);
```

The result is that **every ratio literal in the tree lives in `icon-ratios.css`** — no exceptions.
Unlike the `url()` tokens, ratios are plain numbers with no relative-path hazard, so they resolve
fine from any sheet at any depth.

**Which rules carry a `--icon-ratio` at all.** global.css's top-level `icon.<class>` rules are the
default table; a rule elsewhere declares one only when it resolves to a _different token_.
`info-range icon.sand` is `sands-presence.png`, not `sand.png`, so it needs one; `info-range
icon.ocean` is the same art as global, so it declares nothing and the table wins by cascade. What
remains therefore tracks real art divergence — items 1 and 6 are the lever for reducing it further,
not the ratio layer.

**Constraints for future edits.**

- Never hand-edit `icon-ratios.css` or a `--icon-ratio`, and never separate one from its
  `background-image`. Adding a new icon means adding the `background-image` and re-running
  `npm run genIconRatios`; `-- --check` exits non-zero when anything is stale, which is also what
  keeps the default-table dedup from drifting when art changes.
- `global.css` pulls the tokens in with `@import "icon-ratios.css"` on line 1 — every component
  sheet already loads `global.css`, so nothing else needs wiring.
- The base `icon` rule in `global.css` carries `--icon-ratio: initial`. Custom properties inherit,
  and composite icons nest `<icon>` children, so without the reset a child with no art of its own
  (`icon.custom1/2/3`, a bare `icon.element`) would inherit its parent's ratio. Every
  `icon.<class>` rule outranks the reset on specificity.
- Deliberately skipped, and should stay skipped: `icon.no`, `icon.is-no`, `no-icon` (strike-through
  overlays stretched over whatever they cover — see item 7), and `icon.range-any` (a zero-width
  spacer). Panel and frame backgrounds (`card-frame`, `growth-background`, …) are out of scope by
  design; only rules whose innermost selector targets `<icon>` get a ratio.
- The generator is line-based and assumes prettier formatting (one declaration per line).

Verified pixel-identical: 87-file corpus, 85 identical / 0 changed / 2 noise (4 px and 5 px, versus
the 300 px noise floor). Inert by construction anyway — nothing reads `--icon-ratio` until step 2.

## Growth vocabulary consolidation (mapped 2026-08-04; batches 1–7 done, tuning in flight)

**Where it stands (2026-08-14).** ~44 cell-interior element types are down to a vocabulary of
nine — `cell-icons`, `icon-row`, `badge`, `range`, `piece-move`, `presence-req`, `ring-icon`,
`gain`, `icon` — plus the shared presence-node family and micro-tags (`value`, `range-value`,
`textvalue`, `no-icon`). Committed: the icon-sizing/ratio landing, the suite rebaseline, and
batch 1 (through `aab10ca6`). Uncommitted on top: batches 2–7, the follow-up fixes below, and
resonant's tuning pass (≈70 files) — flagged for a checkpoint commit. Remaining work:
(1) the incarna `add-move-upper/-lower` / `add-token-upper/-lower` pass — the last non-vocabulary
tags in a cell; blocked on chosen values because their width/margin declarations are inert on
inline elements today and conversion activates them; (2) join-glyph standardization
(`span.plus-text` vs the `plus-text` element, remaining "+" text nodes in token rows);
(3) deferred/adjacent: `growth-cost` typography into the badge family, the presence-track
`div.push`/`icon.push` harmonization (icon.css's growth-dead offset blocks wait on it), and the
`modified-reclaim`/`discard-element` element-art maps from the original audit.

**Batch 7 follow-ups (calibration ergonomics + art).** `icon-row.pieces` and the terrain
half-arrows are **center-anchored**: their left/bottom name the element's center point via a
`translate(-50%, 50%)`, so rows grow outward symmetrically and the numbers mean "the arrow
head". The terrain arrow **nests inside the terrain icon** and anchors in percentages of the
terrain's own box (left 100% / bottom 40%), so single and double terrains share one rule. Both
directions now paint one art file, `NewIcons/Misc Arrow Gather-Push.png` (ratio token
`--art-misc-arrow-gather-push-ratio`, regenerated on each art update); the art points left
(gather) and the push variant mirrors it with `scaleX(-1)` composed after the anchoring
translate — keep the translate when tuning that rule. The orphaned `half_arrow_*` ratio tokens
dropped out of the generated file automatically.

**Post-batch fixes.** Badge digits were silently bolded by batch 6 (badges moved inside
`cell-icons`, whose base is bold): `badge value` now resets to normal weight, with
`badge.damage value` explicitly bold (its historical look), and the same reset applied to
`icon.reclaim-num value` and the incarna ANY textvalue. Separately, 3+ 'or' land-requirement
lists (Vengeance-style) now join with `{backslash}` icons instead of "/" text nodes, guarded by
a load-bearing `presence-req icon.backslash { margin-bottom: 0 }` against icon.css's 22px.

Each batch is two verifiable steps. **Step A — re-tag**: writers emit the new vocabulary, CSS
declarations carried over verbatim; verified by the snapshot diff classified line-by-line (must
be pure re-tagging). **Step B — factor**: hoist declarations shared by the new sibling classes
into the base rule so each class states only its differences, and delete no-op declarations
(margins restating the 0 default, `width: auto`, …) — CSS-only, so the check is the browser
geometry probe alone. Probe: 45 renderable MySpirit boards, growth/table/cell/art/text rects at
0.5px tolerance; every step so far has come out at zero differences, meaning row-wrap and width
distribution are untouched. Hand verification by resonant on top.

The factored base: `cell-icons` = 26.66px bold normal-style, `display: flex`, 90px
bottom-justified column; mode classes carry deltas only (`.custom` a horizontal 100px box,
`.incarna-move` top-justified; `.stack` is now a bare marker class for child rules). Both
add-presence mode classes were then eliminated as unneeded (resonant, 2026-08-05): `.plain`
(bare `add-presence(N)`) — its 88px height, 2px outer margin, and 5px plus-row gap normalized
to the base, a deliberate ≤2px shift in 76 cells across 36 boards; and `.any`
(`add-presence(any)`) — its 40px/52px-offset block dropped so the plus row bottom-aligns in
the standard band like every other cell, a deliberate 52px shift in the 2 pure-any cells in
the corpus. Zero width or row-wrap changes from either. On the JS side "plain"/"any" remain
parser modes (they decide whether a range element is emitted) but emit no class — a bare
`class="add-presence"`.
Two historical asymmetries were judged accident, not design, and flattened (resonant's call,
2026-08-05): `font-style: normal` moved to the base (previously only `.plain`/`.stack`; the one
place this can show is a req-form nested in an italic `growth-cell-double` via `or(...)`), and
`display` unified to `flex` (previously `inline-flex`/`flex` per tag — identical in flex-item
positions; the non-flex context, cells inside `ring-icon` (inline-block) via
`presence-node(blank)` / `presence-node(<action>)`, was measured element-by-element on a
synthetic board with old-display overrides vs unified: zero differences). `.any` keeps
`display: block` — that one is a real layout difference (~9px vertical shift if flattened),
a tuning decision rather than a duplicate.

**Batch 1 — add-presence (done, 915e4b20).** `_renderAddPresence` now emits
`<cell-icons class="add-presence plain|any|req [text] [with-land …]">` containing
`<icon-row class="plus">` / `.or` / `.relative` / bare `icon-row` (was `display-custom`),
`presence-req` rows, and `{range-N}` (nothing for "any"). Retired: `custom-presence`,
`custom-presence-req`, `custom-presence-no-range`, `custom-presence-or`, `plus-presence`,
`add-relative`, `display-custom`, `range-growth-any`, `span.presence-text-spacer` (now a
`min-height` on `.text presence-req:empty`), and the empty `<presence-req>` spacers. Also
deleted as verified-dead (no emitter anywhere): `custom-presence icon.range-0..4`,
`custom-presence-req icon.range-0..4`, `custom-presence-no-range icon.range-any`. New
fixtures cover the with-land token/relative forms and the req+any-range form, which had no
snapshot coverage. Legacy note: the won't-fix `token …instead` form now renders an empty
`<presence-req>` with no spacer span, same as before to the pixel.

**Batch 2 — the custom-icon column wrappers (done).** All 17 emitters of `custom-icon`,
`custom-icon2` and `custom-growth-icon` (including the presence-track incarna add-move path at
~board*front.js:2886, which shares the composite) now emit `<cell-icons class="stack …">` with a
semantic per-action class as a tuning handle — `move-presence`, `incarna-move` (the old
custom-icon2, which keeps its top-aligned quirk via `justify-content: flex-start`),
`incarna-add-move`, `incarna-add-token`, `incarna-replace`, `isolate`, `damage`, `add-token`,
`replace`, `gain-card-pay-2` — or `<cell-icons class="custom [wide]">` for custom()/custom-wide()/
blank()/error cells (`.wide` was `.wide-growth`; the empty-`class` attribute artifact is gone).
Retired: `custom-icon`, `custom-icon2`, `custom-growth-icon`; deleted as verified-dead:
`icon.custom-growth-icon` (both rules — it's a class no writer ever puts on an icon). Kept
deliberately unchanged for later batches: `token-wrap`, `add-move-upper/-lower`,
`add-token-upper/-lower` (unknown elements are display:inline, so their width/margin-bottom
declarations are inert — converting them to `icon-row` would \_activate* those and change layout;
needs its own deliberate pass), `range-growth`/`move-growth` (arrow batch), `growth-damage`
(badge batch), `replace-wrap`/`destroy-wrap` (row batch).

**Batch 3 — the badge family (done).** One `<badge>` element (blank art + `<value>`) with a
class picking art and size, replacing seven tags: `growth-energy` → `badge.energy`, `gain-per`
→ `badge.energy.per`, `growth-fear` → `badge.fear`, `fear-per` → `badge.fear.per`,
`card-play-num` → `badge.plays`, `growth-damage` → `badge.damage`, `repeat-growth`
(+`.energy-cost`) → `badge.repeat` (+`.cost`). Base carries the shared art plumbing and
"Energy Font" value typography; each class states art, box, and value offsets (damage keeps
Antropos). The `gain-per-element`/`gain-per-fear` pass-through wrappers died outright — the
writer now emits `<ring-icon class="per energy|fear">` directly, one DOM level less, with the
two 8-selector icon lists collapsed into one `ring-icon.per icon` rule.
`getScalingGainTextAndIcons`'s three-tag `tags` parameter became a single `resource` class.
Cross-sheet: the four `presence-node[-multi] card-play-num` rules in presence-track-table.css
re-keyed (the plays badge also renders inside track nodes — emitter at ~board_front.js:3008),
and `gain-per-fear` in global.css's simple-art context list became `ring-icon.per.fear`. The
`presence-node.growth` energy overrides gained `:not(.per)` to keep their historical flat-only
scope. `background-position: center` moved to the badge base — safe for `.repeat`, whose two
blank arts are square within 1% (67×68, 659×654 checked from the PNG headers). Verified:
snapshot diff fully classified; geometry probe extended to presence-node internals — 49 boards,
zero diffs in growth cells and node/value rects.

**Batch 4 — the arrow family (done).** Growth now has one range arrow: every writer that
hand-rolled `<range-growth><value>N</value></range-growth>` (isolate, damage, add-token,
replace, push/gather) instead emits `{range-N}`, the same brace token add-presence always used,
expanding to `<range class="range"><range-value>N</range-value></range>` — so `range-growth`
died and the two shared arrow/value rules lost their second selector. `growth-range` (a 90px
bottom-aligner around gain/lose-range) died in favor of the standard
`<cell-icons class="stack gain-range">` wrapper, making those cells consistent with every other
stack cell. `move-growth` renamed to `move` — which required deleting the dead legacy `move {}`
element rule in the same change so it couldn't suddenly match; the rest of the verified-dead
legacy block went with it (`growth-cell card-play`, `your-land`, `push`, `gather` element
rules). Verified: snapshot diff fully classified (re-tags plus pretty-printer line rejoins
around the new brace tokens); geometry probe zero diffs on every board exercising the
conversions (Starlight, Many Minds, tokens/Relentless/Wounded Waters), gain-range confirmed on
the synthetic board (no corpus coverage). Probe attribution note: resonant tunes live between
captures (badge.repeat offsets, gain-time icon sizes landed mid-batch) — the probe flags those
as diffs, so from here attribution means checking flagged rules against the batch's own edit
list before assuming a regression; one 4–6px two-board blip during that window matched no edit
on either side and reverted by the next capture (transient editor state, stable across 4
consecutive renders after).

**Batch 4b — move arrows are range arrows (resonant's call).** The `move` element (né
`move-growth`) is gone: move-presence and incarna(move) emit the standard `{range-N}` token,
and context swaps the art — `cell-icons.move-presence range, cell-icons.incarna-move range`
carry move_arrow.png + the 62px/9px box, same pattern as the element icon layer. Non-numeric
move ranges now ride the expander's existing range-icon path instead of a hand-rolled
`<value>{icon}</value>`. One irregular case: `incarna(move,any)` has no brace token
(`{range-any}` means the any-element icon), so it hand-writes
`<range><textvalue>ANY</textvalue></range>` with its own context rule. Digit offsets in the
context rules are starting values approximating the old line metrics (`line-height: 28px`,
zeroed bottom/left) — calibrate; arrow boxes verified identical by probe. Follow-up (resonant):
the moved pieces above the arrow all sit in one `<icon-row class="tokens">` — single presence,
N-together, and presence+token alike. `.tokens` is the survivor name for the token-wrap row;
`token-wrap` (still emitted by add-token) shares its two rules via selector lists until the row
batch retires it. Single-presence move cells pick up the row's 4px bottom padding, so that icon
sits ≤4px higher than before — now identical to the multi-piece forms; cell boxes and widths
verified unchanged.

**Batch 5 — the rows (done).** The last row tags fold into `icon-row`: `token-wrap` →
`.tokens` (add-token, finishing the move-presence transition), `icon-holder` → `.cluster`
(the wrapping pile of push/gather targets on the arrow art; its
`icon.backslash { margin: 0 }` override is load-bearing against icon.css's 22px and says so in
a comment), `replace-wrap` → `.replace` (dropping the always-emitted, empty-ruled `no-range`
class and the empty `:first/:last-child` shells), `destroy-wrap` → `.destroy`.
`growth-cell-double` became `cell-icons.choice` (or/then, join word as text node — hence the
italic Lato) and `cell-icons.combo` (the flat+per composites of gain-energy/fear) —
cell-icons, not icon-row, because they ARE the cell's art block (resonant's call): their
contents are full-size action art that must size from the cell context, not the glyph-row
tuning; the explicit height/justify/font lines in their rule neutralize the cell-icons column
base. Tuning-layer lesson made concrete here: resonant's `icon-row { --icon-h: 42px }` rule
(calibrated for the plus/or glyph rows) applies to every converted icon-row — an
`--icon-h: inherit` escape on the converted rows was tried and deliberately reverted by
resonant, who is tuning those sizes by hand instead (token rows currently render at 42px
pending that pass). The standing rule for future conversions: check the target vocabulary's
`--icon-h`/`--icon-scale` context rules before converting, and surface the interaction
rather than silently escaping it.

**Batch 6 — the invariant cell structure (resonant's call, done).** Every growth cell now
renders as `<growth-cell><cell-icons …/><growth-text/></growth-cell>` — no exceptions. One
normalization point in `getGrowthActionTextAndIcons` wraps whatever a renderer returns:
already-`cell-icons` roots pass through; presence-node/track roots get
`<cell-icons class="node">` (board hardware, `height: auto` escape from the 90px band);
everything else — bare icons, badges, `<gain>` — gets the bare band. Two tags died as a
consequence: `repeat-wrapper` (the `badge.repeat` now injects into the guaranteed root,
absolutely positioned as the repeat contract requires) and the
`push-gather`/`push-gather-range-req` pair (now `cell-icons.stack.push-gather[.with-range]`,
collapsing seven two-selector rule pairs to one selector each; the rangeless form keeps its
historical `display: block` inline-flow layout). A malformed never-matching two-selector rule
(ocean push-arrow nudge, missing comma) was deleted rather than silently activated — noted in
the sheet. Layout-engine safety verified before writing: `getGrowthActionIconWidth` reads
`children[0]`'s rect (the band shrink-wraps to the same width) and `addGrowthTrackBanners`
uses rect math against `closest("growth")` — both wrapper-independent. Measured impact: **zero
row-wrap changes**; 201 cells across 43 boards shifted — 173 vertical-only (bare icons/badges
settling onto the band's common bottom baseline, the intent of the change; up to 26px on tall
icons like ignorerange/make-fast/empower-incarna), the rest width settling from bands absorbing
negative horizontal icon margins plus dynamicResizing redistribution. Tuning knobs: the
`cell-icons` base band, `.node`, and per-icon rules as before.

**Batch 7 — push/gather redesigned as `<piece-move>` scenes (resonant's call: start fresh,
recalibrate).** The old four-shape system (baked-art `icon.push/gather`, token-condition
`icon.push-from/gather-into` with `icon.from/into`, terrain `terrain-push/gather` with layered
half-arrows, counted `icon-row.cluster`) is gone. One scene element now:
`<piece-move class="push|gather">` holding a land slot, the moved pieces in
`<icon-row class="pieces">`, and — terrain compositions only — a separate half-arrow. The
default land is the canonical Spirit Island scene art, renamed honestly:
`icon.land-push` (Land Push.png) / `icon.land-gather` (Track*Gather.png), sharing one art rule
in global.css with `icon.push`/`icon.gather`, which remain as the legacy presence-track aliases
(the track `div.push` vocabulary is untouched — a future harmonization target). Token/board
conditions overlay the land \_inside* the scene icon (the your-land pattern) instead of a
hand-offset sibling. The writer collapsed to one template whose only branch picks the land;
"or" targets join with `{backslash}` in the pieces row. CSS: ~25 rules of per-variant absolute
nudges across three sheets became one `piece-move` section (~8 rules) where every position is
an explicit left/bottom + `--icon-h` on a labeled slot — no margins, calibrate freely; starting
values render sanely (150×90 scene; wide double-terrains spill toward the pieces zone until the
land `--icon-h` is tuned). Retired: `icon.push-from`, `icon.gather-into`, `icon.from`,
`icon.into`, `terrain-push`/`terrain-gather`, `icon-row.cluster`, the push-gather
`display: block` wrapper quirk, and the old offset tables (icon.css's `icon.push/gather`
child-offset blocks are now growth-dead but left in place pending the track harmonization).
This is a redesign, not a parity pass: snapshots rebaselined to the new shapes; hand
verification on Ocean's Hungry Grasp, Many Minds, and the push/gather examples.

The rendered growth panel uses ~60 element types; inside a `growth-cell` there are ~44, and they
reduce to five shapes, each reinvented several times: a vertical art-band stack, a horizontal
icon row with a join glyph, a badge (blank art + `<value>`), an arrow with a number, and a ring
composite. The save format (`<growth>`, `<sub-growth>`, `<growth-group values="…">`) is untouched
by all of this — every redundancy lives between the `board_front.js` writers and
`growth-options.css`, and the whole layer is regenerated on every render, so old saved files pick
up a new structure automatically.

Evidence: the full post-`startMain()` growth DOM of every `MyCustomContent/MySpirit` board, plus
five synthetic boards covering the vocabulary the EXAMPLE fragments can't render (they die in
`startMain` before growth builds — swap their `values=` into a full board to render them). Both
dumps were produced through the `tools/visreg` harness (`/harness?type=spirit-board&file=…`,
then serialize `document.querySelector("growth")`).

### Target vocabulary

Panel chrome stays: `section-title`, `sub-section-title/-line/-header`, `special-section-title`,
`growth-table`, `growth-group`, `growth-border`, `growth-row-line`, `growth-bottom`,
`growth-background`, `tint`, `growth-cost`. Cell interior collapses to ~12 (names are
placeholders):

| Tag                              | Role                                                                            | Absorbs                                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `growth-cell`                    | one action: art band + caption                                                  | —                                                                                                                                                                                                               |
| `growth-text`                    | caption                                                                         | —                                                                                                                                                                                                               |
| `icon`                           | every pictogram, class-driven, incl. nests                                      | —                                                                                                                                                                                                               |
| `cell-icons` _(new)_             | THE vertical stack: ~90px art band, bottom-justified                            | `custom-presence`, `custom-presence-req`, `custom-presence-no-range`, `custom-icon`, `custom-icon2`, `custom-growth-icon`, `push-gather`, `push-gather-range-req`, `growth-range`, `repeat-wrapper`             |
| `icon-row` _(new)_               | THE horizontal row, optional join glyph                                         | `growth-cell-double`, `token-wrap`, `icon-holder`, `custom-presence-or`, `plus-presence`, `add-move-upper/-lower`, `add-token-upper/-lower`, `replace-wrap`, `destroy-wrap`, `display-custom`, `gain.or` layout |
| `presence-req`                   | requirement-row typography                                                      | the join-glyph zoo (`span.plus-text`, `plus-text` element, bare text nodes) via one standard join element                                                                                                       |
| `badge` _(new)_                  | blank art + `<value>`, class picks art/size                                     | `growth-energy`, `gain-per`, `growth-fear`, `fear-per`, `card-play-num`, `growth-damage`, `repeat-growth` (+`.energy-cost`), `icon.reclaim-num` value styling; `growth-cost` value typography joins the family  |
| `range`                          | the range arrow (already what `{range-N}` expands to)                           | `range-growth`, `growth-range`, `.gain-range` as `.gain`; `range-growth-any` deleted — "any" = no range element                                                                                                 |
| `move` (rename of `move-growth`) | move arrow + `value`/`textvalue`                                                | `move-growth`                                                                                                                                                                                                   |
| `ring-icon`                      | ring composite (shared with tracks)                                             | `gain-per-element`, `gain-per-fear` (pure pass-throughs around it)                                                                                                                                              |
| `gain`                           | element-gain cell; the fancy-art revert hook                                    | keeps name; `.or` layout via `icon-row`; `icon-multi-element` stays                                                                                                                                             |
| node/track family                | `presence-node`, `presence-track`, `track-banner-art`, `deep-layers`, `subtext` | — (shared subsystem)                                                                                                                                                                                            |

Micro-tags retained: `value`, `range-value`, `textvalue`, `no-icon`, `icon-count`, `binder`,
`span.non-icon`, `div.custom-scaling`.

### Writer map (board_front.js)

Cell frame — `writeGrowthAction` (~470):

- `or()`/`then()` (~519): `growth-cell-double` with a bare «or» text node → `icon-row.choice`
  with a join element (styleable, localizable).
- blank captions (~525): `growth-text.blank-text` forced to 4px → omit — **but see the
  layout-engine contract below first**; the parallel-collection assumption must be fixed in the
  same commit, or keep an empty `growth-text` per cell.
- error cell (~460): `custom-growth-icon > div.custom-scaling` → `cell-icons`.
- `^N` / `^cost(n)` (~596–651): `repeat-wrapper > repeat-growth>value` → `badge.repeat` /
  `badge.cost` absolutely positioned by `cell-icons` (repeat-growth is already
  `position:absolute`, so this does not change measured widths).

Group frame — `writeGrowthGroup` (~368): `growth-cost` keeps its 3 forms; `<tint class='tint'>`
is an element _and_ an identical class — pick one.

Per-action renderers — `GROWTH_ACTION_RENDERERS` (~821):

| Action                                                                             | Writer (≈line)                              | Current                                                                                                                                                                                                                                                                                         | Target                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bare names (reclaim-all, gain-power-card, make-fast, days-never-were, elements, …) | fallback 640                                | `{name}` → `icon.name`                                                                                                                                                                                                                                                                          | unchanged                                                                                                                                                                                                 |
| `reclaim(all/one,elem)`                                                            | 824                                         | `icon.reclaim-* .modified-reclaim > {elem}`                                                                                                                                                                                                                                                     | same nest; its 10-element CSS art map → the element-layer fancy hook (open item: "Not yet converted" list in the element layer section)                                                                   |
| `reclaim(N)`                                                                       | 859                                         | `icon.reclaim-num > value`                                                                                                                                                                                                                                                                      | value styled by badge family                                                                                                                                                                              |
| `discard(elem)`                                                                    | 986                                         | `icon.discard-card > icon.discard-element.X`                                                                                                                                                                                                                                                    | same; second element map → same hook                                                                                                                                                                      |
| `gain-card-pay-2`                                                                  | 871                                         | `custom-icon > {icon}`                                                                                                                                                                                                                                                                          | `cell-icons`                                                                                                                                                                                              |
| `isolate(N)`                                                                       | 876                                         | `custom-icon + range-growth`                                                                                                                                                                                                                                                                    | `cell-icons > icon + range`                                                                                                                                                                               |
| `damage(r,d)`                                                                      | 894                                         | `custom-icon > growth-damage + range-growth`                                                                                                                                                                                                                                                    | `cell-icons > badge.damage + range`                                                                                                                                                                       |
| `gain-energy(…)` / `fear(…)`                                                       | 917/925 → `getScalingGainTextAndIcons` 1303 | `[growth-cell-double] growth-energy/growth-fear + gain-per/fear-per + gain-per-element/gain-per-fear > ring-icon`                                                                                                                                                                               | `icon-row > badge.energy/.fear (+.per) + ring-icon`; the helper's `tags` param collapses from 3 names per resource to 1 class                                                                             |
| `gain-card-play(N)`                                                                | 950                                         | `card-play-num>value`                                                                                                                                                                                                                                                                           | `badge.plays`                                                                                                                                                                                             |
| `element-marker(±N)`                                                               | 962                                         | `gain > icon-multi-element×N`                                                                                                                                                                                                                                                                   | unchanged                                                                                                                                                                                                 |
| `gain-element(…)`                                                                  | 1102                                        | `gain` / `gain.or > orelement + {backslash}`                                                                                                                                                                                                                                                    | keep `gain`; `.or` via `icon-row` join                                                                                                                                                                    |
| `incarna(move)`                                                                    | 1019                                        | **`custom-icon2`** > icon + move-growth                                                                                                                                                                                                                                                         | `cell-icons > icon + move`                                                                                                                                                                                |
| `incarna(add-move / add-token)`                                                    | 1036/1050                                   | `custom-icon > add-move-upper/-lower` resp. `add-token-upper/-lower` — four tags for the same two-row shape                                                                                                                                                                                     | `cell-icons > icon-row ×2`                                                                                                                                                                                |
| `incarna(replace)`                                                                 | 1044                                        | `custom-icon > icon.with-incarna` nest                                                                                                                                                                                                                                                          | `cell-icons` + same nest                                                                                                                                                                                  |
| `incarna(empower)`                                                                 | 1033                                        | `{empower-incarna}`                                                                                                                                                                                                                                                                             | unchanged                                                                                                                                                                                                 |
| `move-presence(…)`                                                                 | 1066                                        | `custom-icon > [token-wrap] + move-growth`                                                                                                                                                                                                                                                      | `cell-icons > [icon-row] + move`                                                                                                                                                                          |
| `add-presence(…)` all modes                                                        | `_renderAddPresence` 1672                   | `custom-presence` \| `custom-presence-req(.with-land…)` \| `custom-presence-no-range` + `plus-presence`, `custom-presence-or`, `presence-req` (incl. empty-spacer emission at 1718), `display-custom`, `add-relative`, `span.plus-text`, `span.presence-text-spacer` (1734), `range-growth-any` | one `cell-icons` (mode → class) containing `icon-row.plus`, `presence-req`, optional `range`; "any" = no range element; spacers become CSS `min-height`; `add-relative` survives as an `icon-row` variant |
| `add-token(…)`                                                                     | ~1180                                       | `custom-icon.add-token > token-wrap + range-growth` / `presence-req` conditionals                                                                                                                                                                                                               | `cell-icons > icon-row.plus + range` / `presence-req`                                                                                                                                                     |
| `replace(…)`                                                                       | 1264                                        | `custom-icon > replace-wrap(.no-range)` + `destroy-wrap`                                                                                                                                                                                                                                        | `cell-icons > icon-row`; overlap positioning stays on `icon.replace-this/-with`                                                                                                                           |
| `push` / `gather`                                                                  | `_renderPushGather` 1378                    | **tag chosen by whether range exists** (1398): `push-gather` vs `push-gather-range-req`; + `icon-holder`, `range-growth`                                                                                                                                                                        | one `cell-icons`; icon composites unchanged; `icon-holder` → `icon-row`; `range-growth` → `range`                                                                                                         |
| `gain-range` / `lose-range`                                                        | 1459                                        | `growth-range > {gain-range-N}`                                                                                                                                                                                                                                                                 | bare `range.gain` — the wrapper only bottom-aligned, which `cell-icons` does                                                                                                                              |
| `custom` / `custom-wide`                                                           | `_renderCustom` 1473                        | `custom-growth-icon(.wide-growth)` + empty-`class` attribute artifact                                                                                                                                                                                                                           | `cell-icons(.wide)`; fix the empty class                                                                                                                                                                  |
| `blank(N)`                                                                         | 1165                                        | `custom-growth-icon style='max-width:Npx'`                                                                                                                                                                                                                                                      | `cell-icons.blank` + width var                                                                                                                                                                            |
| `take/gain-power-card(mod)`                                                        | `_renderGainPowerCard` 1357                 | icon nest + `div.gain-card-second-modifier`                                                                                                                                                                                                                                                     | icon nest; the div becomes a class on the modifier icon                                                                                                                                                   |
| `presence-node` / `presence-track`                                                 | 660–820                                     | node/track vocabulary                                                                                                                                                                                                                                                                           | unchanged                                                                                                                                                                                                 |

Brace expander (`common.js` `replaceIcon`, ~5): already emits the survivor `range` tag; its
`custom-energy` output joins the badge family typography. Otherwise untouched.

### Deleted outright

- CSS: the six column-wrapper blocks; 3 of 4 range tags; ~7 bespoke badge blocks;
  `gain-per-fear` + its duplicate `ring-icon` block; two 40-line element maps
  (`modified-reclaim`, `discard-element`); the `plus-text`/`.plus-text` twin; dead selectors
  verified never-emitted (`add-presence-req`, `presence-special-req`, element-rules `push{}`,
  `gather{}`, `move{}`, `your-land{}`, `growth-cell card-play`, post-render `sub-growth`);
  the commented-out blocks. Eyeball: growth-options.css shrinks by a third to a half.
- DOM: empty `presence-req` spacers, `presence-text-spacer`, `range-growth-any`,
  `blank-text` growth-texts (contract permitting), `repeat-wrapper`, empty `class` attributes.

### Layout-engine contract (`dynamicResizing` audit, 2026-08-04)

Audited `dynamicResizing` (~6102), `growthHeadersAndTitles` (~5989), `getGrowthTableWidth`
(~6790), `getGrowthActionIconWidth` (~6808), `balanceText`/`addLine`/`reduceLines` (~6911+),
plus a grep of all of `_global/js` and `src/` for by-name queries.

**No by-name coupling to any doomed tag.** The layout engine queries only survivors: `growth`,
`growth-table`, `growth-group`, `growth-border`, `growth-cell`, `growth-text`, `growth-cost`,
`growth-row-line`, `sub-section-title/-header`, and it _creates_ `growth-table`,
`growth-border`, `growth-row-line`, `special-section-title`. The only other DOM-query hit in the
sweep was `custom-icons` (the head style extension point — unrelated). The outer app
(`preview-frame`, spirit-board `index.svelte`) touches only `growth`, `growth-group`,
`growth-cell[id]`, `presence-node`, `presence-tracks`.

The real contracts are **positional and geometric**, and they are what a consolidation must
protect:

1. **The art block must be `growth-cell.children[0]`, and must shrink-wrap.**
   `getGrowthActionIconWidth` is `cell.children[0].getBoundingClientRect().width` — no tag name
   involved. Every writer today emits an art element first (even `blank()` and the error cell).
   Two failure modes: (a) if a cell ever has no art element, `children[0]` is the
   `growth-text` and the measurement silently changes meaning; (b) if the unified `cell-icons`
   were `display:block` (100% width) the "natural icon width" becomes the _current cell width_,
   feeding the width-distribution loop its own output. Keep it `inline-flex`/fit-content like
   every wrapper it replaces.
2. **One `growth-text` per `growth-cell`, in document order.** The resize loops walk
   `growthCells[j]` and `growthTexts[j]` as parallel collections (~6310–6348, and board-wide
   ~6213–6233). Removing `blank-text` growth-texts skews the indices for every later cell.
   Either keep an empty `growth-text` per cell, or re-pair the loops per-cell in the same
   commit.
3. **Row-wrap decisions read natural widths before any width is assigned.**
   `getGrowthTableWidth` sums `growth-group`/`growth-border` `offsetWidth`, and the auto-wrap
   (~6179) iterates on it — so the shrink-wrapped widths of _everything inside the cells_ are
   load-bearing geometry. A consolidation keeps layout stable only if the replacement wrappers
   reproduce the old content boxes (padding/margins included) — check row-wrap points and cell
   proportions by hand per writer converted.
4. **`growth-text` typography is coupled to wrap thresholds.** `TALL_GROWTH_TEXT_HEIGHT` (57),
   `MAX_GROWTH_TEXT_HEIGHT_*`, `GROWTH_TEXT_ADD_LINE_WIDTH` (135/155) are px constants
   (~6093–6100) measured against current font/line-height; `balanceText`/`addLine`/`reduceLines`
   mutate only `style.width` of the text element. Changing growth-text CSS moves row-wrap and
   line-break decisions board-wide.
5. **`GROWTH_COST_WIDTH` (10) must match `growth-cost` CSS** including its negative margins
   (already documented at the constants block). If `growth-cost` typography joins the badge
   family, its _box_ must not change without updating the constant.
6. **`growthHeadersAndTitles` reads computed width+margins of `growth-table` children** (groups
   and borders) to place `sub-section-title`s, and sums `growth-cell` inline `style.width` to
   size special-title groups. Group-level chrome (`tint`, `growth-cost`,
   `special-section-title`) lives _before_ the cells inside `growth-group` — cells are found by
   tag, so extra chrome is fine, but the chrome must never become a `growth-cell`.
7. **The repeat badge must stay absolutely positioned** (`repeat-growth` already is), so it
   contributes no width to contract 1's measurement. Same rule for `badge.cost` if `^cost(n)`
   moves onto `cell-icons`.

### Sequencing

One writer at a time; `add-presence` is the worst offender and the best first target. Per batch:
the node-vm diff harness (see `board-front-improvement-plan.md`) comparing old/new DOM for every
action string across all 9 languages, then **hand verification in the browser** — the reference
for "correct" stays the pre-CSS-rework appearance, not a re-shot baseline, so screenshot diffing
is at most a pointer to where to look. The synthetic-board trick above covers the vocabulary the
corpus lacks (fear, reclaim variants, gain-range, push/gather standalone, element markers,
or/then, presence-node forms).

Open decisions: final tag names; whether `value`/`range-value` unify (cross-component — common.js
emits `range-value` for cards/innates too); `gain` stays an element (it is the fancy-art revert
hook); `icon-multi-element` kept vs folded into `icon-row.cluster`.

## Decided against — don't "fix" these

- **`rules icon.sacred-site rules icon.wetland-presence`** (the fused selector in `card.css`) was
  fixed by _dropping_ the sacred-site fragment, not by splitting into two selectors — a dedicated
  `rules icon.sacred-site` rule earlier in the file would otherwise lose and sacred-site would
  silently shrink.
- **Re-adding per-context element URL tables.** Any new context joins the lists in `global.css`;
  art must never depend on stylesheet load order again.
- **Sizing inline icons in `em`** — see open item 3.
- **A standalone generated `icon-ratios.css`** — see "Icon sizing rework".

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
  the preview iframe re-runs the _old_ script otherwise.
