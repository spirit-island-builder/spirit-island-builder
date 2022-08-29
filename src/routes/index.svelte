<script>
  import SpiritBoard from "./spirit-board/index.svelte";
  import SpiritBoardBack from "./spirit-board-back/index.svelte";
  import PowerCards from "./power-cards/index.svelte";
  import Aspect from "./aspect/index.svelte";
  import Adversary from "./adversary/index.svelte";

  let currentPage = "spiritBoardFront";

  function setCurrentPage(page) {
    currentPage = page;
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

  let spiritBoardBack = {
    prop: "value",
    previewBoard: {
      isVisible: false,
    },
    lore: {
      isVisible: false,
      loreText: "",
    },
    setup: {
      isVisible: false,
      setupText: "",
    },
    playStyle: {
      isVisible: false,
      playStyleText: "",
    },
    complexity: {
      isVisible: false,
      complexityValue: "",
      complexityDescriptor: "",
    },
    summary: {
      isVisible: false,
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
    previewBoard: {
      isVisible: false,
    },
    cards: [
      {
        id: 0,
        speed: "",
        cost: "",
        cardImage:"",
        powerElements:"",
        range:"",
        target:"",
        targetTitle:"",
        rules:"",
        threshold:"",
        thresholdCondition:"",
        thresholdText:"",
      },
     ],

  }

  let aspect = {
    prop: "value",
    previewBoard: {
      isVisible: false,
    },
  }
  
  let adversary = {
    prop: "value",
    previewBoard: {
      isVisible: false,
    },
    name:"",
    baseDif:"",
    flagImg:"",
    lossCondition: {
      name: "",
      effect:"",
    },
    escalation:{
      name:"",
      effect:"",
    },
    level: [
      {
        id:0,
        name:"",
        difficulty:"",
        fearCards:"",
        effect:"",
      },
    ],
  }
</script>

<h1 class="title is-1">Build Custom Spirit Island Components!</h1>
<nav class="navbar">
  <div class="navbar-brand">
    <button
      class={`button navbar-item ${
        currentPage === "spiritBoardFront" ? "is-primary" : "is-link is-light"
      }`}
      on:click={() => {
        setCurrentPage("spiritBoardFront");
      }}>
      Spirit Board Play Side
    </button>
    <button
      class={`button navbar-item ${
        currentPage === "spiritBoardBack" ? "is-primary" : "is-link is-light"
      }`}
      on:click={() => {
        setCurrentPage("spiritBoardBack");
      }}>
      Spirit Board Lore Side
    </button>
    <button
      class={`button navbar-item ${
        currentPage === "powerCards" ? "is-primary" : "is-link is-light"
      }`}
      on:click={() => {
        setCurrentPage("powerCards");
      }}>
      Power Cards
    </button>
    <button
      class={`button navbar-item ${
        currentPage === "aspect" ? "is-primary" : "is-link is-light"
      }`}
      on:click={() => {
        setCurrentPage("aspect");
      }}>
      Aspect
    </button>
    <button
      class={`button navbar-item ${
        currentPage === "adversary" ? "is-primary" : "is-link is-light"
      }`}
      on:click={() => {
        setCurrentPage("adversary");
      }}>
      Adversary
    </button>
  </div>
</nav>
<div class="container">
  {#if currentPage === "spiritBoardFront"}
    <SpiritBoard bind:spiritBoard />
  {:else if currentPage === "spiritBoardBack"}
    <SpiritBoardBack bind:spiritBoardBack />
  {:else if currentPage === "powerCards"}
    <PowerCards bind:powerCards />
  {:else if currentPage === "aspect"}
    <Aspect bind:aspect />
  {:else if currentPage === "adversary"}
    <Adversary bind:adversary />
  {/if}
</div>
