<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";

  import NameLossAndEscalation from "./name-loss-escalation.svelte";
  import AdversaryLevels from "./adversary-levels.svelte";

  export let adversary;
  export let isShowingInstructions;
  export let instructionsSource;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyAdversary/adversary_noJS.html";
  function onLoad() {
    if (adversary.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        adversary.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview Adversary (f=setBoardValues)");
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
      adversaryHeader.append(HTMLlevel);
    });

    return fragment;
  }

  function readHTML(htmlElement) {
    console.log("Loading adversary into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    //Load Adversary Name, Base Difficulty and Flag Image
    const adversaryHeader = htmlElement.querySelectorAll("quick-adversary")[0];
    adversary.nameLossEscalation.name = adversaryHeader.getAttribute("name");
    adversary.nameLossEscalation.baseDif = adversaryHeader.getAttribute("base-difficulty");
    adversary.nameLossEscalation.flagImg = adversaryHeader.getAttribute("flag-image");

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
    }
  }

  function exportAdversary() {
    const htmlFileName = adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_Adversary.html";
    Lib.downloadHTML(generateHTML(adversary), htmlFileName);
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
    if (window.confirm("Are you sure? This permanently clears all fields in Adversary.")) {
      adversary = {
        prop: "value",
        demoBoardWasLoaded: true,
        previewBoard: {
          isVisible: false,
        },
        nameLossEscalation: {
          isVisible: false,
          name: "",
          baseDif: "",
          flagImg: "",
          lossCondition: {
            name: "",
            effect: "",
          },
          escalation: {
            name: "",
            effect: "",
          },
        },
        levelSummary: {
          isVisible: false,
          levels: [
            {
              id: 1,
              name: "",
              difficulty: "",
              fearCards: "",
              effect: "",
            },
            {
              id: 2,
              name: "",
              difficulty: "",
              fearCards: "",
              effect: "",
            },
            {
              id: 3,
              name: "",
              difficulty: "",
              fearCards: "",
              effect: "",
            },
            {
              id: 4,
              name: "",
              difficulty: "",
              fearCards: "",
              effect: "",
            },
            {
              id: 5,
              name: "",
              difficulty: "",
              fearCards: "",
              effect: "",
            },
            {
              id: 6,
              name: "",
              difficulty: "",
              fearCards: "",
              effect: "",
            },
          ],
        },
      };
      reloadPreview();
    }
  }

  function showInstructions() {
    isShowingInstructions = true;
    instructionsSource = "https://neubee.github.io/spirit-island-builder/instructions#adversary";
  }

  function screenshotSetUp() {
    const fileNames = [adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_Adversary.png"];
    const elementNamesInIframe = ["adversary"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }
</script>

<PreviewFrame
  id="adversary-preview"
  baseURI="/template/MyCustomContent/MyAdversary/"
  bind:this={previewFrame}
  on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/adversary.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/adversary.js"></script>
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
  <button class="button is-success  mr-1" on:click={exportAdversary}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" on:click={reloadPreview}>Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameLossAndEscalation bind:adversary />
  </div>
  <div class="column pt-0">
    <AdversaryLevels bind:adversary />
  </div>
</div>
