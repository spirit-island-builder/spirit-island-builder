<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";

  import NameArtLore from "./name-art-lore.svelte";
  import SetupPlaystyleComplexityPowers from "./setup-playstyle-complexity-powers.svelte";
  import CustomIcons from "../custom-icons.svelte";

  export let spiritBoardBack;
  export let customIcons;
  export let isShowingInstructions;
  export let instructionsSource;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument);
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

  function readHTML(htmlElement) {
    console.log("Loading spirit lore board into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const loreBoardHTML = htmlElement.querySelectorAll("board")[0];

    //Set Spirit Name
    const loreName = loreBoardHTML.querySelectorAll("spirit-name")[0];

    spiritBoardBack.nameImage.name = loreName.innerHTML.trim();

    //Set Spirit Image
    const loreImage = loreBoardHTML.querySelectorAll("img")[0];
    if (loreImage) {
      spiritBoardBack.nameImage.img = loreImage.getAttribute("src");
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
    Lib.downloadHTML(generateHTML(spiritBoardBack), htmlFileName);
  }

  function handleTextFileInput(event) {
    const file = event.target.files.item(0);
    if (file) {
      let url = URL.createObjectURL(file);
      loadHTMLFromURL(url).finally(() => {
        URL.revokeObjectURL(url);
      });
    }
  }

  function clearAllFields() {
    if (
      window.confirm("Are you sure? This permanently clears all fields in Spirit Board Lore Side.")
    ) {
      spiritBoardBack = {
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
      reloadPreview();
    }
  }

  function showInstructions() {
    isShowingInstructions = true;
    instructionsSource =
      "https://neubee.github.io/spirit-island-builder/instructions#spirit-board-lore-side";
  }

  function screenshotSetUp() {
    const fileNames = [
      spiritBoardBack.nameImage.name.replaceAll(" ", "_") + "_SpiritBoardBack.png",
    ];
    const elementNamesInIframe = ["board"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }
</script>

<PreviewFrame
  id="lore-preview"
  baseURI="/template/MyCustomContent/MySpirit/"
  bind:this={previewFrame}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/board_lore.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/board_lore.js"></script>
  </svelte:fragment>
</PreviewFrame>
<div class="field has-addons mb-2">
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
  <button class="button is-success  mr-1" on:click={exportSpiritBoardBack}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" on:click={reloadPreview}>Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameArtLore bind:spiritBoardBack />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <SetupPlaystyleComplexityPowers bind:spiritBoardBack />
  </div>
</div>
