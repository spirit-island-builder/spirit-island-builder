<script>
  import SaveDropdown from "$lib/save-dropdown.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";
  import { builderSaveFileName } from "$lib/builder-save-store.js";

  export let spiritBoard;
  export let combinedTTS;
  export let spiritBoardBack;
  export let powerCards;
  export let aspect;
  export let adversary;
  export let scenario;
  export let blightCard;
  export let fearCard;
  export let invaderCard;
  export let incarnaToken;
  export let eventCard;

  const components = [
    { key: "spiritBoard", label: "Spirit Board" },
    { key: "spiritBoardBack", label: "Spirit Board Back" },
    { key: "powerCards", label: "Power Cards" },
    { key: "aspect", label: "Aspect" },
    { key: "incarnaToken", label: "Incarna Token" },
    { key: "combinedTTS", label: "Combined TTS" },
    { key: "adversary", label: "Adversary" },
    { key: "scenario", label: "Scenario" },
    { key: "blightCard", label: "Blight Card" },
    { key: "fearCard", label: "Fear Card" },
    { key: "eventCard", label: "Event Card" },
    { key: "invaderCard", label: "Invader Card" },
  ];

  $: dataMap = {
    spiritBoard,
    spiritBoardBack,
    powerCards,
    aspect,
    incarnaToken,
    combinedTTS,
    adversary,
    scenario,
    blightCard,
    fearCard,
    invaderCard,
    eventCard,
  };

  // Tracks which toggles the user has manually changed
  let manualOverrides = {};

  // Initialized to false; the $: block below sets correct values once dataMap is ready
  let included = Object.fromEntries(components.map(({ key }) => [key, false]));

  // When a component is replaced, update its toggle if the user hasn't touched it
  $: for (const { key } of components) {
    if (!manualOverrides[key]) {
      included[key] = dataMap[key]?.demoBoardWasLoaded ?? false;
    }
  }

  $: fullFileName = `${$builderSaveFileName || "builder-save"}.json`;

  function generateSave() {
    const builderSave = { fileName: $builderSaveFileName || "builder-save" };
    for (const { key } of components) {
      if (included[key]) {
        builderSave[key] = dataMap[key];
      }
    }
    return JSON.stringify(builderSave, null, 2);
  }

  async function loadFromURL(url) {
    let parsed;
    try {
      const text = await fetch(url).then((r) => r.text());
      parsed = JSON.parse(text);
    } catch {
      alert("Could not parse save file — make sure it's a valid builder JSON file.");
      return;
    }

    if (parsed.fileName) builderSaveFileName.set(parsed.fileName);

    if (parsed.spiritBoard) spiritBoard = parsed.spiritBoard;
    if (parsed.combinedTTS) combinedTTS = parsed.combinedTTS;
    if (parsed.spiritBoardBack) spiritBoardBack = parsed.spiritBoardBack;
    if (parsed.powerCards) powerCards = parsed.powerCards;
    if (parsed.aspect) aspect = parsed.aspect;
    if (parsed.adversary) adversary = parsed.adversary;
    if (parsed.scenario) scenario = parsed.scenario;
    if (parsed.blightCard) blightCard = parsed.blightCard;
    if (parsed.fearCard) fearCard = parsed.fearCard;
    if (parsed.invaderCard) invaderCard = parsed.invaderCard;
    if (parsed.incarnaToken) incarnaToken = parsed.incarnaToken;
    if (parsed.eventCard) eventCard = parsed.eventCard;

    for (const { key } of components) {
      manualOverrides[key] = true;
      included[key] = key in parsed;
    }
    included = { ...included };
    manualOverrides = { ...manualOverrides };
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <div class="content mb-1 mt-2">Save / Load overall Builder state</div>
    <p class="mb-3 is-size-7 has-text-grey">
      This interface allows the user to save the overall state of the Builder, instead of saving
      individual components. Use the toggles to determine which components to include in the save
      file.
    </p>

    <div class="component-list">
      {#each components as { key, label }}
        <div
          class="component-row"
          on:click={() => {
            manualOverrides[key] = true;
            included[key] = !included[key];
          }}>
          <input
            type="checkbox"
            id="toggle-{key}"
            class="custom-checkbox"
            checked={included[key]}
            on:change|stopPropagation />
          <label class="custom-switch" for="toggle-{key}" on:click|stopPropagation />
          <span class="component-label" class:has-text-grey={!included[key]}>
            {label}
          </span>
        </div>
      {/each}
    </div>

    <div class="field mt-4">
      <div class="control has-icons-right">
        <input
          class="input is-small"
          type="text"
          placeholder="builder-save"
          bind:value={$builderSaveFileName} />
        <span class="icon is-small is-right has-text-grey-light">.json</span>
      </div>
    </div>

    <div class="field has-addons mt-1">
      <LoadDropdown
        accept="application/json,.json"
        loadObjectURL={loadFromURL}
        class="button is-info mr-1">
        Load
      </LoadDropdown>
      <SaveDropdown
        saveAction={generateSave}
        fileName={fullFileName}
        saveType="string"
        mimeType="application/json;charset=utf-8" />
    </div>
  </div>
</div>

<style>
  .component-list {
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 0.5rem;
  }

  .component-row {
    display: flex;
    align-items: center;
    padding: 0.35rem 0.5rem;
    border-radius: 3px;
    cursor: pointer;
  }

  .component-row:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }

  .component-row:hover {
    background-color: #fafafa;
  }

  .component-row:hover .component-label {
    color: #363636;
  }

  :global([data-theme="dark"]) .component-row:hover {
    background-color: #2a2a2a;
  }

  :global([data-theme="dark"]) .component-row:hover .component-label {
    color: #f5f5f5;
  }

  .component-label {
    min-width: 130px;
    margin-left: 0.6rem;
    transition: color 0.15s;
  }

  .custom-checkbox {
    display: none;
  }

  .custom-switch {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    width: 40px;
    height: 20px;
    background-color: #bbb;
    border: 1px solid #aaa;
    border-radius: 20px;
    transition: background-color 0.3s, border-color 0.3s;
    cursor: pointer;
  }

  .custom-switch::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    top: 1px;
    left: 1px;
    transition: left 0.3s;
  }

  .custom-checkbox:checked + .custom-switch {
    background-color: #48c774;
    border-color: #48c774;
  }

  .custom-checkbox:checked + .custom-switch::after {
    left: 21px;
  }
</style>
