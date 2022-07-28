<script>
  export let spiritBoard
  export let showOrHideSection
	
	function addEnergyTrackNode() {
	spiritBoard.presenceTrack.energyNodes.push({
	id: spiritBoard.presenceTrack.energyNodes.length,
		effect: "",
	});
	spiritBoard = spiritBoard;
	}
	
	function addPlaysTrackNode() {
	spiritBoard.presenceTrack.playsNodes.push({
	id: spiritBoard.presenceTrack.playsNodes.length,
		effect: "",
	});
	spiritBoard = spiritBoard;
	}
	
	function addMiddleTrackNode() {
	spiritBoard.presenceTrack.middleNodes.push({
	id: spiritBoard.presenceTrack.middleNodes.length,
		effect: "",
	});
	spiritBoard = spiritBoard;
	}
	
	function useMiddleNodes() {
		spiritBoard.presenceTrack.useMiddleNodes = true;
	}
	function disableMiddleNodes() {
		spiritBoard.presenceTrack.useMiddleNodes = false;
	}
	
</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="presenceTrack">Presence Tracks
			<span id="presenceTrack" on:click={showOrHideSection}>
				{#if spiritBoard.presenceTrack.isVisible}
					<ion-icon id="presenceTrack" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="presenceTrack" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.presenceTrack.isVisible}
				<div class="field">
					<label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput">Energy Track<button class="button presence-track-button" on:click={addEnergyTrackNode}>Add Node</button></label>
					<div class="presence-track-row">
						{#each spiritBoard.presenceTrack.energyNodes as energyNode, i (energyNode.id)}
						<!-- {#each Array(8) as _, i} -->
							<div class="control">
								<input
									id={`energy${i}`}
									class="input is-small"
									type="text"
									bind:value={spiritBoard.presenceTrack.energyNodes[i].effect}
								/>
							</div>
						{/each}
					</div>
				</div>
				{#if spiritBoard.presenceTrack.useMiddleNodes}
				<div class="field">
					<label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput">Middle Track<button class="button presence-track-button" on:click={addMiddleTrackNode}>Add Node</button></label>
					<div class="presence-track-row">
						{#each spiritBoard.presenceTrack.middleNodes as middleNode, i (middleNode.id)}
						<!-- {#each Array(8) as _, i} -->
							<div class="control">
								<input
									id={`middle${i}`}
									class="input is-small"
									type="text"
									bind:value={spiritBoard.presenceTrack.middleNodes[i].effect}
								/>
							</div>
						{/each}
					</div>
				</div>
				{/if}
				<div class="field">
					<label class="label is-flex is-justify-content-space-between" for="spiritGrowthInput">Plays Track<button class="button presence-track-button" on:click={addPlaysTrackNode}>Add Node</button></label>
					<div class="presence-track-row">
						{#each spiritBoard.presenceTrack.playsNodes as playNode, i (playNode.id)}
						<!-- {#each Array(8) as _, i} -->
							<div class="control">
								<input
									id={`plays${i}`}
									class="input is-small"
									type="text"
									bind:value={spiritBoard.presenceTrack.playsNodes[i].effect}
								/>
							</div>
						{/each}
					</div>
				</div>
				<div class="control">
				{#if !spiritBoard.presenceTrack.useMiddleNodes}
					<button class="button is-primary is-light row-button" on:click={useMiddleNodes}>Use Middle Nodes</button>
				{:else}
					<button class="button is-primary is-light row-button" on:click={disableMiddleNodes}>Disable Middle Nodes</button>
				{/if}
				</div>
			{/if}