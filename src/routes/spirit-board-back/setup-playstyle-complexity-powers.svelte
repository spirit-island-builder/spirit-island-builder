<script>
  export let spiritBoardBack;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  export let showOrHideSection;
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="setupPlaystyleComplexityPowers">
  Setup, Play Style, Complexity and Summary of Powers
  <span on:click={showOrHideSection}>
    {#if spiritBoardBack.setupPlaystyleComplexityPowers.isVisible}
      <ion-icon
        id="setupPlaystyleComplexityPowers"
        on:click={showOrHideSection}
        name="chevron-down-outline" />
    {:else}
      <ion-icon
        id="setupPlaystyleComplexityPowers"
        on:click={showOrHideSection}
        name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoardBack.setupPlaystyleComplexityPowers.isVisible}
  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#spirit-lore-setup"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>
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
        tabindex="1"
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
        tabindex="1"
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
          tabindex="1"
          bind:value={spiritBoardBack.complexity.complexityDescriptor} />
      </div>
      <div class="control" style="width:30%; min-width:2rem;">
        <input
          id="spiritLoreComplexity"
          class="input"
          type="text"
          placeholder="Complexity Value (1-10)"
          tabindex="1"
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
            tabindex="1"
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
            tabindex="1"
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
            id="spiritLoreControl"
            class="input"
            type="text"
            placeholder="Fear Value (1-10)"
            tabindex="1"
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
            id="spiritLoreControl"
            class="input"
            type="text"
            placeholder="Defense Value (1-10)"
            tabindex="1"
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
            tabindex="1"
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
            tabindex="1"
            bind:value={spiritBoardBack.summary.usesTokens} />
        </div>
      </div>
    </div>
  </div>
{/if}
