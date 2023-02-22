<script>
  import { onMount } from "svelte";
  import jsone from "json-e";

  import * as Lib from "../lib";
  import { downloadHTML, downloadString } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import Examples from "$lib/example-modal.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import NameAndArt from "./name-and-art.svelte";
  import SpecialRules from "./special-rules.svelte";
  import Growth from "./growth.svelte";
  import PresenceTracks from "./presence-tracks.svelte";
  import InnatePowers from "./innate-powers.svelte";
  import CustomIcons from "../custom-icons.svelte";

  import { createTTSSave, toFixedNumber, ttsSaveMIMEType } from "$lib/tts.js";

  import examples from "./examples.json";
  import spiritBoardJsonTemplate from "./tts-spirit-board.json";
  import InstructionsLink from "$lib/instructions/link.svelte";

  export let spiritBoard;
  export let emptySpiritBoard;
  export let customIcons;

  function clearAllFields() {
    if (
      window.confirm("Are you sure? This permanently clears all fields in Spirit Board Play Side.")
    ) {
      spiritBoard = JSON.parse(JSON.stringify(emptySpiritBoard));
      reloadPreview();
    }
  }

  function hideAll() {
    spiritBoard.nameAndArt.isVisible = false;
    spiritBoard.specialRules.isVisible = false;
    spiritBoard.growth.isVisible = false;
    spiritBoard.presenceTrack.isVisible = false;
    spiritBoard.innatePowers.isVisible = false;
    customIcons.isVisible = false;
  }

  let previewFrame;
  let exampleModal;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MySpirit/OFFICIAL_Volcano Looming High.html";
  function onLoad() {
    if (spiritBoard.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        spiritBoard.demoBoardWasLoaded = true;
        emptySpiritBoard.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function generateHTML(spiritBoard) {
    const fragment = new DocumentFragment();

    const board = document.createElement("board");
    fragment.append(board);
    board.setAttribute("spirit-image", spiritBoard.nameAndArt.artPath);
    board.setAttribute("spirit-image-scale", spiritBoard.nameAndArt.artScale);
    board.setAttribute("spirit-border", spiritBoard.nameAndArt.bannerPath);

    //Set Spirit Name and Image
    const spiritName = document.createElement("spirit-name");
    if (spiritName) {
      spiritName.textContent = spiritBoard.nameAndArt.name;
    }
    board.appendChild(spiritName);

    const artistName = document.createElement("artist-name");
    artistName.textContent = spiritBoard.nameAndArt.artistCredit;
    board.appendChild(artistName);

    //Set Special Rules
    const specialRulesContainer = document.createElement("special-rules-container");
    board.appendChild(specialRulesContainer);

    let specialRulesHeader = document.createElement("section-title");
    specialRulesHeader.textContent = "SPECIAL RULES";
    specialRulesContainer.appendChild(specialRulesHeader);
    spiritBoard.specialRules.rules.forEach((rule) => {
      let newRuleName = document.createElement("special-rules-subtitle");
      newRuleName.textContent = rule.name;
      let newRuleEffect = document.createElement("special-rule");
      newRuleEffect.innerHTML = rule.effect;
      specialRulesContainer.appendChild(newRuleName);
      specialRulesContainer.appendChild(newRuleEffect);
    });

    const right = document.createElement("right");
    board.appendChild(right);

    //Set Growth
    const growthContainer = document.createElement("growth");
    right.appendChild(growthContainer);
    if (!spiritBoard.growth.useGrowthSets) {
      growthContainer.setAttribute("title", `Growth (${spiritBoard.growth.directions})`);
    } else {
      growthContainer.setAttribute("title", `Growth`);
    }

    spiritBoard.growth.growthSets.forEach((growthSet, i) => {
      let containerLayer;
      let newSubgroup;
      if (spiritBoard.growth.growthSets.length > 1) {
        newSubgroup = document.createElement("sub-growth");
        newSubgroup.setAttribute("title", `${growthSet.choiceText}`);
        if (i < spiritBoard.growth.growthSets.length - 1) {
          newSubgroup.setAttribute("bordered", "");
        }
        containerLayer = newSubgroup;
      } else {
        containerLayer = growthContainer;
      }
      growthSet.growthGroups.forEach((growthGroup) => {
        let growthGroupOutput = document.createElement("growth-group");

        //Cost
        if (growthGroup.hasCost) {
          growthGroupOutput.setAttribute("cost", growthGroup.cost);
        }
        //Tint
        if (growthGroup.hasTint) {
          growthGroupOutput.setAttribute("tint", growthGroup.tint);
        }
        //Title
        if (growthGroup.hasTitle) {
          growthGroupOutput.setAttribute("special-title", growthGroup.title);
        }
        //Values
        let values = "";
        growthGroup.growthActions.forEach((growthAction) => {
          values += growthAction.effect + ";";
        });
        growthGroupOutput.setAttribute("values", values.slice(0, -1)); //slice removes last semicolon

        containerLayer.appendChild(growthGroupOutput);
      });

      if (spiritBoard.growth.growthSets.length > 1) {
        //Add growth set to the growth if using sets
        growthContainer.appendChild(newSubgroup);
      }
    });

    //Set Presence Tracks
    const presenceTrackContainer = document.createElement("presence-tracks");
    right.appendChild(presenceTrackContainer);
    if (spiritBoard.presenceTrack.note) {
      presenceTrackContainer.setAttribute("note", spiritBoard.presenceTrack.note);
    } else {
      if (presenceTrackContainer.getAttribute("note")) {
        presenceTrackContainer.removeAttribute("note");
      }
    }
    checkTracksForCommas(); //swap commas for semicolons

    presenceTrackContainer.setAttribute("banner", spiritBoard.nameAndArt.combinedBannerPath);
    presenceTrackContainer.setAttribute(
      "banner-v-scale",
      spiritBoard.nameAndArt.combinedBannerScaleV
    );
    presenceTrackContainer.setAttribute(
      "banner-h-scale",
      spiritBoard.nameAndArt.combinedBannerScaleH
    );

    let energyTrack = document.createElement("energy-track");
    energyTrack.setAttribute("banner", spiritBoard.nameAndArt.energyBannerPath);
    energyTrack.setAttribute("banner-v-scale", spiritBoard.nameAndArt.energyBannerScale);
    let energyValues = "";
    spiritBoard.presenceTrack.energyNodes.forEach((energyNode) => {
      energyValues += energyNode.effect + ",";
    });
    energyTrack.setAttribute("values", energyValues.slice(0, -1));
    presenceTrackContainer.appendChild(energyTrack);

    let playsTrack = document.createElement("card-play-track");
    playsTrack.setAttribute("banner", spiritBoard.nameAndArt.playsBannerPath);
    playsTrack.setAttribute("banner-v-scale", spiritBoard.nameAndArt.playsBannerScale);
    let playsValues = "";
    spiritBoard.presenceTrack.playsNodes.forEach((playsNode) => {
      playsValues += playsNode.effect + ",";
    });
    playsTrack.setAttribute("values", playsValues.slice(0, -1));
    presenceTrackContainer.appendChild(playsTrack);

    //Set Innate Powers
    const innatePowerContainer = document.createElement("innate-powers");
    right.appendChild(innatePowerContainer);

    spiritBoard.innatePowers.powers.forEach((power) => {
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
      innatePowerContainer.appendChild(newInnatePower);
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

  function checkTracksForCommas() {
    //The original template is inconsistent in its use of commas and semicolons. For Presence Tracks, commas are used to separate node values and therefore
    //semicolons are used to separate arguments, but intuitively it should be the opposite (and Growth is indeed the opposite). Since the user of the
    //form doesn't need to separate the node values, this will detect any 'erroneously' used commas and switch them to semicolons.
    spiritBoard.presenceTrack.playsNodes.forEach((playsNode) => {
      playsNode.effect = playsNode.effect.replace(",", ";");
    });
    spiritBoard.presenceTrack.energyNodes.forEach((energyNode) => {
      energyNode.effect = energyNode.effect.replace(",", ";");
    });
    spiritBoard = spiritBoard;
  }

  function readHTML(htmlElement, baseURI) {
    //Reads the Template HTML file into the Form
    //Load Spirit Name and Image
    const spiritName = htmlElement.querySelectorAll("spirit-name")[0];
    if (spiritName) {
      spiritBoard.nameAndArt.name = spiritName.textContent.trim();
    }
    const board = htmlElement.querySelectorAll("board")[0];
    spiritBoard.nameAndArt.artPath = Lib.maybeResolveURL(
      board.getAttribute("spirit-image"),
      baseURI
    );
    spiritBoard.nameAndArt.artScale = board.getAttribute("spirit-image-scale");
    spiritBoard.nameAndArt.bannerPath = Lib.maybeResolveURL(
      board.getAttribute("spirit-border"),
      baseURI
    );

    const artistName = htmlElement.querySelectorAll("artist-name")[0];
    if (artistName) {
      spiritBoard.nameAndArt.artistCredit = artistName.textContent.trim();
    }

    //Load Special Rules
    const specialRulesNames = htmlElement.querySelectorAll("special-rules-subtitle");
    const specialRulesEffects = htmlElement.querySelectorAll("special-rule");
    spiritBoard.specialRules.rules.splice(0, spiritBoard.specialRules.rules.length); //Clear the Form first
    specialRulesNames.forEach((specialRulesName, j) => {
      spiritBoard = Lib.addSpecialRule(
        spiritBoard,
        specialRulesName.textContent,
        specialRulesEffects[j].innerHTML.trim()
      );
    });

    //Load Growth
    const growthContainer = htmlElement.querySelectorAll("growth");
    let htmlGrowthSets = growthContainer[0].querySelectorAll("sub-growth");
    let containerLayer;
    spiritBoard.growth.useGrowthSets = false;
    if (htmlGrowthSets[0]) {
      // if the HTML file isn't using subgroups (Growth Sets), then there's a whole layer that's missing... this gynamstics accounts for it.
      spiritBoard.growth.useGrowthSets = true;
      containerLayer = htmlGrowthSets;
    } else {
      containerLayer = growthContainer;
    }

    // Identify text inside the parathesis of the growth option (if any) ie. for Growth (Pick Two), this code will find Pick Two
    let regExpOuterParentheses = /\(\s*(.+)\s*\)/;
    let innerDirections = regExpOuterParentheses.exec(growthContainer[0].title);
    spiritBoard.growth.directions = innerDirections !== null ? innerDirections[1] : "";

    spiritBoard.growth.growthSets.splice(0, spiritBoard.growth.growthSets.length); //Clear the Form first
    containerLayer.forEach((topGrowthLayer, i) => {
      let groups = topGrowthLayer.querySelectorAll("growth-group");
      spiritBoard = Lib.addGrowthSet(spiritBoard, containerLayer[i].getAttribute("title"));
      groups.forEach((group, j) => {
        spiritBoard = Lib.addGrowthGroup(
          spiritBoard,
          i,
          group.getAttribute("cost"),
          group.getAttribute("tint"),
          group.getAttribute("special-title")
        );
        let values = group.getAttribute("values").split(";");
        values.forEach((growthValue) => {
          spiritBoard = Lib.addGrowthAction(spiritBoard, i, j, growthValue);
        });
      });
    });

    //Load Presence Tracks

    let presenceTracks = htmlElement.querySelectorAll("presence-tracks")[0];
    spiritBoard.nameAndArt.combinedBannerPath = Lib.maybeResolveURL(
      presenceTracks.getAttribute("banner"),
      baseURI
    );
    spiritBoard.nameAndArt.combinedBannerScaleV = presenceTracks.getAttribute("banner-v-scale");
    spiritBoard.nameAndArt.combinedBannerScaleH = presenceTracks.getAttribute("banner-h-scale");
    let presenceNote = presenceTracks.getAttribute("note");
    if (presenceNote) {
      spiritBoard.presenceTrack.note = presenceNote;
    } else {
      spiritBoard.presenceTrack.note = "";
    }
    let energyTrack = htmlElement.querySelectorAll("energy-track")[0];
    spiritBoard.nameAndArt.energyBannerPath = Lib.maybeResolveURL(
      energyTrack.getAttribute("banner"),
      baseURI
    );
    spiritBoard.nameAndArt.energyBannerScale = energyTrack.getAttribute("banner-v-scale");
    let energyValues = energyTrack.getAttribute("values").split(",");
    spiritBoard.presenceTrack.energyNodes.splice(0, spiritBoard.presenceTrack.energyNodes.length); //Clear the Form first
    energyValues.forEach((value) => {
      spiritBoard = Lib.addEnergyTrackNode(spiritBoard, value);
    });
    let playsTrack = htmlElement.querySelectorAll("card-play-track")[0];
    spiritBoard.nameAndArt.playsBannerPath = Lib.maybeResolveURL(
      playsTrack.getAttribute("banner"),
      baseURI
    );
    spiritBoard.nameAndArt.playsBannerScale = playsTrack.getAttribute("banner-v-scale");
    let playsValues = playsTrack.getAttribute("values").split(",");
    spiritBoard.presenceTrack.playsNodes.splice(0, spiritBoard.presenceTrack.playsNodes.length); //Clear the Form first
    playsValues.forEach((value) => {
      spiritBoard = Lib.addPlaysTrackNode(spiritBoard, value);
    });

    //Load Innate Powers
    let innatePowers = htmlElement.querySelectorAll("quick-innate-power");
    spiritBoard.innatePowers.powers.splice(0, spiritBoard.innatePowers.powers.length); //Clear the Form first
    innatePowers.forEach((innatePower, k) => {
      spiritBoard = Lib.addInnatePower(
        spiritBoard,
        innatePower.getAttribute("name"),
        innatePower.getAttribute("speed"),
        innatePower.getAttribute("range"),
        innatePower.getAttribute("target"),
        innatePower.getAttribute("target-title"),
        innatePower.getAttribute("note")
      );
      let htmlLevels = innatePower.querySelectorAll("level");
      htmlLevels.forEach((htmlLevel) => {
        spiritBoard = Lib.addLevel(
          spiritBoard,
          k,
          htmlLevel.getAttribute("threshold"),
          htmlLevel.innerHTML.trim(),
          htmlLevel.hasAttribute("long")
        );
      });
    });

    //Load Custom Icons
    const spiritStyle = htmlElement.querySelectorAll("style")[0];
    customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
    if (spiritStyle) {
      const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
      let iconList = spiritStyle.textContent.match(regExp);
      if (iconList) {
        iconList.forEach((customIcon) => {
          customIcon = Lib.maybeResolveURL(customIcon, baseURI);
          customIcons = Lib.addCustomIcon(customIcons, customIcon);
        });
      }
    }
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=generateHTML)");
    previewFrame.copyHTMLFrom(generateHTML(spiritBoard)).then(() => {
      previewFrame.startMain();
    });
    document.getElementById("updateButton").classList.remove("is-flashy");
  }

  function exportSpiritBoard() {
    const htmlFileName = spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.html";
    downloadHTML(generateHTML(spiritBoard), htmlFileName);
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  async function downloadTTSJSON() {
    let previewFrameDoc = document.getElementById("preview-iframe").contentWindow.document;
    const board = previewFrameDoc.querySelectorAll("board")[0];
    const boardRect = board.getBoundingClientRect();

    //Snap Points
    let presenceNodes = Array.from(board.getElementsByTagName("presence-node"));
    let snapPoints = [];
    console.log(presenceNodes);
    presenceNodes.forEach((node) => {
      let rect = node.getElementsByTagName("ring-icon")[0].getBoundingClientRect();
      if (node.classList.contains("first")) {
        console.log("skip");
      } else {
        snapPoints.push({
          Position: {
            x: toFixedNumber(
              (-(boardRect.width / boardRect.height) *
                (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
                (boardRect.width / 2),
              4
            ),
            y: 0.2,
            z: toFixedNumber(
              (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
                (boardRect.height / 2),
              4
            ),
          },
        });
      }
    });

    //Lua scripting - thresholds
    let thresholds = [];
    const thresholdsNodes = Array.from(board.getElementsByTagName("threshold"));
    thresholdsNodes.forEach((threshold) => {
      console.log(threshold);
      let icons = Array.from(threshold.getElementsByTagName("icon"));

      let elementNums = threshold.innerHTML
        .split("<icon")
        .map((x) => (isNaN(x) ? x.split("icon>")[1] : x));

      let elementCounts = [0, 0, 0, 0, 0, 0, 0, 0];
      icons.forEach((icon, i) => {
        if (icon.classList.contains("sun")) {
          elementCounts[0] = elementNums[i];
        } else if (icon.classList.contains("moon")) {
          elementCounts[1] = elementNums[i];
        } else if (icon.classList.contains("fire")) {
          elementCounts[2] = elementNums[i];
        } else if (icon.classList.contains("air")) {
          elementCounts[3] = elementNums[i];
        } else if (icon.classList.contains("water")) {
          elementCounts[4] = elementNums[i];
        } else if (icon.classList.contains("earth")) {
          elementCounts[5] = elementNums[i];
        } else if (icon.classList.contains("plant")) {
          elementCounts[6] = elementNums[i];
        } else if (icon.classList.contains("animal")) {
          elementCounts[7] = elementNums[i];
        }
      });
      let rect = threshold.getBoundingClientRect();
      thresholds.push({
        elements: elementCounts.join(""),
        position: {
          x: toFixedNumber(
            (-(boardRect.width / boardRect.height) *
              (-23 + rect.left - boardRect.x - boardRect.width / 2)) /
              (boardRect.width / 2),
            4
          ),
          y: 0,
          z: toFixedNumber(
            (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
              (boardRect.height / 2),
            4
          ),
        },
      });
    });

    //Lua scripting - track energy & elements
    let trackElements = [];
    let formNodes = spiritBoard.presenceTrack.energyNodes.concat(
      spiritBoard.presenceTrack.playsNodes
    );
    let boardNodes = Array.from(board.getElementsByTagName("presence-node"));
    let regExpOuterParentheses = /\(\s*(.+)\s*\)/;
    formNodes.forEach((node, j) => {
      let nodeEffectText = node.effect;
      let matches = regExpOuterParentheses.exec(nodeEffectText);
      if (matches) {
        nodeEffectText = matches[1];
      }

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
      if (elementCounts.reduce((partialSum, a) => partialSum + a, 0) > 0) {
        let rect = boardNodes[j].getElementsByTagName("ring-icon")[0].getBoundingClientRect();
        trackElements.push({
          elements: elementCounts.join(""),
          position: {
            x: toFixedNumber(
              (-(boardRect.width / boardRect.height) *
                (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
                (boardRect.width / 2),
              4
            ),
            y: 0,
            z: toFixedNumber(
              (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
                (boardRect.height / 2),
              4
            ),
          },
        });
      }
    });

    let trackEnergy = [];
    let bonusEnergy = [];
    let energyNodes = spiritBoard.presenceTrack.energyNodes.slice().reverse();
    let formEnergyNodes = Array.from(
      board.getElementsByClassName("energy-track")[0].getElementsByTagName("presence-node")
    ).reverse();
    console.log(energyNodes);
    console.log(formEnergyNodes);
    let maxEnergy = 100;
    energyNodes.forEach((node, i) => {
      let nodeEffectText = node.effect;
      let matches = regExpOuterParentheses.exec(nodeEffectText);
      if (matches) {
        nodeEffectText = matches[1];
      }

      const nameCounts = {};
      let nodeEffectSplit = nodeEffectText.split("+");
      let plus_check = nodeEffectSplit.indexOf("");
      if (plus_check !== -1) {
        nodeEffectSplit.splice(plus_check, 1);
        nodeEffectSplit[plus_check] = "+" + nodeEffectSplit[plus_check];
      }
      nodeEffectSplit.forEach(function (x) {
        nameCounts[x] = (nameCounts[x] || 0) + 1;
      });

      let namesList = Object.keys(nameCounts);

      for (let j = 0; j < namesList.length; j++) {
        if (!isNaN(namesList[j])) {
          let rect = formEnergyNodes[i]
            .getElementsByTagName("ring-icon")[0]
            .getBoundingClientRect();
          if (namesList[j][0] === "+") {
            bonusEnergy.push({
              count: Number(namesList[j]),
              position: {
                x: toFixedNumber(
                  (-(boardRect.width / boardRect.height) *
                    (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
                    (boardRect.width / 2),
                  4
                ),
                y: 0,
                z: toFixedNumber(
                  (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
                    (boardRect.height / 2),
                  4
                ),
              },
            });
          } else if (namesList[j] < maxEnergy) {
            maxEnergy = namesList[j];
            trackEnergy.push({
              count: Number(maxEnergy),
              position: {
                x: toFixedNumber(
                  (-(boardRect.width / boardRect.height) *
                    (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
                    (boardRect.width / 2),
                  4
                ),
                y: 0,
                z: toFixedNumber(
                  (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
                    (boardRect.height / 2),
                  4
                ),
              },
            });
          }
        }
      }
    });

    let spiritBoardJson = jsone(spiritBoardJsonTemplate, {
      guid: spiritBoard.nameAndArt.name.replaceAll(" ", "_"),
      spiritName: spiritBoard.nameAndArt.name,
      bonusEnergy,
      snapPoints,
      thresholds,
      trackElements,
      trackEnergy,
    });
    let ttsSave = createTTSSave([spiritBoardJson]);

    const jsonFileName = spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_TTS.json";
    downloadString(ttsSaveMIMEType, ttsSave, jsonFileName);
  }

  function screenshotSetUp() {
    const fileNames = [spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.png"];
    const elementNamesInIframe = ["board"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }
</script>

<PreviewFrame id="spirit-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/board_front.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/board_front.js"></script>
  </svelte:fragment>
</PreviewFrame>

<div class="field has-addons mb-2">
  <button class="button is-info js-modal-trigger mr-1" on:click={exampleModal.open}>
    Examples
  </button>
  <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
    Load
  </LoadButton>
  <button class="button is-success  mr-1" on:click={exportSpiritBoard}>Save</button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-success  mr-1" on:click={downloadTTSJSON}>Export TTS file</button>
  <button class="button is-warning  mr-1" id="updateButton" on:click={reloadPreview}
    >Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <InstructionsLink class="button is-info mr-1" anchor="spirit-board-play-side" />
</div>
<div class="columns mt-0 mb-1">
  <div class="column pt-0">
    <NameAndArt bind:spiritBoard />
    <SpecialRules bind:spiritBoard />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <Growth bind:spiritBoard />
    <PresenceTracks bind:spiritBoard />
    <InnatePowers bind:spiritBoard />
  </div>
</div>
<Examples
  bind:this={exampleModal}
  {loadExample}
  title="Load Examples & Official Spirits"
  {examples} />
