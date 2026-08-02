// Synthetic growth-group fixtures for the snapshot suite (see run.js).
// Each entry is rendered through writeGrowthGroup() in the inner-frame script.
// `attrs` are the attributes of a <growth-group> element as emitted by the
// outer app's generateHTML — `values` is the semicolon-separated action list.
// Names group by the switch case in getGrowthActionTextAndIcons they exercise.
// The "errors" section intentionally contains malformed input: it snapshots the
// error-cell fallback, it is not a wish list of things to make work.

export const fixtures = [
  // Simple actions handled by the default case + IconName
  { name: "default-icon", attrs: { values: "moon" } },
  { name: "default-multi", attrs: { values: "reclaim-all;gain-power-card;add-presence(1)" } },
  { name: "gain-card-pay-2", attrs: { values: "gain-card-pay-2" } },
  { name: "ignore-range", attrs: { values: "ignore-range" } },

  // reclaim
  { name: "reclaim-bare", attrs: { values: "reclaim" } },
  { name: "reclaim-one", attrs: { values: "reclaim(one)" } },
  { name: "reclaim-all-modified", attrs: { values: "reclaim(all,moon)" } },
  { name: "reclaim-one-modified", attrs: { values: "reclaim(one,fire)" } },
  { name: "reclaim-none", attrs: { values: "reclaim(none)" } },
  { name: "reclaim-half", attrs: { values: "reclaim(half)" } },
  { name: "reclaim-custom", attrs: { values: "reclaim(custom)" } },
  { name: "reclaim-number", attrs: { values: "reclaim(2)" } },
  { name: "reclaim-bad-text", attrs: { values: "reclaim(bogus)" } },

  // power cards
  { name: "gain-power-card", attrs: { values: "gain-power-card" } },
  { name: "gain-power-card-minor", attrs: { values: "gain-power-card(minor)" } },
  { name: "gain-power-card-major-mod", attrs: { values: "gain-power-card(major,x,fire)" } },
  { name: "take-power-card", attrs: { values: "take-power-card(minor)" } },

  // isolate / damage
  { name: "isolate-bare", attrs: { values: "isolate" } },
  { name: "isolate-range", attrs: { values: "isolate(1)" } },
  { name: "damage-num", attrs: { values: "damage(1,2)" } },
  { name: "damage-icon", attrs: { values: "damage(1,fire)" } },

  // gain-energy (incl. the fixed leading-zero behavior)
  { name: "gain-energy-flat", attrs: { values: "gain-energy(2)" } },
  { name: "gain-energy-zero-scaling", attrs: { values: "gain-energy(0,dahan)" } },
  { name: "gain-energy-scaling-only", attrs: { values: "gain-energy(badlands)" } },
  { name: "gain-energy-scaling-value", attrs: { values: "gain-energy(sacred-site,2)" } },
  { name: "gain-energy-flat-plus-scaling", attrs: { values: "gain-energy(2,dahan,1)" } },
  { name: "gain-energy-text", attrs: { values: "gain-energy(text,for each Shroud)" } },
  { name: "gain-energy-flat-text", attrs: { values: "gain-energy(1,text,for each Shroud)" } },

  // add-presence
  { name: "add-presence-range", attrs: { values: "add-presence(1)" } },
  { name: "add-presence-zero", attrs: { values: "add-presence(0)" } },
  { name: "add-presence-any", attrs: { values: "add-presence(any)" } },
  { name: "add-presence-terrain", attrs: { values: "add-presence(1,jungle)" } },
  { name: "add-presence-terrain-or", attrs: { values: "add-presence(1,jungle,wetland,or)" } },
  { name: "add-presence-terrain-and", attrs: { values: "add-presence(1,sands,mountain,and)" } },
  { name: "add-presence-coastal", attrs: { values: "add-presence(2,coastal)" } },
  { name: "add-presence-no-own", attrs: { values: "add-presence(1,no-own-presence)" } },
  { name: "add-presence-token-and", attrs: { values: "add-presence(1,token,badlands,and)" } },
  { name: "add-presence-token-or", attrs: { values: "add-presence(1,token,badlands,or)" } },
  {
    name: "add-presence-token-instead",
    attrs: { values: "add-presence(1,token,badlands,instead)" },
  },
  { name: "add-presence-relative", attrs: { values: "add-presence(1,relative,sacred-site)" } },
  { name: "add-presence-text", attrs: { values: "add-presence(2,text,anywhere on the island)" } },
  { name: "add-presence-text-icons", attrs: { values: "add-presence(2,text,x,fire,water)" } },
  { name: "add-presence-custom-legacy", attrs: { values: "add-presence-custom(my text,1)" } },

  // push / gather
  { name: "push-simple", attrs: { values: "push(explorer)" } },
  { name: "gather-simple", attrs: { values: "gather(dahan)" } },
  { name: "push-range", attrs: { values: "push(1,explorer)" } },
  { name: "gather-or-targets", attrs: { values: "gather(dahan/town)" } },
  { name: "push-terrain-condition", attrs: { values: "push(1,explorer,jungle)" } },
  { name: "gather-from-condition", attrs: { values: "gather(explorer,badlands)" } },
  { name: "push-multi-icon", attrs: { values: "push(explorer,2)" } },

  // move-presence
  { name: "move-presence-range", attrs: { values: "move-presence(1)" } },
  { name: "move-presence-together", attrs: { values: "move-presence(2,2)" } },
  { name: "move-presence-with-token", attrs: { values: "move-presence(1,badlands)" } },

  // gain-element
  { name: "gain-element-single", attrs: { values: "gain-element(fire)" } },
  { name: "gain-element-or", attrs: { values: "gain-element(fire,water)" } },
  { name: "gain-element-multi-same", attrs: { values: "gain-element(fire,2)" } },
  { name: "gain-element-and", attrs: { values: "gain-element(fire,water,and)" } },
  { name: "gain-element-and-three", attrs: { values: "gain-element(fire,water,earth,and)" } },

  // blank / custom
  { name: "blank-bare", attrs: { values: "blank" } },
  { name: "blank-width", attrs: { values: "blank(120)" } },
  { name: "custom-text-only", attrs: { values: "custom(My custom action)" } },
  { name: "custom-with-icon", attrs: { values: "custom(My custom action,fire)" } },
  { name: "custom-wide", attrs: { values: "custom-wide(A wide custom action,fire,water)" } },
  { name: "custom-text-icon", attrs: { values: "custom(My custom action,text,ABC)" } },

  // fear (shares the scaling-gain helper with gain-energy)
  { name: "fear-flat", attrs: { values: "fear(2)" } },
  { name: "fear-zero-scaling", attrs: { values: "fear(0,town)" } },
  { name: "fear-flat-plus-scaling", attrs: { values: "fear(1,blight,2)" } },
  { name: "fear-text", attrs: { values: "fear(text,for each Ravage)" } },

  // range
  { name: "gain-range", attrs: { values: "gain-range(2)" } },
  { name: "gain-range-negative", attrs: { values: "gain-range(-1)" } },
  { name: "lose-range", attrs: { values: "lose-range(1)" } },

  // card plays / element markers / discard
  { name: "gain-card-play-bare", attrs: { values: "gain-card-play" } },
  { name: "gain-card-play-num", attrs: { values: "gain-card-play(2)" } },
  { name: "element-marker-bare", attrs: { values: "element-marker" } },
  { name: "element-marker-two", attrs: { values: "element-marker(2)" } },
  { name: "element-marker-minus", attrs: { values: "element-marker(-1)" } },
  { name: "discard-bare", attrs: { values: "discard" } },
  { name: "discard-two", attrs: { values: "discard(2)" } },
  { name: "discard-element", attrs: { values: "discard(fire)" } },

  // incarna
  { name: "incarna-move", attrs: { values: "incarna(move,1)" } },
  { name: "incarna-move-any", attrs: { values: "incarna(move,any)" } },
  { name: "incarna-empower", attrs: { values: "incarna(empower)" } },
  { name: "incarna-add-move", attrs: { values: "incarna(add-move,badlands)" } },
  { name: "incarna-replace", attrs: { values: "incarna(replace,presence)" } },
  { name: "incarna-add-token", attrs: { values: "incarna(add-token,vitality)" } },
  {
    name: "incarna-add-token-custom",
    attrs: { values: "incarna(add-token,vitality,incarna-roots)" },
  },

  // add-token
  { name: "add-token-range", attrs: { values: "add-token(1,badlands)" } },
  { name: "add-token-no-range", attrs: { values: "add-token(badlands)" } },
  { name: "add-token-any", attrs: { values: "add-token(any,beasts)" } },
  { name: "add-token-multi", attrs: { values: "add-token(1,badlands,2)" } },
  { name: "add-token-many", attrs: { values: "add-token(1,badlands,5)" } },
  { name: "add-token-and", attrs: { values: "add-token(0,beasts,wilds,and)" } },
  { name: "add-token-or", attrs: { values: "add-token(0,beasts,wilds,or)" } },
  { name: "add-token-terrain-single", attrs: { values: "add-token(1,beasts,jungle)" } },
  { name: "add-token-terrain-double", attrs: { values: "add-token(1,beasts,ocean)" } },
  { name: "add-token-terrain-noicon", attrs: { values: "add-token(1,beasts,coastal)" } },
  { name: "add-token-in-token-land", attrs: { values: "add-token(1,beasts,vitality)" } },

  // replace / destroy-presence
  { name: "replace-local", attrs: { values: "replace(presence,badlands)" } },
  { name: "replace-ranged", attrs: { values: "replace(2,presence,beasts)" } },
  { name: "destroy-presence", attrs: { values: "destroy-presence(1)" } },
  { name: "destroy-presence-two", attrs: { values: "destroy-presence(2)" } },

  // or / then wrappers
  { name: "or-two-actions", attrs: { values: "or(gain-energy(2),add-presence(1))" } },
  { name: "or-simple-icons", attrs: { values: "or(moon,fire)" } },
  { name: "then-two-actions", attrs: { values: "then(reclaim-all,gain-power-card)" } },

  // presence-node in growth — the node vocabulary (see getPresenceNodeHtml).
  // The growth and node vocabularies overlap on names like gain-power-card, so
  // the -growth-vocabulary cases below pin the fallback that keeps old files
  // rendering: no node-only modifier + a name with a growth renderer.
  { name: "presence-node-reclaim", attrs: { values: "presence-node(reclaim-one)" } },
  { name: "presence-node-blank", attrs: { values: "presence-node(blank)" } },
  { name: "presence-node-blank-width", attrs: { values: "presence-node(blank(120))" } },
  { name: "presence-node-empty", attrs: { values: "presence-node(empty)" } },
  { name: "presence-node-energy", attrs: { values: "presence-node(energy(2))" } },
  { name: "presence-node-element", attrs: { values: "presence-node(moon)" } },
  { name: "presence-node-growth-vocabulary", attrs: { values: "presence-node(reclaim(one))" } },
  {
    name: "presence-node-growth-vocabulary-options",
    attrs: { values: "presence-node(add-presence(1,jungle))" },
  },
  // ^ deep layers — the notation Starlight and Stone use on their tracks
  { name: "presence-node-deep-icon", attrs: { values: "presence-node(gain-card-play^minor)" } },
  { name: "presence-node-deep-energy", attrs: { values: "presence-node(reclaim-one^energy(2))" } },
  { name: "presence-node-deep-pay", attrs: { values: "presence-node(gain-power-card^pay(2))" } },
  // _ backgrounds, ~ subtext placement, + combinations, split(), * override
  { name: "presence-node-force-energy", attrs: { values: "presence-node(reclaim-one_energy)" } },
  { name: "presence-node-force-first", attrs: { values: "presence-node(2_first)" } },
  { name: "presence-node-subtext-top", attrs: { values: "presence-node(moon~top)" } },
  { name: "presence-node-combination", attrs: { values: "presence-node(energy(1)+plays(1))" } },
  { name: "presence-node-split", attrs: { values: "presence-node(split(fire;animal))" } },
  { name: "presence-node-node-override", attrs: { values: "presence-node(moon*My node text)" } },
  { name: "presence-node-custom", attrs: { values: "presence-node(custom(Gain 1 Rot;custom1))" } },
  // growth-level modifiers still sit outside the parentheses
  { name: "presence-node-repeat", attrs: { values: "presence-node(reclaim-one)^2" } },
  { name: "presence-node-override", attrs: { values: "presence-node(reclaim-one)*Do the thing" } },
  { name: "presence-node-in-or", attrs: { values: "or(presence-node(reclaim-one),moon)" } },
  {
    name: "presence-node-two-in-group",
    attrs: { values: "presence-node(blank);presence-node(2)" },
  },
  { name: "error-bare-presence-node", attrs: { values: "presence-node" } },

  // presence-track in growth — a row of presence-node inputs in one cell
  { name: "presence-track-numbers", attrs: { values: "presence-track(1,2,3)" } },
  { name: "presence-track-mixed", attrs: { values: "presence-track(2,moon,reclaim-one)" } },
  { name: "presence-track-blanks", attrs: { values: "presence-track(blank,blank,blank)" } },
  { name: "presence-track-single", attrs: { values: "presence-track(reclaim-one)" } },
  { name: "presence-track-first", attrs: { values: "presence-track(1_first,2,3)" } },
  {
    name: "presence-track-node-options",
    attrs: { values: "presence-track(gain-card-play^minor,energy(1)+plays(1),moon~top)" },
  },
  {
    name: "presence-track-inner-commas",
    attrs: { values: "presence-track(2,custom(Gain 1 Rot;custom1),split(fire;animal))" },
  },
  {
    name: "presence-track-growth-vocabulary",
    attrs: { values: "presence-track(reclaim(one),add-presence(1))" },
  },
  { name: "presence-track-spacey", attrs: { values: "presence-track( 1 , 2 , 3 )" } },
  // banner: on by default (borrowed from the card play track), overridable
  { name: "presence-track-banner-energy", attrs: { values: "presence-track(banner(energy),1,2)" } },
  { name: "presence-track-banner-plays", attrs: { values: "presence-track(banner(plays),1,2)" } },
  { name: "presence-track-banner-none", attrs: { values: "presence-track(banner(none),1,2)" } },
  { name: "presence-track-banner-last", attrs: { values: "presence-track(1,2,banner(none))" } },
  { name: "error-presence-track-banner-only", attrs: { values: "presence-track(banner(none))" } },
  { name: "presence-track-repeat", attrs: { values: "presence-track(1,2)^2" } },
  { name: "presence-track-override", attrs: { values: "presence-track(1,2)*Advance twice" } },
  { name: "error-bare-presence-track", attrs: { values: "presence-track" } },

  // repeat and override modifiers
  { name: "repeat-x2", attrs: { values: "gain-power-card^2" } },
  { name: "repeat-cost", attrs: { values: "gain-power-card^cost(2)" } },
  { name: "override-text", attrs: { values: "moon*Custom override text" } },
  { name: "override-on-options", attrs: { values: "add-presence(1)*Do the thing" } },

  // group-level attributes
  { name: "group-cost-energy", attrs: { values: "gain-power-card", cost: "2" } },
  { name: "group-cost-custom-icon", attrs: { values: "gain-power-card", cost: "2,time" } },
  { name: "group-cost-nonscaling", attrs: { values: "gain-power-card", cost: "forget-power" } },
  {
    name: "group-cost-nonscaling-text",
    attrs: { values: "gain-power-card", cost: "forget-power,Forget a card" },
  },
  { name: "group-tint-name", attrs: { values: "gain-energy(1)", tint: "red" } },
  { name: "group-tint-rgb", attrs: { values: "gain-energy(1)", tint: "rgb(200, 180, 90)" } },
  {
    name: "group-special-title-apostrophe",
    attrs: { "values": "gain-energy(1)", "special-title": "Island's Gift" },
  },
  { name: "group-new-row", attrs: { "values": "gain-energy(1)", "new-row": "true" } },

  // whitespace tolerance — inputs with spaces around commas/semicolons.
  // Before the trim-all-options change these rendered broken icon classes
  // (the text side always trimmed, the icon side didn't); after it they must
  // render identically to their spaceless twins above.
  { name: "spacey-gain-energy", attrs: { values: "gain-energy(2, dahan)" } },
  { name: "spacey-gain-energy-zero", attrs: { values: "gain-energy( 0 , dahan )" } },
  { name: "spacey-add-presence", attrs: { values: "add-presence(1, jungle)" } },
  { name: "spacey-gather", attrs: { values: "gather( dahan )" } },
  { name: "spacey-gain-element", attrs: { values: "gain-element( fire )" } },
  { name: "spacey-gain-element-or", attrs: { values: "gain-element(fire, water)" } },
  { name: "spacey-add-token", attrs: { values: "add-token(1, badlands)" } },
  { name: "spacey-incarna", attrs: { values: "incarna(move, 1)" } },
  { name: "spacey-blank", attrs: { values: "blank( 120 )" } },
  { name: "spacey-custom", attrs: { values: "custom( My custom action , fire )" } },
  { name: "spacey-semicolon-values", attrs: { values: "gain-energy(2); reclaim-all" } },
  { name: "spacey-or", attrs: { values: "or(gain-energy(2), add-presence(1))" } },
  { name: "spacey-cost", attrs: { values: "gain-power-card", cost: "2, time" } },
  { name: "spacey-override", attrs: { values: "moon* Custom override text" } },

  // errors — snapshots the error-cell fallback (intentionally malformed)
  { name: "error-unclosed-paren", attrs: { values: "gain-energy(" } },
  { name: "error-bare-add-presence", attrs: { values: "add-presence" } },
  { name: "error-bare-damage", attrs: { values: "damage" } },
  { name: "error-bare-or", attrs: { values: "or(" } },
  { name: "error-mixed-with-valid", attrs: { values: "gain-energy(2);damage;reclaim-all" } },
];
