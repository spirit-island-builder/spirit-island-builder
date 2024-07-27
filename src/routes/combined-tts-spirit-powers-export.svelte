<script>
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  export let combinedTTS;
  export let emptyCombinedTTS;
  export let currentPage;
  export let exportPlayTTS = () => {};
  export let exportLoreTTS = () => {};
  export let exportPowersTTS = () => {};
  // export let exportLoreTTS = () => {};
  // export let exportCardsTTS = () => {};

  import bagTemplate from "$lib/bag-template.json";
  // import { backspace, bag } from "ionicons/icons";

  function clearAll() {
    if (window.confirm("Are you sure? This will clear the combined export.")) {
      combinedTTS = JSON.parse(JSON.stringify(emptyCombinedTTS));
      combinedTTS.isVisible = true;
    }
  }

  function getPlayTTS() {
    let playTTS = exportPlayTTS();
    combinedTTS.spiritBoardFront.tts.content = JSON.parse(playTTS);
    combinedTTS.spiritBoardFront.tts.saved = true;
    console.log(playTTS);
    console.log(combinedTTS);
  }

  function getLoreTTS() {
    let playTTS = exportLoreTTS();
    combinedTTS.spiritBoardBack.tts.usesTokens = playTTS.summary.usesTokens
      ? "Requires Tokens"
      : "";
    combinedTTS.spiritBoardBack.tts.difficulty = playTTS.complexity.complexityDescriptor;
    combinedTTS.spiritBoardBack.tts.saved = true;
  }

  function getPowersTTS() {
    let playTTS = exportPowersTTS();
    combinedTTS.powers.tts.content = JSON.parse(playTTS);
    combinedTTS.powers.tts.saved = true;
    console.log(playTTS);
    console.log(combinedTTS);
  }

  function buildBag() {
    bagTemplate.ObjectStates[0]["ContainedObjects"] = [];
    if (combinedTTS.spiritBoardFront.tts.saved) {
      let spiritBoardJSON = combinedTTS.spiritBoardFront.tts.content;
      spiritBoardJSON = spiritBoardJSON.ObjectStates[0];
      bagTemplate.ObjectStates[0]["GUID"] = spiritBoardJSON["GUID"] + "_bag";
      bagTemplate.ObjectStates[0]["Nickname"] = spiritBoardJSON["Nickname"];
      console.log(spiritBoardJSON);
      if (combinedTTS.spiritBoardFront.image.saved) {
        // Set the front image for the bag
        bagTemplate.ObjectStates[0]["ChildObjects"][0]["CustomImage"]["ImageURL"] =
          combinedTTS.spiritBoardFront.image.content;
        // Set the front image for the board
        spiritBoardJSON["CustomImage"]["ImageURL"] = combinedTTS.spiritBoardFront.image.content;
      }
      if (combinedTTS.spiritBoardBack.image.saved) {
        // Set the back image for the bag
        bagTemplate.ObjectStates[0]["ChildObjects"][0]["CustomImage"]["ImageSecondaryURL"] =
          combinedTTS.spiritBoardBack.image.content;
        // Set the back image for the board
        spiritBoardJSON["CustomImage"]["ImageSecondaryURL"] =
          combinedTTS.spiritBoardBack.image.content;
      }
      if (combinedTTS.spiritBoardBack.tts.saved) {
        // Set the Difficulty, and Tags
        if (combinedTTS.spiritBoardBack.tts.difficulty) {
          bagTemplate.ObjectStates[0]["Tags"].push(combinedTTS.spiritBoardBack.tts.difficulty);
        }
        if (combinedTTS.spiritBoardBack.tts.usesTokens) {
          bagTemplate.ObjectStates[0]["Tags"].push(combinedTTS.spiritBoardBack.tts.usesTokens);
        }
      }
      bagTemplate.ObjectStates[0]["ContainedObjects"].push(spiritBoardJSON);
    }
    if (combinedTTS.powers.tts.saved) {
      let powerCardsJSON = combinedTTS.powers.tts.content.ObjectStates;
      powerCardsJSON.forEach((power) => {
        bagTemplate.ObjectStates[0]["ContainedObjects"].push(power);
      });
      console.log(powerCardsJSON);
    }
    console.log(bagTemplate);
  }
</script>

