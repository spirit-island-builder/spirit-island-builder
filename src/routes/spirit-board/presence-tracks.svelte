<script>
  export let spiritBoard
  export let showOrHideSection

</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="presenceTrack">Presence Track
			<span id="presenceTrack" on:click={showOrHideSection}>
				{#if spiritBoard.presenceTrack.isVisible}
					<ion-icon id="presenceTrack" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="presenceTrack" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.presenceTrack.isVisible}
				<div class="field">
					<label class="label" for="spiritGrowthInput">Presence Track</label>
					<div class="control">
						<input
							id="spiritGrowthInput"
							class="input"
							type="text"
							bind:value={spiritBoard.presenceTrack.name}
						/>
					</div>
				</div>
			{/if}