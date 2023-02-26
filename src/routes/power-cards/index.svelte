<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import { downloadHTML } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import PowerCard from "./power-card.svelte";
  import CustomIcons from "../custom-icons.svelte";

  import powerCardsJsonTemplate from "./tts-power-card.json";
  import jsone from "json-e";
  import { createTTSSave, toFixedNumber, ttsSaveMIMEType } from "$lib/tts.js";

  export let powerCards;
  export let customIcons;
  export let instructions;

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

    // Card Back
    if (powerCards.cardBackImage) {
      const cardBack = document.createElement("card-back");
      const cardBackArt = document.createElement("img");
      fragment.append(cardBack);
      cardBack.append(cardBackArt);
      cardBack.setAttribute("id", "cardBack");
      cardBackArt.classList.add("image-back");
      cardBackArt.setAttribute("src", powerCards.cardBackImage);
    }

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

    const cardBack = htmlElement.querySelectorAll("card-back")[0];
    if (cardBack) {
      let cardBackImage = cardBack.querySelectorAll("img")[0];
      powerCards.cardBackImage = Lib.maybeResolveURL(cardBackImage.getAttribute("src"), baseURI);
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
    downloadHTML(generateHTML(powerCards), htmlFileName);
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
    instructions.open("power-cards");
  }

  function screenshotSetUp() {
    const fileNames = [];
    const elementNamesInIframe = [];
    powerCards.cards.forEach((card, index) => {
      elementNamesInIframe.push(`#card${index}`);
      fileNames.push(card.name.replaceAll(" ", "_") + "_PowerCard.png");
    });
    console.log(powerCards.cardBackImage);
    if (powerCards.cardBackImage) {
      elementNamesInIframe.push(`#cardBack`);
      fileNames.push("BackImage.png");
    }
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  async function downloadTTSJSON() {
    let previewFrameDoc = document.getElementById("preview-iframe").contentWindow.document;

    const cardsTemplate = previewFrameDoc.querySelectorAll("card");
    let powerCardsJson = [];
    powerCards.cards.forEach((card, index) => {
      let cardTemplate = cardsTemplate[index];
      let cardRect = cardTemplate.getBoundingClientRect();

      let elements = "";
      elements += card.powerElements.sun ? 1 : 0;
      elements += card.powerElements.moon ? 1 : 0;
      elements += card.powerElements.fire ? 1 : 0;
      elements += card.powerElements.air ? 1 : 0;
      elements += card.powerElements.water ? 1 : 0;
      elements += card.powerElements.earth ? 1 : 0;
      elements += card.powerElements.plant ? 1 : 0;
      elements += card.powerElements.animal ? 1 : 0;

      let energy = [];
      energy = card.cost;

      let tags = [];
      tags.push(card.speed.charAt(0).toUpperCase() + card.speed.slice(1));
      tags.push("Unique");

      let thresholdText;
      let thresholds = [];
      if (card.hasThreshold) {
        thresholdText =
          'function onLoad(saved_data)\n    if saved_data ~= "" then\n        local loaded_data = JSON.decode(saved_data)\n        self.setTable("thresholds", loaded_data.thresholds)\n    end\nend\n-- card loading end';
        //"{\"thresholds\": [{\"elements\": \"00030000\", \"position\": {\"x\": 0.07, \"y\": 0, \"z\": 1.09}}]}"
        const thresholdNode = cardTemplate
          .getElementsByTagName("threshold-condition")[0]
          .getElementsByTagName("span")[0];

        let icons = Array.from(thresholdNode.getElementsByTagName("icon"));
        let elementNums = thresholdNode.innerHTML
          .split("<icon")
          .map((x) => (isNaN(x) ? x.split("icon>")[1] : x));

        let elementCounts = [0, 0, 0, 0, 0, 0, 0, 0];
        icons.forEach((icon, i) => {
          if (icon.classList.contains("sun")) {
            elementCounts[0] = elementNums[i];
          } else if (icon.classList.contains("moon")) {
            elementCounts[1] = elementNums[i];
          } else if (icon.classList.contains("fire")) {
            elementCounts[2] = elementNums[i];
          } else if (icon.classList.contains("air")) {
            elementCounts[3] = elementNums[i];
          } else if (icon.classList.contains("water")) {
            elementCounts[4] = elementNums[i];
          } else if (icon.classList.contains("earth")) {
            elementCounts[5] = elementNums[i];
          } else if (icon.classList.contains("plant")) {
            elementCounts[6] = elementNums[i];
          } else if (icon.classList.contains("animal")) {
            elementCounts[7] = elementNums[i];
          }
        });
        console.log(elementCounts);
        let thresholdSpan = thresholdNode.getBoundingClientRect();
        thresholds.push({
          elements: elementCounts.join(""),
          position: {
            x: toFixedNumber(
              (-(cardRect.width / cardRect.height) *
                (-43 + thresholdSpan.left - cardRect.x - cardRect.width / 2)) /
                (cardRect.width / 2),
              4
            ),
            y: 0,
            z: toFixedNumber(
              ((cardRect.height / cardRect.width) *
                (thresholdSpan.y + thresholdSpan.height - cardRect.y - cardRect.height / 2)) /
                (cardRect.height / 2),
              // (thresholdSpan.y + thresholdSpan.height / 2 - cardRect.y - cardRect.height / 2) / (cardRect.height / 2),
              4
            ),
          },
        });
      } else {
        // No Threshold
        thresholdText = "";
      }

      thresholds = JSON.stringify({ thresholds: thresholds });

      let powerCardJson = jsone(powerCardsJsonTemplate, {
        guid: card.name.replaceAll(" ", "_"),
        cardName: card.name,
        elements,
        energy,
        tags,
        thresholdText,
        thresholds,
      });
      powerCardsJson.push(powerCardJson);
    });
    let ttsSave = createTTSSave(powerCardsJson);
    let saveName = "export";
    if (powerCards.spiritName) {
      saveName = powerCards.spiritName;
    }
    const jsonFileName = saveName.replaceAll(" ", "_") + "_cards_TTS.json";
    Lib.downloadString(ttsSaveMIMEType, ttsSave, jsonFileName);
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
  <button class="button is-success  mr-1" on:click={downloadTTSJSON}>Export TTS file</button>
  <button class="button is-warning  mr-1" on:click={reloadPreview}>Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Preview Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0 mb-1">
  <div class="column pt-0">
    <PowerCard bind:powerCards />
    <CustomIcons bind:customIcons />
  </div>
</div>
