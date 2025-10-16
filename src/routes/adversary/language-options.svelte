<script>
  export let adversary;
  import Section from "$lib/section.svelte";

  function setLanguage(language, adversary) {
    adversary.languageOptions.language = language;
    adversary = adversary;
    document.getElementById("updateButton").click();
  }
</script>

<Section title={`Language & Options`} bind:isVisible={adversary.languageOptions.isVisible}>
  <!-- Overwriting Headings -->
  <label class="label mb-0" for="adversary-preview">Translation Support Features</label>
  <!-- Languages -->
  <div class="buttons has-addons mb-0">
    <button
      class="button is-small is-success"
      class:is-light={adversary.languageOptions.language !== "en"}
      on:click={setLanguage("en", adversary)}>English</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.languageOptions.language !== "fr"}
      on:click={setLanguage("fr", adversary)}>Français</button>
  </div>
</Section>
