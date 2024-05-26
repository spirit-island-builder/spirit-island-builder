<script>
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { growthValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  let hoveringOverAction;
  let hoveringOverGroup;
  let draggingGroup = false;
  let draggingAction = false;

  function useGrowthSets() {
    spiritBoard.growth.useGrowthSets = true;
  }

  // function easyReport() {
  //   console.log("it ran");
  // }

  function removeAllGrowthSets() {
    // "Turns off" Growth Sets, collapsing all growth groups into the first Set
    spiritBoard.growth.useGrowthSets = false;
    spiritBoard.growth.directions = "";
    let firstSet = spiritBoard.growth.growthSets[0];
    for (let i = 1; i < spiritBoard.growth.growthSets.length; i++) {
      while (spiritBoard.growth.growthSets[i].growthGroups.length > 0) {
        firstSet.growthGroups.push(spiritBoard.growth.growthSets[i].growthGroups.shift());
        firstSet.growthGroups[firstSet.growthGroups.length - 1].id =
          firstSet.growthGroups.length - 1;
      }
      spiritBoard = spiritBoard;
    }
    while (spiritBoard.growth.growthSets.length > 1) {
      spiritBoard.growth.growthSets.pop();
    }
  }

  function addGrowthSet() {
    spiritBoard = Lib.addGrowthSet(spiritBoard);
    addGrowthGroup(spiritBoard.growth.growthSets.length - 1);
  }

  function addGrowthGroup(setIndex) {
    spiritBoard = Lib.addGrowthGroup(spiritBoard, setIndex);
    addGrowthAction(setIndex, spiritBoard.growth.growthSets[setIndex].growthGroups.length - 1);
  }

  function addGrowthAction(setIndex, groupIndex) {
    spiritBoard = Lib.addGrowthAction(spiritBoard, setIndex, groupIndex);
  }

  function removeGrowthAction(setIndex, groupIndex, actionIndex) {
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.splice(
      actionIndex,
      1
    );
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.forEach(
      (growthAction, i) => {
        growthAction.id = i;
      }
    );
    spiritBoard = spiritBoard;
  }

  function removeGrowthGroup(setIndex, groupIndex) {
    spiritBoard.growth.growthSets[setIndex].growthGroups.splice(groupIndex, 1);
    spiritBoard.growth.growthSets[setIndex].growthGroups.forEach((growthGroup, i) => {
      growthGroup.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function removeGrowthSet(setIndex) {
    spiritBoard.growth.growthSets.splice(setIndex, 1);
    spiritBoard.growth.growthSets.forEach((growthSet, i) => {
      growthSet.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function setCost(setIndex, groupIndex) {
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasCost =
      !spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasCost;

    let focusId = "set" + setIndex + "group" + groupIndex + "cost";
    //Set the focus to the Growth Group Cost if it is visible.
    if (spiritBoard.growth.isVisible) {
      if (spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasCost) {
        setTimeout(() => {
          document.getElementById(focusId).focus();
        }, 100);
      }
    }
  }

  function setTint(setIndex, groupIndex) {
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTint =
      !spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTint;

    let focusId = "set" + setIndex + "group" + groupIndex + "tint";
    //Set the focus to the Growth Group Cost if it is visible.
    if (spiritBoard.growth.isVisible) {
      if (spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTint) {
        setTimeout(() => {
          document.getElementById(focusId).focus();
        }, 100);
      }
    }
  }

  function setTitle(setIndex, groupIndex) {
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTitle =
      !spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTitle;

    let focusId = "set" + setIndex + "group" + groupIndex + "title";
    //Set the focus to the Growth Group Cost if it is visible.
    if (spiritBoard.growth.isVisible) {
      if (spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTitle) {
        setTimeout(() => {
          document.getElementById(focusId).focus();
        }, 100);
      }
    }
  }

  function updateGrowthActionLocal(setIndex, groupIndex, actionIndex) {
    let newGrowthActionText =
      spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions[actionIndex]
        .effect;
    let templateGrowthID = "s" + setIndex + "g" + groupIndex + "a" + actionIndex;
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    console.log("Rewriting Growth Node ID: " + templateGrowthID);

    // Check growth height
    let growthPanel = previewFrame.document.getElementsByTagName("growth")[0];
    let growthHeight = growthPanel.offsetHeight;

    // Try to write a new node

    let growthActionTest = "";
    try {
      growthActionTest = previewFrame.writeGrowthAction(newGrowthActionText);
    } catch (err) {
      growthActionTest = previewFrame.writeGrowthAction("custom(error! check syntax)");
      console.log("Malformed growth option, try again");
    }
    growthActionTest = previewFrame.replaceIcon(growthActionTest);

    // Create dummy node with new content
    const placeholder = document.createElement("div");
    placeholder.innerHTML = growthActionTest;
    const newNode = placeholder.firstElementChild;

    // Transfer new node into preview
    let findGrowth = previewFrame.document.getElementById(templateGrowthID);
    findGrowth.innerHTML = newNode.innerHTML;

    // If new growth panel is larger, re-run
    let newGrowthHeight = growthPanel.offsetHeight;
    if (newGrowthHeight > growthHeight) {
      console.log('Recommend Re-running the whole board (click "Update Preview")');
      document.getElementById("updateButton").classList.add("is-flashy");
    }
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function handleon(e) {
    e.target.parentNode.setAttribute("draggable", "true");
    draggingAction = true;
    draggingGroup = false;
  }

  function handleoff(e) {
    e.target.parentNode.setAttribute("draggable", "false");
    draggingAction = false;
    draggingGroup = false;
  }

  function handleongroup(e) {
    e.target.parentNode.parentNode.setAttribute("draggable", "true");
    draggingAction = false;
    draggingGroup = true;
    // add listener for drop event to parent
  }

  function handleoffgroup(e) {
    e.target.parentNode.parentNode.setAttribute("draggable", "false");
    draggingAction = false;
    draggingGroup = false;
    // remove listener for drop event to parent
  }

  function handleoffdraggable(e) {
    e.target.setAttribute("draggable", "false");
    draggingAction = false;
    draggingGroup = false;
  }

  function dragStart(event, setIndex, groupIndex, actionIndex) {
    if (draggingAction) {
      const data = { setIndex, groupIndex, actionIndex };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
    }
  }

  function dropAction(event, setIndex, groupIndex, actionIndex) {
    if (draggingAction) {
      event.preventDefault();
      console.log("dropping on " + event.target.outerHTML);
      const json = event.dataTransfer.getData("text/plain");
      const data = JSON.parse(json);
      let dragSetIndex = data.setIndex;
      let dragGroupIndex = data.groupIndex;
      let dragActionIndex = data.actionIndex;

      // Effect is all that matters for Actions
      let dragAction =
        spiritBoard.growth.growthSets[dragSetIndex].growthGroups[dragGroupIndex].growthActions[
          dragActionIndex
        ];
      let actionClone = JSON.parse(JSON.stringify(dragAction));

      // Remove the item
      removeGrowthAction(data.setIndex, data.groupIndex, data.actionIndex);

      // Splice it into its new place
      let spliceIndex = actionIndex;
      if (
        setIndex === dragSetIndex &&
        groupIndex === dragGroupIndex &&
        dragActionIndex < actionIndex
      ) {
        console.log("moving up within the same group, adjust the index");
        spliceIndex--;
      }
      spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.splice(
        spliceIndex,
        0,
        actionClone
      );

      // Need to fix the IDs we just messed up.
      resetIDs(spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions);
      // simulate a click (which is super nasty but YOLO)
      document.getElementById("updateButton").click();

      hoveringOverAction = null;
    }
  }

  function dragStartGroup(event, setIndex, groupIndex) {
    if (draggingGroup) {
      const data = { setIndex, groupIndex };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
      console.log("group drag started: " + groupIndex);
    }
  }

  function dropGroup(event, setIndex, groupIndex) {
    if (draggingGroup) {
      event.preventDefault();

      console.log("dropping on " + groupIndex);
      const json = event.dataTransfer.getData("text/plain");
      const data = JSON.parse(json);
      let dragSetIndex = data.setIndex;
      let dragGroupIndex = data.groupIndex;

      // Isolate and clone the drag group
      let dragGroup = spiritBoard.growth.growthSets[dragSetIndex].growthGroups[dragGroupIndex];
      let groupClone = JSON.parse(JSON.stringify(dragGroup));

      // Remove the item
      removeGrowthGroup(data.setIndex, data.groupIndex);

      // Splice it into its new place
      let spliceIndex = groupIndex;
      if (setIndex === dragSetIndex && dragGroupIndex < groupIndex) {
        console.log("moving up within the same set, adjust the index");
        spliceIndex--;
      }
      spiritBoard.growth.growthSets[setIndex].growthGroups.splice(spliceIndex, 0, groupClone);

      // Need to fix the IDs we just messed up.
      resetIDs(spiritBoard.growth.growthSets[setIndex].growthGroups);
      // simulate a click (which is super nasty but YOLO)
      document.getElementById("updateButton").click();

      hoveringOverGroup = null;
    }
  }

  function resetIDs(resetGroup) {
    // Resets IDs in a growth group
    Object.keys(resetGroup).forEach((k) => (resetGroup[k].id = k));
  }

  function switchLeft(growthGroup) {
    growthGroup.hasTitleLeft = !growthGroup.hasTitleLeft;
    console.log(growthGroup);
    spiritBoard = spiritBoard;
  }

  function hideGrowthTexts() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let growthPanel = previewFrame.document.getElementsByTagName("growth")[0];
    growthPanel.classList.add("hide-text");
  }

  function toggleNewRow(growthGroup) {
    growthGroup.newRow = !growthGroup.newRow;
    spiritBoard = spiritBoard;
  }

  export let spiritBoard;
</script>

<Section title="Growth" bind:isVisible={spiritBoard.growth.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="growth" />
  </div>
  {#if !spiritBoard.growth.useGrowthSets}
    <div class="control is-flex is-justify-content-space-between">
      <label class="label is-unselectable mr-1 mt-1 is-small" for="growthDirections"
        >Directions:
      </label>
      <input
        id="growthDirections"
        class="input is-small"
        type="text"
        placeholder="Growth Directions (ie. &quot;Pick Two&quot;)"
        bind:value={spiritBoard.growth.directions} />
    </div>
  {/if}
  {#if !spiritBoard.growth.useGrowthSets}
    <div class="control">
      <button class="button is-primary is-light is-small row-button" on:click={useGrowthSets}
        >Use Growth Sets</button>
    </div>
  {:else}
    <div class="control">
      <button class="button is-danger is-light is-small row-button" on:click={removeAllGrowthSets}
        >Stop Using Growth Sets</button>
    </div>
  {/if}
  {#each spiritBoard.growth.growthSets as growthSet, i (growthSet.id)}
    <div class="growth-set">
      {#if spiritBoard.growth.useGrowthSets}
        <div class="growth-set-title">
          <div />
          <div class="label is-unselectable">Set {i + 1}</div>
          <button class="button growth-set-button" on:click={removeGrowthSet(i)}>&#10006;</button>
        </div>
      {/if}
      <div class="growth-set-info">
        {#if spiritBoard.growth.useGrowthSets}
          <div class="control is-flex is-justify-content-space-between">
            <label class="label is-unselectable mr-1 mt-1 is-small" for={`growthSetChoice${i}`}
              >Set Directions:
            </label>
            <input
              id={`growthSetChoice${i}`}
              class="input is-small"
              style="width:70%;"
              type="text"
              placeholder="Growth Set Choice ie. (PICK ONE OF)"
              bind:value={growthSet.choiceText} />
          </div>
        {/if}
        {#each growthSet.growthGroups as growthGroup, j (growthGroup.id)}
          <div
            class="growth-group"
            on:dragstart={(event) => dragStartGroup(event, i, j)}
            on:dragend={handleoffdraggable}
            on:drop={(event) => dropGroup(event, i, j)}
            on:dragover={(event) => event.preventDefault()}
            on:dragenter={() => (hoveringOverGroup = draggingGroup ? i + "" + j : null)}
            class:hovering={hoveringOverGroup === i + "" + j}>
            <div class="growth-group-title">
              <div
                class="growth-group-handle"
                on:mousedown={handleongroup}
                on:mouseup={handleoffgroup} />
              <div class="label is-unselectable">Group {j + 1}</div>
              <button class="button growth-group-button" on:click={removeGrowthGroup(i, j)}
                >&#10006;</button>
            </div>
            <div class="growth-group-info">
              <div>
                {#if !growthGroup.hasCost}
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setCost(i, j)}>Add Cost</button>
                {/if}
                {#if !growthGroup.hasTint}
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setTint(i, j)}>Color Tint</button>
                {/if}
                {#if !growthGroup.hasTitle}
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setTitle(i, j)}>Add Title</button>
                {/if}
                {#if !growthGroup.hasTitle}
                  <button
                    class:is-light={growthGroup.newRow !== true}
                    class="button is-warning is-light is-small row-button"
                    on:click={toggleNewRow(growthGroup)}>Start New Growth Row</button>
                {/if}
              </div>
              {#if growthGroup.hasCost}
                <div class="growth-action-container">
                  <div class="field-label  is-small is-unselectable">Cost</div>
                  <div class="control">
                    <input
                      id={`set${i}group${j}cost`}
                      class="input  is-small"
                      type="text"
                      placeholder="Try &quot;2&quot; or &quot;3,dahan&quot;"
                      on:keyup={nextNode}
                      bind:value={growthGroup.cost} />
                  </div>
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setCost(i, j)}>Remove</button>
                </div>
              {/if}
              {#if growthGroup.hasTint}
                <div class="growth-action-container">
                  <div class="field-label  is-small is-unselectable">Tint</div>
                  <div class="control">
                    <input
                      id={`set${i}group${j}tint`}
                      class="input  is-small"
                      type="text"
                      placeholder="Try &quot;blue&quot; or &quot;#ff0058&quot;"
                      on:keyup={nextNode}
                      bind:value={growthGroup.tint} />
                  </div>
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setTint(i, j)}>Remove</button>
                </div>
              {/if}
              {#if growthGroup.hasTitle}
                <div class="growth-action-container">
                  <div class="field-label is-small is-unselectable">Title</div>
                  <div class="control">
                    <input
                      id={`set${i}group${j}title`}
                      class="input  is-small"
                      type="text"
                      placeholder="Try &quot;Max 1/Game&quot;"
                      on:keyup={nextNode}
                      bind:value={growthGroup.title} />
                  </div>
                  {#if !growthGroup.hasTitleLeft}
                    <button
                      class="button is-warning is-light is-small row-button"
                      on:click={switchLeft(growthGroup)}>Left</button>
                  {:else}
                    <button
                      class="button is-warning is-small row-button"
                      on:click={switchLeft(growthGroup)}>Left</button>
                  {/if}
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setTitle(i, j)}>Remove</button>
                </div>
              {/if}
              {#each growthGroup.growthActions as growthAction, k (growthAction.id)}
                <div
                  class="growth-action-container"
                  on:dragstart={(event) => dragStart(event, i, j, k)}
                  on:dragend={handleoffdraggable}
                  on:drop|preventDefault={(event) => dropAction(event, i, j, k)}
                  on:dragover={(event) => event.preventDefault()}
                  on:dragenter={() =>
                    (hoveringOverAction = draggingAction ? i + "" + j + "" + k : null)}
                  class:hovering={hoveringOverAction === i + "" + j + "" + k}>
                  <div
                    class="growth-action-handle"
                    on:mousedown={handleon}
                    on:mouseup={handleoff}
                    on:dragover={(event) => event.preventDefault()} />
                  <div class="control" style="width:100%;">
                    <AutoComplete
                      id={`growthSet${i}Group${j}Action${k}`}
                      elementType="input"
                      classNames="is-small"
                      placeholder="Growth Action"
                      showListImmediately={true}
                      validAutoCompleteValues={growthValuesSorted}
                      additionalOnBlurFunction={() => updateGrowthActionLocal(i, j, k)}
                      bind:value={growthAction.effect} />
                  </div>
                  <!-- <button
                    class="button is-warning is-light is-small row-button"
                    on:click={updateGrowthActionLocal(i, j, k)}
                    on:dragover={(event) => event.preventDefault()}>&#x21bb;</button> -->
                  <button
                    class="button is-light is-small row-button"
                    on:click={removeGrowthAction(i, j, k)}
                    on:dragover={(event) => event.preventDefault()}>Remove</button>
                </div>
              {/each}
              <div
                class="control"
                class:hovering={hoveringOverAction ===
                  i + "" + j + "" + growthGroup.growthActions.length}>
                <button
                  id={`growthSet${i}Group${j}AddAction`}
                  class="button is-primary is-light is-small row-button"
                  on:click={addGrowthAction(i, j)}
                  on:drop|preventDefault={(event) =>
                    dropAction(event, i, j, growthGroup.growthActions.length)}
                  on:dragover={(event) => event.preventDefault()}
                  on:dragenter={() =>
                    (hoveringOverAction = draggingAction
                      ? i + "" + j + "" + growthGroup.growthActions.length
                      : null)}>Add Growth Action</button>
              </div>
            </div>
          </div>
        {/each}
        <div class="field">
          <div
            class="control"
            class:hovering={hoveringOverGroup === i + "" + growthSet.growthGroups.length}>
            <button
              class="button is-primary is-light is-small row-button"
              on:click={addGrowthGroup(i)}
              on:drop={(event) => dropGroup(event, i, growthSet.growthGroups.length)}
              on:dragover={(event) => event.preventDefault()}
              on:dragenter={() =>
                (hoveringOverGroup = draggingGroup ? i + "" + growthSet.growthGroups.length : null)}
              >Add Growth Group</button>
          </div>
        </div>
      </div>
    </div>
  {/each}
  {#if spiritBoard.growth.useGrowthSets}
    <div class="field">
      <div class="control">
        <button class="button is-primary is-light is-small row-button" on:click={addGrowthSet}
          >Add Growth Set</button>
      </div>
    </div>
  {/if}
  <label class="label mt-2 mb-0" for="hideGrowthTextButton">Special Options</label>
  <div class="control">
    <button class="button is-warning is-light is-small row-button" on:click={hideGrowthTexts}
      >Hide Growth Texts</button>
  </div>
</Section>
