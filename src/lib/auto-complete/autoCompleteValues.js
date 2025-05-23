const iconValues = [
  { label: "air", value: "{air}" },
  { label: "animal", value: "{animal}" },
  { label: "any", value: "{any}" },
  { label: "badlands", value: "{badlands}" },
  { label: "beasts", value: "{beasts}" },
  { label: "blight", value: "{blight}" },
  { label: "bold-close", value: "</b>" },
  { label: "bold-open", value: "<b>" },
  { label: "city", value: "{city}" },
  { label: "custom1", value: "{custom1}" },
  { label: "custom2", value: "{custom2}" },
  { label: "custom3", value: "{custom3}" },
  { label: "custom4", value: "{custom4}" },
  { label: "dahan", value: "{dahan}" },
  { label: "destroyed-presence", value: "{destroyed-presence}" },
  { label: "disease", value: "{disease}" },
  { label: "earth", value: "{earth}" },
  { label: "escalation", value: "{escalation}" },
  { label: "explorer", value: "{explorer}" },
  { label: "fast", value: "{fast}" },
  { label: "fear", value: "{fear}" },
  { label: "fire", value: "{fire}" },
  { label: "gain-range-1", value: "{gain-range-1}" },
  { label: "gain-range-2", value: "{gain-range-2}" },
  { label: "gain-range-3", value: "{gain-range-3}" },
  { label: "gain-range-x", value: "{gain-range-x}" },
  { label: "isolate", value: "{isolate}" },
  { label: "italic-close", value: "</i>" },
  { label: "italic-open", value: "<i>" },
  { label: "jungle", value: "{jungle}" },
  { label: "jungle-mountain", value: "{jungle-mountain}" },
  { label: "jungle-presence", value: "{jungle-presence}" },
  { label: "jungle-sand", value: "{jungle-sand}" },
  { label: "jungle-wetland", value: "{jungle-wetland}" },
  { label: "line-break", value: "<br>" },
  { label: "major", value: "{major}" },
  { label: "markerminus", value: "{markerminus}" },
  { label: "markerplus", value: "{markerplus}" },
  { label: "minor", value: "{minor}" },
  { label: "moon", value: "{moon}" },
  { label: "mountain", value: "{mountain}" },
  { label: "mountain-jungle", value: "{mountain-jungle}" },
  { label: "mountain-presence", value: "{mountain-presence}" },
  { label: "mountain-sand", value: "{mountain-sand}" },
  { label: "mountain-wetland", value: "{mountain-wetland}" },
  { label: "move-presence-1", value: "{move-presence-1}" },
  { label: "move-presence-2", value: "{move-presence-2}" },
  { label: "move-presence-3", value: "{move-presence-3}" },
  { label: "move-presence-4", value: "{move-presence-4}" },
  { label: "no-own-presence", value: "{no-own-presence}" },
  { label: "no-presence", value: "{no-presence}" },
  { label: "ocean", value: "{ocean}" },
  { label: "or", value: "{or}" },
  { label: "plant", value: "{plant}" },
  { label: "presence", value: "{presence}" },
  { label: "range", value: "{range}" },
  { label: "range-[replace_w_icon]", value: "{range-[replace_w_icon]}" },
  { label: "range-0", value: "{range-0}" },
  { label: "range-1", value: "{range-1}" },
  { label: "range-2", value: "{range-2}" },
  { label: "range-3", value: "{range-3}" },
  { label: "range-4", value: "{range-4}" },
  { label: "sacred-site", value: "{sacred-site}" },
  { label: "sand", value: "{sand}" },
  { label: "sand-jungle", value: "{sand-jungle}" },
  { label: "sand-mountain", value: "{sand-mountain}" },
  { label: "sand-presence", value: "{sand-presence}" },
  { label: "sand-wetland", value: "{sand-wetland}" },
  { label: "slow", value: "{slow}" },
  {
    label: "special-presence-track",
    value: "<special-rules-track values='5,7,8,10,11,12,13'></special-rules-track>",
  },
  { label: "spirit", value: "{spirit}" },
  { label: "star", value: "{star}" },
  { label: "strife", value: "{strife}" },
  { label: "sun", value: "{sun}" },
  { label: "terror-1", value: "{terror-1}" },
  { label: "terror-2", value: "{terror-2}" },
  { label: "terror-3", value: "{terror-3}" },
  { label: "town", value: "{town}" },
  { label: "vitality", value: "{vitality}" },
  { label: "water", value: "{water}" },
  { label: "wetland", value: "{wetland}" },
  { label: "wetland-presence", value: "{wetland-presence}" },
  { label: "wilds", value: "{wilds}" },
];

