<script>
  // exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard;
  export let showOrHideSection;
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="nameAndArt">
  Spirit Name & Art
  <span on:click={showOrHideSection}>
    {#if spiritBoard.nameAndArt.isVisible}
      <ion-icon id="nameAndArt" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="nameAndArt" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoard.nameAndArt.isVisible}
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

  <div class="field has-addons is-horizontal is-justify-content-left mb-0">
    <div class="field-label is-small">
      <label class="label" for="spiritArtInput">Spirit Art</label>
    </div>
    <div class="control">
      <input
        id="spiritArtInput"
        class="input is-small"
        type="text"
        disabled
        placeholder="File Name"
        bind:value={spiritBoard.nameAndArt.artPath} />
    </div>
    <button class="button is-warning is-light is-small row-button">Load File</button>
  </div>
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="spiritArtInput">Scale:</label>
    </div>
    <div class="control">
      <input
        id="spiritArtScale"
        class="input is-small"
        type="text"
        placeholder="%"
        bind:value={spiritBoard.nameAndArt.artScale} />
    </div>
  </div>
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="spiritBannerInput">Banner Art</label>
    </div>
    <div class="control">
      <input
        id="spiritBannerInput"
        class="input is-small"
        type="text"
        disabled
        placeholder="File Name"
        bind:value={spiritBoard.nameAndArt.bannerPath} />
    </div>
    <button class="button is-warning is-light is-small row-button">Load File</button>
  </div>
  <div class="field has-addons is-horizontal is-justify-content-left mb-0">
    <div class="field-label is-small">
      <label class="label" for="spiritPTInput">Energy Track Banner</label>
    </div>
    <div class="control">
      <input
        id="energyBannerInput"
        class="input is-small"
        type="text"
        disabled
        placeholder="File Name"
        bind:value={spiritBoard.nameAndArt.energyBannerPath} />
    </div>
    <button class="button is-warning is-light is-small row-button">Load File</button>
  </div>
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="spiritArtInput">Scale:</label>
    </div>
    <div class="control">
      <input
        id="energyBannerScaleInput"
        class="input is-small"
        type="text"
        placeholder="%"
        bind:value={spiritBoard.nameAndArt.energyBannerScale} />
    </div>
  </div>
  <div class="field has-addons is-horizontal is-justify-content-left mb-0">
    <div class="field-label is-small">
      <label class="label" for="playsBannerInput">Plays Track Banner</label>
    </div>
    <div class="control">
      <input
        id="playsBannerInput"
        class="input is-small"
        type="text"
        disabled
        placeholder="File Name"
        bind:value={spiritBoard.nameAndArt.playsBannerPath} />
    </div>
    <button class="button is-warning is-light is-small row-button">Load File</button>
  </div>
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="playsBannerScaleInput">Scale:</label>
    </div>
    <div class="control">
      <input
        id="playsBannerScaleInput"
        class="input is-small"
        type="text"
        placeholder="%"
        bind:value={spiritBoard.nameAndArt.playsBannerScale} />
    </div>
  </div>
  <!-- Need to add art here. We'll need a way for the user to add an art file. 
				The template looks for the art in the same folder as the template file 
				itself...how would that work with the website?  -->
{/if}
