<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import { downloadHTML } from "$lib/download";
  import { dev } from "$app/environment";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  // import examples from "./examples.json";
  import FrontScenario from "./front-scenario.svelte";
  import NameDifficultyImage from "./name-difficulty-image.svelte";
  import BackScenario from "./back-scenario.svelte";
  import CustomIcons from "../custom-icons.svelte";
  // import InstructionsLink from "$lib/instructions/link.svelte";
  // import Examples from "$lib/example-modal.svelte";

  export let scenario;
  export let emptyScenario;

  // let exampleModal;
  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  // function hideAll() {
  //   scenario.info.isVisible = false;
  //   scenario.scenarioFront.isVisible = false;
  //   scenario.scenarioBack.isVisible = false;
  //   customIcons.isVisible = false;
  // }

  const demoURL = "/template/MyCustomContent/MyScenario/The_Great_River_Scenario.html";

  function onLoad() {
    if (scenario.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        scenario.demoBoardWasLoaded = true;
        emptyScenario.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview Scenario (f=generateHTML)");
    previewFrame.copyHTMLFrom(generateHTML(scenario)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(scenario) {
    const fragment = new DocumentFragment();

    console.log("generatingHTML with...");
    console.log(scenario);
    //Set Scenario Name, Diffuclty and Flag Image
    const scenarioHeader = document.createElement("quick-scenario");
    scenarioHeader.setAttribute("name", scenario.info.name);
    scenarioHeader.setAttribute("difficulty", scenario.info.difficulty);
    scenarioHeader.setAttribute("image", scenario.info.image);
    fragment.append(scenarioHeader);

    //Build Scenario
    const scenarioFront = document.createElement("scenario-front");
    const scenarioRight = document.createElement("scenario-right");
    const scenarioBack = document.createElement("scenario-back");
    const backLeft = document.createElement("back-left");
    const backRight = document.createElement("back-right");
    fragment.append(scenarioFront);
    scenarioFront.append(scenarioRight);
    fragment.append(scenarioBack);
    scenarioBack.append(backLeft);
    scenarioBack.append(backRight);

    //Front panels
    const lorePanel = document.createElement("lore-panel");
    if (scenario.scenarioFront.lore) {
      console.log("adding lore");
      lorePanel.innerHTML = scenario.scenarioFront.lore;
    }
    scenarioRight.append(lorePanel);
    scenario.scenarioFront.panels.forEach((panel, i) => {
      let panelHTML = document.createElement("panel");
      scenarioRight.appendChild(panelHTML);
      console.log("writing panel HTML " + i);
      panel.comments.forEach((comment, j) => {
        let commentHTML = document.createElement("comment");
        if (comment.type) {
          commentHTML.setAttribute("type", comment.type);
        }
        commentHTML.innerHTML = comment.text;
        if (comment.imgsrc) {
          commentHTML.setAttribute("imgsrc", comment.imgsrc);
        }
        panelHTML.appendChild(commentHTML);
        console.log("writing comment HTML " + j);
      });
    });

    //Back left comments
    scenario.scenarioBack.left.comments.forEach((comment) => {
      let commentHTML = document.createElement("comment");
      if (comment.type) {
        commentHTML.setAttribute("type", comment.type);
      }
      if (comment.imgsrc) {
        commentHTML.setAttribute("imgsrc", comment.imgsrc);
      }
      commentHTML.innerHTML = comment.text;
      backLeft.appendChild(commentHTML);
    });

    //Back right comments
    scenario.scenarioBack.right.comments.forEach((comment) => {
      let commentHTML = document.createElement("comment");
      if (comment.type) {
        commentHTML.setAttribute("type", comment.type);
      }
      if (comment.imgsrc) {
        commentHTML.setAttribute("imgsrc", comment.imgsrc);
      }
      commentHTML.innerHTML = comment.text;
      backRight.appendChild(commentHTML);
    });

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(scenario.customIcons);
    const scenarioStyle = document.createElement("style");
    fragment.prepend(scenarioStyle);
    scenarioStyle.textContent = customIconText;

    return fragment;
  }

  function readHTML(htmlElement, baseURI) {
    console.log("Loading scenario into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    //Load Scenario Name, Difficulty and Image
    scenario = JSON.parse(JSON.stringify(emptyScenario));

    const scenarioHeader = htmlElement.querySelectorAll("quick-scenario")[0];
    scenario.info.name = scenarioHeader.getAttribute("name");
    scenario.info.difficulty = scenarioHeader.getAttribute("difficulty");
    scenario.info.image = Lib.maybeResolveURL(scenarioHeader.getAttribute("image"), baseURI);

    //Load Comments
    const scenarioFront = htmlElement.querySelectorAll("scenario-front")[0];
    const backLeft = htmlElement.querySelectorAll("back-left")[0];
    const backRight = htmlElement.querySelectorAll("back-right")[0];

    //Front Lore & Comments
    const lorePanel = scenarioFront.querySelectorAll("lore-panel")[0];
    if (lorePanel) {
      scenario.scenarioFront.lore = lorePanel.innerHTML;
    }
    scenario.scenarioFront.panels.splice(0, scenario.scenarioFront.panels.length); //Clear the Form first
    const frontPanels = scenarioFront.querySelectorAll("panel");
    frontPanels.forEach((panel, i) => {
      scenario.scenarioFront.panels.push({
        id: scenario.scenarioFront.panels.length,
        comments: [],
      });
      console.log("creating panel..." + i);
      const comments = panel.querySelectorAll("comment");
      comments.forEach((comment, j) => {
        scenario.scenarioFront.panels[i].comments.push({
          id: scenario.scenarioFront.panels[i].comments.length,
          type: comment.getAttribute("type"),
          text: comment.innerHTML,
          imgsrc: comment.getAttribute("imgsrc") || "",
        });
        console.log("creating comment..." + j);
      });
    });

    //Back Left Comments
    const backLeftComments = backLeft.querySelectorAll("comment");
    scenario.scenarioBack.left.comments.splice(0, scenario.scenarioBack.left.comments.length); //Clear the Form first
    backLeftComments.forEach((comment) => {
      scenario.scenarioBack.left.comments.push({
        id: scenario.scenarioBack.left.comments.length,
        type: comment.getAttribute("type"),
        text: comment.innerHTML,
        imgsrc: comment.getAttribute("imgsrc") || "",
      });
      scenario = scenario;
    });

    //Back Right Comments
    const backRightComments = backRight.querySelectorAll("comment");
    scenario.scenarioBack.right.comments.splice(0, scenario.scenarioBack.right.comments.length); //Clear the Form first
    backRightComments.forEach((comment) => {
      scenario.scenarioBack.right.comments.push({
        id: scenario.scenarioBack.right.comments.length,
        type: comment.getAttribute("type"),
        text: comment.innerHTML,
        imgsrc: comment.getAttribute("imgsrc") || "",
      });
      scenario = scenario;
    });

    console.log(scenario);

    //Custom Icons
    scenario.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      scenario.customIcons,
      document.baseURI
    );
  }

  function exportScenario() {
    const htmlFileName = scenario.info.name.replaceAll(" ", "_") + "_Scenario.html";
    downloadHTML(generateHTML(scenario), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Scenario.")) {
      scenario = JSON.parse(JSON.stringify(emptyScenario));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [
      scenario.info.name.replaceAll(" ", "_") + "_ScenarioFront.png",
      scenario.info.name.replaceAll(" ", "_") + "_ScenarioBack.png",
    ];
    const elementNamesInIframe = ["scenario-front", "scenario-back"];

    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("scenario")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }

  function printToPDF(pageType = "letter") {
    const fileNames = [scenario.info.name.replaceAll(" ", "_") + "_Scenario.pdf"];
    const elementNamesInIframe = [];
    elementNamesInIframe.push("scenario-front");
    elementNamesInIframe.push("scenario-back");
    previewFrame.getPDF(fileNames, elementNamesInIframe, pageType, 6, 4, false, "portrait");
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("scenario")[0];
    spiritBoard.classList.add("printer-clean");
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameDifficultyImage bind:scenario />
    <FrontScenario bind:scenario />
    <BackScenario bind:scenario />
    <CustomIcons customIcons={scenario.customIcons} />
  </div>
  <div class="column pt-0">
    <PreviewFrame id="scenario-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/scenario.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/scenario.js"></script>
      </svelte:fragment>
    </PreviewFrame>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <LoadButton
        accept=".html"
        class="button is-success mt-1 mr-1"
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadButton>
      <button class="button is-success mt-1 mr-1" on:click={exportScenario}> Save </button>
      <button class="button is-warning mt-1 mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <button class="button is-warning mt-1 mr-1" on:click={previewFrame.toggleSize}
        >Toggle Board Size</button>
      <button class="button is-danger mt-1 mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-success mt-1 mr-1" on:click={screenshotSetUp}>Download Image</button>
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
    </div>
    <div class="field has-addons mt-1 mb-0 is-flex-wrap-wrap">
      {#if dev}
        <LoadButton
          accept="image/png, image/jpeg"
          class="button is-file-load is-small"
          loadDataURL={(url) => {
            overlayImage = url;
          }}>Load Overlay</LoadButton>
        <button class="button is-danger mr-1" on:click={addOverlay}>Add Overlay</button>
      {/if}
    </div>
  </div>
</div>
<!-- <Examples
  bind:this={exampleModal}
  {loadExample}
  title="Load Examples & Official Adversaries"
  {examples} /> -->
