<script>
  export let spiritBoard;
  export let showOrHideSection;
  import * as Lib from "./lib";

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
          href="https://github.com/neubee/spirit-island-builder/blob/main/docs/instructions.md#presence-tracks"
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
  <div class="control" />
{/if}
