// Fixtures for the presence-track snapshot suite.
//
// nodeFixtures drive getPresenceNodeHtml(nodeText, first, nodeIndex, trackType,
// addRing) directly — one entry per option-switch case and per modifier in the
// value grammar (`+` multi, `split()`, `^` deep layers, `_` backgrounds,
// `~` subtext location, `*` override text).
//
// trackFixtures drive buildPresenceTracks() with real <energy-track>/
// <card-play-track>/<additional-track> elements, for the table-assembly logic
// node fixtures can't reach (spacer/middle/bonus cells, first-ring corrections,
// banners, notes, additional tracks).

export const nodeFixtures = [
  // number defaults per track type
  { name: "energy-first", nodeText: "1", first: true },
  { name: "energy-number", nodeText: "3" },
  { name: "plays-first", nodeText: "1", first: true, trackType: "card", addRing: false },
  { name: "plays-number", nodeText: "2", trackType: "card", addRing: false },
  { name: "special-number", nodeText: "2", trackType: "special", addRing: false },
  { name: "bonus-plus-shorthand", nodeText: "+2" },
  { name: "energy-paren-plus", nodeText: "energy(+1)" },
  { name: "plays-paren-plus", nodeText: "plays(+2)", trackType: "card", addRing: false },
  { name: "energy-explicit", nodeText: "energy(3)" },
  { name: "plays-explicit", nodeText: "plays(2)", trackType: "card", addRing: false },

  // option cases
  { name: "push-single", nodeText: "push(town)" },
  { name: "push-double", nodeText: "push(town;city)", trackType: "card", addRing: false },
  { name: "push-incarna", nodeText: "push(incarna)" },
  { name: "push-incarna-custom", nodeText: "push(incarna;beasts)" },
  { name: "gather", nodeText: "gather(beasts)", trackType: "card", addRing: false },
  { name: "incarna-empower", nodeText: "incarna(empower)" },
  { name: "incarna-add-move", nodeText: "incarna(add-move)" },
  { name: "incarna-add-move-custom", nodeText: "incarna(addmove;presence;custom1)" },
  { name: "token-your-land", nodeText: "token(badlands)" },
  { name: "token-range", nodeText: "token(2;badlands)" },
  { name: "custom-icon-shorthand", nodeText: "custom(Gain fire;{fire})" },
  { name: "custom-icon-names", nodeText: "custom(Gain elements;fire;water)" },
  { name: "custom-bare-energy", nodeText: "custom(Some text)" },
  { name: "custom-bare-card", nodeText: "custom(Some text)", trackType: "card", addRing: false },
  {
    name: "custom-bare-special",
    nodeText: "custom(Some text)",
    trackType: "special",
    addRing: false,
  },
  // (bare "move-presence" with no parens crashes getPresenceNodeInnerHTML —
  // regExp.exec returns null at the matches[1] check — so it is not covered)
  { name: "move-presence-range", nodeText: "move-presence(2)" },
  { name: "move-presence-text", nodeText: "move-presence(x)" },
  { name: "elements-pair", nodeText: "elements(sun;moon)" },
  { name: "elements-single", nodeText: "elements(sun)" },
  { name: "or-pair", nodeText: "or(fire;water)" },
  { name: "gain-range", nodeText: "gain-range(2)" },
  { name: "gain-range-custom", nodeText: "gain-range(1;everything)" },
  { name: "gain-card-play-bare", nodeText: "gain-card-play", trackType: "card", addRing: false },
  { name: "gain-card-play-num", nodeText: "gain-card-play(2)", trackType: "card", addRing: false },
  { name: "damage-your-land", nodeText: "damage(2)" },
  { name: "damage-range", nodeText: "damage(1;2)" },
  { name: "gain-power-card-bare", nodeText: "gain-power-card" },
  { name: "gain-power-card-type", nodeText: "gain-power-card(minor)" },
  { name: "take-power-card-type", nodeText: "take-power-card(minor)" },
  { name: "reclaim-bare", nodeText: "reclaim" },
  { name: "reclaim-one", nodeText: "reclaim(one)" },
  { name: "blank", nodeText: "blank" },
  { name: "element-bare", nodeText: "moon" },
  { name: "unknown-icon", nodeText: "mystery-icon" },

  // modifiers
  { name: "deep-layers-icon", nodeText: "2^minor" },
  { name: "deep-layers-energy", nodeText: "reclaim-one^energy(2)" },
  { name: "deep-layers-pay", nodeText: "reclaim-one^pay(2)" },
  { name: "force-energy", nodeText: "moon_energy", trackType: "card", addRing: false },
  { name: "force-shadow", nodeText: "moon_shadow" },
  { name: "force-none", nodeText: "moon_none" },
  { name: "force-first", nodeText: "3_first" },
  { name: "force-nofirst", nodeText: "1_nofirst", first: true },
  { name: "shift", nodeText: "2_shift(50;-12)" },
  { name: "subtext-top", nodeText: "2~top" },
  { name: "subtext-left", nodeText: "2~left" },
  { name: "subtext-right", nodeText: "2~right" },
  { name: "override-text", nodeText: "2*Custom Words" },
  { name: "modifier-combo", nodeText: "air_shift(50;-12)nofirst~left", first: true },

  // multi (`+`) placement
  { name: "multi-2", nodeText: "1+moon" },
  { name: "multi-3", nodeText: "sun+moon+fire" },
  { name: "multi-4", nodeText: "sun+moon+fire+water", trackType: "card", addRing: false },
  { name: "multi-shadow", nodeText: "token(1;badlands)+moon" },
  { name: "multi-gain-range", nodeText: "+1+gain-range(1;everything)" },
  { name: "multi-move", nodeText: "move-presence(1)+air" },

  // split()
  { name: "split-basic", nodeText: "split(2;moon)" },
  { name: "split-numbers", nodeText: "split(1;2)", trackType: "card", addRing: false },
];

