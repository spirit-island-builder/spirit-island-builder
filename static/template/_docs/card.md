# Cards

The fastest way to get started is to start from the examples in the file "\_examples/card/card-front.html".

### Shorthand Syntax for Icons

The card template uses the shorthand syntax for icons. For example, you can use {dahan} for the dahan symbol. See the full list [here](board_front.md#general-icons).

### Custom Attributes

The quick-card template use a lot of custom attributes, here is a quick summary:

- quick-card: Represent one card. It accepts the following attributes
  - speed: The speed of the card ('fast' or 'slow).
  - cost: The cost of the card
  - name: The name of the card (text will scale to fit the name area)
  - image: The image of the card
  - elements: The elements that appear on the side of the card. Separate each element by a ","
  - range: The range of the card.
    - For no range, type "none".
    - For range, use an icon (if needed) and an integer separated by a comma. Examples:
      - 0
      - 1
      - sacred-site,2
      - wetland-presence,1
  - target: The target of the card. It accepts html code. Refer to the [board read-me](board_front.md#general-icons) for the syntax.
  - target-title: The target header (either TARGET LAND or TARGET. If empty, autoamtically uses TARGET LAND).
  - artist-name: The name of the artist.
  - print-friendly: The only valid value is "yes". It helps to see the elements when you print the cards in black & white.
- rules: The effects of your power. You can type whatever you like and use icon shortcuts (like {dahan}).
  - {or} will create the 'or' split
- threshold: Can use a shorthand syntax with the condition attribute.
  - condition: The threshold condition. It is a list of condition separated by comma. Here are some examples:
    - "3-animal"
    - "2-sun,2-water"
    - "3-air,4-water,3-earth"
  - text: Changes the threshold text from the default "IF YOU HAVE" to whatever you want.
  - text = "IF YOU PLAYED NO OTHER CARDS THIS TURN"
  - example: \<threshold text='custom card text' condition="3-animal,2-moon"\>
