<script>
  export let spiritBoard
  
    function useGrowthSets() {
		spiritBoard.growth.useGrowthSets = true;
	}
	
    function addGrowthSet() {
		spiritBoard.growth.growthSets.push({
      id: spiritBoard.growth.growthSets.length,
			name: "",
			effect: "",
		});
		spiritBoard.growth.growthSets = spiritBoard.growth.growthSets;
	}
	
	function addGrowthGroup(setIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups.push({
      id: spiritBoard.growth.growthSets[setIndex].growthGroups.length,
			name: "",
			effect: "",
		});
		spiritBoard.growth.growthSets[setIndex].growthGroups = spiritBoard.growth.growthSets[setIndex].growthGroups;
	}

	function addGrowthAction(setIndex, groupIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.push({
      id: spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.length,
			name: "",
			effect: "",
		});
		spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions = spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions;
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
							<button class="button is-primary is-light row-button" on:click={useGrowthSets}>Use Growth Sets</button>
						</div>
					</div>
				{#each spiritBoard.growth.growthSets as growthSet, i (growthSet.id)}
					<div class="growth-set field">
						{#if spiritBoard.growth.useGrowthSets}
							<div class="growth-set-title field">
								<div class="label">Growth Set
								</div>
							</div>
						{/if}
						<div class="growth-set-info field">
							{#each spiritBoard.growth.growthSets.growthGroups as growthGroup, j (growthGroup.id)}
								<div class="growth-group field">
									<div class="growth-group-title field">
										<div class="label">Growth Group
										</div>
									</div>
									<div class="growth-group-info field">
										<div class="control">
											<button class="button is-primary is-light row-button" on:click={addGrowthSet}>Add Growth Action</button>
										</div>
										{#each spiritBoard.growth.growthSets.growthGroups.growthActions as growthAction, k (growthAction.id)}
											<div class="control">
												<input
													id="spiritGrowthInput"
													class="input"
													type="text"
													placeholder="Growth Action"
													bind:value={spiritBoard.growth.name}
												/>
											</div>
										{/each}
									</div>
								</div>
								{#if j === spiritBoard.growth.growthSets.growthGroups.length - 1}
									<div class="field">
										<div class="control">
											<button class="button is-primary is-light row-button" on:click={addGrowthGroup}>Add Growth Group</button>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			{/if}