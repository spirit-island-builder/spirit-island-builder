<script>
  import { onMount } from "svelte";
  export let adversary;
  // import NameAndArt from "./name-and-art.svelte";
  // import SpecialRules from "./special-rules.svelte";

  let adversaryFrame;
  onMount(() => {
    adversaryFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    if (adversaryFrame) {

    }
  }

  function showOrHideBoard() {
    if (document.getElementById("adversaryBoardWrap").style.display == "none") {
      document.getElementById("adversaryBoardWrap").style.display = "block";
    } else {
      document.getElementById("adversaryBoardWrap").style.display = "none";
    }
  }
</script>

<h5 class="title is-5">Adversary</h5>
<h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview Spirit Board
  <span on:click={showOrHideBoard}>
    {#if adversary.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
<div id="adversaryBoardWrap">
  <iframe
    src=""
    height="600"
    width="100%"
    id="adversary-scaled-frame"
    title="yay" />
</div>
<div class="columns mt-0">
  <div class="column pt-0">

</div>
</div>
<div>{`adversary ${adversary.prop}`}</div>
<div id="adversary-holder">
  <iframe
    bind:this={adversaryFrame}
    src=""
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="adversary-mod-frame" />
</div>
