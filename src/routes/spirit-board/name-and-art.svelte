<script>
  function handleImageFileInput(event) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;

        const targetId = event.target.id;
        if (targetId.toLowerCase().includes("spiritart")) {
          spiritBoard.nameAndArt.artPath = imageURL;
        } else if (targetId.toLowerCase().includes("spiritbanner")) {
          spiritBoard.nameAndArt.bannerPath = imageURL;
        } else if (targetId.toLowerCase().includes("energybanner")) {
          spiritBoard.nameAndArt.energyBannerPath = imageURL;
        } else if (targetId.toLowerCase().includes("playsbanner")) {
          spiritBoard.nameAndArt.playsBannerPath = imageURL;
        }
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }

  function removeArtSpirit() {
    spiritBoard.nameAndArt.artPath="";
  }
  
  function removeArtBanner() {
    spiritBoard.nameAndArt.bannerPath="";
  }
  
  function removeArtEnergy() {
    spiritBoard.nameAndArt.energyBannerPath="";
  }
  
  function removeArtPlays() {
    spiritBoard.nameAndArt.playsBannerPath="";
  }

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
  <!-- Spirit Art -->
  <div class="field has-addons is-horizontal is-justify-content-left mb-0">
    <div class="field-label is-small">
      <label class="label" for="spiritArtInput">Spirit Art</label>
    </div>
    <div class="control">
      <!-- Can use CSS to change how this looks. Maybe we could use a toggle to switch between file input and URL input -->
      <input
        accept="image/png, image/jpeg"
        on:change={handleImageFileInput}
        id="spiritArtFileInput"
        name="spiritArtFileInput"
        type="file"
        class="input" />
      <!-- Showing that the image is available -->
      {#if spiritBoard.nameAndArt.artPath}
        <img id="spiritArtInputImage" src={spiritBoard.nameAndArt.artPath} alt="spirit art" />
      {/if}
      <div class="field has-addons is-horizontal is-justify-content-left mb-0">
        <input
          id="spiritArtInput"
          class="input is-small"
          type="text"
          placeholder="File Name"
          disabled
          bind:value={spiritBoard.nameAndArt.artPath} />
        <button class="button is-warning is-light is-small row-button" on:click={removeArtSpirit}
          >Remove</button>
      </div>
      <!-- No need for a button because spiritBoard.nameAndArt.artPath is bound to this input already, and the image won't be loaded until the board gets generated again -->
    </div>
  </div>
  <!-- Spirit Art Scale -->
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
  <!-- Banner Art -->
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="spiritBannerInput">Banner Art</label>
    </div>
    <div class="control">
      <!-- Can use CSS to change how this looks. Maybe we could use a toggle to switch between file input and URL input -->
      <input
        accept="image/png, image/jpeg"
        on:change={handleImageFileInput}
        id="spiritBannerFileInput"
        name="spiritBannerFileInput"
        type="file"
        class="input" />
      <!-- Showing that the image is available -->
      {#if spiritBoard.nameAndArt.bannerPath}
        <img id="spiritBannerInputImage" src={spiritBoard.nameAndArt.bannerPath} alt="spirit banner" />
      {/if}
      <div class="field has-addons is-horizontal is-justify-content-left mb-0">
        <input
          id="spiritBannerInput"
          class="input is-small"
          type="text"
          placeholder="File Name"
          disabled
          bind:value={spiritBoard.nameAndArt.bannerPath} />
          <button class="button is-warning is-light is-small row-button" on:click={removeArtBanner}
          >Remove</button>
      </div>
      <!-- No need for a button because spiritBoard.nameAndArt.artPath is bound to this input already, and the image won't be loaded until the board gets generated again -->
    </div>
  </div>
  <!-- Energy Track Banner -->
  <div class="field has-addons is-horizontal is-justify-content-left mb-0">
    <div class="field-label is-small">
      <label class="label" for="energyBannerInput">Energy Track Banner</label>
    </div>
    <div class="control">
      <!-- Can use CSS to change how this looks. Maybe we could use a toggle to switch between file input and URL input -->
      <input
        accept="image/png, image/jpeg"
        on:change={handleImageFileInput}
        id="energyBannerFileInput"
        name="energyBannerFileInput"
        type="file"
        class="input" />
      <!-- Showing that the image is available -->
      {#if spiritBoard.nameAndArt.energyBannerPath}
        <img id="spiritArtInputImage" src={spiritBoard.nameAndArt.energyBannerPath} alt="energy banner art" />
      {/if}
      <div class="field has-addons is-horizontal is-justify-content-left mb-0">
        <input
          id="energyBannerInput"
          class="input is-small"
          type="text"
          placeholder="File Name"
          disabled
          bind:value={spiritBoard.nameAndArt.energyBannerPath} />
          <button class="button is-warning is-light is-small row-button" on:click={removeArtEnergy}
          >Remove</button>
      </div>
      <!-- No need for a button because spiritBoard.nameAndArt.artPath is bound to this input already, and the image won't be loaded until the board gets generated again -->
    </div>
  </div>
  <!-- Energy Track Banner Scale -->
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="energyBannerScale">Vertical Scale:</label>
    </div>
    <div class="control">
      <input
        id="energyBannerScale"
        class="input is-small"
        type="text"
        placeholder="%"
        bind:value={spiritBoard.nameAndArt.energyBannerScale} />
    </div>
  </div>
  
  <!-- Plays Track Banner -->
  <div class="field has-addons is-horizontal is-justify-content-left mb-0">
    <div class="field-label is-small">
      <label class="label" for="playsBannerInput">Plays Track Banner</label>
    </div>
    <div class="control">
      <!-- Can use CSS to change how this looks. Maybe we could use a toggle to switch between file input and URL input -->
      <input
        accept="image/png, image/jpeg"
        on:change={handleImageFileInput}
        id="playsBannerFileInput"
        name="playsBannerFileInput"
        type="file"
        class="input" />
      <!-- Showing that the image is available -->
      {#if spiritBoard.nameAndArt.playsBannerPath}
        <img id="spiritArtInputImage" src={spiritBoard.nameAndArt.playsBannerPath} alt="plays banner art" />
      {/if}
      <div class="field has-addons is-horizontal is-justify-content-left mb-0">
        <input
          id="playsBannerInput"
          class="input is-small"
          type="text"
          placeholder="File Name"
          disabled
          bind:value={spiritBoard.nameAndArt.playsBannerPath} />
        <button class="button is-warning is-light is-small row-button" on:click={removeArtPlays}
        >Remove</button>
      </div>
      <!-- No need for a button because spiritBoard.nameAndArt.artPath is bound to this input already, and the image won't be loaded until the board gets generated again -->
    </div>
  </div>
  <!-- Plays Track Banner Scale -->
  <div class="field has-addons is-horizontal is-justify-content-left">
    <div class="field-label is-small">
      <label class="label" for="playsBannerScale">Vertical Scale:</label>
    </div>
    <div class="control">
      <input
        id="playsBannerScale"
        class="input is-small"
        type="text"
        placeholder="%"
        bind:value={spiritBoard.nameAndArt.playsBannerScale} />
    </div>
  </div>
{/if}
