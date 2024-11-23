<script>
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import { growthValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import * as Lib from "../lib";

  export let aspect;

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
    document.getElementById("updateButton").click();
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

  function toggleHasGrowth(rule) {
    if (rule.hasGrowth) {
      rule.hasGrowth = false;
      rule.growthActions = [];
    } else {
      addGrowthAction(rule);
      rule.hasGrowth = true;
    }
    console.log(rule);
    aspect = aspect;
  }

  function addGrowthAction(rule, actionEffect = "") {
    console.log(rule);
    if (!rule.growthActions) {
      rule.growthActions = [];
      rule.hasGrowth = true;
    }
    let focusId = "specialRule" + rule.id + "growthAction" + rule.growthActions.length;
    rule.growthActions.push({
      id: rule.growthActions.length,
      effect: actionEffect,
    });
    //Set the focus to the Growth Action if it is visible.
    if (aspect.aspectEffects.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    aspect = aspect;
  }

  function removeGrowthAction(rule, actionIndex) {
    rule.growthActions.splice(actionIndex, 1);
    rule.growthActions.forEach((growthAction, i) => {
      growthAction.id = i;
    });
    aspect = aspect;
  }

  function switchLong(powerIndex, levelIndex) {
    aspect.aspectEffects.innatePowers.powers[powerIndex].levels[levelIndex].isLong =
      !aspect.aspectEffects.innatePowers.powers[powerIndex].levels[levelIndex].isLong;
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
    setCurrentValue(event);
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function toggleBonusNode() {
    aspect.aspectEffects.bonusNode.has = !aspect.aspectEffects.bonusNode.has;
  }
  let initialValue = "";
  function setCurrentValue(event) {
    initialValue = event.target.value;
    console.log("initialvalue=" + initialValue);
  }

  function detectUpdate(event) {
    const currentValue = event.target.value;
    console.log("we made it to detect update");
    if (initialValue !== currentValue) {
      console.log("Value has changed!");
      // Perform your desired actions here
      initialValue = currentValue; // Update the initial value
      document.getElementById("updateButton").click();
    }
  }
</script>

<Section title="Aspect Effects" bind:isVisible={aspect.aspectEffects.isVisible}>
  {#each aspect.aspectEffects.specialRules.rules as rule, i (rule.id)}
    <div class="field mb-0">
      <div class="is-flex is-justify-content-space-between">
        <label
          class="label is-flex is-justify-content-space-between"
          for={`ruleNameInputAspect${i}`}
          >Special Rule {i + 1}
        </label>
        <button class="button is-warning is-light is-small" on:click={removeSpecialRule(i)}
          >Remove Special Rule</button>
      </div>
      <div class="growth-action-container">
        <div class="control" style="width:100%">
          <input
            id={`ruleNameInput${i}`}
            class="input"
            type="text"
            placeholder="Name"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={rule.name} />
        </div>
      </div>
      <AutoComplete
        id={`ruleEffectInput${i}`}
        elementType="textarea"
        placeholder="Effect"
        classNames="is-small"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={rule.effect} />
    </div>
    <div class="control mb-2">
      {#if rule.hasGrowth}
        <button class="button is-warning is-small is-light" on:click={toggleHasGrowth(rule)}
          >Remove Growth Options</button>
        {#each rule.growthActions as growthAction, k (growthAction.id)}
          <div class="growth-action-container">
            <div class="control">
              <AutoComplete
                id={`specialRule${i}growthAction${k}`}
                elementType="input"
                placeholder="Growth Action"
                showListImmediately={true}
                validAutoCompleteValues={growthValuesSorted}
                bind:value={growthAction.effect} />
            </div>
            <button class="button is-light row-button" on:click={removeGrowthAction(rule, k)}
              >Remove</button>
          </div>
        {/each}
        <div class="control">
          <button
            id={`specialRule${i}AddAction`}
            class="button is-primary is-light is-small row-button"
            on:click={addGrowthAction(rule)}>Add Growth Action</button>
        </div>
      {:else}
        <button class="button is-primary is-small is-light" on:click={toggleHasGrowth(rule)}
          >Add Growth Options to Special Rule</button>
      {/if}
    </div>
  {/each}
  <div class="field mt-2">
    <div class="control">
      <button class="button is-primary is-light is-small" on:click={addSpecialRule}
        >Add Special Rule</button>
    </div>
  </div>
  <hr class="mt-1 mb-1" />
  {#each aspect.aspectEffects.innatePowers.powers as power, i (power.id)}
    <div class="field mt-2">
      <div class="is-flex is-justify-content-space-between">
        <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
          >{`Innate Power ${i + 1}`}</label>
        <button
          class="button is-primary is-small is-light is-warning"
          on:click={removeInnatePower(i)}>Remove Innate Power</button>
      </div>
      <div class="is-flex is-flex-direction-row">
        <div class="control" style="width:100%">
          <input
            id={`powerName${i}`}
            class="input"
            type="text"
            placeholder="Power Name"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={power.name} />
        </div>
      </div>
    </div>
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          <button
            class="button is-danger button-hold mb-0 is-small"
            class:is-light={power.speed === "Slow"}
            id="fast-button"
            on:click={setSpeedTextbox("Fast", power)}>Fast</button>
          <button
            class="button is-info button-hold mb-0 is-small"
            id="slow-button"
            class:is-light={power.speed !== "Slow"}
            on:click={setSpeedTextbox("Slow", power)}>Slow</button>
        </div>
      </div>
      <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap">
        <div class="is-flex is-flex-direction-row-reverse is-flex-wrap-nowrap">
          <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
            {#if power.targetTitle === ""}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", power)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", power)}>Target</button>
            {:else if power.targetTitle === "target" || power.targetTitle === "Target"}
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
              class="input is-small"
              type="text"
              placeholder="Range"
              on:keydown={nextNode}
              on:focus={selectNode}
              on:blur={detectUpdate}
              bind:value={power.range} />
          </div>
          <div class="control">
            <AutoComplete
              id={`powerTarget${i}`}
              elementType="input"
              classNames="is-small"
              placeholder="Target"
              validAutoCompleteValues={iconValuesSorted}
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
        validAutoCompleteValues={iconValuesSorted}
        bind:value={power.note} />
    </div>
    <button
      class="button is-primary is-light is-small"
      id={`power${i}addLevel`}
      on:click={addLevel(i)}>Add Level</button>
    {#each power.levels as level, j (level.id)}
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap power-level-fonts">
        <div class="control">
          <input
            id={`power${i}levelThreshold${j}`}
            class="input is-small small-power"
            type="text"
            placeholder="Threshold"
            on:keydown={nextNode}
            on:focus={selectNode}
            on:blur={detectUpdate}
            bind:value={level.threshold} />
        </div>
        <div class="control" style="width:100%">
          <AutoComplete
            id={`power${i}levelEffect${j}`}
            elementType="textarea"
            placeholder="Effect"
            classNames="is-small small-power"
            validAutoCompleteValues={iconValuesSorted}
            additionalOnBlurFunction={() => document.getElementById("updateButton").click()}
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
    <button class="button is-primary is-light is-small" on:click={addInnatePower}
      >Add Innate Power</button>
  </div>
  <hr class="mt-1 mb-1" />
  <label class="label is-flex is-justify-content-space-between" for={`bonusNode`}
    >Bonus Presence Node
  </label>
  {#if aspect.aspectEffects.bonusNode.has}
    <div class="mb-1 p-1 note">Note: will only show in 'landscape' layout.</div>
    <div class="field is-flex is-small mb-0">
      <label class="label incarna-label mr-1" for={`bonusNodeEffect`}>Effect: </label>
      <div class="control" style="width:100%;">
        <input
          id={`bonusNodeEffect`}
          class="input is-small"
          type="text"
          placeholder="Effect"
          on:keydown={nextNode}
          on:focus={selectNode}
          bind:value={aspect.aspectEffects.bonusNode.effect} />
      </div>
    </div>
    <div class="pt-1">
      <button class="button is-warning is-small is-light" on:click={toggleBonusNode}
        >Remove Bonus Node</button>
    </div>
  {:else}
    <div class="pt-1">
      <button class="button is-primary is-small is-light" on:click={toggleBonusNode}
        >Add Bonus Node</button>
    </div>
  {/if}
</Section>
