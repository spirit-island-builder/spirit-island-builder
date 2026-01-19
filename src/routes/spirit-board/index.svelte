<script>
  import { onMount } from "svelte";
  import jsone from "json-e";
  import { dev } from "$app/environment";

  import * as Lib from "../lib";
  import { downloadString } from "$lib/download";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import Examples from "$lib/example-modal.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import NameAndArt from "./name-and-art.svelte";
  import SpecialRules from "./special-rules.svelte";
  import Growth from "./growth.svelte";
  import PresenceTracks from "./presence-tracks.svelte";
  import InnatePowers from "./innate-powers.svelte";
  import LanguageOptions from "./language-options.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import CombinedTTS from "../combined-tts-spirit-powers-export.svelte";

  import { createTTSSave, toFixedNumber, ttsSaveMIMEType, getThresholdTTSJSON } from "$lib/tts.js";

  import examples from "./examples.json";
  import spiritBoardJsonTemplate from "./tts-spirit-board.json";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";
  import SaveDropdown from "$lib/save-dropdown.svelte";

  export let spiritBoard;
  export let emptySpiritBoard;
  export let combinedTTS;
  export let emptyCombinedTTS;
  export let currentPage;

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
    spiritBoard.customIcons.isVisible = false;
    combinedTTS.isVisible = false;
  }

  const openEditorHeading = (e) => {
    let outcome;
    e.stopPropagation(); // we stop the event from propegating up to 'board', which would cause this to trigger twice
    if (e.target.tagName === "SPECIAL-RULES-CONTAINER") {
      outcome = !spiritBoard.specialRules.isVisible;
      hideAll();
      spiritBoard.specialRules.isVisible = outcome;
    }
    if (e.target.tagName === "PRESENCE-TRACKS") {
      outcome = !spiritBoard.presenceTrack.isVisible;
      hideAll();
      spiritBoard.presenceTrack.isVisible = outcome;
    }
    if (e.target.tagName === "GROWTH") {
      outcome = !spiritBoard.growth.isVisible;
      hideAll();
      spiritBoard.growth.isVisible = outcome;
    }
    if (e.target.tagName === "INNATE-POWERS") {
      outcome = !spiritBoard.innatePowers.isVisible;
      hideAll();
      spiritBoard.innatePowers.isVisible = outcome;
    }
    if (e.target.tagName === "SPIRIT-IMAGE" || e.target.tagName === "SPIRIT-NAME-TEXT") {
      outcome = !spiritBoard.nameAndArt.isVisible;
      hideAll();
      spiritBoard.nameAndArt.isVisible = outcome;
    }
  };

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
    board.setAttribute("clickable-GUI", spiritBoard.isClickable);

    if (spiritBoard.nameAndArt.language) {
      board.setAttribute("lang", spiritBoard.nameAndArt.language);
    } else {
      board.setAttribute("lang", "en");
    }

    //Set Spirit Name and Image
    const spiritName = document.createElement("spirit-name");
    if (spiritName) {
      spiritName.textContent = spiritBoard.nameAndArt.name;
    }
    board.appendChild(spiritName);

    const artistName = document.createElement("artist-name");
    artistName.textContent = spiritBoard.nameAndArt.artistCredit;
    board.appendChild(artistName);

    if (spiritBoard.nameAndArt.starlight) {
      board.setAttribute("starlight", spiritBoard.nameAndArt.starlight);
    }

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
    if (spiritBoard.specialRules.customHeading) {
      console.log("Custom Special Rule Heading detected");
      specialRulesContainer.setAttribute("customname", spiritBoard.specialRules.customHeading);
    }

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
        //Title-left
        if (growthGroup.hasTitleLeft) {
          growthGroupOutput.setAttribute("special-title-left", true);
        }
        //New Row
        if (growthGroup.newRow) {
          growthGroupOutput.setAttribute("new-row", true);
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
    if (spiritBoard.growth.customHeading) {
      console.log("Custom Growth Heading detected");
      growthContainer.setAttribute("customname", spiritBoard.growth.customHeading);
    }

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

    if (spiritBoard.nameAndArt.combinedBannerPath !== null) {
      console.log("combined banner being added:");
      console.log(spiritBoard.nameAndArt.combinedBannerPath);
      presenceTrackContainer.setAttribute("banner", spiritBoard.nameAndArt.combinedBannerPath);
      presenceTrackContainer.setAttribute(
        "banner-v-scale",
        spiritBoard.nameAndArt.combinedBannerScaleV
      );
      presenceTrackContainer.setAttribute(
        "banner-h-scale",
        spiritBoard.nameAndArt.combinedBannerScaleH
      );
    }

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

    if (spiritBoard.presenceTrack.customHeading) {
      console.log("Custom Presence Track Heading detected");
      presenceTrackContainer.setAttribute("customname", spiritBoard.presenceTrack.customHeading);
    }

    if (spiritBoard.presenceTrack.additionalTracks) {
      console.log("adding additional tracks ***");
      spiritBoard.presenceTrack.additionalTracks.forEach((additionalTrack) => {
        let additionalTrackHTML = document.createElement("additional-track");
        if (additionalTrack.bannerPath) {
          additionalTrackHTML.setAttribute("banner", additionalTrack.bannerPath);
        }
        if (additionalTrack.bannerScale) {
          additionalTrackHTML.setAttribute("banner-v-scale", additionalTrack.bannerScale);
        }
        let additionalValues = "";
        additionalTrack.additionalNodes.forEach((additionalNode) => {
          additionalValues += additionalNode.effect + ",";
        });
        additionalTrackHTML.setAttribute("values", additionalValues.slice(0, -1));
        presenceTrackContainer.appendChild(additionalTrackHTML);
        console.log(additionalTrackHTML);
      });
    }

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

    if (spiritBoard.innatePowers.customHeading) {
      console.log("Custom Innate Power Heading detected");
      innatePowerContainer.setAttribute("customname", spiritBoard.innatePowers.customHeading);
    }

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(spiritBoard.customIcons);
    const spiritStyle = document.createElement("style");
    fragment.prepend(spiritStyle);
    spiritStyle.textContent = customIconText;

    //Add Custom Overlays
    spiritBoard.nameAndArt.overlayImages.forEach((image) => {
      let overlayImage = document.createElement("overlay-image");
      overlayImage.setAttribute("imgurl", image.name);
      overlayImage.setAttribute("imgx", image.x);
      overlayImage.setAttribute("imgy", image.y);
      overlayImage.setAttribute("imgwidth", image.w);
      overlayImage.setAttribute("imgheight", image.h);
      board.appendChild(overlayImage);
    });

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
    spiritBoard = JSON.parse(JSON.stringify(emptySpiritBoard));

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

    spiritBoard.nameAndArt.starlight = false;
    if (board.getAttribute("starlight")) {
      spiritBoard.nameAndArt.starlight = board.getAttribute("starlight");
      console.log(spiritBoard.nameAndArt.starlight);
      console.log(spiritBoard);
    }

    const artistName = htmlElement.querySelectorAll("artist-name")[0];
    if (artistName) {
      spiritBoard.nameAndArt.artistCredit = artistName.textContent.trim();
    }

    const language = board.getAttribute("lang");
    if (language) {
      spiritBoard.nameAndArt.language = language;
    }

    //Load Special Rules
    const specialRulesBlock = htmlElement.querySelectorAll("special-rules-container")[0];
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
    spiritBoard.specialRules.customHeading = specialRulesBlock.getAttribute("customname")
      ? specialRulesBlock.getAttribute("customname")
      : "";

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
          group.getAttribute("special-title"),
          group.getAttribute("special-title-left"),
          group.getAttribute("new-row")
        );
        let values = group.getAttribute("values").split(";");
        values.forEach((growthValue) => {
          spiritBoard = Lib.addGrowthAction(spiritBoard, i, j, growthValue);
        });
      });
    });
    //Check custom growth heading
    spiritBoard.growth.customHeading = growthContainer[0].getAttribute("customname")
      ? growthContainer[0].getAttribute("customname")
      : "";

    //Load Presence Tracks
    let presenceTracks = htmlElement.querySelectorAll("presence-tracks")[0];
    if (presenceTracks.getAttribute("banner") && presenceTracks.getAttribute("banner") !== "null") {
      console.log("combined banner detected:");
      console.log(presenceTracks.getAttribute("banner"));
      spiritBoard.nameAndArt.isOneBanner = false;
      spiritBoard.nameAndArt.combinedBannerPath = Lib.maybeResolveURL(
        presenceTracks.getAttribute("banner"),
        baseURI
      );
      spiritBoard.nameAndArt.combinedBannerScaleV = presenceTracks.getAttribute("banner-v-scale");
      spiritBoard.nameAndArt.combinedBannerScaleH = presenceTracks.getAttribute("banner-h-scale");
    } else {
      spiritBoard.nameAndArt.combinedBannerPath = "";
      spiritBoard.nameAndArt.combinedBannerScaleV = "";
      spiritBoard.nameAndArt.combinedBannerScaleH = "";
    }

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

    let additionalTracks = htmlElement.querySelectorAll("additional-track");
    for (let i = 0; i < additionalTracks.length; i++) {
      console.log("adding track: " + (i + 1));
      let additionalTrackEl = additionalTracks[i];
      spiritBoard = Lib.addPresenceTrack(spiritBoard);
      let additionalTrackJSON = spiritBoard.presenceTrack.additionalTracks[i];
      console.log(additionalTrackJSON);
      additionalTrackJSON.bannerPath = Lib.maybeResolveURL(
        additionalTrackEl.getAttribute("banner"),
        baseURI
      );
      additionalTrackJSON.bannerScale = additionalTrackEl.getAttribute("banner-v-scale");
      let additionalValues = additionalTrackEl.getAttribute("values").split(",");
      additionalTrackJSON.additionalNodes.splice(0, additionalTrackJSON.additionalNodes.length); //Clear the Form first
      additionalValues.forEach((value) => {
        additionalTrackJSON = Lib.addAdditionalTrackNode(additionalTrackJSON, value);
        spiritBoard = spiritBoard;
      });
    }
    if (spiritBoard.nameAndArt.energyBannerScale === spiritBoard.nameAndArt.playsBannerScale) {
      if (!spiritBoard.nameAndArt.combinedBannerPath) {
        spiritBoard.nameAndArt.isOneBanner = true;
        spiritBoard.nameAndArt.unifiedBannerScale = spiritBoard.nameAndArt.energyBannerScale;
      }
    }
    spiritBoard.presenceTrack.customHeading = presenceTracks.getAttribute("customname")
      ? presenceTracks.getAttribute("customname")
      : "";

    //Load Innate Powers
    let innatePowerBlock = htmlElement.querySelectorAll("innate-powers")[0];
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
    spiritBoard.innatePowers.customHeading = innatePowerBlock.getAttribute("customname")
      ? innatePowerBlock.getAttribute("customname")
      : "";

    //Load Custom Icons
    spiritBoard.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      spiritBoard.customIcons,
      document.baseURI
    );

    //Load Custom Overlays
    const overlayImages = Array.from(board.querySelectorAll("overlay-image"));
    overlayImages.forEach((image) => {
      spiritBoard.nameAndArt.overlayImages.push({
        id: spiritBoard.nameAndArt.overlayImages.length,
        name: image.getAttribute("imgurl", image.name),
        x: image.getAttribute("imgx", image.x),
        y: image.getAttribute("imgy", image.y),
        w: image.getAttribute("imgwidth", image.w),
        h: image.getAttribute("imgheight", image.h),
      });
    });
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=generateHTML)");
    previewFrame.copyHTMLFrom(generateHTML(spiritBoard)).then(() => {
      previewFrame.startMain();
    });
    document.getElementById("updateButton").classList.remove("is-flashy");
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  const packagePlayTTSforExport = () => {
    let debug = false;
    let previewFrameDoc = document.getElementById("preview-iframe").contentWindow.document;
    const board = previewFrameDoc.querySelectorAll("board")[0];
    const rightSide = previewFrameDoc.querySelectorAll("right")[0];
    const boardRect = board.getBoundingClientRect();

    //Snap Points
    let presenceNodes = Array.from(rightSide.getElementsByTagName("presence-node"));
    let snapPoints = [];
    if (debug) {
      console.log("TTS Export");
      console.log(presenceNodes);
      console.log("Snap Points");
    }
    presenceNodes.forEach((node) => {
      let rect = node.getElementsByTagName("ring-icon")[0].getBoundingClientRect();
      if (node.classList.contains("first")) {
        console.log("skip first");
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

    //Lua scripting - thresholds (see tts.js)
    if (debug) {
      console.log("IP Thresholds (on lib.js)");
    }
    let thresholds = getThresholdTTSJSON(board);

    //Lua scripting - track energy & elements
    if (debug) {
      console.log("Elements");
    }
    let trackElements = [];
    let trackEnergy = [];
    let bonusEnergy = [];
    let boardNodes = Array.from(board.getElementsByTagName("presence-node"));
    let lowestEnergy = -1;

    boardNodes.forEach((node) => {
      let ttsInfo = node.getAttribute("ttsInfo");
      let ttsInfoArr = ttsInfo.split(";");
      let rect = node.getElementsByTagName("ring-icon")[0].getBoundingClientRect();
      let xLoc = toFixedNumber(
        (-(boardRect.width / boardRect.height) *
          (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
          (boardRect.width / 2),
        4
      );
      let zLoc = toFixedNumber(
        (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) / (boardRect.height / 2),
        4
      );

      // check if node has elements
      if (ttsInfoArr[3]) {
        // count them
        let elementList = ttsInfoArr[3].split(",");
        let elementCounts = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < elementList.length; i++) {
          if (elementList[i].startsWith("sun")) {
            elementCounts[0]++;
          }
          if (elementList[i].startsWith("moon")) {
            elementCounts[1]++;
          }
          if (elementList[i].startsWith("fire")) {
            elementCounts[2]++;
          }
          if (elementList[i].startsWith("air")) {
            elementCounts[3]++;
          }
          if (elementList[i].startsWith("water")) {
            elementCounts[4]++;
          }
          if (elementList[i].startsWith("earth")) {
            elementCounts[5]++;
          }
          if (elementList[i].startsWith("plant")) {
            elementCounts[6]++;
          }
          if (elementList[i].startsWith("animal")) {
            elementCounts[7]++;
          }
        }
        trackElements.push({
          elements: elementCounts.join(""),
          position: {
            x: xLoc,
            y: 0,
            z: zLoc,
          },
        });
      }

      // Bonus Energy
      // check if node has bonus energy
      if (ttsInfoArr[1]) {
        let bonusEnergyNum = ttsInfoArr[1];

        bonusEnergy.push({
          count: Number(bonusEnergyNum),
          position: {
            x: xLoc,
            y: 0,
            z: zLoc,
          },
        });
      }

      // Energy
      // check if node has energy
      if (ttsInfoArr[0]) {
        let energyNum = ttsInfoArr[0];
        if (energyNum > lowestEnergy) {
          lowestEnergy = energyNum;
          trackEnergy.push({
            count: Number(lowestEnergy),
            position: {
              x: xLoc,
              y: 0,
              z: zLoc,
            },
          });
        }
      }
    });

    // trackEnergy needs to be logged in reverse order by convention
    trackEnergy.reverse();

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

    return ttsSave;
  };

  async function downloadTTSJSON() {
    let ttsSave = packagePlayTTSforExport();
    const jsonFileName = spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_TTS.json";
    downloadString(ttsSaveMIMEType, ttsSave, jsonFileName);
  }

  function screenshotSetUp() {
    const fileNames = [spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.png"];
    const elementNamesInIframe = ["board"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  function printToPDF(pageType = "letter") {
    const fileNames = [spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.pdf"];
    const elementNamesInIframe = ["board"];
    previewFrame.getPDF(fileNames, elementNamesInIframe, pageType);
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  function toggleClickableInterface() {
    //find the board
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let board = previewFrame.document.getElementsByTagName("board")[0];
    if (board.getAttribute("clickable-gui") === "true") {
      board.classList.add("devwrap");
      board.setAttribute("clickable-gui", "false");
    } else {
      board.classList.remove("devwrap");
      board.setAttribute("clickable-gui", "true");
    }
    //check if its clickable
  }

  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("board")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }

  function togglePrinterClean() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("board")[0];
    spiritBoard.classList.add("printer-clean");
  }

  function toggleTransparent() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let spiritBoard = previewFrame.document.getElementsByTagName("board")[0];
    spiritBoard.classList.add("transparent");
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameAndArt bind:spiritBoard />
    <SpecialRules bind:spiritBoard />
    <Growth bind:spiritBoard />
    <PresenceTracks bind:spiritBoard />
    <InnatePowers bind:spiritBoard />
    <div class="content mb-0 mt-2">Options</div>
    <CustomIcons customIcons={spiritBoard.customIcons} />
    <LanguageOptions bind:spiritBoard />
    <CombinedTTS
      bind:combinedTTS
      bind:currentPage
      bind:emptyCombinedTTS
      exportPlayTTS={packagePlayTTSforExport} />
  </div>
  <div class="column pt-0">
    <PreviewFrame
      id="spirit-preview"
      bind:this={previewFrame}
      on:hot-reload={reloadPreview}
      clickFunction={() => openEditorHeading}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/board_front.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/board_front.js"></script>
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
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadDropdown>
      <SaveDropdown
        saveAction={() => generateHTML(spiritBoard)}
        fileName={`${spiritBoard.nameAndArt.name.replaceAll(" ", "_")}_SpiritBoard.html`}
        saveType="html" />
      <button class="button is-warning mt-1 mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <!-- <button class="button is-warning mt-1 mr-1" on:click={previewFrame.toggleSize}
        >Toggle Zoom</button> -->
      <button class="button is-danger mt-1 mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-success mt-1 mr-1" on:click={screenshotSetUp}>Download Image</button>
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
      <button class="button is-warning mt-1 mr-1 is-small" on:click={toggleTransparent}
        >Transparent</button>
    </div>
    <div class="field has-addons mb-1 is-flex-wrap-wrap">
      {#if dev}
        <button class="button is-danger mt-1 mr-1" on:click={toggleClickableInterface}
          >Toggle Clickable GUI</button>
        <LoadButton
          accept="image/png, image/jpeg"
          class="button is-file-load is-small mt-1"
          loadDataURL={(url) => {
            overlayImage = url;
          }}>Load Overlay</LoadButton>
        <button class="button is-danger mt-1 mr-1" on:click={addOverlay}>Add Overlay</button>
      {/if}
    </div>
  </div>
</div>
<Examples
  bind:this={exampleModal}
  {loadExample}
  title="Load Examples & Official Spirits"
  {examples} />
