<script>
  import SpiritBoard from "./spirit-board/index.svelte";
  import SpiritBoardBack from "./spirit-board-back/index.svelte";
  import PowerCards from "./power-cards/index.svelte";
  import Aspect from "./aspect/index.svelte";
  import Adversary from "./adversary/index.svelte";
  import Instructions from "$lib/instructions/index.svelte";

  let currentPage = "spiritBoardFront";

  function setCurrentPage(page) {
    currentPage = page;
    console.log(">--|--< Switching to " + page + " >--|--<");
  }

  let spiritBoard = {
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    nameAndArt: {
      isVisible: false,
      name: "",
      artPath: "",
      artScale: "",
      bannerPath: "",
      energyBannerPath: "",
      energyBannerScale: "",
      playsBannerPath: "",
      playsBannerScale: "",
      artistCredit: "",
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
                },
              ],
            },
          ],
        },
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
        },
      ],
      playsNodes: [
        {
          id: 0,
          effect: "",
        },
      ],
    },
    innatePowers: {
      isVisible: false,
      powers: [
        {
          id: 0,
          name: "",
          speed: "",
          range: "",
          target: "",
          targetTitle: "",
          effect: "",
          note: "",
          noteShow: true,
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
    customIcons: {
      isVisible: false,
      icons: [
        {
          id: 0,
          name: "",
        },
      ],
    },
  };

  let customIcons = {
    prop: "value",
    isVisible: false,
    icons: [
      {
        id: 0,
        name: "",
      },
    ],
  };

  let spiritBoardBack = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    nameArtLore: {
      isVisible: false,
    },
    setupPlaystyleComplexityPowers: {
      isVisible: false,
    },
    nameImage: {
      name: "",
      img: "",
    },
    lore: {
      loreText: "",
    },
    setup: {
      setupText: "",
    },
    playStyle: {
      playStyleText: "",
    },
    complexity: {
      complexityValue: "",
      complexityDescriptor: "",
    },
    summary: {
      offenseValue: "",
      controlValue: "",
      fearValue: "",
      defenseValue: "",
      utilityValue: "",
      usesTokens: "",
    },
  };

  let powerCards = {
    prop: "value",
    demoBoardWasLoaded: false,
    spiritName: "",
    previewBoard: {
      isVisible: false,
    },
    form: {
      isVisible: false,
    },
    cards: [
      {
        id: 0,
        isVisible: false,
        name: "",
        speed: "",
        cost: "",
        cardImage: "",
        cardArtist: "",
        powerElements: {
          air: false,
          sun: false,
          moon: false,
          water: false,
          fire: false,
          earth: false,
          plant: false,
          animal: false,
        },
        range: "",
        target: "",
        targetTitle: "",
        rules: "",
        hasThreshold: "",
        threshold: "",
        thresholdCondition: "",
        thresholdText: "",
      },
    ],
  };

  let aspect = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
  };

  let adversary = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    nameLossEscalation: {
      isVisible: false,
      name: "",
      baseDif: "",
      flagImg: "",
      lossCondition: {
        name: "",
        effect: "",
      },
      escalation: {
        name: "",
        effect: "",
      },
    },
    levelSummary: {
      isVisible: false,
      levels: [
        {
          id: 1,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
        },
        {
          id: 2,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
        },
        {
          id: 3,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
        },
        {
          id: 4,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
        },
        {
          id: 5,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
        },
        {
          id: 6,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
        },
      ],
    },
  };

  let isShowingInstructions = false;
  let instructionsSource = "https://neubee.github.io/spirit-island-builder/instructions";
</script>

<h1 class="title is-1 ml-5">The Spirit Island Builder</h1>
<nav class="navbar ml-5">
  <div class="navbar-brand">
    <button
      class={`button navbar-item ${
        currentPage === "spiritBoardFront" ? "is-primary" : "is-link is-dark"
      }`}
      on:click={() => {
        setCurrentPage("spiritBoardFront");
      }}>
      Spirit Board Play Side
    </button>
    <button
      style=""
      class={`button navbar-item ${
        currentPage === "spiritBoardBack" ? "is-primary" : "is-link is-dark"
      }`}
      on:click={() => {
        setCurrentPage("spiritBoardBack");
      }}>
      Spirit Board Lore Side
    </button>
    <button
      style=""
      class={`button navbar-item ${
        currentPage === "powerCards" ? "is-primary" : "is-link is-dark"
      }`}
      on:click={() => {
        setCurrentPage("powerCards");
      }}>
      Power Cards
    </button>
    <button
      style="display:none"
      class={`button navbar-item ${currentPage === "aspect" ? "is-primary" : "is-link is-dark"}`}
      on:click={() => {
        setCurrentPage("aspect");
      }}>
      Aspect
    </button>
    <button
      class={`button navbar-item ${currentPage === "adversary" ? "is-primary" : "is-link is-dark"}`}
      on:click={() => {
        setCurrentPage("adversary");
      }}>
      Adversary
    </button>
  </div>
</nav>
{#if isShowingInstructions === true}
  <Instructions bind:isShowingInstructions bind:instructionsSource />
{/if}
<div class="container">
  {#if currentPage === "spiritBoardFront"}
    <SpiritBoard
      bind:spiritBoard
      bind:isShowingInstructions
      bind:instructionsSource
      bind:customIcons />
  {:else if currentPage === "spiritBoardBack"}
    <SpiritBoardBack
      bind:spiritBoardBack
      bind:isShowingInstructions
      bind:instructionsSource
      bind:customIcons />
  {:else if currentPage === "powerCards"}
    <PowerCards
      bind:powerCards
      bind:isShowingInstructions
      bind:instructionsSource
      bind:customIcons />
  {:else if currentPage === "aspect"}
    <Aspect bind:aspect bind:isShowingInstructions bind:instructionsSource />
  {:else if currentPage === "adversary"}
    <Adversary bind:adversary bind:isShowingInstructions bind:instructionsSource />
  {/if}
</div>
