<script>
  import { removeOutline, expandOutline, close as closeIcon } from "ionicons/icons";

  let isMinimized = false;
  export let isShowingInstructions;
  export let instructionsSource;
  let iframeHeight = "250px";

  let popup;

  function dragMouseDown(e) {
    // get the mouse cursor position at startup:
    let lastMouseX = e.clientX;
    let lastMouseY = e.clientY;
    document.addEventListener("mouseup", closeDragElement);
    // call a function whenever the cursor moves:
    document.addEventListener("mousemove", elementDrag);

    function elementDrag(e) {
      // calculate the new cursor position:
      let changeX = lastMouseX - e.clientX;
      let changeY = lastMouseY - e.clientY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      // set the element's new position:
      popup.style.top = `${popup.offsetTop - changeY}px`;
      popup.style.left = `${popup.offsetLeft - changeX}px`;
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }
  }

  function minimizeWindow() {
    const instructionsWindow = document.getElementById("movableDialog");
    const rootStyle = document.querySelector(":root");
    rootStyle.style.setProperty("--windowWidth", `${instructionsWindow.clientWidth}px`);
    isMinimized = !isMinimized;
  }

  function closeWindow() {
    isShowingInstructions = !isShowingInstructions;
  }

  function onMouseMove(event) {
    if (event.target.id === "movableDialog") {
      iframeHeight = `${event.target.clientHeight - 50}px`;
    }
  }
</script>

<div
  id="movableDialog"
  bind:this={popup}
  class={`movableDialog ${isMinimized ? "closed" : "open"}`}>
  <div
    id="movableDialog-header"
    class="movableDialog-header is-flex is-justify-content-space-between"
    on:mousedown={dragMouseDown}>
    <div>Instructions</div>
    <div class="is-flex">
      <button on:click={minimizeWindow} class="headerButtons mr-1">
        {#if isMinimized === false}
          <span title="Minimize"><ion-icon icon={removeOutline} /></span>
        {:else}
          <span title="Expand"><ion-icon icon={expandOutline} /></span>
        {/if}
      </button>
      <button on:click={closeWindow} class="headerButtons">
        <span title="Close"><ion-icon icon={closeIcon} /></span>
      </button>
    </div>
  </div>
  <div class={`${isMinimized ? "iframeClosed" : "iframeOpen"}`}>
    <iframe
      src={instructionsSource}
      width="100%"
      height={iframeHeight}
      title="instructions"
      id="instructionsFrame" />
  </div>
</div>

<style>
  .movableDialog {
    position: absolute;
    z-index: 999;
    border: 2px solid #b2b2b2;
  }

  .open {
    min-width: 500px;
    height: 300px;
    width: 500px;
    background-color: #e1e1e1;
    overflow-y: hidden;
    resize: both;
  }

  :root {
    --windowWidth: 500px;
  }
  .closed {
    background-color: #e1e1e100;
    overflow-y: hidden;
    resize: none;
    width: var(--windowWidth);
    height: 45px;
    border: none;
  }

  .iframeOpen {
    display: inherit;
  }

  .iframeClosed {
    display: none;
  }

  .movableDialog-header {
    padding-inline: 0.75rem;
    padding-block: 0.25rem;
    cursor: move;
    background-color: #0072bd;
    color: #fff;
  }

  .headerButtons {
    display: block;
    cursor: pointer;
    /* reset */
    padding: unset;
    border: unset;
    outline: unset;
    font: unset;
    color: unset;
    background: unset;
  }
  .headerButtons ion-icon {
    display: block;
  }
</style>
