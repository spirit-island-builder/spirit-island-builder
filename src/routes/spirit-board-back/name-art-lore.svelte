<script>
  import Section from "$lib/section.svelte";

  export let spiritBoardBack;

  function handleImageFileInput(event) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;
        spiritBoardBack.nameImage.img = imageURL;
        spiritBoardBack.nameImage.scale = 100;
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }

  function removeArtSpirit() {
    spiritBoardBack.nameImage.img = "";
  }
</script>

<Section title="Name, Art and Lore" bind:isVisible={spiritBoardBack.nameArtLore.isVisible}>
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#spirit-board-lore-side"
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
          bind:value={spiritBoardBack.nameImage.name} />
      </div>
    </div>
    <!-- Spirit ART -->
    <div class="field has-addons is-horizontal is-justify-content-left mb-0">
      <div class="field-label is-small">
        <label class="label" for="adversaryFlagArt">Spirit Art</label>
      </div>
      <div class="control">
        <div class="field has-addons mb-0">
          <input
            accept="image/png, image/jpeg"
            on:change={handleImageFileInput}
            id="spiritLoreArt"
            name="spiritLoreArt"
            type="file"
            class="input" />
          <button class="button is-warning is-light row-button" on:click={removeArtSpirit}
            >Remove</button>
        </div>
        {#if spiritBoardBack.nameImage.img}
          <img id="spiritLoreArtImage" src={spiritBoardBack.nameImage.img} alt="spirit lore art" />
        {/if}
      </div>
    </div>
    <div class="field has-addons is-horizontal is-justify-content-left">
      <div class="field-label is-small">
        <label class="label" for="spiritArtInput">Scale (%):</label>
      </div>
      <div class="control">
        <input
          id="spiritArtScale"
          class="input is-small"
          type="text"
          placeholder="%"
          bind:value={spiritBoardBack.nameImage.scale} />
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
        bind:value={spiritBoardBack.lore.loreText} />
    </div>
  </div>
</Section>
