<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?

  export let spiritBoardBack;
  export let showOrHideSection;

  function handleImageFileInput(event) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;
        spiritBoardBack.nameImage.img = imageURL;
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="nameArtLore">
  Name, Art and Lore
  <span on:click={showOrHideSection}>
    {#if spiritBoardBack.previewBoard.isVisible}
      <ion-icon id="nameArtLore" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="nameArtLore" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoardBack.nameArtLore.isVisible}
  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://github.com/neubee/spirit-island-builder/blob/main/docs/instructions.md#spirit-board-lore-side"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreNameInput"
      >Spirit Name
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control" style="width:100%">
        <input
          id="spiritLoreNameInput"
          class="input"
          type="text"
          placeholder="Name"
          tabindex="1"
          bind:value={spiritBoardBack.nameImage.name} />
      </div>
    </div>
    <!-- Spirit ART -->
    <div class="field has-addons is-horizontal is-justify-content-left mb-0">
      <div class="field-label is-small">
        <label class="label" for="adversaryFlagArt">Spirit Art</label>
      </div>
      <div class="control">
        <input
          accept="image/png, image/jpeg"
          on:change={handleImageFileInput}
          id="spiritLoreArt"
          name="spiritLoreArt"
          type="file"
          class="input" />
        {#if spiritBoardBack.nameImage.img}
          <img id="spiritLoreArtImage" src={spiritBoardBack.nameImage.img} alt="spirit lore art" />
        {/if}
      </div>
    </div>
  </div>
  <!-- Lore -->
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreInput"
      >Lore
    </label>
    <div class="control">
      <textarea
        id="spiritLoreInput"
        class="textarea"
        type="text"
        placeholder="Name"
        tabindex="1"
        bind:value={spiritBoardBack.lore.loreText} />
    </div>
  </div>
{/if}
