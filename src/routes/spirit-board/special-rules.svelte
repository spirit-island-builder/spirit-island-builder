<script>
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";

  export let spiritBoard;
  export let showOrHideSection;

  function addSpecialRule() {
    spiritBoard = Lib.addSpecialRule(spiritBoard);
  }

  function removeSpecialRule(index) {
    spiritBoard = Lib.removeSpecialRule(spiritBoard, index);
  }

  function nextNode(event){
    console.log('next node')
    Lib.nextNode(event)
  }

  function selectNode(event) {
    var nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

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
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span
        ><a
          href="https://neubee.github.io/spirit-island-builder/instructions#special-rules"
          target="_blank">Instructions</a
        ></span>
    </div>
  </article>
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
            on:focus={selectNode}
            on:keyup={nextNode}
            bind:value={spiritBoard.specialRules.rules[i].name} />
        </div>
        <button class="button is-warning is-light" on:click={removeSpecialRule(i)}>Remove</button>
      </div>
      <AutoComplete
        id={`ruleEffectInput${i}`}
        elementType="textarea"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={rule.effect} />
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
