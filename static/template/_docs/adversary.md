# Adversary

The fastest way to get started is to start from the example template in the folder adversary/example. The adversary quick template should be fairly self explanatory. Icon shortcuts (such as {dahan} or {presence}) are available for use. See [here](board_front.md#general-icons) for details.

### Custom HTML Tag

The adversary template use a lot of custom HTML tags, here is a quick summary:

- advesary: Represent the whole adversary.
  - adversary-title: The name of the adversary.
  - img class="flag": The flag of the adversary.
  - top-info: The container for the loss condition and escalation
    - loss-condition: The container for the loss condition.
      - section-title: Name of the loss condition
      - div: Information about the loss conditon
    - escalation: The container for the escalation
      - section-title: Name of the escalation
      - div: Information about the escalation
  - adversary-levels: The container for the adversary levels
    - header: The container for the titles of the adversary levels "table"
      - div: One of the title
    - level: The container for one level
      - div: Information about the level
