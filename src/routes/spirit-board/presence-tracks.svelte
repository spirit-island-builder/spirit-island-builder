<script>
  export let spiritBoard;
  export let showOrHideSection;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";

  function insertEnergyTrackNode(index) {
    var focusId = "energy" + (index + 1) + "builder";
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
    insertTemplatePresenceNode(index,'energy')
  }

  function insertPlaysTrackNode(index) {
    var focusId = "plays" + (index + 1) + "builder";
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
    insertTemplatePresenceNode(index,'card')
  }

  function insertTemplatePresenceNode(index,type){
    var previewFrame = document.getElementById("preview-iframe").contentWindow
    var findPresenceNode = previewFrame.document.getElementById(type+index)
    var newPresenceNode = previewFrame.getPresenceNodeHtml('custom(new presence node)',false,index,type,type=='energy');
    const placeholder = document.createElement("td");
    placeholder.innerHTML = newPresenceNode;
    console.log(placeholder)
    findPresenceNode.parentElement.after(placeholder)
    previewFrame.updatePresenceNodeIDs()
  }

  function removeEnergyTrackNode(index) {
    spiritBoard.presenceTrack.energyNodes.splice(index, 1);
    spiritBoard.presenceTrack.energyNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    removeTemplatePresenceNode('energy'+index)
  }

  function removePlaysTrackNode(index) {
    spiritBoard.presenceTrack.playsNodes.splice(index, 1);
    spiritBoard.presenceTrack.playsNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
    removeTemplatePresenceNode('card'+index)
  }

  function removeTemplatePresenceNode(templatePresenceNodeID){
    var previewFrame = document.getElementById("preview-iframe").contentWindow
    var findPresenceNode = previewFrame.document.getElementById(templatePresenceNodeID)
    findPresenceNode.parentElement.remove()
    previewFrame.updatePresenceNodeIDs()
  }

  function updatePresenceNodeLocal(index, type) {
    //this code works but has an issue with the first node, which is used to modify the spacing...perhaps i should change that spacing instead.

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
    console.log('Rewriting Presence Node ID: '+templatePresenceNodeID)
    console.log('new node: '+newPresenceNodeText)
    
    // Find node in Template
    var findPresenceNode = previewFrame.document.getElementById(templatePresenceNodeID)
    var isFirst = findPresenceNode.classList.contains('first');
    var hasEnergyRing = findPresenceNode.getElementsByTagName('energy-icon')[0] !== undefined ? true : false;
    console.log('is first  '+isFirst)
    console.log('has energy ring '+hasEnergyRing)

    // Check growth height
    var presenceTrackPanel = previewFrame.document.getElementsByTagName("presence-tracks")[0]
    var presenceTrackHeight = presenceTrackPanel.getElementsByTagName("tbody")[0].offsetHeight

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
    var newPresenceTrackHeight = presenceTrackPanel.getElementsByTagName("tbody")[0].offsetHeight
    if(newPresenceTrackHeight !== presenceTrackHeight){
      console.log('Recommend Re-running the whole board (click "Update Preview")')
      document.getElementById('updateButton').classList.add("is-flashy");
    }
  }

  function nextNode(event){
    if (event.key == 'Enter'){
      var currentID = event.target.id;
      var focusID= currentID.replace(/(\d+)+/g, function(match, number) {
        return parseInt(number)+1;
      });
      console.log(focusID)
      var newNode = document.getElementById(focusID)
    //Set the focus to the Growth Action if it is visible.
      if (spiritBoard.presenceTrack.isVisible) {
        if (newNode !== null){
          document.getElementById(focusID).focus();
        }else{
          document.getElementById(currentID+'add').focus();
        }
      }
    }
  }

  function selectNode(event) {
    var nodeID = event.target.id;
    document.getElementById(nodeID).select();
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
              id={`energy${i}builder`}
              class="input is-small"
              style="z-index: 2;"
              type="text"
              on:focus={selectNode}
              on:blur={updatePresenceNodeLocal(i,'energy')}
              on:keyup={nextNode}
              bind:value={spiritBoard.presenceTrack.energyNodes[i].effect} />
          </div>
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
              id={`plays${i}builder`}
              class="input is-small"
              style="z-index: 2;"
              type="text"
              on:blur={updatePresenceNodeLocal(i,'card')}
              on:focus={selectNode}
              on:keyup={nextNode}
              bind:value={spiritBoard.presenceTrack.playsNodes[i].effect} />
          </div>
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
