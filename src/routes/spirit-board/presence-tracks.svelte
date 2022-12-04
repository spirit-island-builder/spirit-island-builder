<script>
  export let spiritBoard;
  export let showOrHideSection;
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";

  function insertEnergyTrackNode(index){
    var focusId = "energy" + (index+1);
    spiritBoard.presenceTrack.energyNodes.splice(index+1,0,{
      id: spiritBoard.presenceTrack.energyNodes.length,
      effect: "",
    });
    //Set the focus to the new Node if it is visible.
    if (spiritBoard.presenceTrack.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    spiritBoard=spiritBoard;
  }

  function insertPlaysTrackNode(index){
    var focusId = "plays" + (index+1);
    spiritBoard.presenceTrack.playsNodes.splice(index+1,0,{
      id: spiritBoard.presenceTrack.playsNodes.length,
      effect: "",
    });
    //Set the focus to the new Node if it is visible.
    if (spiritBoard.presenceTrack.isVisible) {
      setTimeout(() => {
        document.getElementById(focusId).focus();
      }, 100);
    }
    spiritBoard=spiritBoard;
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
            on:click={insertEnergyTrackNode(i)}><span style="margin-top:11px;pointer-events: none;">+</span>
            </button>
            <button
            class="button is-light presence-track-button presence-track-remove-node"
            on:click={removeEnergyTrackNode(i)}><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
            </button>
            <div style="width:15px;"></div>
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
          on:click={insertPlaysTrackNode(i)}><span style="margin-top:11px;pointer-events: none;">+</span>
          </button>
          <button
          class="button is-light presence-track-button presence-track-remove-node"
          on:click={removePlaysTrackNode(i)}><span style="margin-top:-1px;pointer-events: none;font-size: 9px;">✖</span>
          </button>
          <div style="width:15px;"></div>
        </div>
      </div>
      {/each}
    </div>
  </div>
  <div class="field has-addons">
    <label class="label is-small has-addons mr-2"
      >Note:</label>
    <div class="control field" style="width:100%">
      <AutoComplete
        id={`presenceTrackNote`}
        elementType="input"
        placeholder="Presence Track Note (optional, like Finder)"
        classNames="is-small"
        validAutoCompleteValues = {iconValuesSorted}
        bind:value={spiritBoard.presenceTrack.note} />
    </div>
  </div>
{/if}
