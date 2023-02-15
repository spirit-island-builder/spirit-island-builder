<script>
  import { dev } from "$app/environment";

  import SpiritBoard from "./spirit-board/index.svelte";
  import SpiritBoardBack from "./spirit-board-back/index.svelte";
  import PowerCards from "./power-cards/index.svelte";
  import Aspect from "./aspect/index.svelte";
  import Adversary from "./adversary/index.svelte";
  import Instructions from "$lib/instructions/index.svelte";

  import { divertDownload, downloadData } from "$lib/download";

  let debugDownloads = false;
  $: divertDownload(debugDownloads);

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
              title: "",
              hasCost: false,
              hasTint: false,
              hasTitle: false,
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
      note: "",
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
      scale: "",
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
    profile: false,
    previewBoard: {
      isVisible: false,
    },
    nameReplacements: {
      isVisible: false,
      aspectName: "",
      aspectRelacement: "",
      rulesReplaced: "",
      complexity: "",
      spiritName: "",
      spiritImage: "",
      hasBack: true,
    },
    aspectEffects: {
      isVisible: false,
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

  let instructions;

  let pages = [
    ["spiritBoardFront", "Spirit Board Play Side"],
    ["spiritBoardBack", "Spirit Board Lore Side"],
    ["powerCards", "Power Cards"],
    ["aspect", "Aspect / Special Cards"],
    ["adversary", "Adversary"],
  ];
</script>

<header>
  <h1 class="title is-1 ml-5">The Spirit Island Builder</h1>
  <nav class="navbar ml-5 mr-5">
    <div class="navbar-brand">
      {#each pages as [page, title]}
        {@const isCurrent = currentPage === page}
        <button
          class={`button navbar-item ${isCurrent ? "is-primary" : "is-link is-light"}`}
          on:click={() => {
            setCurrentPage(page);
          }}>
          {title}
        </button>
      {/each}
    </div>
    {#if dev}
      <div class="navbar-menu">
        <div class="navbar-end">
          <button
            class={`button navbar-item ${debugDownloads ? "is-primary is-selected" : ""}`}
            on:click={() => {
              debugDownloads = !debugDownloads;
            }}>
            Debug Downloads
          </button>
        </div>
      </div>
    {/if}
  </nav>
</header>
<Instructions bind:this={instructions} />
<div class="container">
  {#if currentPage === "spiritBoardFront"}
    <SpiritBoard bind:spiritBoard bind:customIcons bind:instructions />
  {:else if currentPage === "spiritBoardBack"}
    <SpiritBoardBack bind:spiritBoardBack bind:customIcons bind:instructions />
  {:else if currentPage === "powerCards"}
    <PowerCards bind:powerCards bind:customIcons bind:instructions />
  {:else if currentPage === "aspect"}
    <Aspect bind:aspect bind:instructions />
  {:else if currentPage === "adversary"}
    <Adversary bind:adversary bind:instructions />
  {/if}
</div>

{#if dev}
  <!--
    We import the debug view dynamically here, so that we only pay the cost
    of loading the pretty-printing and code-highlighting code if we can actually
    enable debugging.
    -->
  {#await import("$lib/debug-file-view.svelte") then { default: DebugFileView }}
    {#if debugDownloads}
      <DebugFileView {...$downloadData} />
    {/if}
  {/await}
{/if}

<article class="message is-small mb-1">
  <div class="message-body p-1">
    See <a href="https://neubee.github.io/spirit-island-builder/instructions" target="_blank"
      >Instructions</a>
    for details on how to use the form. For custom art,
    <a href="https://www.wombo.art/" target="_blank">Wombo</a>
    (unaffiliated) is a popular art generator.
    <span class="is-pulled-right"
      >Code for this project is hosted <a
        href="https://github.com/neubee/spirit-island-builder"
        target="_blank">here</a
      >{#if import.meta.env.VITE_COMMIT_SHA !== undefined}
        &nbsp;(built from
        <a
          href="https://github.com/neubee/spirit-island-builder/commit/{import.meta.env
            .VITE_COMMIT_SHA}"
          target="_blank"
          rel="noreferrer">{import.meta.env.VITE_COMMIT_SHA.substring(0, 8)}</a
        >){/if}.</span>
    <br />This is an unofficial website. Interface created by Neubee & Resonant. The Spirit Island
    Builder is adapted from
    <a href="https://github.com/Gudradain/spirit-island-template" target="_blank">HTML template</a>
    developed by Spirit Island fanbase. All materials belong to Greater Than Games, LLC.
  </div>
</article>
