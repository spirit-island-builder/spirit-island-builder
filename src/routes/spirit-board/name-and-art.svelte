<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";

  import banners from "./banners.json";
  import InstructionsLink from "$lib/instructions/link.svelte";

  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;

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
</script>

<Section title="Spirit Name & Artwork" bind:isVisible={spiritBoard.nameAndArt.isVisible}>
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
      <label class="label mr-2" for="starlight-board-button">Board Type:</label>
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
</Section>
