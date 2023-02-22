<script>
  import Section from "$lib/section.svelte";
  import LoadButton from "$lib/load-button.svelte";
  export let customIcons;

  function addCustomIcon() {
    customIcons.icons.push({
      id: customIcons.icons.length,
      name: "",
    });
    customIcons = customIcons;
  }

  function removeCustomIcon(iconIndex) {
    customIcons.icons.splice(iconIndex, 1);
    customIcons.icons.forEach((icon, i) => {
      icon.id = i;
    });
    customIcons = customIcons;
  }
</script>

<Section title="Custom Icons (optional)" bind:isVisible={customIcons.isVisible}>
  <div class="mb-1 p-1 note">
    Custom Icons allow you to load and then use icons that aren't pre-built into the template.
    <a
      href="https://neubee.github.io/spirit-island-builder/instructions#custom-icons"
      target="_blank">Instructions</a>
  </div>
  {#each customIcons.icons as icon, i (icon.id)}
    <div class="field has-addons is-horizontal is-justify-content-left mb-0">
      <div class="field-label is-small">
        <label class="label" for={`customIconInput${i}`}>Use: &lbrace;custom{i + 1}&rbrace;</label>
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

      <button class="button is-warning is-light is-small row-button" on:click={removeCustomIcon(i)}
        >Remove</button>
    </div>
  {/each}
  <div class="field is-flex is-justify-content-right">
    <div class="control">
      <button class="button is-primary is-light is-small" on:click={addCustomIcon}
        >Add Custom Icon</button>
    </div>
  </div>
</Section>
