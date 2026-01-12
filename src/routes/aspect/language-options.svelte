<script>
  import Section from "$lib/section.svelte";

  // exports allow for properties to be passed into this component. So the value of aspect can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let aspect;

  function setLanguage(language, aspect) {
    aspect.languageOptions.language = language;
    aspect = aspect;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Language and Accessibility" bind:isVisible={aspect.languageOptions.isVisible}>
  <!-- Languages -->
  <label class="label mb-0" for="spiritNameInput">Translate Auto-Generated Text</label>
  <div class="buttons has-addons mb-0">
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "en"}
      on:click={setLanguage("en", aspect)}>English</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "de"}
      on:click={setLanguage("de", aspect)}>Deutsch</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "pl"}
      on:click={setLanguage("pl", aspect)}>Polski</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "fr"}
      on:click={setLanguage("fr", aspect)}>Français</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "zh"}
      on:click={setLanguage("zh", aspect)}>中文</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "hu"}
      on:click={setLanguage("hu", aspect)}>Magyar</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "ar"}
      on:click={setLanguage("ar", aspect)}>عربي</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "ko"}
      on:click={setLanguage("ko", aspect)}>한국인</button>
    <button
      class="button is-small is-success"
      class:is-light={aspect.languageOptions.language !== "ja"}
      on:click={setLanguage("ja", aspect)}>日本語</button>
  </div>
</Section>

<style>
  div.content {
    font-size: 14px;
  }
</style>
