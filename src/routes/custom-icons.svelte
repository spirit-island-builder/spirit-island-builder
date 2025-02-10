<script>
  import Section from "$lib/section.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  export let customIcons;

  function addCustomIcon() {
    customIcons.icons.push({
      id: customIcons.icons.length,
      name: "",
      displayName: "",
      incarna: false,
    });
    customIcons = customIcons;
    console.log("adding custom icon");
    console.log(customIcons);
  }

  function removeCustomIcon(iconIndex) {
    customIcons.icons.splice(iconIndex, 1);
    customIcons.icons.forEach((icon, i) => {
      icon.id = i;
    });
    customIcons = customIcons;
  }
</script>

<Section title="Custom Icons" bind:isVisible={customIcons.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="custom icons" />
  </div>
  <div class="mb-1 p-1 note content">
    Custom Icons allow you to load and then use icons that aren't part of the Builder. Tips:
    <ul>
      <li>
        Add "incarna-" when using the icon to treat it like an incarna, ie.,
        &lbrace;incarna-custom1&rbrace;
      </li>
      <li>
        Add "large-","medium-","small-" when using the icon to get different sizes, ie.,
        &lbrace;medium-custom1&rbrace;
      </li>
      <li>
        Do NOT use a Display Name until you notice text like 'custom1' showing up on your board.
      </li>
    </ul>
  </div>
  {#each customIcons.icons as icon, i (icon.id)}
    <div class="field has-addons is-flex is-flex-direction-column is-justify-content-left mb-0">
      <div class="field is-flex is-flex-direction-row mb-0">
        <div class="field-label is-small">
          <label class="label" for={`customIconInput${i}`}>&lbrace;custom{i + 1}&rbrace;</label>
        </div>
        {#if icon.name}
          <img
            id={`customIconDisplay${i}`}
            class="has-ratio"
            style="height:2rem; width:2rem; object-fit: contain;"
            src={icon.name}
            alt={`custom${i + 1}`} />
        {/if}
        <LoadButton
          accept="image/png, image/jpeg"
          class="button is-file-load is-small"
          loadDataURL={(url) => {
            icon.name = url;
          }}>Load</LoadButton>

        <button
          class="button is-warning is-light is-small row-button"
          on:click={removeCustomIcon(i)}>Remove</button>
      </div>
      <div class="field is-flex is-flex-direction-row mb-1">
        <div class="field-label is-small">
          <label class="label">Display Name for custom{i + 1} (Optional):</label>
        </div>
        <div class="control">
          <input
            id={`customIconDisplayName${i}`}
            class="input is-small"
            type="text"
            placeholder="Name"
            bind:value={icon.displayName} />
        </div>
      </div>
    </div>
  {/each}
  <div class="field is-flex is-justify-content-right">
    <div class="control">
      <button class="button is-primary is-light is-small" on:click={addCustomIcon}
        >Add Custom Icon</button>
    </div>
  </div>
</Section>
