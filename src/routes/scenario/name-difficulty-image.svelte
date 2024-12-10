<script>
  export let scenario;
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import * as Lib from "../lib";

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }
</script>

<Section title="Name, Difficulty, and Image" bind:isVisible={scenario.info.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="scenario-name" />
  </div>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="scenarioNameInput"
      >Scenario Name & Diffuclty
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control" style="width:80%">
        <input
          id="scenarioNameInput"
          class="input"
          type="text"
          placeholder="Name"
          on:keydown={nextNode}
          on:focus={selectNode}
          bind:value={scenario.info.name} />
      </div>
      <div class="control" style="width:20%; min-width:2rem;">
        <input
          id="baseDifficulty"
          class="input"
          type="text"
          placeholder="Difficulty"
          on:keydown={nextNode}
          on:focus={selectNode}
          bind:value={scenario.info.difficulty} />
      </div>
    </div>
  </div>
  <div class="field">
    <ImageInput id="scenarioImage" title="Art" bind:imageURL={scenario.info.image} />
  </div>
</Section>
