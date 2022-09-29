<script>
  import { onMount } from "svelte";
  export let powerCards;
  import PowerCard from "./power-card.svelte";

  let cardsFrame;
  onMount(() => {
    cardsFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    if (cardsFrame) {
      if (powerCards.demoBoardWasLoaded === false) {
        setTimeout(() => {
          readHTML(cardsFrame.contentDocument);
          powerCards.demoBoardWasLoaded = true;
        }, 200);
      } else {
        setTimeout(() => {
          reloadPreview();
        }, 200);
      }
    }
  }

  function showOrHideSection(event) {
    powerCards[event.target.id].isVisible = !powerCards[event.target.id].isVisible;
  }

  function showOrHideBoard() {
    if (document.getElementById("cards-board-wrap").style.display == "none") {
      document.getElementById("cards-board-wrap").style.display = "block";
    } else {
      document.getElementById("cards-board-wrap").style.display = "none";
    }
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=setBoardValues)");
    setBoardValues(powerCards);
    console.log("Reloading Preview (f=copyHTML)");
    copyHTML();
    document.getElementById("cards-scaled-frame").contentWindow.startMain();
  }

  function copyHTML() {
    console.log("Copying HTML from Form to Preview (f=copyHTML)");
    var modFrame = document.getElementById("cards-mod-frame");
    modFrame.doc = document.getElementById("cards-mod-frame").contentWindow.document;
    modFrame.head = modFrame.doc.getElementsByTagName("head")[0];
    modFrame.body = modFrame.doc.getElementsByTagName("body")[0];
    var scaledFrame = document.getElementById("cards-scaled-frame");
    scaledFrame.doc = document.getElementById("cards-scaled-frame").contentWindow.document;
    scaledFrame.head = scaledFrame.doc.getElementsByTagName("head")[0];
    scaledFrame.body = scaledFrame.doc.getElementsByTagName("body")[0];

    let bodyClone;
    bodyClone = document
      .getElementById("cards-mod-frame")
      .contentWindow.document.body.cloneNode(true);
    document.getElementById("cards-scaled-frame").contentWindow.document.body = bodyClone;
    let headClone = modFrame.head.cloneNode(true);
    scaledFrame.head.parentElement.replaceChild(headClone, scaledFrame.head);
  }

  function setBoardValues(powerCards) {
    if (cardsFrame) {
      //Clear any current power cards
      const bodyContainer = cardsFrame.contentDocument.querySelectorAll("body")[0];
      if (bodyContainer) {
        //(easiest to start fresh each time)
        bodyContainer.textContent = "";
      }
      console.log(cardsFrame.contentDocument);

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
        console.log(newPowerCard);
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

      console.log(powerCards);
    }
  }

  function readHTML(htmlElement) {
    console.log("Loading default power cards into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    if (cardsFrame) {
      console.log("loading cards");
      console.log("element passed:");
      console.log(htmlElement);
      const powerCardsHTML = htmlElement.querySelectorAll("quick-card");
      console.log("found " + powerCardsHTML.length + " cards");

      //Clear the form first
      powerCards.cards.splice(0, powerCards.cards.length); //Clear the Form first
      console.log("cleared power cards");
      console.log(powerCards.cards);

      //Iterate through the cards
      powerCardsHTML.forEach((powerCardHTML) => {
        addPowerCard(powerCards, powerCardHTML);
      });

      console.log(powerCards);
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
    console.log(elementsForm);

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
      targetTitle: powerCardHTML.getAttribute("target-title"),
      cardArtist: powerCardHTML.getAttribute("artist-name"),
      rules: rulesPush,
      hasThreshold: hasThresholdPush,
      threshold: thresholdPush,
      thresholdCondition: thresholdConditionPush,
      thresholdText: thresholdTextPush,
    });

    return powerCards;
  }

  let cardsFrameLarge = false;
  function toggleSize() {
    var displayFrame = document.getElementById("cards-scaled-frame");
    var displayWrap = document.getElementById("cards-board-wrap");
    if (!cardsFrameLarge) {
      displayFrame.style.webkitTransform = "scale(1)";
      displayWrap.style.height = "700px";
      displayFrame.style.width = "100%";
    } else {
      displayFrame.style.webkitTransform = "scale(0.67)";
      displayWrap.style.height = "460px";
      displayFrame.style.width = "149%";
    }
    cardsFrameLarge = !cardsFrameLarge;
  }

  function exportPowerCards() {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          document
            .getElementById("cards-mod-frame")
            .contentWindow.document.getElementsByTagName("html")[0].innerHTML
        )
    );
    console.log(
      document
        .getElementById("cards-mod-frame")
        .contentWindow.document.getElementsByTagName("html")[0].innerHTML
    );
    element.setAttribute(
      "download",
      powerCards.spiritName.replaceAll(" ", "_") + "_powercards.html"
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        console.log(dummyEl);
        console.log("new file loading");
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
    }
  }

  function clearAllFields() {
    powerCards = {
      prop: "value",
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
  }
</script>

<h5 class="title is-5">Power Cards</h5>
<h6
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
</h6>
<div id="cards-board-wrap">
  <iframe
    src="/template/MyCustomContent/MySpirit/card_front.html"
    height="700"
    width="125%"
    id="cards-scaled-frame"
    title="yay" />
</div>
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
        <span class="file-label"> Load Power Cards file </span>
      </span>
    </label>
  </div>
  <button class="button is-success  mr-1" on:click={exportPowerCards}
    >Download Power Cards file</button>
  <button class="button is-info  mr-1" on:click={reloadPreview}>Generate Power Cards</button>
  <button class="button is-warning mr-1" on:click={toggleSize}>Toggle Preview Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <PowerCard bind:powerCards {showOrHideSection} />
  </div>
</div>
<article class="message is-small mb-1">
  <div class="message-body p-1">
    See <a
      href="https://github.com/neubee/spirit-island-builder/blob/dev/docs/instructions.md"
      target="_blank">Instructions</a>
    for details on how to use the form. For custom art,
    <a href="https://www.wombo.art/" target="_blank">Wombo</a>
    (unaffiliated) is a popular art generator.
    <br />This is an unofficial website. Interface created by Neubee & Resonant. The Spirit Island
    Builder is adapted from
    <a href="https://github.com/Gudradain/spirit-island-template" target="_blank">HTML template</a>
    developed by Spirit Island fanbase. All materials belong to Greater Than Games, LLC.
  </div>
</article>
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