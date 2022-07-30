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
    const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
			if (spiritName) {
				spiritName.textContent = ''
			}
		}
		//for (var i = 0; i < 6; i++) {
		//	addEnergyTrackNode();
		//	addPlaysTrackNode();
		//}

  }

	function setBoardValues(spiritBoard) {
		if (frame) {
			//Load Spirit Name and Image
			const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
			if (spiritName) {
				spiritName.textContent = spiritBoard.nameAndArt.name
			}

			//Load Special Rules
			const specialRulesContainer = frame.contentDocument.querySelectorAll('special-rules-container')[0]
			const specialRulesNames = frame.contentDocument.querySelectorAll('special-rules-subtitle')
			const specialRulesEffects = frame.contentDocument.querySelectorAll('special-rule')
			for (let j = 0; j < spiritBoard.specialRules.rules.length; j++) {
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
		document.getElementById("scaled-frame").contentWindow.startMain();
	}
	
	// A script line that starts with $: is a "reactive declaration". It will run whenever a variable after the $: is modified. So in this case, we want setBoardValues to run whenever spiritBoard changes. See https://svelte.dev/tutorial/reactive-statements
	$: setBoardValues(spiritBoard)
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
		<iframe bind:this={frame} src='/template/My Custom Content/My Spirit/board_front.html' height=600 width=100% id="scaled-frame" title='yay'></iframe>
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
	<button class="button is-primary is-light" on:click={copyHTML}>Copy HTML</button>
	<button class="button is-primary is-light" on:click={reloadPreview}>Reload Preview</button>
	<div id="holder">
		<iframe src='/template/My Custom Content/My Spirit/board_front_website.html' height=600 width=100% title='yay' style="display:none;" id="mod-frame"></iframe>
	</div>
