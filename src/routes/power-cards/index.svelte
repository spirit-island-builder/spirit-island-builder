<script>
  import { onMount } from "svelte";
  export let powerCards;
  // import NameAndArt from "./name-and-art.svelte";
  // import SpecialRules from "./special-rules.svelte";

  let loreframe;
  onMount(() => {
    loreframe.addEventListener("load", onLoad());
  });

  function onLoad() {
    if (loreframe) {

    }
  }

  function showOrHideBoard() {
    if (document.getElementById("lore-board-wrap").style.display == "none") {
      document.getElementById("lore-board-wrap").style.display = "block";
    } else {
      document.getElementById("lore-board-wrap").style.display = "none";
    }
  }
</script>

<h5 class="title is-5">Power Cards</h5>
<h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview Power Cards
  <span on:click={showOrHideBoard}>
    {#if powerCards.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
<div id="lore-board-wrap">
  <iframe
    src=""
    height="600"
    width="100%"
    id="lore-scaled-frame"
    title="yay" />
</div>
<div class="columns mt-0">
  <div class="column pt-0">

</div>
</div>
<div>{`powerCards ${powerCards.prop}`}</div>
<div id="lore-holder">
  <iframe
    bind:this={loreframe}
    src=""
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="lore-mod-frame" />
</div>
