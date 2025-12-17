<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import { downloadHTML, downloadString } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";
  import SaveDropdown from "$lib/save-dropdown.svelte";
  import Examples from "$lib/example-modal.svelte";
  import examples from "./examples.json";

  import PowerCard from "./power-card.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import CombinedTTS from "../combined-tts-spirit-powers-export.svelte";

  import powerCardsJsonTemplate from "./tts-power-card.json";
  import jsone from "json-e";
  import { createTTSSave, getThresholdTTSJSON, ttsSaveMIMEType } from "$lib/tts.js";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import LanguageOptions from "./language-options.svelte";
  import ReorderCards from "./reorder-cards.svelte";

  export let powerCards;
  export let emptyPowerCards;
  export let combinedTTS;
  export let emptyCombinedTTS;
  export let currentPage;

  let previewFrame;
  let exampleModal;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const additiveLoadExportFunction = (url) => {
    additiveLoadHTMLFromURL(url);
  };

  async function additiveLoadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    additiveReadHTML(loadedDocument, url);
    powerCards = powerCards;
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyPowerCard/Examples_PowerCards.html";
  function onLoad() {
    if (powerCards.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        powerCards.demoBoardWasLoaded = true;
        emptyPowerCards.demoBoardWasLoaded = true;
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

  function clearAllFields() {
    if (
      window.confirm("Are you sure? This permanently clears all fields in Spirit Board Play Side.")
    ) {
      powerCards = JSON.parse(JSON.stringify(emptyPowerCards));
      reloadPreview();
    }
  }

  function generateHTML(powerCards) {
    const fragment = new DocumentFragment();

    //Loop through cards
    powerCards.cards.forEach((card) => {
      let newPowerCard = document.createElement("quick-card");
      newPowerCard.setAttribute("name", card.name);
      newPowerCard.setAttribute("speed", card.speed.toLowerCase());
      newPowerCard.setAttribute("cost", card.cost);
      newPowerCard.setAttribute("type", card.type);
      newPowerCard.setAttribute("image", card.cardImage);
      newPowerCard.setAttribute("range", card.range);
      newPowerCard.setAttribute("target", card.target);
      newPowerCard.setAttribute("target-title", card.targetTitle);
      newPowerCard.setAttribute("artist-name", card.cardArtist);
      newPowerCard.setAttribute("subtitle", card.aspectSubtitle);
      newPowerCard.setAttribute("stack-view", card.isVisible);
      newPowerCard.setAttribute("lang", powerCards.language);

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
        if (card.hasSecondThreshold) {
          let newSecondThreshold = document.createElement("threshold");
          newSecondThreshold.innerHTML = card.secondThreshold;
          newSecondThreshold.setAttribute("condition", card.secondThresholdCondition);
          newPowerCard.appendChild(newSecondThreshold);
        }
      }
    });

    //Add spirit name
    if (powerCards.spiritName) {
      let spiritName = document.createElement("spirit-name");
      fragment.append(spiritName);
      spiritName.innerHTML = powerCards.spiritName;
    }

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(powerCards.customIcons);
    const cardsStyle = document.createElement("style");
    fragment.prepend(cardsStyle);
    cardsStyle.textContent = customIconText;

    // Card Back
    if (powerCards.cardBackImage) {
      const cardBack = document.createElement("card-back");
      const cardBackArt = document.createElement("img");
      const cardBackOverlay = document.createElement("card-back-overlay");
      fragment.append(cardBack);
      cardBack.append(cardBackArt);
      cardBack.append(cardBackOverlay);
      cardBack.setAttribute("id", "cardBack");
      cardBackArt.classList.add("image-back");
      cardBackArt.setAttribute("src", powerCards.cardBackImage);
    }

    if (powerCards.stackView) {
      const stackViewOption = document.createElement("stack-view-on");
      fragment.append(stackViewOption);
    }

    return fragment;
  }

  function readHTML(htmlElement, baseURI) {
    console.log("Loading power cards into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const powerCardsHTML = htmlElement.querySelectorAll("quick-card");
    console.log("Loading " + powerCardsHTML.length + " cards...");

    //Language
    powerCards.language = powerCardsHTML[0].getAttribute("lang") || "en";

    //Clear the form first
    powerCards.cards.splice(0, powerCards.cards.length); //Clear the Form first

    //Iterate through the cards
    powerCardsHTML.forEach((powerCardHTML) => {
      addPowerCard(powerCards, powerCardHTML, baseURI);
    });

    //Load Custom Icons
    powerCards.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      powerCards.customIcons,
      document.baseURI
    );

    const cardBack = htmlElement.querySelectorAll("card-back")[0];
    if (cardBack) {
      let cardBackImage = cardBack.querySelectorAll("img")[0];
      powerCards.cardBackImage = Lib.maybeResolveURL(cardBackImage.getAttribute("src"), baseURI);
    }

    //Add spirit name
    const spiritNameHTML = htmlElement.querySelectorAll("spirit-name")[0];
    if (spiritNameHTML) {
      powerCards.spiritName = spiritNameHTML.innerHTML;
    } else {
      powerCards.spiritName = "";
    }

    const stackViewCheck = htmlElement.querySelectorAll("stack-view-on")[0];
    if (stackViewCheck) {
      powerCards.stackView = true;
    }
  }

  function additiveReadHTML(htmlElement, baseURI) {
    console.log("Attempting additive load form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const newPowerCardsHTML = htmlElement.querySelectorAll("quick-card");
    console.log("Loading " + newPowerCardsHTML.length + " cards...");

    //Iterate through the cards
    newPowerCardsHTML.forEach((powerCardHTML) => {
      addPowerCard(powerCards, powerCardHTML, baseURI);
    });
  }

  function addPowerCard(powerCards, powerCardHTML, baseURI) {
    let rulesHTML = powerCardHTML.querySelectorAll("rules")[0];
    let rulesPush = "";
    if (rulesHTML) {
      rulesPush = rulesHTML.innerHTML.trim();
    }
    let thresholdHTML = powerCardHTML.querySelectorAll("threshold");
    let thresholdPush = "";
    let hasThresholdPush = false;
    let thresholdConditionPush = "";
    let thresholdTextPush = "";
    let hasSecondThresholdPush = false;
    let thresholdSecondPush = "";
    let thresholdSecondConditionPush = "";
    if (thresholdHTML[0]) {
      hasThresholdPush = true;
      thresholdPush = thresholdHTML[0].innerHTML.trim();
      thresholdConditionPush = thresholdHTML[0].getAttribute("condition");
      thresholdTextPush = thresholdHTML[0].getAttribute("text");
    }
    if (thresholdHTML[1]) {
      hasSecondThresholdPush = true;
      thresholdSecondPush = thresholdHTML[1].innerHTML.trim();
      thresholdSecondConditionPush = thresholdHTML[1].getAttribute("condition");
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
    let targetTitleCheck =
      powerCardHTML.getAttribute("target-title").toUpperCase() || "TARGET LAND";

    //Add the card
    powerCards.cards.push({
      id: powerCards.cards.length,
      name: powerCardHTML.getAttribute("name"),
      speed: powerCardHTML.getAttribute("speed"),
      cost: powerCardHTML.getAttribute("cost"),
      type: powerCardHTML.getAttribute("type") || "",
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
      hasSecondThreshold: hasSecondThresholdPush,
      secondThreshold: thresholdSecondPush,
      secondThresholdCondition: thresholdSecondConditionPush,
      aspectSubtitle: powerCardHTML.getAttribute("subtitle") || "",
    });

    return powerCards;
  }

  const exportSinglePowerCard = (powerCardSingle) => {
    const htmlFileName =
      powerCardSingle.spiritName.replaceAll(" ", "_").slice(0, 8) +
      "-" +
      powerCardSingle.cards[0].name.replaceAll(" ", "_") +
      "_PowerCards.html";
    downloadHTML(generateHTML(powerCardSingle), htmlFileName);
  };

  function screenshotSetUp() {
    const fileNames = [];
    const elementNamesInIframe = [];
    powerCards.cards.forEach((card, index) => {
      elementNamesInIframe.push(`#card${index}`);
      if (powerCards.type === "major" || powerCards.type === "minor") {
        fileNames.push(powerCards.type + "_" + card.name.replaceAll(" ", "_") + "_PowerCard.png");
      } else if (powerCards.spiritName) {
        fileNames.push(
          powerCards.spiritName.replaceAll(" ", "_").slice(0, 8) +
            "-" +
            card.name.replaceAll(" ", "_") +
            "_PowerCard.png"
        );
      } else {
        fileNames.push(card.name.replaceAll(" ", "_") + "_PowerCard.png");
      }
    });
    console.log(powerCards.cardBackImage);
    if (powerCards.cardBackImage) {
      elementNamesInIframe.push(`#cardBack`);
      fileNames.push(powerCards.spiritName.replaceAll(" ", "_") + "_BackImage.png");
    }
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  const packagePowersTTSforExport = () => {
    let previewFrameDoc = document.getElementById("preview-iframe").contentWindow.document;

    const cardsTemplate = previewFrameDoc.querySelectorAll("card");
    let powerCardsJson = [];
    powerCards.cards.forEach((card, index) => {
      let cardTemplate = cardsTemplate[index];

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
      // let thresholdsOLD = [];
      if (card.hasThreshold && card.thresholdCondition.length > 0) {
        thresholdText =
          'function onLoad(saved_data)\n    if saved_data ~= "" then\n        local loaded_data = JSON.decode(saved_data)\n        self.setTable("thresholds", loaded_data.thresholds)\n    end\nend\n-- card loading end';
        //"{\"thresholds\": [{\"elements\": \"00030000\", \"position\": {\"x\": 0.07, \"y\": 0, \"z\": 1.09}}]}"
        const thresholdNode = cardTemplate.getElementsByTagName("threshold-condition")[0];

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
      } else {
        // No Threshold
        thresholdText = "";
      }
      thresholds = getThresholdTTSJSON(
        cardTemplate,
        cardTemplate.getElementsByTagName("threshold-condition")
      );
      thresholds = JSON.stringify({ thresholds });
      // console.log(thresholdsOLD);
      console.log(thresholds);

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
    return ttsSave;
  };

  async function downloadTTSJSON() {
    let ttsSave = packagePowersTTSforExport();
    let saveName = "export";
    if (powerCards.spiritName) {
      saveName = powerCards.spiritName;
    }
    const jsonFileName = saveName.replaceAll(" ", "_") + "_cards_TTS.json";
    downloadString(ttsSaveMIMEType, ttsSave, jsonFileName);
  }

  const openEditorHeading = (e) => {
    console.log(e.target.tagName);
    console.log(e.target.id);
    console.log(e.target);
    console.log(e);
    let outcome;
    let regFindNumbers = /^\d+|\d+\b|\d+(?=\w)/g;
    let numMatches = e.target.id.match(regFindNumbers);
    let card = powerCards.cards[numMatches[0]];
    // e.stopPropagation(); // we stop the event from propegating up to 'board', which would cause this to trigger twice
    outcome = !card.isVisible;
    hideAll();
    card.isVisible = outcome;
    powerCards = powerCards;
    let htmlCard = e.target;
    if (htmlCard.classList.contains("stack-view")) {
      htmlCard.classList.remove("stack-view");
    } else {
      htmlCard.classList.add("stack-view");
    }
  };

  function hideAll() {
    powerCards.cards.forEach((card) => (card.isVisible = false));
    powerCards.customIcons.isVisible = false;
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  function printToPDF(pageType = "letter") {
    let fileName = "";
    const elementNamesInIframe = [];
    if (powerCards.spiritName) {
      fileName = powerCards.spiritName.replaceAll(" ", "_") + "_PowerCardSet.pdf";
    } else {
      fileName = "Custom_PowerCardSet.pdf";
    }
    for (let i = 0; i < powerCards.cards.length; i++) {
      elementNamesInIframe.push(`#card${i}`);
    }
    if (powerCards.cardBackImage) {
      // add a card back for each card
      for (let i = 0; i < powerCards.cards.length; i++) {
        elementNamesInIframe.push(`#cardBack`);
      }
    }
    previewFrame.getPDF(fileName, elementNamesInIframe, pageType, 2.48, 3.465);
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function getFileName(powerCards) {
    let fileName = "";
    if (powerCards.spiritName) {
      fileName = powerCards.spiritName.replaceAll(" ", "_") + "_PowerCards.html";
    } else {
      fileName = "Custom_PowerCards.html";
    }
    return fileName;
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let cards = Array.from(previewFrame.document.getElementsByTagName("card"));
    cards.forEach((card) => {
      card.classList.add("printer-clean");
    });
  }

  function setStackView() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let cardHolder = previewFrame.document.getElementsByTagName("cards")[0];
    // if (!cardHolder.classList.contains("enable-stack-view")) {
    cardHolder.classList.add("enable-stack-view");
    powerCards.stackView = true;
    // }
    let cards = Array.from(previewFrame.document.getElementsByTagName("card"));
    cards.forEach((card) => {
      if (!card.classList.contains("stack-view")) {
        card.classList.add("stack-view");
      }
    });
  }

  function unsetStackView() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let cardHolder = previewFrame.document.getElementsByTagName("cards")[0];
    cardHolder.classList.remove("enable-stack-view");
    powerCards.stackView = false;
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <PowerCard
      bind:powerCards
      exportSingleCard={exportSinglePowerCard}
      additivePowerLoad={additiveLoadExportFunction} />
    <div class="content mb-0 mt-2">Options</div>
    <CustomIcons customIcons={powerCards.customIcons} />
    <LanguageOptions bind:powerCards />
    <ReorderCards bind:powerCards />
    <CombinedTTS
      bind:combinedTTS
      bind:currentPage
      bind:emptyCombinedTTS
      bind:powerCards
      exportPowersTTS={packagePowersTTSforExport} />
  </div>
  <div class="column pt-0">
    <PreviewFrame
      id="power-cards-preview"
      bind:this={previewFrame}
      on:hot-reload={reloadPreview}
      clickFunction={() => openEditorHeading}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/card.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/card.js"></script>
      </svelte:fragment>
    </PreviewFrame>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-info js-modal-trigger mr-1 mt-1" on:click={exampleModal.open}>
        Examples
      </button>
      <InstructionsLink class="button is-info mt-1 mr-1" anchor="power-cards" />
      <LoadDropdown
        accept="text/html"
        class="button is-success mt-1 mr-1"
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadDropdown>
      <SaveDropdown
        saveAction={() => generateHTML(powerCards)}
        fileName={getFileName(powerCards)}
        saveType="html" />
      <button class="button is-warning mt-1 mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <button class="button is-warning mt-1 mr-1" on:click={previewFrame.toggleSize}
        >Toggle Preview Size</button>
      <button class="button is-danger mt-1 mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-success mt-1  mr-1" on:click={screenshotSetUp}
        >Download Image</button>
      <button class="button is-success mt-1  mr-1" on:click={downloadTTSJSON}
        >Export TTS file</button>
      <div class="dropdown is-hoverable is-up">
        <div class="dropdown-trigger">
          <button
            class="button mt-1 mr-1 is-success"
            aria-haspopup="true"
            aria-controls="dropdown-menu4">
            <span>Create PDF...</span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu4" role="menu">
          <div class="dropdown-content">
            <button class="button is-success mr-1 dropdown-item" on:click={printToPDFLetter}
              >Letter size</button>
            <button class="button is-success mt-1 mr-1 dropdown-item" on:click={printToPDFA4}
              >A4 size</button>
          </div>
        </div>
      </div>
      <button class="button is-warning mt-1 mr-1 is-small" on:click={togglePrinterClean}
        >Printer-Friendly</button>
      {#if !powerCards.stackView}
        <button class="button is-warning mt-1 mr-1 is-small" on:click={setStackView}
          >Enable Stack View</button>
      {:else}
        <button class="button is-warning mt-1 mr-1 is-small" on:click={unsetStackView}
          >Disable Stack View</button>
      {/if}
    </div>
  </div>
</div>
<Examples bind:this={exampleModal} {loadExample} title="Load Examples" {examples} />
