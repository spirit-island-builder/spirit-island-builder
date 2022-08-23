<script>
  import * as Lib from "./lib";
  export let spiritBoard;
  export let showOrHideSection;

  function addCustomIcon() {
    spiritBoard = Lib.addCustomIcon(spiritBoard);
  }

  function removeCustomIcon(iconIndex) {
    spiritBoard.customIcons.icons.splice(iconIndex, 1);
    spiritBoard.customIcons.icons.forEach((icon, i) => {
      icon.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function handleImageFileInput(event, i) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;
        spiritBoard.customIcons.icons[i].name = imageURL;
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="customIcons">
  Custom Icons (optional)
  <span on:click={showOrHideSection}>
    {#if spiritBoard.customIcons.isVisible}
      <ion-icon id="customIcons" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="customIcons" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoard.customIcons.isVisible}
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      Custom Icons allow you to load and then use icons that aren't pre-built into the template. <a href="https://github.com/neubee/spirit-island-builder/blob/main/docs/instructions.md#custom-icons" target="_blank">Instructions</a>
    </div>
  </article>
  {#each spiritBoard.customIcons.icons as icon, i (icon.id)}
    <div class="field has-addons is-horizontal is-justify-content-left mb-0">
      <div class="field-label is-small">
        <label class="label" for={`customIconInput${i}`}>Use: &lbrace;custom{i+1}&rbrace;</label>
      </div>
      {#if icon.name}
        <img 
          id={`customIconDisplay${i}`} 
          class="has-ratio" 
          style="height:2rem; width:2rem; object-fit: contain;" 
          src={icon.name} 
          alt={`custom${i+1}`} />
      {/if}
      <div class="file is-warning is-small">
        <label class="file-label">
          <input class="file-input" 
          id={`customIconInput${i}`} 
          type="file" 
          name={`customIconInput${i}`} 
          accept="image/png, image/jpeg" 
          on:change={(e) => {handleImageFileInput(e,i);}}>
          <span class="file-cta">
            <span class="file-label">
              Load
            </span>
          </span>
        </label>
      </div>
      <button class="button is-warning is-light is-small row-button" on:click={removeCustomIcon(i)}
        >Remove</button>
    </div>
  {/each}
  <button
    class="button is-primary is-light is-small row-button is-pulled-right mt-1"
    on:click={addCustomIcon}>Add Custom Icon</button>
{/if}
