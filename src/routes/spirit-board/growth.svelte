<script>
  export let spiritBoard
  
    function useGrowthSets() {
		spiritBoard.growth.useGrowthSets = true;
	}

    function removeAllGrowthSets() {
		spiritBoard.growth.useGrowthSets = false;
	} /* <!-- also remove all the growth sets --> */
	
    function addGrowthSet() {
		spiritBoard.growth.growthSets.push({
      id: spiritBoard.growth.growthSets.length,
			name: "",
			choiceText: "",
			growthGroups: [
				{
					id: 0,
					name: "",
					effect: "",
					growthActions: [
						{
							id: 0,
							name: "",
							effect: "",
						}
					],
				}
			],
		});
		spiritBoard = spiritBoard;
	}
	
	function addGrowthGroup(setIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups.push({
      id: spiritBoard.growth.growthSets[setIndex].growthGroups.length,
			name: "",
			effect: "",
			growthActions: [
				{
					id: 0,
					name: "",
					effect: "",
				}
			],
		});
		spiritBoard = spiritBoard;
	}

	function addGrowthAction(setIndex, groupIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.push({
      id: spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.length,
			name: "",
			effect: "",
		});
		// This works and is easier to read
		spiritBoard = spiritBoard
	}
	
	function removeGrowthAction(setIndex, groupIndex, actionIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.splice(actionIndex, 1);
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.forEach((growthAction, i) => {
      growthAction.id = i
    })
		spiritBoard = spiritBoard;
	}
	
	function removeGrowthGroup(setIndex, groupIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups.splice(groupIndex, 1);
    spiritBoard.growth.growthSets[setIndex].growthGroups.forEach((growthGroup, i) => {
      growthGroup.id = i
    })
		spiritBoard = spiritBoard;
	}
	
	function removeGrowthSet(setIndex) {
		spiritBoard.growth.growthSets.splice(setIndex, 1);
    spiritBoard.growth.growthSets.forEach((growthSet, i) => {
      growthSet.id = i
    })
		spiritBoard = spiritBoard;
	}
	
	function addGrowthGroup(setIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups.push({
      id: spiritBoard.growth.growthSets[setIndex].growthGroups.length,
			name: "",
			effect: "",
			growthActions: [
				{
					id: 0,
					name: "",
					effect: "",
				}
			],
		});
		spiritBoard.growth.growthSets[setIndex].growthGroups = spiritBoard.growth.growthSets[setIndex].growthGroups;
	}

	function addGrowthAction(setIndex, groupIndex) {
		spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.push({
      id: spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.length,
			name: "",
			effect: "",
		});
		// This works and is easier to read
		spiritBoard = spiritBoard
	}
	
	function removeGrowthAction(setIndex, groupIndex, actionIndex) {
	
		spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.splice(actionIndex, 1);
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.forEach((growthAction, i) => {
      growthAction.id = i
    })
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
			</span>
</h6>
			{#if spiritBoard.growth.isVisible}

				<div class="control">
					<input
						id="growthDirections"
						class="input"
						type="text"
						placeholder='Growth Directions (ie. "Pick Two")'
						bind:value={spiritBoard.growth.directions}
					/>
				</div>

				{#if !spiritBoard.growth.useGrowthSets}
					<div class="control">
						<button class="button is-primary is-light row-button" on:click={useGrowthSets}>Use Growth Sets</button>
					</div>
				{/if}
				{#each spiritBoard.growth.growthSets as growthSet, i (growthSet.id)}
					<div class="growth-set">
						{#if spiritBoard.growth.useGrowthSets}
							<div class="growth-set-title">
								<div class="label">Growth Set
								</div>
								<button class="button growth-set-button" on:click={removeGrowthSet(i)}>&#10006;</button>
							</div>
						{/if}
						<div class="growth-set-info">
							{#if spiritBoard.growth.useGrowthSets}
								<div class="control">
									<input
										id={`growthSetChoice${i}`}
										class="input"
										type="text"
										placeholder="Growth Set Choice ie. (PICK ONE OF)"
										bind:value={growthSet.choiceText}
									/>
								</div>
							{/if}
							{#each growthSet.growthGroups as growthGroup, j (growthGroup.id)}
								<div class="growth-group">
									<div class="growth-group-title">
										<div class="label">Growth Group
										</div>
										<button class="button growth-group-button" on:click={removeGrowthGroup(i,j)}>&#10006;</button>
								</div>
									<div class="growth-group-info">
										{#each growthGroup.growthActions as growthAction, k (growthAction.id)}
											<div class="growth-action-container">
												<div class="control">
													<input
														id={`growthSet{i}Group{j}Action{k}`}
														class="input"
														type="text"
														placeholder="Growth Action"
														bind:value={growthAction.effect}
													/>
												</div>
												<button class="button is-primary is-light row-button" on:click={removeGrowthAction(i,j,k)}>Remove</button>
											</div>
										{/each}
										<div class="control">
											<button class="button is-primary is-light row-button" on:click={addGrowthAction(i,j)}>Add Growth Action</button> <!-- Could I just pass the growthgroup as growthGroup instead of the indexes? -->
										</div>
									</div>
								</div>
							{/each}
							{#if spiritBoard.growth.useGrowthSets || i === spiritBoard.growth.growthSets.length - 1}
							<div class="field">
								<div class="control">
									<button class="button is-primary is-light row-button" on:click={addGrowthGroup(i)}>Add Growth Group</button>
								</div>
							</div>
							{/if}
						</div>
					</div>
				{/each}
				{#if spiritBoard.growth.useGrowthSets}
					<div class="field">
						<div class="control">
							<button class="button is-primary is-light row-button" on:click={addGrowthSet}>Add Growth Set</button>
						</div>
						<div class="control">
							<button class="button is-primary is-light row-button" on:click={removeAllGrowthSets}>Remove All Growth Sets</button>
						</div>
					</div>
				{/if}
			{/if}