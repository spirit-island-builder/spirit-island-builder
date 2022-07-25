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
		spiritBoard.growth.growthSets = spiritBoard.growth.growthSets;
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
				{#if !spiritBoard.growth.useGrowthSets}
					<div class="field">
						<div class="control">
							<button class="button is-primary is-light row-button" on:click={useGrowthSets}>Use Growth Sets</button>
						</div>
					</div>
				{/if}
				{#each spiritBoard.growth.growthSets as growthSet, i (growthSet.id)}
					<div class="growth-set">
						{#if spiritBoard.growth.useGrowthSets}
							<div class="growth-set-title">
								<div class="label">Growth Set
								</div>
							</div>
						{/if}
						<div class="growth-set-info">
							{#if spiritBoard.growth.useGrowthSets}
								<div class="control">
									<input
										id="spiritGrowthInput"
										class="input"
										type="text"
										placeholder="Growth Set Action ie. (PICK ONE OF)"
										bind:value={growthSet.choiceText}
									/>
								</div>
							{/if}
							{#each growthSet.growthGroups as growthGroup, j (growthGroup.id)}
								<div class="growth-group">
									<div class="growth-group-title">
										<div class="label">Growth Group
										</div>
									</div>
									<div class="growth-group-info">
										{#each growthGroup.growthActions as growthAction, k (growthAction.id)}
											<div class="control">
												<input
													id="spiritGrowthInput" 
													class="input"
													type="text"
													placeholder="Growth Action"
													bind:value={growthAction.effect}
												/> <!-- Eric, does the bind syntax look right? -->
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
					<div class="control">
						<button class="button is-primary is-light row-button" on:click={addGrowthSet}>Add Growth Set</button>
					</div>
					<div class="control">
						<button class="button is-primary is-light row-button" on:click={removeAllGrowthSets}>Remove All Growth Sets</button>
					</div>
				{/if}
			{/if}

<style>
	.growth-set {
	display: flex;
	flex-direction: row;
}
.growth-set-title, .growth-group-title {
    display: flex;
    flex-direction: column-reverse;
    background-color: #eff1fa!important;
    width: 1.8em;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
	min-height:10rem;
	margin: 1px;
}
.growth-set-info {
	display: flex;
	flex-direction: column;
	min-width: 20rem;
}
.growth-group {
	display: flex;
	flex-direction: row;
}

.growth-group-info {
	display: flex;
	flex-direction: column;
}
.growth-set-title > .label, .growth-group-title > .label{
	transform-origin: center;
	transform: rotate(270deg);
    text-align: center;
    width: 8rem;
}
</style>