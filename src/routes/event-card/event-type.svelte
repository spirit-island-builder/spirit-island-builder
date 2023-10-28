<script>
  import Section from "$lib/section.svelte";
  // import ImageInput from "$lib/image-input.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  // import * as Lib from "../lib";

  export let eventCard;

  function setType(val, eventHolder) {
    eventHolder.type = val;
    if (val !== "choice") {
      eventCard.subevents.event = eventCard.subevents.event.slice(0, 2);
    }
    eventCard = eventCard;
    console.log(eventCard);
    console.log(eventCard.card.type);
  }

  function setSubeventType(val, eventHolder) {
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

<Section title="Main Event" bind:isVisible={eventCard.card.isVisible}>
  <div class="field">
    <div class="field has-addons">
      <label class="label is-unselectable mr-1 mt-1" for="">Event Type: </label>
    </div>
    <div class="field has-addons">
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
        <button
          class:is-light={eventCard.card.type !== "blight"}
          class="button is-info button-hold mb-0"
          on:click={setType("blight", eventCard.card)}>Blight</button>
        <button
          class:is-light={eventCard.card.type !== "fear"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("fear", eventCard.card)}>Fear</button>
        <button
          class:is-light={eventCard.card.type !== "stage"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("stage", eventCard.card)}>Invader Stage</button>
        <button
          class:is-light={eventCard.card.type !== "choice"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("choice", eventCard.card)}>Choice</button>
        <button
          class:is-light={eventCard.card.type !== "adversary"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("adversary", eventCard.card)}>Adversary</button>
      </div>
    </div>
    {#if eventCard.card.type === "adversary" || eventCard.card.type === "choice"}
      <div class="is-flex is-flex-direction-row is-flex-wrap-nowrap pb-4">
        <div class="field pr-2" style="width:30%;">
          <label class="label " for="eventCardName">Event Name: </label>
        </div>
        <div class="control" style="width:80%;">
          <input
            id="eventCardName"
            class="input "
            type="text"
            placeholder="Overall event name"
            bind:value={eventCard.card.name} />
        </div>
      </div>
      {#if eventCard.card.type === "choice"}
        <div class="field">
          <label class="label is-flex is-justify-content-space-between" for="eventCardLore"
            >Choice Event Lore:
          </label>
          <AutoComplete
            id="eventCardLore"
            elementType="textarea"
            placeholder="Lore description of the event"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={eventCard.card.lore} />
        </div>
      {/if}
      {#if eventCard.card.type === "adversary"}
        <div class="field">
          <label class="label is-flex is-justify-content-space-between" for="eventCardInstruction"
            >Adversary Event Instructions:
          </label>
          <AutoComplete
            id="eventCardInstruction"
            elementType="textarea"
            placeholder="Adverary event instructions"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={eventCard.card.effect} />
        </div>
      {/if}
    {/if}
    <!-- Subevents -->
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
          on:click={setSubeventType("tl2", eventCard.subevents)}
          >Terror Level I & II / Terror Level III</button>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "tl3"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("tl3", eventCard.subevents)}
          >Terror Level I / Terror Level II & III</button>
      {/if}
      {#if eventCard.card.type === "stage"}
        <div class="field has-addons">
          <label class="label is-unselectable mr-1 mt-1" for=""
            >Invader Stage Sub-Event Mode:</label>
        </div>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "is2"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("is2", eventCard.subevents)}>Invader Stage I & II / III</button>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "is3"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("is3", eventCard.subevents)}>Invader Stage I / II & III</button>
      {/if}
      {#if eventCard.card.type === "choice"}
        <div class="field has-addons">
          <label class="label is-unselectable mr-1 mt-1" for="">Choice Sub-Event Mode:</label>
        </div>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "ch2"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("ch2", eventCard.subevents)}>Two Choices</button>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "ch3"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("ch3", eventCard.subevents)}>Three Choices</button>
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
  </div>
</Section>
