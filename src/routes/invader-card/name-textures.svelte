<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import terrains from "./terrains.json";

  export let invaderCard;

  function setType(val, card) {
    card.type = val;
    invaderCard = invaderCard;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Name, Type & Texture" bind:isVisible={invaderCard.nameTexture.isVisible}>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for={`levelNameInput`}
      >Name (for export) & Style
    </label>
    <div
      class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap is-align-items-flex-end mb-1">
      <input
        id={`blightCardName`}
        class="input is-small"
        type="text"
        placeholder="Name"
        bind:value={invaderCard.card.name} />
      <button
        class:is-light={invaderCard.card.type !== "single"}
        class="button is-info button-hold mb-0 is-small"
        on:click={setType("single", invaderCard.card)}>Single</button>
      <button
        class:is-light={invaderCard.card.type !== "double"}
        class="button is-info button-hold mb-0 is-small"
        on:click={setType("double", invaderCard.card)}>Double</button>
      <button
        class:is-light={invaderCard.card.type !== "split"}
        class="button is-info button-hold mb-0 is-small"
        on:click={setType("split", invaderCard.card)}>Split</button>
    </div>
    <ImageInput
      id="topTextureArt"
      title="Top Texture"
      reload="true"
      examples={terrains}
      exampleDescription="Existing Textures"
      bind:imageURL={invaderCard.card.top} />
    {#if invaderCard.card.type === "double"}
      <ImageInput
        id="bottomTextureArt"
        title="Bottom Texture"
        reload="true"
        examples={terrains}
        exampleDescription="Existing Textures"
        bind:imageURL={invaderCard.card.bottom} />
    {/if}
  </div>
</Section>
