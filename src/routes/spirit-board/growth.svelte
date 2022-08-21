<script>
  import * as Lib from "./lib";

  function useGrowthSets() {
    spiritBoard.growth.useGrowthSets = true;
  }

  function removeAllGrowthSets() {
    // "Turns off" Growth Sets, collapsing all growth groups into the first Set
    spiritBoard.growth.useGrowthSets = false;
    spiritBoard.growth.directions = "";
    var firstSet = spiritBoard.growth.growthSets[0];
    for (let i = 1; i < spiritBoard.growth.growthSets.length; i++) {
      var growthSet = spiritBoard.growth.growthSets[i];
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
    console.log(
      "hasCost=" + spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasCost
    );
  }

  function setTint(setIndex, groupIndex) {
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTint =
      !spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTint;
    console.log(
      "hasTint=" + spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].hasTint
    );
  }

  //Drag and Drop stuff
  /* 	function allowDrop(ev) {
	  ev.preventDefault();
	}

	function drag(ev) {
	  ev.dataTransfer.setData("text", ev.target.id);
	}

	function drop(ev) {
	  ev.preventDefault();
	  var data = ev.dataTransfer.getData("text");
	  ev.target.appendChild(document.getElementById(data));
	} */

  export let spiritBoard;
  export let showOrHideSection;
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="growth">
  Growth
  <span id="growth" on:click={showOrHideSection}>
    {#if spiritBoard.growth.isVisible}
      <ion-icon id="growth" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="growth" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoard.growth.isVisible}
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
      <button class="button is-primary is-light row-button" on:click={useGrowthSets}
        >Use Growth Sets</button>
    </div>
  {:else}
    <div class="control">
      <button class="button is-danger is-light row-button" on:click={removeAllGrowthSets}
        >Remove All Growth Sets</button>
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
              tabindex="1"
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
              </div>
              {#if growthGroup.hasCost}
                <div class="growth-action-container">
                  <div class="field-label  is-small is-unselectable">Cost</div>
                  <div class="control">
                    <input
                      id={`set${i}group${j}cost`}
                      class="input  is-small"
                      type="text"
                      placeholder="Cost (Energy)"
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
                      placeholder="Tint Color"
                      bind:value={growthGroup.tint} />
                  </div>
                  <button
                    class="button is-warning is-light is-small row-button"
                    on:click={setTint(i, j)}>Remove</button>
                </div>
              {/if}
              {#each growthGroup.growthActions as growthAction, k (growthAction.id)}
                <div class="growth-action-container">
                  <div class="control">
                    <input
                      id={`growthSet${i}Group${j}Action${k}`}
                      class="input"
                      type="text"
                      tabindex="1"
                      placeholder="Growth Action"
                      bind:value={growthAction.effect} />
                  </div>
                  <button
                    class="button is-warning is-light row-button"
                    on:click={removeGrowthAction(i, j, k)}>Remove</button>
                </div>
              {/each}
              <div class="control">
                <button
                  class="button is-primary is-light is-small row-button"
                  on:click={addGrowthAction(i, j)}>Add Growth Action</button>
                <!-- Could I just pass the growthgroup as growthGroup instead of the indexes? -->
              </div>
            </div>
          </div>
        {/each}
        {#if spiritBoard.growth.useGrowthSets || i === spiritBoard.growth.growthSets.length - 1}
          <div class="field">
            <div class="control">
              <button
                class="button is-primary is-light is-small row-button"
                on:click={addGrowthGroup(i)}>Add Growth Group</button>
            </div>
          </div>
        {/if}
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
{/if}
