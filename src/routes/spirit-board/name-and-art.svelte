<script>
	// exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard
  export let showOrHideSection
</script>



<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="nameAndArt">Spirit Name & Art
			<span on:click={showOrHideSection}>
				{#if spiritBoard.nameAndArt.isVisible}
					<ion-icon id="nameAndArt" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="nameAndArt" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.nameAndArt.isVisible}
				<div class="field">
					<label class="label" for="spiritNameInput">Spirit Name</label>
					<div class="control">
						<input
							id="spiritNameInput"
							class="input"
							type="text"
							bind:value={spiritBoard.nameAndArt.name}
						/>
					</div>
				</div>
			{/if}