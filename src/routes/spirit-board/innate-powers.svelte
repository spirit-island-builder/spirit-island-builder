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
  }

  function switchLong(powerIndex, levelIndex) {
    spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong =
      !spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong;
    console.log("isLong=" + spiritBoard.innatePowers.powers[powerIndex].levels[levelIndex].isLong);
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
</script>

<Section title="Innate Powers" bind:isVisible={spiritBoard.innatePowers.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="innate-powers" />
  </div>
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
            placeholder="Power Name"
            on:keyup={nextNode}
            on:focus={selectNode}
            bind:value={innatePower.name} />
        </div>
        <button class="button is-primary is-light is-warning" on:click={removeInnatePower(i)}
          >Remove Innate Power</button>
      </div>
    </div>
    <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
      <div class="is-flex is-flex-direction-column-reverse">
        <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
          {#if innatePower.speed === ""}
            <button
              class="button is-danger is-light button-hold mb-0"
              id="fast-button"
              on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
            <button
              class="button is-info is-light button-hold mb-0"
              id="slow-button"
              on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
          {:else if innatePower.speed === "Fast" || innatePower.speed === "fast"}
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
              class="input"
              type="text"
              placeholder="Range"
              on:keyup={nextNode}
              on:focus={selectNode}
              on:blur={updateInnatePowerRange(innatePower, `ip${i}range`)}
              bind:value={innatePower.range} />
          </div>
          <div class="control">
            <AutoComplete
              id={`powerTarget${i}`}
              elementType="input"
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
    <button
      class="button is-primary is-light is-small"
      id={`power${i}addLevel`}
      on:click={addLevel(i)}>Add Level</button>
    {#each innatePower.levels as level, j (level.id)}
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
        <div class="control">
          <input
            id={`power${i}levelThreshold${j}`}
            class="input is-small"
            type="text"
            placeholder="Threshold"
            on:focus={selectNode}
            on:blur={updateInnatePowerThreshold(level, `ip${i}L${j}t`)}
            on:keyup={nextNode}
            bind:value={level.threshold} />
        </div>
        <div class="control" style="width:100%">
          <AutoComplete
            id={`power${i}levelEffect${j}`}
            elementType="input"
            placeholder="Effect"
            classNames="is-small"
            validAutoCompleteValues={iconValuesSorted}
            additionalOnBlurFunction={() => updateInnatePowerEffect(level, `ip${i}L${j}`)}
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
</Section>
