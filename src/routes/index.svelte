<script>
	const spiritCard = {
		nameAndArt: {
			isVisible: true,
			name: "",
		},
		specialRules: {
			isVisible: true,
			rules: [
				{
          id: 0,
					name: "",
					effect: "",
				},
			],
		},
		growth: {
			isVisible: true,
		},
		Presence: {
			isVisible: true,
		},
		innatePowers: {
			isVisible: true,
		},
	};

	function showOrHideSection(event) {
		console.log("event: ", event.target);
		spiritCard[event.target.id].isVisible = !spiritCard[event.target.id].isVisible;
	}

	function addSpecialRule() {
		spiritCard.specialRules.rules.push({
      id: spiritCard.specialRules.rules.length,
			name: "",
			effect: "",
		});
		spiritCard.specialRules.rules = spiritCard.specialRules.rules;
	}

	function removeSpecialRule(index) {
		spiritCard.specialRules.rules.splice(index, 1);
    spiritCard.specialRules.rules.forEach((rule, i) => {
      rule.id = i
    })
		spiritCard.specialRules.rules = spiritCard.specialRules.rules;
	}
</script>

<nav class="navbar">
	<div class="navbar-brand">
		<h1 class="title is-1">Build Your Spirit Island Components!</h1>
	</div>
</nav>
<div class="container">
	<section class="section">
		<h3 class="title is-3">Spirit Card</h3>
	</section>
	<div class="columns">
		<div class="column">
			<h5 class="title is-5">Spirit Card</h5>
			<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="nameAndArt">Spirit Name & Art
			<span class="icon">
				{#if spiritCard.nameAndArt.isVisible}
					<ion-icon name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritCard.nameAndArt.isVisible}
				<div class="field">
					<label class="label" for="spiritNameInput">Spirit Name</label>
					<div class="control">
						<input
							id="spiritNameInput"
							class="input"
							type="text"
							bind:value={spiritCard.nameAndArt.name}
						/>
					</div>
				</div>
			{/if}
			<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="specialRules">Special Rules
				<span class="icon">
				{#if spiritCard.specialRules.isVisible}
					<ion-icon name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon name="chevron-up-outline"></ion-icon>
				{/if}
				</span>
			</h6>
			{#if spiritCard.specialRules.isVisible}
				{#each spiritCard.specialRules.rules as rule, i (rule.id)}
					<div class="field">
						<label
							class="label is-flex is-justify-content-space-between"
							for={`ruleNameInput${i}`}
							>Special Rule {i + 1} Name {#if spiritCard.specialRules.rules.length > 1}<span
									on:click={removeSpecialRule(i)}>Remove This Rule X</span
								>{/if}</label
						>
						<div class="control">
							<input
								id={`ruleNameInput${i}`}
								class="input"
								type="text"
								bind:value={spiritCard.specialRules.rules[i].name}
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
								bind:value={spiritCard.specialRules.rules[i].effect}
							/>
						</div>
					</div>
					{#if i === spiritCard.specialRules.rules.length - 1}
						<div class="field">
							<div class="control">
								<button class="button is-primary is-light" on:click={addSpecialRule}>Add Another Rule</button>
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
		<div class="column">
			<h5 class="subtitle is-5">Spirit Card Values</h5>
			<p>Name: {spiritCard.nameAndArt.name}</p>
			{#each spiritCard.specialRules.rules as rule, i}
				<p>Special Rule {i + 1} Name: {rule.name}</p>
				<p>Special Rule {i + 1} Effect: {rule.effect}</p>
			{/each}
		</div>
	</div>
</div>
