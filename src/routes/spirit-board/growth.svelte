<script>
  export let spiritBoard
  
    function addGrowthSet() {
		spiritBoard.growth.growthSets.push({
      id: spiritBoard.growth.growthSets.length,
			name: "",
			effect: "",
		});
		spiritBoard.growth.growthSets = spiritBoard.growth.growthSets;
	}
  
  export let showOrHideSection

</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="growth">Growth
			<span id="growth" on:click={showOrHideSection}>
				{#if spiritBoard.growth.isVisible}
					<ion-icon id="growth" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="growth" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.growth.isVisible}
					<div class="field">
						<div class="control">
							<button class="button is-primary is-light" on:click={addGrowthSet}>Add Growth Set (ie. Lure)</button>
						</div>
					</div>
					<div class="field">
						<div class="control">
							<button class="button is-primary is-light" on:click={addGrowthSet}>Add Growth Group</button>
						</div>
					</div>
				{#each spiritBoard.growth.growthSets as growthSet, i (growthSet.id)}
					<div class="field">
						<label class="label" for="spiritGrowthInput">Growth</label>
						<div class="control">
							<input
								id="spiritGrowthInput"
								class="input"
								type="text"
								bind:value={spiritBoard.growth.name}
							/>
						</div>
					</div>
					
					
				{/each}
			{/if}