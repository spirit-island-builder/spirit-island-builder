<script>
  export let spiritBoard;
  export let showOrHideSection;
  import * as Lib from "./lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";

  function setSpeedTextbox(powerSpeed, innatePower) {
    innatePower.speed = powerSpeed;
    spiritBoard = spiritBoard;
  }

  function setTargetTextbox(targetTitle, innatePower) {
    innatePower.targetTitle = targetTitle;
    spiritBoard = spiritBoard;
  }

  function removeLevel(powerIndex, levelIndex) {
    spiritBoard.innatePowers.powers[powerIndex].levels.splice(levelIndex, 1);
    spiritBoard.innatePowers.powers[powerIndex].levels.forEach((level, i) => {
      level.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function addLevel(powerIndex) {
    spiritBoard = Lib.addLevel(spiritBoard, powerIndex);
  }

  function addInnatePower() {
    spiritBoard = Lib.addInnatePower(spiritBoard);
  }

  function removeInnatePower(powerIndex) {
    spiritBoard.innatePowers.powers.splice(powerIndex, 1);
    spiritBoard.innatePowers.powers.forEach((power, i) => {
      power.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function switchLong(powerIndex, levelIndex) {
    spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong =
      !spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong;
    console.log("isLong=" + spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong);
  }

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
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="innatePowers">
  Innate Powers
  <span id="innatePowers" on:click={showOrHideSection}>
    {#if spiritBoard.innatePowers.isVisible}
      <ion-icon id="innatePowers" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="innatePowers" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoard.innatePowers.isVisible}
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#innate-powers"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>
  {#each spiritBoard.innatePowers.powers as innatePower, i (innatePower.id)}
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
            bind:value={innatePower.name} />
        </div>
        <button class="button is-primary is-light is-warning" on:click={removeInnatePower(i)}
          >Remove Innate Power</button>
      </div>
    </div>
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          {#if innatePower.speed == ""}
            <button
              class="button is-danger is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {:else if innatePower.speed == "Fast" || innatePower.speed == "fast"}
            <button
              class="button is-danger button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {:else}
            <button
              class="button is-danger is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {/if}
        </div>
      </div>
      <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap">
        <div class="is-flex is-flex-direction-row-reverse is-flex-wrap-nowrap">
          <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
            {#if innatePower.targetTitle == ""}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
            {:else if innatePower.targetTitle == "target" || innatePower.targetTitle == "Target"}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success is-small mb-0"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
            {:else}
              <button
                class="button is-success is-small mb-0"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
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
              bind:value={innatePower.range} />
          </div>
          <div class="control">
            <AutoComplete
              id={`powerTarget${i}`}
              elementType="input"
              placeholder="Target"
              {validAutoCompleteValues}
              bind:value={innatePower.target} />
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
        bind:value={innatePower.note} />
    </div>
    <button class="button is-primary is-light is-small" on:click={addLevel(i)}>Add Level</button>
    {#each innatePower.levels as level, j (level.id)}
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
        <div class="control">
          <input
            id={`levelThreshold${j}`}
            class="input is-small"
            type="text"
            tabindex="1"
            placeholder="Threshold"
            bind:value={level.threshold} />
        </div>
        <div class="control" style="width:100%">
          <AutoComplete
            id={`levelEffect${j}`}
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
{/if}
