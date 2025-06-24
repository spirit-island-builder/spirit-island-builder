<script>
  import Section from "$lib/section.svelte";
  // import ImageInput from "$lib/image-input.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import * as Lib from "../lib";

  export let eventCard;

  function setType(val) {
    eventCard.card.type = val;
    console.log("setting card type");
    if (val !== "choice") {
      eventCard.subevents.event = eventCard.subevents.event.slice(0, 2);
    } else {
      eventCard.card.subtype = "ch2";
      setSubeventType("ch2", eventCard.subevents);
    }
    if (val === "terror") {
      eventCard.card.subtype = "terror12";
      setSubeventType("terror12", eventCard.subevents);
    }
    if (val === "stage") {
      eventCard.card.subtype = "stage12";
      setSubeventType("stage12", eventCard.subevents);
    }
    if (val === "blight") {
      eventCard.card.subtype = "blight";
    }

    eventCard = eventCard;
    console.log(eventCard);
    console.log(eventCard.card.type);

    document.getElementById("updateButton").click();
  }

  function setSubeventType(val, eventHolder) {
    eventHolder.event[0].type = val;
    // eventHolder.event[1].type = val;
    eventCard.card.subtype = val;
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

    console.log("subevent type");
    console.log(eventHolder.event[0].type);

    document.getElementById("updateButton").click();
  }

  // let subheaders = {
  //   blight: [
  //       {
  //         name: "Healthy Island",
  //       },
  //       {
  //         name: "Blighted Island",
  //       },
  //     ],
  //     fear: [
  //       {
  //         name: "Terror Level 1",
  //       },
  //       {
  //         name: "Terror Level 2 & 3",
  //       },
  //     ],
  //   stage: {
  //     heading: [
  //       {
  //         id: 0,
  //         name: "Healthy Island",
  //       },
  //       {
  //         id: 1,
  //         name: "Blighted Island",
  //       },
  //     ],
  //   },
  // };

  // function selectNode(event) {
  //   let nodeID = event.target.id;
  //   document.getElementById(nodeID).select();
  // }

  function toggleBack(val) {
    eventCard.showBack = val;
    eventCard = eventCard;
    document.getElementById("updateButton").click();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }
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
          on:click={setType("blight", eventCard)}>Blight</button>
        <button
          class:is-light={eventCard.card.type !== "terror"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("terror", eventCard)}>Fear</button>
        <button
          class:is-light={eventCard.card.type !== "stage"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("stage", eventCard)}>Invader Stage</button>
        <button
          class:is-light={eventCard.card.type !== "choice"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("choice", eventCard)}>Choice</button>
        <!-- <button
          class:is-light={eventCard.card.type !== "adversary"}
          class="button is-info is-light button-hold mb-0"
          on:click={setType("adversary", eventCard.card)}>Adversary</button> -->
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
            on:keydown={nextNode}
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
      {#if eventCard.card.type === "healthy"}
        <div class="field has-addons">
          <label class="label is-unselectable mr-1 mt-1" for=""
            >Island (Healthy/Blighted) Sub-Event</label>
        </div>
      {/if}
      {#if eventCard.card.type === "terror"}
        <div class="field has-addons">
          <label class="label is-unselectable mr-1 mt-1" for="">Fear Sub-Event Mode:</label>
        </div>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "terror12"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("terror12", eventCard.subevents)}
          >Terror Level I + II / Terror Level III</button>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "terror1"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("terror1", eventCard.subevents)}
          >Terror Level I / Terror Level II + III</button>
      {/if}
      {#if eventCard.card.type === "stage"}
        <div class="field has-addons">
          <label class="label is-unselectable mr-1 mt-1" for=""
            >Invader Stage Sub-Event Mode:</label>
        </div>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "stage12"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("stage12", eventCard.subevents)}
          >Stages I + II / Stage III</button>
        <button
          class:is-light={eventCard.subevents.event[0].type !== "stage1"}
          class="button is-info is-light button-hold mb-0"
          on:click={setSubeventType("stage1", eventCard.subevents)}
          >Stage I / Stages II + III</button>
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
            <label class="label is-small" for={`subeventName${i}`}>Name: </label>
          </div>
          <div class="control" style="width:90%;">
            <input
              id={`subeventName${i}`}
              class="input  is-small"
              type="text"
              placeholder="Overall event name"
              on:keydown={nextNode}
              bind:value={event.name} />
          </div>
        </div>
        <div class="field">
          <label
            class="label is-flex is-justify-content-space-between is-small"
            for={`subeventEffect${i}`}
            >Effect:
          </label>
          <AutoComplete
            id={`subeventEffect${i}`}
            elementType="textarea"
            classNames="is-small"
            placeholder="Lore description of the event"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={event.effect} />
        </div>
      {/each}
    </div>
    <div class="field has-addons">
      <label class="label is-unselectable mr-1 mt-1" for="">Event Back: </label>
    </div>
    {#if eventCard.showBack === true}
      <button
        class="button is-warning is-small is-light mb-0"
        on:click={toggleBack(false, eventCard)}>Hide Back</button>
    {:else}
      <button
        class="button is-success is-small is-light mb-0"
        on:click={toggleBack(true, eventCard)}>Show Back</button>
    {/if}
  </div>
</Section>
