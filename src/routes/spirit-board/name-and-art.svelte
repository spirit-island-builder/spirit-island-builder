<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";

  import banners from "./banners.json";
  import InstructionsLink from "$lib/instructions/link.svelte";

  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;

  function hideAllTexts() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("board")[0];
    spiritBoard.classList.add("hide-text");
  }

  function setType(type, spiritBoard) {
    spiritBoard.nameAndArt.starlight = type;
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function setSingleBanner() {
    spiritBoard.nameAndArt.energyBannerPath = spiritBoard.nameAndArt.bannerPath;
    spiritBoard.nameAndArt.playsBannerPath = spiritBoard.nameAndArt.bannerPath;
    spiritBoard.nameAndArt.playsBannerScale = spiritBoard.nameAndArt.unifiedBannerScale;
    spiritBoard.nameAndArt.energyBannerScale = spiritBoard.nameAndArt.unifiedBannerScale;
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function toggleSingleBanner() {
    spiritBoard.nameAndArt.isOneBanner = !spiritBoard.nameAndArt.isOneBanner;
  }

  function setLanguage(language, spiritBoard) {
    spiritBoard.nameAndArt.language = language;
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
    console.log(spiritBoard);
  }
</script>

<Section
  title="Spirit Name, Artwork, Language and Accessibility"
  bind:isVisible={spiritBoard.nameAndArt.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="spirit-name-and-art" />
  </div>
  <div class="field">
    <label class="label" for="spiritNameInput">Spirit Name</label>
    <div class="control">
      <input
        id="spiritNameInput"
        class="input"
        type="text"
        bind:value={spiritBoard.nameAndArt.name} />
    </div>
  </div>
  <div class="field has-addons">
    <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
      <div class="field mr-2">Board Type:</div>
      <button
        class:is-light={spiritBoard.nameAndArt.starlight}
        class="button is-success is-small button-hold mb-0"
        on:click={setType(false, spiritBoard)}>Regular</button>
      <button
        class:is-light={!spiritBoard.nameAndArt.starlight}
        class="button is-info is-small button-hold mb-0"
        on:click={setType(true, spiritBoard)}>Starlight Style</button>
    </div>
  </div>
  <!-- Spirit Art -->
  <ImageInput
    id="spiritArt"
    title="Spirit Art"
    includeScale
    includeInfo
    bind:imageURL={spiritBoard.nameAndArt.artPath}
    bind:imageScale={spiritBoard.nameAndArt.artScale}
    info="Use % or px, and art ratio up to 9x6" />
  <!-- Artist Credits -->
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="spiritArtistCreditInput">Artist Credit(s): </label>
    </div>
    <div class="control">
      <input
        id="spiritArtistCreditInput"
        class="input is-small"
        type="text"
        placeholder="Artist credits appear in bottom left of Spirit Board"
        bind:value={spiritBoard.nameAndArt.artistCredit} />
    </div>
  </div>
  <!-- Two buttons: Use for All, Individual Banners -->
  {#if spiritBoard.nameAndArt.isOneBanner}
    <ImageInput
      id="spiritBanner"
      title="Banner Art (Name & Tracks)"
      examples={banners}
      exampleDescription="Pre-Made Banners"
      includeScale
      bind:imageURL={spiritBoard.nameAndArt.bannerPath}
      bind:imageScale={spiritBoard.nameAndArt.unifiedBannerScale} />
    <div class="field is-flex is-justify-content-space-between">
      <button class="button is-info is-small button-hold mb-0" on:click={toggleSingleBanner}
        >More Banner Options</button>
      <button class="button is-info is-small button-hold mb-0" on:click={setSingleBanner}
        >Use for All</button>
    </div>
  {:else}
    <!-- Banner Art -->
    <ImageInput
      id="spiritBanner"
      title="Name Banner Art"
      examples={banners}
      exampleDescription="Pre-Made Banners"
      bind:imageURL={spiritBoard.nameAndArt.bannerPath} />
    <!-- Energy Track Banner -->
    <ImageInput
      id="energyBanner"
      title="Energy Track Banner"
      includeScale
      examples={banners}
      exampleDescription="Pre-Made Banners"
      bind:imageURL={spiritBoard.nameAndArt.energyBannerPath}
      bind:imageScale={spiritBoard.nameAndArt.energyBannerScale} />
    <!-- Plays Track Banner -->
    <ImageInput
      id="playsBanner"
      title="Plays Track Banner"
      includeScale
      examples={banners}
      exampleDescription="Pre-Made Banners"
      bind:imageURL={spiritBoard.nameAndArt.playsBannerPath}
      bind:imageScale={spiritBoard.nameAndArt.playsBannerScale} />
    <!-- Combined Track Banner -->
    <ImageInput
      id="combinedBanner"
      title="Combined Track Banner (ie. Finder/Snake)"
      includeScale
      bind:imageURL={spiritBoard.nameAndArt.combinedBannerPath}
      bind:imageScale={spiritBoard.nameAndArt.combinedBannerScaleV} />
    <button class="button is-info is-small button-hold mb-0" on:click={toggleSingleBanner}
      >Use Single Banner Input</button>
  {/if}
  <!-- Overwriting Headings -->
  <label class="label mb-0" for="spiritNameInput">Translation Support Features</label>
  <label class="label is-small " for="spiritNameInput">Headings</label>
  <!-- Languages -->
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
  </div>
  <div class="content">
    Translation support is incomplete. For growth and presence tracks, put "*Any custom text" at the
    end of your options to re-write the auto-generated text.
  </div>
  <label class="label is-small " for="spiritNameInput">Custom headings</label>
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
  <div class="control">
    <button class="button is-success is-small is-light row-button" on:click={hideAllTexts}
      >Remove Other Unchangeable Text <i>(so you can add in text in your langauge)</i></button>
  </div>
</Section>
