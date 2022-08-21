# Spirit Board Editor Interface

Welcome to the Spirit Island Spirit Board editor! This document will help you use the Spirit Board builder.

## Index
- [Preview Board and Interface](#previewboard-and-interface)
- Form Fields:
  - [Spirit Name & Art](#spirit-name-and-art)
  - [Special Rules](#special-rules)
  - [Custom Icons](#custom-icons)
  - [Growth](#growth)
  - [Presence Tracks](#presence-tracks)
  - [Innate Powers](#innate-powers)
- [How to Use {Icons}](#general-icons)

### Preview Board and Interface
Click 'Preview Board' to show or hide the preview of your spirit board. Note that the board won't reload when you do this. Click 'Generate Spirit Board' to load changes into the preview.
- Load Spirit Board file: Click this button to load a file from the Spirit Island HTML Template or a file previously saved from this webpage.
- Generate Spirit Board: Click this button to load a new preview board and see your changes.
- Toggle Board Size: Click this to change the size of the preview. NOTE: There is no way to export the image of your board, so use a screen capture tool such as the snipping tool on Windows.


[Home](#index)

### Spirit Name and Art
- Spirit Name: The name of your spirit. Will automatically be displayed in all capitals.
- Spirit Art: The main Spirit image. Press 'Load' to select an image.
	- Scale (optional): Used to scale the image. Include the percentage sign in your input. Will default to 100% 
- Banner Art: The image that sits behind the Spirit name.
- Energy Track Banner & Plays Track Banner: The banners behind the presence tracks.
	- Scale (optional): Stretches the vertical dimension of the banner (horizontal is automatically set based on the number of nodes).

[Home](#index)

### Special Rules
Use these fields to modify your spirit's special rules. You can and should use the [icon shortcuts](#general-icons) here (such as {dahan}).
- Name: The name of the Special Rule.
- Effect: The special rule effect. Use icon shortcuts here.
- Remove: Button to **permanently** delete the special rule.
- Add Another Rule: Adds an additional special rule.

[Home](#index)

### Custom Icons
This field allows you to upload and use your own custom icons. Reference these icons using {custom1}, {custom2}, etc.
- Add Custom Icon: Adds an additional custom icon field.
- Load: Allows you to chose a file from your computer to be a custom icon.
- Remove: Removes the custom icon. WARNING: deleting a custom icon might re-number the remaining ones, so be careful.

[Home](#index)

### Growth
Growth is broken into Growth Sets, Groups, and Actions.
- Growth Directions: When NOT using sets, the Growth Directions tell the player how many growth groups to pick (usually, Pick One or Pick Two). When using Sets, these instructions are instead added to the set.
- **Growth Sets** are used for Growth on spirits such as Lure and Spread of Rampant Green, where the player has two sets to choose from.
  - Use Growth Sets: Adds Growth Sets to the interface. All current Growth Groups are automatically added to the first Set.
  - Growth Set Choice: The instructions for the Growth Set, such as 'Pick one of' or 'Always'.
  - Add Growth Set: Adds additional Growth Sets.
  - **X**: Deletes the current Growth Set and all of its Growth Groups and Actions
  - Remove All Growth Sets: Switches back to not using Growth Sets. All Growth Groups & Actions are preserved.
- **Growth Groups** are clusters of Growth Actions. During play, the player typically chooses on Growth Group and then does the Growth Actions in that Group. 
  - Add Cost: Optional. Allows for an energy cost associated with this group (as seen on Keeper).
  - Add Tint: Optional. Allows a color shift on growth options (as seen on Spread of Rampant Green).
  - Add Growth Group: Adds an additional Growth Group.
  - **X**: Deletes the current Growth Group & all of its Growth Actions
- **Growth Actions** are the individual growth actions, such as gaining energy or adding a presence. How to write these actions are detailed below.
  - Add Growth Action: Adds an additional Growth Action to the Group.
  - Remove: Deletes the Growth Action.

#### Supported Growth Actions
<details>
  <summary>Click to Expand for Supported Growth Actions</summary>

|Category|Action|Usage|Details|Examples|
|------|------|------|------|----|
|Reclaim|Reclaim All, Reclaim One, Reclaim Half|reclaim-all, reclaim-one, reclaim-half OR relcaim(x)|x can be all, one, half, or custom||
||Reclaim Custom|reclaim(custom,*your custom reclaim text*)|Custom reclaim text with a unique icon.|reclaim(custom,your Unique Power Cards)|
|Adding Presence|Add Presence at Range|add-presence(x)|Add a Presence up to x Range. *x can be 'any' or 1, 2, 3 or 4*||
||Add Presence with Condition|add-presence(x,y)|Add a Presence with y conditions at x Range. y can be terrain types (including dual types), tokens, invaders, invader pieces, dahan, blight, etc.||
||Add Presence with Multiple Conditions|add-presence(x,y,z,...,*and/or*)|Add a Presence with multiple conditions y, z, etc at x Range, the last parameter must be 'or' or 'and'.|Sharp Fangs: <br>add-presence(3,jungle,beast,or)<br>Vengeance: <br>add-presence(2,town,city,blight,or)|
||Add Presence and/or Tokens|add-presence(x,token,y,and/or)|Add a Presence and/or a token y (beasts, disease, etc) at x Range.|Many Minds: <br>add-presence(3,token,beast,and)<br>Vengeance: <br>add-presence(1,token,disease,or)|
||Add Presence with Custom Text|add-presence(x,text,*your_text_here*)|Add a Presence at x Range. The presence text will read "Add a Presence *your_text_here*". The icon will be **!!!**||
||Add Presence with Custom Text and Icon(s)|add-presence(x,text,*your_text_here*,y,...)|Add a Presence at x Range. The presence text will read "Add a Presence *your_text_here*". The icon will be y and any number of additional icons separated by commas||
|Gaining Elements|Gain One Element|gain-element(x)|Gain Element x, which can be any the elements or 'any' or 'star'|'star' is the Starlight element icon|
||Gain Multiple of the Same Element|gain-element(x,y)|If y is a number, gain y of x Element||
||Gain a Choice Elements|gain-element(x,y,z,...)|If y is an element, gain x or y or z Elements|Lure: <br>gain-element(moon,air,plant)|
||Gain Multiple Elements|gain-element(x,y,z,...,*and*)|Gain elements x, y, and z (or more). The last option must *and*|Spreading Rot: gain-element(moon,water,earth,plant,and)|
|Preparing/Discarding Element Markers|Prepare One Element Marker|element-marker|Prepare 1 element marker||
||Prepare Multiple Element Marker|element-marker(x)|Prepare x element markers (x can be more than 2, or negative)|element-marker(2)|
||Discard Element Markers|element-marker(-x)|x is the number to discard|element-marker(-2)|
|Pushing|Push from Your Lands|push(x)|Push entity x (dahan, beasts, presence, etc) from 1 of your lands.||
||Push at Range|push(x,y)|Push entity x (dahan, beasts, presence, etc) from a land at range y.||
||Push with Conditions|push(x,y)|If y is a condition, push x from 1 of your lands with y condition (sacred site, beasts, etc).||
||Push from Multiple Lands with Conditions|push(x,y,z)|Push x from z lands of condition y. y can be terrain types, sacred site, token types, etc. z can be a numeral or 'each' (or another word at your own risk).|Ocean: push(presence,ocean,each)|
|Gathering|Gather into Your Lands|gather(x)|Gather entity x (dahan, beasts, presence, etc) into 1 of your lands.||
||Gather at Range|gather(x,y)|If y is a number, gather x into a land at y range.|Many Minds: <br>gather(2,beasts)|
||Gather with Conditions|gather(x,y)|If y is a condition, gather x into 1 of your lands with y condition (sacred site, beasts, etc).||
||Gather into Multiple Lands with Conditions|gather(x,y,z)|Gather x into z lands of y condition. z can be a number or 'each'|Ocean: gather(presence,ocean,each)|
|Move Presence|Move Presence|move-presence(x)|Move a Presence up to x Range||
|Gaining Energy|Gain Energy|gain-energy(x)|Gain x Energy|gain-energy(2)|
||Gain Energy per Thing|gain-energy(x)|Gain 1 Energy per Thing x (such as Elements, Sacred Sites, etc)|gain-energy(water)|
||Gain Energy per Thing plus Flat Energy|gain-energy(x,y)|Gain x Energy plus 1 Energy per Thing y|Wildfire: gain-energy(2,fire)|
||Gain Multiple Energy per Thing plus Flat Energy|gain-energy(x,y,z)|Gain x Energy plus z Energy per Thing y||
||Gain Energy per Custom Item Plus Flat Energy|gain-energy(x,text,*your_text_here*)|Gain x Energy plus 1 Energy per condition of your choosing. Icon will be a !!!.||
||Gain Energy per Custom w/ Icon Item Plus Flat Energy|gain-energy(x,text,*your_text_here*,y)|Gain x Energy plus 1 Energy per condition of your choosing. Icon will be y.||
||Gain Energy per Custom Item|gain-energy(text,*your_text_here*)|Gain 1 Energy per condition of your choosing. Icon will be a !!!.||
||Gain Energy per Custom Item w/ Icon|gain-energy(text,*your_text_here*,y)|If y is Entity, gain 1 Energy per Entity w/ your custom text. If y is number, gain y Energy per !!! w/ your custom text.||
||Gain Multiple Energy per Custom Item w/ Icon|gain-energy(text,*your_text_here*,y,z)|Gain z Energy per Entity y of your choosing.||
||Gain Energy per Card Play|energy-per-play|Gain 1 Energy per Card Play.|As seen on Trickster|
|Add Tokens|Add One Token|add-token(x,y)|At range x add token type y|add-token(2,beast)|
||Add Multiple Token of One Type|add-token(x,y, z)|Add z tokens of y type at range x|add-token(3,wilds,2)|
||Add Tokens of Different Types|add-token(x,y,z,...,and/or)|At range x, add a tokens of type y, z, and/or more. The last parameter must be 'or' or 'and'.|add-token(3,wilds,beasts,disease,and); add-token(3,strife,badlands,or);|
|Gain Power Card|Gain a Power Card|gain-power-card|||
|Repeating Growth Options|Repeat Growth Options|^x|Added to other growth options. x is the number of repeats. As seen on Fractured Days|gain-power-card^2; gain-energy(2)^3|
|Discarding Cards|Discard 2 Power Cards|discard-cards|As seen on Downpour||
||Discard 1 Power Card|discard-card|||
|Gain Card Play|Gain 1 Card Play|gain-card-play|Gain +1 Card Play|Volcano, Finder: gain-card-play|
||Gain Card Plays|gain-card-play(x)|Gain +x Card Plays||
|Forget Power Card|Forget a Power Card|forget-power-card|||
|Ignore Range |Ignore Range this Turn|ignore-range|Ignore Range this turn (as seen on Finder)||
|Gain Range |Gain Range this Turn|gain-range(x)|Gain x range for Powers this turn|gain-range(1)|
||Gain Range this Turn for...|gain-range(x,y)|Gain x range for y effects (powers, power cards, innate powers, everything) this turn|gain-range(2,powers)|
|Isolate|Isolate one of your Lands|isolate|Isolate one of your Lands||
||Isolate a land at Range|isolate(x)|Isolate a land at x Range||
|Destroy Presence|Destroy a Presence|destroy-presence|||
|Gaining Fear|Gain Fear|fear(x)|Gain x Fear||
||Gain Fear per Element|fear(x)|Gain 1 Fear per Element x||
||Gain Fear per Element plus Flat Fear|fear(x,y)|Gain x Fear plus 1 Fear per Element y||
||Gain Fear per Custom Item|fear(text,*your_text_here*)|Gain 1 Fear per condition of your choosing. Icon will be a !!!.|fear(text,for each of your blighted lands)|
||Gain Fear per Custom Item Plus Flat Fear|fear(x,text,*your_text_here*)|Gain x Fear plus 1 Fear per condition of your choosing. Icon will be a !!!.||
|Deal Damage|Damage at Range|damage(x,y)|At range x, deal y Damage|Starlight: damage(0,2)|
||Deal 1 or 2 Damage in your Lands|damage-1, damage-2|Deals 1 or 2 Damage in one of your Lands||
|Make a Power Fast|Make a Power Fast|make-fast|One of your Powers may be Fast||
|Custom|Custom Text with !!! Icon|custom(*your_text_here*)|A custom growth option with the image !!!||
||Custom Text with Any Icon|custom(*your_text_here*,x,...)|A custom growth option with the x icon of your choice (ie. town, dahan, element, etc). Can use more than 1 icon and they will appear in a row.|custom(Deal 1 Damage in each of your Sacred Sites,sacred-site,damage-1)|
||Custom Text with Text In Place of Icons|custom(*your_text_here*,text,x)|A custom growth option with the your custom text x in place of an icon.||
|**OR** Growth Options|Allows pair of two growth options|or(x,y)|x and y are growth options (like the ones above)|Fractured Days's growth: or(gain-1-time^2,gain-card-play(2))|
|Presence Track Node|Puts the growth option inside a presence track ring|presence-node(x)|x is a growth option (like the ones above)|presence-node(reclaim-one)|
</details>

[Home](#index)

### Presence Tracks
The two presence tracks (energy & plays) are filled out here, with options for special tracks (such as Serpent or Finder. See 'middle' in Supported Presence Track Options).
  - Node boxes: Each text box represents the effect of one node. See 'Supported Presence Track Options'. In most cases, icon brackets {} are NOT needed in Presence Track nodes (custom is the exception).
  - Add Node: Adds a node on the right side of the track.
  - Remove Node: Removes the right-most node of the track.

#### Supported Presence Track Options
<details>
  <summary>Expand for Supported Presence Track Options</summary>

|Presence Track Effect|Usage|Details|Examples|
|------|------|------|----|
|Energy/Turn or Card Plays|Integer 1,2,3,4,5,6,7 etc.|Number will become Energy/Turn in energy track and Card Plays in the card play track|River cardplay track: 1,2,2,3,reclaim-one,4,5|
||For Energy, +1,-2,+3 etc.|Will modify energy gain instead of flat energy gain (think Finder)|Finder 'top row': 0,sun,2+water,**+2**,+1+any|
|Elements|sun,moon,fire,air,water,earth,plant,animal|Can be used in combinations|Thunderspeaker energy track: 1,air,2,fire,sun,3|
||any, star|'any' is any element, 'star' is the Element icon from Starlight||
|Element Markers|markerplus, markerminus|Gain or pay element markers|Shifting Memory energy track: 0,1,2,3+markerplus,4,reclaim-one,5,6+markerplus<br>Shifting Memory plays track: 1,2,2,markerminus+markerminus+gain-card-play,3|
|Reclaim One|reclaim-one|Reclaim one card, can be used in combinations|River cardplay track: 1,2,2,3,reclaim-one,4,5|
|Combinations|separate with a '+'|Can include energy, cardplays, markers, move-presence, gain-range, reclaim one, and custom. Can be more than 2 things.|Stone's cardplay track: 1,earth,earth,earth+reclaim-one,earth+any,2+earth|
|Push/Gather|push(x), gather(x)|Push or Gather x from/into one of your Lands. x can be most token/entities (explorer, wilds, presence, etc).|Trickster's cardplay track: 2,push(dahan),3,3,4,air,5|
||push(x;y)|Push x or y from one of your Lands. Could do z but its not recommended. Gather not implemented.|Finder's bottom track: push(town;city)|
|Isolate|isolate|Isolate one of your Lands.|Custom cardplay track: 1,2,isolate,3,3,4,5|
|Move a Presence|move-presence(x)|Move a presence x range, can be used in combinations.|Downpour cardplay track: 1,move-presence(1),water,2,move-presence(1),3|
|Pay 2 to Gain Power Card|gain-card-pay-2|Pay 2 Energy to Gain Power Card|Many Minds cardplay track: 1,2,gain-card-pay-2,3,3,4,5|
|Gain Card Play|gain-card-play|Gain an additional card play not in the normal way (think Stone or Finder)|Stone energy track: 2,3,gain-card-play^minor,4,gain-card-play^minor,6,gain-card-play^minor|
|Gain Range|gain-range(x)|Gain +x range||
||gain-range(x;y)|Gain +x range on "y"|range(1;everything)|
|Add Token|token(x)|Adds a token x to 1 of your lands||
|Notate with Icon (like Stone)|^x|Puts icon x in top left corner of presence node|Stone top row: 2,3,gain-card-play^minor,4,gain-card-play^minor,6,gain-card-play^minor|
|Notate with Energy (like Starlight)|^energy(x)|Puts an energy icon in the top left with value x (can be negative, use + to show +). Recommended to use with custom|custom(Pay 2 Energy to Gain a Card Play,gain-card-play)^energy(-2)|
|Forget Power|forget-power-card|Forget a power card. Unlikely to be useful because presence track actions are optional|Custom energy track: 1,3+forget-power-card,5+forget-power-card,7+forget-power-card|
|Custom|custom(*your_text*)|Add custom text to the presence node. Image will be !!!.|Custom energy track: 1,2,custom(Draw 1 Minor Power),3,water,4|
||custom(*your_text*;{x})|Add custom text to the presence node. x is an icon(s) and/or text. Note the semicolon.|Custom energy track: 1,2,custom(Destroy 1 Town or City;{town}/{city}),3,water,4|
|Middle Nodes|middle(wrap other node options)|Wrap your presence node options in middle() to have them appear in the middle of the tracks. Only do this to energy track nodes.|Serpent energy track: 1,fire,any,reclaim-one,**middle(earth)**,6,any,12|

</details>

[Home](#index)

### Innate Powers
  - Power Name: The name of the Innate Power
  - Remove Innate Power: Permanently deletes the Innate Power
  - Fast/Slow: Toggles the Speed of the Power
  - Range: The range of the innate. Uses special syntax:
    - For no range (such as Spirit targeting powers), type "none".
    - For range, use an icon (if needed) + an integer separated by a comma. Examples:
      - 0
      - 1
      - sacred-site,2
      - wetland-presence,1
  - Target: The target of the innate. Unlike Range, this uses the same HTML code as the rest of the template, so you can use any icons and the shorthand syntax (ie. {dahan}).
  - Target Land/Target: Toggle between Target Land (for land targetting powers) and Target (for Powers that target spirits, etc).
  - Note (optional): Allows adding notes to the top of the innate (See Volcano Looming High or Lure of the Deep Wilderness as an example). Use [{icon shortcuts}](#general-icons) here (such as {dahan}).
  - Add Level: Adds a Thershold Level to the Innate Power.
    - Threshold: Contains the threshold informatioin. Can include:
      - Elements: 1-plant,2-fire
      - Icons: 2-wilds
      - Energy Costs: cost-2
        - Example: Volcano: 3-fire,cost-2 or Many Minds: 1-air,2-animal,2-beasts
      - Other Cost w/ custom icon: cost(custom1)-1 or cost(dahan)-2. Icon will appear with '-x' where x is the number you use.
        - Example: Spreading Rot: 2-moon,3-water,2-animal,2-cost(custom1)
      - Or: As seen on Trickster
        - Example: Trickster: 3-sun,OR,3-fire
  - Long: Allows the level text to spill into the second column (like Volcano's first Innate Power, last threshold). Use only when appropriate.
  - Effect: The effect of the power at that threshold level. Use {icons} freely here.
    - To achieve 'for each element' effects, use the notation {element, #}.
    - Example: Serpent's Second Innate, Second Level: For each ***{moon,2} {earth,2}***, 2 {fear} and push 1 {town}.
  - Add Innate Power: Adds another Innate Power. You can add more than 2... but it won't be pretty so don't do it.

[Home](#index)

### General Icons
Icons for invaders, elements, dahan, etc can be used by enclosing its name with "{}". For example, {dahan} or {fire}. Here is a list of what is available:
- Elements (fire, water, earth, air, plant, animal, sun, moon)
	- any: the Any element icon
	- star: the Element icon (from Starlight)
	- markerplus, markerminus: the Prepare Element Marker and Discard Element Marker (from Shifting Memory)
- Invaders (explorer, town, city)  
- Presence (presence, sacred-site, no-presence, no-own-presence, destroyed-presence, move-presence-1, move-presence-2, move-presence-3, move-presence-4)  
- Island icons (blight, dahan, beasts, wilds, disease, strife, badlands)  
- Fear icons (fear, terror1, terror2, terror3)
- Land icons (sand, mountain, jungle, wetland, ocean, jungle-wetland, jungle-sand, sand-wetland, mountain-jungle, mountain-wetland, mountain-sand)  
- Power icons (fast, slow, minor, major, spirit, or)
- Range icons (range, range-0, range-1, range-2, range-3, range-4, jungle-presence, sand-presence, mountain-presence, wetland-presence)
- Targeting icons (spirit)  
- Power effect icon (isolate, gain-range-1, gain-range-2, gain-range-3, gain-range-x)
- Growth icons (see [Growth](#growth) section and [Supported Growth Actions](#supported-growth-actions) for examples)
- Presence track icons (see [Presence Track](#presence-tracks) section for examples)

[Home](#index)

### Tips and Tricks
- The template uses html so you can use some html to customize your board:
  - For example, you can create a line break by typing <br> (useful in notes, levels, and special rules).
