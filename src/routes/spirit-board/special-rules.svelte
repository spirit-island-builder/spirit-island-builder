<script>
  import * as Lib from "../lib";
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  export let spiritBoard;

  function addSpecialRule() {
    spiritBoard = Lib.addSpecialRule(spiritBoard);
  }

  function removeSpecialRule(index) {
    spiritBoard = Lib.removeSpecialRule(spiritBoard, index);
    document.getElementById("updateButton").click();
  }

  function moveSpecialRule(to, from) {
    spiritBoard = Lib.moveSpecialRule(spiritBoard, to, from);
    document.getElementById("updateButton").click();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function updateSpecialRule(rule, ID, type) {
    //effect
    let newSpecialRuleText = rule[type];
    if (newSpecialRuleText) {
      let templateSpecialRuleID = "sr" + ID + type;
      console.log(newSpecialRuleText);
      let previewFrame = document.getElementById("preview-iframe").contentWindow;

      // Find node in Template
      let findSpecialRuleTempalte = previewFrame.document.getElementById(templateSpecialRuleID);
      if (findSpecialRuleTempalte) {
        console.log(
          "Rewriting Special Rule ID: " + templateSpecialRuleID + " with " + newSpecialRuleText
        );

        // update node
        findSpecialRuleTempalte.innerHTML = previewFrame.replaceIcon(newSpecialRuleText);
      }
    }
  }
</script>

<Section title="Special Rules" bind:isVisible={spiritBoard.specialRules.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="special-rules" />
  </div>
  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  {#each spiritBoard.specialRules.rules as rule, i (rule.id)}
    <div class="field">
      <div class="field is-flex is-justify-content-space-between mb-0">
        <label class="label is-flex is-justify-content-space-between" for={`ruleNameInput${i}`}
          >Special Rule {i + 1}
        </label>
        <div class="field has-addons is-tiny" style="height:20px;">
          <button
            class="button is-light is-small"
            disabled={i === 0}
            on:click={moveSpecialRule(i - 1, i)}>&#11165;</button>
          <button
            class="button is-light is-small"
            disabled={i + 1 === spiritBoard.specialRules.rules.length}
            on:click={moveSpecialRule(i + 1, i)}>&#11167;</button>
          <button class="button is-warning is-small is-light" on:click={removeSpecialRule(i)}
            >&#10006;</button>
        </div>
      </div>
      <div class="growth-action-container">
        <div class="control" style="width:100%">
          <input
            id={`ruleNameInput${i}`}
            class="input"
            type="text"
            placeholder="Name"
            on:focus={selectNode}
            on:keyup={nextNode}
            on:blur={() => updateSpecialRule(rule, i, "name")}
            bind:value={spiritBoard.specialRules.rules[i].name} />
        </div>
      </div>
      <AutoComplete
        id={`ruleEffectInput${i}`}
        elementType="textarea"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        additionalOnBlurFunction={() => updateSpecialRule(rule, i, "effect")}
        bind:value={rule.effect} />
    </div>
  {/each}
  <div class="field">
    <div class="control">
      <button class="button is-primary is-light" id="addSpecialRule" on:click={addSpecialRule}>
        Add Another Rule
      </button>
    </div>
  </div>
</Section>

<style>
  .button[disabled] {
    opacity: 0.1;
  }
  div.is-tiny button {
    height: 25px;
  }
</style>
