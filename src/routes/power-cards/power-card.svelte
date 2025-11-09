<script>
  export let powerCards;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import * as Lib from "../lib";
  // import {exportSinglePowerCard} from "./index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  export let exportSingleCard = () => {};
  export let additivePowerLoad = () => {};

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

  function clearSecondThreshold(card) {
    card.hasSecondThreshold = false;
    card.secondThreshold = "";
    card.secondThresholdCondition = "";
    powerCards = powerCards;
  }

  function clearThresholds(card) {
    clearThreshold(card);
    clearSecondThreshold(card);
  }

  function addThreshold(card) {
    card.hasThreshold = true;
    powerCards = powerCards;
  }

  function add2ndThreshold(card) {
    card.hasSecondThreshold = true;
    powerCards = powerCards;
  }

  function removePowerCard(powerIndex) {
    if (window.confirm("Are you sure? Removing: " + powerCards.cards[powerIndex].name)) {
      powerCards.cards.splice(powerIndex, 1);
      powerCards.cards.forEach((power, i) => {
        power.id = i;
      });
      powerCards = powerCards;
      document.getElementById("updateButton").click();
    }
  }

  function toggleElement(card, element) {
    //modify form
    card.powerElements[element] = !card.powerElements[element];
    powerCards = powerCards;

    //modify template
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let templateCard = previewFrame.document.getElementById("card" + card.id);
    let elementsTemplate = templateCard.querySelectorAll(`element.${element}`)[0];
    console.log(elementsTemplate);

    if (card.powerElements[element]) {
      let newElement = previewFrame.document.createElement("element");
      newElement.classList.add(element);
      templateCard.append(newElement);
    } else {
      elementsTemplate.remove();
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
    document.getElementById("updateButton").click();
  }

  function updatePowerName(card, ID, type) {
    //effect
    let updatePowerCardData = card[type];
    if (updatePowerCardData) {
      let templatePowerCardData = "card" + ID + type;

      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findPowerCardTemplate = previewFrame.document.getElementById(templatePowerCardData);
      if (findPowerCardTemplate) {
        console.log("Rewriting " + templatePowerCardData + " with " + updatePowerCardData);

        // update node
        if (type === "range") {
          let rangeOutput = previewFrame.getRangeModel(updatePowerCardData);
          findPowerCardTemplate.innerHTML = previewFrame.replaceIcon(rangeOutput);
        } else if (type === "thresholdCondition") {
          let thresholdConditionOutput = previewFrame.getThresholdElements(updatePowerCardData);
          findPowerCardTemplate.innerHTML = "<span>" + thresholdConditionOutput + ":</span>";
        } else if (type === "rules") {
          findPowerCardTemplate.innerHTML = previewFrame.replaceIcon(
            previewFrame.getFormatRulesText(updatePowerCardData)
          );
          previewFrame.resize();
        } else if (type === "threshold") {
          let thresholdCondition =
            findPowerCardTemplate.getElementsByTagName("threshold-condition")[0];
          findPowerCardTemplate.innerHTML = previewFrame.replaceIcon(
            previewFrame.getFormatRulesText(updatePowerCardData)
          );
          if (thresholdCondition) {
            findPowerCardTemplate.insertBefore(
              thresholdCondition,
              findPowerCardTemplate.firstChild
            );
          }
          previewFrame.resize();
        } else {
          findPowerCardTemplate.innerHTML = previewFrame.replaceIcon(updatePowerCardData);
        }
      }
    }
  }

  function updateCustomThresholdText(card, ID, type) {
    let updatePowerCardData = card[type];
    let templatePowerCardData = "card" + ID + "threshold";
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let findPowerCardTemplate = previewFrame.document.getElementById(templatePowerCardData);
    if (updatePowerCardData) {
      // Find node in Template
      if (findPowerCardTemplate) {
        console.log("Rewriting " + templatePowerCardData + " with " + updatePowerCardData);
        // update node
        findPowerCardTemplate.setAttribute("data-before", updatePowerCardData);
      }
    } else {
      findPowerCardTemplate.classList.remove("threshold-custom");
      findPowerCardTemplate.setAttribute("data-before", "");
    }
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    Lib.selectNode(event);
  }

  function setType(type, card) {
    card.type = type;
    powerCards = powerCards;
    document.getElementById("updateButton").click();
  }

  function saveSingleCard(card) {
    let powerCardsJSONCopy = JSON.parse(JSON.stringify(powerCards));
    powerCardsJSONCopy.cards.splice(0, powerCardsJSONCopy.cards.length);
    powerCardsJSONCopy.cards = powerCards.cards.filter((mycard) => mycard.id === card.id);
    exportSingleCard(powerCardsJSONCopy);
  }

  const elements = ["sun", "moon", "fire", "air", "water", "earth", "plant", "animal"];
</script>

<div class="is-power-cards">
  {#each powerCards.cards as card, i (card.id)}
    <Section title={`Power Card ${i + 1}: ${card.name}`} bind:isVisible={card.isVisible}>
      <div class="field mt-2">
        <div class="is-flex is-flex-direction-row is-justify-content-space-between">
          <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
            >{`Power Card ${i + 1}`}</label>
          <div class="is-flex">
            <button class="button is-small is-success is-light mb-0" on:click={saveSingleCard(card)}
              >Save Single Card</button>
            <button
              class="button is-primary is-light is-warning is-small"
              on:click={removePowerCard(i)}>Remove Power Card</button>
          </div>
        </div>
        <div class="is-flex is-flex-direction-row">
          <div class="control" style="width:100%">
            <input
              id={`cardName${i}`}
              class="input"
              type="text"
              placeholder="Power Name"
              on:blur={updatePowerName(card, i, "name")}
              on:keydown={nextNode}
              on:focus={selectNode}
              bind:value={card.name} />
          </div>
        </div>
      </div>

      <div class="field has-addons mb-0">
        <div class="field has-addons is-align-items-center mr-2 mb-0">
          <label class="label is-unselectable mr-1 mt-1" for="">Cost: </label>
          <div class="control">
            <input
              id={`cardCost${i}`}
              class="input is-small"
              style="width:3rem; text-align:center;"
              type="text"
              placeholder="Cost"
              on:blur={updatePowerName(card, i, "cost")}
              on:keydown={nextNode}
              on:focus={selectNode}
              bind:value={card.cost} />
          </div>
        </div>
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          <button
            class:is-light={card.type !== "unique"}
            class="button is-danger is-small is-light button-hold mb-0"
            on:click={setType("unique", card)}>Unique</button>
          <button
            class:is-light={card.type !== "minor"}
            class="button is-warning is-small is-light button-hold mb-0"
            on:click={setType("minor", card)}>Minor</button>
          <button
            class:is-light={card.type !== "major"}
            class="button is-info is-small is-light button-hold mb-0"
            on:click={setType("major", card)}>Major</button>
          <button
            class:is-light={card.type !== "aspect"}
            class="button is-success is-small is-light button-hold mb-0"
            on:click={setType("aspect", card)}>Aspect</button>
        </div>
      </div>
      {#if card.type === "aspect"}
        <div class="field has-addons mr-2">
          <label class="label is-unselectable mr-1 mt-1" for={`aspectSubtitle${i}`}
            >Aspect Subtitle:
          </label>
          <div class="control">
            <input
              id={`aspectSubtitle${i}`}
              class="input is-small"
              style="text-align:center;"
              type="text"
              placeholder="ie. Sparking (2 of 2)"
              on:keydown={nextNode}
              on:focus={selectNode}
              bind:value={card.aspectSubtitle} />
          </div>
        </div>
      {/if}
      <div class="field has-addons mb-0">
        <div class="field has-addons">
          <label class="label is-unselectable mr-1 mt-1" for="">Elements: </label>
          {#each elements as element}
            <button
              class="element-toggle"
              aria-pressed={card.powerElements[element]}
              on:click={toggleElement(card, element)}>
              <img
                src="/template/_global/images/board/element_simple_{element}.png"
                alt={element} />
            </button>
          {/each}
        </div>
      </div>
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
        <div class="is-flex is-flex-direction-column-reverse">
          <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
            {#if card.speed === ""}
              <button
                class="button is-small is-danger is-light button-hold mb-0"
                id="fast-button"
                on:click={setSpeedTextbox("Fast", card)}>Fast</button>
              <button
                class="button is-small is-info is-light button-hold mb-0"
                id="slow-button"
                on:click={setSpeedTextbox("Slow", card)}>Slow</button>
            {:else if card.speed === "Fast" || card.speed === "fast"}
              <button
                class="button is-small is-danger button-hold mb-0"
                id="fast-button"
                on:click={setSpeedTextbox("Fast", card)}>Fast</button>
              <button
                class="button is-small is-info is-light button-hold mb-0"
                id="slow-button"
                on:click={setSpeedTextbox("Slow", card)}>Slow</button>
            {:else}
              <button
                class="button is-small is-danger is-light button-hold mb-0"
                id="fast-button"
                on:click={setSpeedTextbox("Fast", card)}>Fast</button>
              <button
                class="button is-small is-info button-hold mb-0"
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
              class="input is-small"
              type="text"
              placeholder="Range"
              on:keydown={nextNode}
              on:blur={updatePowerName(card, i, "range")}
              on:focus={selectNode}
              bind:value={card.range} />
          </div>
          <label class="label is-unselectable" for="">Range</label>
        </div>
        <div class="is-flex is-flex-direction-column-reverse is-flex-wrap-nowrap">
          <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
            <div class="control" style="width: 100%;">
              <AutoComplete
                id={`cardTarget${i}`}
                elementType="input"
                placeholder="Target"
                classNames="is-small"
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
          classNames="is-small"
          validAutoCompleteValues={iconValuesSorted}
          additionalOnBlurFunction={() => updatePowerName(card, i, "rules")}
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
              on:blur={updatePowerName(card, i, "thresholdCondition")}
              on:keydown={nextNode}
              bind:value={card.thresholdCondition} />
            <label class="label is-unselectable mr-2 mb-0 mt-1" style="min-width:7rem" for=""
              >Custom Text:</label>
            <input
              id={`powerCustomText${i}`}
              class="input is-small"
              type="text"
              placeholder="use if an alternative to 'IF YOU HAVE' is desired"
              on:blur={updateCustomThresholdText(card, i, "thresholdText")}
              bind:value={card.thresholdText} />
          </div>
          <AutoComplete
            id={`cardThreshold${i}`}
            elementType="textarea"
            placeholder="Threshold Effect"
            classNames="is-small"
            validAutoCompleteValues={iconValuesSorted}
            additionalOnBlurFunction={() => updatePowerName(card, i, "threshold")}
            bind:value={card.threshold} />
          {#if card.hasSecondThreshold}
            <div class="field has-addons is-flex mr-2 mb-0">
              <label class="label is-unselectable mr-2 mb-0 mt-1" for="">2nd Threshold:</label>
              <input
                id={`power2ndThresholdCondition${i}`}
                class="input is-small mr-3"
                style="width:35%"
                type="text"
                placeholder="Elemental Conditions"
                on:blur={updatePowerName(card, i, "thresholdCondition")}
                bind:value={card.secondThresholdCondition} />
              <button
                class="button is-warning is-light is-small mb-0"
                on:click={clearSecondThreshold(card)}>Remove Second Threshold</button>
            </div>
            <AutoComplete
              id={`cardRules${i}`}
              elementType="textarea"
              placeholder="Threshold Effect"
              classNames="is-small"
              validAutoCompleteValues={iconValuesSorted}
              additionalOnBlurFunction={() => updatePowerName(card, i, "threshold")}
              bind:value={card.secondThreshold} />
            <button
              class="button is-warning is-light is-small mb-0"
              on:click={clearThresholds(card)}>Clear Power Thresholds (both)</button>
          {:else}
            <div class="is-flex is-justify-content-space-between">
              <button
                class="button is-small is-success is-light mb-0"
                on:click={add2ndThreshold(card)}>Add Second Threshold</button>
              <button
                class="button is-small is-warning is-light mb-0"
                on:click={clearThreshold(card)}>Clear Power Threshold</button>
            </div>
          {/if}
        {:else}
          <button class="button is-success is-light mb-0" on:click={addThreshold(card)}
            >Add Power Threshold</button>
        {/if}
      </div>
      <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap">
        <div class="field has-addons mr-2 ml-1">
          <ImageInput
            id="cardArt{i}"
            title="Card Art:&nbsp;"
            includeInfo
            info="art ratio 4x3"
            bind:imageURL={card.cardImage} />
          <label class="label is-unselectable mr-1" for="">Artist: </label>
          <div class="control mr-2">
            <input
              id={`cardArtist${i}`}
              class="input is-small"
              type="text"
              placeholder="Artist"
              bind:value={card.cardArtist} />
          </div>
        </div>
      </div>
      <hr />
    </Section>
  {/each}
</div>
<div class="mb-1 mt-1 is-flex is-justify-content-right">
  <LoadButton
    accept=".html"
    hovertext="Loads additional power cards into current set"
    class="button is-primary is-light is-small"
    loadObjectURL={additivePowerLoad}>
    Additive Load
  </LoadButton>
  <button class="button is-small is-success is-light" on:click={addEmptyPowerCard}
    >Add Power Card</button>
</div>
<Section
  title={`Card Back Image & Spirit/Set Name`}
  bind:isVisible={powerCards.cardBackImageIsVisible}>
  <ImageInput
    id="powerCardBack"
    title="Power Card Back Art"
    bind:imageURL={powerCards.cardBackImage} />
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
</Section>

<style>
  .element-toggle {
    width: 40px;
    height: 40px;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
  }
  .element-toggle img {
    display: block;
    margin: auto;
    width: 35px;
  }
  .element-toggle[aria-pressed="false"] img {
    filter: opacity(0.2);
  }
  div.field {
    margin-bottom: 0px;
  }
</style>
