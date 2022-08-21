<script>
  import { onMount } from "svelte";
  import NameAndArt from "./name-and-art.svelte";
  import SpecialRules from "./special-rules.svelte";
  import Growth from "./growth.svelte";
  import PresenceTracks from "./presence-tracks.svelte";
  import InnatePowers from "./innate-powers.svelte";
  import CustomIcons from "./custom-icons.svelte";
  import * as Lib from "./lib";
  // import addGrowthAction from './growth.svelte'
  // import { addGrowthSet, addGrowthGroup, addGrowthAction, removeGrowthAction, removeGrowthGroup, removeGrowthSet } from './growth.svelte'

  let spiritBoard = {
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
              hasCost: false,
              hasTint: false,
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
      name: "",
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

  function showOrHideSection(event) {
    spiritBoard[event.target.id].isVisible = !spiritBoard[event.target.id].isVisible;
  }

  let frame;
  onMount(() => {
    frame.addEventListener("load", onLoad());
  });

  function onLoad() {
    if (frame) {
      // readHTML();
      // setBoardValues(spiritBoard);
      // reloadPreview();
      setTimeout(() => {
        readHTML(frame.contentDocument);
      }, 200);
    }
  }

  function setBoardValues(spiritBoard) {
    console.log(spiritBoard);
    if (frame) {
      //Set Spirit Name and Image
      const spiritName = frame.contentDocument.querySelectorAll("spirit-name")[0];
      if (spiritName) {
        spiritName.textContent = spiritBoard.nameAndArt.name;
      }
      const board = frame.contentDocument.querySelectorAll("board")[0];
      board.setAttribute("spirit-image", spiritBoard.nameAndArt.artPath);
      board.setAttribute("spirit-image-scale", spiritBoard.nameAndArt.artScale);
      board.setAttribute("spirit-border", spiritBoard.nameAndArt.bannerPath);

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
        newRuleEffect.textContent = rule.effect;
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
          newLevel.textContent = level.effect;
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
      spiritBoard.customIcons.icons.forEach((icon) => {
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
  }

  function showOrHideBoard() {
    if (document.getElementById("board-wrap").style.display == "none") {
      document.getElementById("board-wrap").style.display = "block";
    } else {
      document.getElementById("board-wrap").style.display = "none";
    }
    console.log("this iiis a test");
    console.log(document.getElementById("board-wrap"));
    console.log(document.getElementById("board-wrap").style.display);
  }

  function readHTML(htmlElement) {
    console.log("Loading default spirit board into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    if (frame) {
      //Load Spirit Name and Image
      const spiritName = htmlElement.querySelectorAll("spirit-name")[0];
      if (spiritName) {
        console.log(spiritName);
        spiritBoard.nameAndArt.name = spiritName.textContent.trim();
      }
      const board = htmlElement.querySelectorAll("board")[0];
      spiritBoard.nameAndArt.artPath = board.getAttribute("spirit-image");
      spiritBoard.nameAndArt.artScale = board.getAttribute("spirit-image-scale");
      spiritBoard.nameAndArt.bannerPath = board.getAttribute("spirit-border");

      //Load Special Rules
      const specialRulesNames = htmlElement.querySelectorAll("special-rules-subtitle");
      const specialRulesEffects = htmlElement.querySelectorAll("special-rule");
      spiritBoard.specialRules.rules.splice(0, spiritBoard.specialRules.rules.length); //Clear the Form first
      specialRulesNames.forEach((specialRulesName, j) => {
        spiritBoard = Lib.addSpecialRule(
          spiritBoard,
          specialRulesName.textContent,
          specialRulesEffects[j].textContent.trim()
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
            group.getAttribute("tint")
          );
          let values = group.getAttribute("values").split(";");
          values.forEach((growthValue) => {
            spiritBoard = Lib.addGrowthAction(spiritBoard, i, j, growthValue);
          });
        });
      });

      //Load Presence Tracks

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
      spiritBoard.customIcons.icons.splice(0, spiritBoard.customIcons.icons.length); //Clear the Form first
      if (spiritStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = spiritStyle.textContent.match(regExp);
        console.log(iconList);
        iconList.forEach((customIcon) => {
          spiritBoard = Lib.addCustomIcon(spiritBoard, customIcon);
          console.log(customIcon);
        });
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
    scaledFrame.head.parentElement.replaceChild(headClone, scaledFrame.head);
  }

  function reloadPreview() {
    console.log("Updating Preview Board (f=setBoardValues)");
    setBoardValues(spiritBoard);
    console.log("Reloading Preview (f=copyHTML)");
    copyHTML();
    document.getElementById("scaled-frame").contentWindow.startMain();
  }

  let frameLarge = false;
  function toggleSize() {
    var displayFrame = document.getElementById("scaled-frame");
    var displayWrap = document.getElementById("board-wrap");
    if (!frameLarge) {
      displayFrame.style.webkitTransform = "scale(0.75)";
      displayWrap.style.height = "915px";
    } else {
      displayFrame.style.webkitTransform = "scale(0.55)";
      displayWrap.style.height = "670px";
    }
    frameLarge = !frameLarge;
  }

  function handleTextFileInputB(event) {
    var dummyEl = document.createElement("html");

    const file = event.target.files.item(0);
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const fileText = data.target.result;
        dummyEl.innerHTML = fileText;
        console.log(dummyEl);
        dummyEl.head = dummyEl.getElementsByTagName("head")[0];
        dummyEl.body = dummyEl.getElementsByTagName("body")[0];
        dummyEl.spiritName = dummyEl.querySelectorAll("spirit-name")[0];
        console.log(dummyEl.head);
        console.log(dummyEl.body);
        console.log(dummyEl.spiritName);
        readHTML(dummyEl);
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
    }
  }
</script>

<h5 class="title is-5">Spirit Board</h5>
<h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview Spirit Board
  <span on:click={showOrHideBoard}>
    {#if spiritBoard.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
<div id="board-wrap">
  <iframe
    src="/template/MyCustomContent/MySpirit/start_OFFICIAL_Lure of Deep Wilderness.html"
    height="600"
    width="100%"
    id="scaled-frame"
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
        on:change={handleTextFileInputB} />
      <span class="file-cta">
        <span class="file-label"> Load Spirit Board file </span>
      </span>
    </label>
  </div>
  <button class="button is-success  mr-1" on:click={reloadPreview}>Generate Spirit Board</button>
  <button class="button is-success  mr-1" on:click={toggleSize}>Toggle Board Size</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <!-- Any kind of property can be passed to a component. Functions and variables. As long as they are also exported from the nested component (i.e. NameAndArt) they will be available for use in the nested component -->

    <NameAndArt bind:spiritBoard {showOrHideSection} />
    <SpecialRules bind:spiritBoard {showOrHideSection} />
    <CustomIcons bind:spiritBoard {showOrHideSection} />
  </div>
  <div class="column pt-0">
    <Growth bind:spiritBoard {showOrHideSection} />
    <PresenceTracks bind:spiritBoard {showOrHideSection} />
    <InnatePowers bind:spiritBoard {showOrHideSection} />
  </div>
</div>
<article class="message is-small mb-1">
  <div class="message-body p-1">
    See <a
      href="https://github.com/neubee/spirit-island-builder/blob/andrew-edits/docs/instructions.md"
      >Instructions</a
    >. This is an unofficial website. GUI created by Neubee & Resonant. Spirit Board builder adapted
    from HTML template developed by Spirit Island fanbase. All materials belong to Greater Than
    Games, LLC.
  </div>
</article>
<div id="holder">
  <iframe
    bind:this={frame}
    src="/template/MyCustomContent/MySpirit/OFFICIAL_Lure of Deep Wilderness.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="mod-frame" />
</div>
