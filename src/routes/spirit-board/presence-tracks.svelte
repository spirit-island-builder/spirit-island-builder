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
    console.log(spiritBoard.presenceTrack);
    // insertTemplatePresenceNode(index, "card");
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
    removeTemplatePresenceNode("energy" + index);
  }

  function removePlaysTrackNode(index) {
    spiritBoard.presenceTrack.playsNodes.splice(index, 1);
    spiritBoard.presenceTrack.playsNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    removeTemplatePresenceNode("card" + index);
  }

  function removeAdditionalTrackNode(t, index) {
    spiritBoard.presenceTrack.additionalTracks[t].additionalNodes.splice(index, 1);
    spiritBoard.presenceTrack.additionalTracks[t].additionalNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    // removeTemplatePresenceNode("card" + index);
  }

  function removeAdditionalTrack(trackIndex) {
    spiritBoard.presenceTrack.additionalTracks.splice(trackIndex, 1);
    spiritBoard.presenceTrack.additionalTracks.forEach((additionalTrack, i) => {
      additionalTrack.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function removeTemplatePresenceNode(templatePresenceNodeID) {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let findPresenceNode = previewFrame.document.getElementById(templatePresenceNodeID);
    findPresenceNode.parentElement.remove();
    previewFrame.updatePresenceNodeIDs();
  }

  function updatePresenceNodeLocal(index, type) {
    //this code works but has an issue with the first node, which is used to modify the spacing...perhaps i should change that spacing instead.

    let newPresenceNodeText = "";
    let templatePresenceNodeID = type + index;
    switch (type) {
      case "energy":
        newPresenceNodeText = spiritBoard.presenceTrack.energyNodes[index].effect;
        break;
      case "card":
        newPresenceNodeText = spiritBoard.presenceTrack.playsNodes[index].effect;
        break;
    }
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    console.log("Rewriting Presence Node ID: " + templatePresenceNodeID);
    console.log("new node: " + newPresenceNodeText);

    // Find node in Template
    let findPresenceNode = previewFrame.document.getElementById(templatePresenceNodeID);
    let isFirst = findPresenceNode.classList.contains("first");
    let hasEnergyRing =
      findPresenceNode.getElementsByTagName("energy-icon")[0] !== undefined ? true : false;
    console.log("is first  " + isFirst);
    console.log("has energy ring " + hasEnergyRing);

    // Check growth height
    let presenceTrackPanel = previewFrame.document.getElementsByTagName("presence-tracks")[0];
    let presenceTrackHeight = presenceTrackPanel.getElementsByTagName("tbody")[0].offsetHeight;

    // Try to write a new node
    let newPresenceNode = "";
    try {
      newPresenceNode = previewFrame.getPresenceNodeHtml(
        newPresenceNodeText,
        isFirst,
        index,
        type,
        hasEnergyRing
      );
    } catch (err) {
      newPresenceNode = previewFrame.getPresenceNodeHtml(
        "custom(error! check syntax)",
        isFirst,
        index,
        type,
        hasEnergyRing
      );
      console.log("Malformed growth option, try again");
    }
    newPresenceNode = previewFrame.replaceIcon(newPresenceNode);

    // Create dummy node with new content
    const placeholder = document.createElement("div");
    placeholder.innerHTML = newPresenceNode;
    const newNode = placeholder.firstElementChild;
    console.log(newNode);

    // update node
    findPresenceNode.innerHTML = newNode.innerHTML;

    // If new panel is larger, re-run
    let newPresenceTrackHeight = presenceTrackPanel.getElementsByTagName("tbody")[0].offsetHeight;
    if (newPresenceTrackHeight !== presenceTrackHeight) {
      console.log('Recommend Re-running the whole board (click "Update Preview")');
      // document.getElementById("updateButton").classList.add("is-flashy");
      document.getElementById("updateButton").click();
    }
  }

  function nextNode(event) {
    console.log("next node");
    Lib.nextNode(event);
  }

  function selectNode(event) {
    Lib.selectNode(event);
  }

  function addPresenceTrack() {
    spiritBoard = Lib.addPresenceTrack(spiritBoard);
    spiritBoard = spiritBoard;
    console.log(spiritBoard.presenceTrack);
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
              on:blur={updatePresenceNodeLocal(i, "energy")}
              on:keyup={nextNode}
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
              on:blur={updatePresenceNodeLocal(i, "card")}
              on:focus={selectNode}
              on:keyup={nextNode}
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
                  on:keyup={nextNode}
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

<!-- on:blur={updatePresenceNodeLocal(i, "card")}
          on:focus={selectNode}
          on:keyup={nextNode} -->

<!-- <button
          class="button is-light presence-track-button presence-track-remove-node"
          on:click={removeAdditionalTrackNode(i)}
          ><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
        </button> -->
