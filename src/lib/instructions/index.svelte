<script>
  import { onMount } from "svelte";

  let isMinimized = false;
  export let isShowingInstructions;
  export let instructionsSource;
  let iframeHeight = "250px";

  function initDragElement() {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    var popup = document.getElementById("movableDialog");
    var elmnt = null;
    var headerItem = document.getElementById("movableDialog-header");

    if (headerItem) {
      headerItem.parentPopup = popup;
      headerItem.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      elmnt = this.parentPopup;

      e = e || window.event;
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      if (!elmnt) {
        return;
      }

      e = e || window.event;
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
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

  onMount(() => {
    initDragElement();
  });

  function onMouseMove(event) {
    if (event.target.id === "movableDialog") {
      iframeHeight = `${event.target.clientHeight - 50}px`;
    }
  }
</script>

<div
  id="movableDialog"
  class={`movableDialog ${isMinimized ? "closed" : "open"}`}
  on:mousemove={onMouseMove}>
  <div
    id="movableDialog-header"
    class="movableDialog-header is-flex is-justify-content-space-between">
    <div>Instructions</div>
    <div>
      {#if isMinimized === false}
        <ion-icon
          id="windowtoggle"
          class="headerButtons"
          on:click={minimizeWindow}
          name="chevron-down-outline" />
      {:else}
        <ion-icon
          id="windowtoggle"
          class="headerButtons"
          on:click={minimizeWindow}
          name="chevron-up-outline" />
      {/if}
      <span id="window-close" class="headerButtons" on:click={closeWindow}>X</span>
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
    padding: 10px;
    cursor: move;
    background-color: #0072bd;
    color: #fff;
    height: 45px;
  }

  .headerButtons {
    padding: 0px;
    cursor: pointer;
  }
</style>
