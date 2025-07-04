<script>
  import { onMount } from "svelte";
  import jsone from "json-e";

  import * as Lib from "../lib";
  import { downloadHTML, downloadString } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import { dev } from "$app/environment";

  import NameReplacements from "./name-replacements.svelte";
  import AspectEffects from "./aspect-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";

  import examples from "./examples.json";
  import Examples from "$lib/example-modal.svelte";

  import aspectJSONTemplate from "./tts-aspect.json";

  import { createTTSSave, ttsSaveMIMEType, getThresholdTTSJSON } from "$lib/tts.js";

  let exampleModal;

  export let aspect;
  export let emptyAspect;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyAspect/Lair_Aspect.html";
  function onLoad() {
    if (aspect.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        aspect.demoBoardWasLoaded = true;
        emptyAspect.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(aspect)).then(() => {
      previewFrame.startMain();
    });
    // if(aspect.profile){
    //   previewFrame.classList.add('portrait')
    // }else{
    //   previewFrame.classList.remove('portrait')
    // }
  }

  const openEditorHeading = (e) => {
    let outcome;
    console.log("openeditorheading");
    e.stopPropagation(); // we stop the event from propegating up to 'board', which would cause this to trigger twice
    if (e.target.tagName === "ASPECT-CONTAINER") {
      outcome = !aspect.aspectEffects.isVisible;
      hideAll();
      aspect.aspectEffects.isVisible = outcome;
    }
    if (e.target.tagName === "ASPECT-NAME") {
      outcome = !aspect.nameReplacements.isVisible;
      hideAll();
      aspect.nameReplacements.isVisible = outcome;
    }
    if (e.target.tagName === "ASPECT-SUBTEXT") {
      outcome = !aspect.nameReplacements.isVisible;
      hideAll();
      aspect.nameReplacements.isVisible = outcome;
    }
  };

  function generateHTML(aspect) {
    const fragment = new DocumentFragment();

    let aspectHTML = document.createElement("aspect");
    fragment.append(aspectHTML);

    //Set Aspect Name
    let aspectName = document.createElement("aspect-name");
    aspectName.innerHTML = aspect.nameReplacements.aspectName;
    aspectHTML.appendChild(aspectName);

    //Profile or Landscape
    if (aspect.profile) {
      aspectHTML.setAttribute("profile", "");
    }

    //Set Replacement
    aspect.nameReplacements.replacements.forEach((replacement) => {
      let aspectReplacementHTML = document.createElement("aspect-subtext");
      aspectHTML.appendChild(aspectReplacementHTML);
      let replacementFullText = replacement.aspectRelacement;
      if (replacement.rulesReplaced) {
        replacementFullText += ": <i>" + replacement.rulesReplaced + "</i>";
      }
      if (aspectReplacementHTML) {
        aspectReplacementHTML.innerHTML = replacementFullText;
      }
    });

    //Set Complexity
    if (aspect.nameReplacements.complexity) {
      const complexityHTML = document.createElement("complexity");
      aspectHTML.appendChild(complexityHTML);
      if (complexityHTML) {
        complexityHTML.setAttribute("value", aspect.nameReplacements.complexity);
      } else {
        const newComplexityHTML = document.createElement("complexity");
        newComplexityHTML.setAttribute("value", aspect.nameReplacements.complexity);
        aspectHTML.appendChild(newComplexityHTML);
      }
    }

    //Set Aspect Back
    if (aspect.nameReplacements.hasBack) {
      let aspectBackHTML = document.createElement("aspect-back");
      fragment.append(aspectBackHTML);
      aspectBackHTML.setAttribute("spirit-name", aspect.nameReplacements.spiritName);
      aspectBackHTML.setAttribute("src", aspect.nameReplacements.spiritImage);
      if (aspect.profile) {
        aspectBackHTML.classList.add("profile");
      }
    }

    //Set Special Rules
    const aspectRulesContainer = document.createElement("aspect-container");
    aspectHTML.appendChild(aspectRulesContainer);

    aspect.aspectEffects.specialRules.rules.forEach((rule) => {
      let newRuleName = document.createElement("special-rules-subtitle");
      newRuleName.innerHTML = rule.name;
      let newRuleEffect = document.createElement("special-rule");
      newRuleEffect.innerHTML = rule.effect;
      aspectRulesContainer.appendChild(newRuleName);
      aspectRulesContainer.appendChild(newRuleEffect);
      if (rule.hasGrowth) {
        let growthGroupOutput = document.createElement("growth-group");
        let values = "";
        rule.growthActions.forEach((growthAction) => {
          values += growthAction.effect + ";";
        });
        growthGroupOutput.setAttribute("values", values.slice(0, -1));
        newRuleEffect.appendChild(growthGroupOutput);
      }
    });

    //Set Innate Powers
    aspect.aspectEffects.innatePowers.powers.forEach((power) => {
      let newInnatePower = document.createElement("quick-innate-power");
      newInnatePower.setAttribute("name", power.name);
      newInnatePower.setAttribute("speed", power.speed.toLowerCase());
      newInnatePower.setAttribute("range", power.range);
      newInnatePower.setAttribute("target", power.target);
      newInnatePower.setAttribute("target-title", power.targetTitle);
      if (power.note) {
        newInnatePower.setAttribute("note", power.note);
      } // may need to clear it?
      power.levels.forEach((level) => {
        let newLevel = document.createElement("level");
        newLevel.setAttribute("threshold", level.threshold);
        newLevel.innerHTML = level.effect;
        if (level.isLong) {
          newLevel.setAttribute("long", "");
        }
        newInnatePower.appendChild(newLevel);
      });
      aspectRulesContainer.appendChild(newInnatePower);
    });

    //Set Bonus Node
    if (aspect.aspectEffects.bonusNode.has) {
      let bonusNode = document.createElement("bonus-node");
      bonusNode.setAttribute("effect", aspect.aspectEffects.bonusNode.effect);
      aspectRulesContainer.appendChild(bonusNode);
    }

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(aspect.customIcons);
    const aspectStyle = document.createElement("style");
    fragment.prepend(aspectStyle);
    aspectStyle.textContent = customIconText;

    return fragment;
  }

  function readHTML(htmlElement, baseURI) {
    console.log("Loading aspect into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    aspect = JSON.parse(JSON.stringify(emptyAspect));

    const aspectHTML = htmlElement.querySelectorAll("aspect")[0];

    //Profile or Landscape
    if (aspectHTML.hasAttribute("profile")) {
      aspect.profile = true;
    }

    //Read Aspect Name
    const aspectName = aspectHTML.querySelectorAll("aspect-name")[0];
    aspect.nameReplacements.aspectName = aspectName.innerHTML.trim();

    //Read Replacement(s)
    aspect.nameReplacements.replacements.splice(0, aspect.nameReplacements.replacements.length); //Clear the Form first
    const aspectReplacementsHTML = aspectHTML.querySelectorAll("aspect-subtext");
    if (aspectReplacementsHTML) {
      aspectReplacementsHTML.forEach((replacement) => {
        aspect.nameReplacements.replacements.push({
          id: aspect.nameReplacements.replacements.length,
          aspectRelacement: replacement.innerHTML.split(":")[0],
          rulesReplaced: replacement.querySelectorAll("i")[0]?.innerHTML ?? "",
        });
        aspect = aspect;
      });
    }

    //Read Complexity
    const complexityHTML = aspectHTML.querySelectorAll("complexity")[0];
    if (complexityHTML) {
      aspect.nameReplacements.complexity = complexityHTML.getAttribute("value");
    }

    //Read Aspect Back
    const aspectBackHTML = htmlElement.querySelectorAll("aspect-back")[0];
    if (aspectBackHTML) {
      aspect.nameReplacements.spiritName = aspectBackHTML.getAttribute("spirit-name");
      aspect.nameReplacements.spiritImage = Lib.maybeResolveURL(
        aspectBackHTML.getAttribute("src"),
        baseURI
      );
      aspect.nameReplacements.hasBack = true;
    } else {
      aspect.nameReplacements.hasBack = false;
    }

    //Read Special Rules
    const specialRulesNames = aspectHTML.querySelectorAll("special-rules-subtitle");
    const specialRulesEffects = aspectHTML.querySelectorAll("special-rule");
    aspect.aspectEffects.specialRules.rules.splice(
      0,
      aspect.aspectEffects.specialRules.rules.length
    ); //Clear the Form first
    specialRulesNames.forEach((specialRulesName, j) => {
      console.log(specialRulesEffects[j]);
      let ruleGrowthGroup = specialRulesEffects[j].getElementsByTagName("growth-group")[0];
      if (ruleGrowthGroup) {
        console.log("removing child");
        ruleGrowthGroup = specialRulesEffects[j].removeChild(ruleGrowthGroup);
      }

      aspect.aspectEffects = Lib.addSpecialRule(
        aspect.aspectEffects,
        specialRulesName.innerHTML,
        specialRulesEffects[j].innerHTML.trim()
      );

      if (ruleGrowthGroup) {
        aspect.aspectEffects.specialRules.rules[j].hasGrowth = true;
        aspect.aspectEffects.specialRules.rules[j].growthActions = [];
        let values = ruleGrowthGroup.getAttribute("values").split(";");
        console.log(values);
        values.forEach((growthValue, k) => {
          console.log(growthValue);
          aspect.aspectEffects.specialRules.rules[j].growthActions.push({
            id: k,
            effect: growthValue,
          });
        });

        console.log(aspect);
      } else {
        aspect.aspectEffects.specialRules.rules[j].hasGrowth = false;
        aspect.aspectEffects.specialRules.rules[j].growthActions = [];
      }
      aspect = aspect;
    });

    //Read Innate Powers
    let innatePowers = htmlElement.querySelectorAll("quick-innate-power");
    aspect.aspectEffects.innatePowers.powers.splice(
      0,
      aspect.aspectEffects.innatePowers.powers.length
    ); //Clear the Form first
    if (innatePowers) {
      innatePowers.forEach((innatePower, k) => {
        aspect.aspectEffects = Lib.addInnatePower(
          aspect.aspectEffects,
          innatePower.getAttribute("name"),
          innatePower.getAttribute("speed"),
          innatePower.getAttribute("range"),
          innatePower.getAttribute("target"),
          innatePower.getAttribute("target-title"),
          innatePower.getAttribute("note")
        );
        let htmlLevels = innatePower.querySelectorAll("level");
        htmlLevels.forEach((htmlLevel) => {
          aspect.aspectEffects = Lib.addLevel(
            aspect.aspectEffects,
            k,
            htmlLevel.getAttribute("threshold"),
            htmlLevel.innerHTML.trim(),
            htmlLevel.hasAttribute("long")
          );
        });
      });
    }

    //Read Bonus Nodes
    let bonusNode = htmlElement.querySelectorAll("bonus-node")[0];
    aspect.aspectEffects.bonusNode.has = false;
    if (bonusNode) {
      aspect.aspectEffects.bonusNode.has = true;
      aspect.aspectEffects.bonusNode.effect = bonusNode.getAttribute("effect");
    }

    //Custom Icons
    aspect.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      aspect.customIcons,
      document.baseURI
    );
  }

  function exportAspect() {
    const htmlFileName = aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_Aspect.html";
    downloadHTML(generateHTML(aspect), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      aspect = JSON.parse(JSON.stringify(emptyAspect));
      reloadPreview();
    }
  }

  function screenshotSetUp(option = "for-image-download") {
    const fileNames = [
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_Aspect.png",
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_AspectBack.png",
    ];
    const elementNamesInIframe = ["aspect", "aspect-back"];

    previewFrame.takeScreenshot(fileNames, elementNamesInIframe, option);
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  function hideAll() {
    aspect.nameReplacements.isVisible = false;
    aspect.aspectEffects.isVisible = false;
    aspect.customIcons.isVisible = false;
  }

  async function downloadTTSJSON() {
    let previewFrameDoc = document.getElementById("preview-iframe").contentWindow.document;
    const aspectHTML = previewFrameDoc.querySelectorAll("aspect")[0];
    let LUAScript = "";
    let aspectUniqueName =
      aspect.nameReplacements.aspectName + "-" + aspect.nameReplacements.spiritName;

    // landscape vs portrait
    let isLandscape = !aspect.profile;
    console.log("isLandscape = " + isLandscape);

    // elements
    let nodeEffectText = aspect.aspectEffects.bonusNode.effect;
    console.log(nodeEffectText);
    console.log(nodeEffectText);
    const nameCounts = {};
    nodeEffectText.split("+").forEach(function (x) {
      nameCounts[x] = (nameCounts[x] || 0) + 1;
    });
    let namesList = Object.keys(nameCounts);
    let countList = Object.values(nameCounts);
    let elementCounts = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < namesList.length; i++) {
      if (namesList[i] === "sun") {
        elementCounts[0] = countList[i];
      }
      if (namesList[i] === "moon") {
        elementCounts[1] = countList[i];
      }
      if (namesList[i] === "fire") {
        elementCounts[2] = countList[i];
      }
      if (namesList[i] === "air") {
        elementCounts[3] = countList[i];
      }
      if (namesList[i] === "water") {
        elementCounts[4] = countList[i];
      }
      if (namesList[i] === "earth") {
        elementCounts[5] = countList[i];
      }
      if (namesList[i] === "plant") {
        elementCounts[6] = countList[i];
      }
      if (namesList[i] === "animal") {
        elementCounts[7] = countList[i];
      }
    }
    console.log(elementCounts);
    const elementCountTotal = elementCounts.reduce((partialSum, a) => partialSum + a, 0);
    console.log(elementCountTotal);
    if (elementCountTotal > 0) {
      LUAScript += "elements={" + elementCounts.toString() + "}\n";
      console.log(LUAScript);
    }

    // thresholds (see tts.js)
    let thresholds = getThresholdTTSJSON(aspectHTML);
    if (thresholds.length) {
      console.log("thresolds detected");
      LUAScript +=
        'function onLoad(saved_data)\n    if saved_data ~= "" then\n        local loaded_data = JSON.decode(saved_data)\n        self.setTable("thresholds", loaded_data.thresholds)\n    end\nend\n-- card loading end';
      console.log(LUAScript);
    }

    //default image
    let defaultImage = "https://i.imgur.com/jR8jpcD.png"; //vert
    // if(isLandscape){
    //   defaultImage = "https://i.imgur.com/knMsIXM.png"
    // }

    let aspectJSON = jsone(aspectJSONTemplate, {
      guid: aspect.nameReplacements.aspectName.replaceAll(" ", "_"),
      isLandscape: isLandscape,
      defaultImage: defaultImage,
      LUAScript: LUAScript,
      aspectUniqueName: aspectUniqueName,
      thresholds,
    });
    let ttsSave = createTTSSave([aspectJSON]);

    const jsonFileName = aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_TTS.json";
    downloadString(ttsSaveMIMEType, ttsSave, jsonFileName);
  }

  let overlayImage;
  function addOverlay() {
    console.log("adding overlay");
    console.log(overlayImage);
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let aspectDom = previewFrame.document.getElementsByTagName("aspect")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    aspectDom.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }

  function printToPDF(pageType = "letter") {
    let fileName = "";
    fileName = aspect.nameReplacements.aspectName.replaceAll(" ", "_");
    if (aspect.nameReplacements.spiritName) {
      fileName += aspect.nameReplacements.spiritName.replaceAll(" ", "_");
    }
    fileName += "_Aspect.pdf";

    const elementNamesInIframe = ["aspect", "aspect-back"];
    let w = 3.465;
    let h = 2.48;
    if (aspect.profile) {
      w = 2.48;
      h = 3.465;
    }
    previewFrame.getPDF(fileName, elementNamesInIframe, pageType, w, h);
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("aspect")[0];
    spiritBoard.classList.add("printer-clean");
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameReplacements bind:aspect />
    <AspectEffects bind:aspect />
    <CustomIcons customIcons={aspect.customIcons} />
  </div>
  <div class="column pt-0">
    <PreviewFrame
      id="aspect-preview"
      bind:this={previewFrame}
      on:hot-reload={reloadPreview}
      clickFunction={() => openEditorHeading}
      class={aspect.profile ? "portrait" : ""}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/aspect.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/board_front.js"></script>
        <script type="text/javascript" src="/template/_global/js/aspect.js"></script>
      </svelte:fragment>
    </PreviewFrame>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-info js-modal-trigger mt-1 mr-1" on:click={exampleModal.open}>
        Examples
      </button>
      <LoadButton
        accept=".html"
        class="button is-success mt-1 mr-1"
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadButton>
      <button class="button is-success mt-1 mr-1" on:click={exportAspect}> Save </button>

      <button class="button is-warning mt-1 mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <!-- <button class="button is-warning mt-1 mr-1" on:click={previewFrame.toggleSize}
        >Toggle Zoom</button> -->
      <button class="button is-danger mt-1 mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons preview-buttons mb-0 is-flex-wrap-wrap">
      <div class="dropdown is-hoverable is-up">
        <div class="dropdown-trigger">
          <button
            class="button mt-1 mr-1 is-success"
            aria-haspopup="true"
            aria-controls="dropdown-menu4">
            <span>Download Image...</span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu4" role="menu">
          <div class="dropdown-content">
            <button
              class="button is-success mr-1 dropdown-item"
              on:click={screenshotSetUp("for-sharing", aspect)}>for Sharing</button>
            <button
              class="button is-success mt-1 mr-1 dropdown-item"
              on:click={screenshotSetUp("for-image-download", aspect)}>for TTS</button>
          </div>
        </div>
      </div>
      <button class="button is-success mt-1 mr-1" on:click={downloadTTSJSON}
        >Export TTS file</button>
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
          class="button is-file-load"
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
