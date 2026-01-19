<script>
  import { onMount } from "svelte";
  import "bulma/css/bulma.css";
  import "../bulmaOverride.css";
  import "../growth.css";
  import "../presenceTracks.css";
  import "../previewBoard.css";
  import "../innatePowers.css";

  import { browser, dev } from "$app/environment";
  import { page } from "$app/stores";
  import { defineCustomElement } from "ionicons/components/ion-icon.js";
  if (browser) {
    defineCustomElement(window);
  }

  //$page.url.pathname
  console.log($page.url.hash);

  import SpiritBoard from "./spirit-board/index.svelte";
  import SpiritBoardBack from "./spirit-board-back/index.svelte";
  import PowerCards from "./power-cards/index.svelte";
  import Aspect from "./aspect/index.svelte";
  import Adversary from "./adversary/index.svelte";
  import Scenario from "./scenario/index.svelte";
  import BlightCard from "./blight-card/index.svelte";
  import FearCard from "./fear-card/index.svelte";
  import IncarnaToken from "./incarna-token/index.svelte";
  import EventCard from "./event-card/index.svelte";
  import InvaderCard from "./invader-card/index.svelte";
  import About from "./about/index.svelte";
  import Instructions from "$lib/instructions/index.svelte";
  import Footer from "./footer.svelte";
  import { divertDownload, downloadData } from "$lib/download";

  let debugDownloads = false;
  $: divertDownload(debugDownloads);

  let currentPage = $page.url.hash ? $page.url.hash.substring(1) : "spiritBoardFront";
  switch (currentPage.toLowerCase().replace(/\W/g, "")) {
    case "spiritboardfront":
    case "front":
    case "play":
      currentPage = "spiritBoardFront";
      break;
    case "spiritboardback":
    case "back":
    case "lore":
      currentPage = "spiritBoardBack";
      break;
    case "powercards":
    case "power":
    case "powers":
    case "cards":
    case "card":
      currentPage = "powerCards";
      break;
    case "incarnatoken":
    case "incarna":
    case "token":
      currentPage = "incarnaToken";
      break;
    case "adversary":
    case "advarsary":
      currentPage = "adversary";
      break;

    case "scenario":
      currentPage = "scenario";
      break;

    case "aspect":
    case "aspectt":
      currentPage = "aspect";
      break;

    case "blightcard":
    case "blight":
      currentPage = "blightCard";
      break;

    case "fearcard":
    case "fear":
      currentPage = "fearCard";
      break;

    case "eventcard":
    case "event":
      currentPage = "eventCard";
      break;
    case "invader":
      currentPage = "invaderCard";
      break;
    default:
      currentPage = "spiritBoardFront";
  }

  function onLoad() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkScheme) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }

    //identify the toggle switch HTML element
    const toggleSwitch = document.querySelector("#checkbox_theme");

    //listener for changing themes
    toggleSwitch.addEventListener("change", switchTheme, false);

    //pre-check the dark-theme checkbox if dark-theme is set
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      toggleSwitch.checked = true;
    }
  }
  onMount(onLoad);

  //function that changes the theme, and sets a localStorage variable to track the theme between page loads
  function switchTheme(e) {
    const toggleSwitch = document.querySelector("#checkbox_theme");
    if (toggleSwitch) {
      if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        toggleSwitch.checked = true;
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        toggleSwitch.checked = false;
      }
    }
  }

  function setCurrentPage(page) {
    currentPage = page;
    console.log(">--|--< Switching to " + page + " >--|--<");
  }

  let emptySpiritBoard = {
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    languageOptions: {
      isVisible: false,
    },
    isClickable: true,
    nameAndArt: {
      isVisible: false,
      isOneBanner: false,
      name: "",
      starlight: "",
      artPath: "",
      artScale: "",
      bannerPath: "",
      combinedBannerPath: "",
      combinedBannerScaleH: "",
      combinedBannerScaleV: "",
      energyBannerPath: "",
      energyBannerScale: "",
      playsBannerPath: "",
      playsBannerScale: "",
      unifiedBannerScale: "100%",
      artistCredit: "",
      language: "en",
      overlayImages: [],
    },
    specialRules: {
      isVisible: false,
      customHeading: "",
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
      customHeading: "",
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
              hasTitleLeft: false,
              newRow: false,
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
      customHeading: "",
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
      // additionalTracks: [
      //   {
      //     // id: 0,
      //     // additionalNodes: [
      //     //   {
      //     //     id: 0,
      //     //     effect: "",
      //     //   },
      //     // ],
      //   },
      // ],
    },
    innatePowers: {
      isVisible: false,
      customHeading: "",
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
      icons: [],
    },
  };
  let spiritBoard = JSON.parse(JSON.stringify(emptySpiritBoard));

  let emptyCombinedTTS = {
    prop: "value",
    isVisible: false,
    spiritBoardFront: {
      image: {
        content: "",
        saved: false,
      },
      tts: {
        content: "",
        saved: false,
      },
    },
    spiritBoardBack: {
      image: {
        content: "",
        saved: false,
      },
      tts: {
        difficulty: "",
        usesTokens: "",
        tokenList: "",
        saved: false,
      },
    },
    powers: {
      image: {
        content: [],
        saved: false,
        back: "",
      },
      tts: {
        content: "",
        saved: false,
      },
    },
    incarna: {
      image: {
        content: "",
        saved: false,
      },
      tts: {
        content: "",
        saved: false,
      },
    },
  };
  let combinedTTS = JSON.parse(JSON.stringify(emptyCombinedTTS));

  let emptySpiritBoardBack = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    nameArtLore: {
      isVisible: false,
      finder: "",
    },
    setupPlaystyleComplexityPowers: {
      isVisible: false,
    },
    language: "en",
    languageOptions: {
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
    note: {
      noteText: "",
    },
    playStyle: {
      playStyleText: "",
    },
    complexity: {
      complexityValue: 0,
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
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let spiritBoardBack = JSON.parse(JSON.stringify(emptySpiritBoardBack));

  let emptyPowerCards = {
    prop: "value",
    demoBoardWasLoaded: false,
    spiritName: "",
    stackView: false,
    language: "en",
    languageOptions: {
      isVisible: false,
    },
    reorderCards: {
      isVisible: false,
    },
    previewBoard: {
      isVisible: false,
    },
    // form: {
    //   isVisible: false,
    // },
    cards: [
      {
        id: 0,
        isVisible: false,
        name: "",
        speed: "",
        cost: "",
        type: "",
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
        hasSecondThreshold: false,
        secondThreshold: "",
        secondThresholdCondition: "",
        aspectSubtitle: "",
      },
    ],
    cardBackImage: "",
    cardBackImageIsVisible: false,
    defaultCardBack: false,
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let powerCards = JSON.parse(JSON.stringify(emptyPowerCards));

  let emptyAspect = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    reorderParts: {
      isVisible: false,
    },
    languageOptions: {
      isVisible: false,
      language: "en",
    },
    info: {
      isVisible: false,
      aspectName: "",
      complexity: "",
      spiritName: "",
      spiritImage: "",
      showparts: false,
      hasBack: true,
    },
    aspectEffects: [
      {
        id: 0,
        isVisible: false,
        profile: false,
        nameOverride: "",
        replacements: [
          {
            id: 0,
            aspectRelacement: "",
            rulesReplaced: "",
          },
        ],
        specialRules: {
          rules: [
            {
              id: 0,
              name: "",
              effect: "",
              hasGrowth: false,
              growthActions: [
                {
                  id: 0,
                  effect: "",
                },
              ],
            },
          ],
        },
        innatePowers: {
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
        bonusNode: {
          has: false,
          effect: "",
        },
      },
    ],
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let aspect = JSON.parse(JSON.stringify(emptyAspect));

  let emptyAdversary = {
    prop: "value",
    demoBoardWasLoaded: false,
    language: "en",
    languageOptions: {
      isVisible: false,
    },
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
        alternate: false,
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
          name2: "",
          effect2: "",
          hasRule2: false,
        },
        {
          id: 2,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
          name2: "",
          effect2: "",
          hasRule2: false,
        },
        {
          id: 3,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
          name2: "",
          effect2: "",
          hasRule2: false,
        },
        {
          id: 4,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
          name2: "",
          effect2: "",
          hasRule2: false,
        },
        {
          id: 5,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
          name2: "",
          effect2: "",
          hasRule2: false,
        },
        {
          id: 6,
          name: "",
          difficulty: "",
          fearCards: "",
          effect: "",
          name2: "",
          effect2: "",
          hasRule2: false,
        },
      ],
    },
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let adversary = JSON.parse(JSON.stringify(emptyAdversary));

  let emptyScenario = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    info: {
      isVisible: false,
      name: "",
      difficulty: "",
      image: "",
    },
    scenarioFront: {
      isVisible: false,
      lore: "",
      panels: [
        {
          id: 0,
          comments: [
            {
              id: 0,
              type: "",
              text: "",
              imgsrc: "",
            },
          ],
        },
      ],
    },
    scenarioBack: {
      isVisible: false,
      left: {
        comments: [
          {
            id: 0,
            type: "",
            text: "",
          },
        ],
      },
      right: {
        comments: [
          {
            id: 0,
            name: "",
            type: "",
            text: "",
          },
        ],
      },
    },
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let scenario = JSON.parse(JSON.stringify(emptyScenario));

  let emptyBlightCard = {
    prop: "value",
    demoBoardWasLoaded: false,
    showBack: false,
    previewBoard: {
      isVisible: false,
    },
    card: {
      isVisible: false,
      cardName: "",
      cardEffect: "",
      blightPerPlayer: "",
      isStillHealthy: false,
    },
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let blightCard = JSON.parse(JSON.stringify(emptyBlightCard));

  let emptyFearCard = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    card: {
      isVisible: false,
      cardName: "",
      level1: "",
      level2: "",
      level3: "",
    },
    showBack: false,
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let fearCard = JSON.parse(JSON.stringify(emptyFearCard));

  let emptyInvaderCard = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    card: {
      isVisible: false,
      name: "",
      type: "single",
      top: "",
      bottom: "",
      fields: [
        {
          id: 0,
          type: "",
          text: "",
          imgsrc: "",
          color: "#3f1d1c",
        },
      ],
    },
    showBackOld: false,
    showBackNew: false,
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let invaderCard = JSON.parse(JSON.stringify(emptyInvaderCard));

  let emptyIncarnaToken = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    incarna: {
      isVisible: false,
      name: "",
      icon: "",
      token: "",
      empowered: false,
      empoweredOnlyToken: false,
      empoweredToken: "",
      color: "",
    },
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let incarnaToken = JSON.parse(JSON.stringify(emptyIncarnaToken));

  let emptyEventCard = {
    prop: "value",
    demoBoardWasLoaded: false,
    previewBoard: {
      isVisible: false,
    },
    card: {
      isVisible: false,
      name: "",
      type: "blight",
      subtype: "",
      lore: "",
      hasHeader: false,
      headerColor: "",
      effect: "",
    },
    subevents: {
      isVisible: false,
      event: [
        {
          id: 0,
          name: "",
          type: "",
          effect: "",
          customBanner: "",
        },
        {
          id: 1,
          name: "",
          type: "",
          effect: "",
          customBanner: "",
        },
      ],
    },
    tokenevents: {
      isVisible: false,
      event: [
        {
          id: 0,
          name: "",
          tokens: "",
          effect: "",
        },
        {
          id: 1,
          name: "",
          tokens: "",
          effect: "",
        },
      ],
    },
    showBack: false,
    customIcons: {
      isVisible: false,
      icons: [],
    },
  };
  let eventCard = JSON.parse(JSON.stringify(emptyEventCard));

  let pages = [
    ["spiritBoardFront", "Spirit - Play Side"],
    ["spiritBoardBack", "Spirit - Lore Side"],
    ["powerCards", "Power Cards"],
    ["aspect", "Aspect"],
    ["incarnaToken", "Incarna Token"],
    ["adversary", "Adversary"],
    ["scenario", "Scenario"],
    ["blightCard", "Blight Card"],
    ["fearCard", "Fear Card"],
    ["eventCard", "Event Card"],
    ["invaderCard", "Invader Card"],
    ["about", "About"],
  ];
</script>

<div class="body">
  <header>
    <div style="display:flex;align-items: baseline;flex-wrap: wrap;width:100%;">
      <h1 class="title is-1 ml-5 mb-4">
        <span
          style="
    font-size: 26px;
">The</span> Spirit Island Builder
      </h1>
      <h2 class="subtitle is-6 ml-5">
        An unofficial tool for creating custom content for Spirit Island by Greater Than Games.
      </h2>
      <div style="margin-left: auto;margin-right: 25px;">
        <input type="checkbox" id="checkbox_theme" class="custom-checkbox" />
        <label id="theme-switch" class="theme-switch custom-switch" for="checkbox_theme" />
      </div>
    </div>
    <nav class="navbar ml-5 mr-5">
      <div class="navbar-brand is-flex-wrap-wrap">
        {#each pages as [page, title]}
          {@const isCurrent = currentPage === page}
          <button
            class={`button mb-1 navbar-item ${isCurrent ? "is-primary" : "is-link is-light"}`}
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
  <Instructions />
  <div
    id="body-container"
    class="container"
    class:is-sideMenu={currentPage === "spiritBoardFront" ||
      currentPage === "spiritBoardBack" ||
      currentPage === "powerCards" ||
      currentPage === "adversary" ||
      currentPage === "scenario" ||
      currentPage === "incarnaToken" ||
      currentPage === "aspect" ||
      currentPage === "blightCard" ||
      currentPage === "eventCard" ||
      currentPage === "invaderCard" ||
      currentPage === "fearCard"}>
    {#if currentPage === "spiritBoardFront"}
      <SpiritBoard
        bind:spiritBoard
        bind:emptySpiritBoard
        bind:combinedTTS
        bind:emptyCombinedTTS
        bind:currentPage />
    {:else if currentPage === "spiritBoardBack"}
      <SpiritBoardBack
        bind:spiritBoardBack
        bind:emptySpiritBoardBack
        bind:combinedTTS
        bind:emptyCombinedTTS
        bind:currentPage />
    {:else if currentPage === "powerCards"}
      <PowerCards
        bind:powerCards
        bind:emptyPowerCards
        bind:combinedTTS
        bind:emptyCombinedTTS
        bind:currentPage />
    {:else if currentPage === "aspect"}
      <Aspect bind:aspect bind:emptyAspect />
    {:else if currentPage === "adversary"}
      <Adversary bind:adversary bind:emptyAdversary />
    {:else if currentPage === "scenario"}
      <Scenario bind:scenario bind:emptyScenario />
    {:else if currentPage === "incarnaToken"}
      <IncarnaToken
        bind:incarnaToken
        bind:emptyIncarnaToken
        bind:combinedTTS
        bind:emptyCombinedTTS
        bind:currentPage />
    {:else if currentPage === "blightCard"}
      <BlightCard bind:blightCard bind:emptyBlightCard />
    {:else if currentPage === "fearCard"}
      <FearCard bind:fearCard bind:emptyFearCard />
    {:else if currentPage === "eventCard"}
      <EventCard bind:eventCard bind:emptyEventCard />
    {:else if currentPage === "invaderCard"}
      <InvaderCard bind:invaderCard bind:emptyInvaderCard />
    {:else if currentPage === "about"}
      <About />
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

  <Footer />
</div>

<style>
  .body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .container {
    /* this is constrained by the max-width set by bulma */
    width: 100vw;
  }
  .is-spiritBoardFront {
    max-width: none !important;
  }
  .is-sideMenu {
    max-width: none !important;
  }

  /* Checkbox Styling for Dark Mode */
  .custom-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    transition: all 0.3s;
    cursor: pointer;
  }
  .custom-switch::after {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-image: url(../element_simple_sun.png);
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    top: 1px;
    left: 1px;
    transition: all 0.3s;
  }

  .custom-checkbox:checked + .custom-switch::after {
    left: 20px;
    background-image: url(../element_simple_moon.png);
  }
  .custom-checkbox:checked + .custom-switch {
    background-color: #464758;
  }
  .custom-checkbox {
    display: none;
  }
</style>
