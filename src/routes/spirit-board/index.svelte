<script>
	import { onMount } from 'svelte';
  import NameAndArt from './name-and-art.svelte'
  import SpecialRules from './special-rules.svelte'
  import Growth from './growth.svelte'
  import PresenceTracks from './presence-tracks.svelte'
  import InnatePowers from './innate-powers.svelte'

  let spiritBoard = {
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
			name: "",
		},
		innatePowers: {
			isVisible: false,
			name: "",
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
  }

	function setBoardValues(spiritBoard) {
		if (frame) {
			const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
			spiritName.textContent = spiritBoard.nameAndArt.name
		}
	}

	$: setBoardValues(spiritBoard)
</script>

<section class="section">
		<h3 class="title is-3">Spirit Card</h3>
	</section>
	<div class="columns">
		<div class="column">
			<h5 class="title is-5">Spirit Card</h5>
      <NameAndArt bind:spiritBoard={spiritBoard} {showOrHideSection}></NameAndArt>
      <SpecialRules bind:spiritBoard={spiritBoard} {showOrHideSection}></SpecialRules>
      <Growth bind:spiritBoard={spiritBoard} {showOrHideSection}></Growth>
      <PresenceTracks bind:spiritBoard={spiritBoard} {showOrHideSection}></PresenceTracks>
      <InnatePowers bind:spiritBoard={spiritBoard} {showOrHideSection}></InnatePowers>
      </div>
		<div class="column">
      <iframe bind:this={frame} src='/template/My Custom Content/My Spirit/board_front.html' height=400 width=600 title='yay'></iframe>
		</div> 

	</div>