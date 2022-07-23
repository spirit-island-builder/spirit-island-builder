<script>
	import { onMount } from 'svelte';
  import NameAndArt from './name-and-art.svelte'
  import SpecialRules from './special-rules.svelte'
  import Growth from './growth.svelte'
  import PresenceTracks from './presence-tracks.svelte'
  import InnatePowers from './innate-powers.svelte'

  let spiritBoard = {
		nameAndArt: {
			isVisible: true,
			name: "",
		},
		specialRules: {
			isVisible: true,
			rules: [
				{
          id: 0,
					name: "",
					effect: "",
				},
			],
		},
		growth: {
			isVisible: true,
			growthSets: [
				{
					id: 0,
					name: "",
					effect: "",
				}
			],
		},
		presenceTrack: {
			isVisible: true,
			name: "",
		},
		innatePowers: {
			isVisible: true,
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
    const spiritName = frame.contentDocument.querySelectorAll('spirit-name')[0]
				console.log('spiritName: ', spiritName);
				spiritName.textContent = ''
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
			<h5 class="subtitle is-5">Spirit Card Values</h5>
			<p>Name: {spiritBoard.nameAndArt.name}</p>
			{#each spiritBoard.specialRules.rules as rule, i}
				<p>Special Rule {i + 1} Name: {rule.name}</p>
				<p>Special Rule {i + 1} Effect: {rule.effect}</p>
			{/each}
      <iframe bind:this={frame} src='/template/My Custom Content/My Spirit/board_front.html' height=1177 width=1766 title='yay'></iframe>
		</div>
	</div>