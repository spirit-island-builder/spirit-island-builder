<script>
  import Section from "$lib/section.svelte";
  // import ImageInput from "$lib/image-input.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import * as Lib from "../lib";

  export let blightCard;

  function toggleHealthy(val) {
    blightCard.card.isStillHealthy = val;
    blightCard = blightCard;
    console.log(blightCard);
    // simulate a click (which is super nasty but YOLO)
    document.getElementById("updateButton").click();
  }

  function toggleBack(val) {
    blightCard.showBack = val;
    blightCard = blightCard;
    document.getElementById("updateButton").click();
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }
</script>

<Section title="Name & Effects" bind:isVisible={blightCard.card.isVisible}>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for={`levelNameInput`}
      >Blight Card Name, Blight, and Effects
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control" style="width:85%">
        <input
          id={`blightCardName`}
          class="input"
          type="text"
          placeholder="Name"
          on:keydown={nextNode}
          on:focus={selectNode}
          bind:value={blightCard.card.cardName} />
      </div>
      <div class="control" style="width:15%; min-width:2rem;">
        <input
          id={`blightCardBlightPerPlayer`}
          class="input"
          type="text"
          placeholder="Blight Per Player"
          on:keydown={nextNode}
          on:focus={selectNode}
          bind:value={blightCard.card.blightPerPlayer} />
      </div>
      <button
        class="button is-warning mb-0"
        class:is-light={blightCard.card.isStillHealthy === true}
        on:click={() => toggleHealthy(false)}>Blighted</button>
      <button
        class="button is-success mb-0"
        class:is-light={blightCard.card.isStillHealthy !== true}
        on:click={() => toggleHealthy(true)}>Still Healthy</button>
    </div>
    <div class="control">
      <AutoComplete
        id={`blightCardEffect`}
        elementType="textarea"
        classNames=""
        placeholder="Card Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={blightCard.card.cardEffect} />
    </div>
    {#if blightCard.showBack === true}
      <button class="button is-warning is-light mb-0" on:click={toggleBack(false, blightCard)}
        >Hide Back</button>
    {:else}
      <button class="button is-success is-light mb-0" on:click={toggleBack(true, blightCard)}
        >Show Back</button>
    {/if}
  </div>
</Section>
