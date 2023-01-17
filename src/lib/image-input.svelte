<script>
  export let id;
  export let title;
  export let imageURL;
  export let imageScale;
  export let includeScale = false;

  let files;

  const handleInput = () => {
    const file = files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        imageURL = event.target.result;
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  };
</script>

<div class="field has-addons is-horizontal is-justify-content-left" class:mb-0={includeScale}>
  <div class="field-label is-small">
    <label class="label" for="{id}-input">{title}</label>
  </div>
  <div class="control">
    <!-- Can use CSS to change how this looks. Maybe we could use a toggle to switch between file input and URL input -->
    <input
      id="{id}-file-input"
      accept="image/png, image/jpeg"
      bind:files
      on:change={handleInput}
      type="file"
      class="input" />
    <!-- Showing that the image is available -->
    {#if imageURL}
      <img src={imageURL} alt={title} />
    {/if}
    <div class="field has-addons is-horizontal is-justify-content-left mb-0">
      <input
        id="{id}-input"
        class="input is-small"
        type="text"
        placeholder="File Name"
        disabled
        bind:value={imageURL} />
      <button
        class="button is-warning is-light is-small row-button"
        on:click={() => (imageURL = "")}>
        Remove
      </button>
    </div>
    <!-- No need for a button because spiritBoard.nameAndArt.artPath is bound to this input already, and the image won't be loaded until the board gets generated again -->
  </div>
</div>
<!-- Spirit Art Scale -->
{#if includeScale}
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="{id}-scale">Vertical Scale:</label>
    </div>
    <div class="control">
      <input
        id="{id}-scale"
        class="input is-small"
        type="text"
        placeholder="%"
        bind:value={imageScale} />
    </div>
  </div>
{/if}

<style>
  img {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    object-position: center center;
  }
</style>
