<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame.svelte";

  import NameLossAndEscalation from "./name-loss-escalation.svelte";
  import AdversaryLevels from "./adversary-levels.svelte";

  export let adversary;
  export let isShowingInstructions;
  export let instructionsSource;

  let adversaryFrame;
  let previewFrame;
  let previewDoc;
  let previewFrameSrc = "/template/MyCustomContent/MyAdversary/adversary.html";
  if (adversary.demoBoardWasLoaded) {
    previewFrameSrc = "/template/MyCustomContent/MyAdversary/adversary_blank.html";
  }

  onMount(() => {
    adversaryFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    var localFrame = adversaryFrame;
    var localObject = adversary;

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
    adversary[event.target.id].isVisible = !adversary[event.target.id].isVisible;
  }

  function reloadPreview() {
    console.log("Updating Preview Adversary (f=setBoardValues)");
    setBoardValues(adversary);
    previewFrame.copyHTMLFrom(adversaryFrame.contentDocument);
    previewFrame.startMain();
  }

  function setBoardValues(adversary) {
    if (adversaryFrame) {
      //Set Adversary Name, Diffuclty and Flag Image
      const adversaryHeader = adversaryFrame.contentDocument.querySelectorAll("quick-adversary")[0];

      adversaryHeader.setAttribute("name", adversary.nameLossEscalation.name);
      adversaryHeader.setAttribute("base-difficulty", adversary.nameLossEscalation.baseDif);
      adversaryHeader.setAttribute("flag-image", adversary.nameLossEscalation.flagImg);

      //Set Loss Condition
      const lossConditionHeader =
        adversaryFrame.contentDocument.querySelectorAll("loss-condition")[0];
      lossConditionHeader.setAttribute("name", adversary.nameLossEscalation.lossCondition.name);
      lossConditionHeader.setAttribute("rules", adversary.nameLossEscalation.lossCondition.effect);

      //Set Escalation
      const escalationHeader =
        adversaryFrame.contentDocument.querySelectorAll("escalation-effect")[0];
      escalationHeader.setAttribute("name", adversary.nameLossEscalation.escalation.name);
      escalationHeader.setAttribute("rules", adversary.nameLossEscalation.escalation.effect);

      //Set Levels
      adversary.levelSummary.levels.forEach((level, i) => {
        var HTMLlevel = adversaryFrame.contentDocument.querySelectorAll("level-" + (i + 1))[0];
        HTMLlevel.setAttribute("name", level.name);
        HTMLlevel.setAttribute("difficulty", level.difficulty);
        HTMLlevel.setAttribute("fear-cards", level.fearCards);
        HTMLlevel.setAttribute("rules", level.effect);
      });
    }
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
      var HTMLLevel = htmlElement.querySelectorAll("level-" + (i + 1))[0];
      adversary.levelSummary.levels[i].name = HTMLLevel.getAttribute("name");
      adversary.levelSummary.levels[i].difficulty = HTMLLevel.getAttribute("difficulty");
      adversary.levelSummary.levels[i].fearCards = HTMLLevel.getAttribute("fear-cards");
      adversary.levelSummary.levels[i].effect = HTMLLevel.getAttribute("rules");
    }
  }

  function exportAdversary() {
    setBoardValues(adversary);
    const element = document
      .getElementById("adversary-mod-frame")
      .contentWindow.document.getElementsByTagName("html")[0];
    const htmlFileName = adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_Adversary.html";
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

<h5 class="title is-5 mb-0">Adversary</h5>
<!-- <h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview
  <span on:click={showOrHideBoard}>
    {#if adversary.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6> -->
<PreviewFrame
  id="adversary-preview"
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
    <NameLossAndEscalation bind:adversary {showOrHideSection} />
  </div>
  <div class="column pt-0">
    <AdversaryLevels bind:adversary {showOrHideSection} />
  </div>
</div>

<div id="adversary-holder">
  <iframe
    bind:this={adversaryFrame}
    src="/template/MyCustomContent/MyAdversary/adversary_noJS.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="adversary-mod-frame" />
</div>
