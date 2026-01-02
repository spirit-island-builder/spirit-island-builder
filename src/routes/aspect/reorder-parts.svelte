<script>
  export let aspect;
  import Section from "$lib/section.svelte";

  let hoveringOverAction;
  let draggingAction = false;

  function handleoffdraggable(e) {
    e.target.setAttribute("draggable", "false");
    draggingAction = false;
  }

  function handleon(e) {
    e.target.parentNode.setAttribute("draggable", "true");
    draggingAction = true;
  }

  function handleoff(e) {
    e.target.parentNode.setAttribute("draggable", "false");
    draggingAction = false;
  }

  function dragStart(event, actionIndex) {
    if (draggingAction) {
      const data = { actionIndex };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
    }
  }

  function dropAction(event, actionIndex) {
    if (draggingAction) {
      event.preventDefault();
      console.log("dropping on " + event.target.outerHTML);
      const json = event.dataTransfer.getData("text/plain");
      const data = JSON.parse(json);
      let dragActionIndex = data.actionIndex;

      // Effect is all that matters for Actions
      let dragAction = aspect.aspectEffects[dragActionIndex];
      let actionClone = JSON.parse(JSON.stringify(dragAction));

      // Remove the item
      removeAspectPart(data.actionIndex);

      // Splice it into its new place
      let spliceIndex = actionIndex;
      if (dragActionIndex < actionIndex) {
        console.log("moving up within the same group, adjust the index");
        spliceIndex--;
      }
      aspect.aspectEffects.splice(spliceIndex, 0, actionClone);

      // Need to fix the IDs we just messed up.
      resetIDs(aspect.aspectEffects);
      // simulate a click (which is super nasty but YOLO)
      document.getElementById("updateButton").click();
      console.log(aspect);

      hoveringOverAction = null;
    }
  }

  function removeAspectPart(aspectIndex) {
    aspect.aspectEffects.splice(aspectIndex, 1);
    aspect.aspectEffects.forEach((part, i) => {
      part.id = i;
    });
    aspect = aspect;
  }

  function resetIDs(resetGroup) {
    // Resets IDs in a growth group
    Object.keys(resetGroup).forEach((k) => (resetGroup[k].id = k));
  }
</script>

<Section title={`Reorder Parts`} bind:isVisible={aspect.reorderParts.isVisible}>
  {#each aspect.aspectEffects as part, i (part.id)}
    <div
      class="power-card-dnd-container"
      on:dragstart={(event) => dragStart(event, i)}
      on:dragend={handleoffdraggable}
      on:drop|preventDefault={(event) => dropAction(event, i)}
      on:dragover={(event) => event.preventDefault()}
      on:dragenter={() => (hoveringOverAction = draggingAction ? i : null)}
      class:hovering={hoveringOverAction === i}>
      <div
        class="power-card-handle"
        on:mousedown={handleon}
        on:mouseup={handleoff}
        on:dragover={(event) => event.preventDefault()} />
      <div class="control" style="width:100%;">
        <label class="label is-unselectable ml-1 mt-1 mb-1 is-small" for="power-card-name-label"
          >{part.nameOverride
            ? part.nameOverride
            : `${aspect.info.aspectName} (${i + 1} of ${aspect.aspectEffects.length})`}
        </label>
      </div>
    </div>
  {/each}
</Section>

<style>
  .power-card-dnd-container {
    margin: 2px;
    background-color: #b4b4b496;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
  }

  .power-card-handle {
    cursor: move;
    background-image: url("/template/_global/images/dragdots.png");
    background-repeat: no-repeat;
    background-size: contain;
    width: 12px;
    background-position: center;
    z-index: 5;
    opacity: 0.4;
    margin: 0px;
    margin-left: 4px;
    height: 26px;
  }
</style>
