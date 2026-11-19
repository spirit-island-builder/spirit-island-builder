<script>
  import { onMount } from "svelte";
  import jsone from "json-e";

  import * as Lib from "../lib";
  import { downloadString } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";
  import SaveDropdown from "$lib/save-dropdown.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import { dev } from "$app/environment";

  import NameReplacements from "./name-replacements.svelte";
  import AspectEffects from "./aspect-effects.svelte";
  import ReorderParts from "./reorder-parts.svelte";
  import LanguageOptions from "./language-options.svelte";
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
  }

  const openEditorHeading = (e) => {
    let outcome;
    console.log("openeditorheading");
    e.stopPropagation(); // we stop the event from propegating up to 'board', which would cause this to trigger twice
    if (e.target.tagName === "ASPECT-CONTAINER") {
      let regFindNumbers = /^\d+|\d+\b|\d+(?=\w)/g;
      let numMatches = e.target.id.match(regFindNumbers);
      outcome = !aspect.aspectEffects[numMatches].isVisible;
      hideAll();
      aspect.aspectEffects[numMatches].isVisible = outcome;
    }
    if (e.target.tagName === "ASPECT-NAME") {
      outcome = !aspect.info.isVisible;
      hideAll();
      aspect.info.isVisible = outcome;
    }
    if (e.target.tagName === "ASPECT-SUBTEXT") {
      outcome = !aspect.info.isVisible;
      hideAll();
      aspect.info.isVisible = outcome;
    }
    if (e.target.tagName === "ASPECT-BACK-OVERLAY") {
      outcome = !aspect.info.isVisible;
      hideAll();
      aspect.info.isVisible = outcome;
    }
  };

  function generateHTML(aspect) {
    const fragment = new DocumentFragment();

    aspect.aspectEffects.forEach((aspectPart) => {
      let aspectHTML = document.createElement("aspect");
      fragment.append(aspectHTML);

      //Set Aspect Name
      let aspectName = document.createElement("aspect-name");
      aspectName.innerHTML = aspect.info.aspectName;
      aspectHTML.appendChild(aspectName);
      if (aspectPart.nameOverride && aspectPart.nameOverride.length > 0) {
        aspectName.setAttribute("nameoverride", aspectPart.nameOverride);
      }

      //Set Showparts
      if (aspect.info.showparts) {
        aspectName.setAttribute("showparts", "");
      }

      //Set language
      if (aspect.languageOptions.language) {
        aspectHTML.setAttribute("lang", aspect.languageOptions.language);
      } else {
        aspectHTML.setAttribute("lang", "en");
      }

      //Set Complexity
      if (aspect.info.complexity) {
        const complexityHTML = document.createElement("complexity");
        aspectHTML.appendChild(complexityHTML);
        if (complexityHTML) {
          complexityHTML.setAttribute("value", aspect.info.complexity);
        } else {
          const newComplexityHTML = document.createElement("complexity");
          newComplexityHTML.setAttribute("value", aspect.info.complexity);
          aspectHTML.appendChild(newComplexityHTML);
        }
      }

      //Portrait ("profile") or Landscape, per part
      if (aspectPart.profile) {
        aspectHTML.setAttribute("profile", "");
      }

      //Set Replacement
      if (aspectPart.replacements.length) {
        aspectPart.replacements.forEach((replacement) => {
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
      } else {
        let aspectReplacementHTML = document.createElement("aspect-subtext");
        aspectHTML.appendChild(aspectReplacementHTML);
      }

      //Set Special Rules
      const aspectRulesContainer = document.createElement("aspect-container");
      aspectHTML.appendChild(aspectRulesContainer);

      aspectPart.specialRules.rules.forEach((rule) => {
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
      aspectPart.innatePowers.powers.forEach((power) => {
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
      if (aspectPart.bonusNode.has) {
        let bonusNode = document.createElement("bonus-node");
        bonusNode.setAttribute("effect", aspectPart.bonusNode.effect);
        aspectRulesContainer.appendChild(bonusNode);
      }
    });

    //Set Aspect Back
    if (aspect.info.hasBack) {
      let aspectBackHTML = document.createElement("aspect-back");
      fragment.append(aspectBackHTML);
      aspectBackHTML.setAttribute("spirit-name", aspect.info.spiritName);
      aspectBackHTML.setAttribute("src", aspect.info.spiritImage);
      aspectBackHTML.setAttribute("lore", aspect.info.lore);
      // The back has no orientation of its own; it follows part 1.
      if (aspect.aspectEffects[0]?.profile) {
        aspectBackHTML.classList.add("profile");
      }
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

    const aspectHTML = htmlElement.querySelectorAll("aspect");

    //Read Aspect Name
    const aspectName = htmlElement.querySelectorAll("aspect-name")[0];
    aspect.info.aspectName = aspectName.innerHTML.trim();

    //Read Language
    const language = aspectHTML[0].getAttribute("lang");
    if (language) {
      aspect.languageOptions.language = language;
    }

    //Read Showparts
    if (aspectName.hasAttribute("showparts")) {
      console.log("we found showparts");
      aspect.info.showparts = true;
    } else {
      console.log("we DIDNT found showparts");
      aspect.info.showparts = false;
    }

    //Read Complexity
    const complexityHTML = htmlElement.querySelectorAll("complexity")[0];
    if (complexityHTML) {
      aspect.info.complexity = complexityHTML.getAttribute("value");
    }

    //Read Aspect Back
    const aspectBackHTML = htmlElement.querySelectorAll("aspect-back")[0];
    if (aspectBackHTML) {
      aspect.info.spiritName = aspectBackHTML.getAttribute("spirit-name");
      aspect.info.lore = aspectBackHTML.getAttribute("lore") || "";
      aspect.info.spiritImage = Lib.maybeResolveURL(aspectBackHTML.getAttribute("src"), baseURI);
      aspect.info.hasBack = true;
    } else {
      aspect.info.hasBack = false;
    }

    aspect.aspectEffects.splice(0, aspect.aspectEffects.length); //Clear the Form first
    aspectHTML.forEach((aspectHTMLpart, i) => {
      let aspectName = aspectHTMLpart.querySelectorAll("aspect-name")[0];
      let nameoverride = "";
      if (aspectName.hasAttribute("nameoverride")) {
        nameoverride = aspectName.getAttribute("nameoverride");
      }

      //Add a new part
      aspect.aspectEffects.push({
        id: aspect.aspectEffects.length,
        isVisible: false,
        profile: aspectHTMLpart.hasAttribute("profile"),
        nameOverride: nameoverride,
        replacements: [],
        specialRules: {
          rules: [],
        },
        innatePowers: {
          powers: [],
        },
        bonusNode: {
          has: false,
          effect: "",
        },
      });

      //Read Replacement(s)
      const aspectReplacementsHTML = aspectHTMLpart.querySelectorAll("aspect-subtext");
      if (aspectReplacementsHTML) {
        aspectReplacementsHTML.forEach((replacement) => {
          if (replacement.innerHTML.length > 0) {
            aspect.aspectEffects[i].replacements.push({
              id: aspect.aspectEffects[i].replacements.length,
              aspectRelacement: replacement.innerHTML.split(":")[0],
              rulesReplaced: replacement.querySelectorAll("i")[0]?.innerHTML ?? "",
            });
            aspect = aspect;
          }
        });
      }

      //Read Special Rules
      const specialRulesNames = aspectHTMLpart.querySelectorAll("special-rules-subtitle");
      const specialRulesEffects = aspectHTMLpart.querySelectorAll("special-rule");
      specialRulesNames.forEach((specialRulesName, j) => {
        console.log(specialRulesEffects[j]);
        let ruleGrowthGroup = specialRulesEffects[j].getElementsByTagName("growth-group")[0];
        if (ruleGrowthGroup) {
          console.log("removing child");
          ruleGrowthGroup = specialRulesEffects[j].removeChild(ruleGrowthGroup);
        }

        aspect.aspectEffects[i] = Lib.addSpecialRule(
          aspect.aspectEffects[i],
          specialRulesName.innerHTML,
          specialRulesEffects[j].innerHTML.trim()
        );

        if (ruleGrowthGroup) {
          aspect.aspectEffects[i].specialRules.rules[j].hasGrowth = true;
          aspect.aspectEffects[i].specialRules.rules[j].growthActions = [];
          let values = Lib.splitGrowthValues(ruleGrowthGroup.getAttribute("values"));
          console.log(values);
          values.forEach((growthValue, k) => {
            console.log(growthValue);
            aspect.aspectEffects[i].specialRules.rules[j].growthActions.push({
              id: k,
              effect: growthValue,
            });
          });

          console.log(aspect);
        } else {
          aspect.aspectEffects[i].specialRules.rules[j].hasGrowth = false;
          aspect.aspectEffects[i].specialRules.rules[j].growthActions = [];
        }
        aspect = aspect;
      });

      //Read Innate Powers
      let innatePowers = aspectHTMLpart.querySelectorAll("quick-innate-power");
      if (innatePowers) {
        innatePowers.forEach((innatePower, k) => {
          aspect.aspectEffects[i] = Lib.addInnatePower(
            aspect.aspectEffects[i],
            innatePower.getAttribute("name"),
            innatePower.getAttribute("speed"),
            innatePower.getAttribute("range"),
            innatePower.getAttribute("target"),
            innatePower.getAttribute("target-title"),
            innatePower.getAttribute("note")
          );
          let htmlLevels = innatePower.querySelectorAll("level");
          htmlLevels.forEach((htmlLevel) => {
            aspect.aspectEffects[i] = Lib.addLevel(
              aspect.aspectEffects[i],
              k,
              htmlLevel.getAttribute("threshold"),
              htmlLevel.innerHTML.trim(),
              htmlLevel.hasAttribute("long")
            );
          });
        });
      }

      //Read Bonus Nodes
      let bonusNode = aspectHTMLpart.querySelectorAll("bonus-node")[0];
      aspect.aspectEffects[i].bonusNode.has = false;
      if (bonusNode) {
        aspect.aspectEffects[i].bonusNode.has = true;
        aspect.aspectEffects[i].bonusNode.effect = bonusNode.getAttribute("effect");
      }
    });

    //Custom Icons
    aspect.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      aspect.customIcons,
      document.baseURI
    );
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      aspect = JSON.parse(JSON.stringify(emptyAspect));
      reloadPreview();
    }
  }

  function screenshotSetUp(option = "for-image-download") {
    let fileNamesElementNames = getFileNameAndElementNames("png");
    previewFrame.takeScreenshot(fileNamesElementNames[0], fileNamesElementNames[1], option);
  }

  function getFileNameAndElementNames(fileType) {
    const fileNames = [];
    const elementNamesInIframe = [];
    aspect.aspectEffects.forEach((part, index) => {
      elementNamesInIframe.push(`#aspect-part${index}`);
      let filename = aspect.info.spiritName
        ? `${aspect.info.aspectName.replaceAll(" ", "_")}_${aspect.info.spiritName.replaceAll(
            " ",
            "_"
          )}`
        : `${aspect.info.aspectName.replaceAll(" ", "_")}`;
      if (aspect.aspectEffects.length > 1) {
        filename += `_Aspect${index + 1}.${fileType}`;
      } else {
        filename += `_Aspect.${fileType}`;
      }
      fileNames.push(filename);
    });
    if (aspect.info.hasBack) {
      elementNamesInIframe.push(`aspect-back`);
      let filename = aspect.info.spiritName
        ? `${aspect.info.aspectName.replaceAll(" ", "_")}_${aspect.info.spiritName.replaceAll(
            " ",
            "_"
          )}_AspectBack.${fileType}`
        : `${aspect.info.aspectName.replaceAll(" ", "_")}_AspectBack.${fileType}`;
      fileNames.push(filename);
    }
    return [fileNames, elementNamesInIframe];
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  function hideAll() {
    aspect.info.isVisible = false;
    aspect.aspectEffects.forEach((part) => {
      part.isVisible = false;
    });
    aspect.customIcons.isVisible = false;
  }

  async function downloadTTSJSON() {
    const previewFrameDoc = document.getElementById("preview-iframe").contentWindow.document;
    const aspectParts = Array.from(previewFrameDoc.querySelectorAll("aspect"));
    const baseName = aspect.info.aspectName.replaceAll(" ", "_");
    const aspectUniqueName = aspect.info.aspectName + "-" + aspect.info.spiritName;
    const elementNames = ["sun", "moon", "fire", "air", "water", "earth", "plant", "animal"];

    // One TTS card per part. The "for TTS" image of every part is portrait
    // (landscape parts are rotated by aspect.css .for-image-download), and
    // SidewaysCard tells TTS which ones to turn back.
    const cards = aspectParts.map((aspectHTML, index) => {
      // startMain() turns the profile attribute into a class.
      const isLandscape = !aspectHTML.classList.contains("profile");
      let LUAScript = "";

      // elements
      const bonusNode = aspectHTML.getElementsByTagName("presence-node")[0];
      const ttsInfoArr = bonusNode ? bonusNode.getAttribute("ttsInfo").split(";") : [];
      if (ttsInfoArr[3]) {
        const elementCounts = [0, 0, 0, 0, 0, 0, 0, 0];
        ttsInfoArr[3].split(",").forEach((element) => {
          const found = elementNames.findIndex((name) => element.startsWith(name));
          if (found >= 0) elementCounts[found]++;
        });
        LUAScript += "elements={" + elementCounts.join("") + "}\n";
      }

      // thresholds (see tts.js)
      const thresholds = getThresholdTTSJSON(aspectHTML);
      if (thresholds.length) {
        LUAScript +=
          'function onLoad(saved_data)\n    if saved_data ~= "" then\n        local loaded_data = JSON.decode(saved_data)\n        self.setTable("thresholds", loaded_data.thresholds)\n    end\nend\n-- card loading end';
      }

      const partSuffix = aspectParts.length > 1 ? `_${index + 1}` : "";
      return jsone(aspectJSONTemplate, {
        guid: baseName + partSuffix,
        isLandscape,
        defaultImage: "https://i.imgur.com/jR8jpcD.png", // portrait placeholder
        LUAScript,
        aspectUniqueName:
          aspectUniqueName +
          (aspectParts.length > 1 ? ` (${index + 1} of ${aspectParts.length})` : ""),
        thresholds,
      });
    });

    const ttsSave = createTTSSave(cards);
    downloadString(ttsSaveMIMEType, ttsSave, baseName + "_TTS.json");
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

  async function printToPDF(pageType = "letter") {
    const [fileNames, elementNames] = getFileNameAndElementNames("pdf");
    const profiles = aspect.aspectEffects.map((part) => part.profile);
    const mixed = profiles.some((profile) => profile !== profiles[0]);

    // The PDF tiles every card at one size. When parts differ in orientation
    // they are all captured in the TTS (portrait) layout; which way a card
    // faces on the sheet stops mattering once it's cut out.
    let w = 3.465;
    let h = 2.48;
    if (mixed || profiles[0]) {
      w = 2.48;
      h = 3.465;
    }
    const previewDoc = document.getElementById("preview-iframe").contentWindow.document;
    const rotated = mixed
      ? elementNames.map((name) => previewDoc.querySelector(name)).filter(Boolean)
      : [];
    rotated.forEach((element) => element.classList.add("for-image-download"));
    try {
      await previewFrame.getPDF(fileNames[0], elementNames, pageType, w, h);
    } finally {
      rotated.forEach((element) => element.classList.remove("for-image-download"));
    }
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let aspectParts = Array.from(previewFrame.document.getElementsByTagName("aspect"));
    aspectParts.forEach((part) => {
      part.classList.add("printer-clean");
    });
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameReplacements bind:aspect />
    <AspectEffects bind:aspect />
    <div class="content mb-0 mt-2">Options</div>
    <CustomIcons customIcons={aspect.customIcons} />
    <LanguageOptions bind:aspect />
    <ReorderParts bind:aspect />
  </div>
  <div class="column pt-0">
    <PreviewFrame
      id="aspect-preview"
      bind:this={previewFrame}
      on:hot-reload={reloadPreview}
      clickFunction={() => openEditorHeading}
      class={aspect.aspectEffects.some((part) => part.profile) ? "portrait" : ""}>
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
      <InstructionsLink class="button is-info mt-1  mr-1" anchor="spirit-board-play-side" />
      <LoadDropdown
        accept="text/html"
        class="button is-success mt-1 mr-1"
        savedKeys={["aspect"]}
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadDropdown>
      <SaveDropdown
        saveAction={() => generateHTML(aspect)}
        fileName={`${aspect.info.aspectName.replaceAll(" ", "_")}_Aspect.html`}
        saveType="html"
        savedKeys={["aspect"]} />

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
            aria-controls="aspect-image-menu">
            <span>Download Image...</span>
          </button>
        </div>
        <div class="dropdown-menu" id="aspect-image-menu" role="menu">
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
            aria-controls="aspect-pdf-menu">
            <span>Create PDF...</span>
          </button>
        </div>
        <div class="dropdown-menu" id="aspect-pdf-menu" role="menu">
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
