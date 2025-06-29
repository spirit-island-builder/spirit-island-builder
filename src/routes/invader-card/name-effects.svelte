<script>
  import Section from "$lib/section.svelte";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  // import * as Lib from "../lib";
  import ImageInput from "$lib/image-input.svelte";
  import terrains from "./terrains.json";

  export let invaderCard;

  // function selectNode(event) {
  //   let nodeID = event.target.id;
  //   document.getElementById(nodeID).select();
  // }

  // function nextNode(event) {
  //   Lib.nextNode(event);
  // }

  // function toggleBack(val) {
  //   invaderCard.showBack = val;
  //   invaderCard = invaderCard;
  //   document.getElementById("updateButton").click();
  // }

  function setType(val, card) {
    card.type = val;
    invaderCard = invaderCard;
    document.getElementById("updateButton").click();
  }

  function addField(zone, type = "", text = "", imgsrc = "", color = "#3f1d1c") {
    let focusId = `field${zone.length}`;
    console.log(focusId);
    zone.push({
      id: zone.length,
      type: type,
      text: text,
      imgsrc: imgsrc,
      color: color,
    });
    console.log(zone);
    //Set the focus to the new field if it is visible.
    if (invaderCard.card.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    invaderCard = invaderCard;
    document.getElementById("updateButton").click();
  }

  function moveField(obj, to, from) {
    console.log(to);
    obj.splice(to, 0, obj.splice(from, 1)[0]);
    obj.forEach((rule, i) => {
      rule.id = i;
    });
    console.log(obj);
    invaderCard = invaderCard;
    document.getElementById("updateButton").click();
  }

  function removeField(obj, index) {
    obj.splice(index, 1);
    obj.forEach((panel, i) => {
      panel.id = i;
    });
    invaderCard = invaderCard;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Name & Effects" bind:isVisible={invaderCard.card.isVisible}>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for={`levelNameInput`}
      >Invader Card Info
    </label>
    <label class="label is-flex is-justify-content-space-between" for={`levelNameInput`}
      >Style
    </label>
    <div
      class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap is-align-items-flex-end mb-1">
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
    {#each invaderCard.card.fields as field, i (field.id)}
      <div class="field">
        <!-- Full Title and controls -->
        <div class="field is-flex is-justify-content-space-between mb-0 is-flex-direction-column">
          <!-- Title and buttons cluster -->
          <div class="field is-flex is-justify-content-space-between mb-0 is-flex-direction-row">
            <label class="label is-unselectable mb-0 is-small" for=""
              >Content Field {i + 1}:
            </label>
            <!-- Move and remove cluster -->
            <div class="field has-addons is-tiny field-buttons" style="height:20px;">
              <button
                class="button is-light is-small"
                disabled={i === 0}
                on:click={moveField(invaderCard.card.fields, i - 1, i)}>&#11165;</button>
              <button
                class="button is-light is-small"
                disabled={i + 1 === invaderCard.card.fields.length}
                on:click={moveField(invaderCard.card.fields, i + 1, i)}>&#11167;</button>
              <button
                class="button is-warning is-small is-light"
                on:click={removeField(invaderCard.card.fields, i)}>&#10006;</button>
            </div>
          </div>
          <div
            class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap is-align-items-flex-end mb-0"
            style="height: 30px;">
            <button
              class:is-light={field.type !== "title"}
              class="button is-info button-hold mb-0 is-small"
              on:click={setType("title", field)}>Title</button>
            <button
              class:is-light={field.type !== "para"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("para", field)}>Text</button>
            <button
              class:is-light={field.type !== "reminder"}
              class="button is-info button-hold mb-0 is-small"
              on:click={setType("reminder", field)}>Reminder</button>
            <button
              class:is-light={field.type !== "image"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("image", field)}>Image</button>
            <button
              class:is-light={field.type !== "spacer"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("spacer", field)}>Spacer</button>
            {#if field.type === "para" || field.type === "reminder"}
              <div class="input-color-container">
                Color:
                <input
                  type="color"
                  class="input-color input-color-special"
                  id="colorPickerIncarna"
                  on:change={() => document.getElementById("updateButton").click()}
                  bind:value={field.color} />
              </div>
            {/if}
          </div>
        </div>

        {#if field.type === ""}
          <AutoComplete
            id={`field${i}`}
            elementType="input"
            placeholder="Effect"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={field.text} />
        {/if}
        {#if field.type === "reminder"}
          <AutoComplete
            id={`field${i}`}
            elementType="textarea"
            placeholder="Effect"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={field.text} />
        {/if}
        {#if field.type === "title"}
          <AutoComplete
            id={`field${i}`}
            elementType="input"
            placeholder="Effect"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={field.text} />
        {/if}
        {#if field.type === "para"}
          <AutoComplete
            id={`field${i}`}
            elementType="textarea"
            placeholder="Effect"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={field.text} />
        {/if}
        {#if field.type === "image"}
          <ImageInput id={`field${i}`} title="" bind:imageURL={field.imgsrc} />
        {/if}
      </div>
    {/each}
    <div class="field">
      <div class="control">
        <button
          class="button is-primary is-light is-small"
          id="addNewField"
          on:click={addField(invaderCard.card.fields)}>
          Add Another Field
        </button>
      </div>
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

<style>
  .input-color {
    padding: 0px;
  }
  .input-color-container {
    position: relative;
    overflow: hidden;
    width: 205px;
    height: 100%;
    text-indent: 10px;
  }
  .field-buttons button {
    height: 20px;
    width: 20px;
  }
</style>
