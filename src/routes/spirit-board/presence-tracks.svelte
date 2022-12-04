<script>
  export let spiritBoard;
  export let showOrHideSection;
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  
  function addEnergyTrackNode() {
    spiritBoard = Lib.addEnergyTrackNode(spiritBoard);
  }

  function addPlaysTrackNode() {
    spiritBoard = Lib.addPlaysTrackNode(spiritBoard);
  }

  function removeEnergyTrackNode() {
    spiritBoard.presenceTrack.energyNodes.splice(
      spiritBoard.presenceTrack.energyNodes.length - 1,
      1
    );
    spiritBoard.presenceTrack.energyNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
  }

  function removePlaysTrackNode() {
    spiritBoard.presenceTrack.playsNodes.splice(spiritBoard.presenceTrack.playsNodes.length - 1, 1);
    spiritBoard.presenceTrack.playsNodes.forEach((node, i) => {
      node.id = i;
    });
    spiritBoard = spiritBoard;
  }

  const validAutoCompleteValues = [
    { label: "air", value: "air" },
    { label: "animal", value: "animal" },
    { label: "any", value: "any" },
    { label: "badlands", value: "badlands" },
    { label: "beasts", value: "beasts" },
    { label: "blight", value: "blight" },
    { label: "city", value: "city" },
    { label: "dahan", value: "dahan" },
    { label: "destroyed-presence", value: "destroyed-presence" },
    { label: "disease", value: "disease" },
    { label: "earth", value: "earth" },
    { label: "explorer", value: "explorer" },
    { label: "fast", value: "fast" },
    { label: "fear", value: "fear" },
    { label: "fire", value: "fire" },
    { label: "gain-range-1", value: "gain-range-1" },
    { label: "gain-range-2", value: "gain-range-2" },
    { label: "gain-range-3", value: "gain-range-3" },
    { label: "gain-range-x", value: "gain-range-x" },
    { label: "isolate", value: "isolate" },
    { label: "jungle", value: "jungle" },
    { label: "jungle-presence", value: "jungle-presence" },
    { label: "jungle-sand", value: "jungle-sand" },
    { label: "jungle-wetland", value: "jungle-wetland" },
    { label: "major", value: "major" },
    { label: "markerminus", value: "markerminus" },
    { label: "markerplus", value: "markerplus" },
    { label: "minor", value: "minor" },
    { label: "moon", value: "moon" },
    { label: "mountain", value: "mountain" },
    { label: "mountain-jungle", value: "mountain-jungle" },
    { label: "mountain-presence", value: "mountain-presence" },
    { label: "mountain-sand", value: "mountain-sand" },
    { label: "mountain-wetland", value: "mountain-wetland" },
    { label: "move-presence-1", value: "move-presence-1" },
    { label: "move-presence-2", value: "move-presence-2" },
    { label: "move-presence-3", value: "move-presence-3" },
    { label: "move-presence-4", value: "move-presence-4" },
    { label: "no-own-presence", value: "no-own-presence" },
    { label: "no-presence", value: "no-presence" },
    { label: "ocean", value: "ocean" },
    { label: "or", value: "or" },
    { label: "plant", value: "plant" },
    { label: "presence", value: "presence" },
    { label: "range", value: "range" },
    { label: "range-0", value: "range-0" },
    { label: "range-1", value: "range-1" },
    { label: "range-2", value: "range-2" },
    { label: "range-3", value: "range-3" },
    { label: "range-4", value: "range-4" },
    { label: "sacred-site", value: "sacred-site" },
    { label: "sand", value: "sand" },
    { label: "sand-presence", value: "sand-presence" },
    { label: "sand-wetland", value: "sand-wetland" },
    { label: "slow", value: "slow" },
    { label: "spirit", value: "spirit" },
    { label: "spirit", value: "spirit" },
    { label: "star", value: "star" },
    { label: "strife", value: "strife" },
    { label: "sun", value: "sun" },
    { label: "terror1", value: "terror1" },
    { label: "terror2", value: "terror2" },
    { label: "terror3", value: "terror3" },
    { label: "town", value: "town" },
    { label: "water", value: "water" },
    { label: "wetland", value: "wetland" },
    { label: "wetland-presence", value: "wetland-presence" },
    { label: "wilds", value: "wilds" },
  ];
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
      <div class="buttons has-addons">
        <button
          class="button is-primary is-light presence-track-button"
          on:click={addEnergyTrackNode}>Add Node</button
        ><button
          class="button is-warning is-light presence-track-button"
          on:click={removeEnergyTrackNode}>Remove Node</button>
      </div></label>
    <div class="presence-track-row">
      {#each spiritBoard.presenceTrack.energyNodes as energyNode, i (energyNode.id)}
        <div class="control">
          <input
            id={`energy${i}`}
            class="input is-small"
            type="text"
            bind:value={spiritBoard.presenceTrack.energyNodes[i].effect} />
        </div>
      {/each}
    </div>
  </div>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput"
      >Plays Track
      <div class="buttons has-addons">
        <button
          class="button is-primary is-light presence-track-button"
          on:click={addPlaysTrackNode}>Add Node</button
        ><button
          class="button is-warning is-light presence-track-button"
          on:click={removePlaysTrackNode}>Remove Node</button>
      </div></label>
    <div class="presence-track-row">
      {#each spiritBoard.presenceTrack.playsNodes as playNode, i (playNode.id)}
        <div class="control">
          <input
            id={`plays${i}`}
            class="input is-small"
            type="text"
            bind:value={spiritBoard.presenceTrack.playsNodes[i].effect} />
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
