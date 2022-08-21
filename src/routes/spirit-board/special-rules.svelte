<script>
  import * as Lib from "./lib";

  export let spiritBoard;

  function addSpecialRule() {
    spiritBoard = Lib.addSpecialRule(spiritBoard);
  }

  function removeSpecialRule(index) {
    spiritBoard = Lib.removeSpecialRule(spiritBoard, index);
  }

  export let showOrHideSection;
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="specialRules">
  Special Rules
  <span on:click={showOrHideSection}>
    {#if spiritBoard.specialRules.isVisible}
      <ion-icon id="specialRules" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="specialRules" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if spiritBoard.specialRules.isVisible}
  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  {#each spiritBoard.specialRules.rules as rule, i (rule.id)}
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for={`ruleNameInput${i}`}
        >Special Rule {i + 1}
      </label>
      <div class="growth-action-container">
        <div class="control" style="width:100%">
          <input
            id={`ruleNameInput${i}`}
            class="input"
            type="text"
            placeholder="Name"
            tabindex="1"
            bind:value={spiritBoard.specialRules.rules[i].name} />
        </div>
        <button class="button is-warning is-light" on:click={removeSpecialRule(i)}>Remove</button>
      </div>
      <div class="control">
        <textarea
          id={`ruleEffectInput${i}`}
          class="textarea"
          placeholder="Effect"
          tabindex="1"
          bind:value={spiritBoard.specialRules.rules[i].effect} />
      </div>
    </div>
    {#if i === spiritBoard.specialRules.rules.length - 1}
      <div class="field">
        <div class="control">
          <button class="button is-primary is-light" tabindex="1" on:click={addSpecialRule}
            >Add Another Rule</button>
        </div>
      </div>
    {/if}
  {/each}
{/if}
