<script>
  export let spiritBoard;
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  function setSpeedTextbox(powerSpeed, innatePower) {
    innatePower.speed = powerSpeed;
    spiritBoard = spiritBoard;
    let templateID = "ip" + innatePower.id;
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let findPowerSpeed = previewFrame.document.getElementById(templateID);
    findPowerSpeed.removeAttribute("class");
    findPowerSpeed.setAttribute("class", powerSpeed.toLowerCase());
  }

  function setTargetTextbox(targetTitle, innatePower) {
    innatePower.targetTitle = targetTitle;
    spiritBoard = spiritBoard;
    let templateID = "ip" + innatePower.id + "targettitle";
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let findTargetTitle = previewFrame.document.getElementById(templateID);
    findTargetTitle.innerHTML = targetTitle;
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
    document.getElementById("updateButton").click();
  }

  function switchLong(powerIndex, levelIndex) {
    spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong =
      !spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong;
    document.getElementById("updateButton").click();
  }

  function updateInnatePowerThreshold(level, ID) {
    let newIPThresholdText = level.threshold;
    if (newIPThresholdText) {
      let templateInnatePowerThresholdID = ID;
      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findIPThreshold = previewFrame.document.getElementById(templateInnatePowerThresholdID);
      if (findIPThreshold) {
        console.log(
          "Rewriting Innate Power Threshold ID: " +
            templateInnatePowerThresholdID +
            " with " +
            newIPThresholdText
        );

        // Try to write a new node
        let newIPThreshold = "";
        try {
          newIPThreshold = previewFrame.writeInnateThreshold(newIPThresholdText);
        } catch (err) {
          newIPThreshold = previewFrame.writeInnateThreshold("1-water");
          console.log("Malformed growth option, try again");
        }
        newIPThreshold = previewFrame.replaceIcon(newIPThreshold);

        // Create dummy node with new content
        const placeholder = document.createElement("div");
        placeholder.innerHTML = newIPThreshold;
        const newNode = placeholder.firstElementChild;

        // update node
        findIPThreshold.innerHTML = newNode.innerHTML;
      }
    }
  }

  function updateInnatePowerRange(innatePower, ID) {
    let newIPRange = innatePower.range;
    if (newIPRange) {
      let templateInnatePowerRangeID = ID;
      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findIPRange = previewFrame.document.getElementById(templateInnatePowerRangeID);
      if (findIPRange) {
        console.log(
          "Rewriting Innate Power Range ID: " + templateInnatePowerRangeID + " with " + newIPRange
        );

        // Try to write a new node
        let newIPRangeText = "";
        try {
          newIPRangeText = previewFrame.getRangeModel(newIPRange);
        } catch (err) {
          newIPRangeText = previewFrame.getRangeModel("1-water");
          console.log("Malformed growth option, try again");
        }
        newIPRangeText = previewFrame.replaceIcon(newIPRangeText);

        // update node
        findIPRange.innerHTML = newIPRangeText;
      }
    }
  }

  function updateInnatePowerTarget(innatePower, ID) {
    let newIPTarget = innatePower.target;
    if (newIPTarget) {
      let templateInnatePowerTargetID = ID;
      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findIPRange = previewFrame.document.getElementById(templateInnatePowerTargetID);
      if (findIPRange) {
        console.log(
          "Rewriting Innate Power Target ID: " +
            templateInnatePowerTargetID +
            " with " +
            newIPTarget
        );

        // Try to write a new node
        let newIPTargetText = "";
        newIPTargetText = previewFrame.replaceIcon(newIPTarget);

        // update node
        findIPRange.innerHTML = newIPTargetText;
      }
    }
  }

  function updateInnatePowerEffect(level, ID) {
    let newIPThresholdText = level.effect;
    if (newIPThresholdText) {
      let templateInnatePowerThresholdID = ID;
      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findIPThreshold = previewFrame.document.getElementById(templateInnatePowerThresholdID);
      if (findIPThreshold) {
        console.log(
          "Rewriting Innate Power Effect ID: " +
            templateInnatePowerThresholdID +
            " with " +
            newIPThresholdText
        );

        // Try to write a new node
        let newIPThreshold = "";
        newIPThreshold = previewFrame.replaceIcon(newIPThresholdText);
        console.log(findIPThreshold);
        // update node
        findIPThreshold.innerHTML = newIPThreshold;
      }
    }
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function nextNode(event) {
    console.log("next node");
    Lib.nextNode(event);
  }

  function moveInnatePower(to, from) {
    console.log(to);
    spiritBoard.innatePowers.powers.splice(
      to,
      0,
      spiritBoard.innatePowers.powers.splice(from, 1)[0]
    );
    spiritBoard.innatePowers.powers.forEach((power, i) => {
      power.id = i;
    });
    console.log(spiritBoard.innatePowers.powers);
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }
  function moveThresholdLevel(i, to, from) {
    console.log(to);
    spiritBoard.innatePowers.powers[i].levels.splice(
      to,
      0,
      spiritBoard.innatePowers.powers[i].levels.splice(from, 1)[0]
    );
    spiritBoard.innatePowers.powers[i].levels.forEach((level, i) => {
      level.id = i;
    });
    console.log(spiritBoard.innatePowers.powers[i].levels);
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Innate Powers" bind:isVisible={spiritBoard.innatePowers.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="innate-powers" />
  </div>
  {#each spiritBoard.innatePowers.powers as innatePower, i (innatePower.id)}
    <div class="field mt-2">
      <div class="field is-flex is-justify-content-space-between mb-0">
        <label class="label mb-1 is-unselectable" for="spiritGrowthInput"
          >{`Innate Power ${i + 1}`}</label>
        <div class="field has-addons is-tiny" style="height:20px;">
          <button
            class="button is-light is-small"
            disabled={i === 0}
            on:click={moveInnatePower(i - 1, i)}>&#11165;</button>
          <button
            class="button is-light is-small"
            disabled={i + 1 === spiritBoard.innatePowers.powers.length}
            on:click={moveInnatePower(i + 1, i)}>&#11167;</button>
          <button
            class="button is-primary is-light is-warning is-small"
            on:click={removeInnatePower(i)}>&#10006;</button>
        </div>
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
            bind:value={innatePower.name} />
        </div>
      </div>
    </div>
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          {#if innatePower.speed === ""}
            <button
              class="button is-danger is-small is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info is-small is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {:else if innatePower.speed === "Fast" || innatePower.speed === "fast"}
            <button
              class="button is-danger is-small button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info is-small is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {:else}
            <button
              class="button is-danger is-small is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info is-small button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {/if}
        </div>
      </div>
      <div class="is-flex is-flex-direction-column is-flex-wrap-nowrap">
        <div class="is-flex is-flex-direction-row-reverse is-flex-wrap-nowrap">
          <div
            class="buttons target-type-buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
            {#if innatePower.targetTitle === ""}
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target Land", innatePower)}>Target Land</button>
              <button
                class="button is-success is-light is-small mb-0"
                on:click={setTargetTextbox("Target", innatePower)}>Target</button>
            {:else if innatePower.targetTitle === "target" || innatePower.targetTitle === "Target"}
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
              class="input is-small"
              type="text"
              placeholder="Range"
              on:keydown={nextNode}
              on:focus={selectNode}
              on:blur={updateInnatePowerRange(innatePower, `ip${i}range`)}
              bind:value={innatePower.range} />
          </div>
          <div class="control">
            <AutoComplete
              id={`powerTarget${i}`}
              elementType="input"
              classNames="is-small"
              placeholder="Target"
              validAutoCompleteValues={iconValuesSorted}
              additionalOnBlurFunction={() => updateInnatePowerTarget(innatePower, `ip${i}target`)}
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
        validAutoCompleteValues={iconValuesSorted}
        bind:value={innatePower.note} />
    </div>
    {#each innatePower.levels as level, j (level.id)}
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
        <div class="control">
          <input
            id={`power${i}levelThreshold${j}`}
            class="input is-small small-power"
            type="text"
            placeholder="Threshold"
            on:focus={selectNode}
            on:blur={updateInnatePowerThreshold(level, `ip${i}L${j}t`)}
            on:keydown={nextNode}
            bind:value={level.threshold} />
        </div>
        <div class="control" style="width:100%">
          <AutoComplete
            id={`power${i}levelEffect${j}`}
            elementType="textarea"
            placeholder="Effect"
            classNames="is-small small-power"
            validAutoCompleteValues={iconValuesSorted}
            additionalOnBlurFunction={() => updateInnatePowerEffect(level, `ip${i}L${j}`)}
            bind:value={level.effect} />
        </div>
        <div class="field has-addons is-tiny comment-buttons">
          <div class="control has-addons is-tiny comment-buttons is-flex is-flex-direction-column">
            <button
              class="button is-light is-small level-move-buttons"
              disabled={j === 0}
              on:click={moveThresholdLevel(i, j - 1, j)}>&#11165;</button>
            <button
              class="button is-light is-small level-move-buttons"
              disabled={j + 1 === innatePower.levels.length}
              on:click={moveThresholdLevel(i, j + 1, j)}>&#11167;</button>
          </div>
          <button
            class="button is-primary is-light is-warning is-small"
            class:is-light={!level.isLong}
            style="padding: 2px;"
            on:click={switchLong(i, j)}>Long</button>
          <button
            class="button is-warning is-small is-light"
            style="width:30px;"
            on:click={removeLevel(i, j)}>&#10006;</button>
        </div>
      </div>
    {/each}
    <button
      class="button is-primary is-light is-small"
      id={`power${i}addLevel`}
      on:click={addLevel(i)}>Add Level</button>
  {/each}
  <div class="pt-1">
    <button class="button is-primary is-light" on:click={addInnatePower}>Add Innate Power</button>
  </div>
</Section>

<style>
  .level-move-buttons {
    padding: 0px;
    height: 15px;
    width: 30px;
  }
  div.target-type-buttons button {
    height: 20px;
  }
</style>
