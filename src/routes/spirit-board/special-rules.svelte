<script>
  import * as Lib from "./lib";

  export let spiritBoard;

  function addSpecialRule() {
    spiritBoard = Lib.addSpecialRule(spiritBoard);
  }

  function removeSpecialRule(index) {
    spiritBoard = Lib.removeSpecialRule(spiritBoard, index);
  }

  let showAutoCompleteList = true
  const validAutoCompleteValues = ['presence', 'explorer']
  let autoCompleteValuesToShow = ['presence', 'explorer']
  function showAutoComplete(event) {
    // console.log('event: ', event);
    if (event.data === '{') {
      showAutoCompleteList = true
      autoCompleteValuesToShow = validAutoCompleteValues
      const inputValue = event.target.value
      const lastIndexOfOpenCurly = inputValue.lastIndexOf('{')
      // console.log('lastIndexOfOpenCurly: ', lastIndexOfOpenCurly);
      const lastIndexOfCloseCurly = inputValue.lastIndexOf('}')
      event.target.value = inputValue
    }
  }

  function findCurrentAutoCompleteText(specialRulesIndex) {
    const specialRuleEffect = spiritBoard.specialRules.rules[specialRulesIndex].effect
    let effectSplitOnOpenCurlies = specialRuleEffect.split(/(?=\{)/) // The regex here is some magic that keeps the deliminator of the split in the final strings.
    let splitToEdit
    console.log('effectSplitOnOpenCurlies: ', effectSplitOnOpenCurlies);
    effectSplitOnOpenCurlies.forEach((string) => {
      const indexOfSpace = string.indexOf(' ')
      const indexOfCloseCurly = string.indexOf('}')
      const indexOfOpenCurly = string.indexOf('{')
      if (indexOfSpace === -1 && indexOfCloseCurly === -1 && indexOfOpenCurly !== -1) {
        splitToEdit = string
      }
    })
    return splitToEdit
  }

  function handleAutoCompleteKeyboardInput(event) {
    console.log('event: ', event);
    console.log(event.target.innerText)
  }

  function handleAutoCompleteSelection(event) {
    console.log(event.target.innerText)
    console.log(event.target.attributes.specialRulesIndex.value)
    const specialRulesIndex = event.target.attributes.specialRulesIndex.value
    const text = findCurrentAutoCompleteText(specialRulesIndex)
    console.log('text: ', text);
    // console.log('event: ', event);

  }

  function closeAutoComplete() {
    showAutoCompleteList = false
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
            bind:value={spiritBoard.specialRules.rules[i].name} />
        </div>
        <button class="button is-warning is-light" on:click={removeSpecialRule(i)}>Remove</button>
      </div>
      <div class="control autocomplete">
        <textarea
          id={`ruleEffectInput${i}`}
          class="textarea"
          placeholder="Effect"
          autocomplete="off"
          on:input={showAutoComplete}
          bind:value={spiritBoard.specialRules.rules[i].effect} />
        {#if showAutoCompleteList}
          <div id={`ruleEffectInput${i}AutoCompleteList`} class='autocomplete-items' on:keydown={handleAutoCompleteKeyboardInput}>
            {#each autoCompleteValuesToShow as value, j}
              <div specialRulesIndex={i} on:click={handleAutoCompleteSelection}>
                {value}
                <!-- <input type='hidden' value={`${value}}`} on:click={handleAutoCompleteSelection}> -->
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    {#if i === spiritBoard.specialRules.rules.length - 1}
      <div class="field">
        <div class="control">
          <button class="button is-primary is-light" on:click={addSpecialRule}
            >Add Another Rule</button>
        </div>
      </div>
    {/if}
  {/each}
{/if}

<style>
.autocomplete{
   position: relative;
  display: inline-block;
}

.autocomplete-items {
  position: absolute;
  border: 1px solid #d4d4d4;
  border-bottom: none;
  border-top: none;
  z-index: 99;
  /*position the autocomplete items to be the same width as the container:*/
  top: 100%;
  left: 0;
  right: 0;
}
.autocomplete-items div {
  padding: 10px;
  cursor: pointer;
  background-color: #fff;
  border-bottom: 1px solid #d4d4d4;
}
.autocomplete-items div:hover {
  /*when hovering an item:*/
  background-color: #e9e9e9;
}
.autocomplete-active {
  /*when navigating through the items using the arrow keys:*/
  background-color: DodgerBlue !important;
  color: #ffffff;
}
</style>