export const trackFixtures = [
  {
    name: "basic",
    energy: { values: "1,2,3" },
    plays: { values: "1,2" },
  },
  {
    name: "middle-mid-track",
    energy: { values: "0,sun,middle(1+moon),2" },
    plays: { values: "1,earth,2" },
  },
  {
    name: "bonus-node",
    energy: { values: "1,bonus(2),3" },
    plays: { values: "1,2" },
  },
  {
    name: "middle-first",
    energy: { values: "middle(1),2,3" },
    plays: { values: "1,2" },
  },
  {
    name: "double-middle",
    energy: { values: "middle(1),middle(2),3" },
    plays: { values: "1,2" },
  },
  {
    name: "split-energy",
    energy: { values: "1,split(2;moon),3" },
    plays: { values: "1,2" },
  },
  {
    name: "split-plays",
    energy: { values: "1,2" },
    plays: { values: "1,split(1;2)" },
  },
  {
    name: "split-both",
    energy: { values: "1,split(2;moon)" },
    plays: { values: "1,split(1;2)" },
  },
  {
    name: "additional-track",
    energy: { values: "1,2" },
    plays: { values: "1,2" },
    additional: [{ values: "gain-card-play,plays(2),fire" }],
  },
  {
    name: "additional-two-tracks",
    energy: { values: "1,2" },
    plays: { values: "1,2" },
    additional: [{ values: "sun,moon" }, { values: "plays(3)_shift(150;32)nofirst" }],
  },
  {
    name: "note",
    attrs: { note: "{presence} may be placed on any land." },
    energy: { values: "1,2" },
    plays: { values: "1,2" },
  },
  {
    name: "combined-banner",
    attrs: { "banner": "banner.png", "banner-v-scale": "70%" },
    energy: { values: "1,2" },
    plays: { values: "1,2" },
  },
  {
    name: "per-track-banners",
    energy: { "values": "1,2", "banner": "energy-banner.png", "banner-v-scale": "50%" },
    plays: { values: "1,2", banner: "plays-banner.png" },
  },
  {
    name: "custom-heading",
    attrs: { customname: "Sacred Sites" },
    energy: { values: "1,2" },
    plays: { values: "1,2" },
  },
];
