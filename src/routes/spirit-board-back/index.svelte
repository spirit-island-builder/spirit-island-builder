<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import { downloadHTML } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import NameArtLore from "./name-art-lore.svelte";
  import SetupPlaystyleComplexityPowers from "./setup-playstyle-complexity-powers.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";

  export let spiritBoardBack;
  export let emptySpiritBoardBack;
  export let customIcons;

  function clearAllFields() {
    if (
      window.confirm("Are you sure? This permanently clears all fields in Spirit Board Lore Side.")
    ) {
      spiritBoardBack = JSON.parse(JSON.stringify(emptySpiritBoardBack));
      reloadPreview();
    }
  }

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MySpirit/board_lore_website.html";
  function onLoad() {
    if (spiritBoardBack.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        spiritBoardBack.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview Lore Side Board (f=setBoardValues)");
    previewFrame.copyHTMLFrom(generateHTML(spiritBoardBack)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(spiritBoardBack) {
    let fragment = new DocumentFragment();

    const loreBoardHTML = document.createElement("board");
    fragment.append(loreBoardHTML);

    //Set Spirit Image
    const loreImage = document.createElement("img");
    loreImage.setAttribute("class", "spirit-image");
    loreImage.setAttribute("src", spiritBoardBack.nameImage.img);
    if (spiritBoardBack.nameImage.scale) {
      loreImage.setAttribute("scale", spiritBoardBack.nameImage.scale);
    }
    loreBoardHTML.append(loreImage);

    //Set Spirit Name
    const loreName = document.createElement("spirit-name");
    loreName.innerHTML = spiritBoardBack.nameImage.name;
    loreBoardHTML.append(loreName);

    //Set Lore Description
    const loreDescription = document.createElement("lore-description");
    loreDescription.innerHTML = spiritBoardBack.lore.loreText;
    loreBoardHTML.append(loreDescription);

    const secondSection = document.createElement("second-section-container");
    loreBoardHTML.append(secondSection);

    const setup = document.createElement("setup");
    secondSection.append(setup);

    const setupTitle = document.createElement("setup-title");
    setupTitle.innerText = "SETUP:";
    setup.append(setupTitle);

    //Set Lore Setup
    const loreSetup = document.createElement("setup-description");
    loreSetup.innerHTML = spiritBoardBack.setup.setupText;
    setup.append(loreSetup);

    const playStyle = document.createElement("play-style");
    secondSection.append(playStyle);

    const playStyleTitle = document.createElement("play-style-title");
    playStyleTitle.innerText = "Play Style:";
    playStyle.append(playStyleTitle);

    //Set Lore Play Style
    const lorePlayStyle = document.createElement("play-style-description");
    lorePlayStyle.innerHTML = spiritBoardBack.playStyle.playStyleText;
    playStyle.append(lorePlayStyle);

    const thirdSection = document.createElement("third-section-container");
    loreBoardHTML.append(thirdSection);

    //Set Note
    if (spiritBoardBack.note.noteText) {
      const noteHTML = document.createElement("note");
      noteHTML.innerHTML = spiritBoardBack.note.noteText;
      thirdSection.append(noteHTML);
    }

    //Set Complexity
    const complexityHeader = document.createElement("complexity");
    complexityHeader.setAttribute("value", spiritBoardBack.complexity.complexityValue);
    complexityHeader.setAttribute("descriptor", spiritBoardBack.complexity.complexityDescriptor);
    thirdSection.append(complexityHeader);

    //Set Summary of Powers
    const summaryPowersHeader = document.createElement("summary-of-powers");
    let summaryPowersValues =
      spiritBoardBack.summary.offenseValue +
      "," +
      spiritBoardBack.summary.controlValue +
      "," +
      spiritBoardBack.summary.fearValue +
      "," +
      spiritBoardBack.summary.defenseValue +
      "," +
      spiritBoardBack.summary.utilityValue;
    summaryPowersHeader.setAttribute("values", summaryPowersValues);
    summaryPowersHeader.setAttribute("uses", spiritBoardBack.summary.usesTokens);
    thirdSection.append(summaryPowersHeader);

    //Set Custom Icons
    const spiritStyle = document.createElement("style");
    let customIconText = "";
    customIcons.icons.forEach((icon) => {
      customIconText +=
        "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
    });
    spiritStyle.textContent = customIconText;
    fragment.prepend(spiritStyle);

    return fragment;
  }

  function readHTML(htmlElement, baseURI) {
    console.log("Loading spirit lore board into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const loreBoardHTML = htmlElement.querySelectorAll("board")[0];

    //Set Spirit Name
    const loreName = loreBoardHTML.querySelectorAll("spirit-name")[0];

    spiritBoardBack.nameImage.name = loreName.innerHTML.trim();

    //Set Spirit Image
    const loreImage = loreBoardHTML.querySelectorAll("img")[0];
    if (loreImage) {
      spiritBoardBack.nameImage.img = Lib.maybeResolveURL(loreImage.getAttribute("src"), baseURI);
      let imgScale = loreImage.getAttribute("scale");
      console.log(imgScale);
      if (imgScale) {
        spiritBoardBack.nameImage.scale = imgScale;
      }
    }
    //Set Lore Description
    const loreDescription = loreBoardHTML.querySelectorAll("lore-description")[0];

    spiritBoardBack.lore.loreText = loreDescription.innerHTML.trim();

    //Set Lore Setup
    const loreSetup = loreBoardHTML.querySelectorAll("setup-description")[0];
    spiritBoardBack.setup.setupText = loreSetup.innerHTML.trim();

    //Set Lore Play Style
    const lorePlayStyle = loreBoardHTML.querySelectorAll("play-style-description")[0];
    spiritBoardBack.playStyle.playStyleText = lorePlayStyle.innerHTML.trim();

    //Set Note (if note)
    const hasNote = loreBoardHTML.querySelectorAll("note")[0];
    spiritBoardBack.note.noteText = "";
    if (hasNote) {
      spiritBoardBack.note.noteText = hasNote.innerHTML;
    }

    //Set Complexity
    const complexityHeader = loreBoardHTML.querySelectorAll("complexity")[0];
    spiritBoardBack.complexity.complexityValue = complexityHeader.getAttribute("value");
    spiritBoardBack.complexity.complexityDescriptor = complexityHeader.getAttribute("descriptor");

    //Set Summary of Powers
    const summaryPowersHeader = loreBoardHTML.querySelectorAll("summary-of-powers")[0];
    let summaryPowersValues = summaryPowersHeader.getAttribute("values");
    let summaryPowersSplit = summaryPowersValues.split(",");
    spiritBoardBack.summary.offenseValue = summaryPowersSplit[0];
    spiritBoardBack.summary.controlValue = summaryPowersSplit[1];
    spiritBoardBack.summary.fearValue = summaryPowersSplit[2];
    spiritBoardBack.summary.defenseValue = summaryPowersSplit[3];
    spiritBoardBack.summary.utilityValue = summaryPowersSplit[4];
    spiritBoardBack.summary.usesTokens = summaryPowersHeader.getAttribute("uses");

    //Custom Icons
    if (spiritBoardBack.demoBoardWasLoaded) {
      const spiritStyle = htmlElement.querySelectorAll("style")[0];
      customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
      if (spiritStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = spiritStyle.textContent.match(regExp);
        if (iconList) {
          iconList.forEach((customIcon) => {
            customIcon = Lib.maybeResolveURL(customIcon, baseURI);
            customIcons = Lib.addCustomIcon(customIcons, customIcon);
            console.log(customIcon);
          });
        }
      }
    } else {
      console.log("SKIPPING ICON LOAD");
    }
  }

  function exportSpiritBoardBack() {
    const htmlFileName = spiritBoardBack.nameImage.name.replaceAll(" ", "_") + "_SpiritLore.html";
    downloadHTML(generateHTML(spiritBoardBack), htmlFileName);
  }

  function screenshotSetUp() {
    const fileNames = [
      spiritBoardBack.nameImage.name.replaceAll(" ", "_") + "_SpiritBoardBack.png",
    ];
    const elementNamesInIframe = ["board"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  function printToPDF(pageType = "letter") {
    const fileNames = [
      spiritBoardBack.nameImage.name.replaceAll(" ", "_") + "_SpiritBoardBack.pdf",
    ];
    const elementNamesInIframe = ["board"];
    previewFrame.getPDF(fileNames, elementNamesInIframe, pageType);
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("board")[0];
    spiritBoard.classList.add("printer-clean");
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameArtLore bind:spiritBoardBack />
    <SetupPlaystyleComplexityPowers bind:spiritBoardBack />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <PreviewFrame id="lore-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/board_lore.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/board_lore.js"></script>
      </svelte:fragment>
    </PreviewFrame>
    <div class="field has-addons preview-buttons mt-1 mb-0 is-flex-wrap-wrap">
      <InstructionsLink class="button is-info mr-1" anchor="spirit-board-lore-side" />
      <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadButton>
      <button class="button is-success  mr-1" on:click={exportSpiritBoardBack}> Save </button>
      <button class="button is-warning mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}>Toggle Zoom</button>
      <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-success mt-1 mr-1" on:click={screenshotSetUp}>Download Image</button>
      <button class="button is-success mt-1 mr-1" on:click={printToPDFLetter}
        >Create PDF (letter)</button>
      <button class="button is-success mt-1 mr-1" on:click={printToPDFA4}>Create PDF (a4)</button>
      <button class="button is-warning mt-1 mr-1 is-small" on:click={togglePrinterClean}
        >Printer-Friendly</button>
    </div>
  </div>
</div>
