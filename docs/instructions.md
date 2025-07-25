# Spirit Board Builder Interface

Welcome to the Spirit Island Spirit Board Builder! This document will help you use the Spirit Board builder.

## Table of Contents {#index}

## Getting Started
The best place to start with the Builder is to look at the Examples. The Builder loads with the Volcano spirit panel as an initial example. Open the various tabs (Growth or Presence Tracks) to see how the Volcano spirit panel is made. You can click the Examples button to load other official Spirits.

## Interface

- Examples: Click this button to load the official spirits into the Builder, as an example.
- Instructions: Click this button to open the Instructions pop-up.
- Load: Click this button to load a file from the Spirit Island HTML Template or a file previously saved from this webpage.
- Save: Click this button to immediately download the save file for your content (careful: each component is a different save file).
- Update Preview: Click this button to load a new preview board and see your changes.
- Toggle Board Size: Click this to change the size of the preview. NOTE: While you can download images of Spirit Boards, you can also use a screen capture to get a higher resolution.
- Clear All Fields: Click this to delete everything in the Builder form. It will ask for confirmation.
- Download Image: Click this button to download a PNG of your Spirit Board or other content.
- Export TTS file: Click this button to download an object file for the popular Spirit Island Tabletop Simulator mod.
  - Check out [this video](https://www.youtube.com/watch?v=q7zS8x9dO4s) for instructions on how to set up your spirit in TTS. - Thank you James from MissingTriggers for the video.
  - Also check out the combined TTS export option in the left column.
- Create PDF...: Click this button to download a pdf (in letter or A4) that is properly scaled for printing
- Printer Friendly: Click this button to remove backgrounds that use up printer ink.
- Transparent: Click this button to make the spirit board panels transparent so the spirit art is visible through the Growth and Innate Power panels.

[Home](#index)

## Spirit Board Play Side

### Spirit Name and Art

- Spirit Name: The name of your spirit.
- Spirit Art: The main Spirit image. Press 'Choose File' to select an image.
  - Scale (optional): Used to scale the image. Include the percentage sign in your input. An empty field will default to 100%.
- Banner Art: The image that sits behind the Spirit name.  
  - Press 'Choose File' to select an image or press 'Or Use Example Banners' to use some examples our team generated.
- Energy Track Banner & Plays Track Banner: The banners behind the presence tracks.
  - Scale (optional): Stretches the vertical dimension of the banner (horizontal is automatically set based on the number of nodes).

[Home](#index)

### Special Rules

Use these fields to modify your spirit's special rules. You can and should use the [icon shortcuts](#general-icons) here (such as {dahan}). Shortcuts will trigger autocomplete when you type "{". Press tab to finish the autocomplete.

- Name: The name of the Special Rule.
- Effect: The special rule effect. Use icon shortcuts here. Use * for bulleted lists
- Remove: Button to **permanently** delete the special rule.
- Add Another Rule: Adds an additional special rule.
- General Advice: Look at example spirits to see how some features are used.
  - Serpent-style presence nodes in Special Rules: you can create presence nodes in the special rule using the following format:
    - {special-presence-track} but you have to click the autofill
    - Or just type: <special-rules-track values="5,7,8,10,11,12,13"></special-rules-track>
    - You should be able to use most of the options from [presence tracks](#presence-tracks) here.

[Home](#index)

### Growth

Growth is broken into Growth Sets, Groups, and Actions.

- Directions: When NOT using sets, the Growth Directions tell the player how many growth groups to pick (usually, Pick One or Pick Two). When using Sets, these instructions are instead added to the set.
- "Use Growth Sets"/"Stop Using Growth Sets" button:
  - "Use Growth Sets" button: Adds Growth Sets to the interface. All current Growth Groups are automatically added to the first Set.
  - "Stop Using Growth Sets" button: Switches back to not using Growth Sets. All Growth Groups & Actions are preserved.
- **Growth Sets** are *optional* and used for Growth on spirits such as Lure and Spread of Rampant Green, where the player has two sets to choose from.
  - Set Directions: This field contains instructions for the Growth Set, such as 'Pick one of' or 'Always'.
  - "Add Growth Set" button: Adds additional Growth Sets.
  - **X** button: Deletes the current Growth Set and all of its Growth Groups and Actions
- **Growth Groups** are clusters of Growth Actions. During Growth, the player typically chooses a Growth Group and then does the Growth Actions in that Group.
  - Add Cost: Optional. Allows for an energy cost associated with this group (as seen on Keeper).
    - Non-Energy Scaling Costs: Optional. Try '1,dahan' or '1,custom1' or other icon names
    - Custom Costs: Optional. Try "forget-power-card,Cost: Forget a Power Card from Discard"
  - Add Tint: Optional. Allows a color shift on growth options (as seen on Spread of Rampant Green).
  - Add Title: Optional. Allows for a title over a single growth option (see Ember-Eyed). NOTE use 'Growth Sets' for a Lure-type subtitle.
  - Add Growth Group: Adds an additional Growth Group.
  - **X**: Deletes the current Growth Group & all of its Growth Actions
- **Growth Actions** are the individual growth actions, such as gaining energy or adding a presence. How to write these actions are detailed below.
  - Add Growth Action: Adds an additional Growth Action to the Group.
  - ↻: Refreshes the current growth set on the preview (without updating the whole preview).
  - Remove: Deletes the Growth Action.

#### Supported Growth Actions

| Category | Action | Usage | Details | Examples |
| ------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Reclaim | Reclaim All, Reclaim One, Reclaim Half | reclaim(x) | x can be all, one, half, or custom |  |
|  | Reclaim Element Specific | reclaim(x,y) | Reclaim x (all or one) cards with element y | Ember-Eyed Behemoth: reclaim(all,fire) |
|  | Reclaim Custom | reclaim(custom,_your custom reclaim text_) | Custom reclaim text with a unique icon. | reclaim(custom,your Unique Power Cards) |
| Adding Presence | Add Presence at Range | add-presence(x) | At range x, add a Presence. x can be a number, 'any', or any element (scaling range) |  |
|  | Add Presence with Condition | add-presence(x,y) | At range x, add a Presence to a land with y conditions. y can be terrains, tokens, invaders, invader pieces, dahan, blight, etc. |  |
|  | Add Presence with Multiple Conditions | add-presence(x,y,z,...,and/or) | At range x, add a Presence with multiple conditions y, z, etc, the last parameter must be 'or' or 'and'. | Sharp Fangs: <br>add-presence(3,jungle,beast,or)<br>Vengeance: <br>add-presence(2,town,city,blight,or) |
|  | Add Presence and/or Tokens | add-presence(x,token,y,and/or) | At range x, add a Presence and/or a token y (beasts, disease, etc). Use add-token if only adding tokens. | Many Minds: <br>add-presence(3,token,beast,and)<br>Vengeance: <br>add-presence(1,token,disease,or) |
|  | Add Presence relative to an Entity | add-presence(x,relative,y) | At range x relative to y, add a Presence. | Covets (Apocrypha ): add-presence(1,relative,custom1) where custom1 is Lair |
|  | Add Presence with Custom Text | add-presence(x,text,*your_text_here*) | At range x, add a Presence with text 'Add a Presence *your_text*'. No icon. |  |
|  | Add Presence with Custom Text and Icon(s) | add-presence(x,text,*your_text_here*,y,...) | At range x, add a Presence with text 'Add a Presence *your_text*'. The growth icon will be y and any number of additional icons separated by commas |  |
| Gaining Elements | Gain One Element | gain-element(x) | Gain Element x, which can be any of the elements or 'any' or 'star' | 'star' is the Starlight element icon |
|  | Gain Multiple of the Same Element | gain-element(x,y) | If y is a number, gain y of x Element |  |
|  | Gain a Choice Elements | gain-element(x,y,...) | If y is an element, gain x or y (or z) Elements | Lure: <br>gain-element(moon,air,plant) |
|  | Gain Multiple Elements | gain-element(x,y,z,...,*and*) | Gain elements x, y, and z (or more). The last option must 'and' | Spreading Rot: gain-element(moon,water,earth,plant,and) |
| Preparing/Discarding Element Markers | Prepare One Element Marker | element-marker | Prepare 1 element marker |  |
|  | Prepare Multiple Element Marker | element-marker(x) | If x is positive, Prepare x Element Markers | element-marker(2) |
|  | Discard Element Markers | element-marker(-x) | If x is negative, Discard x Element Markers | element-marker(-2) |
| Pushing | Push from Your Lands | push(x) | Push entity x (dahan, beasts, presence, etc) from 1 of your lands. For 'or', x may be entity/entity. |  |
|  | Push with Conditions | push(x,y) | If y is a condition (terrain, sacred site, beasts, etc), Push entity x from 1 of your lands with y condition.  For 'or', x may be entity/entity. |  |
|  | Push Multiple Entities (same type) | push(x,y) | If y is a number, Push y of entity x from 1 of your lands. |  |
|  | Push Multiple Entities with Conditions | push(x,y,z) | Push z of entity x from lands of condition y. For 'or', x may be entity/entity. y can be terrain types, sacred site, token types, etc. z can be a numeral or 'each' (or another word at your own risk). |  |
|  | Push From Each Land with Condition | push(x,y,z) | If z is a word ('each'), Push x from z lands of condition y.  For 'or', x may be entity/entity. | Ocean: push(presence,ocean,each) |
|  | Push (Ranged) | push(x,y) | At range x, Push entity y (dahan, beasts, presence, etc) from a land.  For 'or', y may be entity/entity. |  |
|  | Push (Ranged) with Conditions | push(x,y,z) | At range x, Push entity y from a land with condition z. For 'or', y may be entity/entity. |  |
|  | Push (Ranged) Multiple Entities | push(x,y,z) | At range x, Push numeral z of entity y from a land. |  |
|  | Push (Ranged) Multiple Entities with Conditions | push(x,y,z,w) | At range x, Push numeral z of entity y from a land with condition w. |  |
| Gathering | Gather into Your Lands | gather(x) | Gather entity x (dahan, beasts, presence, etc) into 1 of your lands.  For 'or', x may be entity/entity. |  |
|  | Gather with Conditions | gather(x,y) | If y is a condition (terrain, sacred site, beasts, etc), Gather entity x into 1 of your lands with y condition.  For 'or', x may be entity/entity. |  |
|  | Gather Multiple Entities | gather(x,y) | If y is a number, Gather y of entity x into 1 of your lands. |  |
|  | Gather Multiple Entities with Conditions | gather(x,y,z) | Gather z of entity x into lands of condition y.  For 'or', x may be entity/entity. y can be terrain types, sacred site, token types, etc. z can be a numeral or 'each' (or another word at your own risk). | Ocean: gather(presence,ocean,each) |
|  | Gather into Each Land with Condition | gather(x,y,z) | If z is a word ('each'), Gather x into z lands of condition y. For 'or', x may be entity/entity. | Ocean: gather(presence,ocean,each) |
|  | Gather (Ranged) | gather(x,y) | At range x, Gather entity y (dahan, beasts, presence, etc) into a land.  For 'or', y may be entity/entity. | Many Minds: <br>gather(2,beasts) |
|  | Gather (Ranged) with Conditions | gather(x,y,z) | At range x, Gather entity y into a land with condition z. For 'or', y may be entity/entity. |  |
|  | Gather (Ranged) Multiple Entities | gather(x,y,z) | At range x, Gather numeral z of entity y into a land. |  |
|  | Gather (Ranged) Multiple Entities with Conditions | gather(x,y,z,w) | At range x, Gather numeral w of entity y into a land with condition w. |  |
| Move Presence | Move Presence | move-presence(x) | Move a Presence up to x range. x is a number or element (scaling) |  |
|  | Move Multiple Presence | move-presence(x,y) | Move y Presence up to x range together | Relentless Gaze:  move-presence(3,3) |
|  | Move Presence with Token | move-presence(x,y) | Move Presence and token y up to x range. y is a number |  |
| Gaining Energy | Gain Energy | gain-energy(x) | Gain x Energy. x is a number. | gain-energy(2) |
|  | Gain Energy per Thing | gain-energy(x) | Gain 1 Energy per Entity x (such as Elements, Sacred Sites, etc) | gain-energy(water) |
|  | Gain Energy per Thing plus Flat Energy | gain-energy(x,y) | Gain x Energy plus 1 Energy per Entity y | Wildfire: gain-energy(2,fire) |
|  | Gain Multiple Energy per Thing plus Flat Energy | gain-energy(x,y,z) | Gain x Energy plus z Energy per Entity y |  |
|  | Gain Energy per Custom Item Plus Flat Energy | gain-energy(x,text,*your_text*) | Gain x Energy plus 1 Energy per condition of your choosing. Icon will be a !!!. |  |
|  | Gain Energy per Custom w/ Icon Item Plus Flat Energy | gain-energy(x,text,*your_text*,y) | Gain x Energy plus 1 Energy per condition of your choosing. Icon will be y. |  |
|  | Gain Energy per Custom Item | gain-energy(text,*your_text*) | Gain 1 Energy per condition of your choosing. Icon will be a !!!. |  |
|  | Gain Energy per Custom Item w/ Icon | gain-energy(text,*your_text*,y) | If y is Entity, gain 1 Energy per Entity w/ your custom text. If y is number, gain y Energy per !!! w/ your custom text. |  |
|  | Gain Multiple Energy per Custom Item w/ Icon | gain-energy(text,*your_text*,y,z) | Gain z Energy per Entity y of your choosing. |  |
|  | Gain Energy per Card Play | energy-per-play | Gain 1 Energy per Card Play. | As seen on Trickster |
| Add Tokens | Add One Token | add-token(x,y) | At range x, add token type y | add-token(2,beast) |
|  | Add Multiple Token of One Type | add-token(x,y,z) | At range x, add z tokens of y type | add-token(3,wilds,2) |
|  | Add Tokens of Different Types | add-token(x,y,z,...,and/or) | At range x, add tokens of type y, z, and/or more. The last parameter must be 'or' or 'and'. | add-token(3,wilds,beasts,disease,and); add-token(3,strife,badlands,or); |
|  | Add Tokens Conditionally | add-token(x,y,z) | At range x, add token of type y to land with condition z (such as terrain or other token presence) | add-token(2,beasts,dahan); add-token(1,disease,wetland); |
| Replacing | Replaces Token with another in one of your lands | replace(x,y) | In your land, Replace entity x with entity y. Entity can be presence or other things too. | replace(disease,presence) |
|  | Replaces Token with another at range | replace(x,y,z) | At range x, Replace entity y with entity z. | replace(2,wilds,destroyed-presence) |
| Gain Power Card | Gain a Power Card | gain-power-card() | Gain a Power Card |  |
|  | Gain a Minor/Major/Other Power Card | gain-power-card(x) | Gain x Power Card. x is minor, major, or something else (icon appears in top left). It can also be blank | gain-power-card(minor) |
|  | Gain a Minor/Major/Other Power Card with Other Note | gain-power-card(x,y) | Gain x Power Card with y condition. y is text to follow 'Gain x Power Card y'. x can be blank. | gain-power-card(minor, from discard) |
|  | Gain a Minor/Major/Other Power Card with Note&Icon | gain-power-card(x,y,z) | Gain x Power Card with y condition. z is an icon that appears in the top right of the Power Card | Dances Up Earthquakes: or(add-presence(2),gain-power-card(major, without Forgetting,noforget)) |
| Repeating Growth Options | Repeat Growth Options | ^x | Added to other growth options. x is the number of repeats. As seen on Fractured Days | gain-power-card^2; gain-energy(2)^3 |
| Discarding Cards | Discard a Card w/ an Element | discard(x) | Discard a card with element x (as seen on Ember-Eyed) |  |
|  | Discard 2 Power Cards | discard-cards | As seen on Downpour |  |
|  | Discard 1 Power Card | discard-card |  |  |
| Gain Card Play | Gain 1 Card Play | gain-card-play() | Gain +1 Card Play | Volcano, Finder: gain-card-play |
|  | Gain Card Plays | gain-card-play(x) | Gain +x Card Plays |  |
| Forget Power Card | Forget a Power Card | forget-power-card() | Forget a Power Card |  |
| Ignore Range | Ignore Range this Turn | ignore-range() | Ignore Range this turn (as seen on Finder) |  |
| Gain Range | Gain Range this Turn | gain-range(x) | Gain +x range for Powers this turn | gain-range(1) |
|  | Gain Range this Turn for... | gain-range(x,y) | Gain +x range for y effects (powers, power cards, innate powers, everything) this turn | gain-range(2,powers) |
| Isolate | Isolate one of your Lands | isolate() | Isolate one of your Lands |  |
|  | Isolate a land at Range | isolate(x) | At range x, Isolate a land |  |
| Destroy Presence | Destroy a Presence | destroy-presence(x) | Destroy x of your Presence |  |
| Gaining Fear | Gain Fear | fear(x) | Gain x Fear |  |
|  | Gain Fear per Element | fear(x) | Gain 1 Fear per Element x |  |
|  | Gain Fear per Element plus Flat Fear | fear(x,y) | Gain x Fear plus 1 Fear per Element y |  |
|  | Gain Fear per Custom Item | fear(text,_your_text_here_) | Gain 1 Fear per condition of your choosing. Icon will be a !!!. | fear(text,for each of your blighted lands) |
|  | Gain Fear per Custom Item Plus Flat Fear | fear(x,text,_your_text_here_) | Gain x Fear plus 1 Fear per condition of your choosing. Icon will be a !!!. |  |
| Deal Damage | Damage at Range | damage(x,y) | At range x, deal y Damage | Starlight: damage(0,2) |
|  | Deal 1 or 2 Damage in your Lands | damage-1, damage-2 | Deals 1 or 2 Damage in one of your Lands |  |
| Make a Power Fast | Make a Power Fast | make-fast | One of your Powers may be Fast |  |
| Incarna | Add/Move Incarna to Icon (ie. Presence) | incarna(add-move,x) or incarna(add-move,x,y) | Adds an Incarna. x is an icon (usually presence). y is the incarna icon | Wandering Voice: incarna(add-move,presence) |
|  | Move Incarna | incarna(move,x) or incarna(move,x,y) | Moves an Incarna. x is the range & can be a number or 'any'. y is the incarna icon | Ember-Eyed Behemoth: incarna(move,1) |
|  | Empower Incarna | incarna(empower) | Empowers Incarna | Ember-Eyed Behemoth: incarna(empower) |
|  | Replace with Incarna | incarna(replace,x,y) | Replaces icon x with incarna. y is the incarna icon | Towering Roots: incarna(replace,presence) |
|  | Add Token at Incarna | incarna(add-token,x,y) | Adds token/icon x at incarna. y is the incarna icon | Towering Roots: incarna(add-token,vitality) |
| Growth Action Cost | Adds a cost to a specific growth action (vs group) | ^cost(x) | Adds an energy cost to the growth option | gain-power-card^cost(3) |
| Custom | Custom Text with !!! Icon | custom(*your_text*) | A custom growth option with the image !!! |  |
|  | Custom Text with Any Icon | custom(*your_text*,x,...) | A custom growth option with the x icon of your choice (ie. town, dahan, element, etc). Can use more than 1 icon and they will appear in a row. | custom(Deal 1 Damage in each of your Sacred Sites,sacred-site,damage-1) |
|  | Custom Text with Text In Place of Icons | custom(*your_text*,text,x) | A custom growth option with the your custom text x in place of an icon. |  |
| Blank Space | Creates a blank space in growth | blank() | Creates a blank space |  |
| **OR** Growth Options | Allows pair of two growth options | or(x,y) | x and y are growth options (like the ones above) | Fractured Days's growth: or(gain-1-time^2,gain-card-play(2)) |
| Presence Track Node | Puts the growth option inside a presence track ring | presence-node(x) | x is a growth option (like the ones above) | presence-node(reclaim-one) |
| Custom text on anything | Useful for translating, replaces pre-gen text | *_your_text_here_ | At the end of any growth action, put * and whatever text you want. Useful when creating boards in other langauges | reclaim(all)*Alle Karten wiedererlangen |
[Home](#index)

### Presence Tracks

The two presence tracks (energy & plays) are filled out here. To accomplish middle nodes (such as Serpent or Finder), wrap the **energy** node in 'middle()'.

- Node boxes: Each text box represents the effect of one node. See 'Supported Presence Track Options'. In most cases, icon brackets {} are NOT needed in Presence Track nodes (custom is the exception).
  - Node boxes automatically update when you click/tab/enter away from the node.
- + Button: Adds a node between the two nodes.
- x Button: Removes the node.
- Note: This will appear at the top of the Presence track box, as seen on Finder. Use [{icon shortcuts}](#general-icons) here.

[Home](#index)

#### Supported Presence Track Options

| Presence Track Effect               | Usage                                      | Details                                                                                                                          | Examples                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Energy/Turn or Card Plays           | Integer 1,2,3,4,5,6,7 etc.                 | Number will become Energy/Turn in energy track and Card Plays in the card play track                                             | River cardplay track: 1,2,2,3,reclaim-one,4,5                                                                                                                |
|                                     | For Energy, +1,-2,+3 etc.                  | Will modify energy gain instead of flat energy gain (think Finder)                                                               | Finder 'top row': 0,sun,2+water,**+2**,+1+any                                                                                                                |
| Forced Energy / Card Plays          | energy(x) or plays(x)                      | Allows for energy in plays track or plays in the energy track. Best used in combinations                                         | Wounded Waters track: energy(0)+plays(1)                                                                                                                     |
| Elements                            | sun,moon,fire,air,water,earth,plant,animal | Can be used in combinations                                                                                                      | Thunderspeaker energy track: 1,air,2,fire,sun,3                                                                                                              |
|                                     | any, star                                  | 'any' is any element, 'star' is the Element icon from Starlight                                                                  |                                                                                                                                                              |
|                                     | elements(x;y)                              | Gain element x OR y. Can be used in combinations.                                                                                | Wounded Waters track: elements(water;animal)                                                                                                                 |
| Element Markers                     | markerplus, markerminus                    | Gain or pay element markers                                                                                                      | Shifting Memory energy track: 0,1,2,3+markerplus,4,reclaim-one,5,6+markerplus<br>Shifting Memory plays track: 1,2,2,markerminus+markerminus+gain-card-play,3 |
| Reclaim One                         | reclaim-one                                | Reclaim one card, can be used in combinations                                                                                    | River cardplay track: 1,2,2,3,reclaim-one,4,5                                                                                                                |
| Combinations - And                  | separate with a '+'                        | Can include energy, cardplays, elements, markers, move-presence, gain-range, reclaim one, and custom. Can be more than 2 things. | Stone's cardplay track: 1,earth,earth,earth+reclaim-one,earth+any,2+earth                                                                                    |
| Combinations - Or                   | or(x;y)                                    | Technically the same as elements(x;y). You can use things like gain-power-card or reclaim-one                                    |                                                                                     |
| Split nodes (two nodes in same spot)| split(x;y)                                 | Where x and y are other presence node inputs                                    | split(fire;animal)        (as seen on the Apocrypha dragon)                                                                            |
| Push/Gather                         | push(x), gather(x)                         | Push or Gather x from/into one of your Lands. x can be most token/entities (explorer, wilds, presence, etc).                     | Trickster's cardplay track: 2,push(dahan),3,3,4,air,5                                                                                                        |
|                                     | push(x;y)                                  | Push x or y from one of your Lands. Could do z but its not recommended. Gather not implemented.                                  | Finder's bottom track: push(town;city)                                                                                                                       |
|                                     | push(incarna)                              | "Push Your Incarna" with default incarna icon                                                                                    |                                                                                                                        |
|                                     | push(incarna;x)                            | "Push Your Incarna" with custom incarna icon. Should use a custom icon.                                                          |                                                                                                                        |
| Isolate                             | isolate                                    | Isolate one of your Lands.                                                                                                       | Custom cardplay track: 1,2,isolate,3,3,4,5                                                                                                                   |
| Move a Presence                     | move-presence(x)                           | Move a presence x range, can be used in combinations.                                                                            | Downpour cardplay track: 1,move-presence(1),water,2,move-presence(1),3                                                                                       |
| Gain Power Card                     | gain-power-card                            | Gain Power Card (typically paired with ^pay(2))                                                                                  | Many Minds cardplay track: 1,2,gain-power-card^pay(2),3,3,4,5                                                                                                       |
|                                     | gain-power-card(x)                         | Gain Power Card of type x (such as minor)                                                                                        |                                                |
| Pay 2 to Gain Power Card            | gain-card-pay-2                            | Pay 2 Energy to Gain Power Card                                                                                                  | Many Minds cardplay track: 1,2,gain-card-pay-2,3,3,4,5                                                                                                       |
| Gain Card Play                      | gain-card-play                             | Gain an additional card play not in the normal way (think Stone or Finder)                                                       | Stone energy track: 2,3,gain-card-play^minor,4,gain-card-play^minor,6,gain-card-play^minor                                                                   |
| Gain Range                          | gain-range(x)                              | Gain +x range                                                                                                                    |                                                                                                                                                              |
|                                     | gain-range(x;y)                            | Gain +x range on "y"                                                                                                             | range(1;everything)                                                                                                                                          |
| Add Token                           | token(x)                                   | Adds a token x to 1 of your lands                                                                                                |                                                                                                                                                              |
|                                     | token(x;y)                                 | Adds a token y at range x                                                                                                |                                                                                                                                                              |
| Incarna                             | incarna(empower)                           | Empower incarna                                                                                                                  | As seen on Breath of Darkness                                                                                                                                |
|                                     | incarna(addmove;x)                         | Add or move incarna (icon x) to your presence                                                                                    | As seen on Locus Aspect: incarna(addmove,custom1)                                                                                                            |
|                                     | incarna(addmove;x;y)                       | Add or move incarna (icon x) to y                                                                                                | As seen on Breath of Darkness                                                                                                                                |
|                                     | push(incarna;x)                            | "Push Your Incarna" with default incarna icon                                                                                    | As seen on Wandering Voice                                                                                                                                |
| Notate with Icon (like Stone)       | ^x                                         | Puts icon x in top left corner of presence node                                                                                  | Stone top row: 2,3,gain-card-play^minor,4,gain-card-play^minor,6,gain-card-play^minor                                                                        |
| Notate with Energy (like Starlight) | ^energy(x)                                 | Puts an energy icon in the top left with value x (can be negative, use + to show +). Recommended to use with custom              | custom(Pay 2 Energy to Gain a Card Play,gain-card-play)^energy(-2)                                                                                           |
| Node cost (like Many Minds)         | ^pay(x)                                 | Notates with a negative value and adds text stating a requirement to pay         | gain-power-card^pay(-2)                                                                                           |
| Damage                              | damage(x)                                  | Deal x Damage in one of your Lands                                                                                             |                                                                                                                                                              |
|                                     | damage(x;y)                                | x Damage at Range y                                                                                             |                                                                                                                                                              |
| Forget Power                        | forget-power-card                          | Forget a power card. Unlikely to be useful because presence track actions are optional                                           | Custom energy track: 1,3+forget-power-card,5+forget-power-card,7+forget-power-card                                                                           |
| Custom                              | custom(_your_text_)                        | Add custom text to the presence node. Image will be !!!.                                                                         | Custom energy track: 1,2,custom(Draw 1 Minor Power),3,water,4                                                                                                |
|                                     | custom(_your_text_;x)                      | Can be used in combinations. x is an icon(s) and/or text. Note the semicolon.                                                    | Spreading Rot top row: 2,custom(Gain 1 Rot;custom1)+water,3,custom(Gain 1 Rot;custom1)+plant,custom(Gain 1 Rot;custom1)+earth,4                              |
|                                     | custom(_your_text_;{x}/{y})                | Cannot be used in combinations. Can have icons (x and y, for example) and text                                                   | custom(Destroy 1 Town or City;{town}/{city})<br>custom(Pay 2 Disease to Gain Power Card;{disease}{disease}{gain-power-card})                                 |
| Middle Nodes                        | middle(wrap other node options)            | Wrap your presence node options in middle() to have them appear in the middle of the tracks. Only do this to energy track nodes. | Serpent energy track: 1,fire,any,reclaim-one,**middle(earth)**,6,any,12                                                                                      |
| Bonus Nodes                         | bonus(wrap other node options)             | Behaves like middle() but will include the text 'bonus' above the nodes.                                                         | Hearth-Vigil energy track: bonus(gather(dahan)),0,1+sun,2,3+animal,4,5+sun                                                                                 |
| Backgrounds: force Energy icon      | _energy                                    | Adds an energy icon to the back of the node. Can be combined with shadow like _energyshadow                          |                                                                                                |
| Backgrounds: force Shadow            | _shadow                                    | Adds an shadow icon to the back of the node. Can be combined with energy like _energyshadow                          |                                                                                                |
| Backgrounds: force nothing           | _none                                    | Prevents any icon behind a presence node                      |                                                                                                |
| Backgrounds: force 'first' ring    | _first                                    | Force the complete 'first' ring, instead of the dashed ring                      | 2_first                                                                                               |
| Backgrounds: prevent 'first' ring  | _nofirst                                    | Prevents the complete 'first' ring, instead uses the dashed ring                      | 1_nofirst                                                                                               |
| Move a node from default location  | _shift(x) or _shift(x;y)      | Shifts the node left (-) or right (+) by x, up (+) or down (-) by y.                       | 1_shift(50;50) or 1_shift(25)first
| Subtext Placement  | ~top, ~left, ~right                                    | Changes where the node's text shows up in relation to the node                     | 1_~top, middle(earth~top)                                                                                               |
| Blank space / empty presence track  | blank, blank(x)                            | Creates a blank presence node. Useful for creating space if you want to end the presence tracks elsewhere                        |                                                                                                                                                              |

[Home](#index)

### Innate Powers

- Power Name: The name of the Innate Power
- Remove Innate Power: Permanently deletes the Innate Power
- Fast/Slow: Toggles the Speed of the Power
- Range: The range of the innate. Uses special syntax:
  - For a power without range (such as Spirit targeting powers), type "none" or leave the range blank.
  - For range, use an icon (if needed) + an integer separated by a comma. Examples:
    - 0
    - 1
    - sacred-site,2
    - wetland-presence,1
- Target: The target of the innate. Unlike Range, this uses the same HTML code as the rest of the template, so you can use any icons and the shorthand syntax (ie. {dahan}).
  - "No" target: You can add {no-} before any icon to put a red X over it ({no-blight}). For text, use {no} (ie. {no}Invaders).
- Target Land/Target: Toggle between Target Land (for land targetting powers) and Target (for Powers that target spirits, etc).
- Note (optional): Allows adding notes to the top of the innate (See Volcano Looming High or Lure of the Deep Wilderness as an example). Use [{icon shortcuts}](#general-icons) here (such as {dahan}).
- Add Level: Adds a Thershold Level to the Innate Power.
  - Threshold: Contains the threshold information. Can include:
    - Elements: 1-plant,2-fire
    - Icons: 2-wilds
    - Energy Costs: cost-2
      - Example: Volcano: 3-fire,cost-2 or Many Minds: 1-air,2-animal,2-beasts
    - Other Cost w/ custom icon: cost(custom1)-1 or cost(dahan)-2. Icon will appear with '-x' where x is the number you use.
      - Example: Spreading Rot: 2-moon,3-water,2-animal,2-cost(custom1)
    - Or: As seen on Trickster
      - Example: Trickster: 3-sun,OR,3-fire
    - Custom Threshold: You can use text in place of an icon in a threshold
      - Example: 2-water,2-text(X)
    - Text: You can also create a block of text by just putting 'text' into the threshold.
    - Subpower: You can create a second power in the same column using subpowers. This will make the title and info block.
      - Threshold: 'new-power'
      - Effect: Use the following format: Power Name;speed;range;target info;target type
      - Example: 'Volcanic Eruption;slow;sacred-site,1;any;target land'
  - Effect: The effect of the power at that threshold level. Use {icons} freely here.
    - To achieve 'for each element' effects, use the notation {element, #}.
    - Example: Serpent's Second Innate, Second Level: For each **_{moon,2} {earth,2}_**, 2 {fear} and push 1 {town}.
  - Long: Allows the level text to spill into the second column (like Volcano's first Innate Power, last threshold). Use only when appropriate.
  - Remove: Deletes the level. Cannot be undone.
- Add Innate Power: Adds another Innate Power. You can add more than 2... but it won't be pretty so don't do it.

[Home](#index)

### Custom Icons

This field allows you to upload and use your own custom icons. Reference these icons using {custom1}, {custom2}, etc. Custom icons are usable across all components (ie. spirit board, cards, aspects, etc)

- Add Custom Icon: Adds an additional custom icon field.
- Load: Allows you to chose a file from your computer to be a custom icon.
- Remove: Removes the custom icon. WARNING: deleting a custom icon will re-number the remaining ones, so be careful.

[Home](#index)

## Spirit Board Lore Side

### Spirit Name, Art and Lore {#spirit-lore-name}

- Name: The name of your Spirit
- Spirit Art: The art for your spirit. Press 'Choose File' to select an image.
- Lore: The lore associated with your spirit. Icon shortcuts do NOT work here (icons are never used in lore).

[Home](#index)

### Spirit Setup, Play Style, Complexity and Summary of Powers {#spirit-lore-setup}

- Setup: How to setup your spirit for play. You can use the [{icon shortcuts}](#general-icons) here.
- Play Style: How to play your spirit. You can use the [{icon shortcuts}](#general-icons) here.
- Complexity:
  - Complexity Description appears inside the red complexity bar. Official complexity descriptors: Low, Moderate, High, Very High
  - Complexity Value is between 1 to 10
- Summary of Powers:
  - Assign values 1 to 10 for Offense, Defense, Fear, Control and Utility
  - 'Uses' indicates what game pieces the Spirit interacts with. Do not use icon shortcuts, just list the pieces with comma separation (ie. badlands,wilds)

[Home](#index)

## Power Cards

- Name: The name of the card (the name will scale to fit the name area on the card)
  - Remove Power Card: This button removes the card - careful.
- Cost: The energy cost of the card
- Elements: The highlighted elements will appear on the card. Click on the element to enable it.
- Speed: The speed of the card ('fast' or 'slow).
- Range: The range of the card. Uses special syntax:
  - For no range (ie. if it targets a Spirit), type "none".
  - For range, use an icon (if desired) without brackets and an integer separated by a comma. Examples:
    - 0
    - 1
    - sacred-site,2
    - wetland-presence,1
- Target: The target of the card.
  - Target Land/Target: Click either Target Land or Target.
  - Text Input: Use icons with brackets here. Examples:
    - {blight}
    - {no-blight}
    - {no-sand}
- Rules: The effects of your power. You can use the [{icon shortcuts}](#general-icons) here.
  - {or} will create the 'or' split
  - \<br\> will force a line break.
- Threshold
  - Add Power Threshold: This button adds a threshold effect to the power, typically elemental thresholds.
  - Threshold: The threshold condition. It is a list of condition separated by comma. Here are some examples:
      - "3-animal"
      - "2-sun,2-water"
      - "3-air,4-water,3-earth"
  - Custom Text: Changes the threshold text from the default "IF YOU HAVE" to whatever you want.
  - Threshold Effect: The rules for the threshold effect. You can use the [{icon shortcuts}](#general-icons) here.
  - Clear Power Threshold: This button removes and deletes the threshold. Careful.
- Artist
  - Artist Name: The name of the artist. Please attribute your artists.
  - Choose File: Choose the art file from your computer. Will be embedded in the HTML.
- Add Power Card botton: Adds another power card.

[Home](#index)

## Adversary

### Adversary Name, Loss Condition and Escalation {#adversary-name}

- Name: The name of your adversary. Will automatically be displayed in all capitals.
- Flag Art: The flag art that appears on the adversary. Press 'Load' to select an image.
  - Image Size: The ratio of the image should be roughly 4 by 3. (Demo flag is 1280 by 934)
- Additional Loss Condition
  - Name: The name of your Adversary's Additional Loss Condition.
  - Effect: The rules of your Additional Loss Condition. You can use the [{icon shortcuts}](#general-icons) here.
- Escalation Effect (formerly Stage II Escalation)
  - Name: The name of your Adversary's Escalation Effect.
  - Effect: The rules of your Escalation Effect. You can use the [{icon shortcuts}](#general-icons) here.

[Home](#index)

### Adversary Levels {#adversary-levels}

For now, your adversary must have 6 levels. If you want to do less, you'll have to leave the later ones blank.

- Name: The name of the level.
- Difficulty: The first box next to name. The difficulty appears in small () next to the level number.
- Fear Cards: The number of fear cards for this adversary level. You can separate with commas or forward slash.
- Effect: The rules of your level. You can use the [{icon shortcuts}](#general-icons) here.

[Home](#index)

## General Icons

Icons for invaders, elements, dahan, etc can be used by enclosing its name with "{}". For example, {dahan} or {fire}. Here is a list of what is available:

- Elements (fire, water, earth, air, plant, animal, sun, moon)
  - the Any element icon (any)
  - the Element icon (star)
  - the Prepare Element Marker and Discard Element Marker (markerplus, markerminus)
- Invaders (explorer, town, city)
- Presence (presence, sacred-site, no-presence, no-own-presence, destroyed-presence, move-presence-1, move-presence-2, move-presence-3, move-presence-4)
- Island icons (blight, dahan, beasts, wilds, disease, strife, badlands, vitality)
- Fear icons (fear, terror1, terror2, terror3)
- Land icons (sand, mountain, jungle, wetland, ocean, jungle-wetland, jungle-sand, sand-wetland, mountain-jungle, mountain-wetland, mountain-sand)
- Power icons (fast, slow, minor, major, spirit, or, forget, noforget)
- Range icons (range, range-0, range-1, range-2, range-3, range-4, jungle-presence, sand-presence, mountain-presence, wetland-presence)
- Targeting icons (spirit)
- Power effect icon (isolate, gain-range-1, gain-range-2, gain-range-3, gain-range-x, lose-range-1, etc)
- Energy icons (energy-1, energy-2, energy-x where x is whatever number)
- Growth icons (see [Growth](#growth) section and [Supported Growth Actions](#supported-growth-actions) for examples)
- Presence track icons (see [Presence Track](#presence-tracks) section for examples)

### Modifying Icons
Some options for changing how an icon displays:
- no-: Nearly every icon can have a red X over it by adding 'no-' such as {no-blight}.
- Or/: You can cluster icons with a / to keep them together through line breaks: {explorer/town}
- Counts: You can add item counts like so {earth,2}. This only works in some contexts
- Incarna icons: add "incarna-" to an icon and it will appear larger when used (typically "{incarna-custom1}")
- Size options: add small-, medium-, large-, or huge- to an icon name to change its size (ie. "{large-dahan})

### Custom Icons
You can load your own icon into the Builder. These will always be called custom1, custom2, etc. You can modify these icons as described above.
- Display Name: This is not required. A few  growth and presence track options will try to identify the icon's name. This will set the name in those instances. Typically, this isn't needed until you start to see the text 'custom1' appear on your board.

[Home](#index)

### Tips and Tricks

- The template uses html so you can use some html to customize your board:

  - For example, you can create a line break by typing \<br\> (useful in notes, levels, and special rules).

  [Home](#index)
