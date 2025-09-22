<script>
  import { createEventDispatcher } from "svelte";
  import * as GoogleDrive from "$lib/google-drive.js";

  const dispatch = createEventDispatcher();

  export let accept;
  export let loadObjectURL;
  export let loadDataURL;
  export let hovertext = "";

  let fileInput;
  let files;

  const handleInput = () => {
    const file = files.item(0);
    if (file) {
      if (loadObjectURL) {
        let url = URL.createObjectURL(file);
        Promise.resolve(loadObjectURL(url)).finally(() => {
          URL.revokeObjectURL(url);
        });
      }
      if (loadDataURL) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          loadDataURL(event.target.result);
        };

        // This reads the file and then triggers the onload function above once it finishes
        fileReader.readAsDataURL(file);
      }
    }
  };

  async function handleDriveLoad() {
    try {
      const blob = await GoogleDrive.loadFileFromDrive(accept);

      if (!blob) {
        // User cancelled the picker, do nothing
        return;
      }

      if (loadObjectURL) {
        const url = URL.createObjectURL(blob);
        await loadObjectURL(url);
        URL.revokeObjectURL(url);
      }

      if (loadDataURL) {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadDataURL(event.target.result);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      alert("Google Drive load error: " + err.message);
    }
  }

</script>

<div class="dropdown is-hoverable is-up">
  <div class="dropdown-trigger">
    <button class="button is-success mt-1 mr-1" aria-haspopup="true" aria-controls="dropdown-menu4">
      Load
    </button>
  </div>

  <div class="dropdown-menu" id="dropdown-menu4" role="menu">
    <div class="dropdown-content">
      <!-- Google Drive Load -->
      <div class="button is-success mr-1 dropdown-item" on:click={handleDriveLoad}>
          Drive
      </div>
      <!-- Local Load -->
      <div>
        <input hidden type="file" {accept} bind:files bind:this={fileInput} on:change={handleInput} />
        <button
          class="button is-success mt-1 mr-1 dropdown-item"
          title={hovertext}
          on:click={() => fileInput.click()}>
          Local
        </button>
      </div>
    </div>
  </div>
</div>
