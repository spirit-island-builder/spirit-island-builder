<script>
  export let spiritBoard;
  export let showOrHideSection;
  import * as Lib from "./lib";

  function setSpeedTextbox(powerSpeed, innatePower) {
    innatePower.speed = powerSpeed;
    spiritBoard = spiritBoard;
  }

  function setTargetTextbox(targetTitle, innatePower) {
    innatePower.targetTitle = targetTitle;
    spiritBoard = spiritBoard;
  }

  function addNote(innatePower) {
    innatePower.noteShow = true;
    spiritBoard = spiritBoard;
  }

  function removeNote(innatePower) {
    innatePower.noteShow = false;
    innatePower.note = "";
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
      <span><a href="https://github.com/neubee/spirit-island-builder/blob/main/docs/instructions.md#innate-powers" target="_blank">Instructions</a></span>
    </div>
  </article>
  {#each spiritBoard.innatePowers.powers as innatePower, i (innatePower.id)}
    <div class="field mt-2">
      <label class="label mb-1 is-unselectable" for="spiritGrowthInput">{`Innate Power ${i + 1}`}</label>
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
                class="button is-success is-light mb-0 pl-2 pr-2"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success is-light mb-0 pl-2 pr-2"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
            {:else if innatePower.targetTitle == "target" || innatePower.targetTitle == "Target"}
              <button
                class="button is-success is-light mb-0  pl-2 pr-2"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success mb-0 pl-2 pr-2"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
            {:else}
              <button
                class="button is-success  mb-0 pl-2 pr-2"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success is-light  mb-0 pl-2 pr-2"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
            {/if}
          </div>
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
            <input
              id={`powerTarget${i}`}
              class="input"
              type="text"
              tabindex="1"
              placeholder="Target"
              bind:value={innatePower.target} />
          </div>
        </div>
      </div>
    </div>
    <div class="control field">
      <input
        id={`powerNote${i}`}
        class="input is-small"
        type="text"
        tabindex="1"
        placeholder="Note (optional)"
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
          <input
            id={`levelEffect${j}`}
            class="input is-small"
            type="text"
            tabindex="1"
            placeholder="Effect"
            bind:value={level.effect} />
        </div>
        {#if !level.isLong}
          <button
            class="button is-primary is-light is-warning is-small row-button"
            on:click={switchLong(i, j)}>Long</button>
        {:else}
          <button class="button is-primary is-warning is-small row-button" on:click={switchLong(i, j)}
            >Long</button>
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
