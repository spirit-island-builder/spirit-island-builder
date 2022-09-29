<script>
  import { onMount } from "svelte";
  export let adversary;
  import NameLossAndEscalation from "./name-loss-escalation.svelte";
  import AdversaryLevels from "./adversary-levels.svelte";
  // import NameAndArt from "./name-and-art.svelte";
  // import SpecialRules from "./special-rules.svelte";

  let adversaryFrame;
  onMount(() => {
    adversaryFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    if (adversaryFrame) {
      if (adversary.demoBoardWasLoaded === false) {
        setTimeout(() => {
          readHTML(adversaryFrame.contentDocument);
          adversary.demoBoardWasLoaded = true;
        }, 200);
      } else {
        setTimeout(() => {
          reloadPreview();
        }, 200);
      }
    }
  }

  function showOrHideSection(event) {
    adversary[event.target.id].isVisible = !adversary[event.target.id].isVisible;
  }

  function showOrHideBoard() {
    if (document.getElementById("adversaryBoardWrap").style.display == "none") {
      document.getElementById("adversaryBoardWrap").style.display = "block";
    } else {
      document.getElementById("adversaryBoardWrap").style.display = "none";
    }
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=setBoardValues)");
    setBoardValues(adversary);
    console.log("Reloading Preview (f=copyHTML)");
    copyHTML();
    document.getElementById("adversary-scaled-frame").contentWindow.startMain();
  }

  function copyHTML() {
    console.log("Copying HTML from Form to Preview (f=copyHTML)");
    var modFrame = document.getElementById("adversary-mod-frame");
    modFrame.doc = document.getElementById("adversary-mod-frame").contentWindow.document;
    modFrame.head = modFrame.doc.getElementsByTagName("head")[0];
    modFrame.body = modFrame.doc.getElementsByTagName("body")[0];
    var scaledFrame = document.getElementById("adversary-scaled-frame");
    scaledFrame.doc = document.getElementById("adversary-scaled-frame").contentWindow.document;
    scaledFrame.head = scaledFrame.doc.getElementsByTagName("head")[0];
    scaledFrame.body = scaledFrame.doc.getElementsByTagName("body")[0];

    let bodyClone;
    bodyClone = document
      .getElementById("adversary-mod-frame")
      .contentWindow.document.body.cloneNode(true);
    document.getElementById("adversary-scaled-frame").contentWindow.document.body = bodyClone;
    let headClone = modFrame.head.cloneNode(true);
    scaledFrame.head.parentElement.replaceChild(headClone, scaledFrame.head);
  }

  function setBoardValues(adversary) {
    if (adversaryFrame) {
      //Set Adversary Name, Diffuclty and Flag Image
      const adversaryHeader = adversaryFrame.contentDocument.querySelectorAll("quick-adversary")[0];
      console.log(adversaryFrame);
      console.log(adversaryFrame.contentDocument);
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
    console.log("Loading default spirit board into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    if (adversaryFrame) {
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
  }

  let adversaryFrameLarge = false;
  function toggleSize() {
    var displayFrame = document.getElementById("adversary-scaled-frame");
    var displayWrap = document.getElementById("adversaryBoardWrap");
    if (!adversaryFrameLarge) {
      displayFrame.style.webkitTransform = "scale(1.55)";
      displayWrap.style.height = "845px";
    } else {
      displayFrame.style.webkitTransform = "scale(1)";
      displayWrap.style.height = "550px";
    }
    adversaryFrameLarge = !adversaryFrameLarge;
  }

  function exportAdversary() {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          document
            .getElementById("adversary-mod-frame")
            .contentWindow.document.getElementsByTagName("html")[0].innerHTML
        )
    );
    console.log(
      document
        .getElementById("adversary-mod-frame")
        .contentWindow.document.getElementsByTagName("html")[0].innerHTML
    );
    element.setAttribute(
      "download",
      adversary.nameLossEscalation.name.replaceAll(" ", "_") + "_adversary.html"
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
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
    }
  }

  function clearAllFields() {
    adversary = {
      prop: "value",
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
  }
</script>

<h5 class="title is-5">Adversary</h5>
<h6
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
</h6>
<div id="adversaryBoardWrap">
  <iframe
    src="/template/MyCustomContent/MyAdversary/adversary.html"
    height="600"
    width="100%"
    id="adversary-scaled-frame"
    title="yay" />
</div>
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
        <span class="file-label"> Load Adversary file </span>
      </span>
    </label>
  </div>
  <button class="button is-success  mr-1" on:click={exportAdversary}
    >Download Adversary file</button>
  <button class="button is-info  mr-1" on:click={reloadPreview}>Generate Adversary</button>
  <button class="button is-warning mr-1" on:click={toggleSize}>Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameLossAndEscalation bind:adversary {showOrHideSection} />
  </div>
  <div class="column pt-0">
    <AdversaryLevels bind:adversary {showOrHideSection} />
  </div>
</div>
<article class="message is-small mb-1">
  <div class="message-body p-1">
    See <a
      href="https://github.com/neubee/spirit-island-builder/blob/dev/docs/instructions.md#adversary"
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