<script>
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { growthValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";

  function useGrowthSets() {
    spiritBoard.growth.useGrowthSets = true;
  }

  function easyReport() {
    console.log("it ran");
  }

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

  export let spiritBoard;
</script>

<Section title="Growth" bind:isVisible={spiritBoard.growth.isVisible}>
  <div class="mb-1 p-1 note">
    <a href="https://neubee.github.io/spirit-island-builder/instructions#growth" target="_blank"
      >Instructions</a>
  </div>
  {#if !spiritBoard.growth.useGrowthSets}
    <div class="control">
      <input
        id="growthDirections"
        class="input"
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
          <div class="label is-unselectable">Growth Set</div>
          <button class="button growth-set-button" on:click={removeGrowthSet(i)}>&#10006;</button>
        </div>
      {/if}
      <div class="growth-set-info">
        {#if spiritBoard.growth.useGrowthSets}
          <div class="control">
            <input
              id={`growthSetChoice${i}`}
              class="input"
              type="text"
              placeholder="Growth Set Choice ie. (PICK ONE OF)"
              bind:value={growthSet.choiceText} />
          </div>
        {/if}
        {#each growthSet.growthGroups as growthGroup, j (growthGroup.id)}
          <div class="growth-group">
            <div class="growth-group-title">
              <div class="label is-unselectable">Growth Group</div>
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
                      placeholder="Try &quot;blue&quot;"
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
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setTitle(i, j)}>Remove</button>
                </div>
              {/if}
              {#each growthGroup.growthActions as growthAction, k (growthAction.id)}
                <div class="growth-action-container">
                  <div class="control" on:blur={easyReport}>
                    <AutoComplete
                      id={`growthSet${i}Group${j}Action${k}`}
                      elementType="input"
                      placeholder="Growth Action"
                      showListImmediately={true}
                      validAutoCompleteValues={growthValuesSorted}
                      additionalOnBlurFunction={() => updateGrowthActionLocal(i, j, k)}
                      bind:value={growthAction.effect} />
                  </div>
                  <button
                    class="button is-warning is-light row-button"
                    on:click={updateGrowthActionLocal(i, j, k)}>&#x21bb;</button>
                  <button class="button is-light row-button" on:click={removeGrowthAction(i, j, k)}
                    >Remove</button>
                </div>
              {/each}
              <div class="control">
                <button
                  id={`growthSet${i}Group${j}AddAction`}
                  class="button is-primary is-light is-small row-button"
                  on:click={addGrowthAction(i, j)}>Add Growth Action</button>
              </div>
            </div>
          </div>
        {/each}
        <div class="field">
          <div class="control">
            <button
              class="button is-primary is-light is-small row-button"
              on:click={addGrowthGroup(i)}>Add Growth Group</button>
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
</Section>
