<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  export let spiritBoardBack;

  function setLanguage(language, back) {
    back.language = language;
    spiritBoardBack = back;
    document.getElementById("updateButton").click();
  }
</script>

<Section
  title="Name, Art, Lore and Language Options"
  bind:isVisible={spiritBoardBack.nameArtLore.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="spirit-board-lore-side" />
  </div>
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
    <ImageInput
      id="spiritLoreArt"
      title="Spirit Art"
      includeScale
      bind:imageURL={spiritBoardBack.nameImage.img}
      bind:imageScale={spiritBoardBack.nameImage.scale} />
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
  <!-- Overwriting Headings -->
  <label class="label mb-0" for="spiritNameInput">Translation Support Features</label>
  <!-- Languages -->
  <div class="buttons has-addons mb-0">
    <button
      class="button is-small is-success"
      class:is-light={spiritBoardBack.language !== "en"}
      on:click={setLanguage("en", spiritBoardBack)}>English</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoardBack.language !== "de"}
      on:click={setLanguage("de", spiritBoardBack)}>Deutsch</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoardBack.language !== "pl"}
      on:click={setLanguage("pl", spiritBoardBack)}>Polski</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoardBack.language !== "ar"}
      on:click={setLanguage("ar", spiritBoardBack)}>عربي</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoardBack.language !== "zh"}
      on:click={setLanguage("zh", spiritBoardBack)}>中国人</button>
  </div>
</Section>
