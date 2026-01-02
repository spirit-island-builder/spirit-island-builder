<script>
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import { growthValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import * as Lib from "../lib";

  export let aspect;

  function addSpecialRule(k) {
    aspect.aspectEffects[k] = Lib.addSpecialRule(aspect.aspectEffects[k]);
    aspect = aspect;
  }

  function removeSpecialRule(index, k) {
    aspect.aspectEffects[k] = Lib.removeSpecialRule(aspect.aspectEffects[k], index);
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

  function removeLevel(powerIndex, levelIndex, k) {
    aspect.aspectEffects[k].innatePowers.powers[powerIndex].levels.splice(levelIndex, 1);
    aspect.aspectEffects[k].innatePowers.powers[powerIndex].levels.forEach((level, i) => {
      level.id = i;
    });
    aspect = aspect;
  }

  function addLevel(powerIndex, k) {
    aspect.aspectEffects[k] = Lib.addLevel(aspect.aspectEffects[k], powerIndex);
  }

  function addInnatePower(k) {
    aspect.aspectEffects[k] = Lib.addInnatePower(aspect.aspectEffects[k]);
  }

  function removeInnatePower(powerIndex, k) {
    aspect.aspectEffects[k].innatePowers.powers.splice(powerIndex, 1);
    aspect.aspectEffects[k].innatePowers.powers.forEach((power, i) => {
      power.id = i;
    });
    aspect = aspect;
  }

  function toggleHasGrowth(rule, k) {
    if (rule.hasGrowth) {
      rule.hasGrowth = false;
      rule.growthActions = [];
    } else {
      addGrowthAction(rule, k);
      rule.hasGrowth = true;
    }
    console.log(rule);
    aspect = aspect;
  }

  function addGrowthAction(rule, k, actionEffect = "") {
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
    if (aspect.aspectEffects[k].isVisible) {
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

  function switchLong(powerIndex, levelIndex, k) {
    aspect.aspectEffects[k].innatePowers.powers[powerIndex].levels[levelIndex].isLong =
      !aspect.aspectEffects[k].innatePowers.powers[powerIndex].levels[levelIndex].isLong;
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
    setCurrentValue(event);
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function toggleBonusNode(k) {
    aspect.aspectEffects[k].bonusNode.has = !aspect.aspectEffects[k].bonusNode.has;
    aspect = aspect;
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

  function addReplacement(k) {
    let focusId = `replacesInput${k}-` + aspect.aspectEffects[k].replacements.length;
    aspect.aspectEffects[k].replacements.push({
      id: aspect.aspectEffects[k].replacements.length,
      aspectRelacement: "",
      rulesReplaced: "",
    });
    //Set the focus to the Special Rule if it is visible.
    if (aspect.aspectEffects[k].isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    aspect = aspect;
  }

  function removeReplacement(index, k) {
    aspect.aspectEffects[k].replacements.splice(index, 1);
    aspect.aspectEffects[k].replacements.forEach((replacement, i) => {
      replacement.id = i;
    });
    aspect = aspect;
  }

  function removeAspectPart(k) {
    if (window.confirm(`Are you sure? Removing Aspect Part ${k + 1}`)) {
      aspect.aspectEffects.splice(k, 1);
      aspect.aspectEffects.forEach((part, i) => {
        part.id = i;
      });
      aspect = aspect;
      document.getElementById("updateButton").click();
    }
  }

  function addAspectPart() {
    aspect.aspectEffects.push({
      id: aspect.aspectEffects.length,
      isVisible: false,
      profile: false,
      replacements: [
        {
          id: 0,
          aspectRelacement: "",
          rulesReplaced: "",
        },
      ],
      specialRules: {
        rules: [
          {
            id: 0,
            name: "",
            effect: "",
            hasGrowth: false,
            growthActions: [
              {
                id: 0,
                effect: "",
              },
            ],
          },
        ],
      },
      innatePowers: {
        powers: [],
      },
      bonusNode: {
        has: false,
        effect: "",
      },
    });

    aspect = aspect;
    document.getElementById("updateButton").click();
  }
</script>

{#each aspect.aspectEffects as aspectEffect, k (aspectEffect.id)}
  <Section title="Effects Part {k + 1}" bind:isVisible={aspectEffect.isVisible}>
    <div class="field mb-3">
      <div class=" is-flex is-justify-content-space-between">
        <label class="label is-flex is-justify-content-space-between" for={``}
          >Setup Replacements</label>
        <button class="button is-small is-success is-light" on:click={removeAspectPart(k)}
          >Remove Part {k + 1}</button>
      </div>
      {#each aspectEffect.replacements as replacement, i (replacement.id)}
        <div class="field is-flex is-small is-flex-direction-row mb-1">
          <div class="field is-flex is-small is-flex-direction-column mb-0" style="width:30%">
            <label
              class="label is-flex is-justify-content-space-between mb-0 is-small"
              for="replacesInput"
              >Replacement #{i + 1}
            </label>
            <div class="field is-flex is-small mb-0">
              <div class="control" style="width:100%">
                <input
                  id="part{k}ReplacesInput{i}"
                  class="input is-small"
                  type="text"
                  placeholder="ie. Replaces Special Rule"
                  on:keydown={nextNode}
                  on:focus={selectNode}
                  bind:value={replacement.aspectRelacement} />
              </div>
            </div>
          </div>
          <div
            class="field is-flex is-small is-flex-direction-column is-justify-content-space-between mb-0"
            style="width:70%">
            <label
              class="label is-flex is-justify-content-space-between mb-0 is-small"
              for="part{k}rulesReplacedInput{i}"
              >Rule/Power Name
            </label>
            <div class="field is-flex is-small mb-0">
              <div class="control" style="width:100%">
                <input
                  id="part{k}RulesReplacedInput{i}"
                  class="input is-small"
                  type="text"
                  placeholder="ie. The Name of a Spirit's Special Rule"
                  on:keydown={nextNode}
                  on:focus={selectNode}
                  bind:value={replacement.rulesReplaced} />
              </div>
            </div>
          </div>
          <button
            class="button is-primary is-light is-warning is-small row-button is-align-self-flex-end"
            on:click={removeReplacement(i, k)}>Remove</button>
        </div>
      {/each}
      <button
        class="button is-primary is-light is-small"
        id="part{k}addReplacement"
        on:click={addReplacement(k)}>Add Replacement</button>
    </div>
    {#each aspectEffect.specialRules.rules as rule, i (rule.id)}
      <div class="field mb-0">
        <div class="is-flex is-justify-content-space-between">
          <label
            class="label is-flex is-justify-content-space-between"
            for={`part${k}RuleNameInputAspect${i}`}
            >Special Rule {i + 1}
          </label>
          <button class="button is-warning is-light is-small" on:click={removeSpecialRule(i, k)}
            >Remove Special Rule</button>
        </div>
        <div class="growth-action-container">
          <div class="control" style="width:100%">
            <input
              id={`part${k}RuleNameInput${i}`}
              class="input"
              type="text"
              placeholder="Name"
              on:keydown={nextNode}
              on:focus={selectNode}
              bind:value={rule.name} />
          </div>
        </div>
        <AutoComplete
          id={`part${k}RuleEffectInput${i}`}
          elementType="textarea"
          placeholder="Effect"
          classNames="is-small"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={rule.effect} />
      </div>
      <div class="control mb-2">
        {#if rule.hasGrowth}
          <button class="button is-warning is-small is-light" on:click={toggleHasGrowth(rule, k)}
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
              on:click={addGrowthAction(rule, k)}>Add Growth Action</button>
          </div>
        {:else}
          <button class="button is-primary is-small is-light" on:click={toggleHasGrowth(rule)}
            >Add Growth Options to Special Rule</button>
        {/if}
      </div>
    {/each}
    <div class="field mt-2">
      <div class="control">
        <button class="button is-primary is-light is-small" on:click={addSpecialRule(k)}
          >Add Special Rule</button>
      </div>
    </div>
    <hr class="mt-1 mb-1" />
    {#each aspectEffect.innatePowers.powers as power, i (power.id)}
      <div class="field mt-2">
        <div class="is-flex is-justify-content-space-between">
          <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
            >{`Innate Power ${i + 1}`}</label>
          <button
            class="button is-primary is-small is-light is-warning"
            on:click={removeInnatePower(i, k)}>Remove Innate Power</button>
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
                id={`part${k}PowerRange${i}`}
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
                id={`part${k}PowerTarget${i}`}
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
          id={`part${k}PowerNote${i}`}
          elementType="input"
          placeholder="Note (optional)"
          classNames="is-small"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={power.note} />
      </div>
      <button
        class="button is-primary is-light is-small"
        id={`power${i}addLevel`}
        on:click={addLevel(i, k)}>Add Level</button>
      {#each power.levels as level, j (level.id)}
        <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap power-level-fonts">
          <div class="control">
            <input
              id={`part${k}Power${i}levelThreshold${j}`}
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
              id={`part${k}Power${i}levelEffect${j}`}
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
              on:click={switchLong(i, j, k)}>Long</button>
          {/if}
          <button
            class="button is-primary is-light is-warning is-small row-button"
            on:click={removeLevel(i, j, k)}>Remove</button>
        </div>
      {/each}
    {/each}
    <div class="pt-1">
      <button class="button is-primary is-light is-small" on:click={addInnatePower(k)}
        >Add Innate Power</button>
    </div>
    <hr class="mt-1 mb-1" />
    <label class="label is-flex is-justify-content-space-between" for={`bonusNode`}
      >Bonus Presence Node
    </label>
    {#if aspectEffect.bonusNode.has}
      <div class="mb-1 p-1 note">Note: will only show in 'landscape' layout.</div>
      <div class="field is-flex is-small mb-0">
        <label class="label incarna-label mr-1" for={`bonusNodeEffect`}>Effect: </label>
        <div class="control" style="width:100%;">
          <input
            id={`part${k}BonusNodeEffect`}
            class="input is-small"
            type="text"
            placeholder="Effect"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={aspectEffect.bonusNode.effect} />
        </div>
      </div>
      <div class="pt-1">
        <button class="button is-warning is-small is-light" on:click={toggleBonusNode(k)}
          >Remove Bonus Node</button>
      </div>
    {:else}
      <div class="pt-1">
        <button class="button is-primary is-small is-light" on:click={toggleBonusNode(k)}
          >Add Bonus Node</button>
      </div>
    {/if}
    <hr class="mt-1 mb-1" />
    <div class="field is-flex is-small mb-0">
      <label class="label mr-1" for={`incarnaTokenToken`}>Name Override: </label>
      <div class="control">
        <input
          id={`aspectPartNameOverride`}
          class="input is-small"
          type="text"
          placeholder="Optional (defaults to the Aspect name)"
          on:keydown={nextNode}
          on:focus={selectNode}
          bind:value={aspectEffect.nameOverride} />
      </div>
    </div>
    <hr class="mt-1 mb-1" />
  </Section>
{/each}
<div class="mb-1 mt-1 is-flex is-justify-content-right">
  <button class="button is-small is-success is-light" on:click={addAspectPart}
    >Add Aspect Part {aspect.aspectEffects.length + 1}</button>
</div>
