<script>
  export let spiritBoard
  export let showOrHideSection
  import * as Lib from './lib'

	function setSpeedTextbox(powerSpeed, innatePower, event) {
		innatePower.speed = powerSpeed;
		console.log(event)
		event.target.classList.add("active-highlight"); //yeah but somehow i need this to switch back and forth
		spiritBoard = spiritBoard;
	}
	
	function setTargetTextbox(targetTitle, innatePower) {
		innatePower.targetTitle = targetTitle;
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
		spiritBoard = Lib.addLevel(spiritBoard, powerIndex);
	}
	
	function addInnatePower() {
		spiritBoard = Lib.addInnatePower(spiritBoard);
	}
	
	function removeInnatePower(powerIndex) {
		spiritBoard.innatePowers.powers.splice(powerIndex, 1);
		spiritBoard.innatePowers.powers.forEach((power, i) => {
		  power.id = i
		})
		spiritBoard = spiritBoard;
	}
	
</script>

<h6 on:click={showOrHideSection} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1" id="innatePowers">Innate Powers
			<span id="innatePowers" on:click={showOrHideSection}>
				{#if spiritBoard.innatePowers.isVisible}
					<ion-icon id="innatePowers" on:click={showOrHideSection} name="chevron-down-outline"></ion-icon>
				{:else}
					<ion-icon id="innatePowers" on:click={showOrHideSection} name="chevron-up-outline"></ion-icon>
				{/if}
				</span></h6>
			{#if spiritBoard.innatePowers.isVisible}
				{#each spiritBoard.innatePowers.powers as innatePower, i (innatePower.id)}
				<div class="field mt-2">
					<label class="label mb-1" for="spiritGrowthInput">{`Innate Power ${i+1}`}</label>
					<div class="is-flex is-flex-direction-row">
						<div class="control"  style="width:100%">
							<input
								id={`powerName${i}`}
								class="input"
								type="text"
								placeholder="Power Name"
								bind:value={innatePower.name}
							/>
						</div>
						<button class="button is-primary is-light" on:click={removeInnatePower(i)}>Remove Innate Power</button>
					</div>
				</div>
				<div class="is-flex is-flex-direction-row is-flex-wrap-nowrap">
					<div>
						<div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
						  <button class="button button-hold mb-0" id="fast-button" on:click={setSpeedTextbox("Fast", innatePower)}>Fast</button>
						  <button class="button button-hold mb-0" id="slow-button" on:click={setSpeedTextbox("Slow", innatePower)}>Slow</button>
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
					</div>
					<div class="is-flex is-flex-direction-column is-flex-wrap-nowrap">
						<div class="is-flex is-flex-direction-row-reverse is-flex-wrap-nowrap">
							<div class="control">
								<input
									id={`targetTitle${i}`}
									class="input"
									type="text"
									placeholder="Target Title"
									disabled
									bind:value={innatePower.targetTitle}
								/>
							</div>
							<div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
							  <button class="button mb-0" on:click={setTargetTextbox("Target Land", innatePower)}>Land</button>
							  <button class="button mb-0" on:click={setTargetTextbox("Target", innatePower)}>Spirit</button>
							</div>
						</div>
						<div class="buttons has-addons is-flex is-flex-direction-row is-flex-wrap-nowrap mb-0">
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
						</div>
				</div>
				<div class="control field">
					<input
						id={`powerNote${i}`}
						class="input"
						type="text"
						placeholder="Note (optional)"
						bind:value={innatePower.note}
					/>
				</div>
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
						<div class="control" style="width:100%">
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
<!-- 				{#if !innatePower.noteShow}
					<button class="button is-primary is-light" on:click={addNote(innatePower)}>Add Note</button>
				{/if}
				{#if innatePower.noteShow}
					<button class="button is-primary is-light" on:click={removeNote(innatePower)}>Delete Note</button>
				{/if} -->
				{/each}
				<div class="pt-1">
					<button class="button is-primary is-light" on:click={addInnatePower}>Add Innate Power</button>
				</div>
			{/if}