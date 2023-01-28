<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import PowerCard from "./power-card.svelte";
  import CustomIcons from "../custom-icons.svelte";

  export let powerCards;
  export let customIcons;
  export let isShowingInstructions;
  export let instructionsSource;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MySpirit/card_front_website.html";
  function onLoad() {
    if (powerCards.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        powerCards.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(powerCards)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(powerCards) {
    const fragment = new DocumentFragment();

    //Loop through cards
    powerCards.cards.forEach((card) => {
      let newPowerCard = document.createElement("quick-card");
      newPowerCard.setAttribute("name", card.name);
      newPowerCard.setAttribute("speed", card.speed.toLowerCase());
      newPowerCard.setAttribute("cost", card.cost);
      newPowerCard.setAttribute("image", card.cardImage);
      newPowerCard.setAttribute("range", card.range);
      newPowerCard.setAttribute("target", card.target);
      newPowerCard.setAttribute("target-title", card.targetTitle);
      newPowerCard.setAttribute("artist-name", card.cardArtist);

      let elementalList = card.powerElements;
      let elementListHTML = [];
      for (let key in elementalList) {
        if (elementalList[key]) elementListHTML.push(key);
      }
      newPowerCard.setAttribute("elements", elementListHTML.join());

      fragment.append(newPowerCard);
      let newPowerCardRules = document.createElement("rules");
      newPowerCardRules.innerHTML = card.rules;
      newPowerCard.appendChild(newPowerCardRules);
      if (card.threshold) {
        let newPowerCardThreshold = document.createElement("threshold");
        newPowerCardThreshold.innerHTML = card.threshold;
        newPowerCardThreshold.setAttribute("condition", card.thresholdCondition);
        if (card.thresholdText) {
          newPowerCardThreshold.setAttribute("text", card.thresholdText);
        }
        newPowerCard.appendChild(newPowerCardThreshold);
      }
    });

    //Set Custom Icons
    const spiritStyle = document.createElement("style");
    fragment.prepend(spiritStyle);
    let customIconText = "";
    customIcons.icons.forEach((icon) => {
      customIconText +=
        "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
    });
    spiritStyle.textContent = customIconText;

    return fragment;
  }

  function readHTML(htmlElement, baseURI) {
    console.log("Loading power cards into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const powerCardsHTML = htmlElement.querySelectorAll("quick-card");
    console.log("Loading " + powerCardsHTML.length + " cards...");

    //Clear the form first
    powerCards.cards.splice(0, powerCards.cards.length); //Clear the Form first

    //Iterate through the cards
    powerCardsHTML.forEach((powerCardHTML) => {
      addPowerCard(powerCards, powerCardHTML, baseURI);
    });

    //Custom Icons
    if (powerCards.demoBoardWasLoaded) {
      const cardsStyle = htmlElement.querySelectorAll("style")[0];
      customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
      if (cardsStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = cardsStyle.textContent.match(regExp);
        if (iconList) {
          iconList.forEach((customIcon) => {
            customIcons = Lib.addCustomIcon(customIcons, customIcon);
            console.log(customIcon);
          });
        }
      }
    } else {
      console.log("SKIPPING ICON LOAD");
    }
  }

  function addPowerCard(powerCards, powerCardHTML, baseURI) {
    let rulesHTML = powerCardHTML.querySelectorAll("rules")[0];
    let rulesPush = "";
    if (rulesHTML) {
      rulesPush = rulesHTML.innerHTML.trim();
    }
    let thresholdHTML = powerCardHTML.querySelectorAll("threshold")[0];
    let thresholdPush = "";
    let hasThresholdPush = false;
    let thresholdConditionPush = "";
    let thresholdTextPush = "";
    if (thresholdHTML) {
      hasThresholdPush = true;
      thresholdPush = thresholdHTML.innerHTML.trim();
      thresholdConditionPush = thresholdHTML.getAttribute("condition");
      thresholdTextPush = thresholdHTML.getAttribute("text");
    }

    //Parse elements
    let elementList = powerCardHTML.getAttribute("elements").split(",");
    let elementsForm = {
      air: false,
      sun: false,
      moon: false,
      water: false,
      fire: false,
      earth: false,
      plant: false,
      animal: false,
    };
    elementList.forEach((element) => {
      elementsForm[element] = true;
    });

    //Check for Null targeting
    let targetTitleCheck = powerCardHTML.getAttribute("target-title");
    if (!targetTitleCheck) {
      targetTitleCheck = "target land";
    }

    //Add the card
    powerCards.cards.push({
      id: powerCards.cards.length,
      name: powerCardHTML.getAttribute("name"),
      speed: powerCardHTML.getAttribute("speed"),
      cost: powerCardHTML.getAttribute("cost"),
      cardImage: Lib.maybeResolveURL(powerCardHTML.getAttribute("image"), baseURI),
      powerElements: elementsForm,
      range: powerCardHTML.getAttribute("range"),
      target: powerCardHTML.getAttribute("target"),
      targetTitle: targetTitleCheck,
      cardArtist: powerCardHTML.getAttribute("artist-name"),
      rules: rulesPush,
      hasThreshold: hasThresholdPush,
      threshold: thresholdPush,
      thresholdCondition: thresholdConditionPush,
      thresholdText: thresholdTextPush,
    });

    return powerCards;
  }

  function exportPowerCards() {
    const htmlFileName = powerCards.spiritName.replaceAll(" ", "_") + "_PowerCards.html";
    Lib.downloadHTML(generateHTML(powerCards), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Power Cards.")) {
      powerCards = {
        prop: "value",
        spiritName: "",
        demoBoardWasLoaded: true,
        previewBoard: {
          isVisible: false,
        },
        form: {
          isVisible: false,
        },
        cards: [
          {
            id: 0,
            isVisible: true,
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
      reloadPreview();
    }
  }

  function showInstructions() {
    isShowingInstructions = true;
    instructionsSource = "https://neubee.github.io/spirit-island-builder/instructions#power-cards";
  }

  function screenshotSetUp() {
    const fileNames = [];
    const elementNamesInIframe = [];
    powerCards.cards.forEach((card, index) => {
      elementNamesInIframe.push(`#card${index}`);
      fileNames.push(card.name.replaceAll(" ", "_") + "_PowerCard.png");
    });
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }
</script>

<PreviewFrame id="power-cards-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/card.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/card.js"></script>
  </svelte:fragment>
</PreviewFrame>
<div class="field has-addons mt-2 mb-2">
  <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
    Load
  </LoadButton>
  <button class="button is-success  mr-1" on:click={exportPowerCards}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" on:click={reloadPreview}>Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Preview Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <PowerCard bind:powerCards />
    <CustomIcons bind:customIcons />
  </div>
</div>
