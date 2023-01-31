<script>
  import { removeOutline, expandOutline, exitOutline, close as closeIcon } from "ionicons/icons";

  let isMinimized = false;
  export let isShowingInstructions;
  export let instructionsSource;

  let popup;

  function dragMouseDown(e) {
    // get the mouse cursor position at startup:
    let lastMouseX = e.clientX;
    let lastMouseY = e.clientY;
    // Set the desired position to the actual position.
    popup.style.setProperty("--top", popup.offsetTop);
    popup.style.setProperty("--left", popup.offsetLeft);
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
      popup.style.setProperty("--top", popup.style.getPropertyValue("--top") - changeY);
      popup.style.setProperty("--left", popup.style.getPropertyValue("--left") - changeX);
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }
  }

  function minimizeWindow() {
    isMinimized = !isMinimized;
  }

  function closeWindow() {
    isShowingInstructions = !isShowingInstructions;
  }
</script>

<popup
  bind:this={popup}
  data-minimized={isMinimized}
  style="height: 20rem; width: 50ch; --top: 32; --left: 32"
  style:display={isShowingInstructions ? null : "none"}>
  <header class="is-flex is-justify-content-space-between" on:mousedown={dragMouseDown}>
    <div>Instructions</div>
    <div class="is-flex">
      <a
        href={instructionsSource}
        on:click={closeWindow}
        class="mr-1"
        target="_blank"
        rel="noreferrer">
        <span title="Open in new tab"><ion-icon icon={exitOutline} /></span>
      </a>
      <button on:click={minimizeWindow} class="mr-1">
        {#if isMinimized === false}
          <span title="Minimize"><ion-icon icon={removeOutline} /></span>
        {:else}
          <span title="Expand"><ion-icon icon={expandOutline} /></span>
        {/if}
      </button>
      <button on:click={closeWindow}>
        <span title="Close"><ion-icon icon={closeIcon} /></span>
      </button>
    </div>
  </header>
  <iframe
    src={instructionsSource}
    title="instructions"
    id="instructionsFrame"
    hidden={isMinimized} />
</popup>

<style>
  popup {
    position: fixed;
    z-index: 999;
    border: 2px solid #b2b2b2;
    background-color: #e1e1e1;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: content-box;
    /* We use clamp to keep the position of the popup inside the viewport. */
    top: clamp(0px, var(--top) * 1px, 100vh - 2rem);
    left: clamp(-30ch, var(--left) * 1px, 100vw - 12ch);
  }

  popup[data-minimized="false"] {
    resize: both;
    min-width: 40ch;
    min-height: 8rem;
  }

  popup[data-minimized="true"] {
    resize: none;
    min-height: 2rem;
    max-height: 2rem;
  }

  header {
    padding-inline: 0.75rem;
    padding-block: 0.25rem;
    cursor: move;
    background-color: #0072bd;
    color: #fff;
  }

  header button {
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
  header :is(button, a) ion-icon {
    display: block;
  }

  header a {
    display: flex;
    place-items: center;
    color: unset;
  }

  iframe {
    width: 100%;
    flex-grow: 1;
  }
</style>
