<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import { downloadHTML } from "$lib/download";
  import { dev } from "$app/environment";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import examples from "./examples.json";
  import NameLossAndEscalation from "./name-loss-escalation.svelte";
  import AdversaryLevels from "./adversary-levels.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import Examples from "$lib/example-modal.svelte";

  export let adversary;
  export let emptyAdversary;
  export let customIcons;

  let exampleModal;
  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  function hideAll() {
    adversary.nameLossEscalation.isVisible = false;
    adversary.levelSummary.isVisible = false;
    customIcons.isVisible = false;
  }

  const demoURL = "/template/MyCustomContent/MyAdversary/THE_IBERIAN_UNION_Adversary.html";
  function onLoad() {
    if (adversary.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        adversary.demoBoardWasLoaded = true;
        emptyAdversary.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview Adversary (f=generateHTML)");
    previewFrame.copyHTMLFrom(generateHTML(adversary)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(adversary) {
    const fragment = new DocumentFragment();

    //Set Adversary Name, Diffuclty and Flag Image
    const adversaryHeader = document.createElement("quick-adversary");
    adversaryHeader.setAttribute("name", adversary.nameLossEscalation.name);
    adversaryHeader.setAttribute("base-difficulty", adversary.nameLossEscalation.baseDif);
    adversaryHeader.setAttribute("flag-image", adversary.nameLossEscalation.flagImg);
    fragment.append(adversaryHeader);

    //Set Loss Condition
    const lossConditionHeader = document.createElement("loss-condition");
    lossConditionHeader.setAttribute("name", adversary.nameLossEscalation.lossCondition.name);
    lossConditionHeader.setAttribute("rules", adversary.nameLossEscalation.lossCondition.effect);
    adversaryHeader.append(lossConditionHeader);

    //Set Escalation
    const escalationHeader = document.createElement("escalation-effect");
    escalationHeader.setAttribute("name", adversary.nameLossEscalation.escalation.name);
    escalationHeader.setAttribute("rules", adversary.nameLossEscalation.escalation.effect);
    adversaryHeader.append(escalationHeader);

    //Set Levels
    adversary.levelSummary.levels.forEach((level, i) => {
      let HTMLlevel = document.createElement("level-" + (i + 1));
      HTMLlevel.setAttribute("name", level.name);
      HTMLlevel.setAttribute("difficulty", level.difficulty);
      HTMLlevel.setAttribute("fear-cards", level.fearCards);
      HTMLlevel.setAttribute("rules", level.effect);
      if (level.hasRule2) {
        HTMLlevel.setAttribute("name2", level.name2);
        HTMLlevel.setAttribute("rules2", level.effect2);
      }
      adversaryHeader.append(HTMLlevel);
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
    console.log("Loading adversary into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    //Load Adversary Name, Base Difficulty and Flag Image
    adversary = JSON.parse(JSON.stringify(emptyAdversary));

    const adversaryHeader = htmlElement.querySelectorAll("quick-adversary")[0];
    adversary.nameLossEscalation.name = adversaryHeader.getAttribute("name");
    adversary.nameLossEscalation.baseDif = adversaryHeader.getAttribute("base-difficulty");
    adversary.nameLossEscalation.flagImg = Lib.maybeResolveURL(
      adversaryHeader.getAttribute("flag-image"),
      baseURI
    );

    //Load Loss Condition
    const lossConditionHeader = htmlElement.querySelectorAll("loss-condition")[0];
    adversary.nameLossEscalation.lossCondition.name = lossConditionHeader.getAttribute("name");
    adversary.nameLossEscalation.lossCondition.effect = lossConditionHeader.getAttribute("rules");

    //Load Escalation
    const escalationHeader = htmlElement.querySelectorAll("escalation-effect")[0];
    adversary.nameLossEscalation.escalation.name = escalationHeader.getAttribute("name");
    adversary.nameLossEscalation.escalation.effect = escalationHeader.getAttribute("rules");

    //Load Levels
    for (let i = 0; i < 6; i++) {
      let HTMLLevel = htmlElement.querySelectorAll("level-" + (i + 1))[0];
      adversary.levelSummary.levels[i].name = HTMLLevel.getAttribute("name");
      adversary.levelSummary.levels[i].difficulty = HTMLLevel.getAttribute("difficulty");
      adversary.levelSummary.levels[i].fearCards = HTMLLevel.getAttribute("fear-cards");
      adversary.levelSummary.levels[i].effect = HTMLLevel.getAttribute("rules");
      adversary.levelSummary.levels[i].name2 = HTMLLevel.getAttribute("name2");
      adversary.levelSummary.levels[i].effect2 = HTMLLevel.getAttribute("rules2");
      if (HTMLLevel.getAttribute("name2")) {
        adversary.levelSummary.levels[i].hasRule2 = true;
      }
    }

    //Custom Icons
    if (adversary.demoBoardWasLoaded) {
      const adversaryStyle = htmlElement.querySelectorAll("style")[0];
      customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
      if (adversaryStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = adversaryStyle.textContent.match(regExp);
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

  function exportAdversary() {
    const htmlFileName = adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_Adversary.html";
    downloadHTML(generateHTML(adversary), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Adversary.")) {
      adversary = JSON.parse(JSON.stringify(emptyAdversary));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_Adversary.png"];
    const elementNamesInIframe = ["adversary"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("adversary")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }

  function printToPDF(pageType = "letter") {
    const fileNames = [adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_Adversary.pdf"];
    const elementNamesInIframe = ["adversary"];
    previewFrame.getPDF(fileNames, elementNamesInIframe, pageType, 6, 4);
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("adversary")[0];
    spiritBoard.classList.add("printer-clean");
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameLossAndEscalation bind:adversary />
    <AdversaryLevels bind:adversary />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <PreviewFrame id="adversary-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/adversary.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/adversary.js"></script>
      </svelte:fragment>
    </PreviewFrame>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-info js-modal-trigger mr-1" on:click={exampleModal.open}>
        Examples
      </button>
      <InstructionsLink class="button is-info mr-1" anchor="adversary" />
      <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadButton>
      <button class="button is-success  mr-1" on:click={exportAdversary}> Save </button>
      <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
      <button class="button is-warning  mr-1" on:click={reloadPreview}>Update Preview</button>
      <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
        >Toggle Board Size</button>
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
<Examples
  bind:this={exampleModal}
  {loadExample}
  title="Load Examples & Official Adversaries"
  {examples} />
