<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame.svelte";

  import NameArtLore from "./name-art-lore.svelte";
  import SetupPlaystyleComplexityPowers from "./setup-playstyle-complexity-powers.svelte";
  import CustomIcons from "../custom-icons.svelte";

  export let spiritBoardBack;
  export let customIcons;
  export let isShowingInstructions;
  export let instructionsSource;

  let loreFrame;
  let previewFrame;
  let previewDoc;
  let previewFrameSrc = "/template/MyCustomContent/MySpirit/board_lore.html";
  if (spiritBoardBack.demoBoardWasLoaded) {
    previewFrameSrc = "/template/MyCustomContent/MySpirit/board_lore_blank.html";
  }

  onMount(() => {
    loreFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    let localFrame = loreFrame;
    let localObject = spiritBoardBack;

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
        }, 300);
      }
    }
  }

  function reloadPreview() {
    console.log("Updating Preview Lore Side Board (f=setBoardValues)");
    setBoardValues(spiritBoardBack);
    previewFrame.copyHTMLFrom(loreFrame.contentDocument);
    previewFrame.startMain();
  }

  function setBoardValues(spiritBoardBack) {
    if (loreFrame) {
      const loreBoardHTML = loreFrame.contentDocument.querySelectorAll("board")[0];

      //Set Spirit Name
      const loreName = loreBoardHTML.querySelectorAll("spirit-name")[0];
      loreName.innerHTML = spiritBoardBack.nameImage.name;

      //Set Spirit Image
      const loreImage = loreBoardHTML.querySelectorAll("img")[0];
      loreImage.setAttribute("src", spiritBoardBack.nameImage.img);
      if (spiritBoardBack.nameImage.scale) {
        loreImage.setAttribute("scale", spiritBoardBack.nameImage.scale);
      }

      //Set Lore Description
      const loreDescription = loreBoardHTML.querySelectorAll("lore-description")[0];
      loreDescription.innerHTML = spiritBoardBack.lore.loreText;

      //Set Lore Setup
      const loreSetup = loreBoardHTML.querySelectorAll("setup-description")[0];
      loreSetup.innerHTML = spiritBoardBack.setup.setupText;

      //Set Lore Play Style
      const lorePlayStyle = loreBoardHTML.querySelectorAll("play-style-description")[0];
      lorePlayStyle.innerHTML = spiritBoardBack.playStyle.playStyleText;

      //Set Complexity
      const complexityHeader = loreBoardHTML.querySelectorAll("complexity")[0];
      complexityHeader.setAttribute("value", spiritBoardBack.complexity.complexityValue);
      complexityHeader.setAttribute("descriptor", spiritBoardBack.complexity.complexityDescriptor);

      //Set Summary of Powers
      const summaryPowersHeader = loreBoardHTML.querySelectorAll("summary-of-powers")[0];
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

      //Set Custom Icons
      let spiritStyle = loreFrame.contentDocument.querySelectorAll("style")[0];
      if (!spiritStyle) {
        const spiritHead = loreFrame.contentDocument.querySelectorAll("head")[0];
        spiritStyle = loreFrame.contentDocument.createElement("style");
        spiritHead.appendChild(spiritStyle);
      }
      let customIconText = "";
      customIcons.icons.forEach((icon) => {
        customIconText +=
          "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
      });
      spiritStyle.textContent = customIconText;
    }
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
    setBoardValues(spiritBoardBack);
    let element = document
      .getElementById("lore-mod-frame")
      .contentWindow.document.getElementsByTagName("html")[0];
    const htmlFileName = spiritBoardBack.nameImage.name.replaceAll(" ", "_") + "_SpiritLore.html";
    Lib.downloadString("data:text/html;charset=utf-8", element.innerHTML, htmlFileName);
  }

  function handleTextFileInput(event) {
    let dummyEl = document.createElement("html");
    const file = event.target.files.item(0);

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
  src={previewFrameSrc}
  bind:this={previewFrame}
  bind:document={previewDoc} />
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
<div id="lore-holder">
  <iframe
    bind:this={loreFrame}
    src="/template/MyCustomContent/MySpirit/board_lore_website.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="lore-mod-frame" />
</div>
