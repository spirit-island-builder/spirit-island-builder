<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import * as Lib from "../lib";

  export let aspect;

  function setComplexity(val, aspectHolder) {
    aspectHolder.complexity = val;
    aspect = aspect;
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let findComplexity = previewFrame.document.getElementsByTagName("complexity")[0];
    findComplexity.removeAttribute("class");
    findComplexity.setAttribute("class", val);
    let findAspectName = previewFrame.document.getElementsByTagName("aspect-name")[0];
    let findAspectSubtext = previewFrame.document.getElementsByTagName("aspect-subtext")[0];
    if (val === "") {
      findAspectName.classList.remove("has-complexity");
      findAspectSubtext.classList.remove("has-complexity");
    } else {
      findAspectName.classList.add("has-complexity");
      findAspectSubtext.classList.add("has-complexity");
    }
  }

  function setBack() {
    aspect.info.hasBack = !aspect.info.hasBack;
    aspect = aspect;
  }

  function toggleProfile() {
    aspect.info.profile = !aspect.info.profile;
    aspect = aspect;

    document.getElementById("updateButton").click();
  }

  function toggleShowparts() {
    aspect.info.showparts = !aspect.info.showparts;
    aspect = aspect;

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

<Section title="Name, Art & Info" bind:isVisible={aspect.info.isVisible}>
  <div class="field">
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for="aspectInput"
        >Aspect Name
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:100%">
          <input
            id="aspectInput"
            class="input"
            type="text"
            placeholder="Name"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={aspect.info.aspectName} />
        </div>
      </div>
    </div>
    <div class="field has-addons">
      <label class="label is-unselectable mr-1 mt-1" for="">Complexity: </label>
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
        <button
          class="button is-danger is-small button-hold mb-0"
          class:is-light={aspect.info.complexity !== "up"}
          on:click={setComplexity("up", aspect.info)}>Up</button>
        <button
          class="button is-warning is-small button-hold mb-0"
          class:is-light={aspect.info.complexity !== "equal"}
          on:click={setComplexity("equal", aspect.info)}>Equal</button>
        <button
          class="button is-success is-small button-hold mb-0"
          class:is-light={aspect.info.complexity !== "down"}
          on:click={setComplexity("down", aspect.info)}>Down</button>
        <button
          class="button is-small button-hold mb-0"
          class:is-light={aspect.info.complexity !== ""}
          on:click={setComplexity("", aspect.info)}>None</button>
      </div>
    </div>
    <div class="field is-flex is-flex-direction-row has-addons">
      <label class="label is-flex is-justify-content-space-between" for="aspectInput"
        >Format:
      </label>
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0 ml-2">
        {#if aspect.info.profile}
          <button class="button is-success is-small button-hold mb-0" id="fast-button"
            >Portrait</button>
          <button
            class="button is-success is-light is-small button-hold mb-0"
            id="slow-button"
            on:click={toggleProfile}>Landscape</button>
        {:else}
          <button
            class="button is-success is-light is-small button-hold mb-0"
            id="fast-button"
            on:click={toggleProfile}>Portrait</button>
          <button class="button is-success is-small button-hold mb-0" id="slow-button"
            >Landscape</button>
        {/if}
      </div>
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0 ml-2">
        {#if aspect.info.showparts}
          <button class="button is-success is-small button-hold mb-0" id="fast-button"
            >Show "Part"</button>
          <button
            class="button is-success is-light is-small button-hold mb-0"
            id="slow-button"
            on:click={toggleShowparts}>Hide "Part"</button>
        {:else}
          <button
            class="button is-success is-light is-small button-hold mb-0"
            id="fast-button"
            on:click={toggleShowparts}>Show "Part"</button>
          <button class="button is-success is-small button-hold mb-0" id="slow-button"
            >Hide "Part"</button>
        {/if}
      </div>
    </div>
    {#if aspect.info.hasBack}
      <button class="button is-warning is-light is-small row-button" on:click={setBack}
        >Remove Card Back</button>
      <label class="label is-flex is-justify-content-space-between" for="rulesReplacedInput"
        >Spirit Name
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:100%">
          <input
            id="aspectSpiritName"
            class="input"
            type="text"
            placeholder="The Name of a Spirit"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={aspect.info.spiritName} />
        </div>
      </div>
      <ImageInput id="backArt" title="Art" bind:imageURL={aspect.info.spiritImage} />
    {:else}
      <button class="button is-warning is-light is-small row-button" on:click={setBack}
        >Add Card Back</button>
    {/if}
  </div>
</Section>
