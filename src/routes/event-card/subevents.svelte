<script>
  import Section from "$lib/section.svelte";
  // import ImageInput from "$lib/image-input.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  // import * as Lib from "../lib";

  export let eventCard;

  function setType(val, eventHolder) {
    eventHolder.event[0].type = val;
    eventHolder.event[1].type = val;
    if (val === "ch3" && eventHolder.event.length < 3) {
      eventHolder.event.push({
        id: eventHolder.event.length,
        name: "",
        type: "ch3",
        effect: "",
      });
    } else {
      eventHolder.event = eventHolder.event.slice(0, 2);
    }
    eventCard = eventCard;

    console.log(eventCard);
    console.log(eventCard.card.type);
  }

  // function selectNode(event) {
  //   let nodeID = event.target.id;
  //   document.getElementById(nodeID).select();
  // }

  // function nextNode(event) {
  //   Lib.nextNode(event);
  // }
</script>

<Section title="Subevents" bind:isVisible={eventCard.subevents.isVisible}>
  <div class="field">
    {#if eventCard.card.type === "blight"}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for=""
          >Island (Healthy/Blighted) Sub-Event</label>
      </div>
    {/if}
    {#if eventCard.card.type === "fear"}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Fear Sub-Event Mode:</label>
      </div>
      <button
        class:is-light={eventCard.subevents.event[0].type !== "tl2"}
        class="button is-info is-light button-hold mb-0"
        on:click={setType("tl2", eventCard.subevents)}
        >Terror Level I & II / Terror Level III</button>
      <button
        class:is-light={eventCard.subevents.event[0].type !== "tl3"}
        class="button is-info is-light button-hold mb-0"
        on:click={setType("tl3", eventCard.subevents)}
        >Terror Level I / Terror Level II & III</button>
    {/if}
    {#if eventCard.card.type === "stage"}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Invader Stage Sub-Event Mode:</label>
      </div>
      <button
        class:is-light={eventCard.subevents.event[0].type !== "is2"}
        class="button is-info is-light button-hold mb-0"
        on:click={setType("is2", eventCard.subevents)}>Invader Stage I & II / III</button>
      <button
        class:is-light={eventCard.subevents.event[0].type !== "is3"}
        class="button is-info is-light button-hold mb-0"
        on:click={setType("is3", eventCard.subevents)}>Invader Stage I / II & III</button>
    {/if}
    {#if eventCard.card.type === "choice"}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Choice Sub-Event Mode:</label>
      </div>
      <button
        class:is-light={eventCard.subevents.event[0].type !== "ch2"}
        class="button is-info is-light button-hold mb-0"
        on:click={setType("ch2", eventCard.subevents)}>Two Choices</button>
      <button
        class:is-light={eventCard.subevents.event[0].type !== "ch3"}
        class="button is-info is-light button-hold mb-0"
        on:click={setType("ch3", eventCard.subevents)}>Three Choices</button>
    {/if}
    {#if eventCard.card.type === "adversary"}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Subevent (Healthy):</label>
      </div>
    {/if}

    {#each eventCard.subevents.event as event, i (event.id)}
      <div class="field has-addons">
        <label class="label is-unselectable mr-1 mt-1" for="">Subevent {i + 1}:</label>
      </div>
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
        <div class="field pr-2">
          <label class="label is-small" for="eventCardName">Name: </label>
        </div>
        <div class="control" style="width:90%;">
          <input
            id="eventCardName"
            class="input  is-small"
            type="text"
            placeholder="Overall event name"
            bind:value={event.name} />
        </div>
      </div>
      <div class="field">
        <label class="label is-flex is-justify-content-space-between is-small" for="eventCardLore"
          >Effect:
        </label>
        <AutoComplete
          id="eventCardLore"
          elementType="textarea"
          classNames="is-small"
          placeholder="Lore description of the event"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={event.effect} />
      </div>
    {/each}
  </div>
</Section>
