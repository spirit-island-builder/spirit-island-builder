<script>
  import { onMount } from "svelte";
  import NameReplacements from "./name-replacements.svelte";
  import AspectEffects from "./aspect-effects.svelte";
  import * as Lib from "../lib";

  export let aspect;
  export let isShowingInstructions;
  export let instructionsSource;

  let aspectFrame;
  let scaledFrameSrc = "/template/MyCustomContent/MyAspect/aspect.html";
  if (aspect.demoBoardWasLoaded) {
    console.log("loading blank board");
    scaledFrameSrc = "/template/MyCustomContent/MyAspect/aspect_blank.html";
  }

  onMount(() => {
    aspectFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    var localFrame = aspectFrame;
    var localObject = aspect;

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
    aspect[event.target.id].isVisible = !aspect[event.target.id].isVisible;
  }

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    setBoardValues(aspect);
    copyHTML();
    document.getElementById("aspect-scaled-frame").contentWindow.startMain();
  }

  function copyHTML() {
    console.log("Copying HTML from Form to Preview (f=copyHTML)");
    var modFrame = document.getElementById("aspect-mod-frame");
    modFrame.doc = document.getElementById("aspect-mod-frame").contentWindow.document;
    modFrame.head = modFrame.doc.getElementsByTagName("head")[0];
    modFrame.body = modFrame.doc.getElementsByTagName("body")[0];
    var scaledFrame = document.getElementById("aspect-scaled-frame");
    scaledFrame.doc = document.getElementById("aspect-scaled-frame").contentWindow.document;
    scaledFrame.head = scaledFrame.doc.getElementsByTagName("head")[0];
    scaledFrame.body = scaledFrame.doc.getElementsByTagName("body")[0];

    let bodyClone;
    bodyClone = document
      .getElementById("aspect-mod-frame")
      .contentWindow.document.body.cloneNode(true);
    document.getElementById("aspect-scaled-frame").contentWindow.document.body = bodyClone;
    let headClone = modFrame.head.cloneNode(true);
    scaledFrame.head.parentElement.replaceChild(headClone, scaledFrame.head);
  }

  function setBoardValues(aspect) {
    if (aspectFrame) {
      //Clear any current power cards
      const bodyContainer = aspectFrame.contentDocument.querySelectorAll("body")[0];
      if (bodyContainer) {
        //(easiest to start fresh each time)
        bodyContainer.textContent = "";
      }

      var aspectHTML = aspectFrame.contentDocument.createElement("aspect");
      bodyContainer.appendChild(aspectHTML);

      //Set Aspect Name
      var aspectName = aspectFrame.contentDocument.createElement("aspect-name");
      aspectHTML.appendChild(aspectName);
      aspectName.innerHTML = aspect.nameReplacements.aspectName;

      //Profile or Landscape
      if (aspect.profile) {
        aspectHTML.setAttribute("profile", "");
      }

      //Set Replacement
      var aspectReplacementHTML = aspectFrame.contentDocument.createElement("aspect-subtext");
      aspectHTML.appendChild(aspectReplacementHTML);
      var replacementFullText = aspect.nameReplacements.aspectRelacement;
      if (aspect.nameReplacements.rulesReplaced) {
        replacementFullText += ": <i>" + aspect.nameReplacements.rulesReplaced + "</i>";
      }
      if (aspectReplacementHTML) {
        aspectReplacementHTML.innerHTML = replacementFullText;
      }

      //Set Complexity
      if (aspect.nameReplacements.complexity) {
        console.log("setting complexity");
        const complexityHTML = aspectFrame.contentDocument.createElement("complexity");
        aspectHTML.appendChild(complexityHTML);
        console.log(complexityHTML);
        if (complexityHTML) {
          console.log("complexity found reseting value");
          complexityHTML.setAttribute("value", aspect.nameReplacements.complexity);
          console.log(aspect.nameReplacements.complexity);
        } else {
          const newComplexityHTML = document.createElement("complexity");
          newComplexityHTML.setAttribute("value", aspect.nameReplacements.complexity);
          aspectHTML.appendChild(newComplexityHTML);
        }
      } else {
        // get rid of complexity element
        const complexityHTML = aspectHTML.querySelectorAll("complexity")[0];
        if (complexityHTML) {
          complexityHTML.remove();
        }
      }

      //Set Aspect Back
      console.log(aspectFrame.contentDocument);
      console.log(aspectBackHTML);
      if (aspect.nameReplacements.hasBack) {
        var aspectBackHTML = aspectFrame.contentDocument.createElement("aspect-back");
        aspectHTML.after(aspectBackHTML);
        aspectBackHTML.setAttribute("spirit-name", aspect.nameReplacements.spiritName);
        aspectBackHTML.setAttribute("src", aspect.nameReplacements.spiritImage);
      }

      //Set Special Rules
      const aspectRulesContainer = aspectFrame.contentDocument.createElement("aspect-container");
      aspectHTML.appendChild(aspectRulesContainer);

      aspect.aspectEffects.specialRules.rules.forEach((rule) => {
        var newRuleName = aspectFrame.contentDocument.createElement("special-rules-subtitle");
        newRuleName.textContent = rule.name;
        var newRuleEffect = aspectFrame.contentDocument.createElement("special-rule");
        newRuleEffect.innerHTML = rule.effect;
        aspectRulesContainer.appendChild(newRuleName);
        aspectRulesContainer.appendChild(newRuleEffect);
      });

      //Set Innate Powers
      aspect.aspectEffects.innatePowers.powers.forEach((power) => {
        var newInnatePower = aspectFrame.contentDocument.createElement("quick-innate-power");
        newInnatePower.setAttribute("name", power.name);
        newInnatePower.setAttribute("speed", power.speed.toLowerCase());
        newInnatePower.setAttribute("range", power.range);
        newInnatePower.setAttribute("target", power.target);
        newInnatePower.setAttribute("target-title", power.targetTitle);
        if (power.note) {
          newInnatePower.setAttribute("note", power.note);
        } // may need to clear it?
        power.levels.forEach((level) => {
          var newLevel = aspectFrame.contentDocument.createElement("level");
          newLevel.setAttribute("threshold", level.threshold);
          newLevel.textContent = level.effect;
          if (level.isLong) {
            newLevel.setAttribute("long", "");
          }
          newInnatePower.appendChild(newLevel);
        });
        aspectRulesContainer.appendChild(newInnatePower);
      });
    }
  }

  function readHTML(htmlElement) {
    console.log("Loading aspect into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    if (aspectFrame) {
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
      var innatePowers = htmlElement.querySelectorAll("quick-innate-power");
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
          var htmlLevels = innatePower.querySelectorAll("level");
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
  }

  let aspectFrameLarge = false;
  function toggleSize() {
    var displayFrame = document.getElementById("aspect-scaled-frame");
    var displayWrap = document.getElementById("aspect-board-wrap");
    if (!aspectFrameLarge) {
      displayFrame.style.webkitTransform = "scale(1)";
      displayWrap.style.height = "495px";
      displayFrame.style.width = "100%";
    } else {
      displayFrame.style.webkitTransform = "scale(0.67)";
      displayWrap.style.height = "340px";
      displayFrame.style.width = "149%";
    }
    aspectFrameLarge = !aspectFrameLarge;
  }

  function exportAspect() {
    setBoardValues(aspect);
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          document
            .getElementById("aspect-mod-frame")
            .contentWindow.document.getElementsByTagName("html")[0].innerHTML
        )
    );
    console.log(
      document
        .getElementById("aspect-mod-frame")
        .contentWindow.document.getElementsByTagName("html")[0].innerHTML
    );
    element.setAttribute(
      "download",
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_Aspect.html"
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
        setTimeout(() => {
          reloadPreview();
        }, 100);
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
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
    const frameId = "aspect-scaled-frame";
    const fileNames = [
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_Aspect.png",
      aspect.nameReplacements.aspectName.replaceAll(" ", "_") + "_AspectBack.png",
    ];
    const elementNamesInIframe = ["aspect", "aspect-back"];
    Lib.takeScreenshot(frameId, fileNames, elementNamesInIframe);
  }
</script>

<h5 class="title is-5 mb-0">Aspect</h5>
<!-- <h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview Aspect
  <span on:click={showOrHideBoard}>
    {#if aspect.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6> -->
<div id="aspect-board-wrap">
  <iframe src={scaledFrameSrc} height="600" width="100%" id="aspect-scaled-frame" title="yay" />
</div>
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
        <span class="file-label"> Load Aspect file </span>
      </span>
    </label>
  </div>
  <button class="button is-success  mr-1" on:click={exportAspect}>Download Aspect file</button>
  <button class="button is-info  mr-1" on:click={reloadPreview}>Generate Aspect</button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning mr-1" on:click={toggleSize}>Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameReplacements bind:aspect {showOrHideSection} />
    <!-- <CustomIcons bind:customIcons {showOrHideSection} /> -->
  </div>
  <div class="column pt-0">
    <AspectEffects bind:aspect {showOrHideSection} />
  </div>
</div>

<div id="aspect-holder">
  <iframe
    bind:this={aspectFrame}
    src="/template/MyCustomContent/MyAspect/aspect_website.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="aspect-mod-frame" />
</div>
