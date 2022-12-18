<script>
  import { onMount } from "svelte";
  import NameAndArt from "./name-and-art.svelte";
  import SpecialRules from "./special-rules.svelte";
  import Growth from "./growth.svelte";
  import PresenceTracks from "./presence-tracks.svelte";
  import InnatePowers from "./innate-powers.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import * as Lib from "../lib";

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
  let scaledFrameSrc = "";

  onMount(() => {
    frame.addEventListener("load", onLoad());
  });

  function onLoad() {
    var localFrame = frame;
    var localObject = spiritBoard;
    console.log(">>>>>>>>>>>>>>>onload happening!");
    if (localFrame) {
      if (localObject.demoBoardWasLoaded === false) {
        console.log("First tab load. Using default preview.");
        scaledFrameSrc = "/template/MyCustomContent/MySpirit/demo_Volcano Looming High.html";
        setTimeout(() => {
          readHTML(localFrame.contentDocument);
          localObject.demoBoardWasLoaded = true;
        }, 200);
      } else {
        console.log("Tab previously loaded. Reloaded from form.");
        scaledFrameSrc = "/template/MyCustomContent/MySpirit/board_front_website.html";
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
        var newArtistElement = frame.contentDocument.createElement("artist-name");
        newArtistElement.textContent = spiritBoard.nameAndArt.artistCredit;
        board.appendChild(newArtistElement);
      }

      //Set Special Rules
      const specialRulesContainer =
        frame.contentDocument.querySelectorAll("special-rules-container")[0];
      if (specialRulesContainer) {
        specialRulesContainer.textContent = ""; // (easiest to start fresh each time)
        var specialRulesHeader = frame.contentDocument.createElement("section-title");
        specialRulesHeader.textContent = "SPECIAL RULES";
        specialRulesContainer.appendChild(specialRulesHeader);
      }
      spiritBoard.specialRules.rules.forEach((rule) => {
        var newRuleName = frame.contentDocument.createElement("special-rules-subtitle");
        newRuleName.textContent = rule.name;
        var newRuleEffect = frame.contentDocument.createElement("special-rule");
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
        var containerLayer;
        if (spiritBoard.growth.growthSets.length > 1) {
          var newSubgroup = frame.contentDocument.createElement("sub-growth");
          newSubgroup.setAttribute("title", `${growthSet.choiceText}`);
          if (i < spiritBoard.growth.growthSets.length - 1) {
            newSubgroup.setAttribute("bordered", "");
          }
          containerLayer = newSubgroup;
        } else {
          containerLayer = growthContainer;
        }
        growthSet.growthGroups.forEach((growthGroup) => {
          var growthGroupOutput = frame.contentDocument.createElement("growth-group");

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
          var values = "";
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
      var energyTrack = frame.contentDocument.createElement("energy-track");
      energyTrack.setAttribute("banner", spiritBoard.nameAndArt.energyBannerPath);
      energyTrack.setAttribute("banner-v-scale", spiritBoard.nameAndArt.energyBannerScale);
      var energyValues = "";
      spiritBoard.presenceTrack.energyNodes.forEach((energyNode) => {
        energyValues += energyNode.effect + ",";
      });
      energyTrack.setAttribute("values", energyValues.slice(0, -1));
      presenceTrackContainer.appendChild(energyTrack);

      var playsTrack = frame.contentDocument.createElement("card-play-track");
      playsTrack.setAttribute("banner", spiritBoard.nameAndArt.playsBannerPath);
      playsTrack.setAttribute("banner-v-scale", spiritBoard.nameAndArt.playsBannerScale);
      var playsValues = "";
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
        var newInnatePower = frame.contentDocument.createElement("quick-innate-power");
        newInnatePower.setAttribute("name", power.name);
        newInnatePower.setAttribute("speed", power.speed.toLowerCase());
        newInnatePower.setAttribute("range", power.range);
        newInnatePower.setAttribute("target", power.target);
        newInnatePower.setAttribute("target-title", power.targetTitle);
        if (power.note) {
          newInnatePower.setAttribute("note", power.note);
        } // may need to clear it?
        power.levels.forEach((level) => {
          var newLevel = frame.contentDocument.createElement("level");
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
      var customIconText = "";
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
    if (frame) {
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
      var htmlGrowthSets = growthContainer[0].querySelectorAll("sub-growth");
      var containerLayer;
      if (htmlGrowthSets[0]) {
        // if the HTML file isn't using subgroups (Growth Sets), then there's a whole layer that's missing... this gynamstics accounts for it.
        spiritBoard.growth.useGrowthSets = true;
        containerLayer = htmlGrowthSets;
      } else {
        containerLayer = growthContainer;
      }

      // Identify text inside the parathesis of the growth option (if any) ie. for Growth (Pick Two), this code will find Pick Two
      var regExpOuterParentheses = /\(\s*(.+)\s*\)/;
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

      var presenceTracks = htmlElement.querySelectorAll("presence-tracks")[0];
      var presenceNote = presenceTracks.getAttribute("note");
      if (presenceNote) {
        spiritBoard.presenceTrack.note = presenceNote;
      } else {
        spiritBoard.presenceTrack.note = "";
      }
      var energyTrack = htmlElement.querySelectorAll("energy-track")[0];
      spiritBoard.nameAndArt.energyBannerPath = energyTrack.getAttribute("banner");
      spiritBoard.nameAndArt.energyBannerScale = energyTrack.getAttribute("banner-v-scale");
      var energyValues = energyTrack.getAttribute("values").split(",");
      spiritBoard.presenceTrack.energyNodes.splice(0, spiritBoard.presenceTrack.energyNodes.length); //Clear the Form first
      energyValues.forEach((value) => {
        spiritBoard = Lib.addEnergyTrackNode(spiritBoard, value);
      });
      var playsTrack = htmlElement.querySelectorAll("card-play-track")[0];
      spiritBoard.nameAndArt.playsBannerPath = playsTrack.getAttribute("banner");
      spiritBoard.nameAndArt.playsBannerScale = playsTrack.getAttribute("banner-v-scale");
      var playsValues = playsTrack.getAttribute("values").split(",");
      spiritBoard.presenceTrack.playsNodes.splice(0, spiritBoard.presenceTrack.playsNodes.length); //Clear the Form first
      playsValues.forEach((value) => {
        spiritBoard = Lib.addPlaysTrackNode(spiritBoard, value);
      });

      //Load Innate Powers
      var innatePowers = htmlElement.querySelectorAll("quick-innate-power");
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
        var htmlLevels = innatePower.querySelectorAll("level");
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
  }

  function copyHTML() {
    console.log("Copying HTML from Form to Preview (f=copyHTML)");
    var modFrame = document.getElementById("mod-frame");
    modFrame.doc = document.getElementById("mod-frame").contentWindow.document;
    modFrame.head = modFrame.doc.getElementsByTagName("head")[0];
    modFrame.body = modFrame.doc.getElementsByTagName("body")[0];
    var scaledFrame = document.getElementById("scaled-frame");
    scaledFrame.doc = document.getElementById("scaled-frame").contentWindow.document;
    scaledFrame.head = scaledFrame.doc.getElementsByTagName("head")[0];
    scaledFrame.body = scaledFrame.doc.getElementsByTagName("body")[0];

    let bodyClone;
    bodyClone = document.getElementById("mod-frame").contentWindow.document.body.cloneNode(true);
    document.getElementById("scaled-frame").contentWindow.document.body = bodyClone;
    let headClone = modFrame.head.cloneNode(true);
    console.log("headClone: ", headClone);
    addJavaToHead(headClone);
    console.log("headClone: ", headClone);
    scaledFrame.head.parentElement.replaceChild(headClone, scaledFrame.head);
  }

  function addJavaToHead(head) {
    var scriptGeneralDummy = document.createElement("script");
    scriptGeneralDummy.type = "text/javascript";
    scriptGeneralDummy.src = "../../_global/js/general.js";
    var scriptBoardFrontDummy = document.createElement("script");
    scriptBoardFrontDummy.type = "text/javascript";
    scriptBoardFrontDummy.src = "../../_global/js/board_front.js";
    head.appendChild(scriptGeneralDummy);
    head.appendChild(scriptBoardFrontDummy);
    return head;
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=setBoardValues)");
    setBoardValues(spiritBoard);
    copyHTML();
    console.log("startMain");
    document.getElementById("scaled-frame").contentWindow.startMain();
    // document.getElementById('scaled-frame').contentWindow.location.reload();
  }

  let frameLarge = false;
  function toggleSize() {
    var displayFrame = document.getElementById("scaled-frame");
    var displayWrap = document.getElementById("board-wrap");

    if (!frameLarge) {
      displayFrame.style.webkitTransform = "scale(0.745)";
      displayWrap.style.height = "915px";
      window.scrollBy(0, 245);
    } else {
      displayFrame.style.webkitTransform = "scale(0.55)";
      displayWrap.style.height = "670px";
    }
    frameLarge = !frameLarge;
  }

  function handleTextFileInput(event) {
    hideAll();
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
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," +
        encodeURI(
          document
            .getElementById("mod-frame")
            .contentWindow.document.getElementsByTagName("html")[0].innerHTML
        )
    );
    element.setAttribute(
      "download",
      spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.html"
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function showInstructions() {
    isShowingInstructions = true;
    instructionsSource =
      "https://neubee.github.io/spirit-island-builder/instructions#spirit-board-play-side";
  }

  function openExamplesModal(event) {
    console.log(event.target.dataset.target);
    var examplesModal = document.getElementById(event.target.dataset.target);
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
    var modFrame = document.getElementById("mod-frame");
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
    }, 400);
  }

  async function downloadTTSJSON() {
    const response = await fetch("/template/MyCustomContent/MySpirit/Spirit_Blank_JSON.json");
    let myJSON = await response.json();
    console.log(myJSON);
    console.log(myJSON.ObjectStates[0]);

    const board = document
      .getElementById("scaled-frame")
      .contentDocument.querySelectorAll("board")[0];
    const boardRect = board.getBoundingClientRect();

    //Snap Points
    var presenceNodes = Array.from(board.getElementsByTagName("presence-node"));
    console.log(presenceNodes);
    presenceNodes.forEach((node) => {
      var rect = node.getElementsByTagName("ring-icon")[0].getBoundingClientRect();
      if (node.classList.contains("first")) {
        console.log("skip");
      } else {
        var nodeX =
          (-(boardRect.width / boardRect.height) *
            (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
          (boardRect.width / 2);
        var nodeY =
          (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) / (boardRect.height / 2);
        console.log(
          "my midpoint x,z= " + parseFloat(nodeX).toFixed(4) + "%, " + parseFloat(nodeY) + "%"
        );
        myJSON.ObjectStates[0].AttachedSnapPoints.push({
          Position: {
            x: nodeX,
            y: 0.2,
            z: nodeY,
          },
        });
      }
    });

    var luaScriptState = "";

    //Lua scripting - thresholds
    const thresholds = Array.from(board.getElementsByTagName("threshold"));
    luaScriptState += '{"thresholds": [';
    thresholds.forEach((threshold) => {
      console.log(threshold);
      var icons = Array.from(threshold.getElementsByTagName("icon"));

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
      luaScriptState += '{"elements": ';
      //elements
      luaScriptState += '"' + elementCounts.join("") + '", ';

      //position
      luaScriptState += '"position": ';
      var rect = threshold.getBoundingClientRect();
      console.log(rect);
      console.log(boardRect);
      var nodeX =
        (-(boardRect.width / boardRect.height) *
          (-23 + rect.left - boardRect.x - boardRect.width / 2)) /
        (boardRect.width / 2);
      var nodeY =
        (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) / (boardRect.height / 2);
      luaScriptState += '{"x": ' + parseFloat(nodeX).toFixed(4);
      luaScriptState += ', "y": 0';
      luaScriptState += ', "z": ' + parseFloat(nodeY).toFixed(4);
      luaScriptState += "}}, ";
    });
    luaScriptState = luaScriptState.slice(0, -2); // delete the comma
    luaScriptState += "],";

    //Lua scripting - track energy & elements
    var formNodes = spiritBoard.presenceTrack.energyNodes.concat(
      spiritBoard.presenceTrack.playsNodes
    );
    var boardNodes = Array.from(board.getElementsByTagName("presence-node"));
    luaScriptState += '"trackElements": [';
    var regExpOuterParentheses = /\(\s*(.+)\s*\)/;
    formNodes.forEach((node, j) => {
      var nodeEffectText = node.effect;
      var matches = regExpOuterParentheses.exec(nodeEffectText);
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
      for (var i = 0; i < namesList.length; i++) {
        if (namesList[i] == "sun") {
          elementCounts[0] = countList[i];
        }
        if (namesList[i] == "moon") {
          elementCounts[1] = countList[i];
        }
        if (namesList[i] == "fire") {
          elementCounts[2] = countList[i];
        }
        if (namesList[i] == "air") {
          elementCounts[3] = countList[i];
        }
        if (namesList[i] == "water") {
          elementCounts[4] = countList[i];
        }
        if (namesList[i] == "earth") {
          elementCounts[5] = countList[i];
        }
        if (namesList[i] == "plant") {
          elementCounts[6] = countList[i];
        }
        if (namesList[i] == "animal") {
          elementCounts[7] = countList[i];
        }
      }
      if (elementCounts.reduce((partialSum, a) => partialSum + a, 0) > 0) {
        luaScriptState += '{"elements": ';
        luaScriptState += '"' + elementCounts.join("") + '", ';
        //position
        var rect = boardNodes[j].getElementsByTagName("ring-icon")[0].getBoundingClientRect();
        var nodeX =
          (-(boardRect.width / boardRect.height) *
            (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
          (boardRect.width / 2);
        var nodeY =
          (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) / (boardRect.height / 2);
        console.log(nodeX);
        console.log(nodeY);
        luaScriptState += '"position": ';
        luaScriptState += '{"x": ' + parseFloat(nodeX).toFixed(4);
        luaScriptState += ', "y": 0';
        luaScriptState += ', "z": ' + parseFloat(nodeY).toFixed(4);
        luaScriptState += "}}, ";
      }
    });
    luaScriptState = luaScriptState.slice(0, -2); // delete the comma
    luaScriptState += "],";
    luaScriptState += '"trackEnergy": [';

    var energyNodes = spiritBoard.presenceTrack.energyNodes.slice().reverse();
    var formEnergyNodes = Array.from(
      board.getElementsByClassName("energy-track")[0].getElementsByTagName("presence-node")
    ).reverse();
    console.log(energyNodes);
    console.log(formEnergyNodes);
    console.log(spiritBoard);
    var maxEnergy = 100;
    energyNodes.forEach((node, i) => {
      var nodeEffectText = node.effect;
      var matches = regExpOuterParentheses.exec(nodeEffectText);
      if (matches) {
        nodeEffectText = matches[1];
      }

      const nameCounts = {};
      nodeEffectText.split("+").forEach(function (x) {
        nameCounts[x] = (nameCounts[x] || 0) + 1;
      });

      let namesList = Object.keys(nameCounts);
      for (var j = 0; j < namesList.length; j++) {
        if (!isNaN(namesList[j])) {
          if (namesList[j] < maxEnergy) {
            maxEnergy = namesList[j];
            luaScriptState += '{"count": ' + maxEnergy + ", ";

            //position
            var rect = formEnergyNodes[i]
              .getElementsByTagName("ring-icon")[0]
              .getBoundingClientRect();
            var nodeX =
              (-(boardRect.width / boardRect.height) *
                (rect.x + rect.width / 2 - boardRect.x - boardRect.width / 2)) /
              (boardRect.width / 2);
            var nodeY =
              (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
              (boardRect.height / 2);
            console.log(formEnergyNodes[i]);
            console.log(rect);
            console.log(nodeX);
            console.log(nodeY);
            luaScriptState += '"position": ';
            luaScriptState += '{"x": ' + parseFloat(nodeX).toFixed(4);
            luaScriptState += ', "y": 0';
            luaScriptState += ', "z": ' + parseFloat(nodeY).toFixed(4);
            luaScriptState += "}}, ";
          }
        }
      }
    });
    luaScriptState = luaScriptState.slice(0, -2); // delete the comma
    luaScriptState += "]";
    luaScriptState += "}";
    console.log(luaScriptState);
    console.log(JSON.parse(luaScriptState));

    myJSON.ObjectStates[0].LuaScriptState = luaScriptState;
    myJSON.ObjectStates[0].Nickname = spiritBoard.nameAndArt.name;
    myJSON.ObjectStates[0].Tags.push("Spirit");

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/json;charset=utf-8," + encodeURI(JSON.stringify(myJSON))
    );
    element.setAttribute(
      "download",
      spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_TTS.json"
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function screenshotSetUp() {
    const frameId = "scaled-frame";
    const fileNames = [spiritBoard.nameAndArt.name.replaceAll(" ", "_") + "_SpiritBoard.png"];
    const elementNamesInIframe = ["board"];
    Lib.takeScreenshot(frameId, fileNames, elementNamesInIframe);
  }
</script>

<h5 class="title is-5 mb-0">Spirit Board Play Side</h5>
<!-- <h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview
  <span on:click={showOrHideBoard}>
    {#if spiritBoard.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6> -->
<div id="board-wrap">
  <iframe src={scaledFrameSrc} height="600" width="100%" id="scaled-frame" title="Scaled Frame" />
</div>

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
  <button class="button is-warning  mr-1" on:click={reloadPreview}>Refresh Image</button>
  <button class="button is-warning mr-1" on:click={toggleSize}>Toggle Board Size</button>
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
