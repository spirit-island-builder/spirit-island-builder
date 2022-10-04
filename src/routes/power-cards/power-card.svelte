<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?

  export let powerCards;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  export let showOrHideSection;

  const validAutoCompleteValues = [
    { label: "air", value: "air" },
    { label: "animal", value: "animal" },
    { label: "any", value: "any" },
    { label: "badlands", value: "badlands" },
    { label: "beasts", value: "beasts" },
    { label: "blight", value: "blight" },
    { label: "city", value: "city" },
    { label: "dahan", value: "dahan" },
    { label: "destroyed-presence", value: "destroyed-presence" },
    { label: "disease", value: "disease" },
    { label: "earth", value: "earth" },
    { label: "explorer", value: "explorer" },
    { label: "fast", value: "fast" },
    { label: "fear", value: "fear" },
    { label: "fire", value: "fire" },
    { label: "gain-range-1", value: "gain-range-1" },
    { label: "gain-range-2", value: "gain-range-2" },
    { label: "gain-range-3", value: "gain-range-3" },
    { label: "gain-range-x", value: "gain-range-x" },
    { label: "isolate", value: "isolate" },
    { label: "jungle", value: "jungle" },
    { label: "jungle-presence", value: "jungle-presence" },
    { label: "jungle-sand", value: "jungle-sand" },
    { label: "jungle-wetland", value: "jungle-wetland" },
    { label: "major", value: "major" },
    { label: "markerminus", value: "markerminus" },
    { label: "markerplus", value: "markerplus" },
    { label: "minor", value: "minor" },
    { label: "moon", value: "moon" },
    { label: "mountain", value: "mountain" },
    { label: "mountain-jungle", value: "mountain-jungle" },
    { label: "mountain-presence", value: "mountain-presence" },
    { label: "mountain-sand", value: "mountain-sand" },
    { label: "mountain-wetland", value: "mountain-wetland" },
    { label: "move-presence-1", value: "move-presence-1" },
    { label: "move-presence-2", value: "move-presence-2" },
    { label: "move-presence-3", value: "move-presence-3" },
    { label: "move-presence-4", value: "move-presence-4" },
    { label: "no-own-presence", value: "no-own-presence" },
    { label: "no-presence", value: "no-presence" },
    { label: "ocean", value: "ocean" },
    { label: "or", value: "or" },
    { label: "plant", value: "plant" },
    { label: "presence", value: "presence" },
    { label: "range", value: "range" },
    { label: "range-0", value: "range-0" },
    { label: "range-1", value: "range-1" },
    { label: "range-2", value: "range-2" },
    { label: "range-3", value: "range-3" },
    { label: "range-4", value: "range-4" },
    { label: "sacred-site", value: "sacred-site" },
    { label: "sand", value: "sand" },
    { label: "sand-presence", value: "sand-presence" },
    { label: "sand-wetland", value: "sand-wetland" },
    { label: "slow", value: "slow" },
    { label: "spirit", value: "spirit" },
    { label: "spirit", value: "spirit" },
    { label: "star", value: "star" },
    { label: "strife", value: "strife" },
    { label: "sun", value: "sun" },
    { label: "terror1", value: "terror1" },
    { label: "terror2", value: "terror2" },
    { label: "terror3", value: "terror3" },
    { label: "town", value: "town" },
    { label: "water", value: "water" },
    { label: "wetland", value: "wetland" },
    { label: "wetland-presence", value: "wetland-presence" },
    { label: "wilds", value: "wilds" },
  ];

  function handleImageFileInput(event, card) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;
        card.cardImage = imageURL;
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }

  function setSpeedTextbox(powerSpeed, card) {
    card.speed = powerSpeed;
    powerCards = powerCards;
  }

  function setTargetTextbox(targetTitle, card) {
    card.targetTitle = targetTitle;
    powerCards = powerCards;
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

  function activateElement(event, card) {
    card.powerElements[event.target.id] = !card.powerElements[event.target.id];
    if (!event.target.classList.contains("is-active")) {
      event.target.classList.add("is-active");
    } else {
      event.target.classList.remove("is-active");
    }
  }

  function showOrHideSectionSubsection(card) {
    card.isVisible = !card.isVisible;
    powerCards = powerCards;
  }
</script>

<div class="is-flex is-flex-direction-column is-flex-wrap-nowrap mb-0">
  <div class="field has-addons mr-3 ml-1">
    <label class="label is-unselectable mr-1" for="">Spirit Name: </label>
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
  <h6
    on:click={showOrHideSectionSubsection(card)}
    class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
    id="form">
    {`Power Card ${i + 1}: ${card.name}`}
    <span on:click={showOrHideSectionSubsection(card)}>
      {#if card.isVisible}
        <ion-icon
          id="form"
          on:click={showOrHideSectionSubsection(card)}
          name="chevron-down-outline" />
      {:else}
        <ion-icon
          id="form"
          on:click={showOrHideSectionSubsection(card)}
          name="chevron-up-outline" />
      {/if}
    </span>
  </h6>
  {#if card.isVisible}
    <div class="field mt-2">
      <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
        >{`Power Card ${i + 1}`}</label>
      <div class="is-flex is-flex-direction-row">
        <div class="control" style="width:100%">
          <input
            id={`powerName${i}`}
            class="input"
            type="text"
            tabindex="1"
            placeholder="Power Name"
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
            id={`powerCost${i}`}
            class="input"
            style="width:3rem; text-align:center;"
            type="text"
            tabindex="1"
            placeholder="Cost"
            bind:value={card.cost} />
        </div>
      </div>
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Elements: </label>
        <div
          class="img-elements"
          class:is-active={card.powerElements.sun}
          id="sun"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_sun.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.moon}
          id="moon"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_moon.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.fire}
          id="fire"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_fire.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.air}
          id="air"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_air.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.water}
          id="water"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_water.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.earth}
          id="earth"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_earth.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.plant}
          id="plant"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_plant.png')" />
        <div
          class="img-elements"
          class:is-active={card.powerElements.animal}
          id="animal"
          on:click={(e) => activateElement(e, card)}
          style="background-image: url('/template/_global/images/board/element_simple_animal.png')" />
      </div>
    </div>
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          {#if card.speed == ""}
            <button
              class="button is-danger is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", card)}>Fast</button>
            <button
              class="button is-info is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", card)}>Slow</button>
          {:else if card.speed == "Fast" || card.speed == "fast"}
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
            id={`powerRange${i}`}
            class="input"
            type="text"
            tabindex="1"
            placeholder="Range"
            bind:value={card.range} />
        </div>
        <label class="label is-unselectable" for="">Range</label>
      </div>
      <div class="is-flex is-flex-direction-column-reverse is-flex-wrap-nowrap">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          <div class="control">
            <input
              id={`powerTarget${i}`}
              class="input"
              type="text"
              tabindex="1"
              placeholder="Target"
              bind:value={card.target} />
          </div>
        </div>
        <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
          <label class="label is-unselectable mr-1 mb-0 pt-2" for="">Target</label>
          <div
            class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0 is-align-items-flex-end">
            {#if card.targetTitle == ""}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", card)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", card)}>Target</button>
            {:else if card.targetTitle == "target" || card.targetTitle == "Target"}
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
        {validAutoCompleteValues}
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
            tabindex="1"
            placeholder="Elemental Conditions"
            bind:value={card.thresholdCondition} />
          <label class="label is-unselectable mr-2 mb-0 mt-1" style="min-width:7rem" for=""
            >Custom Text:</label>
          <input
            id={`powerCustomText${i}`}
            class="input is-small"
            type="text"
            tabindex="1"
            placeholder="use if an alternative to 'IF YOU HAVE' is desired"
            bind:value={card.thresholdText} />
        </div>
        <AutoComplete
          id={`cardRules${i}`}
          elementType="textarea"
          placeholder="Threshold Effect"
          {validAutoCompleteValues}
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
        <div class="control">
          <input
            id={`cardArtist${i}`}
            class="input is-small"
            type="text"
            tabindex="1"
            placeholder="Artist"
            bind:value={card.cardArtist} />
        </div>
        <div class="control">
          <input
            accept="image/png, image/jpeg"
            on:change={(e) => handleImageFileInput(e, card)}
            id={`cardArt${i}`}
            name="cardArt"
            type="file"
            class="input is-small" />
          {#if card.cardImage == ""}
            <img id="cardArtImage" src={card.cardImage} alt="power card art" />
          {/if}
        </div>
      </div>
    </div>
    <hr />
  {/if}
{/each}
<div class="pt-1">
  <button class="button is-primary is-light" on:click={addEmptyPowerCard}>Add Power Card</button>
</div>
