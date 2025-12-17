<script>
  export let powerCards;
  import Section from "$lib/section.svelte";

  function setLanguage(language, cards) {
    cards.language = language;
    powerCards = cards;
    document.getElementById("updateButton").click();
  }
</script>

<Section title={`Language`} bind:isVisible={powerCards.languageOptions.isVisible}>
  <!-- Overwriting Headings -->
  <label class="label mb-0" for="spiritNameInput">Translation Support Features</label>
  <!-- Languages -->
  <div class="buttons has-addons mb-0">
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "en"}
      on:click={setLanguage("en", powerCards)}>English</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "fr"}
      on:click={setLanguage("fr", powerCards)}>Français</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "de"}
      on:click={setLanguage("de", powerCards)}>Deutsch</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "pl"}
      on:click={setLanguage("pl", powerCards)}>Polski</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "hu"}
      on:click={setLanguage("hu", powerCards)}>Magyar</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "ar"}
      on:click={setLanguage("ar", powerCards)}>عربي</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "ko"}
      on:click={setLanguage("ko", powerCards)}>한국인</button>
    <button
      class="button is-small is-success"
      class:is-light={powerCards.language !== "zh"}
      on:click={setLanguage("zh", powerCards)}>中文</button>
  </div>
</Section>