<Section title="TTS Combined Export" bind:isVisible={combinedTTS.isVisible}>
  <div class="mb-1 p-1 note">
    Use this to export a combined TTS object ready to go in the TTS mod. You will need to save
    content from other tabs as well, then click export when you have all the content desired.
    <InstructionsLink anchor="combined-tts" />
  </div>
  <div class="field is-flex is-flex-direction-row is-justify-content-space-around">
    <div class="field is-flex is-flex-direction-column">
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Spirit Play - TTS:</label>
        </div>
        {#if combinedTTS.spiritBoardFront.tts.saved}
          <button
            class="button is-info is-small"
            disabled={currentPage !== "spiritBoardFront"}
            on:click={() => console.log("click")}>Saved</button>
        {:else}
          <button
            class="button is-success is-small"
            disabled={currentPage !== "spiritBoardFront"}
            on:click={() => getPlayTTS()}>Save</button>
        {/if}
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Spirit Play - Image:</label>
        </div>
        {#if combinedTTS.spiritBoardFront.image.saved}
          <button
            class="button is-info is-small"
            disabled={currentPage !== "spiritBoardFront"}
            on:click={() => console.log(combinedTTS)}>Saved</button>
        {:else}
          <button
            class="button is-success is-small"
            disabled={currentPage !== "spiritBoardFront"}
            on:click={() => (combinedTTS.spiritBoardFront.image.saved = true)}>Save</button>
        {/if}
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Spirit Lore - TTS:</label>
        </div>
        {#if combinedTTS.spiritBoardBack.tts.saved}
          <button
            class="button is-info is-small"
            disabled={currentPage !== "spiritBoardBack"}
            on:click={() => console.log("click")}>Saved</button>
        {:else}
          <button
            class="button is-success is-small"
            disabled={currentPage !== "spiritBoardBack"}
            on:click={() => getLoreTTS()}>Save</button>
        {/if}
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Spirit Lore - Image:</label>
        </div>
        {#if combinedTTS.spiritBoardBack.image.saved}
          <button
            class="button is-info is-small"
            disabled={currentPage !== "spiritBoardBack"}
            on:click={() => console.log(combinedTTS)}>Saved</button>
        {:else}
          <button
            class="button is-success is-small"
            disabled={currentPage !== "spiritBoardBack"}
            on:click={() => (combinedTTS.spiritBoardBack.image.saved = true)}>Save</button>
        {/if}
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Power Cards - TTS:</label>
        </div>
        {#if combinedTTS.powers.tts.saved}
          <button
            class="button is-info is-small"
            disabled={currentPage !== "powerCards"}
            on:click={() => console.log(combinedTTS)}>Saved</button>
        {:else}
          <button
            class="button is-success is-small"
            disabled={currentPage !== "powerCards"}
            on:click={() => getPowersTTS()}>Save</button>
        {/if}
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Power Cards - Image:</label>
        </div>
        {#if combinedTTS.powers.image.saved}
          <button
            class="button is-info is-small"
            disabled={currentPage !== "powerCards"}
            on:click={() => console.log(combinedTTS)}>Saved</button>
        {:else}
          <button
            class="button is-success is-small"
            disabled={currentPage !== "powerCards"}
            on:click={() => (combinedTTS.powers.image.saved = true)}>Save</button>
        {/if}
      </div>
    </div>
    <div class="field is-flex is-flex-direction-column is-justify-content-space-evenly">
      <button class="button is-info big-buttons" on:click={() => buildBag()}>Export</button>
      <button class="button is-warning big-buttons" on:click={() => clearAll()}>Restart</button>
    </div>
  </div>
</Section>

<style>
  div.field.combined-tts-buttons div,
  div.field.combined-tts-buttons button {
    height: 30px;
    width: 80px;
    margin: 5px;
    border: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  div.field.combined-tts-buttons div {
    padding: 0px;
    flex-grow: 0;
    min-width: 120px;
    justify-content: flex-start;
  }
  div.field.combined-tts-buttons {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0px;
  }
  button.big-buttons {
    height: 50px;
    width: 100px;
  }
  button.big-buttons.is-warning {
    background-color: #ffc000;
  }
  button.big-buttons.is-warning:hover {
    background-color: #ffdc7d;
  }
</style>
