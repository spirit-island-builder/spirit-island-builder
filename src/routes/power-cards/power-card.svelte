<script>
  export let powerCards;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import * as Lib from "../lib";

  function setSpeedTextbox(powerSpeed, card) {
    card.speed = powerSpeed;
    powerCards = powerCards;

    //update tempalte
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let templateCard = previewFrame.document.getElementById("card" + card.id);
    templateCard.removeAttribute("class");
    templateCard.setAttribute("class", powerSpeed.toLowerCase());
  }

  function setTargetTextbox(targetTitle, card) {
    card.targetTitle = targetTitle;
    powerCards = powerCards;

    //update tempalte
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let templateCard = previewFrame.document.getElementById("card" + card.id + "targettitle");
    templateCard.innerHTML = targetTitle;
  }

  function clearThreshold(card) {
    card.hasThreshold = false;
    card.threshold = "";
    card.thresholdCondition = "";
    card.thresholdText = "";
    powerCards = powerCards;
  }

  function addThreshold(card) {
    card.hasThreshold = true;
    powerCards = powerCards;
  }

  function removePowerCard(powerIndex) {
    powerCards.cards.splice(powerIndex, 1);
    powerCards.cards.forEach((power, i) => {
      power.id = i;
    });
    powerCards = powerCards;
  }

  function toggleElement(card, element) {
    //modify form
    card.powerElements[element] = !card.powerElements[element];
    powerCards = powerCards;

    //modify template
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let templateCard = previewFrame.document.getElementById("card" + card.id);
    let elementsTemplate = templateCard.getElementsByClassName(element);

    if (card.powerElements[element]) {
      let newElement = previewFrame.document.createElement("element");
      newElement.classList.add(element);
      templateCard.append(newElement);
    } else {
      elementsTemplate[0].remove();
    }
  }

  function addEmptyPowerCard() {
    powerCards.cards.push({
      id: powerCards.cards.length,
      name: "",
      speed: "fast",
      cost: "",
      cardImage: "",
      powerElements: {
        air: false,
        sun: false,
        moon: false,
        water: false,
        fire: false,
        earth: false,
        plant: false,
        animal: false,
      },
      range: "",
      target: "",
      targetTitle: "target land",
      rules: "",
      hasThreshold: false,
      threshold: "",
      thresholdCondition: "",
      thresholdText: "",
    });

    powerCards = powerCards;
  }

  function updatePowerName(card, ID, type) {
    //effect
    let updatePowerCardData = card[type];
    if (updatePowerCardData) {
      let templatePowerCardData = "card" + ID + type;
      console.log(updatePowerCardData);
      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findPowerCardTemplate = previewFrame.document.getElementById(templatePowerCardData);
      if (findPowerCardTemplate) {
        console.log("Rewriting " + templatePowerCardData + " with " + updatePowerCardData);

        // update node
        if (type === "range") {
          let rangeOutput = previewFrame.getRangeModel(updatePowerCardData);
          findPowerCardTemplate.innerHTML = previewFrame.replaceIcon(rangeOutput);
        } else if (type === "rules") {
          //let rangeOutput = previewFrame.getRangeModel(updatePowerCardData)
        } else {
          findPowerCardTemplate.innerHTML = previewFrame.replaceIcon(updatePowerCardData);
        }
      }
    }
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  const elements = ["sun", "moon", "fire", "air", "water", "earth", "plant", "animal"];
</script>

<div class="is-flex is-flex-direction-column is-flex-wrap-nowrap mb-0">
  <div class="field has-addons mr-3 ml-1">
    <label class="label is-unselectable mr-1" for="">Spirit or Card Set Name: </label>
    <div class="control">
      <input
        id="spiritNameInput"
        class="input is-small"
        type="text"
        style="min-width:20rem"
        placeholder="optional - for output only"
        bind:value={powerCards.spiritName} />
    </div>
  </div>
</div>
{#each powerCards.cards as card, i (card.id)}
  <Section title={`Power Card ${i + 1}: ${card.name}`} bind:isVisible={card.isVisible}>
    <div class="field mt-2">
      <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
        >{`Power Card ${i + 1}`}</label>
      <div class="is-flex is-flex-direction-row">
        <div class="control" style="width:100%">
          <input
            id={`cardName${i}`}
            class="input"
            type="text"
            placeholder="Power Name"
            on:blur={updatePowerName(card, i, "name")}
            on:keyup={nextNode}
            bind:value={card.name} />
        </div>
        <button class="button is-primary is-light is-warning" on:click={removePowerCard(i)}
          >Remove Power Card</button>
      </div>
    </div>
    <div class="field has-addons mt-2 mb-0">
      <div class="field has-addons mr-2">
        <label class="label is-unselectable mr-1 mt-1" for="">Cost: </label>
        <div class="control">
          <input
            id={`cardCost${i}`}
            class="input"
            style="width:3rem; text-align:center;"
            type="text"
            placeholder="Cost"
            on:blur={updatePowerName(card, i, "cost")}
            on:keyup={nextNode}
            bind:value={card.cost} />
        </div>
      </div>
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Elements: </label>
        {#each elements as element}
          <button
            class="element-toggle"
            aria-pressed={card.powerElements[element]}
            on:click={toggleElement(card, element)}>
            <img src="/template/_global/images/board/element_simple_{element}.png" alt={element} />
          </button>
        {/each}
      </div>
    </div>
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          {#if card.speed === ""}
            <button
              class="button is-danger is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", card)}>Fast</button>
            <button
              class="button is-info is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", card)}>Slow</button>
          {:else if card.speed === "Fast" || card.speed === "fast"}
            <button
              class="button is-danger button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", card)}>Fast</button>
            <button
              class="button is-info is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", card)}>Slow</button>
          {:else}
            <button
              class="button is-danger is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", card)}>Fast</button>
            <button
              class="button is-info button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", card)}>Slow</button>
          {/if}
        </div>
        <label class="label is-unselectable" for="">Speed</label>
      </div>
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="control">
          <input
            id={`cardRange${i}`}
            class="input"
            type="text"
            placeholder="Range"
            on:keyup={nextNode}
            on:blur={updatePowerName(card, i, "range")}
            bind:value={card.range} />
        </div>
        <label class="label is-unselectable" for="">Range</label>
      </div>
      <div class="is-flex is-flex-direction-column-reverse is-flex-wrap-nowrap">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          <div class="control">
            <AutoComplete
              id={`cardTarget${i}`}
              elementType="input"
              placeholder="Target"
              validAutoCompleteValues={iconValuesSorted}
              additionalOnBlurFunction={() => updatePowerName(card, i, "target")}
              bind:value={card.target} />
          </div>
        </div>
        <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
          <label class="label is-unselectable mr-1 mb-0 pt-2" for="">Target</label>
          <div
            class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0 is-align-items-flex-end">
            {#if card.targetTitle === ""}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", card)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", card)}>Target</button>
            {:else if card.targetTitle === "target" || card.targetTitle === "Target"}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", card)}>Target Land</button>
              <button
                class="button is-success is-small mb-0"
                on:click={setTargetTextbox("Target", card)}>Target</button>
            {:else}
              <button
                class="button is-success is-small mb-0"
                on:click={setTargetTextbox("Target Land", card)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", card)}>Target</button>
            {/if}
          </div>
        </div>
      </div>
    </div>
    <div class="control">
      <AutoComplete
        id={`cardRules${i}`}
        elementType="textarea"
        placeholder="Rules"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={card.rules} />
    </div>
    <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap pb-2">
      {#if card.hasThreshold}
        <div class="field has-addons mr-2 mb-0">
          <label class="label is-unselectable mr-2 mb-0 mt-1" for="">Threshold:</label>
          <input
            id={`powerThresholdCondition${i}`}
            class="input is-small mr-3"
            style="width:35%"
            type="text"
            placeholder="Elemental Conditions"
            bind:value={card.thresholdCondition} />
          <label class="label is-unselectable mr-2 mb-0 mt-1" style="min-width:7rem" for=""
            >Custom Text:</label>
          <input
            id={`powerCustomText${i}`}
            class="input is-small"
            type="text"
            placeholder="use if an alternative to 'IF YOU HAVE' is desired"
            bind:value={card.thresholdText} />
        </div>
        <AutoComplete
          id={`cardRules${i}`}
          elementType="textarea"
          placeholder="Threshold Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={card.threshold} />
        <button class="button is-warning is-light mb-0" on:click={clearThreshold(card)}
          >Clear Power Threshold</button>
      {:else}
        <button class="button is-success is-light mb-0" on:click={addThreshold(card)}
          >Add Power Threshold</button>
      {/if}
    </div>
    <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap pb-4">
      <div class="field has-addons mr-2 ml-1">
        <label class="label is-unselectable mr-1" for="">Artist: </label>
        <div class="control mr-2">
          <input
            id={`cardArtist${i}`}
            class="input is-small"
            type="text"
            placeholder="Artist"
            bind:value={card.cardArtist} />
        </div>
        <ImageInput id="cardArt{i}" title="Card Art" bind:imageURL={card.cardImage} />
      </div>
    </div>
    <hr />
  </Section>
{/each}
<div class="pt-1 pb-2">
  <button class="button is-primary is-light" on:click={addEmptyPowerCard}>Add Power Card</button>
</div>

<style>
  .element-toggle {
    width: 40px;
    height: 40px;
    background: transparent;
    border: 0;
    padding: 0;
  }
  .element-toggle img {
    display: block;
    margin: auto;
    width: 35px;
  }
  .element-toggle[aria-pressed="false"] img {
    filter: opacity(0.2);
  }
</style>
