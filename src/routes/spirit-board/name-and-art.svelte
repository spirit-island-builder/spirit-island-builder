<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";

  import Banners from "$lib/banners-modal.svelte";
  import banners from "./examples.json";

  let bannersModal;

  async function loadBanner(banner) {
    console.log(banner);
    // await loadHTMLFromURL(banner.url);
    // hideAll();
  }

  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;
</script>

<Section title="Spirit Name & Art" bind:isVisible={spiritBoard.nameAndArt.isVisible}>
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
  <!-- Banner Art -->
  <ImageInput
    id="spiritBanner"
    title="Banner Art"
    bind:imageURL={spiritBoard.nameAndArt.bannerPath} />
  <!-- Energy Track Banner -->
  <ImageInput
    id="energyBanner"
    title="Energy Track Banner"
    includeScale
    bind:imageURL={spiritBoard.nameAndArt.energyBannerPath}
    bind:imageScale={spiritBoard.nameAndArt.energyBannerScale} />
  <!-- Plays Track Banner -->
  <ImageInput
    id="playsBanner"
    title="Plays Track Banner"
    includeScale
    bind:imageURL={spiritBoard.nameAndArt.playsBannerPath}
    bind:imageScale={spiritBoard.nameAndArt.playsBannerScale} />
  <!-- Artist Credits -->
  <div class="field">
    <label class="label" for="spiritArtistCreditInput">Artist Credit(s)</label>
    <div class="control">
      <input
        id="spiritArtistCreditInput"
        class="input"
        type="text"
        placeholder="Artist credits appear in bottom left of Spirit Board"
        bind:value={spiritBoard.nameAndArt.artistCredit} />
    </div>
  </div>
</Section>
<Banners bind:this={bannersModal} {loadBanner} title="Load Examples & Official Spirits" {banners} />
