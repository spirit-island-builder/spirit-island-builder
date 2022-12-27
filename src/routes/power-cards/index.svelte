<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame.svelte";

  import PowerCard from "./power-card.svelte";
  import CustomIcons from "../custom-icons.svelte";

  export let powerCards;
  export let customIcons;
  export let isShowingInstructions;
  export let instructionsSource;

  let cardsFrame;
  let previewFrame;
  let previewDoc;
  let previewFrameSrc = "/template/MyCustomContent/MySpirit/card_front.html";
  if (powerCards.demoBoardWasLoaded) {
    previewFrameSrc = "/template/MyCustomContent/MySpirit/card_front_blank.html";
  }

  onMount(() => {
    cardsFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    var localFrame = cardsFrame;
    var localObject = powerCards;

    if (localFrame) {
      if (localObject.demoBoardWasLoaded === false) {
        setTimeout(() => {
          console.log("First tab load. Using default preview.");
          readHTML(localFrame.contentDocument);
          localObject.demoBoardWasLoaded = true;
        }, 200);
      } else {
        setTimeout(() => {
          console.log("Tab previously loaded. Reloaded from form.");
          reloadPreview();
        }, 200);
      }
    }
  }

  function showOrHideSection(event) {
    powerCards[event.target.id].isVisible = !powerCards[event.target.id].isVisible;
  }

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    setBoardValues(powerCards);
    previewFrame.copyHTMLFrom(cardsFrame.contentDocument);
    previewFrame.startMain();
  }

  function setBoardValues(powerCards) {
    if (cardsFrame) {
      //Clear any current power cards
      const bodyContainer = cardsFrame.contentDocument.querySelectorAll("body")[0];
      if (bodyContainer) {
        //(easiest to start fresh each time)
        bodyContainer.textContent = "";
      }

      //Loop through cards
      powerCards.cards.forEach((card) => {
        var newPowerCard = cardsFrame.contentDocument.createElement("quick-card");
        newPowerCard.setAttribute("name", card.name);
        newPowerCard.setAttribute("speed", card.speed.toLowerCase());
        newPowerCard.setAttribute("cost", card.cost);
        newPowerCard.setAttribute("image", card.cardImage);
        newPowerCard.setAttribute("range", card.range);
        newPowerCard.setAttribute("target", card.target);
        newPowerCard.setAttribute("target-title", card.targetTitle);
        newPowerCard.setAttribute("artist-name", card.cardArtist);

        var elementalList = card.powerElements;
        var elementListHTML = [];
        for (let key in elementalList) {
          if (elementalList[key]) elementListHTML.push(key);
        }
        newPowerCard.setAttribute("elements", elementListHTML.join());

        bodyContainer.appendChild(newPowerCard);
        var newPowerCardRules = cardsFrame.contentDocument.createElement("rules");
        newPowerCardRules.innerHTML = card.rules;
        newPowerCard.appendChild(newPowerCardRules);
        if (card.threshold) {
          var newPowerCardThreshold = cardsFrame.contentDocument.createElement("threshold");
          newPowerCardThreshold.innerHTML = card.threshold;
          newPowerCardThreshold.setAttribute("condition", card.thresholdCondition);
          if (card.thresholdText) {
            newPowerCardThreshold.setAttribute("text", card.thresholdText);
          }
          newPowerCard.appendChild(newPowerCardThreshold);
        }
      });

      //Set Custom Icons
      console.log("setting custom icons");
      let cardsStyle = cardsFrame.contentDocument.querySelectorAll("style")[0];
      if (!cardsStyle) {
        const spiritHead = cardsFrame.contentDocument.querySelectorAll("head")[0];
        cardsStyle = cardsFrame.contentDocument.createElement("style");
        spiritHead.appendChild(cardsStyle);
      }
      var customIconText = "";
      customIcons.icons.forEach((icon) => {
        customIconText +=
          "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
      });
      cardsStyle.textContent = customIconText;
      console.log("customIconText: ", customIconText);
    }
  }

  function readHTML(htmlElement) {
    console.log("Loading power cards into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const powerCardsHTML = htmlElement.querySelectorAll("quick-card");
    console.log("Loading " + powerCardsHTML.length + " cards...");

    //Clear the form first
    powerCards.cards.splice(0, powerCards.cards.length); //Clear the Form first

    //Iterate through the cards
    powerCardsHTML.forEach((powerCardHTML) => {
      addPowerCard(powerCards, powerCardHTML);
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

  function addPowerCard(powerCards, powerCardHTML) {
    var rulesHTML = powerCardHTML.querySelectorAll("rules")[0];
    var rulesPush = "";
    if (rulesHTML) {
      rulesPush = rulesHTML.innerHTML.trim();
    }
    var thresholdHTML = powerCardHTML.querySelectorAll("threshold")[0];
    var thresholdPush = "";
    var hasThresholdPush = false;
    var thresholdConditionPush = "";
    var thresholdTextPush = "";
    if (thresholdHTML) {
      hasThresholdPush = true;
      thresholdPush = thresholdHTML.innerHTML.trim();
      thresholdConditionPush = thresholdHTML.getAttribute("condition");
      thresholdTextPush = thresholdHTML.getAttribute("text");
    }

    //Parse elements
    var elementList = powerCardHTML.getAttribute("elements").split(",");
    var elementsForm = {
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
    var targetTitleCheck = powerCardHTML.getAttribute("target-title");
    if (!targetTitleCheck) {
      targetTitleCheck = "target land";
    }

    //Add the card
    powerCards.cards.push({
      id: powerCards.cards.length,
      name: powerCardHTML.getAttribute("name"),
      speed: powerCardHTML.getAttribute("speed"),
      cost: powerCardHTML.getAttribute("cost"),
      cardImage: powerCardHTML.getAttribute("image"),
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
    setBoardValues(powerCards);
    const element = document
      .getElementById("cards-mod-frame")
      .contentWindow.document.getElementsByTagName("html")[0];
    const htmlFileName = powerCards.spiritName.replaceAll(" ", "_") + "_PowerCards.html";
    Lib.downloadString("data:text/html;charset=utf-8", element.innerHTML, htmlFileName);
  }

  function handleTextFileInput(event) {
    var dummyEl = document.createElement("html");
    const file = event.target.files.item(0);
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const fileText = data.target.result;
        dummyEl.innerHTML = fileText;
        dummyEl.head = dummyEl.getElementsByTagName("head")[0];
        dummyEl.body = dummyEl.getElementsByTagName("body")[0];
        readHTML(dummyEl);
        setTimeout(() => {
          reloadPreview();
        }, 100);
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
    }
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

<h5 class="title is-5 mb-0">Power Cards</h5>
<!-- <h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview
  <span on:click={showOrHideBoard}>
    {#if powerCards.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6> -->
<PreviewFrame
  id="power-cards-preview"
  src={previewFrameSrc}
  bind:this={previewFrame}
  bind:document={previewDoc} />
<div class="field has-addons mt-2 mb-2">
  <div class="file is-success mr-1">
    <label class="file-label">
      <input
        class="file-input"
        id="userHTMLInput"
        type="file"
        name="userHTMLInput"
        accept=".html"
        on:change={handleTextFileInput} />
      <span class="file-cta">
        <span class="file-label"> Load </span>
      </span>
    </label>
  </div>
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
    <PowerCard bind:powerCards {showOrHideSection} />
    <CustomIcons bind:customIcons {showOrHideSection} />
  </div>
</div>
<div id="cards-holder">
  <iframe
    bind:this={cardsFrame}
    src="/template/MyCustomContent/MySpirit/card_front_website.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="cards-mod-frame" />
</div>
