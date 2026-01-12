<script>
  import {
    SaveLocation,
    downloadHTML,
    downloadString,
    downloadImage,
    getSaveLocation,
    setSaveLocation,
    subscribeSaveLocation,
  } from "$lib/download.js";
  import { onMount, onDestroy } from "svelte";

  export let saveAction;
  export let fileName;
  export let saveType = "html";
  export let mimeType = "text/html;charset=utf-8";

  let currentMode = getSaveLocation();
  let unsubscribe;

  onMount(() => {
    unsubscribe = subscribeSaveLocation((newLocation) => {
      currentMode = newLocation;
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  function execute(mode) {
    const data = saveAction();

    if (saveType === "html") return downloadHTML(data, fileName, mode);
    if (saveType === "string") return downloadString(mimeType, data, fileName, mode);
    if (saveType === "image") return downloadImage(data, fileName, mode);
  }

  function runCurrentMode() {
    execute(currentMode);
  }

  function switchAndRun(newMode) {
    setSaveLocation(newMode);
    currentMode = newMode;
    execute(newMode);
  }
</script>

<div class="dropdown is-hoverable is-up">
  <div class="dropdown-trigger">
    <button class="button is-success mt-1 mr-1" on:click={runCurrentMode}>
      <span class="mr-2">Save</span>
      {#if currentMode === SaveLocation.LOCAL}
        <div alt="local" class="location-icon local" />
      {:else}
        <div alt="local" class="location-icon drive" />
      {/if}
    </button>
  </div>

  <div class="dropdown-menu">
    <div class="dropdown-content">
      <!-- Only show the option that is NOT current -->
      {#if currentMode === SaveLocation.LOCAL}
        <button
          class="button is-success"
          on:click|stopPropagation={() => switchAndRun(SaveLocation.DRIVE)}>
          <span class="mr-2">Save</span>
          <div alt="local" class="location-icon drive" />
        </button>
      {:else}
        <button
          class="button is-success"
          on:click|stopPropagation={() => switchAndRun(SaveLocation.LOCAL)}>
          <span class="mr-2">Save</span>
          <div alt="local" class="location-icon local" />
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  div.location-icon {
    width: 25px;
    height: 25px;
    margin: 0px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }
  div.local {
    background-image: url(../icons/Local.png);
  }
  div.drive {
    background-image: url(../icons/Drive.png);
  }
</style>
