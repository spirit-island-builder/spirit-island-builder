<script>
  export let spiritBoard
  export let showOrHideSection

	function setSpeedTextbox(powerSpeed, innatePower) {
		innatePower.speed = powerSpeed;
		spiritBoard = spiritBoard;
	}
	
	function addNote(innatePower) {
		innatePower.noteShow = true;
		spiritBoard = spiritBoard;
	}
	
	function removeNote(innatePower) {
		innatePower.noteShow = false;
		innatePower.note = "";
		spiritBoard = spiritBoard;
	}
	
	function removeLevel(powerIndex, levelIndex) {
		spiritBoard.innatePowers.powers[powerIndex].levels.splice(levelIndex, 1);
		spiritBoard.innatePowers.powers[powerIndex].levels.forEach((level, i) => {
		  level.id = i
		})
		spiritBoard = spiritBoard;
	}
	
	function addLevel(powerIndex) {
		spiritBoard.innatePowers.powers[powerIndex].levels.push({
			id: spiritBoard.innatePowers.powers[powerIndex].levels.length,
			threshold: "",
			effect: "",
		});
		spiritBoard = spiritBoard;
	}
	
	function addInnatePower() {
		spiritBoard.innatePowers.powers.push({
			id: spiritBoard.innatePowers.powers.length,
			name: "",
			speed:"",
			range:"",
			target:"",
			effect: "",
			note:"",
			noteShow:false,
			levels: [
				{
					id: 0,
					threshold: "",
					effect: "",
				},
			],
		});
		spiritBoard = spiritBoard;
	}
	
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
				{#each spiritBoard.innatePowers.powers as innatePower, i (innatePower.id)}
				<div class="field">
					<label class="label" for="spiritGrowthInput">{`Innate Power ${i+1}`}</label>
					<div class="control">
						<input
							id={`powerName${i}`}
							class="input"
							type="text"
							placeholder="Power Name"
							bind:value={innatePower.name}
						/>
					</div>
				</div>
				<div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
					<div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
					  <button class="button" on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
					  <button class="button" on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
					</div>
					<div class="control">
						<input
							id={`powerSpeed${i}`}
							class="input"
							type="text"
							placeholder="Speed"
							disabled
							bind:value={innatePower.speed}
						/>
					</div>
					<div class="control">
						<input
							id={`powerRange${i}`}
							class="input"
							type="text"
							placeholder="Range"
							bind:value={innatePower.range}
						/>
					</div>
					<div class="control">
						<input
							id={`powerTarget${i}`}
							class="input"
							type="text"
							placeholder="Target"
							bind:value={innatePower.target}
						/>
					</div>
				</div>
				{#if innatePower.noteShow}
				<div class="control">
					<input
						id={`powerNote${i}`}
						class="input"
						type="text"
						placeholder="Note"
						bind:value={innatePower.note}
					/>
				</div>
				{/if}
				<button class="button is-primary is-light" on:click={addLevel(i)}>Add Level</button>
				{#each innatePower.levels as level, j (level.id)}
					<div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
						<div class="control">
							<input
								id={`levelThreshold${j}`}
								class="input"
								type="text"
								placeholder="Threshold"
								bind:value={level.threshold}
							/>
						</div>
						<div class="control">
							<input
								id={`levelEffect${j}`}
								class="input"
								type="text"
								placeholder="Effect"
								bind:value={level.effect}
							/>
						</div>
						<button class="button is-primary is-light row-button" on:click={removeLevel(i,j)}>Remove</button>
					</div>
				{/each}
				{#if !innatePower.noteShow}
					<button class="button is-primary is-light" on:click={addNote(innatePower)}>Add Note</button>
				{/if}
				{#if innatePower.noteShow}
					<button class="button is-primary is-light" on:click={removeNote(innatePower)}>Delete Note</button>
				{/if}
				{/each}
				<button class="button is-primary is-light" on:click={addInnatePower}>Add Innate Power</button>
			{/if}