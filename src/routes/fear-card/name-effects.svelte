<script>
  import Section from "$lib/section.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import * as Lib from "../lib";

  export let fearCard;

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function toggleBack(val) {
    fearCard.showBack = val;
    fearCard = fearCard;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Name & Effects" bind:isVisible={fearCard.card.isVisible}>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for={`levelNameInput`}
      >Fear Card Name and Terror Levels
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control">
        <input
          id={`fearCardName`}
          class="input"
          type="text"
          placeholder="Name"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={fearCard.card.cardName} />
      </div>
      {#if fearCard.showBack === true}
        <button class="button is-warning is-light mb-0" on:click={toggleBack(false, fearCard)}
          >Hide Back</button>
      {:else}
        <button class="button is-success is-light mb-0" on:click={toggleBack(true, fearCard)}
          >Show Back</button>
      {/if}
    </div>
    <div class="control">
      <AutoComplete
        id={`fearCardEffect1`}
        elementType="textarea"
        classNames="is-small"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={fearCard.card.level1} />
    </div>
    <div class="control">
      <AutoComplete
        id={`fearCardEffect2`}
        elementType="textarea"
        classNames="is-small"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={fearCard.card.level2} />
    </div>
    <div class="control">
      <AutoComplete
        id={`fearCardEffect3`}
        elementType="textarea"
        classNames="is-small"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={fearCard.card.level3} />
    </div>
  </div>
</Section>
