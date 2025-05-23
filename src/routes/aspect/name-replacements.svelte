<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import * as Lib from "../lib";

  export let aspect;

  function setComplexity(val, aspectHolder) {
    aspectHolder.complexity = val;
    aspect = aspect;
    console.log(aspect);
    console.log(aspect.nameReplacements.complexity);
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
    aspect.nameReplacements.hasBack = !aspect.nameReplacements.hasBack;
    aspect = aspect;
  }

  function toggleProfile() {
    aspect.profile = !aspect.profile;
    aspect = aspect;

    document.getElementById("updateButton").click();
  }

  function addReplacement() {
    let focusId = "replacesInput" + aspect.nameReplacements.replacements.length;
    aspect.nameReplacements.replacements.push({
      id: aspect.nameReplacements.replacements.length,
      aspectRelacement: "",
      rulesReplaced: "",
    });
    //Set the focus to the Special Rule if it is visible.
    if (aspect.nameReplacements.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    aspect = aspect;
  }

  function removeReplacement(index) {
    aspect.nameReplacements.replacements.splice(index, 1);
    aspect.nameReplacements.replacements.forEach((replacement, i) => {
      replacement.id = i;
    });
    aspect = aspect;
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }
</script>

<Section title="Name & Rules Replacements" bind:isVisible={aspect.nameReplacements.isVisible}>
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
            bind:value={aspect.nameReplacements.aspectName} />
        </div>
      </div>
    </div>
    <div class="field mb-3">
      {#each aspect.nameReplacements.replacements as replacement, i (replacement.id)}
        <div class="field is-flex is-small is-flex-direction-row mb-1">
          <div class="field is-flex is-small is-flex-direction-column mb-0" style="width:30%">
            <label
              class="label is-flex is-justify-content-space-between mb-0 is-small"
              for="replacesInput"
              >Replacement #{i + 1}
            </label>
            <div class="field is-flex is-small mb-0">
              <div class="control" style="width:100%">
                <input
                  id="replacesInput{i}"
                  class="input is-small"
                  type="text"
                  placeholder="ie. Replaces Special Rule"
                  on:keydown={nextNode}
                  on:focus={selectNode}
                  bind:value={replacement.aspectRelacement} />
              </div>
            </div>
          </div>
          <div
            class="field is-flex is-small is-flex-direction-column is-justify-content-space-between mb-0"
            style="width:70%">
            <label
              class="label is-flex is-justify-content-space-between mb-0 is-small"
              for="rulesReplacedInput{i}"
              >Rule/Power Name
            </label>
            <div class="field is-flex is-small mb-0">
              <div class="control" style="width:100%">
                <input
                  id="rulesReplacedInput{i}"
                  class="input is-small"
                  type="text"
                  placeholder="ie. The Name of a Spirit's Special Rule"
                  on:keydown={nextNode}
                  on:focus={selectNode}
                  bind:value={replacement.rulesReplaced} />
              </div>
            </div>
          </div>
          <button
            class="button is-primary is-light is-warning is-small row-button is-align-self-flex-end"
            on:click={removeReplacement(i)}>Remove</button>
        </div>
      {/each}
      <button class="button is-primary is-light is-small" on:click={addReplacement}
        >Add Replacement</button>
    </div>
    <div class="field has-addons">
      <label class="label is-unselectable mr-1 mt-1" for="">Complexity: </label>
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
        <button
          class="button is-danger is-small button-hold mb-0"
          class:is-light={aspect.nameReplacements.complexity !== "up"}
          on:click={setComplexity("up", aspect.nameReplacements)}>Up</button>
        <button
          class="button is-warning is-small button-hold mb-0"
          class:is-light={aspect.nameReplacements.complexity !== "equal"}
          on:click={setComplexity("equal", aspect.nameReplacements)}>Equal</button>
        <button
          class="button is-success is-small button-hold mb-0"
          class:is-light={aspect.nameReplacements.complexity !== "down"}
          on:click={setComplexity("down", aspect.nameReplacements)}>Down</button>
        <button
          class="button is-small button-hold mb-0"
          class:is-light={aspect.nameReplacements.complexity !== ""}
          on:click={setComplexity("", aspect.nameReplacements)}>None</button>
      </div>
    </div>
    <div class="field is-flex is-flex-direction-row has-addons">
      <label class="label is-flex is-justify-content-space-between" for="aspectInput"
        >Format:
      </label>
      <div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0 ml-2">
        {#if aspect.profile}
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
    </div>
    {#if aspect.nameReplacements.hasBack}
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
            bind:value={aspect.nameReplacements.spiritName} />
        </div>
      </div>
      <ImageInput id="backArt" title="Art" bind:imageURL={aspect.nameReplacements.spiritImage} />
    {:else}
      <button class="button is-warning is-light is-small row-button" on:click={setBack}
        >Add Card Back</button>
    {/if}
  </div>
</Section>
