<script>
  export let adversary;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
</script>

<Section title="Levels" bind:isVisible={adversary.levelSummary.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="adversary-levels" />
  </div>

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
            class="input"
            type="text"
            placeholder="Name"
            bind:value={level.name} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelDifficultyInput${i}`}
            class="input"
            type="text"
            placeholder="Difficulty"
            bind:value={level.difficulty} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelFearInput${i}`}
            class="input"
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
    </div>
  {/each}
</Section>
