<script>
	import { onMount } from 'svelte';
  import NameAndArt from './name-and-art.svelte'
  import SpecialRules from './special-rules.svelte'
  import Growth from './growth.svelte'
  import PresenceTracks from './presence-tracks.svelte'
  import InnatePowers from './innate-powers.svelte'


  let spiritBoard = {
		previewBoard: {
			isVisible: false,
		},
		nameAndArt: {
			isVisible: false,
			name: "",
		},
		specialRules: {
			isVisible: false,
			rules: [
				{
          id: 0,
					name: "",
					effect: "",
				},
			],
		},
		growth: {
			isVisible: false,
			useGrowthSets: false,
			directions: "",
			growthSets: [
				{
					id: 0,
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
				}
			],
		},
		presenceTrack: {
			isVisible: false,
			useMiddleNodes: false,
			name: "",
			energyNodes: [
				{
					id: 0,
					effect: "",
				}
			],
			playsNodes: [
				{
					id: 0,
					effect: "",
				}
			],
			middleNodes: [
				{
					id: 0,
					effect: "",
				}
			],
		},
		innatePowers: {
			isVisible: false,
			name: "",
			powers: [
				{
					id: 0,
					name: "",
					speed:"",
					range:"",
					target:"",
					targetTitle:"",
					effect: "",
					note:"",
					noteShow:true,
					levels: [
						{
							id: 0,
							threshold: "",
							effect: "",
						},
					],
				},
			],
		},
	};

  function showOrHideSection(event) {
		spiritBoard[event.target.id].isVisible = !spiritBoard[event.target.id].isVisible;
	}

	let frame
	onMount(() => {
    frame.addEventListener('load', onLoad());
  })
  function onLoad() {
		if (frame) {
			readHTML();
			setBoardValues(spiritBoard);
			reloadPreview();
		}

  }

	function setBoardValues(spiritBoard) {
		if (frame) {
			//Set Spirit Name and Image
			const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
			if (spiritName) {
				spiritName.textContent = spiritBoard.nameAndArt.name
			}

			//Set Special Rules
			const specialRulesContainer = frame.contentDocument.querySelectorAll('special-rules-container')[0]
			const specialRulesNames = frame.contentDocument.querySelectorAll('special-rules-subtitle')
			const specialRulesEffects = frame.contentDocument.querySelectorAll('special-rule')
			for (let j = 0; j < spiritBoard.specialRules.rules.length; j++) {
				//sort out the looping
				if (specialRulesNames[j]) {
					// check for existing special rule and overwrite
					specialRulesNames[j].textContent = spiritBoard.specialRules.rules[j].name;
					specialRulesEffects[j].textContent = spiritBoard.specialRules.rules[j].effect;
				} else {
					// add new special rule
					var newRuleName = frame.contentDocument.createElement('special-rules-subtitle');
					newRuleName.textContent = spiritBoard.specialRules.rules[j].name;
					var newRuleEffect = frame.contentDocument.createElement('special-rule');
					newRuleEffect.textContent = spiritBoard.specialRules.rules[j].effect;
					specialRulesContainer.appendChild(newRuleName)
					specialRulesContainer.appendChild(newRuleEffect)
				}
			}
			
			//Set Growth
			const growthContainer = frame.contentDocument.querySelectorAll('growth')[0]
			if(growthContainer){
				//(easiest to start fresh each time)
				growthContainer.textContent="";
			}
			if(!spiritBoard.growth.useGrowthSets){
				growthContainer.setAttribute("title",`Growth (${spiritBoard.growth.directions})`);
			}else{
				growthContainer.setAttribute("title",`Growth`)
			}
			
			for (let i = 0; i < spiritBoard.growth.growthSets.length; i++) {
				var growthSet = spiritBoard.growth.growthSets[i];
				var containerLayer
				if (spiritBoard.growth.growthSets.length>1) {
					var newSubgroup = frame.contentDocument.createElement('sub-growth');
					newSubgroup.setAttribute("title",`${growthSet.choiceText}`);
					if (i < spiritBoard.growth.growthSets.length-1){
						newSubgroup.setAttribute("bordered","")
					}
					containerLayer = newSubgroup
				}else{
					containerLayer = growthContainer;
				}
				for (let j = 0; j < spiritBoard.growth.growthSets[i].growthGroups.length; j++) {
					var growthGroup = growthSet.growthGroups[j];
					var growthGroupOutput = frame.contentDocument.createElement('growth-group');
					
					//Cost
					
					
					//Values
					var values = ""
					for (let k = 0; k < spiritBoard.growth.growthSets[i].growthGroups[j].growthActions.length; k++) {
						var growthAction = growthGroup.growthActions[k];
						values += growthAction.effect + ";"
					}
					growthGroupOutput.setAttribute("values",values.slice(0,-1)) //slice removes last semicolon
					
					containerLayer.appendChild(growthGroupOutput)
				}
				
				if (spiritBoard.growth.growthSets.length>1) {
					//Add growth set to the growth if using sets
					growthContainer.appendChild(newSubgroup)
				}
			}


			//Set Presence Tracks
			const presenceTrackContainer = frame.contentDocument.querySelectorAll('presence-tracks')[0]
			if(presenceTrackContainer){
				//(easiest to start fresh each time)
				presenceTrackContainer.textContent="";
			}
			
			var energyTrack = frame.contentDocument.createElement('energy-track');
			var energyNodeList = spiritBoard.presenceTrack.energyNodes;
			var energyValues = ""
			for (let i = 0; i < energyNodeList.length; i++) {
				var energyNode = energyNodeList[i];
				energyValues += energyNode.effect + ","
			}
			energyTrack.setAttribute("values",energyValues.slice(0,-1))
			presenceTrackContainer.appendChild(energyTrack);
			
			var playsTrack = frame.contentDocument.createElement('card-play-track');
			var playsNodeList = spiritBoard.presenceTrack.playsNodes;
			var playsValues = ""
			for (let i = 0; i < playsNodeList.length; i++) {
				var playsNode = playsNodeList[i];
				playsValues += playsNode.effect + ","
			}
			playsTrack.setAttribute("values",playsValues.slice(0,-1))
			presenceTrackContainer.appendChild(playsTrack);
			
			
			//Load Innate Powers
			const innatePowerContainer = frame.contentDocument.querySelectorAll('innate-powers')[0]
			if(innatePowerContainer){
				//(easiest to start fresh each time)
				innatePowerContainer.textContent="";
			}
			
			for (let i = 0; i < spiritBoard.innatePowers.powers.length; i++) {
					var newInnatePower = frame.contentDocument.createElement('quick-innate-power');
					var power = spiritBoard.innatePowers.powers[i];
					newInnatePower.setAttribute("name",power.name);
					newInnatePower.setAttribute("speed",power.speed.toLowerCase());
					newInnatePower.setAttribute("range",power.range);
					newInnatePower.setAttribute("target",power.target);
					newInnatePower.setAttribute("target-title",power.targetTitle);
					if(power.noteShow){newInnatePower.setAttribute("note",power.note);} // may need to clear it?
					for (let j = 0; j < power.levels.length; j++) {
						var level = power.levels[j];
						var newLevel = frame.contentDocument.createElement('level');
						newLevel.setAttribute("threshold",level.threshold)
						newLevel.textContent = level.effect;
						newInnatePower.appendChild(newLevel)
					}
					innatePowerContainer.appendChild(newInnatePower)
			}
		}
	}
	
	function showOrHideBoard() {
		if(document.getElementById("board-wrap").style.display == "none"){
			document.getElementById("board-wrap").style.display = "block";
		}else{
			document.getElementById("board-wrap").style.display = "none";
		}
		console.log("this iiis a test")
		console.log(document.getElementById("board-wrap"))
		console.log(document.getElementById("board-wrap").style.display)
	}
	
	function readHTML() {
		//Similar to setting, but backwards
		if (frame) {
			//Set Spirit Name and Image
			const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
			if (spiritName) {
				console.log("Reading Spirit Name")
				spiritBoard.nameAndArt.name = spiritName.textContent.trim();
			}

			//Set Special Rules
			const specialRulesContainer = frame.contentDocument.querySelectorAll('special-rules-container')[0]
			const specialRulesNames = frame.contentDocument.querySelectorAll('special-rules-subtitle')
			const specialRulesEffects = frame.contentDocument.querySelectorAll('special-rule')
			for (let j = 0; j < specialRulesNames.length; j++) {
				if (spiritBoard.specialRules.rules[j]) {
					// check for existing special rule and overwrite
					spiritBoard.specialRules.rules[j].name = specialRulesNames[j].textContent;
					spiritBoard.specialRules.rules[j].effect = specialRulesEffects[j].textContent.trim();
					spiritBoard = spiritBoard;
				}else{
					// add new rules where necessary
					spiritBoard.specialRules.rules.push({
					id: j,
						name: specialRulesNames[j].textContent,
						effect: specialRulesEffects[j].textContent.trim(),
					});
					spiritBoard = spiritBoard;
				}
			}
			while(spiritBoard.specialRules.rules.length > specialRulesNames.length){
				//delete excess rules
				spiritBoard.specialRules.rules.pop();
				spiritBoard = spiritBoard;
			}



			//Set Growth
			const growthContainer = frame.contentDocument.querySelectorAll('growth')
			var htmlGrowthSets = growthContainer[0].querySelectorAll('sub-growth')
			var containerLayer
			var numSets = 1;
			if(htmlGrowthSets[0]){
				spiritBoard.growth.useGrowthSets=true;
				numSets = htmlGrowthSets.length;
				containerLayer = htmlGrowthSets
			}else{
				containerLayer = growthContainer
			}
			
			var regExpOuterParentheses = /\(\s*(.+)\s*\)/;
			let innerDirections = regExpOuterParentheses.exec(growthContainer[0].title)
			spiritBoard.growth.directions = innerDirections!==null ? innerDirections[1] : "";
			
			for (let i = 0; i < numSets; i++) {
				let groups = containerLayer[i].querySelectorAll('growth-group')
				if(!spiritBoard.growth.growthSets[i]){
					//addGrowthSet()
					spiritBoard.growth.growthSets.push({
						id: i,
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
					console.log('adding growth set')
				}
				for (let j = 0; j < groups.length; j++) {
					if(!spiritBoard.growth.growthSets[i].growthGroups[j]){
						//addGrowthGroup()
						spiritBoard.growth.growthSets[i].growthGroups.push({
							id: j,
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
						console.log('adding growth group')
					}
					let group = groups[j];
					let values = group.getAttribute("values").split(";");
					console.log(values)
					for (let k = 0; k < values.length; k++) {
						console.log(spiritBoard)
						if(spiritBoard.growth.growthSets[i].growthGroups[j].growthActions[k]){
							spiritBoard.growth.growthSets[i].growthGroups[j].growthActions[k].effect = values[k];
						}else{
							//addGrowthAction()
							spiritBoard.growth.growthSets[i].growthGroups[j].growthActions.push({
								id: k,
								name: "",
								effect: values[k],
							});
						}
					}
					while(spiritBoard.growth.growthSets[i].growthGroups[j].growthActions.length > values.length){
						//delete excess actions
						spiritBoard.growth.growthSets[i].growthGroups[j].growthActions.pop();
						spiritBoard = spiritBoard;
					}
				}
				while(spiritBoard.growth.growthSets[i].growthGroups.length > groups.length){
					//delete excess groups
					spiritBoard.growth.growthSets[i].growthGroups.pop();
					spiritBoard = spiritBoard;
				}
				spiritBoard.growth.growthSets[i].choiceText = containerLayer[i].getAttribute("title");
			}
			while(spiritBoard.growth.growthSets.length > numSets){
				//delete excess sets
				spiritBoard.growth.growthSets.pop();
				spiritBoard = spiritBoard;
			}


			//Set Presence Tracks
			var energyTrack = frame.contentDocument.querySelectorAll('energy-track')[0]
			var playsTrack = frame.contentDocument.querySelectorAll('card-play-track')[0]
			var energyValues = energyTrack.getAttribute("values").split(",");
			var playsValues = playsTrack.getAttribute("values").split(",");
			for (let k = 0; k < energyValues.length; k++) {
				if(spiritBoard.presenceTrack.energyNodes[k]){
					spiritBoard.presenceTrack.energyNodes[k].effect = energyValues[k];
				}else{
					spiritBoard.presenceTrack.energyNodes.push({
					id: spiritBoard.presenceTrack.energyNodes.length,
						effect: energyValues[k],
					});
					spiritBoard = spiritBoard;
				}
			}
			while(spiritBoard.presenceTrack.energyNodes.length > energyValues.length){
				//delete excess sets
				spiritBoard.presenceTrack.energyNodes.pop();
				spiritBoard = spiritBoard;
			}
			for (let k = 0; k < playsValues.length; k++) {
				if(spiritBoard.presenceTrack.playsNodes[k]){
					spiritBoard.presenceTrack.playsNodes[k].effect = playsValues[k];
				}else{
					spiritBoard.presenceTrack.playsNodes.push({
					id: spiritBoard.presenceTrack.playsNodes.length,
						effect: playsValues[k],
					});
					spiritBoard = spiritBoard;
				}
			}
			while(spiritBoard.presenceTrack.playsNodes.length > playsValues.length){
				//delete excess sets
				spiritBoard.presenceTrack.playsNodes.pop();
				spiritBoard = spiritBoard;
			}



			//Load Innate Powers
			var innatePowers = frame.contentDocument.querySelectorAll('quick-innate-power')
			for (let k = 0; k < innatePowers.length; k++) {
				if(spiritBoard.innatePowers.powers[k]){
					var power = spiritBoard.innatePowers.powers[k];
					power.name = innatePowers[k].getAttribute("name")
					power.speed = innatePowers[k].getAttribute("speed")
					power.range = innatePowers[k].getAttribute("range")
					power.target = innatePowers[k].getAttribute("target")
					power.targetTitle = innatePowers[k].getAttribute("target-title")
					if(innatePowers[k].getAttribute("note")){
						power.note = innatePowers[k].getAttribute("note")
						power.noteShow = true
					}
				}else{
					spiritBoard.innatePowers.powers.push({
						id: spiritBoard.innatePowers.powers.length,
						name: innatePowers[k].getAttribute("name"),
						speed: innatePowers[k].getAttribute("speed"),
						range: innatePowers[k].getAttribute("range"),
						target: innatePowers[k].getAttribute("target"),
						targetTitle: innatePowers[k].getAttribute("target-title"),
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
					if(innatePowers[k].getAttribute("note")){
						var power = spiritBoard.innatePowers.powers[k];
						power.note = innatePowers[k].getAttribute("note")
						power.noteShow = true
					}
					spiritBoard = spiritBoard;
				}
				var htmlLevels = innatePowers[k].querySelectorAll('level')
				console.log(htmlLevels)
				for (let j = 0; j < htmlLevels.length; j++) {
					var htmlLevel = htmlLevels[j];
					if(spiritBoard.innatePowers.powers[k].levels[j]){
						var formLevel = spiritBoard.innatePowers.powers[k].levels[j];
						formLevel.threshold = htmlLevel.getAttribute("threshold");
						formLevel.effect = htmlLevel.textContent.trim();
					}else{
						//addLevel(k);
						spiritBoard.innatePowers.powers[k].levels.push({
							id: spiritBoard.innatePowers.powers[k].levels.length,
							threshold: htmlLevel.getAttribute("threshold"),
							effect: htmlLevel.textContent.trim(),
						});
						spiritBoard = spiritBoard;
					}
				}
				while(spiritBoard.innatePowers.powers[k].levels.length > htmlLevels.length){
					spiritBoard.innatePowers.powers[k].levels.pop();
					spiritBoard = spiritBoard;
				}
			}
			while(spiritBoard.innatePowers.powers.length > innatePowers.length){
				spiritBoard.innatePowers.powers.pop();
				spiritBoard = spiritBoard;
			}
		}
	}

	function copyHTML() {
		console.log("attempting to copy html");
		console.log(document.getElementById("scaled-frame").contentWindow.document.body);
		console.log(document.getElementById("mod-frame").contentWindow.document.body);
		let bodyClone
		bodyClone = document.getElementById("mod-frame").contentWindow.document.body.cloneNode(true);
		document.getElementById("scaled-frame").contentWindow.document.body = bodyClone;
	}

	function reloadPreview() {
		console.log("attempting to reload preview");
		copyHTML();
		document.getElementById("scaled-frame").contentWindow.startMain();
	}
	
	// A script line that starts with $: is a "reactive declaration". It will run whenever a variable after the $: is modified. So in this case, we want setBoardValues to run whenever spiritBoard changes. See https://svelte.dev/tutorial/reactive-statements
	/* $: setBoardValues(spiritBoard) */
</script>


<!-- <section class="section">
		<h3 class="title is-3">Spirit Board</h3>
	</section> -->
	<h5 class="title is-5">Spirit Board</h5>
	<h6 on:click={showOrHideBoard} class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light" id="previewBoard">Preview Board
	<span on:click={showOrHideBoard}>
	{#if spiritBoard.previewBoard.isVisible}
			<ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline"></ion-icon>
		{:else}
			<ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline"></ion-icon>
		{/if}
		</span></h6>
	<div id="board-wrap">
		<iframe src='/template/My Custom Content/My Spirit/board_front.html' height=600 width=100% id="scaled-frame" title='yay'></iframe>
	</div>
	<div class="columns mt-0">
		<div class="column pt-0">

			
			<!-- Any kind of property can be passed to a component. Functions and variables. As long as they are also exported from the nested component (i.e. NameAndArt) they will be available for use in the nested component -->

				
			<NameAndArt bind:spiritBoard={spiritBoard} {showOrHideSection}></NameAndArt>
			<SpecialRules bind:spiritBoard={spiritBoard} {showOrHideSection}></SpecialRules>
		</div>
		<div class="column pt-0">
			<Growth bind:spiritBoard={spiritBoard} {showOrHideSection}></Growth>
			<PresenceTracks bind:spiritBoard={spiritBoard} {showOrHideSection}></PresenceTracks>
			<InnatePowers bind:spiritBoard={spiritBoard} {showOrHideSection}></InnatePowers>
		</div>
	</div>
	<button class="button is-primary is-light" on:click={readHTML}>Read Template File into Website Form</button>
	<button class="button is-primary is-light" on:click={setBoardValues(spiritBoard)}>Read Website Form into Template File</button>
	<button class="button is-primary is-light" on:click={copyHTML}>Copy Template File</button>
	<button class="button is-primary is-light" on:click={reloadPreview}>Load Preview</button>
	<div id="holder">
		<iframe bind:this={frame} src='/template/My Custom Content/My Spirit/OFFICIAL_Lure of Deep Wilderness.html' height=600 width=100% title='yay' style="display:none;" id="mod-frame"></iframe>
	</div>
