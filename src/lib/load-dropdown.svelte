<script>
  import * as GoogleDrive from "$lib/google-drive.js";
  import { showToast } from "$lib/alert.js";
  import {
    SaveLocation,
    getSaveLocation,
    setSaveLocation,
    subscribeSaveLocation,
  } from "$lib/download.js";
  import { onMount, onDestroy } from "svelte";

  export let accept;
  export let loadObjectURL;
  export let loadDataURL;

  let fileInput;
  let files;
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

  function runCurrentMode() {
    if (currentMode === SaveLocation.LOCAL) {
      fileInput.click();
    } else {
      loadFromDrive();
    }
  }

  function switchAndRun(mode) {
    setSaveLocation(mode);
    currentMode = mode;
    runCurrentMode();
  }

  function handleLocalInput() {
    const file = files?.item(0);
    if (!file) return;

    showToast("📂 File loaded from system");

    if (loadObjectURL) {
      const url = URL.createObjectURL(file);
      Promise.resolve(loadObjectURL(url)).finally(() => URL.revokeObjectURL(url));
    }

    if (loadDataURL) {
      const reader = new FileReader();
      reader.onload = (e) => loadDataURL(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  async function loadFromDrive() {
    try {
      const blob = await GoogleDrive.loadFileFromDrive(accept);
      if (!blob) return;

      showToast("📂 File loaded from Google Drive");

      if (loadObjectURL) {
        const url = URL.createObjectURL(blob);
        await loadObjectURL(url);
        URL.revokeObjectURL(url);
      }

      if (loadDataURL) {
        const reader = new FileReader();
        reader.onload = (e) => loadDataURL(e.target.result);
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      alert("Google Drive load error: " + err.message);
    }
  }
</script>

<input hidden type="file" {accept} bind:files bind:this={fileInput} on:change={handleLocalInput} />

<div class="dropdown is-hoverable is-up">
  <div class="dropdown-trigger">
    <button class="button is-success mt-1 mr-1" on:click={runCurrentMode}>
      <span class="mr-2">Load</span>
      {#if currentMode === "local"}
        <img src="/src/icons/Local.png" alt="local" class="location-icon" />
      {:else}
        <img src="/src/icons/Drive.png" alt="drive" class="location-icon" />
      {/if}
    </button>
  </div>

  <div class="dropdown-menu">
    <div class="dropdown-content">
      {#if currentMode === "local"}
        <!-- Show only opposite mode -->
        <button class="button is-success" on:click|stopPropagation={() => switchAndRun("drive")}>
          <span class="mr-2">Load</span>
          <img src="/src/icons/Drive.png" alt="drive" class="location-icon" />
        </button>
      {:else}
        <button class="button is-success" on:click|stopPropagation={() => switchAndRun("local")}>
          <span class="mr-2">Load</span>
          <img src="/src/icons/Local.png" alt="local" class="location-icon" />
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  img.location-icon {
    width: 25px;
    height: 25px;
    margin: 0px;
  }
</style>
