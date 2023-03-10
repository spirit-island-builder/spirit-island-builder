<script>
  export let adversary;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";

  function toggleHasRule2(i) {
    adversary.levelSummary.levels[i].hasRule2 = !adversary.levelSummary.levels[i].hasRule2;
    console.log("test");
  }
</script>

<Section title="Levels" bind:isVisible={adversary.levelSummary.isVisible}>
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#a-nameadversary-levelaadversary-levels"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>

  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  {#each adversary.levelSummary.levels as level, i (level.id)}
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for={`levelNameInput${i}`}
        >Level {i + 1}
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:70%">
          <input
            id={`levelNameInput${i}`}
            class="input is-small"
            type="text"
            placeholder="Name"
            bind:value={level.name} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelDifficultyInput${i}`}
            class="input is-small"
            type="text"
            placeholder="Difficulty"
            bind:value={level.difficulty} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelFearInput${i}`}
            class="input is-small"
            type="text"
            placeholder="Fear Cards"
            bind:value={level.fearCards} />
        </div>
      </div>
      <div class="control">
        <AutoComplete
          id={`levelEffectInput${i}`}
          elementType="textarea"
          classNames="is-small"
          placeholder="Effect"
          validAutoCompleteValues={iconValuesSorted}
          bind:value={level.effect} />
      </div>
      {#if level.hasRule2}
        <div class="field is-flex is-small mb-0">
          <div class="control" style="width:100%;">
            <input
              id={`levelNameInput${i}`}
              class="input is-small"
              type="text"
              placeholder="2nd Rule Name"
              bind:value={level.name2} />
          </div>
          <button
            class="button is-warning is-light is-small is-pulled-right"
            style="padding: 3px; height: 16px; width: 90px;"
            on:click={toggleHasRule2(i)}>Remove 2nd Rule</button>
        </div>
        <div class="control">
          <AutoComplete
            id={`levelEffectInput${i}`}
            elementType="textarea"
            classNames="is-small"
            placeholder="2nd Rule Effect"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={level.effect2} />
        </div>
      {:else}
        <button
          class="button is-primary is-light is-small is-pulled-right"
          style="padding: 3px; height: 16px; width: 90px;"
          on:click={toggleHasRule2(i)}>Add 2nd Rule</button>
      {/if}
    </div>
  {/each}
</Section>
