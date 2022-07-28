<script>
	// exports allow for properties to be passed into this component. So the value of spiritBoard can be set by whatever component is the parent of this one. See https://svelte.dev/tutorial/declaring-props
  export let spiritBoard
  export let showOrHideSection
</script>



<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="previewBoard">Preview Board
			<span on:click={showOrHideSection}>
				{#if spiritBoard.previewBoard.isVisible}
					<ion-icon id="previewBoard" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="previewBoard" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.previewBoard.isVisible}
				<iframe bind:this={frame} src='/template/My Custom Content/My Spirit/board_front.html' height=600 width=600 title='yay'></iframe>
			{/if}