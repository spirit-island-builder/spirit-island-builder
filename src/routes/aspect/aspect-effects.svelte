<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import * as Lib from "../lib";

  export let aspect;
  export let showOrHideSection;

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
      validAutoCompleteValues = {iconValuesSorted}
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
            validAutoCompleteValues = {iconValuesSorted}
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
      validAutoCompleteValues = {iconValuesSorted}
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
          validAutoCompleteValues = {iconValuesSorted}
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
