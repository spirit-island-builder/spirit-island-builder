<script>
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import { downloadString } from "$lib/download";
  import { createTTSSave, ttsSaveMIMEType } from "$lib/tts.js";

  export let combinedTTS;
  export let emptyCombinedTTS;
  export let currentPage;
  export let powerCards;
  export let exportPlayTTS = () => {};
  export let exportLoreTTS = () => {};
  export let exportPowersTTS = () => {};

  import bagTemplate from "$lib/bag-template.json";

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
    if (combinedTTS.spiritBoardFront.image.content) {
      combinedTTS.spiritBoardFront.image.saved = true;
    }
  }

  function getLoreTTS() {
    let playTTS = exportLoreTTS();
    combinedTTS.spiritBoardBack.tts.usesTokens = playTTS.summary.usesTokens
      ? "Requires Tokens"
      : "";
    combinedTTS.spiritBoardBack.tts.difficulty = playTTS.complexity.complexityDescriptor;
    combinedTTS.spiritBoardBack.tts.saved = true;
    if (combinedTTS.spiritBoardBack.image.content) {
      combinedTTS.spiritBoardBack.image.saved = true;
    }
  }

  function getPowersTTS() {
    let playTTS = exportPowersTTS();
    combinedTTS.powers.tts.content = JSON.parse(playTTS);
    combinedTTS.powers.tts.saved = true;
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
      powerCardsJSON.forEach((power, i) => {
        if (combinedTTS.powers.image.content[i]) {
          let firstKey = Object.keys(power["CustomDeck"])[0];
          power["CustomDeck"][firstKey]["FaceURL"] = combinedTTS.powers.image.content[i];
          if (combinedTTS.powers.image.back) {
            power["CustomDeck"][firstKey]["BackURL"] = combinedTTS.powers.image.back;
          }
        }
        bagTemplate.ObjectStates[0]["ContainedObjects"].push(power);
      });
      console.log(powerCardsJSON);
    }
    let saveFile = createTTSSave(bagTemplate.ObjectStates);
    console.log(saveFile);
    console.log([saveFile]);
    let jsonFileName = combinedTTS.spiritBoardFront.tts.content["Nickname"] || "mySpiritBag";
    jsonFileName = jsonFileName.replaceAll(" ", "_") + "_TTS.json";
    downloadString(ttsSaveMIMEType, saveFile, jsonFileName);
  }
</script>

<Section title="TTS Spirit & Powers Combined Export" bind:isVisible={combinedTTS.isVisible}>
  <div class="mb-1 p-1 note">
    Use this to export a combined TTS object ready to go in the TTS mod. You will need to save
    content from other tabs and image hosting websites as well, then click export when you have all
    the content.
    <InstructionsLink anchor="combined-tts" />
  </div>
  <div class="field is-flex is-flex-direction-column is-justify-content-space-around">
    <div class="field is-flex is-flex-direction-column is-justify-content-space-between">
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Spirit Board Play Side:</label>
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
            on:click={() => getPlayTTS()}>Save TTS & Image URL</button>
        {/if}
      </div>
      <div class="field" class:is-hidden={currentPage !== "spiritBoardFront"}>
        <div class="content is-small mb-0">
          Insert a URL for the Play Side image from an image hosing website (such as imgur):.
        </div>
        <div class="control">
          <input
            id="spiritPlayImage"
            class="input is-small"
            type="text"
            bind:value={combinedTTS.spiritBoardFront.image.content} />
        </div>
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Spirit Board Lore Side:</label>
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
            on:click={() => getLoreTTS()}>Save TTS & Image URL</button>
        {/if}
      </div>
      <div class="field" class:is-hidden={currentPage !== "spiritBoardBack"}>
        <div class="content is-small mb-0">
          Insert a URL for the Lore Side image from an image hosing website (such as imgur):.
        </div>
        <div class="control">
          <input
            id="spiritPlayImage"
            class="input is-small"
            type="text"
            bind:value={combinedTTS.spiritBoardBack.image.content} />
        </div>
      </div>
      <div class="field combined-tts-buttons">
        <div class="field-label is-small">
          <label class="label combined-tts-buttons">Power Cards:</label>
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
            on:click={() => getPowersTTS()}>Save TTS & Image URL(s)</button>
        {/if}
      </div>
      <div class="field" class:is-hidden={currentPage !== "powerCards"}>
        <div class="content is-small mb-0">
          Insert URL(s) for each power card image from an image hosing website (such as imgur):.
        </div>
        {#if powerCards}
          {#each powerCards.cards as card, i (card.id)}
            <div
              class="field mb-0 is-flex is-flex-direction-column is-justify-content-space-between"
              style="width:50%;">
              <label class="label is-small " for="powerCard{i}ImageURL">{card.name}: </label>
              <div class="control">
                <input
                  id="powerCard{i}ImageURL"
                  class="input is-small"
                  type="text"
                  style="width:350px;"
                  bind:value={combinedTTS.powers.image.content[i]} />
              </div>
            </div>
          {/each}
          {#if powerCards.cardBackImage}
            <div
              class="field mb-0 is-flex is-flex-direction-row is-justify-content-space-between"
              style="width:50%;">
              <label class="label is-small " for="powerCardBackURL">Card Back: </label>
              <div class="control">
                <input
                  id="powerCardBackURL"
                  class="input is-small"
                  type="text"
                  style="width:350px;"
                  bind:value={combinedTTS.powers.image.back} />
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
    <div class="field is-flex is-flex-direction-row is-justify-content-space-evenly">
      <button
        class="button is-info big-buttons"
        disabled={!combinedTTS.spiritBoardFront.tts.saved ||
          !combinedTTS.spiritBoardBack.tts.saved ||
          !combinedTTS.powers.tts.saved}
        on:click={() => buildBag()}>Export</button>
      <button class="button is-warning big-buttons" on:click={() => clearAll()}>Restart</button>
    </div>
  </div>
</Section>

<style>
  div.field.combined-tts-buttons div,
  div.field.combined-tts-buttons button {
    height: 30px;
    width: 140px;
    margin: 5px;
    border: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  div.field.combined-tts-buttons div {
    padding: 0px;
    flex-grow: 1;
    min-width: 120px;
    justify-content: flex-start;
  }
  div.field.combined-tts-buttons {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0px;
  }
  label.combined-tts-buttons {
    text-align: left;
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
  div.is-hidden {
    display: none;
  }
</style>
