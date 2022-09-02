<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?
  
  export let adversary;

  export let showOrHideSection;
  
  
/*   let adversary = {
    prop: "value",
    previewBoard: {
      isVisible: false,
    },
    name:"",
    baseDif:"",
    flagImg:"",
    lossCondition: {
      name: "",
      effect:"",
    },
    escalation:{
      name:"",
      effect:"",
    },
    level: [
      {
        id:0,
        name:"",
        difficulty:"",
        fearCards:"",
        effect:"",
      },
    ],
  } */
  
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="levelSummary">
  Levels
  <span on:click={showOrHideSection}>
    {#if adversary.previewBoard.isVisible}
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
      <span><a href="" target="_blank">Instructions</a></span>
    </div>
  </article>
  
  {#each adversary.levelSummary.levels as level, i (level.id)}
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for={`levelNameInput${i}`}
        >Level {i+1}
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
        <textarea
          id={`levelEffectInput${i}`}
          class="textarea is-small"
          type="text"
          placeholder="Effect"
          tabindex="1"
          bind:value={level.effect} />
      </div>
    </div>
  {/each}
{/if}
