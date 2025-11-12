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
      class:is-light={adversary.language !== "de"}
      on:click={setLanguage("de", adversary)}>Deutsch</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "pl"}
      on:click={setLanguage("pl", adversary)}>Polski</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "fr"}
      on:click={setLanguage("fr", adversary)}>Français</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "zh"}
      on:click={setLanguage("zh", adversary)}>中文</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "hu"}
      on:click={setLanguage("hu", adversary)}>Magyar</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "ar"}
      on:click={setLanguage("ar", adversary)}>عربي</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "ko"}
      on:click={setLanguage("ko", adversary)}>한국인</button>
    <button
      class="button is-small is-success"
      class:is-light={adversary.language !== "ja"}
      on:click={setLanguage("ja", adversary)}>日本語</button>
  </div>
</Section>
