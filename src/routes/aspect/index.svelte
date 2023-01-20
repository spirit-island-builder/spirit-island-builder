<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";

  import NameReplacements from "./name-replacements.svelte";
  import AspectEffects from "./aspect-effects.svelte";

  export let aspect;
  export let isShowingInstructions;
  export let instructionsSource;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyAspect/aspect_website.html";
  function onLoad() {
    if (aspect.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        aspect.demoBoardWasLoaded = true;
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
    let aspectReplacementHTML = document.createElement("aspect-subtext");
    aspectHTML.appendChild(aspectReplacementHTML);
    let replacementFullText = aspect.nameReplacements.aspectRelacement;
    if (aspect.nameReplacements.rulesReplaced) {
      replacementFullText += ": <i>" + aspect.nameReplacements.rulesReplaced + "</i>";
    }
    if (aspectReplacementHTML) {
      aspectReplacementHTML.innerHTML = replacementFullText;
    }

    //Set Complexity
    if (aspect.nameReplacements.complexity) {
      const complexityHTML = document.createElement("complexity");
      aspectHTML.appendChild(complexityHTML);
      if (complexityHTML) {
        console.log("complexity found reseting value");
        complexityHTML.setAttribute("value", aspect.nameReplacements.complexity);
        console.log(aspect.nameReplacements.complexity);
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
    }

    //Set Special Rules
    const aspectRulesContainer = document.createElement("aspect-container");
    aspectHTML.appendChild(aspectRulesContainer);

    aspect.aspectEffects.specialRules.rules.forEach((rule) => {
      let newRuleName = document.createElement("special-rules-subtitle");
      newRuleName.textContent = rule.name;
      let newRuleEffect = document.createElement("special-rule");
      newRuleEffect.innerHTML = rule.effect;
      aspectRulesContainer.appendChild(newRuleName);
      aspectRulesContainer.appendChild(newRuleEffect);
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
        newLevel.textContent = level.effect;
        if (level.isLong) {
          newLevel.setAttribute("long", "");
        }
        newInnatePower.appendChild(newLevel);
      });
      aspectRulesContainer.appendChild(newInnatePower);
    });

    return fragment;
  }

  function readHTML(htmlElement) {
    console.log("Loading aspect into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    const aspectHTML = htmlElement.querySelectorAll("aspect")[0];

    //Profile or Landscape
    if (aspectHTML.hasAttribute("profile")) {
      aspect.profile = true;
    }

    //Read Aspect Name
    const aspectName = aspectHTML.querySelectorAll("aspect-name")[0];
    aspect.nameReplacements.aspectName = aspectName.innerHTML.trim();

    //Read Replacement
    const aspectReplacementHTML = aspectHTML.querySelectorAll("aspect-subtext")[0];
    if (aspectReplacementHTML) {
      aspect.nameReplacements.aspectRelacement = aspectReplacementHTML.textContent.split(":")[0];
      aspect.nameReplacements.rulesReplaced = aspectHTML.querySelectorAll("i")[0].textContent;
    }

    //Read Complexity
    const complexityHTML = aspectHTML.querySelectorAll("complexity")[0];
    if (complexityHTML) {
      aspect.nameReplacements.complexity = complexityHTML.getAttribute("value");
    }

    //Read Aspect Back
    const aspectBackHTML = htmlElement.querySelectorAll("aspect-back")[0];
    console.log(aspectBackHTML);
    console.log("^^^^");
    if (aspectBackHTML) {
      aspect.nameReplacements.spiritName = aspectBackHTML.getAttribute("spirit-name");
      aspect.nameReplacements.spiritImage = aspectBackHTML.getAttribute("src");
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
      aspect.aspectEffects = Lib.addSpecialRule(
        aspect.aspectEffects,
        specialRulesName.textContent,
        specialRulesEffects[j].innerHTML.trim()
      );
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
            htmlLevel.textContent.trim(),
            htmlLevel.hasAttribute("long")
          );
        });
      });
    }

    console.log("aspect loaded");
    console.log(aspect);
  }

  function exportAspect() {
    const htmlFileName = aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_Aspect.html";
    Lib.downloadHTML(generateHTML(aspect), htmlFileName);
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
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      aspect = {
        prop: "value",
        demoBoardWasLoaded: true,
        profile: false,
        previewBoard: {
          isVisible: false,
        },
        nameReplacements: {
          isVisible: false,
          aspectName: "",
          aspectRelacement: "",
          rulesReplaced: "",
          complexity: "",
          spiritName: "",
          spiritImage: "",
          hasBack: true,
        },
        aspectEffects: {
          isVisible: false,
          specialRules: {
            isVisible: false,
            rules: [
              {
                id: 0,
                name: "",
                effect: "",
              },
            ],
          },
          innatePowers: {
            isVisible: false,
            powers: [
              {
                id: 0,
                name: "",
                speed: "",
                range: "",
                target: "",
                targetTitle: "",
                effect: "",
                note: "",
                noteShow: true,
                levels: [
                  {
                    id: 0,
                    threshold: "",
                    effect: "",
                  },
                ],
              },
            ],
          },
        },
      };
      reloadPreview();
    }
  }

  function showInstructions() {
    isShowingInstructions = true;
    instructionsSource = "https://neubee.github.io/spirit-island-builder/instructions#power-cards";
  }

  function screenshotSetUp() {
    const fileNames = [
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_Aspect.png",
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_AspectBack.png",
    ];
    const elementNamesInIframe = ["aspect", "aspect-back"];
    PreviewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }
</script>

<PreviewFrame
  id="aspect-preview"
  baseURI="/template/MyCustomContent/MyAspect/"
  bind:this={previewFrame}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/aspect.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/aspect.js"></script>
  </svelte:fragment>
</PreviewFrame>

<div class="field has-addons mb-2">
  <div class="file is-success mr-1">
    <label class="file-label">
      <input
        class="file-input is-success"
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
  <button class="button is-success  mr-1" on:click={exportAspect}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" on:click={reloadPreview}>Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameReplacements bind:aspect />
    <!-- <CustomIcons bind:customIcons /> -->
  </div>
  <div class="column pt-0">
    <AspectEffects bind:aspect />
  </div>
</div>
