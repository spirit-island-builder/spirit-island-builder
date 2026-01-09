<script>
  export let spiritBoard;
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  function insertEnergyTrackNode(index) {
    let focusId = "energy" + (index + 1) + "builder";
    spiritBoard.presenceTrack.energyNodes.splice(index + 1, 0, {
      id: spiritBoard.presenceTrack.energyNodes.length,
      effect: "",
    });
    //Set the focus to the new Node if it is visible.
    if (spiritBoard.presenceTrack.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    spiritBoard = spiritBoard;
    insertTemplatePresenceNode(index, "energy");
  }

  function insertPlaysTrackNode(index) {
    let focusId = "plays" + (index + 1) + "builder";
    spiritBoard.presenceTrack.playsNodes.splice(index + 1, 0, {
      id: spiritBoard.presenceTrack.playsNodes.length,
      effect: "",
    });
    //Set the focus to the new Node if it is visible.
    if (spiritBoard.presenceTrack.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    spiritBoard = spiritBoard;
    insertTemplatePresenceNode(index, "card");
  }

  function insertAdditionalTrackNode(t, index) {
    let focusId = "additional" + t + "node" + (index + 1) + "builder";
    let additionalTrack = spiritBoard.presenceTrack.additionalTracks[t];
    additionalTrack.additionalNodes.splice(index + 1, 0, {
      id: additionalTrack.additionalNodes.length,
      effect: "",
    });
    //Set the focus to the new Node if it is visible.
    if (spiritBoard.presenceTrack.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function insertTemplatePresenceNode(index, type) {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let findPresenceNode = previewFrame.document.getElementById(type + index);
    let newPresenceNode = previewFrame.getPresenceNodeHtml(
      "custom(new presence node)",
      false,
      index,
      type,
      type === "energy"
    );
    const placeholder = document.createElement("td");
    placeholder.innerHTML = newPresenceNode;
    console.log(placeholder);
    findPresenceNode.parentElement.after(placeholder);
    previewFrame.updatePresenceNodeIDs();
  }

  function removeEnergyTrackNode(index) {
    spiritBoard.presenceTrack.energyNodes.splice(index, 1);
    spiritBoard.presenceTrack.energyNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function removePlaysTrackNode(index) {
    spiritBoard.presenceTrack.playsNodes.splice(index, 1);
    spiritBoard.presenceTrack.playsNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function removeAdditionalTrackNode(t, index) {
    spiritBoard.presenceTrack.additionalTracks[t].additionalNodes.splice(index, 1);
    spiritBoard.presenceTrack.additionalTracks[t].additionalNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function removeAdditionalTrack(trackIndex) {
    spiritBoard.presenceTrack.additionalTracks.splice(trackIndex, 1);
    spiritBoard.presenceTrack.additionalTracks.forEach((additionalTrack, i) => {
      additionalTrack.id = i;
    });
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }

  function updatePresenceNodeLocal() {
    console.log("update presence node");
    document.getElementById("updateButton").click();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    Lib.selectNode(event);
  }

  function addPresenceTrack() {
    spiritBoard = Lib.addPresenceTrack(spiritBoard);
    spiritBoard = spiritBoard;
    document.getElementById("updateButton").click();
  }
</script>

<Section title="Presence Tracks" bind:isVisible={spiritBoard.presenceTrack.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="presence-tracks" />
  </div>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput"
      >Energy Track
    </label>
    <div class="presence-track-row">
      {#each spiritBoard.presenceTrack.energyNodes as energyNode, i (energyNode.id)}
        <div>
          <div class="control">
            <input
              id={`energy${i}builder`}
              class="input is-small presence-input-block"
              type="text"
              on:focus={selectNode}
              on:blur={() => updatePresenceNodeLocal()}
              on:keydown={nextNode}
              bind:value={spiritBoard.presenceTrack.energyNodes[i].effect} />
            <div class="is-flex is-flex-direction-row-reverse is-justify-content-flex-start">
              <button
                class="presence-track-add-node button is-light is-primary presence-track-button "
                id={`energy${i}builderadd`}
                on:click={insertEnergyTrackNode(i)}
                ><span style="margin-top:11px;pointer-events: none;">+</span>
              </button>
              <button
                class="button is-light presence-track-button presence-track-remove-node"
                on:click={removeEnergyTrackNode(i)}
                ><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput"
      >Plays Track
    </label>
    <div class="presence-track-row">
      {#each spiritBoard.presenceTrack.playsNodes as playNode, i (playNode.id)}
        <div>
          <div class="control">
            <input
              id={`plays${i}builder`}
              class="input is-small presence-input-block"
              type="text"
              on:blur={() => updatePresenceNodeLocal}
              on:focus={selectNode}
              on:keydown={nextNode}
              bind:value={spiritBoard.presenceTrack.playsNodes[i].effect} />
            <div class="is-flex is-flex-direction-row-reverse is-justify-content-flex-start">
              <button
                class="presence-track-add-node button is-light is-primary presence-track-button "
                id={`plays${i}builderadd`}
                on:click={insertPlaysTrackNode(i)}
                ><span style="margin-top:11px;pointer-events: none;">+</span>
              </button>
              <button
                class="button is-light presence-track-button presence-track-remove-node"
                on:click={removePlaysTrackNode(i)}
                ><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  {#if spiritBoard.presenceTrack.hasAdditionalTracks}
    <div class="field">
      {#each spiritBoard.presenceTrack.additionalTracks as additionalTrack, t (additionalTrack.id)}
        <div style="display: flex;">
          <label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput"
            >Additional Track {t + 1}
          </label>
          <button class="button presence-track-remove" on:click={removeAdditionalTrack(t)}
            >&#10006;</button>
        </div>
        <div class="presence-track-row">
          {#each additionalTrack.additionalNodes as additionalNode, i (additionalNode.id)}
            <div>
              <div class="control">
                <input
                  id={`additional${t}node${i}builder`}
                  class="input is-small presence-input-block"
                  type="text"
                  on:focus={selectNode}
                  on:keydown={nextNode}
                  bind:value={additionalNode.effect} />
                <div class="is-flex is-flex-direction-row-reverse is-justify-content-flex-start">
                  <button
                    class="presence-track-add-node button is-light is-primary presence-track-button "
                    id={`additional${t}node${i}builderadd`}
                    on:click={insertAdditionalTrackNode(t, i)}
                    ><span style="margin-top:11px;pointer-events: none;">+</span>
                  </button>
                  <button
                    class="button is-light presence-track-button presence-track-remove-node"
                    on:click={removeAdditionalTrackNode(t, i)}
                    ><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
  <div class="field has-addons">
    <label class="label is-small has-addons mr-2" for="presenceTrackNote">Note:</label>
    <div class="control field" style="width:100%">
      <AutoComplete
        id={`presenceTrackNote`}
        elementType="input"
        placeholder="Presence Track Note (optional, like Finder)"
        classNames="is-small"
        additionalOnBlurFunction={() => document.getElementById("updateButton").click()}
        validAutoCompleteValues={iconValuesSorted}
        bind:value={spiritBoard.presenceTrack.note} />
    </div>
  </div>
  <button class="button is-primary is-small is-light mb-1" on:click={addPresenceTrack}
    >Add Additional Presence Track</button>
</Section>
