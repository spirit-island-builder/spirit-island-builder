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
  import { markSaved } from "$lib/unsaved-changes.js";
  import { onMount, onDestroy } from "svelte";

  export let saveAction;
  export let fileName;
  export let saveType = "html";
  export let mimeType = "text/html;charset=utf-8";
  /**
   * Component keys this save writes to disk, cleared of unsaved changes once
   * the save succeeds. Leave empty for exports that cannot be loaded back.
   * @type {string[]}
   */
  export let savedKeys = [];

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

  async function execute(mode) {
    const data = saveAction();

    // An image is an export, not a save: the builder cannot load state back
    // out of a PNG, so it never clears the unsaved-changes flag.
    if (saveType === "image") return downloadImage(data, fileName, mode);

    const saved =
      saveType === "html"
        ? await downloadHTML(data, fileName, mode)
        : await downloadString(mimeType, data, fileName, mode);

    if (saved) markSaved(savedKeys);
    return saved;
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
