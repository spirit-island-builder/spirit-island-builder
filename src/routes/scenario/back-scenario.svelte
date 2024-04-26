<script>
  export let scenario;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  // import * as Lib from "../lib";

  // function nextNode(event) {
  //   Lib.nextNode(event);
  // }

  // function selectNode(event) {
  //   let nodeID = event.target.id;
  //   document.getElementById(nodeID).select();
  // }

  function setType(val, comment) {
    comment.type = val;
    console.log("setting comment type");
    scenario = scenario;
    document.getElementById("updateButton").click();
  }

  function addField(zone, type = "", text = "") {
    let focusId = `panel${zone.id}comment${zone.comments.length}Front`;
    console.log(focusId);
    zone.comments.push({
      id: zone.comments.length,
      type: type,
      text: text,
    });
    console.log(zone);
    //Set the focus to the new field if it is visible.
    if (scenario.info.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    scenario = scenario;
    document.getElementById("updateButton").click();
  }

  function movePanelOrComment(obj, to, from) {
    console.log(to);
    obj.splice(to, 0, obj.splice(from, 1)[0]);
    obj.forEach((rule, i) => {
      rule.id = i;
    });
    console.log(obj);
    scenario = scenario;
    document.getElementById("updateButton").click();
  }

  function removePanelOrComment(obj, index) {
    obj.splice(index, 1);
    obj.forEach((panel, i) => {
      panel.id = i;
    });
    scenario = scenario;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Back Info" bind:isVisible={scenario.scenarioBack.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="scenario-name" />
  </div>
  <div class="field">
    <label class="label is-unselectable mr-1 mt-1" for="">Left side: </label>
  </div>
  {#each scenario.scenarioBack.left.comments as comment, i (comment.id)}
    <div class="field">
      <!-- Full Title and controls -->
      <div class="field is-flex is-justify-content-space-between mb-0">
        <!-- Title and buttons cluster -->
        <div class="field is-flex is-justify-content-space-between mb-0">
          <label class="label is-unselectable mr-1 mt-1 is-small" for=""
            >Field {i + 1} - Type:
          </label>
          <div
            class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap is-align-items-flex-end mb-0">
            <button
              class:is-light={comment.type !== "heading"}
              class="button is-info button-hold mb-0 is-small"
              on:click={setType("heading", comment)}>Title</button>
            <button
              class:is-light={comment.type !== "para"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("para", comment)}>Paragraph</button>
            <button
              class:is-light={comment.type !== "bullets"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("bullets", comment)}>Bullets</button>
          </div>
        </div>
        <!-- Move and remove cluster -->
        <div class="field has-addons is-tiny comment-buttons">
          <button
            class="button is-light is-small"
            disabled={i === 0}
            on:click={movePanelOrComment(scenario.scenarioBack.left.comments, i - 1, i)}
            >&#11165;</button>
          <button
            class="button is-light is-small"
            disabled={i + 1 === scenario.scenarioBack.left.comments.length}
            on:click={movePanelOrComment(scenario.scenarioBack.left.comments, i + 1, i)}
            >&#11167;</button>
          <button
            class="button is-warning is-small is-light"
            on:click={removePanelOrComment(scenario.scenarioBack.left.comments, i)}
            >&#10006;</button>
        </div>
      </div>

      {#if comment.type === ""}
        <AutoComplete
          id={`comment${i}BackLeft`}
          elementType="input"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
      {#if comment.type === "heading"}
        <AutoComplete
          id={`comment${i}BackLeft`}
          elementType="input"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
      {#if comment.type === "para"}
        <AutoComplete
          id={`comment${i}BackLeft`}
          elementType="textarea"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
      {#if comment.type === "bullets"}
        <AutoComplete
          id={`comment${i}BackLeft`}
          elementType="textarea"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
    </div>
  {/each}
  <div class="field">
    <div class="control">
      <button
        class="button is-primary is-light is-small"
        id="addNewField"
        on:click={addField(scenario.scenarioBack.left)}>
        Add Another Field
      </button>
    </div>
  </div>

  <div class="field">
    <label class="label is-unselectable mr-1 mt-1" for="">Right side: </label>
  </div>
  {#each scenario.scenarioBack.right.comments as comment, i (comment.id)}
    <div class="field">
      <!-- Full Title and controls -->
      <div class="field is-flex is-justify-content-space-between mb-0">
        <!-- Title and buttons cluster -->
        <div class="field is-flex is-justify-content-space-between mb-0">
          <label class="label is-unselectable mr-1 mt-1 is-small" for=""
            >Field {i + 1} - Type:
          </label>
          <div
            class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap is-align-items-flex-end mb-0">
            <button
              class:is-light={comment.type !== "heading"}
              class="button is-info button-hold mb-0 is-small"
              on:click={setType("heading", comment)}>Title</button>
            <button
              class:is-light={comment.type !== "para"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("para", comment)}>Paragraph</button>
            <button
              class:is-light={comment.type !== "bullets"}
              class="button is-info is-light button-hold mb-0 is-small"
              on:click={setType("bullets", comment)}>Bullets</button>
          </div>
        </div>
        <!-- Move and remove cluster -->
        <div class="field has-addons is-tiny comment-buttons">
          <button
            class="button is-light is-small"
            disabled={i === 0}
            on:click={movePanelOrComment(scenario.scenarioBack.right.comments, i - 1, i)}
            >&#11165;</button>
          <button
            class="button is-light is-small"
            disabled={i + 1 === scenario.scenarioBack.right.comments.length}
            on:click={movePanelOrComment(scenario.scenarioBack.right.comments, i + 1, i)}
            >&#11167;</button>
          <button
            class="button is-warning is-small is-light"
            on:click={removePanelOrComment(scenario.scenarioBack.right.comments, i)}
            >&#10006;</button>
        </div>
      </div>

      {#if comment.type === ""}
        <AutoComplete
          id={`comment${i}BackRight`}
          elementType="input"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
      {#if comment.type === "heading"}
        <AutoComplete
          id={`comment${i}BackRight`}
          elementType="input"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
      {#if comment.type === "para"}
        <AutoComplete
          id={`comment${i}BackRight`}
          elementType="textarea"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
      {#if comment.type === "bullets"}
        <AutoComplete
          id={`comment${i}BackRight`}
          elementType="textarea"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={comment.text} />
      {/if}
    </div>
  {/each}
  <div class="field">
    <div class="control">
      <button
        class="button is-primary is-light is-small"
        id="addNewField"
        on:click={addField(scenario.scenarioBack.right)}>
        Add Another Field
      </button>
    </div>
  </div>
</Section>

<style>
  div.comment-buttons button {
    height: 20px;
    width: 20px;
    margin-bottom: 2px;
  }
</style>
