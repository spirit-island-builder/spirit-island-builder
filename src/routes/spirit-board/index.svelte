<script>
  import { onMount } from "svelte";
  import jsone from "json-e";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame.svelte";

  import NameAndArt from "./name-and-art.svelte";
  import SpecialRules from "./special-rules.svelte";
  import Growth from "./growth.svelte";
  import PresenceTracks from "./presence-tracks.svelte";
  import InnatePowers from "./innate-powers.svelte";
  import CustomIcons from "../custom-icons.svelte";

  import { createTTSSave, toFixedNumber, ttsSaveMIMEType } from "$lib/tts.js";

  import spiritBoardJsonTemplate from "./tts-spirit-board.json";

  export let spiritBoard;
  export let customIcons;
  export let isShowingInstructions;
  export let instructionsSource;

  function clearAllFields() {
    if (
      window.confirm("Are you sure? This permanently clears all fields in Spirit Board Play Side.")
    ) {
      spiritBoard = {
        demoBoardWasLoaded: true,
        previewBoard: {
          isVisible: false,
        },
        nameAndArt: {
          isVisible: false,
          name: "",
          artPath: "",
          artScale: "",
          bannerPath: "",
          energyBannerPath: "",
          energyBannerScale: "",
          playsBannerPath: "",
          playsBannerScale: "",
          artistCredit: "",
        },
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
        growth: {
          isVisible: false,
          useGrowthSets: false,
          directions: "",
          growthSets: [
            {
              id: 0,
              choiceText: "",
              growthGroups: [
                {
                  id: 0,
                  cost: "",
                  tint: "",
                  title: "",
                  hasCost: false,
                  hasTint: false,
                  hasTitle: false,
                  growthActions: [
                    {
                      id: 0,
                      effect: "",
                    },
                  ],
                },
              ],
            },
          ],
        },
        presenceTrack: {
          isVisible: false,
          useMiddleNodes: false,
          note: "",
          energyNodes: [
            {
              id: 0,
              effect: "",
            },
          ],
          playsNodes: [
            {
              id: 0,
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
              speed: "fast",
              range: "",
              target: "",
              targetTitle: "target land",
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
        customIcons: {
          isVisible: false,
          icons: [
            {
              id: 0,
              name: "",
            },
          ],
        },
      };
      reloadPreview();
    }
  }

  function showOrHideSection(event) {
    spiritBoard[event.target.id].isVisible = !spiritBoard[event.target.id].isVisible;
  }

  function hideAll() {
    spiritBoard.nameAndArt.isVisible = false;
    spiritBoard.specialRules.isVisible = false;
    spiritBoard.growth.isVisible = false;
    spiritBoard.presenceTrack.isVisible = false;
    spiritBoard.innatePowers.isVisible = false;
    customIcons.isVisible = false;
  }

  let frame;
  let previewFrame;
  let previewDoc;
  let previewFrameSrc = "";

  onMount(() => {
    frame.addEventListener("load", onLoad());
  });

  function onLoad() {
    let localFrame = frame;
    let localObject = spiritBoard;
    console.log(">>>>>>>>>>>>>>>onload happening!");
    if (localFrame) {
      if (localObject.demoBoardWasLoaded === false) {
        console.log("First tab load. Using default preview.");
        previewFrameSrc = "/template/MyCustomContent/MySpirit/demo_Volcano Looming High.html";
        setTimeout(() => {
          readHTML(localFrame.contentDocument);
          localObject.demoBoardWasLoaded = true;
        }, 200);
      } else {
        console.log("Tab previously loaded. Reloaded from form.");
        previewFrameSrc = "/template/MyCustomContent/MySpirit/board_front_website.html";
        setTimeout(() => {
          reloadPreview();
        }, 200);
      }
    }
  }

  function setBoardValues(spiritBoard) {
    if (frame) {
      console.log("setting board values from form");
      console.log(frame.contentDocument);
      //Set Spirit Name and Image
      const spiritName = frame.contentDocument.querySelectorAll("spirit-name")[0];
      if (spiritName) {
        spiritName.textContent = spiritBoard.nameAndArt.name;
      }
      const board = frame.contentDocument.querySelectorAll("board")[0];
      console.log(board);
      board.setAttribute("spirit-image", spiritBoard.nameAndArt.artPath);
      board.setAttribute("spirit-image-scale", spiritBoard.nameAndArt.artScale);
      board.setAttribute("spirit-border", spiritBoard.nameAndArt.bannerPath);

      const artistName = frame.contentDocument.querySelectorAll("artist-name")[0];
      if (artistName) {
        artistName.textContent = spiritBoard.nameAndArt.artistCredit;
      } else {
        let newArtistElement = frame.contentDocument.createElement("artist-name");
        newArtistElement.textContent = spiritBoard.nameAndArt.artistCredit;
        board.appendChild(newArtistElement);
      }

      //Set Special Rules
      const specialRulesContainer =
        frame.contentDocument.querySelectorAll("special-rules-container")[0];
      if (specialRulesContainer) {
        specialRulesContainer.textContent = ""; // (easiest to start fresh each time)
        let specialRulesHeader = frame.contentDocument.createElement("section-title");
        specialRulesHeader.textContent = "SPECIAL RULES";
        specialRulesContainer.appendChild(specialRulesHeader);
      }
      spiritBoard.specialRules.rules.forEach((rule) => {
        let newRuleName = frame.contentDocument.createElement("special-rules-subtitle");
        newRuleName.textContent = rule.name;
        let newRuleEffect = frame.contentDocument.createElement("special-rule");
        newRuleEffect.innerHTML = rule.effect;
        specialRulesContainer.appendChild(newRuleName);
        specialRulesContainer.appendChild(newRuleEffect);
      });

      //Set Growth
      const growthContainer = frame.contentDocument.querySelectorAll("growth")[0];
      if (growthContainer) {
        growthContainer.textContent = ""; //(easiest to start fresh each time)
      }
      if (!spiritBoard.growth.useGrowthSets) {
        growthContainer.setAttribute("title", `Growth (${spiritBoard.growth.directions})`);
      } else {
        growthContainer.setAttribute("title", `Growth`);
      }

      spiritBoard.growth.growthSets.forEach((growthSet, i) => {
        let containerLayer;
        let newSubgroup;
        if (spiritBoard.growth.growthSets.length > 1) {
          newSubgroup = frame.contentDocument.createElement("sub-growth");
          newSubgroup.setAttribute("title", `${growthSet.choiceText}`);
          if (i < spiritBoard.growth.growthSets.length - 1) {
            newSubgroup.setAttribute("bordered", "");
          }
          containerLayer = newSubgroup;
        } else {
          containerLayer = growthContainer;
        }
        growthSet.growthGroups.forEach((growthGroup) => {
          let growthGroupOutput = frame.contentDocument.createElement("growth-group");

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
      const presenceTrackContainer = frame.contentDocument.querySelectorAll("presence-tracks")[0];
      if (presenceTrackContainer) {
        //(easiest to start fresh each time)
        presenceTrackContainer.textContent = "";
      }
      if (spiritBoard.presenceTrack.note) {
        presenceTrackContainer.setAttribute("note", spiritBoard.presenceTrack.note);
      } else {
        if (presenceTrackContainer.getAttribute("note")) {
          presenceTrackContainer.removeAttribute("note");
        }
      }
      checkTracksForCommas(); //swap commas for semicolons
      let energyTrack = frame.contentDocument.createElement("energy-track");
      energyTrack.setAttribute("banner", spiritBoard.nameAndArt.energyBannerPath);
      energyTrack.setAttribute("banner-v-scale", spiritBoard.nameAndArt.energyBannerScale);
      let energyValues = "";
      spiritBoard.presenceTrack.energyNodes.forEach((energyNode) => {
        energyValues += energyNode.effect + ",";
      });
      energyTrack.setAttribute("values", energyValues.slice(0, -1));
      presenceTrackContainer.appendChild(energyTrack);

      let playsTrack = frame.contentDocument.createElement("card-play-track");
      playsTrack.setAttribute("banner", spiritBoard.nameAndArt.playsBannerPath);
      playsTrack.setAttribute("banner-v-scale", spiritBoard.nameAndArt.playsBannerScale);
      let playsValues = "";
      spiritBoard.presenceTrack.playsNodes.forEach((playsNode) => {
        playsValues += playsNode.effect + ",";
      });
      playsTrack.setAttribute("values", playsValues.slice(0, -1));
      presenceTrackContainer.appendChild(playsTrack);

      //Set Innate Powers
      const innatePowerContainer = frame.contentDocument.querySelectorAll("innate-powers")[0];
      if (innatePowerContainer) {
        //(easiest to start fresh each time)
        innatePowerContainer.textContent = "";
      }

      spiritBoard.innatePowers.powers.forEach((power) => {
        let newInnatePower = frame.contentDocument.createElement("quick-innate-power");
        newInnatePower.setAttribute("name", power.name);
        newInnatePower.setAttribute("speed", power.speed.toLowerCase());
        newInnatePower.setAttribute("range", power.range);
        newInnatePower.setAttribute("target", power.target);
        newInnatePower.setAttribute("target-title", power.targetTitle);
        if (power.note) {
          newInnatePower.setAttribute("note", power.note);
        } // may need to clear it?
        power.levels.forEach((level) => {
          let newLevel = frame.contentDocument.createElement("level");
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
      let spiritStyle = frame.contentDocument.querySelectorAll("style")[0];
      if (!spiritStyle) {
        const spiritHead = frame.contentDocument.querySelectorAll("head")[0];
        spiritStyle = frame.contentDocument.createElement("style");
        spiritHead.appendChild(spiritStyle);
      }
      let customIconText = "";
      customIcons.icons.forEach((icon) => {
        customIconText +=
          "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
      });
      spiritStyle.textContent = customIconText;
    }
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

  function readHTML(htmlElement) {
    console.log("Loading Spirit Board from HTML into form (f=readHTML)");
    console.log(htmlElement);
    //Reads the Template HTML file into the Form
    //Load Spirit Name and Image
    const spiritName = htmlElement.querySelectorAll("spirit-name")[0];
    if (spiritName) {
      spiritBoard.nameAndArt.name = spiritName.textContent.trim();
    }
    const board = htmlElement.querySelectorAll("board")[0];
    spiritBoard.nameAndArt.artPath = board.getAttribute("spirit-image");
    spiritBoard.nameAndArt.artScale = board.getAttribute("spirit-image-scale");
    spiritBoard.nameAndArt.bannerPath = board.getAttribute("spirit-border");

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
    let presenceNote = presenceTracks.getAttribute("note");
    if (presenceNote) {
      spiritBoard.presenceTrack.note = presenceNote;
    } else {
      spiritBoard.presenceTrack.note = "";
    }
    let energyTrack = htmlElement.querySelectorAll("energy-track")[0];
    spiritBoard.nameAndArt.energyBannerPath = energyTrack.getAttribute("banner");
    spiritBoard.nameAndArt.energyBannerScale = energyTrack.getAttribute("banner-v-scale");
    let energyValues = energyTrack.getAttribute("values").split(",");
    spiritBoard.presenceTrack.energyNodes.splice(0, spiritBoard.presenceTrack.energyNodes.length); //Clear the Form first
    energyValues.forEach((value) => {
      spiritBoard = Lib.addEnergyTrackNode(spiritBoard, value);
    });
    let playsTrack = htmlElement.querySelectorAll("card-play-track")[0];
    spiritBoard.nameAndArt.playsBannerPath = playsTrack.getAttribute("banner");
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
          htmlLevel.textContent.trim(),
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
          customIcons = Lib.addCustomIcon(customIcons, customIcon);
          console.log(customIcon);
        });
      }
    }
  }

  function additionalScripts() {
    let fragment = new DocumentFragment();
    let scriptGeneralDummy = document.createElement("script");
    scriptGeneralDummy.type = "text/javascript";
    scriptGeneralDummy.src = "../../_global/js/general.js";
    let scriptBoardFrontDummy = document.createElement("script");
    scriptBoardFrontDummy.type = "text/javascript";
    scriptBoardFrontDummy.src = "../../_global/js/board_front.js";
    fragment.appendChild(scriptGeneralDummy);
    fragment.appendChild(scriptBoardFrontDummy);
    return fragment;
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=setBoardValues)");
    setBoardValues(spiritBoard);
    previewFrame.copyHTMLFrom(frame.contentDocument, additionalScripts());
    previewFrame.startMain();
    document.getElementById("updateButton").classList.remove("is-flashy");
  }

  function handleTextFileInput(event) {
    hideAll();
    let dummyEl = document.createElement("html");
    const file = event.target.files.item(0);
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const fileText = data.target.result;
        dummyEl.innerHTML = fileText;
        dummyEl.head = dummyEl.getElementsByTagName("head")[0];
        dummyEl.body = dummyEl.getElementsByTagName("body")[0];
        dummyEl.spiritName = dummyEl.querySelectorAll("spirit-name")[0];
        readHTML(dummyEl);
        setTimeout(() => {
          reloadPreview();
        }, 100);
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
    }
  }

  function exportSpiritBoard() {
    setBoardValues(spiritBoard);
    const element = document
      .getElementById("mod-frame")
      .contentWindow.document.getElementsByTagName("html")[0];
    const htmlFileName = spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.html";
    Lib.downloadString("data:text/html;charset=utf-8", element.innerHTML, htmlFileName);
  }

  function showInstructions() {
    isShowingInstructions = true;
    instructionsSource =
      "https://neubee.github.io/spirit-island-builder/instructions#spirit-board-play-side";
  }

  function openExamplesModal(event) {
    console.log(event.target.dataset.target);
    let examplesModal = document.getElementById(event.target.dataset.target);
    if (examplesModal.classList.contains("is-active")) {
      examplesModal.classList.remove("is-active");
    } else {
      examplesModal.classList.add("is-active");
    }
  }

  function closeExamplesModal(examplesModal) {
    examplesModal.classList.remove("is-active");
  }

  function loadNewExample(event) {
    let modFrame = document.getElementById("mod-frame");
    modFrame.src = event.target.id;
    console.log("loading new example");
    console.log("reading:");
    console.log(modFrame.contentDocument);
    console.log("from:");
    console.log(modFrame.src);
    // frame = frame;
    setTimeout(() => {
      readHTML(modFrame.contentDocument);
    }, 300);
    setTimeout(() => {
      reloadPreview();
      closeExamplesModal(document.getElementById("modal-js-example"));
      hideAll();
    }, 500);
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
    Lib.downloadString(ttsSaveMIMEType, ttsSave, jsonFileName);
  }

  function screenshotSetUp() {
    const fileNames = [spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.png"];
    const elementNamesInIframe = ["board"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }
</script>

<h5 class="title is-5 mb-0 no-anchor">Spirit Board Play Side</h5>

<PreviewFrame
  id="spirit-preview"
  src={previewFrameSrc}
  bind:this={previewFrame}
  bind:document={previewDoc} />

<div class="field has-addons mb-2">
  <div class="file is-success mr-1">
    <button
      class="button is-info js-modal-trigger mr-1"
      data-toggle="modal"
      data-target="modal-js-example"
      on:click={openExamplesModal}>
      Examples
    </button>
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
  <button class="button is-success  mr-1" on:click={exportSpiritBoard}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-success  mr-1" on:click={downloadTTSJSON}>Export TTS file</button>
  <button class="button is-warning  mr-1" id="updateButton" on:click={reloadPreview}
    >Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  <button class="button is-info  mr-1" on:click={showInstructions}>Instructions</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameAndArt bind:spiritBoard {showOrHideSection} />
    <SpecialRules bind:spiritBoard {showOrHideSection} />
    <CustomIcons bind:customIcons {showOrHideSection} />
  </div>
  <div class="column pt-0">
    <Growth bind:spiritBoard {showOrHideSection} />
    <PresenceTracks bind:spiritBoard {showOrHideSection} />
    <InnatePowers bind:spiritBoard {showOrHideSection} />
  </div>
</div>
<div id="holder">
  <iframe
    bind:this={frame}
    src="/template/MyCustomContent/MySpirit/OFFICIAL_Volcano Looming High.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="mod-frame" />
</div>
<div id="modal-js-example" class="modal">
  <div class="modal-background" />
  <div class="modal-content">
    <div class="box">
      <h1><b>Load Examples & Official Spirits</b></h1>
      <p><em>warning: will replace existing content</em></p>
      <p>Core and Branch & Claw Spirits:</p>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Ocean's Hungry Grasp.html"
        on:click={loadNewExample}>Ocean</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Serpent Slumbering Beneath the Island.html"
        on:click={loadNewExample}>Snek</button>
      <p>Jagged Earth Spirits:</p>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Downpour Drenches the World.html"
        on:click={loadNewExample}>Downpour</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Finder of Paths Unseen.html"
        on:click={loadNewExample}>Finder</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Fractured Days Split the Sky.html"
        on:click={loadNewExample}>Fractured Days</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Grinning Trickster Stirs Up Trouble.html"
        on:click={loadNewExample}>Trickster</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Lure of Deep Wilderness.html"
        on:click={loadNewExample}>Lure</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Many Minds Move as One.html"
        on:click={loadNewExample}>Many Minds</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Shifting Memory of Ages.html"
        on:click={loadNewExample}>Shifting Memory</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Shroud of Silent Mist.html"
        on:click={loadNewExample}>Shroud</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Stone's Unyielding Defiance.html"
        on:click={loadNewExample}>Stone</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Vengeance as a Burning Plague.html"
        on:click={loadNewExample}>Vengeance</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_Volcano Looming High.html"
        on:click={loadNewExample}>Volcano</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/OFFICIAL_APOCRYPHA_Spreading Rot Renews the Earth.html"
        on:click={loadNewExample}>Spreading Rot</button>
      <p>Nature Incarnate:</p>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/Ember-Eyed_Behemoth_spiritBoard.html"
        on:click={loadNewExample}>Ember-Eyed Behemoth</button>
      <p>Examples:</p>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_add_presence.html"
        on:click={loadNewExample}>Add Presence</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_add_presence_more.html"
        on:click={loadNewExample}>Add Presence (more)</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_custom_growth_presence_tracks.html"
        on:click={loadNewExample}>Custom Options</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_elements.html"
        on:click={loadNewExample}>Elements</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_energy.html"
        on:click={loadNewExample}>Energy</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_energy_more.html"
        on:click={loadNewExample}>Energy (more)</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_fear.html"
        on:click={loadNewExample}>Fear</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_gain_range.html"
        on:click={loadNewExample}>Gain Range</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_gather.html"
        on:click={loadNewExample}>Gather</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_middle_presence_tracks.html"
        on:click={loadNewExample}>Middle Presence Tracks</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_other.html"
        on:click={loadNewExample}>Other</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_push.html"
        on:click={loadNewExample}>Push</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_reclaim.html"
        on:click={loadNewExample}>Reclaim</button>
      <button
        class="button"
        id="/template/MyCustomContent/MySpirit/EXAMPLE_tokens.html"
        on:click={loadNewExample}>Tokens</button>
    </div>
  </div>
  <button
    class="modal-close is-large"
    aria-label="close"
    data-toggle="modal"
    data-target="modal-js-example"
    on:click={openExamplesModal} />
</div>
