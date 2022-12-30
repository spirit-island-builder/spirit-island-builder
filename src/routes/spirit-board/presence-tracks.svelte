<script>
  export let spiritBoard;
  export let showOrHideSection;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";

  function insertEnergyTrackNode(index) {
    var focusId = "energy" + (index + 1);
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
  }

  function insertPlaysTrackNode(index) {
    var focusId = "plays" + (index + 1);
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
  }

  function removeEnergyTrackNode(index) {
    spiritBoard.presenceTrack.energyNodes.splice(index, 1);
    spiritBoard.presenceTrack.energyNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function removePlaysTrackNode(index) {
    spiritBoard.presenceTrack.playsNodes.splice(index, 1);
    spiritBoard.presenceTrack.playsNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function updatePresenceNodeLocal(index, type) {
    var newPresenceNodeText = "";
    var templatePresenceNodeID = type+index;
    switch (type) {
      case 'energy': 
        newPresenceNodeText = spiritBoard.presenceTrack.energyNodes[index].effect
        break;
      case 'card':
        newPresenceNodeText = spiritBoard.presenceTrack.playsNodes[index].effect
        break;
    }
    var previewFrame = document.getElementById("preview-iframe").contentWindow
    console.log('Rewriting Growth Node ID: '+templatePresenceNodeID)
    console.log('new node: '+newPresenceNodeText)
    
    // Find node in Template
    var findPresenceNode = previewFrame.document.getElementById(templatePresenceNodeID)
    var isFirst = findPresenceNode.classList.contains('first');
    var hasEnergyRing = findPresenceNode.getElementsByTagName('energy-icon')[0] !== undefined ? true : false;
    console.log('is first  '+isFirst)
    console.log('has energy ring '+hasEnergyRing)

    // Check growth height
    var presenceTrackPanel = previewFrame.document.getElementsByTagName("presence-tracks")[0]
    var presenceTrackHeight = presenceTrackPanel.offsetHeight

    // Try to write a new node    
   
    var newPresenceNode = "";
    try {
      newPresenceNode = previewFrame.getPresenceNodeHtml(newPresenceNodeText,isFirst,index,type,hasEnergyRing);
    }
    catch(err) {
      newPresenceNode = previewFrame.getPresenceNodeHtml('custom(error! check syntax)',isFirst,index,type,hasEnergyRing);
      console.log('Malformed growth option, try again')
    }
    newPresenceNode = previewFrame.replaceIcon(newPresenceNode);

    // Create dummy node with new content
    const placeholder = document.createElement("div");
    placeholder.innerHTML = newPresenceNode;
    const newNode = placeholder.firstElementChild;
    console.log(newNode)

    // update node
    findPresenceNode.innerHTML = newNode.innerHTML

    // If new panel is larger, re-run    
    var newPresenceTrackHeight = presenceTrackPanel.offsetHeight
    if(newPresenceTrackHeight > presenceTrackHeight){
      console.log('Recommend Re-running the whole board (click "Update Preview")')
    }
  }
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="presenceTrack">
  Presence Tracks
  <span id="presenceTrack" on:click={showOrHideSection}>
    {#if spiritBoard.presenceTrack.isVisible}
      <ion-icon id="presenceTrack" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="presenceTrack" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoard.presenceTrack.isVisible}
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#presence-tracks"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput"
      >Energy Track
    </label>
    <div class="presence-track-row">
      {#each spiritBoard.presenceTrack.energyNodes as energyNode, i (energyNode.id)}
        <div>
          <div class="control">
            <input
              id={`energy${i}`}
              class="input is-small"
              style="z-index: 2;"
              type="text"
              bind:value={spiritBoard.presenceTrack.energyNodes[i].effect} />
          </div>
          <div class="is-flex is-flex-direction-row-reverse is-justify-content-flex-start">
            <button
              class="presence-track-add-node button is-light is-primary presence-track-button "
              on:click={insertEnergyTrackNode(i)}
              ><span style="margin-top:11px;pointer-events: none;">+</span>
            </button>
            <button
              class="button is-light presence-track-button presence-track-remove-node"
              on:click={updatePresenceNodeLocal(i,'energy')}
              ><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
            </button>
            <div style="width:15px;" />
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
              id={`plays${i}`}
              class="input is-small"
              style="z-index: 2;"
              type="text"
              bind:value={spiritBoard.presenceTrack.playsNodes[i].effect} />
          </div>
          <div class="is-flex is-flex-direction-row-reverse is-justify-content-flex-start">
            <button
              class="presence-track-add-node button is-light is-primary presence-track-button "
              on:click={insertPlaysTrackNode(i)}
              ><span style="margin-top:11px;pointer-events: none;">+</span>
            </button>
            <button
              class="button is-light presence-track-button presence-track-remove-node"
              on:click={updatePresenceNodeLocal(i,'card')}
              ><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
            </button>
            <div style="width:15px;" />
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="field has-addons">
    <label class="label is-small has-addons mr-2">Note:</label>
    <div class="control field" style="width:100%">
      <AutoComplete
        id={`presenceTrackNote`}
        elementType="input"
        placeholder="Presence Track Note (optional, like Finder)"
        classNames="is-small"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={spiritBoard.presenceTrack.note} />
    </div>
  </div>
{/if}
