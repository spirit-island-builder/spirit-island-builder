<script>
  import Section from "$lib/section.svelte";
  export let spiritBoardBack;

  function setLanguage(language, back) {
    back.language = language;
    spiritBoardBack = back;
    document.getElementById("updateButton").click();
  }
</script>

<Section
  title="Language and Accessibility"
  bind:isVisible={spiritBoardBack.languageOptions.isVisible}>
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
      on:click={setLanguage("zh", spiritBoardBack)}>中文</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoardBack.language !== "hu"}
      on:click={setLanguage("hu", spiritBoardBack)}>Magyar</button>
  </div>
</Section>
