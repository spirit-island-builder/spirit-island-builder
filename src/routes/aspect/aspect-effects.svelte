<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import * as Lib from "../lib";

  export let aspect;
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

  function handleImageFileInput(event) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;
        aspect.nameImage.img = imageURL;
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }

  function addSpecialRule() {
    aspect.aspectEffects = Lib.addSpecialRule(aspect.aspectEffects);
    aspect = aspect;
  }

  function removeSpecialRule(index) {
    aspect.aspectEffects = Lib.removeSpecialRule(aspect.aspectEffects, index);
    aspect = aspect;
  }

  function setSpeedTextbox(powerSpeed, innatePower) {
    innatePower.speed = powerSpeed;
    aspect = aspect;
  }

  function setTargetTextbox(targetTitle, innatePower) {
    innatePower.targetTitle = targetTitle;
    aspect = aspect;
  }

  function removeLevel(powerIndex, levelIndex) {
    aspect.aspectEffects.innatePowers.powers[powerIndex].levels.splice(levelIndex, 1);
    aspect.aspectEffects.innatePowers.powers[powerIndex].levels.forEach((level, i) => {
      level.id = i;
    });
    aspect = aspect;
  }

  function addLevel(powerIndex) {
    aspect.aspectEffects = Lib.addLevel(aspect.aspectEffects, powerIndex);
  }

  function addInnatePower() {
    aspect.aspectEffects = Lib.addInnatePower(aspect.aspectEffects);
  }

  function removeInnatePower(powerIndex) {
    aspect.aspectEffects.innatePowers.powers.splice(powerIndex, 1);
    aspect.aspectEffects.innatePowers.powers.forEach((power, i) => {
      power.id = i;
    });
    aspect = aspect;
  }

  function switchLong(powerIndex, levelIndex) {
    aspect.aspectEffects.innatePowers.powers[powerIndex].levels[levelIndex].isLong =
      !aspect.aspectEffects.innatePowers.powers[powerIndex].levels[levelIndex].isLong;
  }

</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="aspectEffects">
  Aspect Effects
  <span on:click={showOrHideSection}>
    {#if aspect.aspectEffects.isVisible}
      <ion-icon id="aspectEffects" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="aspectEffects" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if aspect.aspectEffects.isVisible} 
