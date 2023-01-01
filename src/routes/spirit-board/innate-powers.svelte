<script>
  export let spiritBoard;
  export let showOrHideSection;
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";

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

  function updateInnatePowerThreshold(level, ID) {
    var newIPThresholdText = level.threshold;
    var templateInnatePowerThresholdID = ID;
    var previewFrame = document.getElementById("preview-iframe").contentWindow
    console.log('Rewriting Innate Power ID: '+templateInnatePowerThresholdID + ' with ' + newIPThresholdText)
    
    // Find node in Template
    var findIPThreshold = previewFrame.document.getElementById(templateInnatePowerThresholdID)

    // Check growth height
    // var presenceTrackPanel = previewFrame.document.getElementsByTagName("presence-tracks")[0]
    // var presenceTrackHeight = presenceTrackPanel.getElementsByTagName("tbody")[0].offsetHeight

    // Try to write a new node    
    var newIPThreshold = "";
    try {
      newIPThreshold = previewFrame.writeInnateThreshold(newIPThresholdText);
    }
    catch(err) {
      newIPThreshold = previewFrame.getPresenceNodeHtml('1-water');
      console.log('Malformed growth option, try again')
    }
    newIPThreshold = previewFrame.replaceIcon(newIPThreshold);

    // Create dummy node with new content
    const placeholder = document.createElement("div");
    placeholder.innerHTML = newIPThreshold;
    const newNode = placeholder.firstElementChild;

    // update node
    findIPThreshold.innerHTML = newNode.innerHTML

    // If new panel is larger, re-run    
    // var newPresenceTrackHeight = presenceTrackPanel.getElementsByTagName("tbody")[0].offsetHeight
    // if(newPresenceTrackHeight !== presenceTrackHeight){
    //   console.log('Recommend Re-running the whole board (click "Update Preview")')
    //   document.getElementById('updateButton').classList.add("is-flashy");
    // }
  }

  function selectNode(event) {
    var nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function nextNode(event, i){
    if (event.key == 'Enter'){
      var currentID = event.target.id;
      var focusID = ""
      if (currentID.includes('Threshold')){
        focusID = currentID.replace('Threshold','Effect');
      }
      console.log(focusID)
      var newNode = document.getElementById(focusID)
    //Set the focus to the Growth Action if it is visible.
      if (spiritBoard.innatePowers.isVisible) {
        if (newNode !== null){
          document.getElementById(focusID).focus();
        }else{
          document.getElementById(`power${i}addLevel`).focus();
        }
      }
    }
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
              validAutoCompleteValues={iconValuesSorted}
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
    <button class="button is-primary is-light is-small" id={`power${i}addLevel`} on:click={addLevel(i)}>Add Level</button>
    {#each innatePower.levels as level, j (level.id)}
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
        <div class="control">
          <input
            id={`power${i}levelThreshold${j}`}
            class="input is-small"
            type="text"
            tabindex="1"
            placeholder="Threshold"
            on:focus={selectNode}
            on:blur={updateInnatePowerThreshold(level,`ip${i}L${j}t`)}
            on:keyup={(e) => nextNode(e, i)}
            bind:value={level.threshold} />
        </div>
        <div class="control" style="width:100%">
          <AutoComplete
            id={`power${i}levelEffect${j}`}
            elementType="input"
            placeholder="Effect"
            classNames="is-small"
            validAutoCompleteValues={iconValuesSorted}
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
