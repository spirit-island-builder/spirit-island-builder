<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?

  export let adversary;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  export let showOrHideSection;

  const validAutoCompleteValues = [
    { label: "air", value: "air" },
    { label: "animal", value: "animal" },
    { label: "any", value: "any" },
    { label: "badlands", value: "badlands" },
    { label: "beasts", value: "beasts" },
    { label: "blight", value: "blight" },
    { label: "city", value: "city" },
    { label: "custom1", value: "custom1" },
    { label: "custom2", value: "custom2" },
    { label: "custom3", value: "custom3" },
    { label: "custom4", value: "custom4" },
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
    { label: "jungle-mountain", value: "jungle-mountain" },
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
    { label: "range-[replace_w_icon]", value: "range-[replace_w_icon]" },
    { label: "range-0", value: "range-0" },
    { label: "range-1", value: "range-1" },
    { label: "range-2", value: "range-2" },
    { label: "range-3", value: "range-3" },
    { label: "range-4", value: "range-4" },
    { label: "sacred-site", value: "sacred-site" },
    { label: "sand", value: "sand" },
    { label: "sand-jungle", value: "sand-jungle" },
    { label: "sand-mountain", value: "sand-mountain" },
    { label: "sand-presence", value: "sand-presence" },
    { label: "sand-wetland", value: "sand-wetland" },
    { label: "slow", value: "slow" },
    { label: "spirit", value: "spirit" },
    { label: "spirit", value: "spirit" },
    { label: "star", value: "star" },
    { label: "strife", value: "strife" },
    { label: "sun", value: "sun" },
    { label: "terror-1", value: "terror-1" },
    { label: "terror-2", value: "terror-2" },
    { label: "terror-3", value: "terror-3" },
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
  id="levelSummary">
  Levels
  <span on:click={showOrHideSection}>
    {#if adversary.levelSummary.isVisible}
      <ion-icon id="levelSummary" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="levelSummary" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if adversary.levelSummary.isVisible}
  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#a-nameadversary-levelaadversary-levels"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>

  {#each adversary.levelSummary.levels as level, i (level.id)}
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for={`levelNameInput${i}`}
        >Level {i + 1}
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:70%">
          <input
            id={`levelNameInput${i}`}
            class="input"
            type="text"
            placeholder="Name"
            tabindex="1"
            bind:value={level.name} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelDifficultyInput${i}`}
            class="input"
            type="text"
            placeholder="Difficulty"
            tabindex="1"
            bind:value={level.difficulty} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelFearInput${i}`}
            class="input"
            type="text"
            placeholder="Fear Cards"
            tabindex="1"
            bind:value={level.fearCards} />
        </div>
      </div>
      <div class="control">
        <AutoComplete
          id={`levelEffectInput${i}`}
          elementType="textarea"
          classNames="is-small"
          placeholder="Effect"
          tabindex="1"
          {validAutoCompleteValues}
          bind:value={level.effect} />
      </div>
    </div>
  {/each}
{/if}
