<script context="module">
  export const instructionsURL = "/instructions";
  export let instructions;
</script>

<script>
  import { removeOutline, expandOutline, exitOutline, close as closeIcon } from "ionicons/icons";
  import { onMount } from "svelte";

  let isMinimized = false;

  let popup;
  let dragBar;

  let source = instructionsURL;
  export const open = (fragement) => {
    if (fragement) {
      source = `${instructionsURL}#${encodeURIComponent(fragement)}`;
    }
    popup.show();
  };

  onMount(() => {
    instructions = { open };
  });

  function dragPointerDown(e) {
    if (!e.isPrimary || e.button !== 0) {
      return;
    }
    e.preventDefault();
    const pointerId = e.pointerId;
    // get the mouse cursor position at startup:
    let lastMouseX = e.clientX;
    let lastMouseY = e.clientY;
    // Set the desired position to the actual position.
    popup.style.setProperty("--top", popup.offsetTop);
    popup.style.setProperty("--left", popup.offsetLeft);
    // Capture pointer events for this pointer to detect dragging.
    dragBar.setPointerCapture(e.pointerId);
    // call a function whenever the cursor moves:
    dragBar.addEventListener("pointermove", elementDrag);
    // Stop dragging, when we lose the pointer capture.
    // This happens automatically when the pointer is released.
    dragBar.addEventListener("lostpointercapture", closeDragElement);

    function elementDrag(e) {
      if (e.pointerId !== pointerId) {
        return;
      }
      // calculate the new cursor position:
      let changeX = lastMouseX - e.clientX;
      let changeY = lastMouseY - e.clientY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      // set the element's new position:
      popup.style.setProperty("--top", popup.style.getPropertyValue("--top") - changeY);
      popup.style.setProperty("--left", popup.style.getPropertyValue("--left") - changeX);
    }

    function closeDragElement(e) {
      if (e.pointerId !== pointerId) {
        return;
      }
      // document.body.style.pointerEvents = null;
      /* stop moving when mouse button is released: */
      dragBar.removeEventListener("pointerup", closeDragElement);
      dragBar.removeEventListener("pointermove", elementDrag);
    }
  }

  function minimizeWindow() {
    isMinimized = !isMinimized;
  }

  function closeWindow() {
    popup.close();
  }
</script>

<dialog
  bind:this={popup}
  data-minimized={isMinimized}
  style="height: 20rem; width: 50ch; --top: 32; --left: 32">
  <header>
    <div class="drag-bar" bind:this={dragBar} on:pointerdown={dragPointerDown}>Instructions</div>
    <div class="controls">
      <a
        href={source}
        on:click={closeWindow}
        title="Open in new tab"
        target="_blank"
        rel="noreferrer">
        <ion-icon icon={exitOutline} />
      </a>
      <button title={isMinimized ? "Expand" : "Minimize"} on:click={minimizeWindow}>
        {#if isMinimized}
          <ion-icon icon={expandOutline} />
        {:else}
          <ion-icon icon={removeOutline} />
        {/if}
      </button>
      <button title="Close" on:click={closeWindow}>
        <ion-icon icon={closeIcon} />
      </button>
    </div>
  </header>
  <iframe src={source} title="instructions" id="instructionsFrame" hidden={isMinimized} />
</dialog>

<style>
  dialog {
    position: fixed;
    z-index: 999;
    border: 2px solid #b2b2b2;
    background-color: #ffffff;
    overflow-y: hidden;
    flex-direction: column;
    box-sizing: content-box;
    user-select: none;
    /* We use clamp to keep the position of the popup inside the viewport. */
    top: clamp(0px, var(--top) * 1px, 100vh - 2rem);
    left: clamp(-30ch, var(--left) * 1px, 100vw - 12ch);
    /* reset */
    padding: 0;
    margin: 0;
  }
  dialog[open] {
    display: flex;
  }

  dialog[data-minimized="false"] {
    resize: both;
    min-width: 40ch;
    min-height: 8rem;
    padding-bottom: 10px;
  }

  dialog[data-minimized="true"] {
    resize: none;
    min-height: 2rem;
    max-height: 2rem;
  }

  header {
    display: flex;
    background-color: #0072bd;
    color: #fff;
  }
  header .drag-bar {
    cursor: move;
    padding-inline-start: 0.75rem;
    padding-block: 0.25rem;
    flex-grow: 1;
    border-inline-end: 1px solid #b2b2b2;
    touch-action: none;
  }
  header .controls {
    display: flex;
    padding-inline: 0.25rem;
    align-items: center;
  }

  header :is(button, a) {
    display: block;
    padding: 0.125rem;
    cursor: pointer;
  }
  header :is(button, a):focus-visible {
    outline: 1px auto;
  }
  header button {
    /* reset */
    /* padding is set above */
    border: unset;
    outline: unset;
    font: unset;
    color: unset;
    background: unset;
  }
  header a {
    color: unset;
  }

  ion-icon {
    display: block;
  }

  iframe {
    width: 100%;
    flex-grow: 1;
  }
</style>
