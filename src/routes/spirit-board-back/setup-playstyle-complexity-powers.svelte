<script>
  export let spiritBoardBack;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import * as Lib from "../lib";

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }
</script>

<Section
  title="Setup, Play Style, Complexity and Summary of Powers"
  bind:isVisible={spiritBoardBack.setupPlaystyleComplexityPowers.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="spirit-lore-setup" />
  </div>
  <!-- Setup -->
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreSetup"
      >Setup
    </label>
    <div class="control">
      <AutoComplete
        id="spiritLoreSetup"
        elementType="textarea"
        classNames="is-small"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={spiritBoardBack.setup.setupText} />
    </div>
  </div>
  <!-- Play Style -->
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLorePlaystyle"
      >Play Style
    </label>
    <div class="control">
      <AutoComplete
        id="spiritLorePlaystyle"
        elementType="textarea"
        classNames="is-small"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={spiritBoardBack.playStyle.playStyleText} />
    </div>
  </div>
  <!-- Complexity -->
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreComplexity"
      >Complexity
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control" style="width:70%">
        <input
          id="spiritLoreComplexity"
          class="input"
          type="text"
          placeholder="Complexity Description"
          on:focus={selectNode}
          on:keyup={nextNode}
          bind:value={spiritBoardBack.complexity.complexityDescriptor} />
      </div>
      <div class="control" style="width:30%; min-width:2rem;">
        <input
          id="spiritLoreComplexityValue"
          class="input"
          type="text"
          placeholder="Complexity Value (1-10)"
          on:focus={selectNode}
          on:keyup={nextNode}
          bind:value={spiritBoardBack.complexity.complexityValue} />
      </div>
    </div>
  </div>
  <!-- Summary of Powers -->
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for="spiritLoreSummary"
      >Summary of Powers
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Offense</label>
        </div>
        <div class="control">
          <input
            id="spiritLoreOffense"
            class="input"
            type="text"
            placeholder="Offense Value (1-10)"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.summary.offenseValue} />
        </div>
      </div>
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Control</label>
        </div>
        <div class="control">
          <input
            id="spiritLoreControl"
            class="input"
            type="text"
            placeholder="Control Value (1-10)"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.summary.controlValue} />
        </div>
      </div>
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Fear</label>
        </div>
        <div class="fear">
          <input
            id="spiritLoreFear"
            class="input"
            type="text"
            placeholder="Fear Value (1-10)"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.summary.fearValue} />
        </div>
      </div>
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Defense</label>
        </div>
        <div class="defense">
          <input
            id="spiritLoreDefense"
            class="input"
            type="text"
            placeholder="Defense Value (1-10)"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.summary.defenseValue} />
        </div>
      </div>
    </div>
    <div class="field is-flex is-small">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Utility</label>
        </div>
        <div class="control">
          <input
            id="spiritLoreUtility"
            class="input"
            type="text"
            placeholder="Utility Value (1-10)"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.summary.utilityValue} />
        </div>
      </div>
    </div>
    <div class="field is-flex is-small">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Uses</label>
        </div>
        <div class="control">
          <input
            id="spiritLoreUses"
            class="input"
            style="width:100%; min-width:20rem;"
            type="text"
            placeholder="Uses tokens/icons ie. 'badlands,wilds'"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.summary.usesTokens} />
        </div>
      </div>
    </div>
    <div class="field is-flex is-small">
      <div class="field has-addons is-horizontal is-justify-content-right mb-0">
        <div class="field-label is-small">
          <label class="label" style="width:30%; min-width:3rem;" for="adversaryFlagArt"
            >Note</label>
        </div>
        <div class="control">
          <input
            id="spiritLoreNote"
            class="input"
            style="width:100%; min-width:20rem;"
            type="text"
            placeholder="A note, like on Shifting Memory"
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoardBack.note.noteText} />
        </div>
      </div>
    </div>
  </div>
</Section>
