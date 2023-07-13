<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";

  import banners from "./banners.json";
  import InstructionsLink from "$lib/instructions/link.svelte";

  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;
</script>

<Section title="Spirit Name & Art" bind:isVisible={spiritBoard.nameAndArt.isVisible}>
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
  <!-- Spirit Art -->
  <ImageInput
    id="spiritArt"
    title="Spirit Art"
    includeScale
    bind:imageURL={spiritBoard.nameAndArt.artPath}
    bind:imageScale={spiritBoard.nameAndArt.artScale} />
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
  <!-- Banner Art -->
  <ImageInput
    id="spiritBanner"
    title="Banner Art"
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
</Section>
