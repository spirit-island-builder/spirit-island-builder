<script>
  import Section from "$lib/section.svelte";
  // import ImageInput from "$lib/image-input.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import * as Lib from "../lib";

  export let eventCard;

  // function setType(val, eventHolder) {
  //   eventHolder.event[0].type = val;
  //   eventHolder.event[1].type = val;
  //   if (val === "ch3" && eventHolder.event.length < 3) {
  //     eventHolder.event.push({
  //       id: eventHolder.event.length,
  //       name: "",
  //       type: "ch3",
  //       effect: "",
  //     });
  //   }else{
  //     eventHolder.event = eventHolder.event.slice(0,2);
  //   }
  //   eventCard = eventCard;

  //   console.log(eventCard);
  //   console.log(eventCard.card.type);
  // }

  // function selectNode(event) {
  //   let nodeID = event.target.id;
  //   document.getElementById(nodeID).select();
  // }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function removeEvent(eventHolder) {
    eventHolder.event = eventHolder.event.slice(0, 1);
    eventCard = eventCard;
  }

  function addEvent(eventHolder) {
    eventHolder.event.push({
      id: eventHolder.event.length,
      name: "",
      token: "",
      effect: "",
    });
    eventCard = eventCard;
  }
</script>

<Section title="Token Events" bind:isVisible={eventCard.tokenevents.isVisible}>
  <div class="field">
    {#each eventCard.tokenevents.event as event, i (event.id)}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Token Event {i + 1}:</label>
      </div>
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
        <div class="field pr-2">
          <label class="label is-small" for={`tokenEventName${i}`}>Name: </label>
        </div>
        <div class="control" style="width:90%;">
          <input
            id={`tokenEventName${i}`}
            class="input  is-small"
            type="text"
            placeholder="Subevent name"
            on:keydown={nextNode}
            bind:value={event.name} />
        </div>
      </div>
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
        <div class="field pr-2">
          <label class="label is-small" for={`tokenEventTokens${i}`}>Tokens: </label>
        </div>
        <div class="control" style="width:90%;">
          <input
            id={`tokenEventTokens${i}`}
            class="input  is-small"
            type="text"
            placeholder="Tokens, use commas (ie. disease,strife)"
            on:keydown={nextNode}
            bind:value={event.tokens} />
        </div>
      </div>
      <div class="field">
        <label
          class="label is-flex is-justify-content-space-between is-small"
          for={`tokenEventEffects${i}`}
          >Effect:
        </label>
        <AutoComplete
          id={`tokenEventEffects${i}`}
          elementType="textarea"
          classNames="is-small"
          placeholder="Effects"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={event.effect} />
      </div>
    {/each}
    {#if eventCard.tokenevents.event.length < 2}
      <!-- Add -->
      <button
        class="button is-primary is-light is-success is-small row-button"
        on:click={addEvent(eventCard.tokenevents)}>Add 2nd Event</button>
    {:else}
      <button
        class="button is-primary is-light is-warning is-small row-button"
        on:click={removeEvent(eventCard.tokenevents)}>Remove 2nd Event</button>
    {/if}
  </div>
</Section>