export const iconValuesSorted = iconValues.sort((a, b) => {
  return a.label.localeCompare(b.label);
});

const growthValues = [
  {
    label: "add-presence",
    value: "add-presence()",
    detail: [
      "add-presence(x) : At range x, add a Presence. x can be a number or 'any'",
      "add-presence(x,y) : At range x, add a Presence to a land with y conditions. y can be terrains, tokens, invaders, invader pieces, dahan, blight, etc.",
      "add-presence(x,y,z,...,and/or) : At range x, add a Presence with multiple conditions y, z, etc, the last parameter must be 'or' or 'and'.",
      "add-presence(x,token,y,and/or) : At range x, add a Presence and/or a token y (beasts, disease, etc). Use add-token if only adding tokens.",
      "add-presence(x,relative,y) : At range x relative to y, add a Presence.",
      "add-presence(x,text,*your_text_here*) : At range x, add a Presence with text 'Add a Presence *your_text*'. No icon.",
      "add-presence(x,text,*your_text_here*,y,...) : At range x, add a Presence with text 'Add a Presence *your_text*'. The growth icon will be y and any number of additional icons separated by commas",
    ],
  },
  {
    label: "add-token",
    value: "add-token()",
    detail: [
      "add-token(x,y) : At range x, add token type y",
      "add-token(x,y,z) : At range x, add z tokens of y type",
      "add-token(x,y,z,...,and/or) : At range x, add tokens of type y, z, and/or more. The last parameter must be 'or' or 'and'.",
      "add-token(x,y,z) : At range x, add token of type y to land with condition z (such as terrain or other token presence)",
    ],
  },
  { label: "blank", value: "blank()", detail: ["blank() : Creates a blank space"] },
  {
    label: "custom",
    value: "custom()",
    detail: [
      "custom(*your_text*) : A custom growth option with the image !!!",
      "custom(*your_text*,x,...) : A custom growth option with the x icon of your choice (ie. town, dahan, element, etc). Can use more than 1 icon and they will appear in a row.",
      "custom(*your_text*,text,x) : A custom growth option with the your custom text x in place of an icon.",
    ],
  },
  { label: "damage", value: "damage()", detail: ["damage(x,y) : At range x, deal y Damage"] },
  { label: "damage-1", value: "damage-1", detail: [] },
  { label: "damage-2", value: "damage-2", detail: [] },
  {
    label: "destroy-presence",
    value: "destroy-presence()",
    detail: ["destroy-presence(x) : Destroy x of your Presence"],
  },
  {
    label: "discard",
    value: "discard()",
    detail: [
      "discard(x) : Discard a card with element x (as seen on Ember-Eyed)",
      "discard-cards : As seen on Downpour",
      "discard-card : ",
    ],
  },
  { label: "discard-card", value: "discard-card", detail: [] },
  { label: "discard-cards", value: "discard-cards", detail: [] },
  {
    label: "element-marker",
    value: "element-marker()",
    detail: [
      "element-marker : Prepare 1 element marker",
      "element-marker(x) : If x is positive, Prepare x Element Markers",
      "element-marker(-x) : If x is negative, Discard x Element Markers",
    ],
  },
  {
    label: "energy-per-play",
    value: "energy-per-play",
    detail: ["energy-per-play : Gain 1 Energy per Card Play."],
  },
  {
    label: "fear",
    value: "fear()",
    detail: [
      "fear(x) : Gain x Fear",
      "fear(x) : Gain 1 Fear per Element x",
      "fear(x,y) : Gain x Fear plus 1 Fear per Element y",
      "fear(text,_your_text_here_) : Gain 1 Fear per condition of your choosing. Icon will be a !!!.",
      "fear(x,text,_your_text_here_) : Gain x Fear plus 1 Fear per condition of your choosing. Icon will be a !!!.",
    ],
  },
  {
    label: "forget-power-card",
    value: "forget-power-card",
    detail: ["forget-power-card() : Forget a Power Card"],
  },
  {
    label: "gain-card-play",
    value: "gain-card-play()",
    detail: ["gain-card-play() : Gain +1 Card Play", "gain-card-play(x) : Gain +x Card Plays"],
  },
  {
    label: "gain-element",
    value: "gain-element()",
    detail: [
      "gain-element(x) : Gain Element x, which can be any of the elements or 'any' or 'star'",
      "gain-element(x,y) : If y is a number, gain y of x Element",
      "gain-element(x,y,...) : If y is an element, gain x or y (or z) Elements",
      "gain-element(x,y,z,...,*and*) : Gain elements x, y, and z (or more). The last option must 'and'",
    ],
  },
  {
    label: "gain-energy",
    value: "gain-energy()",
    detail: [
      "gain-energy(x) : Gain x Energy. x is a number.",
      "gain-energy(x) : Gain 1 Energy per Entity x (such as Elements, Sacred Sites, etc)",
      "gain-energy(x,y) : Gain x Energy plus 1 Energy per Entity y",
      "gain-energy(x,y,z) : Gain x Energy plus z Energy per Entity y",
      "gain-energy(x,text,*your_text*) : Gain x Energy plus 1 Energy per condition of your choosing. Icon will be a !!!.",
      "gain-energy(x,text,*your_text*,y) : Gain x Energy plus 1 Energy per condition of your choosing. Icon will be y.",
      "gain-energy(text,*your_text*) : Gain 1 Energy per condition of your choosing. Icon will be a !!!.",
      "gain-energy(text,*your_text*,y) : If y is Entity, gain 1 Energy per Entity w/ your custom text. If y is number, gain y Energy per !!! w/ your custom text.",
      "gain-energy(text,*your_text*,y,z) : Gain z Energy per Entity y of your choosing.",
    ],
  },
  {
    label: "gain-power-card",
    value: "gain-power-card()",
    detail: [
      "gain-power-card() : Gain a Power Card",
      "gain-power-card(x) : Gain x Power Card. x is minor, major, or something else (icon appears in top left)",
      "gain-power-card(x,y) : Gain x Power Card with y condition. y is text to follow 'Gain x Power Card'",
      "gain-power-card(x,y,z) : Gain x Power Card with y condition. z is an icon that appears in the top right of the Power Card",
    ],
  },
  {
    label: "gain-range",
    value: "gain-range()",
    detail: [
      "gain-range(x) : Gain +x range for Powers this turn",
      "gain-range(x,y) : Gain +x range for y effects (powers, power cards, innate powers, everything) this turn",
    ],
  },
  {
    label: "gather",
    value: "gather()",
    detail: [
      "gather(x) : Gather entity x (dahan, beasts, presence, etc) into 1 of your lands.  For 'or', x may be entity/entity.",
      "gather(x,y) : If y is a condition (terrain, sacred site, beasts, etc), Gather entity x into 1 of your lands with y condition.  For 'or', x may be entity/entity.",
      "gather(x,y) : If y is a number, Gather y of entity x into 1 of your lands.",
      "gather(x,y,z) : Gather z of entity x into lands of condition y.  For 'or', x may be entity/entity. y can be terrain types, sacred site, token types, etc. z can be a numeral or 'each' (or another word at your own risk).",
      "gather(x,y,z) : If z is a word ('each'), Gather x into z lands of condition y. For 'or', x may be entity/entity.",
      "gather(x,y) : At range x, Gather entity y (dahan, beasts, presence, etc) into a land.  For 'or', y may be entity/entity.",
      "gather(x,y,z) : At range x, Gather entity y into a land with condition z. For 'or', y may be entity/entity.",
      "gather(x,y,z) : At range x, Gather numeral z of entity y into a land.",
      "gather(x,y,z,w) : At range x, Gather numeral w of entity y into a land with condition w.",
    ],
  },
  { label: "ignore-range", value: "ignore-range()", detail: [] },
  {
    label: "incarna",
    value: "incarna()",
    detail: [
      "incarna(add-move,x) or incarna(add-move,x,y) : Adds an Incarna. x is an icon (usually presence). y is the incarna icon",
      "incarna(move,x) or incarna(move,x,y) : Moves an Incarna. x is the range & can be a number or 'any'. y is the incarna icon",
      "incarna(empower) : Empowers Incarna",
      "incarna(replace,x,y) : Replaces icon x with incarna. y is the incarna icon",
      "incarna(add-token,x,y) : Adds token/icon x at incarna. y is the incarna icon",
    ],
  },
  {
    label: "isolate",
    value: "isolate()",
    detail: ["isolate() : Isolate one of your Lands", "isolate(x) : At range x, Isolate a land"],
  },
  {
    label: "make-fast",
    value: "make-fast",
    detail: ["make-fast : One of your Powers may be Fast"],
  },
  {
    label: "move-presence",
    value: "move-presence()",
    detail: [
      "move-presence(x) : Move a Presence up to x range",
      "move-presence(x,y) : Move y Presence up to x range together",
      "move-presence(x,y) : Move Presence and token y up to x range. y is a number",
    ],
  },
  {
    label: "or",
    value: "or()",
    detail: ["or(x,y) : x and y are growth options (like the ones above)"],
  },
  {
    label: "presence-node",
    value: "presence-node()",
    detail: ["presence-node(x) : x is a growth option (like the ones above)"],
  },
  {
    label: "push",
    value: "push()",
    detail: [
      "push(x) : Push entity x (dahan, beasts, presence, etc) from 1 of your lands. For 'or', x may be entity/entity.",
      "push(x,y) : If y is a condition (terrain, sacred site, beasts, etc), Push entity x from 1 of your lands with y condition.  For 'or', x may be entity/entity.",
      "push(x,y) : If y is a number, Push y of entity x from 1 of your lands.",
      "push(x,y,z) : Push z of entity x from lands of condition y. For 'or', x may be entity/entity. y can be terrain types, sacred site, token types, etc. z can be a numeral or 'each' (or another word at your own risk).",
      "push(x,y,z) : If z is a word ('each'), Push x from z lands of condition y.  For 'or', x may be entity/entity.",
      "push(x,y) : At range x, Push entity y (dahan, beasts, presence, etc) from a land.  For 'or', y may be entity/entity.",
      "push(x,y,z) : At range x, Push entity y from a land with condition z. For 'or', y may be entity/entity.",
      "push(x,y,z) : At range x, Push numeral z of entity y from a land.",
      "push(x,y,z,w) : At range x, Push numeral z of entity y from a land with condition w.",
    ],
  },
  {
    label: "reclaim",
    value: "reclaim()",
    detail: [
      "relcaim(x) : x can be all, one, half, or custom",
      "relcaim(x,y) : Reclaim x (all or one) cards with element y",
      "reclaim(custom,_your custom reclaim text_) : Custom reclaim text with a unique icon.",
    ],
  },
  {
    label: "replace",
    value: "replace()",
    detail: [
      "replace(x,y) : In your land, Replace entity x with entity y. Entity can be presence or other things too.",
      "replace(x,y,z) : At range x, Replace entity y with entity z.",
    ],
  },
  {
    label: "take-power-card",
    value: "take-power-card()",
    detail: [
      "take-power-card() : Take a Power Card",
      "take-power-card(x) : Take x Power Card. x is minor, major, or something else (icon appears in top left)",
      "take-power-card(x,y) : Take x Power Card with y condition. y is text to follow 'Take x Power Card'",
      "take-power-card(x,y,z) : Take x Power Card with y condition. z is an icon that appears in the top right of the Power Card",
    ],
  },
];

export const growthValuesSorted = growthValues.sort((a, b) => {
  return a.label.localeCompare(b.label);
});
