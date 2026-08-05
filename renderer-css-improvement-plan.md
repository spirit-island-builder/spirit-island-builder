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
    Mapped in full below ("Growth vocabulary consolidation"); batch 1 (add-presence) done.

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

## Growth vocabulary consolidation (mapped 2026-08-04; batch 1 landed 2026-08-04)

**Batch 1 — add-presence (done).** `_renderAddPresence` now emits
`<cell-icons class="add-presence plain|any|req [text] [with-land …]">` containing
`<icon-row class="plus">` / `.or` / `.relative` / bare `icon-row` (was `display-custom`),
`presence-req` rows, and `{range-N}` (nothing for "any"). Retired: `custom-presence`,
`custom-presence-req`, `custom-presence-no-range`, `custom-presence-or`, `plus-presence`,
`add-relative`, `display-custom`, `range-growth-any`, `span.presence-text-spacer` (now a
`min-height` on `.text presence-req:empty`), and the empty `<presence-req>` spacers. Also
deleted as verified-dead (no emitter anywhere): `custom-presence icon.range-0..4`,
`custom-presence-req icon.range-0..4`, `custom-presence-no-range icon.range-any`. New
fixtures cover the with-land token/relative forms and the req+any-range form, which had no
snapshot coverage. Verified: snapshot diff is pure re-tagging (every changed line classified),
and a browser geometry probe over the 45 renderable MySpirit boards showed \*\*0 differences

> 0.5px\*\* in growth/table/cell/art/text rects — row-wrap and width distribution unchanged.
> Legacy note: the won't-fix `token …instead` form now renders an empty `<presence-req>` with
> no spacer span, same as before to the pixel.

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
