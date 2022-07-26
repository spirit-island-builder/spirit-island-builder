<script>
  export let spiritBoard

    function addSpecialRule() {
		spiritBoard.specialRules.rules.push({
      id: spiritBoard.specialRules.rules.length,
			name: "",
			effect: "",
		});
		spiritBoard.specialRules.rules = spiritBoard.specialRules.rules;
	}

  function removeSpecialRule(index) {
		spiritBoard.specialRules.rules.splice(index, 1);

		// I might not be handling id's correctly, but with this current set up each id in the array needs to be reset when a element is removed so that we don't end up with duplicate id's.
    spiritBoard.specialRules.rules.forEach((rule, i) => {
      rule.id = i
    })
		spiritBoard.specialRules.rules = spiritBoard.specialRules.rules;
	}

  export let showOrHideSection
</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="specialRules">Special Rules
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
							>Special Rule {i + 1} Name {#if spiritBoard.specialRules.rules.length > 1}<span
									on:click={removeSpecialRule(i)}>Remove This Rule X</span
								>{/if}</label
						>
						<div class="control">
							<input
								id={`ruleNameInput${i}`}
								class="input"
								type="text"
								bind:value={spiritBoard.specialRules.rules[i].name}
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for={`ruleEffectInput${i}`}
							>Special Rule {i + 1} Effect</label
						>
						<div class="control">
							<textarea
								id={`ruleEffectInput${i}`}
								class="textarea"
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