<script>
  export let scenario;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import ImageInput from "$lib/image-input.svelte";

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

  function addPanel(zone) {
    zone.panels.push({
      id: zone.panels.length,
      comments: [],
    });
    console.log(zone);
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

<Section title="Front Info" bind:isVisible={scenario.scenarioFront.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="scenario-name" />
  </div>

  <div class="field">
    <label class="label is-unselectable mr-1 mt-1" for="">Lore: </label>
    <AutoComplete
      id={`commentLore`}
      elementType="textarea"
      placeholder="Effect"
      validAutoCompleteValues={iconValuesSorted}
      bind:value={scenario.scenarioFront.lore} />
  </div>
  {#each scenario.scenarioFront.panels as panel, j (panel.id)}
    <div class="field is-flex is-justify-content-space-between mb-0">
      <label class="label is-flex is-justify-content-space-between" for={`ruleNameInput${j}`}
        >Panel {j + 1}
      </label>
      <div class="field has-addons is-tiny" style="height:20px;">
        <button
          class="button is-light is-small"
          disabled={j === 0}
          on:click={movePanelOrComment(scenario.scenarioFront.panels, j - 1, j)}>&#11165;</button>
        <button
          class="button is-light is-small"
          disabled={j + 1 === scenario.scenarioFront.panels.length}
          on:click={movePanelOrComment(scenario.scenarioFront.panels, j + 1, j)}>&#11167;</button>
        <button
          class="button is-warning is-small is-light"
          on:click={removePanelOrComment(scenario.scenarioFront.panels, j)}>&#10006;</button>
      </div>
    </div>
    {#if panel.comments.length > 0}
      {#each panel.comments as comment, i (comment.id)}
        <div class="field">
          <!-- Full Title and controls -->
          <div class="field is-flex is-justify-content-space-between mb-0 is-flex-direction-column">
            <!-- Title and buttons cluster -->
            <div class="field is-flex is-justify-content-space-between mb-0 is-flex-direction-row">
              <label class="label is-unselectable mb-0 is-small" for=""
                >Field {i + 1} - Type:
              </label>
              <!-- Move and remove cluster -->
              <div class="field has-addons is-tiny comment-buttons">
                <button
                  class="button is-light is-small"
                  disabled={i === 0}
                  on:click={movePanelOrComment(panel.comments, i - 1, i)}>&#11165;</button>
                <button
                  class="button is-light is-small"
                  disabled={i + 1 === panel.comments.length}
                  on:click={movePanelOrComment(panel.comments, i + 1, i)}>&#11167;</button>
                <button
                  class="button is-warning is-small is-light"
                  on:click={removePanelOrComment(panel.comments, i)}>&#10006;</button>
              </div>
            </div>
            <div
              class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap is-align-items-flex-end mb-0">
              <button
                class:is-light={comment.type !== "heading"}
                class="button is-info button-hold mb-0 is-small"
                on:click={setType("heading", comment)}>Heading</button>
              <button
                class:is-light={comment.type !== "title"}
                class="button is-info button-hold mb-0 is-small"
                on:click={setType("title", comment)}>Title</button>
              <button
                class:is-light={comment.type !== "para"}
                class="button is-info is-light button-hold mb-0 is-small"
                on:click={setType("para", comment)}>Paragraph</button>
              <button
                class:is-light={comment.type !== "bullets"}
                class="button is-info is-light button-hold mb-0 is-small"
                on:click={setType("bullets", comment)}>Bullets</button>
              <button
                class:is-light={comment.type !== "image"}
                class="button is-info is-light button-hold mb-0 is-small"
                on:click={setType("image", comment)}>Image</button>
            </div>
          </div>

          {#if comment.type === ""}
            <AutoComplete
              id={`panel${j}comment${i}Front`}
              elementType="input"
              placeholder="Effect"
              validAutoCompleteValues={iconValuesSorted}
              bind:value={comment.text} />
          {/if}
          {#if comment.type === "heading"}
            <AutoComplete
              id={`panel${j}comment${i}Front`}
              elementType="input"
              placeholder="Effect"
              validAutoCompleteValues={iconValuesSorted}
              bind:value={comment.text} />
          {/if}
          {#if comment.type === "title"}
            <AutoComplete
              id={`panel${j}comment${i}Front`}
              elementType="input"
              placeholder="Effect"
              validAutoCompleteValues={iconValuesSorted}
              bind:value={comment.text} />
          {/if}
          {#if comment.type === "para"}
            <AutoComplete
              id={`panel${j}comment${i}Front`}
              elementType="textarea"
              placeholder="Effect"
              validAutoCompleteValues={iconValuesSorted}
              bind:value={comment.text} />
          {/if}
          {#if comment.type === "bullets"}
            <AutoComplete
              id={`panel${j}comment${i}Front`}
              elementType="textarea"
              placeholder="Effect"
              validAutoCompleteValues={iconValuesSorted}
              bind:value={comment.text} />
          {/if}
          {#if comment.type === "image"}
            <ImageInput
              id={`panel${j}comment${i}Front`}
              title="Image Field Input"
              bind:imageURL={comment.imgsrc} />
          {/if}
        </div>
      {/each}
    {/if}
    <div class="field">
      <div class="control">
        <button
          class="button is-primary is-light is-small"
          id="addNewField"
          on:click={addField(panel)}>
          Add Another Field
        </button>
      </div>
    </div>
  {/each}
  <div class="field">
    <div class="control">
      <button
        class="button is-primary is-light is-small"
        id="addNewPanel"
        on:click={addPanel(scenario.scenarioFront)}>
        Add Another Panel
      </button>
    </div>
  </div>
</Section>

<style>
  div.comment-buttons button {
    height: 20px;
    width: 20px;
  }
</style>
