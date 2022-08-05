<script>
	import { onMount } from 'svelte';
  import NameAndArt from './name-and-art.svelte'
  import SpecialRules from './special-rules.svelte'
  import Growth from './growth.svelte'
  import PresenceTracks from './presence-tracks.svelte'
  import InnatePowers from './innate-powers.svelte'
  import * as Lib from './lib'
  // import addGrowthAction from './growth.svelte'
  // import { addGrowthSet, addGrowthGroup, addGrowthAction, removeGrowthAction, removeGrowthGroup, removeGrowthSet } from './growth.svelte'

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
					choiceText: "",
					growthGroups: [
						{
							id: 0,
							cost: "",
							tint: "",
							hasCost: false,
							hasTint: false,
							growthActions: [
								{
									id: 0,
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
		},
		innatePowers: {
			isVisible: false,
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
			// readHTML();
			// setBoardValues(spiritBoard);
			// reloadPreview();
		}
	}

	function setBoardValues(spiritBoard) {
		console.log('calling setBoardValues')
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
			if(specialRulesContainer){
				specialRulesContainer.textContent=""; // (easiest to start fresh each time)
			}
			spiritBoard.specialRules.rules.forEach(rule => {
				var newRuleName = frame.contentDocument.createElement('special-rules-subtitle');
				newRuleName.textContent = rule.name;
				var newRuleEffect = frame.contentDocument.createElement('special-rule');
				newRuleEffect.textContent = rule.effect;
				specialRulesContainer.appendChild(newRuleName)
				specialRulesContainer.appendChild(newRuleEffect)
			});
			
			//Set Growth
			const growthContainer = frame.contentDocument.querySelectorAll('growth')[0]
			if(growthContainer){
				growthContainer.textContent=""; //(easiest to start fresh each time)
			}
			if(!spiritBoard.growth.useGrowthSets){
				growthContainer.setAttribute("title",`Growth (${spiritBoard.growth.directions})`);
			}else{
				growthContainer.setAttribute("title",`Growth`)
			}
			
			spiritBoard.growth.growthSets.forEach((growthSet, i) => {
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
				growthSet.growthGroups.forEach((growthGroup, j) => {
					var growthGroupOutput = frame.contentDocument.createElement('growth-group');
					
					//Cost
					if(growthGroup.hasCost){growthGroupOutput.setAttribute("cost",growthGroup.cost)}
					//Tint
					if(growthGroup.hasTint){growthGroupOutput.setAttribute("tint",growthGroup.tint)}
					//Values
					var values = ""
					growthGroup.growthActions.forEach(growthAction => {
						values += growthAction.effect + ";"
					});
					growthGroupOutput.setAttribute("values",values.slice(0,-1)) //slice removes last semicolon
					
					containerLayer.appendChild(growthGroupOutput)
				});
				
				if (spiritBoard.growth.growthSets.length>1) {
					//Add growth set to the growth if using sets
					growthContainer.appendChild(newSubgroup)
				}
			});


			//Set Presence Tracks
			const presenceTrackContainer = frame.contentDocument.querySelectorAll('presence-tracks')[0]
			if(presenceTrackContainer){
				//(easiest to start fresh each time)
				presenceTrackContainer.textContent="";
			}
			
			var energyTrack = frame.contentDocument.createElement('energy-track');
			var energyValues = ""
			spiritBoard.presenceTrack.energyNodes.forEach(energyNode => {
				energyValues += energyNode.effect + ","
			});
			energyTrack.setAttribute("values",energyValues.slice(0,-1))
			presenceTrackContainer.appendChild(energyTrack);
			
			var playsTrack = frame.contentDocument.createElement('card-play-track');
			var playsValues = ""
			spiritBoard.presenceTrack.playsNodes.forEach(playsNode => {
				playsValues += playsNode.effect + ","
			});
			playsTrack.setAttribute("values",playsValues.slice(0,-1))
			presenceTrackContainer.appendChild(playsTrack);
			
			
			//Load Innate Powers
			const innatePowerContainer = frame.contentDocument.querySelectorAll('innate-powers')[0]
			if(innatePowerContainer){
				//(easiest to start fresh each time)
				innatePowerContainer.textContent="";
			}
			
			spiritBoard.innatePowers.powers.forEach(power => {
					var newInnatePower = frame.contentDocument.createElement('quick-innate-power');
					newInnatePower.setAttribute("name",power.name);
					newInnatePower.setAttribute("speed",power.speed.toLowerCase());
					newInnatePower.setAttribute("range",power.range);
					newInnatePower.setAttribute("target",power.target);
					newInnatePower.setAttribute("target-title",power.targetTitle);
					if(power.note){newInnatePower.setAttribute("note",power.note);} // may need to clear it?
					power.levels.forEach(level => {
						var newLevel = frame.contentDocument.createElement('level');
						newLevel.setAttribute("threshold",level.threshold)
						newLevel.textContent = level.effect;
						if(level.isLong){newLevel.setAttribute("long","")}
						newInnatePower.appendChild(newLevel)
					});
					innatePowerContainer.appendChild(newInnatePower)
			});
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
		console.log('calling readHTML')
		//Reads the Template HTML file into the Form
		if (frame) {
			//Set Spirit Name and Image
			const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
			if (spiritName) {
				spiritBoard.nameAndArt.name = spiritName.textContent.trim();
			}

			//Set Special Rules
			const specialRulesNames = frame.contentDocument.querySelectorAll('special-rules-subtitle')
			const specialRulesEffects = frame.contentDocument.querySelectorAll('special-rule')
			spiritBoard.specialRules.rules.splice(0, spiritBoard.specialRules.rules.length) //Clear the Form first
			specialRulesNames.forEach((specialRulesName, j)  => {
				spiritBoard = Lib.addSpecialRule(spiritBoard,specialRulesName.textContent,specialRulesEffects[j].textContent.trim());
			});

			//Set Growth
			const growthContainer = frame.contentDocument.querySelectorAll('growth')
			var htmlGrowthSets = growthContainer[0].querySelectorAll('sub-growth')
			var containerLayer
			var numSets = 1;
			if(htmlGrowthSets[0]){
				// if the HTML file isn't using subgroups (Growth Sets), then there's a whole layer that's missing... this gynamstics accounts for it.
				spiritBoard.growth.useGrowthSets=true;
				numSets = htmlGrowthSets.length;
				containerLayer = htmlGrowthSets
			}else{
				containerLayer = growthContainer
			}
			
			// Identify text inside the parathesis of the growth option (if any) ie. for Growth (Pick Two), this code will find Pick Two
			var regExpOuterParentheses = /\(\s*(.+)\s*\)/;
			let innerDirections = regExpOuterParentheses.exec(growthContainer[0].title)
			spiritBoard.growth.directions = innerDirections!==null ? innerDirections[1] : "";
			
			spiritBoard.growth.growthSets.splice(0, spiritBoard.growth.growthSets.length) //Clear the Form first
			containerLayer.forEach((topGrowthLayer, i)=> {
				let groups = topGrowthLayer.querySelectorAll('growth-group')
				spiritBoard = Lib.addGrowthSet(spiritBoard, containerLayer[i].getAttribute("title"));
				groups.forEach((group, j) => {
					spiritBoard = Lib.addGrowthGroup(spiritBoard, i,group.getAttribute("cost"),group.getAttribute("tint"));
					let values = group.getAttribute("values").split(";");
					values.forEach(growthValue => {
						spiritBoard = Lib.addGrowthAction(spiritBoard, i, j, growthValue);
					});
				});
			});

			//Set Presence Tracks
			var energyTrack = frame.contentDocument.querySelectorAll('energy-track')[0]
			var energyValues = energyTrack.getAttribute("values").split(",");
			spiritBoard.presenceTrack.energyNodes.splice(0, spiritBoard.presenceTrack.energyNodes.length) //Clear the Form first
			energyValues.forEach(value => {
				spiritBoard = Lib.addEnergyTrackNode(spiritBoard,value);
			});
			var playsTrack = frame.contentDocument.querySelectorAll('card-play-track')[0]
			var playsValues = playsTrack.getAttribute("values").split(",");
			spiritBoard.presenceTrack.playsNodes.splice(0, spiritBoard.presenceTrack.playsNodes.length) //Clear the Form first
			playsValues.forEach(value => {
				spiritBoard = Lib.addPlaysTrackNode(spiritBoard,value);
			});

			//Load Innate Powers
			var innatePowers = frame.contentDocument.querySelectorAll('quick-innate-power')
			spiritBoard.innatePowers.powers.splice(0, spiritBoard.innatePowers.powers.length) //Clear the Form first
			innatePowers.forEach((innatePower, k) => {
				spiritBoard = Lib.addInnatePower(spiritBoard,innatePower.getAttribute("name"),innatePower.getAttribute("speed"),innatePower.getAttribute("range"),innatePower.getAttribute("target"),innatePower.getAttribute("target-title"),innatePower.getAttribute("note"));
				var htmlLevels = innatePower.querySelectorAll('level')
				htmlLevels.forEach(htmlLevel => {
					spiritBoard = Lib.addLevel(spiritBoard,k,htmlLevel.getAttribute("threshold"),htmlLevel.textContent.trim(),htmlLevel.hasAttribute("long"));
				});
			});
		}
	}

	function copyHTML() {
		console.log("calling copyHTML");
		console.log(document.getElementById("scaled-frame").contentWindow.document.body);
		console.log(document.getElementById("mod-frame").contentWindow.document.body);
		let bodyClone
		bodyClone = document.getElementById("mod-frame").contentWindow.document.body.cloneNode(true);
		document.getElementById("scaled-frame").contentWindow.document.body = bodyClone;
	}

	function reloadPreview() {
		console.log("calling reloadPreview");
		copyHTML();
		document.getElementById("scaled-frame").contentWindow.startMain();
	}

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
		<iframe src='/template/MyCustomContent/MySpirit/board_front.html' height=600 width=100% id="scaled-frame" title='yay'></iframe>
	</div>
	<div class="field mb-1">
		<button class="button is-primary is-light" on:click={readHTML}>Load Template File</button>
		<button class="button is-primary is-light" on:click={setBoardValues(spiritBoard)}>Save Template File</button>
		<button class="button is-primary is-light" on:click={reloadPreview}>Generate Spirit Board</button>
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
	<div id="holder">
		<iframe bind:this={frame} src='/template/MyCustomContent/MySpirit/OFFICIAL_Volcano Looming High.html' height=600 width=100% title='yay' style="display:none;" id="mod-frame"></iframe>
	</div>
