<script>
  export let adversary;
  import Section from "$lib/section.svelte";

  function setLanguage(language, adv) {
    adv.language = language;
    adversary = adv;
    document.getElementById("updateButton").click();
  }
</script>

<Section title={`Language & Options`} bind:isVisible={adversary.languageOptions.isVisible}>
  <!-- Overwriting Headings -->
  <label class="label mb-0" for="adversaryPreview">Translation Support Features</label>
  <!-- Languages -->
  <div class="buttons has-addons mb-0">
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "en"}
      on:click={setLanguage("en", adversary)}>English</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "fr"}
      on:click={setLanguage("fr", adversary)}>Français</button>
  </div>
</Section>
