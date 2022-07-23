<script>
  export let spiritBoard
  export let showOrHideSection

</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="innatePowers">Innate Powers
			<span id="innatePowers" on:click={showOrHideSection}>
				{#if spiritBoard.innatePowers.isVisible}
					<ion-icon id="innatePowers" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="innatePowers" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.innatePowers.isVisible}
				<div class="field">
					<label class="label" for="spiritGrowthInput">Innate Powers</label>
					<div class="control">
						<input
							id="spiritGrowthInput"
							class="input"
							type="text"
							bind:value={spiritBoard.innatePowers.name}
						/>
					</div>
				</div>
			{/if}