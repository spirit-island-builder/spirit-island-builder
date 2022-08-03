<script>
	import * as Lib from './lib'
	
  export let spiritBoard

    function addSpecialRule() {
		spiritBoard = Lib.addSpecialRule(spiritBoard);
	}

  function removeSpecialRule(index) {
		spiritBoard.specialRules.rules.splice(index, 1);

		// I might not be handling id's correctly, but with this current set up each id in the array needs to be reset when a element is removed so that we don't end up with duplicate id's.
    spiritBoard.specialRules.rules.forEach((rule, i) => {
      rule.id = i
    })
		spiritBoard = spiritBoard;
	}

  export let showOrHideSection
</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1" id="specialRules">Special Rules
				<span on:click={showOrHideSection}>
				{#if spiritBoard.specialRules.isVisible}
					<ion-icon id="specialRules" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="specialRules" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span>
			</h6>
			{#if spiritBoard.specialRules.isVisible}
				<!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
				{#each spiritBoard.specialRules.rules as rule, i (rule.id)}
					<div class="field">
						<label
							class="label is-flex is-justify-content-space-between"
							for={`ruleNameInput${i}`}
							>Special Rule {i + 1} {#if spiritBoard.specialRules.rules.length > 1}<span
									on:click={removeSpecialRule(i)}>Remove This Rule X</span
								>{/if}</label
						>
						<div class="growth-action-container">
							<div class="control" style="width:100%">
								<input
									id={`ruleNameInput${i}`}
									class="input"
									type="text"
									placeholder='Name'
									bind:value={spiritBoard.specialRules.rules[i].name}
								/>
							</div>
							<button class="button is-primary is-light" on:click={removeSpecialRule(i)}>Remove</button>
						</div>
						<div class="control">
							<textarea
								id={`ruleEffectInput${i}`}
								class="textarea"
								placeholder='Effect'
								bind:value={spiritBoard.specialRules.rules[i].effect}
							/>
						</div>
					</div>
					{#if i === spiritBoard.specialRules.rules.length - 1}
						<div class="field">
							<div class="control">
								<button class="button is-primary is-light" on:click={addSpecialRule}>Add Another Rule</button>
							</div>
						</div>
					{/if}
				{/each}
			{/if}