<script>
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import * as Lib from "../lib";

  export let spiritBoardBack;

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }
</script>

<Section title="Name, Art, and Lore" bind:isVisible={spiritBoardBack.nameArtLore.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="spirit-board-lore-side" />
  </div>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreNameInput"
      >Spirit Name
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control" style="width:100%">
        <input
          id="spiritLoreNameInput"
          class="input"
          type="text"
          placeholder="Name"
          on:focus={selectNode}
          on:keydown={nextNode}
          bind:value={spiritBoardBack.nameImage.name} />
      </div>
    </div>
    <!-- Spirit ART -->
    <ImageInput
      id="spiritLoreArt"
      title="Spirit Art"
      includeScale
      bind:imageURL={spiritBoardBack.nameImage.img}
      bind:imageScale={spiritBoardBack.nameImage.scale} />
  </div>
  <!-- Lore -->
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreInput"
      >Lore
    </label>
    <div class="control">
      <textarea
        id="spiritLoreInput"
        class="textarea"
        type="text"
        placeholder="Name"
        bind:value={spiritBoardBack.lore.loreText} />
    </div>
  </div>
</Section>
