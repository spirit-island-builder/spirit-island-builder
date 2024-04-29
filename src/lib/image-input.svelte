<script>
  export let id;
  export let title;
  export let imageURL;
  export let imageScale;
  export let includeScale = false;
  export let info;
  export let includeInfo = false;
  export let examples = null;
  export let exampleDescription = "Example";

  import ExampleModal from "./example-modal.svelte";
  let examplesModal;

  async function loadExample(banner) {
    console.log(banner);
    imageURL = banner.imageURL;
  }

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

<div class="field">
  <label class="label" for="{id}-input">{title}</label>
</div>
<div class="field has-addons is-horizontal is-justify-content-left" class:mb-0={includeScale}>
  <div class="control" style="width: 100%;">
    <div class="field  is-horizontal is-justify-content-left mb-1">
      <!-- Can use CSS to change how this looks. Maybe we could use a toggle to switch between file input and URL input -->
      <input
        id="{id}-file-input"
        accept="image/png, image/jpeg"
        bind:files
        on:change={handleInput}
        type="file"
        class="input is-small" />
      <!-- Showing that the image is available -->
      {#if examples}
        <div class="field  is-horizontal is-justify-content-left">
          <button
            class="button js-modal-trigger is-small"
            style="background-color: rgb(239 239 239);"
            on:click={examplesModal.open}>
            or use {exampleDescription}
          </button>
          <ExampleModal
            bind:this={examplesModal}
            {loadExample}
            title="Load {exampleDescription}"
            {examples} />
        </div>
      {/if}
    </div>
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
  <div class="field has-addons is-horizontal is-justify-content-left" class:mb-0={includeInfo}>
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
{#if includeInfo}
  <div class="content is-small is-flex is-justify-content-right mb-1">
    <p>
      <i>
        {info}
      </i>
    </p>
  </div>
{/if}

<style>
  img {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    object-position: center center;
  }
</style>
