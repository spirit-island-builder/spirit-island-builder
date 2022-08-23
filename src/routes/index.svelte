<script>
  import SpiritBoard from "./spirit-board/index.svelte";
  import SpiritBoardBack from "./spirit-board-back/index.svelte";

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
  };
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
      Spirit Board Front
    </button>
    <button
      class={`button navbar-item ${
        currentPage === "spiritBoardBack" ? "is-primary" : "is-link is-light"
      }`}
      on:click={() => {
        setCurrentPage("spiritBoardBack");
      }}>
      Spirit Board Back
    </button>
  </div>
</nav>
<div class="container">
  {#if currentPage === "spiritBoardFront"}
    <SpiritBoard bind:spiritBoard />
  {:else if currentPage === "spiritBoardBack"}
    <SpiritBoardBack bind:spiritBoardBack />
  {/if}
</div>
