<script>
	import * as Lib from './lib'
	
  export let spiritBoard

  export let showOrHideSection
</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1" id="customIcons">Custom Icons (optional)
				<span on:click={showOrHideSection}>
				{#if spiritBoard.customIcons.isVisible}
					<ion-icon id="customIcons" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="customIcons" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span>
			</h6>
			{#if spiritBoard.customIcons.isVisible}
			<article class="message is-small mb-1">
			<div class="message-body p-1">
			Custom Icons allow you to load and then use icons that aren't pre-built into the template.
			</div>
			</article>
			{#each spiritBoard.customIcons.icons as icon, i (icon.id)}
			<div class="field has-addons is-horizontal is-justify-content-left mb-0">
				<div class="field-label is-small">
					<label class="label" for={`customIconInput${i}`}>&lbrace;custom{i+1}&rbrace;</label>
				</div>
				<div class="control">
					<input
						id={`customIconInput${i}`}
						class="input is-small"
						type="text"
						disabled
						placeholder="File Name"
						bind:value={spiritBoard.customIcons.icons[i].name}
					/>
				</div>
				<button class="button is-warning is-light is-small row-button">Load File</button>
			</div>
			{/each}
			{/if}