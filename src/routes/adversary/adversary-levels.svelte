<script>
  export let adversary;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import * as Lib from "../lib";

  function toggleHasRule2(i) {
    adversary.levelSummary.levels[i].hasRule2 = !adversary.levelSummary.levels[i].hasRule2;
    console.log("test");
  }

  function moveLevel(to, from) {
    console.log(to);
    let levelA = adversary.levelSummary.levels[to];
    let levelB = adversary.levelSummary.levels[from];
    [
      levelA.name,
      levelA.effect,
      levelA.name2,
      levelA.effect2,
      levelA.hasRule2,
      levelB.name,
      levelB.effect,
      levelB.name2,
      levelB.effect2,
      levelB.hasRule2,
    ] = [
      levelB.name,
      levelB.effect,
      levelB.name2,
      levelB.effect2,
      levelB.hasRule2,
      levelA.name,
      levelA.effect,
      levelA.name2,
      levelA.effect2,
      levelA.hasRule2,
    ];
    // adversary.levelSummary.levels.splice(to, 0, adversary.levelSummary.levels.splice(from, 1)[0]);
    // adversary.levelSummary.levels.forEach((level, i) => {
    //   level.id = i;
    // });
    adversary = adversary;
    document.getElementById("updateButton").click();
    console.log(adversary.levelSummary.levels);
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }
</script>

<Section title="Levels" bind:isVisible={adversary.levelSummary.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="adversary-levels" />
  </div>

  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  {#each adversary.levelSummary.levels as level, i (level.id)}
    <div class="field">
      <div class="field is-flex is-justify-content-space-between mb-0">
        <label
          class="label is-flex is-justify-content-space-between mb-0"
          for={`levelNameInput${i}`}
          >Level {i + 1}
        </label>
        <div class="field has-addons is-tiny" style="height:20px;">
          <button class="button is-light is-small" disabled={i === 0} on:click={moveLevel(i - 1, i)}
            >&#11165;</button>
          <button
            class="button is-light is-small"
            disabled={i + 1 === adversary.levelSummary.levels.length}
            on:click={moveLevel(i + 1, i)}>&#11167;</button>
        </div>
      </div>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:70%">
          <input
            id={`levelNameInput${i}`}
            class="input is-small"
            type="text"
            placeholder="Name"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={level.name} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelDifficultyInput${i}`}
            class="input is-small"
            type="text"
            placeholder="Difficulty"
            on:keydown={nextNode}
            on:focus={selectNode}
            bind:value={level.difficulty} />
        </div>
        <div class="control" style="width:15%; min-width:2rem;">
          <input
            id={`levelFearInput${i}`}
            class="input is-small"
            type="text"
            placeholder="Fear Cards"
            on:keydown={nextNode}
            on:focus={selectNode}
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
              id={`levelSecondNameInput${i}`}
              class="input is-small"
              type="text"
              on:keydown={nextNode}
              on:focus={selectNode}
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
            id={`levelSecondEffectInput${i}`}
            elementType="textarea"
            classNames="is-small"
            placeholder="2nd Rule Effect"
            validAutoCompleteValues={iconValuesSorted}
            bind:value={level.effect2} />
        </div>
      {:else}
        <div class="field is-flex is-justify-content-flex-end">
          <button
            class="button is-primary is-light is-small"
            style="padding: 3px; height: 16px; width: 90px;"
            on:click={toggleHasRule2(i)}>Add 2nd Rule</button>
        </div>
      {/if}
    </div>
  {/each}
</Section>

<style>
  .button[disabled] {
    opacity: 0.3;
  }
  div.is-tiny button {
    height: 25px;
  }
</style>
