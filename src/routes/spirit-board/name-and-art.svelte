<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";

  import banners from "./banners.json";
  import InstructionsLink from "$lib/instructions/link.svelte";

  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;

  function setType(type) {
    spiritBoard.nameAndArt.starlight = type;
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function setTypeFlip(type) {
    spiritBoard.nameAndArt.flipboard = type;
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

  function addCustomOverlayImage() {
    spiritBoard.nameAndArt.overlayImages.push({
      id: spiritBoard.nameAndArt.overlayImages.length,
      name: "",
      x: `${1766 / 2}`,
      y: `${1176 / 2}`,
      w: `${250}`,
      h: "",
    });
    spiritBoard = spiritBoard;
  }

  function removeCustomOverlayImage(iconIndex) {
    spiritBoard.nameAndArt.overlayImages.splice(iconIndex, 1);
    spiritBoard.nameAndArt.overlayImages.forEach((icon, i) => {
      icon.id = i;
    });
    spiritBoard = spiritBoard;
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
    <div
      class="control buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0 ml-1">
      <button
        class:is-light={spiritBoard.nameAndArt.flipboard === true}
        class="button is-success is-small mb-0"
        on:click={() => setTypeFlip(false, spiritBoard)}>Regular</button>
      <button
        class="button is-info is-small mb-0"
        class:is-light={spiritBoard.nameAndArt.flipboard !== true}
        on:click={() => setTypeFlip(true, spiritBoard)}>Flip</button>
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
  <div class="field">
    <label class="label" for="artOverlay">Art Overlay</label>
  </div>
  <div class="mb-1 p-1 note content">
    Art overlay lets you add images on top of the spirit panel, to cover anything that is not
    otherwise built in. Tips:
    <ul>
      <li>Everything is in pixels (no units). The board is 1766px wide by 1177px tall.</li>
      <li>x is from the left side, and y is from the top (ie it will move your image down).</li>
      <li>The coordinates to go the center of your image.</li>
    </ul>
  </div>
  {#each spiritBoard.nameAndArt.overlayImages as image, i (image.id)}
    <div class="field has-addons is-flex is-flex-direction-column is-justify-content-left mb-0">
      <div class="field is-flex is-flex-direction-row is-justify-content-space-between mb-0">
        <ImageInput
          id="customOverlay{i}"
          title="Image Overlay {i + 1}"
          smallTitle
          bind:imageURL={image.name}
          info="Use % or px, and art ratio up to 9x6" />
        <button
          class="button is-warning is-light is-small row-button"
          on:click={removeCustomOverlayImage(i)}>Remove</button>
      </div>
      <div class="field is-flex is-small mb-0">
        <label class="label overlay-custom-label" for={`incarnaTokenToken`}>x: </label>
        <div class="control">
          <input
            id={`incarnaTokenName`}
            class="input is-small"
            type="text"
            placeholder="pixel"
            bind:value={image.x} />
        </div>
        <label class="label overlay-custom-label" for={`incarnaTokenToken`}>y: </label>
        <div class="control">
          <input
            id={`incarnaTokenName`}
            class="input is-small"
            type="text"
            placeholder="pixel"
            bind:value={image.y} />
        </div>
      </div>
    </div>
    <div class="field has-addons is-flex is-flex-direction-column is-justify-content-left mb-2">
      <div class="field is-flex is-small mb-0">
        <label class="label overlay-custom-label" for={`incarnaTokenToken`}>width: </label>
        <div class="control">
          <input
            id={`incarnaTokenName`}
            class="input is-small"
            type="text"
            placeholder="250"
            bind:value={image.w} />
        </div>
        <label class="label overlay-custom-label" for={`incarnaTokenToken`}>height: </label>
        <div class="control">
          <input
            id={`incarnaTokenName`}
            class="input is-small"
            type="text"
            placeholder="blank for default"
            bind:value={image.h} />
        </div>
      </div>
    </div>
  {/each}
  <div class="field is-flex is-justify-content-right">
    <div class="control">
      <button class="button is-primary is-light is-small" on:click={addCustomOverlayImage}
        >{spiritBoard.nameAndArt.overlayImages.length > 0
          ? "Another Overlay Image"
          : "Add Overlay Image"}</button>
    </div>
  </div>
</Section>

<style>
  .overlay-custom-label {
    width: 80px;
    text-align: end;
    margin-right: 5px;
  }
</style>