<!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#spirit-board-lore-side"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>
  {#each aspect.aspectEffects.specialRules.rules as rule, i (rule.id)} 
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for={`ruleNameInput${i}`}
      >Special Rule {i + 1}
    </label>
    <div class="growth-action-container">
      <div class="control" style="width:100%">
        <input
          id={`ruleNameInput${i}`}
          class="input"
          type="text"
          placeholder="Name"
          tabindex="1"
          bind:value={rule.name} />
      </div>
      <button class="button is-warning is-light" on:click={removeSpecialRule(i)}>Remove</button>
    </div>
    <AutoComplete
      id={`ruleEffectInput${i}`}
      elementType="textarea"
      placeholder="Effect"
      {validAutoCompleteValues}
      bind:value={rule.effect} />
  </div>
  {/each}
  <div class="field">
    <div class="control">
      <button class="button is-primary is-light" tabindex="1" on:click={addSpecialRule}
        >Add Special Rule</button>
    </div>
  </div>
  {#each aspect.aspectEffects.innatePowers.powers as power, i (power.id)} 
  
  <div class="field mt-2">
    <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
      >{`Innate Power ${i + 1}`}</label>
    <div class="is-flex is-flex-direction-row">
      <div class="control" style="width:100%">
        <input
          id={`powerName${i}`}
          class="input"
          type="text"
          tabindex="1"
          placeholder="Power Name"
          bind:value={power.name} />
      </div>
      <button class="button is-primary is-light is-warning" on:click={removeInnatePower(i)}
        >Remove Innate Power</button>
    </div>
  </div>
  <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
    <div class="is-flex is-flex-direction-column-reverse">
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
        {#if power.speed == ""}
          <button
            class="button is-danger is-light button-hold mb-0"
            id="fast-button"
            on:click={setSpeedTextbox("Fast", power)}>Fast</button>
          <button
            class="button is-info is-light button-hold mb-0"
            id="slow-button"
            on:click={setSpeedTextbox("Slow", power)}>Slow</button>
        {:else if power.speed == "Fast" || power.speed == "fast"}
          <button
            class="button is-danger button-hold mb-0"
            id="fast-button"
            on:click={setSpeedTextbox("Fast", power)}>Fast</button>
          <button
            class="button is-info is-light button-hold mb-0"
            id="slow-button"
            on:click={setSpeedTextbox("Slow", power)}>Slow</button>
        {:else}
          <button
            class="button is-danger is-light button-hold mb-0"
            id="fast-button"
            on:click={setSpeedTextbox("Fast", power)}>Fast</button>
          <button
            class="button is-info button-hold mb-0"
            id="slow-button"
            on:click={setSpeedTextbox("Slow", power)}>Slow</button>
        {/if}
      </div>
    </div>
    <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-row-reverse is-flex-wrap-nowrap">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          {#if power.targetTitle == ""}
            <button
              class="button is-success is-light is-small mb-0"
              on:click={setTargetTextbox("Target Land", power)}>Target Land</button>
            <button
              class="button is-success is-light is-small mb-0"
              on:click={setTargetTextbox("Target", power)}>Target</button>
          {:else if power.targetTitle == "target" || power.targetTitle == "Target"}
            <button
              class="button is-success is-light is-small mb-0"
              on:click={setTargetTextbox("Target Land", power)}>Target Land</button>
            <button
              class="button is-success is-small mb-0"
              on:click={setTargetTextbox("Target", power)}>Target</button>
          {:else}
            <button
              class="button is-success is-small mb-0"
              on:click={setTargetTextbox("Target Land", power)}>Target Land</button>
            <button
              class="button is-success is-light is-small mb-0"
              on:click={setTargetTextbox("Target", power)}>Target</button>
          {/if}
        </div>
      </div>
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
        <div class="control">
          <input
            id={`powerRange${i}`}
            class="input"
            type="text"
            tabindex="1"
            placeholder="Range"
            bind:value={power.range} />
        </div>
        <div class="control">
          <AutoComplete
            id={`powerTarget${i}`}
            elementType="input"
            placeholder="Target"
            {validAutoCompleteValues}
            bind:value={power.target} />
        </div>
      </div>
    </div>
  </div>
  <div class="control field">
    <AutoComplete
      id={`powerNote${i}`}
      elementType="input"
      placeholder="Note (optional)"
      classNames="is-small"
      {validAutoCompleteValues}
      bind:value={power.note} />
  </div>
  <button class="button is-primary is-light is-small" on:click={addLevel(i)}>Add Level</button>
  {#each power.levels as level, j (level.id)}
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="control">
        <input
          id={`power${i}levelThreshold${j}`}
          class="input is-small"
          type="text"
          tabindex="1"
          placeholder="Threshold"
          bind:value={level.threshold} />
      </div>
      <div class="control" style="width:100%">
        <AutoComplete
          id={`power${i}levelEffect${j}`}
          elementType="input"
          placeholder="Effect"
          classNames="is-small"
          {validAutoCompleteValues}
          bind:value={level.effect} />
      </div>
      {#if !level.isLong}
        <button
          class="button is-primary is-light is-warning is-small row-button"
          on:click={switchLong(i, j)}>Long</button>
      {:else}
        <button
          class="button is-primary is-warning is-small row-button"
          on:click={switchLong(i, j)}>Long</button>
      {/if}
      <button
        class="button is-primary is-light is-warning is-small row-button"
        on:click={removeLevel(i, j)}>Remove</button>
    </div>
  {/each}

  {/each}
  <div class="pt-1">
    <button class="button is-primary is-light" on:click={addInnatePower}>Add Innate Power</button>
  </div>
  <!-- aspectEffects: {
    isVisible: false,
    specialRules: {
      isVisible: false,
      rules: [
        {
          id: 0,
          name: "",
          effect: "",
        },
      ],
    },
    innatePowers: {
      isVisible: false,
      powers: [
        {
          id: 0,
          name: "",
          speed: "",
          range: "",
          target: "",
          targetTitle: "",
          effect: "",
          note: "",
          noteShow: true,
          levels: [
            {
              id: 0,
              threshold: "",
              effect: "",
            },
          ],
        },
      ], -->
{/if}
