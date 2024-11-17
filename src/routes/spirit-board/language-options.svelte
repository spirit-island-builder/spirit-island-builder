<script>
  import Section from "$lib/section.svelte";

  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;

  function hideAllTexts() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("board")[0];
    spiritBoard.classList.add("hide-text");
  }

  function setLanguage(language, spiritBoard) {
    spiritBoard.nameAndArt.language = language;
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
    console.log(spiritBoard);
  }
</script>

<Section title="Language and Accessibility" bind:isVisible={spiritBoard.languageOptions.isVisible}>
  <!-- Overwriting Headings -->
  <label class="label mb-0" for="spiritNameInput">Overwrite Auto-Generated Text w/ Wildcard</label>
  <div class="content is-small mb-1">
    For growth and presence tracks, put "*Any custom text" at the end of your options to re-write
    the auto-generated text. <br />For example:
    <i>add-presence(0)*Add a Presence to your favorite land</i>
  </div>
  <!-- Languages -->
  <label class="label mb-0" for="spiritNameInput">Translate Auto-Generated Text</label>
  <div class="content is-small mb-0">
    The Builder can translate the auto-generated text into some other languages (support is
    incomplete, use the * wildcard described above to fill in the gaps)
  </div>
  <div class="buttons has-addons mb-0">
    <button
      class="button is-small is-success"
      class:is-light={spiritBoard.nameAndArt.language !== "en"}
      on:click={setLanguage("en", spiritBoard)}>English</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoard.nameAndArt.language !== "de"}
      on:click={setLanguage("de", spiritBoard)}>Deutsch</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoard.nameAndArt.language !== "pl"}
      on:click={setLanguage("pl", spiritBoard)}>Polski</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoard.nameAndArt.language !== "ar"}
      on:click={setLanguage("ar", spiritBoard)}>عربي</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoard.nameAndArt.language !== "zh"}
      on:click={setLanguage("zh", spiritBoard)}>中国人</button>
    <button
      class="button is-small is-success"
      class:is-light={spiritBoard.nameAndArt.language !== "hu"}
      on:click={setLanguage("hu", spiritBoard)}>Magyar</button>
  </div>
  <label class="label mt-1 mb-0" for="spiritNameInput">Remove Auto-Generated Text</label>
  <div class="content is-small mb-1">
    If neither of the above options meets your translation needs, this button will remove all
    auto-generated text, so that you can add it back in later with an image editor.
  </div>
  <div class="control">
    <button class="button is-success is-small is-light row-button" on:click={hideAllTexts}
      >Remove Other Unchangeable Text</button>
  </div>
  <label class="label mt-1" for="spiritNameInput">Custom headings</label>
  <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
    <div class="field pr-2" style="width:30%;">
      <label class="label is-small" for="customHeadingSR">Special Rules: </label>
    </div>
    <div class="control" style="width:70%;">
      <input
        id="customHeadingSR"
        class="input is-small"
        type="text"
        placeholder="Special Rules"
        bind:value={spiritBoard.specialRules.customHeading} />
    </div>
  </div>
  <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
    <div class="field pr-2" style="width:30%;">
      <label class="label is-small" for="customHeadingSR">Growth: </label>
    </div>
    <div class="control" style="width:70%;">
      <input
        id="customHeadingSR"
        class="input is-small"
        type="text"
        placeholder="Growth"
        bind:value={spiritBoard.growth.customHeading} />
    </div>
  </div>
  <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
    <div class="field pr-2" style="width:30%;">
      <label class="label is-small" for="customHeadingSR">Presence Tracks: </label>
    </div>
    <div class="control" style="width:70%;">
      <input
        id="customHeadingSR"
        class="input is-small"
        type="text"
        placeholder="Presence Track"
        bind:value={spiritBoard.presenceTrack.customHeading} />
    </div>
  </div>
  <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
    <div class="field pr-2" style="width:30%;">
      <label class="label is-small" for="customHeadingSR">Innate Powers: </label>
    </div>
    <div class="control" style="width:70%;">
      <input
        id="customHeadingSR"
        class="input is-small"
        type="text"
        placeholder="Innate Powers"
        bind:value={spiritBoard.innatePowers.customHeading} />
    </div>
  </div>
</Section>

<style>
  div.content {
    font-size: 14px;
  }
</style>
