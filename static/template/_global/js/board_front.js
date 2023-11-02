"use strict";

// const { text } = require("svelte/internal");

/* global replaceIcon */

/* exported startMain */
async function startMain() {
  console.log("Spirit Board startMain");
  if (document.getElementsByTagName("board")[0]) {
    console.log("CREATING SPIRIT BOARD");
    setupCustomIcons();

    buildGrowthPanel();

    if (document.getElementById("presence-table")) {
      enhancePresenceTracksTable();
    } else {
      setNewEnergyCardPlayTracks(parseEnergyTrackTags(), parseCardPlayTrackTags());
    }

    parseInnatePowers();

    parseSpecialRules();

    const board = document.querySelectorAll("board")[0];
    const html = board.innerHTML;
    board.innerHTML = replaceIcon(html);

    // This needs to be removed at some point, none of the code in here should be asynchronus and both dynamicResizing and addImages should not need to wait before they work properly. We have a race condition that works most of the time but will fail for some people.
    await waitPromise(200);
    dynamicResizing();
    addImages(board);
    tagSectionHeadings();

    return 1;
  } else {
    console.log("nice try, this is not a spirit board!");
  }

  // Added this so that the startMain call from preview-frame can await the async part of startMain
  async function waitPromise(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

function addImages(board) {
  console.log("ADDING IMAGES");
  const spiritImage = board.getAttribute("spirit-image");
  board.removeAttribute("spirit-image");
  const artistCredit = board.getElementsByTagName("artist-name");
  const spiritBorder = board.getAttribute("spirit-border");
  board.removeAttribute("spirit-border");
  const spiritNamePanel = board.querySelectorAll("spirit-name")[0];
  const imageSize = board.getAttribute("spirit-image-scale");
  board.removeAttribute("spirit-image-scale");

  const specialRules = board.querySelectorAll("special-rules-container")[0];
  let height = specialRules.getAttribute("height");
  if (!height) {
    const computedStyle = window.getComputedStyle(specialRules);
    height = computedStyle.getPropertyValue("height");
  }

  //Scale Spirit Name if too large
  let nameFontSize = parseFloat(
    window.getComputedStyle(spiritNamePanel, null).getPropertyValue("font-size")
  );
  while (checkOverflowHeight(spiritNamePanel)) {
    nameFontSize -= 1;
    spiritNamePanel.style.fontSize = nameFontSize + "px";
    if (nameFontSize < 35) {
      console.log("too small, break");
      break;
    }
  }

  if (spiritBorder) {
    const spiritBorderSize = board.getAttribute("spirit-border-scale");
    spiritNamePanel.style.backgroundImage = `url(${spiritBorder})`;
    const borderHeight = spiritBorderSize !== null ? spiritBorderSize : "100px";
    spiritNamePanel.style.backgroundSize = `705px ${borderHeight}`;
  }
  if (spiritImage) {
    //Image now scales to fill gap. 'imageSize' allows the user to specify what % of the gap to cover
    board.innerHTML =
      `<div class="spirit-image" style="background-image: url(${spiritImage}); background-size: auto ${imageSize}; width:1700px;" ></div>` +
      board.innerHTML;
    artistCredit[0].style.display = "block";
    artistCredit[0].innerHTML = "Artist Credit: " + artistCredit[0].innerHTML;
  }

  //Add Meeple
  const spiritName = board.getElementsByTagName("spirit-name");
  spiritName[0].outerHTML += "<custom-meeple></custom-meeple>";
  spiritName[0].outerHTML += "<created-with>spiritislandbuilder.com</created-with>";
}

function buildGrowthPanel() {
  console.log("BUILDING GROWTH PANEL");
  const board = document.querySelectorAll("board")[0];
  const growthHTML = board.getElementsByTagName("growth");

  // Allow custom heading name
  let customNameText = growthHTML[0].getAttribute("customname")
    ? ` customName="${growthHTML[0].getAttribute("customname")}"`
    : "";

  const growthTitle = `<section-title${customNameText}>${growthHTML[0].title}</section-title>`;

  const subList = Array.from(growthHTML[0].getElementsByTagName("sub-growth"));
  let subTitle = subList
    .map(
      (e) =>
        `<sub-section-title><sub-section-line></sub-section-line><span>${e.title}</span><sub-section-line></sub-section-line></sub-section-title>`
    )
    .join("");

  const newGrowthTableTagOpen = "<growth-table>";
  const newGrowthTableTagClose = "</growth-table>";

  let newGrowthCellHTML = "";

  let currentHeaderIndex = 0;
  let setIndex = 0;
  let groupIndex = 0;

  for (let i = 0; i < growthHTML[0].children.length; i++) {
    const childElement = growthHTML[0].children[i];
    const nextElement =
      i < growthHTML[0].children.length - 1 ? growthHTML[0].children[i + 1] : undefined;

    if (childElement.nodeName.toLowerCase() === "sub-growth") {
      // Using Growth Sets
      for (let j = 0; j < childElement.children.length; j++) {
        const nextSubElement =
          j < childElement.children.length - 1 ? childElement.children[j + 1] : undefined;

        newGrowthCellHTML += writeGrowthGroup(
          childElement.children[j],
          setIndex,
          groupIndex,
          childElement.title ? currentHeaderIndex : undefined
        );

        // Add single border
        if (nextSubElement && nextSubElement.nodeName.toLowerCase() === "growth-group") {
          newGrowthCellHTML +=
            "<growth-border" + ` header=${currentHeaderIndex}` + "></growth-border>";
          groupIndex += 1;
        }
      }

      if (childElement.title) {
        currentHeaderIndex++;
      }

      if (childElement.getAttribute("bordered") !== undefined && nextElement) {
        newGrowthCellHTML += `<growth-border double></growth-border>`;
        groupIndex = 0;
        setIndex += 1;
      }
    } else {
      // Not Using Growth Sets
      newGrowthCellHTML += writeGrowthGroup(childElement, setIndex, groupIndex);
      if (nextElement && nextElement.nodeName.toLowerCase() === "growth-group") {
        newGrowthCellHTML += "<growth-border></growth-border>";
        groupIndex += 1;
      }
    }
  }
  const fullHTML =
    growthTitle + subTitle + newGrowthTableTagOpen + newGrowthCellHTML + newGrowthTableTagClose;

  board.getElementsByTagName("growth")[0].removeAttribute("title");
  board.getElementsByTagName("growth")[0].innerHTML = fullHTML;
}

function writeGrowthGroup(growthGroup, setIndex = 0, groupIndex = 0, headerIndex = NaN) {
  let debug = true;

  console.log("--Growth Group s" + setIndex + "g" + groupIndex + "--");
  if (debug) {
    console.log("growthGroup: " + growthGroup.outerHTML);
  }

  let growthGroupHTML = "";

  const tint = growthGroup.getAttribute("tint");
  let tint_text = "";
  if (tint) {
    tint_text += "<div class='tint' style='background-color:" + tint + ";'></div>";
  }

  const headerText = !isNaN(headerIndex) ? ` header='${headerIndex}'` : "";
  const specialTitleText = growthGroup.getAttribute("special-title")
    ? ` special-title='${growthGroup.getAttribute("special-title")}'`
    : "";
  const specialTitleTextLeft = growthGroup.getAttribute("special-title-left")
    ? ` special-title-left='${growthGroup.getAttribute("special-title-left")}'`
    : "";

  if (specialTitleTextLeft) {
    console.log("Found special title");
    console.log(growthGroup);
  }
  growthGroupHTML += `<growth-group` + headerText + specialTitleText + specialTitleTextLeft + `>`;

  const cost = growthGroup.getAttribute("cost");
  if (cost) {
    const costSplit = cost.split(",");
    if (isNaN(costSplit[0])) {
      // Non-numerical cost (ie. forget a card)
      if (costSplit[1]) {
        // Non-numerical cost with text
        growthGroupHTML +=
          "<growth-cost class='custom nonscaling'>{" +
          costSplit[0] +
          "}<growth-cost-custom-nonscaling-description>" +
          costSplit[1] +
          "</growth-cost-custom-nonscaling-description></growth-cost>";
      } else {
        // non-numerical cost by itself
        growthGroupHTML +=
          "<growth-cost class='custom nonscaling'>{" +
          costSplit[0] +
          "}<growth-cost-custom-nonscaling-description></growth-cost-custom-nonscaling-description></growth-cost>";
      }
    } else if (costSplit[1]) {
      // User wants to use a non-energy scaling cost
      if (debug) {
        console.log("Cost with custom icon");
      }
      growthGroupHTML +=
        "<growth-cost class='custom'><icon class='" +
        costSplit[1] +
        "'><value>-" +
        costSplit[0] +
        "</value></icon></growth-cost>";
    } else {
      // Its just a number, so do energy cost
      growthGroupHTML += `<growth-cost>-${costSplit[0]}</growth-cost>`;
    }
  }

  const growthActions = growthGroup.getAttribute("values").split(";");
  console.log(growthActions);

  let nextGrowthAction;
  for (let j = 0; j < growthActions.length; j++) {
    try {
      nextGrowthAction = writeGrowthAction(growthActions[j], setIndex, groupIndex, j, tint_text);
    } catch (e) {
      nextGrowthAction = writeGrowthAction("custom(error! check syntax)");
    }
    growthGroupHTML += nextGrowthAction;
  }

  growthGroupHTML += "</growth-group>";

  return growthGroupHTML;
}

function writeGrowthAction(
  growthAction,
  setIndex = 0,
  groupIndex = 0,
  actionIndex = 0,
  tint_text = ""
) {
  let debug = false;
  const regExpOuterParentheses = /\(\s*(.+)\s*\)/;
  const regExpCommaNoParentheses = /,(?![^(]*\))/;

  let growthActionHTML = "";
  let growthActionType = growthAction.split("(")[0].split("^")[0];
  let growthActionID = "s" + setIndex + "g" + groupIndex + "a" + actionIndex;
  if (debug) {
    console.log("Growth Action " + growthActionID + ": " + growthAction);
    console.log("Growth Action Type: " + growthActionType);
  }

  // Some tools for OR and Presence nodes
  let isOr = false;
  let isPresenceNode = false;

  let orGrowthActions;
  let numActions = 1;
  if (growthActionType === "or") {
    console.log("'or' growth detected");
    isOr = true;
    const matches = regExpOuterParentheses.exec(growthAction)[1];
    orGrowthActions = matches.split(regExpCommaNoParentheses);
    growthAction = orGrowthActions[0];
    numActions = orGrowthActions.length;
  }

  // Check for Presence Node in Growth
  if (growthActionType === "presence-node") {
    const matches = regExpOuterParentheses.exec(growthAction)[1];
    if (debug) {
      console.log("Putting Presence Node in Growth");
      console.log(matches);
    }
    isPresenceNode = true;
    growthAction = matches;
    growthActionType = growthAction.split("(")[0].split("^")[0];
  }

  // Establish Growth HTML Openers and Closers
  let growthOpen = "<growth-cell id='" + growthActionID + "'>" + tint_text;
  let growthTextOpen = "<growth-text>";
  let growthTextClose = "</growth-text></growth-cell>";
  let growthIcons = "";
  let growthText = "";

  // Get the Text and Icons for the Growth Action
  let actionIconsAndText = getGrowthActionTextAndIcons(growthAction);
  growthIcons = actionIconsAndText[0];
  growthText = actionIconsAndText[1];
  for (let a = 1; a < numActions; a++) {
    // For an 'or' growth, loop through the additional actions
    actionIconsAndText = getGrowthActionTextAndIcons(orGrowthActions[a]);
    growthText += " or " + actionIconsAndText[1];
    growthIcons += "or" + actionIconsAndText[0];
  }

  //Handle Presence Node
  if (isPresenceNode) {
    growthIcons =
      '<presence-node class="growth"><ring-icon>' + growthIcons + "</ring-icon></presence-node>";
    isPresenceNode = false;
  }

  //Handle Ors
  if (isOr) {
    growthIcons = "<growth-cell-double>" + growthIcons + "</growth-cell-double>";
  }

  growthActionHTML = growthOpen + growthIcons + growthTextOpen + growthText + growthTextClose;
  return growthActionHTML;
}

function getGrowthActionTextAndIcons(growthAction) {
  let growthActionType = growthAction.split("(")[0].split("^")[0];
  const terrains = new Set(["wetland", "mountain", "sand", "sands", "jungle"]);
  const elementNames = new Set(["sun", "moon", "fire", "air", "plant", "water", "earth", "animal"]);
  const regExp = /\(([^)]+)\)/;
  const regExpOuterParentheses = /\(\s*(.+)\s*\)/;

  //Find if a growth effect is repeated (Fractured Days)
  let repeatOpen = "";
  let repeatText = "";
  if (growthAction.split("^")[1]) {
    const repeat = growthAction.split("^")[1];
    if (!isNaN(repeat)) {
      // Normal repeat
      repeatOpen = "<repeat-growth><value>" + repeat + "</value></repeat-growth>";
      repeatText = "x" + repeat + ": ";
    } else if (repeat.startsWith("cost(")) {
      // Energy Cost (syntax ^cost(-2) )
      const matches = regExp.exec(growthAction);
      if (matches) {
        let energy_cost = matches[1];
        repeatOpen = `<repeat-growth class='energy-cost'><value>-${energy_cost}</value></repeat-growth>`;
        repeatText = `You may pay ${energy_cost} Energy to `;
      } else {
        repeatText = "";
      }
    } else {
      // Reject other options
      repeatText = "";
    }
    growthAction = growthAction.split("^")[0];
  }

  let growthIcons, growthText;
  switch (growthActionType) {
    // Simple growth items are handled in the 'Default' case. See function IconName.
    // Only growth items with options are handled here.
    case "reclaim": {
      const matches = regExp.exec(growthAction);
      let reclaimIcon = "{reclaim-all}";
      let reclaimText = IconName("reclaim" + "-all");
      if (matches) {
        let reclaimOptions = matches[1].split(",");
        let reclaimType = reclaimOptions[0];
        let reclaimModifiersOrText = reclaimOptions[1];
        switch (reclaimType) {
          case "all":
            if (reclaimModifiersOrText) {
              reclaimIcon =
                "<icon class='reclaim-" +
                reclaimType +
                "'>" +
                "<icon class='reclaim-element " +
                reclaimModifiersOrText +
                "'></icon></icon>";
              reclaimText = "Reclaim All Cards with " + Capitalise(reclaimModifiersOrText);
            }
            break;
          case "one":
            if (reclaimModifiersOrText) {
              reclaimIcon =
                "<icon class='reclaim-" +
                reclaimType +
                "'>" +
                "<icon class='reclaim-element " +
                reclaimModifiersOrText +
                "'></icon></icon>";
              reclaimText = "Reclaim One Card with " + Capitalise(reclaimModifiersOrText);
            } else {
              reclaimIcon = "{reclaim-" + reclaimType + "}";
              reclaimText = IconName("reclaim-" + reclaimType);
            }
            break;
          case "none":
            reclaimIcon = "{reclaim-" + reclaimType + "}";
            reclaimText = IconName("reclaim-" + reclaimType);
            break;
          case "half":
            reclaimIcon = "{reclaim-" + reclaimType + "}";
            reclaimText = IconName("reclaim-" + reclaimType);
            break;
          case "custom":
            reclaimIcon = "{reclaim-" + reclaimType + "}";
            reclaimText = "Reclaim " + reclaimModifiersOrText;
            break;
          default:
            reclaimText = "TEXT NOT RECOGNIZED - use 'all','one',or 'custom'";
        }
      }
      growthIcons = reclaimIcon;
      growthText = reclaimText;
      break;
    }
    case "gain-card-pay-2": {
      growthIcons = "<custom-icon>{" + growthActionType + "}</custom-icon>";
      growthText = "You may Pay 2 Energy to Gain a Power Card";
      break;
    }
    case "gain-power-card": {
      const matches = regExp.exec(growthAction);
      let gainPowerCardIcon = "{" + growthActionType + "}";
      let gainPowerCardText = IconName(growthActionType);
      if (matches) {
        let gainPowerCardOptions = matches[1].split(",");
        let gainPowerCardType = gainPowerCardOptions[0];
        let gainPCModifiersOrText = gainPowerCardOptions[1];
        let gainPCModifierIcon = gainPowerCardOptions[2];
        gainPowerCardIcon = "<icon class='gain-power-card'>";
        switch (gainPowerCardType) {
          case "minor":
            gainPowerCardIcon += "<icon class='minor gain-card-modifier'></icon>";
            gainPowerCardText = "Gain Minor Power Card";
            // if(gainPCModifiersOrText){
            // gainPowerCardIcon = "<icon class='reclaim-"+gainPowerCardType+"'>"+"<icon class='reclaim-element "+gainPCModifiersOrText+"'></icon></icon>"
            // gainPowerCardText = 'Reclaim All Cards with '+Capitalise(gainPCModifiersOrText)
            // }
            break;
          case "major":
            gainPowerCardIcon += "<icon class='major gain-card-modifier'></icon>";
            gainPowerCardText = "Gain Major Power Card";
            break;
          default:
            gainPowerCardIcon +=
              "<icon class='" + gainPowerCardType.toLowerCase() + " gain-card-modifier'></icon>";
            gainPowerCardText = "Gain " + Capitalise(gainPowerCardType) + " Power Card";
        }
        if (gainPCModifierIcon) {
          gainPowerCardIcon +=
            "<icon class='" + gainPCModifierIcon + " gain-card-second-modifier'></icon>";
        }
        if (gainPCModifiersOrText) {
          gainPowerCardText += gainPCModifiersOrText;
        }
        gainPowerCardIcon += "</icon>";
      }
      growthIcons = gainPowerCardIcon;
      growthText = gainPowerCardText;
      break;
    }
    case "isolate": {
      const matches = regExp.exec(growthAction);
      let isolateIcons = "{isolate}";
      let isolateText = "Isolate 1 of Your Lands";
      let isolateReqOpen = "";
      let isolateReqClose = "";
      if (matches) {
        let isolateOptions = matches[1].split(",");
        let isolateRange = isolateOptions[0];
        isolateReqOpen = "<custom-icon>";
        isolateReqClose = "</custom-icon>";
        isolateIcons += "<range-growth><value>" + isolateRange + "</value></range-growth>";
        isolateText = "Isolate a Land";
      }
      growthIcons = isolateReqOpen + isolateIcons + isolateReqClose;
      growthText = isolateText;
      break;
    }
    case "damage": {
      const matches = regExp.exec(growthAction);
      let damageOptions = matches[1].split(",");
      let range = damageOptions[0];
      let damage = damageOptions[1];
      growthIcons =
        "<custom-icon><growth-damage><value>" +
        damage +
        "</value></growth-damage>" +
        "<range-growth><value>" +
        range +
        "</value></range-growth></custom-icon>";
      growthText = "Deal " + damage + " Damage at Range " + range;
      break;
    }
    case "gain-energy": {
      const matches = regExpOuterParentheses.exec(growthAction);
      const gainEnergyBy = matches[1];
      let energyOptions = gainEnergyBy.split(",");
      let energyManyIconOpen = "";
      let energyManyIconClose = "";
      if (isNaN(energyOptions[0]) || energyOptions.length !== 1) {
        energyManyIconOpen = "<growth-cell-double>";
        energyManyIconClose = "</growth-cell-double>";
      }
      let energyGrowthIcons = "";
      let energyGrowthText = "";
      let x_is_num = !isNaN(energyOptions[0]);
      let x_is_zero = energyOptions[0] === 0;
      let x_is_text = energyOptions[0] === "text";
      let x_is_flat = x_is_num && !x_is_zero;
      let y_is_text = energyOptions[1] !== undefined ? energyOptions[1] === "text" : false;
      let has_custom_text = x_is_text || y_is_text;
      let custom_text = "";
      if (has_custom_text) {
        custom_text += y_is_text ? energyOptions[2] : energyOptions[1];
      }

      let shift = 0;
      shift += x_is_num ? 1 : 0;
      shift += has_custom_text ? 2 : 0;
      let flatEnergy = energyOptions[0];
      let scaling_entity = energyOptions[shift];
      let scaling_value = energyOptions[shift + 1] !== undefined ? energyOptions[shift + 1] : 1;
      if (!isNaN(scaling_entity)) {
        scaling_value = scaling_entity;
        scaling_entity = undefined;
      }
      const customScalingIcon =
        scaling_entity !== undefined
          ? "{" + scaling_entity + "}"
          : "<div class='custom-scaling'></div>";

      // Flat Energy
      if (x_is_flat) {
        energyGrowthIcons = "<growth-energy><value>" + flatEnergy + "</value></growth-energy>";
        if (scaling_entity) {
          energyGrowthText = "Gain " + flatEnergy + " Energy";
        } else {
          energyGrowthText = "Gain Energy";
        }
      }

      // Scaling Energy
      if (scaling_entity || has_custom_text) {
        energyGrowthIcons += "<gain-per><value>" + scaling_value + "</value></gain-per>";
        energyGrowthIcons +=
          "<gain-per-element><ring-icon>" + customScalingIcon + "</ring-icon></gain-per-element>";
        if (x_is_flat) {
          energyGrowthText += " and +" + scaling_value + " more per ";
        } else {
          energyGrowthText += "Gain " + scaling_value + " Energy per ";
        }
        energyGrowthText += has_custom_text ? custom_text : Capitalise(scaling_entity);
        energyGrowthText += elementNames.has(scaling_entity) ? " Showing" : "";
      }
      growthIcons = energyManyIconOpen + energyGrowthIcons + energyManyIconClose;
      growthText = energyGrowthText;
      break;
    }
    case "add-presence": {
      const matches = regExpOuterParentheses.exec(growthAction);
      if (!matches) {
        console.log("ERROR in GROWTH: add-presence() cannot be empty");
      }
      let presenceOptions = matches[1].split(",");
      let presenceRange = presenceOptions[0];
      let presenceReqOpen = "<custom-presence>";
      let presenceReqClose = "</custom-presence>";
      let presenceReq = "none";
      let presenceText = "";
      let presenceIcon = "";
      let presenceTextLead = "";
      let presenceTextEnd = "";
      let presenceRangeOpen = "<range-growth><value>";
      let presenceRangeClose = "</value></range-growth>";

      if (presenceRange === "any" && presenceOptions.length === 1) {
        presenceReqOpen = "<custom-presence-no-range>";
        presenceReqClose = "</custom-presence-no-range>";
        presenceRangeOpen = "<range-growth-any>";
        presenceRangeClose = "</range-growth-any>";
        presenceText = " to any Land";
      } else if (presenceOptions.length > 1) {
        presenceReqOpen = "<custom-presence-req>";
        presenceReqClose = "</custom-presence-req>";
        presenceIcon += "<presence-req>";

        if (presenceRange === "any") {
          presenceReqOpen += "<presence-req></presence-req>";
          presenceRangeOpen = "<range-growth-any>";
          presenceRangeClose = "</range-growth-any>";
        }

        if (presenceOptions[1] === "text") {
          // User wants a custom text presence addition
          presenceText += " " + presenceOptions[2];
          if (presenceOptions[3]) {
            presenceIcon += "<display-custom>";
            for (let i = 3; i < presenceOptions.length; i++) {
              presenceIcon += "{" + presenceOptions[i] + "}";
            }
            presenceIcon += "</display-custom>";
          } else {
            presenceIcon +=
              "<span style='font-family: DK Snemand; font-size: 24pt; line-height: 24pt; font-style: normal;'></span>";
          }
        } else if (presenceOptions[1] === "token") {
          // User wants to add a token in growth
          switch (presenceOptions[3]) {
            case "and":
              //add presence and token
              presenceIcon += "<span class='plus-text'>+ </span>";
              presenceIcon += "<icon class='" + presenceOptions[2] + " add-token'></icon>";
              presenceText += " and a " + Capitalise(presenceOptions[2]);
              break;
            case "or":
              //add presence or token
              presenceReqOpen = "<custom-presence-req><custom-presence-or>";
              presenceReqClose = "</custom-presence-req>";
              presenceIcon = "{backslash}{" + presenceOptions[2] + "}</custom-presence-or>";
              presenceText += " or a " + Capitalise(presenceOptions[2]);
              break;
            case "instead":
              // no option to add presence, just token
              break;
          }
        } else {
          // User wants an OR or an AND requirement
          let operator = "";
          if (presenceOptions.length > 4) {
            operator = "/";
          } else {
            operator = " " + presenceOptions.at(-1) + " ";
          }

          presenceText += " to ";
          presenceText += presenceRange === "any" ? "any " : "";

          let flag = 0; // This flag is used to figure out if 'land with' has been said already. It comes up with add-presence(3,jungle,beasts,or)
          let and_flag = 0;
          for (let i = 1; i < presenceOptions.length; i++) {
            presenceReq = presenceOptions[i];

            // Check to see if we've reached an 'or' or 'and', which shouldn't be parsed
            if (presenceReq.toLowerCase() === "or" || presenceReq.toLowerCase() === "and") {
              break;
            }

            // Check for common typos
            presenceReq = presenceReq.includes("sands")
              ? presenceReq
              : presenceReq.replace("sand", "sands");
            presenceReq = presenceReq.replace("wetlands", "wetland");

            // Icons
            switch (presenceReq) {
              case "inland":
              case "coastal":
              case "invaders":
                presenceIcon +=
                  presenceOptions.length < 3
                    ? "<span class='non-icon'>" + presenceReq.toUpperCase() + "</span>" // This do-nothing Icon just creates 50px of height to make everything line up. Other ideas?
                    : "<span class='non-icon small'>" + presenceReq.toUpperCase() + "</span>";
                break;
              case "no-own-presence":
                presenceIcon += "{no-presence}";
                break;
              default:
                presenceIcon += "{" + presenceReq + "}";
            }

            if (i < presenceOptions.length - 2) {
              presenceIcon += operator;
            }

            // Text
            const multiLandCheck = presenceReq.split("-");
            let multiLandText;
            if (terrains.has(multiLandCheck[1])) {
              multiLandText =
                Capitalise(multiLandCheck[0]) + " or " + Capitalise(multiLandCheck[1]);
              presenceReq = "multiland";
            }

            presenceTextLead = "";
            presenceTextEnd = "";

            switch (presenceReq) {
              case "sand":
              case "sands":
              case "mountain":
              case "wetland":
              case "jungle":
              case "ocean":
                presenceText += i !== 1 ? operator : "";
                presenceText += Capitalise(presenceReq);
                and_flag = 1;
                break;
              case "inland":
              case "coastal":
                presenceText += i !== 1 ? operator : "";
                presenceText += Capitalise(presenceReq) + " land";
                break;
              case "multiland":
                presenceText += multiLandText;
                and_flag = 1;
                break;
              case "no-blight":
                if (i === 1) {
                  presenceText += " Land without ";
                } else {
                  presenceText += operator === " and " ? " and no " : " or no ";
                }
                presenceText += "Blight";
                break;
              case "beast":
                presenceTextEnd = "s";
                break;
              case "no-own-presence":
                if (i === 1) {
                  presenceText += " Land without ";
                } else {
                  presenceText += operator === " and " ? " and no " : " or no ";
                }
                presenceText += "Your Presence";
                break;
              case "presence":
                presenceTextLead += presenceTextEnd === "" ? "Your " : "";
              // Intentionally fallthrough.
              default:
                if (flag === 0 && i !== 1 && operator !== " and ") {
                  presenceText += operator + "Land with ";
                } else if (flag === 0 && operator !== " and ") {
                  presenceText += " Land with ";
                } else {
                  if (operator === " and " && flag !== 1) {
                    presenceText += and_flag === 1 ? " with " : " Land with ";
                  } else {
                    presenceText += operator;
                  }
                }
                flag = 1;
                presenceText += presenceTextLead + Capitalise(presenceReq) + presenceTextEnd;
            }
          }
        }
        presenceIcon += "</presence-req>";
      }
      growthIcons =
        presenceReqOpen +
        "<plus-presence>+{presence}</plus-presence>" +
        presenceIcon +
        presenceRangeOpen +
        presenceRange +
        presenceRangeClose +
        presenceReqClose;
      growthText = "Add a Presence" + presenceText;
      break;
    }
    case "push":
    case "gather": {
      const matches = regExp.exec(growthAction);

      let preposition = growthActionType === "push" ? "from" : "into";

      let moveText = "";
      let moveIcons = "";
      let moveTarget = matches[1];
      let moveOptions = moveTarget.split(",");
      let moveRange = moveOptions[1];
      let moveNum = moveOptions[2];
      let plural = 0;
      if (!moveNum) {
        moveNum = 1;
      } else if (isNaN(moveNum)) {
        moveNum = moveNum.toUpperCase();
      } else {
        plural = moveNum > 1 ? 1 : 0;
      }
      if (moveRange) {
        moveTarget = moveOptions[0];
        if (isNaN(moveRange)) {
          let moveCondition = moveRange;
          // Gather/Push into/from a sacred site, land with token, or terrain

          // Text
          if (isNaN(moveNum)) {
            moveText +=
              Capitalise(growthActionType) +
              " 1 " +
              Capitalise(moveTarget) +
              " " +
              preposition +
              " " +
              moveNum;
          } else {
            moveText +=
              Capitalise(growthActionType) +
              " " +
              moveNum +
              " " +
              Capitalise(moveTarget) +
              " " +
              preposition;
          }
          switch (moveCondition) {
            case "sacred-site":
              if (isNaN(moveNum)) {
                moveText += " of";
              }
              moveText += " your Sacred Sites";
              moveIcons +=
                "<push-gather><icon class='" +
                growthActionType +
                "-" +
                preposition +
                "'>{" +
                moveTarget +
                "}<icon class='" +
                preposition +
                " " +
                moveCondition +
                "'></icon></icon></push-gather>";
              break;
            case "wetland":
            case "sand":
            case "sands":
            case "mountain":
            case "jungle":
            case "jungle-wetland":
            case "jungle-sand":
            case "jungle-sands":
            case "jungle-mountain":
            case "sand-wetland":
            case "sands-wetland":
            case "mountain-wetland":
            case "mountain-sand":
            case "mountain-sands":
            case "mountain-jungle":
            case "sand-jungle":
            case "sands-jungle":
            case "sand-mountain":
            case "sands-mountain":
            case "wetland-jugnle":
            case "wetland-mountain":
            case "wetland-sand":
            case "wetland-sands":
            case "ocean":
              moveIcons +=
                "<push-gather><icon class='" +
                moveCondition +
                " terrain-" +
                growthActionType +
                "'>{" +
                growthActionType +
                "-arrow}<icon class='" +
                moveTarget +
                " " +
                preposition +
                "'></icon></icon></push-gather>";
              moveText += " " + Capitalise(moveCondition, plural);
              break;
            default:
              if (moveNum === 1) {
                moveText += " 1";
              }
              moveText += " of your Lands with " + Capitalise(moveCondition);
              moveIcons +=
                "<push-gather><icon class='" +
                growthActionType +
                "-" +
                preposition +
                "'>{" +
                moveTarget +
                "}<icon class='" +
                preposition +
                " " +
                moveCondition +
                "'></icon></icon></push-gather>";
          }
        } else {
          // Gather/Push at range
          moveIcons +=
            "<push-gather-range-req><icon class='" +
            growthActionType +
            "'>{" +
            moveTarget +
            "}</icon>" +
            "<range-growth><value>" +
            moveRange +
            "</value></range-growth></push-gather-range-req>";
          moveText +=
            Capitalise(growthActionType) +
            " up to 1 " +
            Capitalise(moveTarget) +
            " " +
            preposition +
            " a Land";
        }
      } else {
        moveIcons +=
          "<push-gather><icon class='" +
          growthActionType +
          "'>{" +
          moveTarget +
          "}</icon></push-gather>";
        moveText +=
          Capitalise(growthActionType) +
          " 1 " +
          Capitalise(moveTarget) +
          " " +
          preposition +
          ` 1 of your Lands`;
      }
      growthIcons = moveIcons;
      growthText = moveText;
      break;
    }
    case "presence-no-range": {
      //This is potentially redundant.
      growthIcons = "<custom-presence-no-range>+{presence}</custom-presence-no-range>";
      growthText = "Add a Presence to any Land";
      break;
    }
    case "move-presence": {
      const matches = regExp.exec(growthAction);
      const moveOptions = matches[1].split(",");
      const moveRange = moveOptions[0];
      let moveText = "";
      let moveIcons = "";
      if (!moveOptions[1]) {
        // moveIcons = "<custom-icon>{presence}{move-range-" + moveRange + "}</custom-icon>";
        moveIcons =
          "<custom-icon>{presence}<move-growth><value>" +
          moveRange +
          "</value></move-growth></custom-icon>";
        moveText = "Move a Presence";
      } else if (!isNaN(moveOptions[1])) {
        moveIcons = "<custom-icon><token-wrap>";
        for (let i = 0; i < moveOptions[1]; i++) {
          moveIcons += "{presence}";
        }
        moveIcons +=
          "</token-wrap><move-growth><value>" + moveRange + "</value></move-growth></custom-icon>";
        moveText = "Move up to " + moveOptions[1] + " Presence together";
      }

      growthIcons = moveIcons;
      growthText = moveText;
      break;
    }
    case "gain-element": {
      const matches = regExp.exec(growthAction);
      const gainedElement = matches[1];
      const elementOptions = matches[1].split(",");
      //Check if they want 2 elements (multiple of the same element, and OR between multiple elements are implemented. AND is not)
      if (elementOptions.length > 1) {
        //Check if they want multiples of the same element or a choice of elements by looking for a numeral
        if (isNaN(elementOptions[1]) && elementOptions.at(-1) !== "and") {
          //No numeral - user wants different elements. For example gain-element(water,fire)

          //Icons
          let elementIcons = "<gain class='or'>";
          for (let i = 0; i < elementOptions.length; i++) {
            elementIcons += "<icon class='orelement " + elementOptions[i] + "'></icon>";
            if (i < elementOptions.length - 1) {
              elementIcons += "{backslash}";
            }
          }
          elementIcons += "</gain>";
          //Text
          let elementText = "Gain ";
          for (let i = 0; i < elementOptions.length; i++) {
            elementText += IconName(elementOptions[i]);
            if (i < elementOptions.length - 2) {
              elementText += ", ";
            } else if (i === elementOptions.length - 2) {
              elementText += " or ";
            }
          }
          growthIcons = elementIcons;
          growthText = elementText;
        } else {
          // Gain multiple of the same element or gain multiple different elements (all of them, not or)

          let numLocs;
          // Text
          let elementText = "";
          if (elementOptions.at(-1) === "and") {
            // gain multiple different elements
            numLocs = elementOptions.length - 1;
            for (let i = 0; i < numLocs; i++) {
              elementText += IconName(elementOptions[i]);
              if (i < numLocs - 2) {
                elementText += ", ";
              } else if (i === numLocs - 2) {
                elementText += " and ";
              }
            }
          } else {
            // gain multiple of the same element
            numLocs = elementOptions[1];
            elementText = elementOptions[1] + " " + IconName(elementOptions[0]);
          }

          // Icons
          let rad_size = 20 + 5 * (numLocs - 2); // this expands slightly as more icons are used
          let elementIcons = "";
          for (let i = 0; i < numLocs; i++) {
            const pos_angle = (i * 2 * Math.PI) / numLocs - Math.PI * (1 - 1 / 6);
            const x_loc = 1.3 * rad_size * Math.cos(pos_angle);
            const y_loc = 0.8 * rad_size * Math.sin(pos_angle);
            const theta = -Math.PI / 12;
            const x_loc_prime = Math.cos(theta) * x_loc + Math.sin(theta) * y_loc;
            const y_loc_prime = -Math.sin(theta) * x_loc + Math.cos(theta) * y_loc;
            let element_loc =
              "style='transform: translateY(" +
              y_loc_prime +
              "px) translateX(" +
              x_loc_prime +
              "px)'";
            let cur_element =
              elementOptions.at(-1) === "and" ? elementOptions[i] : elementOptions[0];
            elementIcons +=
              "<icon-multi-element><icon class='" +
              cur_element +
              "'" +
              element_loc +
              "></icon></icon-multi-element>";
          }

          growthIcons = "<gain>" + elementIcons + "</gain>";
          growthText = "Gain " + elementText;
        }
      } else {
        growthIcons = "<gain>{" + gainedElement + "}</gain>";
        growthText = "Gain " + IconName(gainedElement);
      }
      break;
    }
    case "blank": {
      growthAction = "custom(,blank75)";
      // intentional fallthrough
    }
    case "custom":
    case "custom-wide": {
      const matches = regExpOuterParentheses.exec(growthAction);
      let customOptions = matches[1].split(",");
      let customIcon = customOptions[1];
      let customText = customOptions[0];
      let isWide = growthActionType === "custom-wide" ? "wide-growth" : "";
      let listIcons = "";
      if (customIcon) {
        if (customIcon === "text") {
          customIcon = "<span class='non-icon'>" + customOptions[2] + "</span>";
        } else {
          for (let i = 1; i < customOptions.length; i++) {
            // listIcons +=
            //   "<icon class='" + customOptions[i] + isWide + " custom-growth-icon'></icon>";
            listIcons += "{" + customOptions[i] + "}";
          }
          customIcon = listIcons;
        }
      } else {
        customIcon = "<div class='custom-scaling'></div>";
      }
      growthIcons =
        "<custom-growth-icon class='" + isWide + "'>" + customIcon + "</custom-growth-icon>";
      growthText = customText;
      break;
    }
    case "fear": {
      const matches = regExp.exec(growthAction);
      const gainFearBy = matches[1];
      let fearOptions = gainFearBy.split(",");
      let fearManyIconOpen = "";
      let fearManyIconClose = "";
      if (isNaN(fearOptions[0]) || fearOptions.length !== 1) {
        fearManyIconOpen = "<growth-cell-double>";
        fearManyIconClose = "</growth-cell-double>";
      }
      let fearGrowthIcons = "";
      let fearGrowthText = "";
      let x_is_num = !isNaN(fearOptions[0]);
      let x_is_zero = fearOptions[0] === 0;
      let x_is_text = fearOptions[0] === "text";
      let x_is_flat = x_is_num && !x_is_zero;
      let y_is_text = fearOptions[1] !== undefined ? fearOptions[1] === "text" : false;
      let has_custom_text = x_is_text || y_is_text;
      let custom_text = "";
      if (has_custom_text) {
        custom_text += y_is_text ? fearOptions[2] : fearOptions[1];
      }

      let shift = 0;
      shift += x_is_num ? 1 : 0;
      shift += has_custom_text ? 2 : 0;
      let flatFear = fearOptions[0];
      let scaling_entity = fearOptions[shift];
      let scaling_value = fearOptions[shift + 1] !== undefined ? fearOptions[shift + 1] : 1;
      if (!isNaN(scaling_entity)) {
        scaling_value = scaling_entity;
        scaling_entity = undefined;
      }
      const customScalingIcon =
        scaling_entity !== undefined
          ? "{" + scaling_entity + "}"
          : "<div class='custom-scaling'></div>";

      // Flat Fear
      if (x_is_flat) {
        fearGrowthIcons = "<growth-fear><value>" + flatFear + "</value></growth-fear>";
        if (scaling_entity) {
          fearGrowthText = "Generate " + flatFear + " Fear";
        } else {
          fearGrowthText = "Generate Fear";
        }
      }

      // Scaling Fear
      if (scaling_entity || has_custom_text) {
        fearGrowthIcons += "<fear-per><value>" + scaling_value + "</value></fear-per>";
        fearGrowthIcons +=
          "<gain-per-fear><ring-icon>" + customScalingIcon + "</ring-icon></gain-per-fear>";
        if (x_is_flat) {
          fearGrowthText += " and +" + scaling_value + " more per ";
        } else {
          fearGrowthText += "Generate " + scaling_value + " Fear per ";
        }
        fearGrowthText += has_custom_text ? custom_text : Capitalise(scaling_entity);
        fearGrowthText += elementNames.has(scaling_entity) ? " Showing" : "";
      }
      growthIcons = fearManyIconOpen + fearGrowthIcons + fearManyIconClose;
      growthText = fearGrowthText;
      break;
    }
    case "gain-range": {
      const matches = regExp.exec(growthAction);
      let rangeOptions = matches[1].split(",");
      let range = rangeOptions[0];
      let type = rangeOptions[1];
      let gainRangeText = "";
      if (type) {
        switch (type) {
          case "powers":
          case "power":
            gainRangeText = "Your Powers gain +" + range + " Range this turn";
            break;
          case "power cards":
            gainRangeText = "Your Power Cards gain +" + range + " Range this turn";
            break;
          case "everything":
            gainRangeText = "+" + range + " Range on everything this turn";
            break;
          case "innate":
          case "innate power":
          case "innate powers":
            gainRangeText = "Your Innate Powers gain +" + range + " Range this turn";
            break;
          default:
            gainRangeText = "Your Powers gain +" + range + " Range this turn";
        }
      } else {
        gainRangeText = "Your Powers gain +" + range + " Range this turn";
      }
      growthIcons = "{gain-range-" + range + "}";
      growthText = gainRangeText;
      break;
    }
    case "gain-card-play": {
      const matches = regExp.exec(growthAction);
      growthIcons = "{" + growthActionType + "}";
      growthText = IconName(growthActionType);

      if (matches) {
        const cardplayOptions = matches[1].split(",");
        const num_card_plays = cardplayOptions[0];
        const plural = num_card_plays > 1 ? "s" : "";
        growthIcons = "<card-play-num><value>" + num_card_plays + "</value></card-play-num>";
        growthText = " +" + num_card_plays + " Card Play" + plural + " this turn";
      }
      break;
    }
    case "element-marker": {
      const matches = regExp.exec(growthAction);

      if (matches) {
        let markerOptions = matches[1].split(",");
        let num_markers = markerOptions[0];
        const marker_type = num_markers > 0 ? "markerplus" : "markerminus";
        const marker_verb = num_markers > 0 ? "Prepare" : "Discard";
        num_markers = Math.abs(num_markers);
        const plural = num_markers > 1 ? "s" : "";
        const numLocs = num_markers;
        let rad_size = 20 + 5 * (numLocs - 2); // this expands slightly as more icons are used
        let markerIcons = "";
        for (let i = 0; i < numLocs; i++) {
          const pos_angle = (i * 2 * Math.PI) / numLocs - Math.PI * (1 - 1 / 6);
          const x_loc = rad_size * Math.cos(pos_angle);
          const y_loc = rad_size * Math.sin(pos_angle);
          const marker_loc =
            "style='transform: translateY(" + y_loc + "px) translateX(" + x_loc + "px)'";
          markerIcons +=
            "<icon-multi-element><icon class='" +
            marker_type +
            "'" +
            marker_loc +
            "></icon></icon-multi-element>";
        }
        markerIcons += "<icon style='width:0px;height:99px'></icon>"; // This is a filler icon to make sure the spacing is right. Any idea for a better solution?

        growthIcons = "<gain>" + markerIcons + "</gain>";
        growthText = marker_verb + " " + num_markers + " Element Marker" + plural;
      } else {
        growthIcons = "<gain>{markerplus}</gain>";
        growthText = "Prepare 1 Element Marker";
      }
      break;
    }
    case "discard": {
      const matches = regExp.exec(growthAction);
      if (matches) {
        let discardOptions = matches[1].split(",");
        const num_discard = discardOptions[0];
        if (!isNaN(num_discard)) {
          //handle number discards
        } else {
          //handle element discards
          const discardElement = num_discard;
          growthIcons =
            "<icon class='discard-card'><icon class='discard-element " +
            discardElement +
            "'></icon></icon>";
          growthText = "Discard a Power Card with " + Capitalise(discardElement);
        }
      } else {
        growthIcons = "{discard-card}";
        growthText = "Discard a Card";
      }
      break;
    }
    case "incarna": {
      const matches = regExp.exec(growthAction);
      let incarnaOptions = matches[1].split(",");
      let incarnaAction = incarnaOptions[0];
      let incarnaRangeOrToken = incarnaOptions[1] !== undefined ? incarnaOptions[1] : 0;
      let customIncarnaIcon = incarnaOptions[2] !== undefined ? incarnaOptions[2] : "incarna";
      switch (incarnaAction) {
        case "move":
          if (incarnaRangeOrToken.toLocaleLowerCase() === "any") {
            incarnaRangeOrToken = "<textvalue>ANY</textvalue>";
          } else {
            incarnaRangeOrToken = "<value>" + incarnaRangeOrToken + "</value>";
          }
          growthIcons =
            '<custom-icon2><icon class="incarna ' +
            customIncarnaIcon +
            '"></icon>' +
            "<move-growth>" +
            incarnaRangeOrToken +
            "</move-growth></custom-icon2>";
          growthText = "Move Incarna";
          break;
        case "empower":
          growthIcons = "{empower-incarna}";
          growthText = "Empower Incarna";
          break;
        case "add-move":
          growthIcons =
            '<custom-icon><add-move-upper>+{backslash}{move-arrow}</add-move-upper><add-move-lower><icon class="incarna add-move ' +
            customIncarnaIcon +
            '"></icon><icon class="' +
            incarnaRangeOrToken +
            ' with-your"></icon></add-move-lower></custom-icon>';
          growthText = "Add/Move Incarna to Land with " + IconName(incarnaRangeOrToken);
          break;
        case "replace":
          growthIcons =
            '<custom-icon><icon class="incarna with-incarna ' +
            customIncarnaIcon +
            '"><icon class="replace-with-incarna no ' +
            incarnaRangeOrToken +
            '"></custom-icon>';
          growthText = "You may Replace " + IconName(incarnaRangeOrToken) + " with your Incarna";
          break;
        case "add-token":
          growthIcons =
            '<custom-icon><add-token-upper>+<icon class="add-token ' +
            incarnaRangeOrToken +
            '"></add-token-upper><add-token-lower><icon class="incarna ' +
            customIncarnaIcon +
            '"><add-token-lower></custom-icon>';
          growthText = "Add a " + IconName(incarnaRangeOrToken) + " at your Incarna";
          break;
        default:
      }
      break;
    }
    case "add-token": {
      const matches = regExp.exec(growthAction);
      let tokenOptions = matches[1].split(",");
      let range = tokenOptions[0];
      let tokenRange = "<range-growth><value>" + range + "</value></range-growth>";
      let token = tokenOptions[1];
      let tokenNum = tokenOptions[2];
      let tokenReqOpen = "<custom-icon>";
      let tokenReqClose = "</custom-icon>";
      let tokenText = "";
      let tokenIcons = "";
      if (!tokenNum) {
        tokenIcons = "+<icon class='" + token + " token'></icon>";
        tokenText = "Add a " + Capitalise(token);
      } else if (!isNaN(tokenNum)) {
        // multiple of the same token
        tokenIcons += "+";
        if (tokenNum > 3) {
          tokenIcons += tokenNum + "<icon class='" + token + " token'></icon>";
        } else {
          for (let i = 0; i < tokenNum; i++) {
            tokenIcons += "<icon class='" + token + " token'></icon>";
          }
        }
        tokenText = "Add " + IconName(token, tokenNum) + " together";
      } else {
        // two or more different tokens
        const operator = tokenOptions.at(-1);
        tokenIcons += "+<icon class='" + token + " token'></icon>";
        tokenText += "Add a " + Capitalise(token);
        if (operator === "and" || operator === "or") {
          for (let i = 2; i < tokenOptions.length - 1; i++) {
            tokenIcons += operator === "or" ? "/" : "";
            tokenIcons += "<icon class='" + tokenOptions[i] + " token'></icon>";
            tokenText += i === tokenOptions.length - 2 ? " " + operator + " " : ", ";
            tokenText += Capitalise(tokenOptions[i]);
          }
          if (operator === "and") {
            tokenText += " together";
          }
        } else {
          tokenText = "MUST use AND or OR";
        }
      }
      growthIcons =
        tokenReqOpen + "<token-wrap>" + tokenIcons + "</token-wrap>" + tokenRange + tokenReqClose;
      growthText = tokenText;
      break;
    }
    case "replace": {
      let replaceText = "";
      let replaceIcons = "";
      const matches = regExp.exec(growthAction);
      let replaceOptions = matches[1].split(",");
      let range = replaceOptions[0];
      let x_is_num = !isNaN(replaceOptions[0]);

      let shift = 0;
      if (x_is_num) {
        shift += 1;
      }
      if (x_is_num) {
        // Ranged replace
        replaceIcons =
          '<custom-icon><replace-wrap><icon class="replace-this no ' +
          replaceOptions[shift] +
          '"></icon>+<icon class="replace-with ' +
          replaceOptions[shift + 1] +
          '"></icon></replace-wrap><range-growth><value>' +
          range +
          "</value></range-growth></custom-icon>";
        console.log(replaceIcons);
        replaceText =
          "You may Replace " +
          IconName(replaceOptions[shift]) +
          " with " +
          IconName(replaceOptions[shift + 1]);
        console.log(replaceText);
      } else {
        // Local replace
        replaceIcons =
          '<custom-icon><replace-wrap><icon class="replace-this-no-range no ' +
          replaceOptions[shift] +
          '"></icon>+<icon class="replace-with ' +
          replaceOptions[shift + 1] +
          '"></icon></replace-wrap></custom-icon>';
        replaceText =
          "You may Replace 1 " +
          IconName(replaceOptions[shift]) +
          " in your Lands with " +
          IconName(replaceOptions[shift + 1]);
      }

      growthIcons = replaceIcons;
      growthText = replaceText;
      break;
    }
    default: {
      growthIcons = "{" + growthActionType + "}";
      growthText = IconName(growthActionType);
    }
  }

  //Handle Repeats
  if (repeatText) {
    growthIcons = "<repeat-wrapper>" + repeatOpen + growthIcons + "</repeat-wrapper>";
    growthText = repeatText + growthText;
  }

  return [growthIcons, growthText];
}

function setNewEnergyCardPlayTracks(energyHTML, cardPlayHTML) {
  console.log("BUILDING PRESENCE TRACKS");
  const board = document.querySelectorAll("board")[0];
  const presenceTable = board.getElementsByTagName("presence-tracks")[0];

  // Allow custom heading name
  let customNameText = presenceTable.getAttribute("customname")
    ? ` customName="${presenceTable.getAttribute("customname")}"`
    : "";

  presenceTable.innerHTML =
    `<presence-title><section-title${customNameText}>Presence</section-title></presence-title>` +
    "<table id='presence-table'><tbody>" +
    energyHTML +
    cardPlayHTML +
    "</tbody></table>";

  //Allow combined-banners
  const combinedBanner = presenceTable.getAttribute("banner");
  if (combinedBanner !== null && combinedBanner !== "null") {
    console.log("combined banner detected. recommend turning off individual banners");
    let combinedBannerScaleV = presenceTable.getAttribute("banner-v-scale");
    if (combinedBannerScaleV === null || combinedBannerScaleV === "null") {
      combinedBannerScaleV = "100%";
    }
    if (combinedBannerScaleV.at(-1) !== "%") {
      combinedBannerScaleV = combinedBannerScaleV + "%";
    }
    let combinedBannerScaleH = presenceTable.getAttribute("banner-h-scale");
    if (combinedBannerScaleH === null || combinedBannerScaleH === "null") {
      combinedBannerScaleH = "100%";
    }
    console.log(combinedBannerScaleH);
    if (combinedBannerScaleH.at(-1) !== "%") {
      combinedBannerScaleH = combinedBannerScaleH + "%";
    }
    let tbody = presenceTable.getElementsByTagName("table")[0];
    tbody.style.backgroundImage = "url(" + combinedBanner + ")";
    tbody.style.backgroundSize = combinedBannerScaleH + " " + combinedBannerScaleV;
    tbody.style.backgroundRepeat = "no-repeat";
  }

  //Allow for Notes
  const presenceNote = presenceTable.getAttribute("note");
  presenceTable.removeAttribute("note");
  if (presenceNote) {
    const note = document.createElement("presence-note");
    const title = presenceTable.querySelectorAll("section-title")[0];
    title.classList.add("has-note");
    note.innerHTML = presenceNote;
    title.after(note);
  }
  //should add some kind of first check here

  //detect & correct first circles when using middle
  const energyTrack = presenceTable.getElementsByClassName("energy-track")[0];
  const energyNodes = energyTrack.getElementsByTagName("td");
  const playsTrack = presenceTable.getElementsByClassName("plays-track")[0];
  const playsNodes = playsTrack.getElementsByTagName("td");
  if (energyNodes[1].classList.contains("middle")) {
    if (energyNodes[2].classList.contains("middle")) {
      playsNodes[1].getElementsByTagName("presence-node")[0].classList.remove("first");
    }
  }
}

function parseEnergyTrackTags() {
  const board = document.querySelectorAll("board")[0];
  const energyValues = board.getElementsByTagName("energy-track")[0].getAttribute("values");
  const energyOptions = energyValues.split(",");

  const energyBanner = board.getElementsByTagName("energy-track")[0].getAttribute("banner");
  let energyBannerScale = board
    .getElementsByTagName("energy-track")[0]
    .getAttribute("banner-v-scale");
  if (!energyBannerScale) {
    energyBannerScale = "100";
  }
  if (energyBannerScale.at(-1) !== "%") {
    energyBannerScale = energyBannerScale + "px";
  }
  let energyHTML = "";

  //Determine the length of the energy track
  //If for some reason the width of a presence track spot changes, this needs to be updated. Ideas for automating?
  if (energyBanner) {
    energyHTML =
      "<tr class='energy-track' style='background-image:  url(" +
      energyBanner +
      "); background-size: 100% " +
      energyBannerScale +
      "; background-repeat: no-repeat; background-position: left 0px top 20px;'>";
  } else {
    energyHTML = "<tr class='energy-track'>";
  }

  // This can be scaled to move the first presence icon.
  energyHTML += "<td class='spacer'></td>";
  let firstIsMiddle = false;
  let isFirst = false;
  for (let i = 0; i < energyOptions.length; i++) {
    // option allows for placing presence track icons in the "middle row"
    let nodeText = energyOptions[i];
    let isMiddle = "";
    let addRing = true;
    const regExpOuterParentheses = /\(\s*(.+)\s*\)/;
    if (i === 0 || (firstIsMiddle && !nodeText.startsWith("middle"))) {
      isFirst = true;
    }
    firstIsMiddle = false;
    if (nodeText.startsWith("middle") || nodeText.startsWith("bonus")) {
      console.log("found a middle node: " + nodeText);
      let nodeClass = "middle";
      if (nodeText.startsWith("bonus")) {
        console.log("adding bonus text");
        nodeClass += " bonus";
      }
      nodeText = regExpOuterParentheses.exec(nodeText)[1];
      isMiddle = ' rowspan="2" class="' + nodeClass + '"';
      if (i === 0) {
        firstIsMiddle = true;
      }
      addRing = false;
    }

    energyHTML +=
      "<td" +
      isMiddle +
      ">" +
      getPresenceNodeHtml(nodeText, isFirst, i, "energy", addRing) +
      "</td>";
    isFirst = false;
  }
  energyHTML += "</tr>";
  board.getElementsByTagName("energy-track")[0].removeAttribute("values");
  return energyHTML;
}

function parseCardPlayTrackTags() {
  const board = document.querySelectorAll("board")[0];
  const cardPlayValues = board.getElementsByTagName("card-play-track")[0].getAttribute("values");
  const cardPlayOptions = cardPlayValues.split(",");
  const cardPlayBanner = board.getElementsByTagName("card-play-track")[0].getAttribute("banner");
  let cardPlayBannerScale = board
    .getElementsByTagName("card-play-track")[0]
    .getAttribute("banner-v-scale");
  if (!cardPlayBannerScale) {
    cardPlayBannerScale = "100";
  }
  if (cardPlayBannerScale.at(-1) !== "%") {
    cardPlayBannerScale = cardPlayBannerScale + "px";
  }
  let cardPlayHTML = "";

  //Determine the length of the energy track
  //If for some reason the width of a presence track spot changes, this needs to be updated. Ideas for automating?
  let cardPlayLength = cardPlayOptions.length * 130 + 15;
  if (cardPlayBanner) {
    cardPlayHTML =
      "<tr class='plays-track' style='background-image:  url(" +
      cardPlayBanner +
      "); background-size: " +
      cardPlayLength +
      "px " +
      cardPlayBannerScale +
      "; background-repeat: no-repeat; background-position: left 0px top 20px;'>";
  } else {
    cardPlayHTML = "<tr class='plays-track'>";
  }

  // This can be scaled to move the first presence icon.
  cardPlayHTML += "<td class='spacer'></td>";

  for (let i = 0; i < cardPlayOptions.length; i++) {
    cardPlayHTML +=
      "<td>" + getPresenceNodeHtml(cardPlayOptions[i], i === 0, i, "card", false) + "</td>";
  }
  cardPlayHTML += "</tr>";
  board.getElementsByTagName("card-play-track")[0].removeAttribute("values");
  return cardPlayHTML;
}

function enhancePresenceTracksTable() {
  console.log("BUILDING PRESENCE TRACK PANEL");
  console.log(
    "This method of creating middle node is no longer supported. Your results may very. Use middle() instead."
  );
  const board = document.querySelectorAll("board")[0];
  const elmt = board.getElementsByTagName("presence-tracks")[0];
  const title = document.createElement("section-title");
  title.innerHTML = "Presence";
  elmt.insertBefore(title, elmt.firstChild);
  console.log("creating dynamic presence tracks...");
  const table = document.getElementById("presence-table");
  table.innerHTML = table.innerHTML.replaceAll('middle=""', 'rowspan="2" class="middle"');

  for (let i = 0, row; (row = table.rows[i]); i++) {
    for (let j = 0, cell; (cell = row.cells[j]); j++) {
      cell.innerHTML = getPresenceNodeHtml(
        cell.firstChild.nodeValue,
        j === 0,
        j,
        "dynamic",
        i === 0
      );
    }
  }

  // Add spacing row to the front of the table
  const firstRow = table.getElementsByTagName("tr")[0];
  const firstCell = firstRow.getElementsByTagName("td")[0];
  const spacerRow = document.createElement("td");
  spacerRow.classList.add("spacer");
  spacerRow.style.width = "10px";
  spacerRow.rowSpan = "2";
  firstRow.insertBefore(spacerRow, firstCell);

  /*   // Detect presence note
  presenceNote = table.getAttribute("note");
  if(presenceNote){
    const note = document.createElement("presence-note");
    note.innerHTML = presenceNote;
    title.after(note)
    title.classList.add('has-note')
  } */
}

function getPresenceNodeHtml(nodeText, first, nodeIndex, trackType, addEnergyRing) {
  //Find values between parenthesis
  const regExp = /\(([^)]+)\)/;
  let pnDebug = false;
  let nodeClass = "";

  // Every node will have a presence-node element with
  // a ring-icon element inside, so we can add these now.
  const presenceNode = document.createElement("presence-node");
  const nodeID = trackType + nodeIndex;
  presenceNode.setAttribute("id", nodeID);
  const ring = document.createElement("ring-icon");
  presenceNode.appendChild(ring);
  // Will be populated with the sub text that will be added at the end
  let subText = "";
  // Will be populated with the raw HTML that will go inside the ring-icon element.
  let inner = "";
  if (pnDebug) {
    console.log(
      "--Presence Node-- Text:" +
        nodeText +
        ", First?:" +
        first +
        ", nodeIndex:" +
        nodeIndex +
        " trackType: " +
        trackType
    );
  }
  //Allows adding an icon top-left of the node using ^ (as with Stone)
  let addDeepLayers = false;
  let iconDeepLayers;
  if (nodeText.split("^")[1]) {
    iconDeepLayers = nodeText.split("^")[1];
    if (pnDebug) {
      console.log(iconDeepLayers);
    }
    addDeepLayers = true;
    nodeText = nodeText.split("^")[0];
  }

  if (trackType === "dynamic") {
    if (nodeText.startsWith("energy")) {
      nodeText = nodeText.substr(6);
      nodeClass = "energy";
      subText = "Energy/Turn";
    } else if (nodeText.startsWith("+energy")) {
      nodeText = nodeText.replace("+energy", "+");
      nodeClass = "energy";
      subText = "Energy/Turn";
    } else if (nodeText.startsWith("card")) {
      nodeText = nodeText.substr(4);
      nodeClass = "card";
      subText = "Card Plays";
    }
  } else if (trackType === "energy") {
    nodeClass = "energy";
    subText = "Energy/Turn";
  } else if (trackType === "card") {
    nodeClass = "card";
    subText = "Card Plays";
  } else if (trackType === "special") {
    nodeClass = "special-ring";
    subText = "";
    addEnergyRing = false;
  }

  let addIconShadow = false;
  if (!isNaN(nodeText)) {
    //The value is only a number
    addEnergyRing = false;
    if (first === true && trackType !== "special") {
      presenceNode.classList.add("first");
    } else {
      subText = nodeText;
      if (isNaN(nodeText[0])) {
        subText += " Energy";
        nodeClass = "energy";
      }
    }
    inner = "<" + nodeClass + "-icon><value>" + nodeText + "</value></" + nodeClass + "-icon>";
  } else {
    //It is either a single element or a mix of elements/numbers/other options

    if (first === true && trackType !== "special") {
      presenceNode.classList.add("first");
    }

    let splitOptions = nodeText.split("+");

    //This code allows user to include +energy such as: +1
    const plus_check = splitOptions.indexOf("");
    if (plus_check !== -1) {
      splitOptions.splice(plus_check, 1);
      splitOptions[plus_check] = "+" + splitOptions[plus_check];
      nodeClass = "energy";
    }

    //This code allows the user to include +energy in this way too: energy(+1)
    if (nodeText.includes("energy(+")) {
      let findInd = splitOptions.indexOf("energy(");
      if (splitOptions.length > 2) {
        // Multioption
        splitOptions[findInd] = "+" + splitOptions[findInd + 1];
        splitOptions[findInd] = splitOptions[findInd].substring(
          0,
          splitOptions[findInd].length - 1
        );
      } else {
        // Single Option
        splitOptions[findInd] = "bonus" + splitOptions[findInd] + splitOptions[findInd + 1];
      }
      splitOptions.splice(findInd + 1, 1);
    }

    if (splitOptions.length === 1) {
      //It's just a single item
      const option = splitOptions[0].split("(")[0];

      if (pnDebug) {
        console.log("Single Option: " + option + " with " + splitOptions[0]);
      }

      switch (option) {
        case "push": {
          const matches = regExp.exec(splitOptions[0]);
          const moveTarget = matches[1];
          const preposition = option === "push" ? "from" : "into";
          let moveIcons = "<div class='push'>";
          let moveText = "";
          if (moveTarget.split(";")[0].toLocaleLowerCase() === "incarna") {
            if (moveTarget.split(";")[1]) {
              moveIcons += '<icon class="incarna ' + moveTarget.split(";")[1] + '"></icon>';
            } else {
              moveIcons += "{incarna}";
            }
            subText = Capitalise(option) + " Your Incarna";
          } else {
            for (let i = 0; i < moveTarget.split(";").length; i++) {
              moveIcons += "{" + moveTarget.split(";")[i] + "}";
              moveText += Capitalise(moveTarget.split(";")[i]);
              if (i < moveTarget.split(";").length - 1) {
                moveIcons += "{backslash}";
                moveText += "/";
              }
            }
            subText =
              Capitalise(option) + " 1 " + moveText + " " + preposition + " 1 of your Lands";
          }
          moveIcons += "</div>";
          inner = "<icon class='push'>" + moveIcons + "</icon>";

          break;
        }
        case "gather": {
          const matches = regExp.exec(splitOptions[0]);
          const moveTarget = matches[1];
          inner = "<icon class='gather'><icon class='" + moveTarget + "'></icon></icon>";
          subText = "Gather 1 " + Capitalise(moveTarget) + " into 1 of your Lands";
          break;
        }
        case "energy": {
          const matches = regExp.exec(splitOptions[0]);
          const num = matches[1];
          inner = "<energy-icon><value>" + num + "</value></energy-icon>";
          subText = num;
          addEnergyRing = true;
          addIconShadow = false;
          break;
        }
        case "bonusenergy": {
          const matches = regExp.exec(splitOptions[0]);
          const num = matches[1];
          inner = "<energy-icon><value>+" + num + "</value></energy-icon>";
          subText = "+" + num + " Energy";
          addEnergyRing = true;
          addIconShadow = false;
          break;
        }
        case "plays": {
          const matches = regExp.exec(splitOptions[0]);
          const num = matches[1];
          inner = "<card-icon><value>" + num + "</value></card-icon>";
          subText = num;
          addEnergyRing = false;
          addIconShadow = false;
          break;
        }
        case "incarna": {
          const matches = regExp.exec(splitOptions[0]);
          const incarnaAction = matches[1];
          switch (incarnaAction) {
            case "empower":
              subText = "Empower Incarna";
              inner = "{empower-incarna}";
              break;
            default:
              subText = "Empower Incarna";
              inner = "{empower-incarna}";
          }
          break;
        }
        case "token": {
          const matches = regExp.exec(splitOptions[0]);
          const tokenAdd = matches[1];
          inner =
            "<icon class='your-land'>{misc-plus}<icon class='" + tokenAdd + "'></icon></icon>";
          subText = "Add 1 " + Capitalise(tokenAdd) + " to 1 of your Lands";
          break;
        }
        case "custom": {
          if (pnDebug) {
            console.log("Custom Node w/ Single Icon:" + splitOptions[0]);
          }
          const matches = regExp.exec(splitOptions[0]);
          const custom_node = matches[1].split(";");
          const custom_text = custom_node[0];
          addEnergyRing = false;
          addIconShadow = true;
          if (custom_node[1]) {
            if (custom_node[1].split("{")[1]) {
              // User is using icon shorthand
              inner =
                "<custom-presence-track-icon>" + custom_node[1] + "</custom-presence-track-icon>";
            } else {
              // User is not using icon shorthand (only 1 icon allowed)
              inner = "<icon class='" + custom_node[1] + " custom-presence-track-icon'></icon>";
            }
          } else {
            inner = "<" + nodeClass + "-icon><value></value></" + nodeClass + "-icon>";
            addEnergyRing = false;
          }
          subText = custom_text;
          break;
        }
        case "move-presence": {
          const matches = regExp.exec(splitOptions[0]);
          let moveRange = matches[1];
          if (isNaN(moveRange)) {
            inner =
              "<track-move-presence>{presence}<move-text>" +
              moveRange +
              "</move-text>{move-arrow}</track-move-presence>";
            subText = "Move a Presence to " + moveRange + " land";
          } else {
            inner =
              "<track-move-presence>{presence}<move-value>" +
              moveRange +
              "</move-value>{move-arrow}</track-move-presence>";
            subText = "Move a Presence " + moveRange;
          }
          addIconShadow = true;
          if (addEnergyRing) {
            addIconShadow = false;
          }
          break;
        }
        case "elements":
        case "or": {
          const matches = regExp.exec(splitOptions[0]);
          const elementList = matches[1].split(";");
          let elementIcons = "";
          let elementText = "";
          if (elementList.length === 2) {
            elementIcons += "<icon class='" + elementList[0] + " presence-or-first'></icon>";
            elementIcons += "{backslash}";
            elementIcons += "<icon class='" + elementList[1] + " presence-or-second'></icon>";
            elementText += Capitalise(elementList[0]);
            elementText += " OR ";
            elementText += Capitalise(elementList[1]);
            inner = "<element-or-wrap>" + elementIcons + "</element-or-wrap>";
            subText = elementText;
          } else {
            const iconText = matches[1];
            inner = "{" + iconText + "}";
            subText = IconName(iconText);
          }
          break;
        }
        case "gain-range": {
          const matches = regExp.exec(splitOptions[0]);
          const gainRange = matches[1];
          const custom_node = gainRange.split(";");
          inner = "{gain-range-" + custom_node[0] + "}";
          subText = IconName(splitOptions[0]);
          addEnergyRing = false;
          addIconShadow = true;
          break;
        }
        case "gain-card-play": {
          const matches = regExp.exec(splitOptions[0]);
          if (matches) {
            const cardplay_text = matches[1].split(";");
            inner =
              "<icon class='" +
              option +
              " deep-layers'><icon class='" +
              cardplay_text +
              "'></icon></icon>";
          } else {
            const cardplay_text = splitOptions[0];
            inner = "<icon class='" + cardplay_text + "'></icon>";
          }
          subText = "+1 Card Play/Turn";
          addEnergyRing = false;
          break;
        }
        case "blank": {
          const matches = regExp.exec(splitOptions[0]);
          const numSpace = matches !== null ? matches[1] : 1;
          ring.classList.add("blank-ring");
          subText = "<br>";
          subText = subText.repeat(numSpace);
          addEnergyRing = false;
          addIconShadow = false;
          break;
        }
        default: {
          const iconText = splitOptions[0];
          inner = "{" + iconText + "}";
          subText = IconName(iconText);
          break;
        }
      }
    } else {
      //It's multiple items
      if (pnDebug) {
        console.log("Multiple Items: ");
        console.log(splitOptions);
      }
      subText = "";

      // Find unique names and report multiples
      const nameCounts = {};
      splitOptions.forEach(function (x) {
        nameCounts[x] = (nameCounts[x] || 0) + 1;
      });
      let namesList = Object.keys(nameCounts);
      let countList = Object.values(nameCounts);
      for (let i = 0; i < namesList.length; i++) {
        subText += IconName(namesList[i], countList[i]);
        if (i < namesList.length - 1) {
          subText += ", ";
        }
      }

      const numLocs = splitOptions.length;

      for (let i = 0; i < numLocs; i++) {
        let trackIcons = "";
        const pos_angle = (i * 2 * Math.PI) / numLocs - Math.PI * (4.5 / 6);
        const x_loc = 0.4 * Math.cos(pos_angle) * 50 + 50;
        const y_loc = 0.4 * Math.sin(pos_angle) * 50 + 50;
        const track_icon_loc =
          // "style='transform: translateY(" + y_loc + "px) translateX(" + x_loc + "px)'";
          "style='top: " + y_loc.toPrecision(2) + "%; left:" + x_loc.toPrecision(2) + "%;'";
        if (pnDebug) {
          console.log("Multinode: " + splitOptions[i]);
        }
        // deal with cards and energy
        if (!isNaN(splitOptions[i])) {
          trackIcons +=
            "<" +
            nodeClass +
            "-icon class='small'" +
            "><value>" +
            splitOptions[i] +
            "</value></" +
            nodeClass +
            "-icon>";
          if (nodeClass === "energy") {
            addEnergyRing = false;
          }
        } else if (splitOptions[i].startsWith("reclaim")) {
          trackIcons += "<icon class='" + splitOptions[i] + " small-reclaim'" + "></icon>";
        } else if (splitOptions[i].startsWith("energy")) {
          const matches = regExp.exec(splitOptions[i]);
          const num = matches[1];
          trackIcons += "<energy-icon class='small'" + "><value>" + num + "</value></energy-icon>";
          addEnergyRing = false;
        } else if (splitOptions[i].startsWith("plays")) {
          const matches = regExp.exec(splitOptions[i]);
          const num = matches[1];
          addEnergyRing = false;
          trackIcons += "<card-icon class='small'" + "><value>" + num + "</value></card-icon>";
        } else if (splitOptions[i].startsWith("gain-card-play")) {
          trackIcons += "<icon class='" + splitOptions[i] + " small'" + "></icon>";
          addEnergyRing = false;
        } else if (splitOptions[i].startsWith("gain-power-card")) {
          trackIcons += "<icon class='" + splitOptions[i] + " small'" + "></icon>";
        } else if (splitOptions[i].startsWith("move-presence")) {
          const matches = regExp.exec(splitOptions[i]);
          const moveRange = matches[1];
          trackIcons +=
            "<track-move-presence class='small shadow'>{presence}<move-value>" +
            moveRange +
            "</move-value>{move-arrow}</track-move-presence>";
          addEnergyRing = false;
          addIconShadow = false;
        } else if (splitOptions[i].startsWith("gain-range")) {
          const matches = regExp.exec(splitOptions[i]);
          let gainRange = matches[1];
          gainRange = gainRange.split(";")[0];
          trackIcons +=
            "<icon-shadow class = 'small'" +
            "><range class='small'>+" +
            gainRange +
            "</range></icon-shadow>";
          addEnergyRing = false;
          addIconShadow = false;
        } else if (splitOptions[i].startsWith("custom(")) {
          const matches = regExp.exec(splitOptions[i]);
          const custom = matches[1].split(";")[1];
          if (pnDebug) {
            console.log("Multinode custom: " + custom);
          }
          trackIcons += "<icon class='" + custom + " small'" + "></icon>";
        } else if (splitOptions[i].startsWith("elements")) {
          const matches = regExp.exec(splitOptions[i]);
          const elementList = matches[1].split(";");
          let elementIcons = "";
          if (elementList.length === 2) {
            elementIcons +=
              "<element-or-wrap class='small'" +
              "><icon class='" +
              elementList[0] +
              " presence-or-first small'></icon>";
            elementIcons += "<icon class='backslash small'></icon>";
            elementIcons +=
              "<icon class='" +
              elementList[1] +
              " presence-or-second small'></icon></element-or-wrap>";
          }
          trackIcons += elementIcons;
        } else {
          trackIcons += "<icon class='" + splitOptions[i] + "'" + "></icon>";
        }
        trackIcons =
          "<presence-node-multi " + track_icon_loc + ">" + trackIcons + "</presence-node-multi>";
        inner += trackIcons;
      }
      // inner = trackIcons;
    }
  }

  if (addEnergyRing) {
    inner = "<energy-icon>" + inner + "</energy-icon>";
  }
  if (addIconShadow) {
    inner = "<icon-shadow>" + inner + "</icon-shadow>";
  }
  ring.innerHTML = inner;
  presenceNode.innerHTML += "<subtext>" + subText + "</subtext>";
  if (addDeepLayers) {
    let valueText = "";
    if (iconDeepLayers.startsWith("energy")) {
      const matches = regExp.exec(iconDeepLayers);
      const valueNum = matches[1];
      valueText = "<value>" + valueNum + "</value>";
      iconDeepLayers = "energy-blank";
    }
    presenceNode.innerHTML =
      "<deep-layers>" +
      "<icon class='" +
      iconDeepLayers +
      " " +
      nodeClass +
      "-deep-layers'>" +
      valueText +
      "</icon></deep-layers>" +
      presenceNode.innerHTML;
    presenceNode.getElementsByTagName("ring-icon")[0].classList.add("deep-layers");
    ring.classList.add("deep-layers");
  }

  return presenceNode.outerHTML;
}

/* exported updatePresenceNodeIDs */
function updatePresenceNodeIDs() {
  const board = document.querySelectorAll("board")[0];
  console.log(board);
  const presenceTable = document.getElementById("presence-table");
  const energyTrack = presenceTable.getElementsByClassName("energy-track")[0];
  const energyNodes = energyTrack.getElementsByTagName("presence-node");
  const playsTrack = presenceTable.getElementsByClassName("plays-track")[0];
  const playsNodes = playsTrack.getElementsByTagName("presence-node");
  for (let i = 0; i < energyNodes.length; i++) {
    energyNodes[i].id = "energy" + i;
  }
  for (let i = 0; i < playsNodes.length; i++) {
    playsNodes[i].id = "card" + i;
  }
}

function IconName(str, iconNum = 1) {
  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(str);
  let num = "";
  let txt = "";
  if (matches) {
    let options = matches[1].split(";");
    num = options[0];
    txt = options[1];
  }
  str = str.split("(")[0];
  if (!isNaN(str) && isNaN(str[0])) {
    num = str[1];
    str = "increase-energy";
  }
  let plural = iconNum > 1 ? "s" : "";
  let subText;
  switch (str) {
    case "presence":
      subText = "Your Presence";
      break;
    case "incarna":
      subText = "Your Incarna";
      break;
    case "energy":
      subText = num + " Energy";
      break;
    case "plays":
      subText = num + " Card Play" + plural;
      break;
    case "elements":
      subText = Capitalise(num) + " OR " + Capitalise(txt);
      break;
    case "gain-power-card":
      subText = "Gain Power Card";
      break;
    case "gain-card-play":
      subText = "+1 Card Play/Turn";
      break;
    case "reclaim-all":
      subText = "Reclaim Cards";
      break;
    case "reclaim-one":
      subText = "Reclaim One";
      break;
    case "reclaim":
      subText = "Reclaim Cards";
      break;
    case "reclaim-half":
      subText = "Reclaim Half <em>(round up)</em>";
      break;
    case "forget-power-card":
      subText = "Forget Power Card";
      break;
    case "discard-cards":
      subText = "Discard 2 Power Cards";
      break;
    case "discard-2-cards":
      subText = "Discard 2 Power Cards";
      break;
    case "discard-card":
      subText = "Discard 1 Power Card";
      break;
    case "discard-1-card":
      subText = "Discard 1 Power Card";
      break;
    case "gain-1-time":
      subText = "Gain 1 Time";
      break;
    case "gain-2-time":
      subText = "Gain 2 Time";
      break;
    case "days-never-were":
      subText = "Gain Power Card from Days That Never Were";
      break;
    case "destroy-presence":
      subText = "Destroy 1 of your Presence";
      break;
    case "destroyed-presence":
      subText = "Destroyed Presence";
      if (iconNum > 1) {
        subText = "up to " + iconNum + " Destroyed Presence";
      }
      break;
    case "make-fast":
      subText = "One of your Powers may be Fast";
      break;
    case "gain-card-pay-2":
      subText = "Pay 2 Energy to Gain a Power Card";
      break;
    case "ignore-range":
      subText = "You may ignore Range this turn";
      break;
    case "star":
      subText = "Element";
      break;
    case "markerplus":
      subText = "Prepare " + iconNum + " Element Marker" + plural;
      break;
    case "markerminus":
      subText = "Discard " + iconNum + " Element Marker" + plural;
      break;
    case "isolate":
      subText = "Isolate " + iconNum + " of your Lands";
      break;
    case "reclaim-none":
      subText = "Reclaim None";
      break;
    case "increase-energy":
      subText = "+" + num + " Energy";
      break;
    case "move-presence":
      subText = "Move Presence " + num[0];
      break;
    case "damage-1":
      subText = "Deal 1 Damage in one of your Lands";
      break;
    case "damage-2":
      subText = "Deal 2 Damage in one of your Lands";
      break;
    case "custom":
      subText = num;
      break;
    case "gain-range":
      subText = "+" + num[0] + " Range";
      if (typeof txt !== "undefined") {
        subText += " on " + txt;
      }
      break;
    case "inland":
    case "coastal":
    case "invaders":
      subText = str.toUpperCase();
      break;
    default:
      subText = iconNum > 1 ? iconNum + " " + Capitalise(str) : Capitalise(str);
  }

  return subText;
}

function Capitalise(str, plural = 0) {
  str = str.trim();
  //check if custom icon
  if (str.startsWith("custom")) {
    str = getCustomIconName(str);
  }

  //others
  const hyphenCheck = str.split("-");
  const terrains = new Set(["wetland", "mountain", "sand", "sands", "jungle"]);
  let return_str = hyphenCheck[0].charAt(0).toUpperCase() + hyphenCheck[0].slice(1);
  if (plural) {
    return_str += makePlural(hyphenCheck[0]);
  }
  for (let i = 1; i < hyphenCheck.length; i++) {
    if (terrains.has(hyphenCheck[i])) {
      return_str += " or ";
    } else {
      return_str += " ";
    }
    return_str += hyphenCheck[i].charAt(0).toUpperCase() + hyphenCheck[i].slice(1);
    if (plural) {
      return_str += makePlural(hyphenCheck[i]);
    }
  }

  return return_str;
}

function setupCustomIcons() {
  const spiritStyle = document.querySelectorAll("style")[0];
  let styleText = spiritStyle.textContent;
  if (styleText) {
    console.log("CREATING CUSTOM ICONS");
    let customIconHolder = document.createElement("custom-icons");
    const body = document.querySelectorAll("board")[0];
    body.appendChild(customIconHolder);

    let icons = styleText.split(/icon.custom[1-9]{/);
    icons.shift();
    let backgroundImages = [];
    let iconNames = [];
    icons.forEach((value, i) => {
      iconNames = value.split("data-iconname:")[1].trim().split(";")[0].replaceAll("'", "");
      backgroundImages.push(value.split("background-image:")[1].trim().split(";")[0]);
      let customIconHTML = document.createElement("icon");
      customIconHTML.setAttribute("data-iconname", iconNames);
      customIconHTML.classList.add("custom" + (i + 1));
      customIconHolder.appendChild(customIconHTML);
    });
  }
}

function getCustomIconName(iconName) {
  //Getting an icon's custom name
  const customIconHolder = document.querySelectorAll("custom-icons")[0];
  let customIcon = customIconHolder.getElementsByClassName(iconName)[0];
  let returnName = customIcon.getAttribute("data-iconname") ?? iconName;
  console.log("Retrieving Custom Icon Name for " + iconName + ": " + returnName);
  return returnName;
}

function makePlural(str) {
  if (str.charAt(-1).toUpperCase() !== "S") {
    return "s";
  }
  return "";
}

function growthHeadersAndTitles() {
  // Create Headers (if using Subsets)
  let debug = false;
  const board = document.querySelectorAll("board")[0];
  const growthTable = board.getElementsByTagName("growth-table")[0];
  const headerWidth = {};
  const headerAdditionalWidth = {};
  let maxIndex = undefined;
  if (debug) {
    console.log("Checking growth for headers");
  }
  for (const c of growthTable.children) {
    if (debug) {
      console.log(c);
    }
    const header = parseInt(c.getAttribute("header"));
    if (!isNaN(header)) {
      maxIndex = header;
      const addWidth =
        parseFloat(window.getComputedStyle(c).getPropertyValue("margin-right").replace(/px/, "")) +
        parseFloat(window.getComputedStyle(c).getPropertyValue("margin-left").replace(/px/, "")) +
        parseFloat(window.getComputedStyle(c).getPropertyValue("width").replace(/px/, ""));

      if (headerWidth[header]) {
        headerWidth[header] += addWidth;
      } else {
        headerWidth[header] = addWidth;
      }
    } else if (maxIndex !== undefined) {
      const addWidth =
        parseFloat(window.getComputedStyle(c).getPropertyValue("margin-right").replace(/px/, "")) +
        parseFloat(window.getComputedStyle(c).getPropertyValue("margin-left").replace(/px/, "")) +
        parseFloat(window.getComputedStyle(c).getPropertyValue("width").replace(/px/, ""));
      if (headerAdditionalWidth[maxIndex]) {
        headerAdditionalWidth[maxIndex] += addWidth;
      } else {
        headerAdditionalWidth[maxIndex] = addWidth;
      }
    } else {
      if (debug) {
        console.log("No header");
      }
    }
  }

  const subGrowthTitle = board.getElementsByTagName("sub-section-title");
  if (board.getElementsByTagName("growth-table").length > 1 && subGrowthTitle.length) {
    console.log("Warning: growth sets does not work correctly when a second growth row is used");
  }
  let position = 0;
  for (let i = 0; i < subGrowthTitle.length; i++) {
    subGrowthTitle[i].style.left = `${position}px`;
    subGrowthTitle[i].style.width = `${headerWidth[i]}px`;
    position += headerWidth[i] + headerAdditionalWidth[i];
  }

  // Create special titles
  const growthTableTitles = board.getElementsByTagName("growth-table");
  for (const table of growthTableTitles) {
    const growthGroupsTitles = table.getElementsByTagName("growth-group");
    for (const group of growthGroupsTitles) {
      const specialTitle = group.getAttribute("special-title");
      const specialTitleLeft = group.getAttribute("special-title-left");
      if (specialTitle) {
        const growthActionsTitles = group.getElementsByTagName("growth-cell");
        let growthGroupWidth = 0;
        for (const action of growthActionsTitles) {
          console.log(action.style.width);
          growthGroupWidth += parseFloat(action.style.width.replace(/px/, ""));
        }
        growthGroupWidth = Math.ceil(growthGroupWidth);
        group.style.width = growthGroupWidth + "px";
        const specialSectionTitle = document.createElement("special-section-title");
        specialSectionTitle.innerHTML = specialTitle;
        // group.appendChild(specialSectionTitle);
        group.insertBefore(specialSectionTitle, group.firstChild);
        //find the parent, add a class that creates space.
        table.classList.add("has-special-title");
        if (specialTitleLeft) {
          specialSectionTitle.classList.add("title-left");
          group.style.width = growthGroupWidth + 100 + "px";
          table.classList.add("title-left");
        }
      }
    }
  }
}

function dynamicResizing() {
  let debug = false;
  const board = document.querySelectorAll("board")[0];

  console.log("RESIZING: Growth");
  // Growth Sizing
  let growthTable = board.getElementsByTagName("growth-table")[0];

  // Add additional Growth Row if necessary
  let totalWidth = getGrowthTableWidth(growthTable);
  let growthTexts = board.getElementsByTagName("growth-text");
  let tallGrowthText = hasTallGrowthText(growthTexts);
  if (debug) {
    console.log("Tall growth text found? (4 or more lines) " + tallGrowthText);
  }

  function hasTallGrowthText(texts) {
    let hasTall = false;
    for (let i = 0; i < texts.length; i++) {
      hasTall = texts[i].offsetHeight > 57 ? true : hasTall;
      // true if any growth-text is more than 3 lines
    }
    return hasTall;
  }

  let newGrowthTable;
  if (totalWidth > 1090 || tallGrowthText) {
    const growthGroups = growthTable.getElementsByTagName("growth-group");
    const growthBorders = growthTable.getElementsByTagName("growth-border");
    newGrowthTable = document.createElement("growth-table");
    const growthLine = document.createElement("growth-row-line");
    let c = 0;
    while (totalWidth > 1090 || tallGrowthText) {
      if (c === 0) {
        newGrowthTable.appendChild(growthGroups[growthGroups.length - 1]);
      } else {
        const growthBorder = document.createElement("growth-border");
        newGrowthTable.insertBefore(growthBorder, newGrowthTable.firstChild);
        newGrowthTable.insertBefore(
          growthGroups[growthGroups.length - 1],
          newGrowthTable.firstChild
        );
      }
      growthBorders[growthBorders.length - 1].remove();
      totalWidth = getGrowthTableWidth(growthTable);
      tallGrowthText = hasTallGrowthText(growthTable.getElementsByTagName("growth-text"));
      c++;
    }
    document.getElementsByTagName("growth")[0].append(growthLine);
    document.getElementsByTagName("growth")[0].append(newGrowthTable);
  }

  const allGrowthCells = board.getElementsByTagName("growth-cell");
  let growthWidthByIcons = [];
  for (let j = 0; j < allGrowthCells.length; j++) {
    growthWidthByIcons[j] = getGrowthActionIconWidth(allGrowthCells[j]);
  }

  // Adjust Growth Text
  if (debug) {
    console.log("ADJUSTING GROWTH TEXT");
  }
  const maxGrowthTextHeight = newGrowthTable !== undefined ? 50 : 75;
  for (let i = 0; i < growthTexts.length; i++) {
    // Add lines to very wide text (up to 3 lines total)
    balanceText(growthTexts[i]); // First balance the text to give an accurate sense of what needs new lines
    if (
      growthTexts[i].offsetWidth > growthWidthByIcons[i] * 1.1 &&
      growthTexts[i].offsetWidth > 135 &&
      growthTexts[i].offsetHeight < 57
    ) {
      addLine(growthTexts[i]);
      balanceText(growthTexts[i]);
      if (debug) {
        console.log(
          'Added line to:"' +
            growthTexts[i].textContent +
            "(" +
            growthTexts[i].offsetHeight +
            "," +
            growthTexts[i].offsetWidth +
            ")"
        );
      }

      if (
        growthTexts[i].offsetWidth > growthWidthByIcons[i] * 1.1 &&
        growthTexts[i].offsetWidth > 155 &&
        growthTexts[i].offsetHeight < 57
      ) {
        addLine(growthTexts[i]);
        balanceText(growthTexts[i]);
        if (debug) {
          console.log(
            'Added second line to:"' +
              growthTexts[i].textContent +
              "(" +
              growthTexts[i].offsetHeight +
              "," +
              growthTexts[i].offsetWidth +
              ")"
          );
        }
      }
    }
  }
  for (let i = 0; i < growthTexts.length; i++) {
    if (growthTexts[i].offsetHeight < 70) {
      balanceText(growthTexts[i]);
      if (debug) {
        console.log(
          'Balancing growth text "' +
            growthTexts[i].textContent +
            '" to ' +
            growthTexts[i].style.width +
            " width."
        );
      }
    }
  }
  for (let i = 0; i < growthTexts.length; i++) {
    if (growthTexts[i].offsetHeight > maxGrowthTextHeight) {
      reduceLines(growthTexts[i]);
      balanceText(growthTexts[i]);
      if (debug) {
        console.log("Reducing growth text lines for " + growthTexts[i].textContent);
      }
    }
  }

  // TEST iterate through growth cells
  // const cellWidthV2 = [];
  // for (const cell of allGrowthCells) {
  //   const cellRect = findBoundingRect(cell);
  //   // console.log('-- TEST --')
  //   // console.log(cellRect)
  //   // console.log(cell)
  //   // console.log(cellRect.width)
  //   // console.log('^--RESULT--^')
  //   cellWidthV2.push(cellRect.width);
  // }
  /* console.log('total icon width = '+totalInitialIconWidth) */
  // console.log('old way = '+totalWidth)
  // console.log(cellWidthV2)

  //Iterate through growth table(s) to resize
  const growthTables = board.getElementsByTagName("growth-table");

  let tightFlag = false; // flag for tightening presence tracks later
  for (let i = 0; i < growthTables.length; i++) {
    growthTable = growthTables[i];
    if (i === 0 && growthTables.length > 1) {
      growthTable.classList.add("two-table-top");
      tightFlag = true;
      console.log("will tighten presence tracks");
    }

    const growthCells = growthTable.getElementsByTagName("growth-cell");
    const growthTexts = growthTable.getElementsByTagName("growth-text");
    const growthCosts = growthTable.getElementsByTagName("growth-cost");
    let growthCostsPixels = 0;
    for (let j = 0; j < growthCosts.length; j++) {
      growthCostsPixels += 10; //Currently, all costs are width 10 (including negative margins).
    }

    const localBorders = growthTable.getElementsByTagName("growth-border");
    let localBorderPixels = 0;
    for (let j = 0; j < localBorders.length; j++) {
      localBorderPixels += localBorders[j].offsetWidth;
    }

    const growthPanelWidth = 1090 - 10 - localBorderPixels - growthCostsPixels;
    if (debug) {
      console.log("width for growth actions = " + growthPanelWidth);
    }
    let totalCellWidth = 0;
    let growthWidthByIcons = [];
    let growthTextHeights = [];
    let growthTextWidths = [];
    let growthTextAreas = [];
    for (let j = 0; j < growthCells.length; j++) {
      totalCellWidth += growthCells[j].offsetWidth;
      growthWidthByIcons[j] = getGrowthActionIconWidth(growthCells[j]);
      growthTextHeights[j] = growthTexts[j].getBoundingClientRect().height;
      growthTextWidths[j] = growthTexts[j].getBoundingClientRect().width;
      if (debug) {
        console.log(
          growthTextWidths[j] +
            " vs " +
            growthTexts[j].offsetWidth +
            "vs " +
            growthCells[j].offsetWidth
        );
      }
      growthTextAreas[j] = Math.trunc(growthTextWidths[j] * growthTextHeights[j]);
    }
    let adjustedGrowthWidths = growthWidthByIcons.map((gw, i) => Math.max(gw, growthTextWidths[i]));
    const totalAdjustedIconWidth = adjustedGrowthWidths.reduce(
      (partialSum, a) => partialSum + a,
      0
    );

    if (debug) {
      console.log("Height/Width/Area/Huge?/Tighten?/WidthByIcons/AdjustedWidths");
      // console.log(growthTextHeights);
      console.log(growthTextWidths);
      // console.log(growthTextAreas);
      // console.log(textSizeHuge);
      // console.log(textSizeNeedsTightening)
      console.log(growthWidthByIcons);
      console.log(adjustedGrowthWidths);
    }

    const averageWidth = totalCellWidth / growthCells.length;
    if (debug) {
      console.log("aveage width = " + averageWidth);
    }
    if (totalCellWidth > 1000 || i === 0) {
      for (let j = 0; j < growthCells.length; j++) {
        growthCells[j].style.width =
          adjustedGrowthWidths[j] * (growthPanelWidth / totalAdjustedIconWidth) + "px";
      }
    } else if (i > 0) {
      growthTable.classList.add("two-table-bottom");
      // growthTable.style.maxWidth = growthCells.length * averageWidth +100 + "px";
      for (let j = 0; j < growthCells.length; j++) {
        let iconWidth = getGrowthActionIconWidth(growthCells[j]);
        let textWidth = growthTexts[j].getBoundingClientRect().width;
        let cellWidth = Math.max(iconWidth, textWidth);
        console.log("cellwidth = " + cellWidth);
        growthCells[j].style.width = 1.1 * cellWidth + 20 + "px"; //10 for padding (maybe tweak the 1.15) maybe instead update the width based on text & icons
        console.log(adjustedGrowthWidths);
        growthCells[j].style.minWidth = "100px";
        if (j < growthCells.length - 1) {
          growthCells[j].style.paddingRight = "20px";
        }
      }
    }

    totalWidth = 0;
    for (let j = 0; j < growthCells.length; j++) {
      totalWidth += growthCells[j].offsetWidth;
    }

    if (i > 0) {
      const growthLines = board.getElementsByTagName("growth-row-line");
      growthLines[i - 1].style.width = totalWidth + "px";
    }
  }

  growthHeadersAndTitles();

  // Handle Tint (corners)
  let growthGroupsTint = board.getElementsByTagName("growth-group");
  if (growthGroupsTint) {
    for (let group of growthGroupsTint) {
      let growthTints = group.getElementsByClassName("tint");
      if (growthTints.length === 1) {
        console.log("found solo tint");
        growthTints[0].classList.add("solo-tint");
      } else if (growthTints.length) {
        growthTints[0].classList.add("start-tint");
        growthTints[growthTints.length - 1].classList.add("end-tint");
      }
    }
  }

  // Relax growth text
  const finalGrowthTexts = board.getElementsByTagName("growth-text");
  for (let i = 0; i < finalGrowthTexts.length; i++) {
    finalGrowthTexts[i].style.width = "unset";
    balanceText(growthTexts[i]);
    if (debug) {
      console.log("relaxing growth texts");
    }
  }

  // Innate Power Sizing
  console.log("RESIZING: Innate Powers");
  // Innate Power Notes (scale font size)
  const noteBlocks = board.getElementsByTagName("note");
  for (let i = 0; i < noteBlocks.length; i++) {
    let noteHeight = noteBlocks[i].offsetHeight;
    let j = 0;
    while (noteHeight > 92) {
      const style = window.getComputedStyle(noteBlocks[i], null).getPropertyValue("font-size");
      const fontSize = parseFloat(style);
      noteBlocks[i].style.fontSize = fontSize - 1 + "px";
      noteHeight = noteBlocks[i].offsetHeight;
      // safety valve
      j += 1;
      if (j > 5) {
        break;
      }
    }
  }

  // Innate Power Levels
  const description = board.getElementsByClassName("description");
  const thresholds = Array.from(board.getElementsByTagName("threshold"));
  const levels = board.getElementsByTagName("level");

  let outerThresholdWidth = thresholds.map(
    (threshold) =>
      threshold.clientWidth +
      parseFloat(
        window.getComputedStyle(threshold).getPropertyValue("margin-right").replace(/px/, "")
      )
  );

  for (let i = 0; i < description.length; i++) {
    // Scale the text width to the threshold size...
    description[i].style.paddingLeft = outerThresholdWidth[i] + "px";
    // description[i].style.position = "relative";
    const textHeight = description[i].clientHeight;
    if (textHeight < 40) {
      description[i].classList.add("single-line");
      // Align-middle the text if its a single line
    } else if (textHeight > 86) {
      // Wrap description below the threshold if its greater than three lines
      description[i].style.paddingLeft = "0px";
      thresholds[i].classList.add("description-wrap");
      levels[i].classList.add("description-wrap");
    }
  }

  console.log("RESIZING: Presence Tracks");
  //Load tracks
  const presenceTrack = board.getElementsByTagName("presence-tracks")[0];
  const energyTrack = board.getElementsByClassName("energy-track")[0];
  const playsTrack = board.getElementsByClassName("plays-track")[0];
  //Load board ojects
  const growth = board.getElementsByTagName("growth")[0];
  const right = board.getElementsByTagName("right")[0];

  //Check horizontal overflow
  if (checkOverflowWidth(presenceTrack, 0)) {
    let spacers = Array.from(presenceTrack.getElementsByClassName("spacer"));
    spacers.forEach((spacer) => {
      spacer.classList.add("tight");
    });
    console.log("> compressing Tracks horizontally; smaller initial spacer");
  }
  if (checkOverflowWidth(presenceTrack, 20)) {
    let tdNodes = Array.from(presenceTrack.getElementsByTagName("td"));
    tdNodes.forEach((tdNode) => {
      tdNode.classList.add("tight");
    });
    console.log("> compressing Tracks horizontally; less space between nodes");
  }

  //Update Presence Track banners
  let presenceTableRows = Array.from(presenceTrack.getElementsByTagName("tr"));
  presenceTableRows.forEach((row) => {
    let rowTDs = Array.from(row.getElementsByTagName("td"));
    let backgroundSizeEnergy = 0;
    rowTDs.forEach((td) => {
      backgroundSizeEnergy += td.offsetWidth;
    });
    let curBackgroundSize = row.style.backgroundSize ? row.style.backgroundSize : "100% 100%";
    let newBackgroundSize = backgroundSizeEnergy + "px " + curBackgroundSize.split(" ")[1];
    row.style.backgroundSize = newBackgroundSize;
  });

  // Presence node subtext (for longer descriptions, allows flowing over into neighbors.
  let currentTrack;
  debug = true;
  // let last_node_adjusted = false;
  if (tightFlag) {
    console.log("tightening presence tracks");
    board.getElementsByTagName("presence-title")[0].classList.add("tight");
  }

  const allEnergyNodes = Array.from(energyTrack.getElementsByTagName("presence-node"));

  for (let j = 0; j < 2; j++) {
    // Do Energy Track then Plays Track
    if (j === 0) {
      currentTrack = energyTrack;
      if (debug) {
        console.log("energy track");
      }
    } else {
      currentTrack = playsTrack;
      if (debug) {
        console.log("plays track");
      }
    }
    const subtext = currentTrack.getElementsByTagName("subtext");
    const presence_nodes = currentTrack.getElementsByTagName("presence-node");
    const track_tds = currentTrack.getElementsByTagName("td");
    if (debug) {
      console.log(presence_nodes[0].classList);
    }
    if (debug) {
      console.log(track_tds);
    }

    let subtextArray = Array.from(subtext);
    let textHeightsArray = subtextArray.map((st) => st.offsetHeight);
    subtextArray.forEach((subtext) => {
      if (subtext.offsetHeight < 50) {
        balanceText(subtext);
      }
    });
    subtextArray.forEach((text, i) => {
      console.log(text);
      if (i > 0) {
        if (text.offsetHeight > 50) {
          // subtext.classList.add("adjust-subtext");
          let leftTextLocation = subtextArray[i - 1].getBoundingClientRect();
          let curTextLocation = text.getBoundingClientRect();
          let rightTextLocation;
          let rightLeft;
          if (i + 1 === subtextArray.length) {
            rightTextLocation = board.getBoundingClientRect();
            rightLeft = rightTextLocation.right - 16;
          } else {
            rightTextLocation = subtextArray[i + 1].getBoundingClientRect();
            rightLeft = rightTextLocation.left - 10;
          }
          console.log(leftTextLocation);
          console.log(curTextLocation);
          console.log(rightTextLocation);
          let deltaL = curTextLocation.left - leftTextLocation.right - 10;
          let deltaR = rightLeft - curTextLocation.right;
          let delta = deltaL < deltaR ? deltaL : deltaR;
          console.log("delta:" + delta);
          if (delta > 0) {
            delta = delta > 30 ? 30 : delta;
            let newWidth = curTextLocation.width + 2 * delta;
            console.log(curTextLocation.width + " " + newWidth);
            console.log(text);
            subtext[i].style.width = newWidth + "px";
            console.log(subtext[i]);
            balanceText(subtext[i]);
          }
        }
      }
    });
    console.log("textHeightsArray");
    console.log(textHeightsArray);
    // for (let i = 0; i < subtext.length; i++) {
    //   let textHeight = subtext[i].offsetHeight;
    //   if (track_tds[1].classList.contains("middle")) {
    //     // Only read/apply to non-middle nodes
    //     textHeight = 0;
    //     last_node_adjusted = false;
    //   } else if (textHeight > 55) {
    //     // Only adjust if its >2 lines (~50px is 2 lines)
    //     if (!last_node_adjusted) {
    //       subtext[i].classList.add("adjust-subtext");
    //       textHeight = subtext[i].offsetHeight;
    //       last_node_adjusted = true;
    //       console.log("adjusting node text: " + subtext[i].innerHTML);
    //     } else {
    //       console.log(
    //         "rejected text adjstment for: " +
    //           subtext[i].innerHTML +
    //           " :Reason: neighbor already adjusted: "
    //       );
    //       last_node_adjusted = false;
    //     }
    //   } else {
    //     last_node_adjusted = false;
    //   }
    // }
  }

  // Adjust table
  const innatePowerBoxCheck = board.getElementsByTagName("innate-powers")[0];
  innatePowerBoxCheck.style.height =
    right.clientHeight - presenceTrack.clientHeight - growth.clientHeight + "px";
  if (checkOverflowHeight(innatePowerBoxCheck)) {
    allEnergyNodes.forEach((node) => {
      //should replace this with css
      node.style.marginBottom = "5px";
    });
    console.log(">Compressing Presence Tracks Vertically");
  }

  // Place middle presence nodes
  const firstRow = energyTrack;
  const firstRowHeight = firstRow.offsetHeight;
  if (debug) {
    console.log("first row height: " + firstRowHeight);
  }
  const middleNodes = presenceTrack.getElementsByClassName("middle");
  for (let i = 0; i < middleNodes.length; i++) {
    let presenceNode = middleNodes[i].getElementsByTagName("presence-node");
    presenceNode[0].style.top = firstRowHeight / 2 + "px";
  }

  console.log("RESIZING: INNATE NOTES (IF NEEDED)");
  // Size Innate Power box
  const presenceTracks = board.getElementsByTagName("presence-tracks")[0];
  const innatePowers = board.getElementsByTagName("innate-power");

  // Shrink Innate Power notes if needed for space
  const innatePowerBox = board.getElementsByTagName("innate-powers")[0];
  innatePowerBox.style.height =
    right.clientHeight - presenceTracks.clientHeight - growth.clientHeight + "px";
  let moveFlag = false;
  let k = 0;

  // First give left innate more horizontal room
  if (checkOverflowHeight(innatePowerBox)) {
    console.log(">Innate Power 1 overflowing, giving more room to IP1");
    let levels = Array.from(innatePowers[0].getElementsByTagName("level"));
    levels.forEach((level) => {
      level.style.width = "507px";
    });
  }
  // Then tighten up the power levels
  if (checkOverflowHeight(innatePowerBox)) {
    console.log(">Innate Powers overflowing, shrinking space between levels");
    let levels = Array.from(board.getElementsByTagName("level"));
    levels.forEach((level) => {
      level.style.marginBottom = "2px";
    });
  }
  // Then tighten up the power level font spacing
  if (checkOverflowHeight(innatePowerBox)) {
    console.log(">Innate Powers overflowing, shrinking level description line height");
    let descriptions = Array.from(board.getElementsByClassName("description"));
    descriptions.forEach((description) => {
      description.style.lineHeight = "1";
    });
  }
  if (checkOverflowHeight(innatePowerBox)) {
    console.log("Innate Powers overflowing, shrinking notes (if applicable)...");

    // First, check if its just one IP, and if so, move its note to the side (see Ember-Eyed)
    if (innatePowers.length === 1) {
      const note = innatePowers[0].getElementsByTagName("note")[0];
      if (note) {
        note.classList.add("single-squish");
        console.log("Single power note detected. Moving note to side.");
        moveFlag = true;
      }
    }

    const descriptionContainers = innatePowerBox.getElementsByTagName("description-container");
    let tallest = 0;
    let tallest_index = 0;
    for (let i = 0; i < descriptionContainers.length; i++) {
      if (descriptionContainers[i].clientHeight > tallest) {
        tallest = descriptionContainers[i].clientHeight;
        tallest_index = i;
      }
    }
    console.log("tallest is Innate Power: " + (tallest_index + 1));

    //check for note in tallest innate power
    const noteBox = descriptionContainers[tallest_index].getElementsByTagName("note")[0];
    if (noteBox && !moveFlag) {
      console.log("notebox detected, attempting to shrink");
      while (checkOverflowHeight(innatePowerBox)) {
        const style = window.getComputedStyle(noteBox, null).getPropertyValue("font-size");
        const fontSize = parseFloat(style);
        noteBox.style.fontSize = fontSize - 1 + "px";
        const line = window.getComputedStyle(noteBox, null).getPropertyValue("line-height");
        const lineHeight = parseFloat(line);
        noteBox.style.lineHeight = lineHeight - 1 + "px";
        // safety valve
        k += 1;
        if (k > 10) {
          console.log("Notes shrunk as far as reasonable");
          break;
        }
      }
    } else {
      console.log("Unable to shrink notes - note not detected in tallest power");
    }
  }
}

function getGrowthTableWidth(growthTable) {
  const growthGroups = growthTable.getElementsByTagName("growth-group");
  const growthBorders = Array.from(growthTable.getElementsByTagName("growth-border"));

  let borderPixels = 0;
  for (let i = 0; i < growthBorders.length; i++) {
    borderPixels += growthBorders[i].offsetWidth;
  }

  let totalGroupWidth = 0;
  for (let i = 0; i < growthGroups.length; i++) {
    totalGroupWidth += growthGroups[i].offsetWidth;
  }

  const totalWidth = totalGroupWidth + borderPixels;
  return totalWidth;
}

function getGrowthActionIconWidth(growthCell) {
  let growthChildren = Array.from(growthCell.children);
  let rect = growthChildren[0].getBoundingClientRect();
  return rect.width;
}

function balanceText(el) {
  let debug = false;
  if (debug) {
    console.log("Balancing Text: " + el.textContent);
  }
  const initialHeight = el.offsetHeight;
  if (initialHeight > 20) {
    // No action needed for 1 liners (19px)
    let currentHeight = initialHeight;
    let j = 0;
    let k = Math.trunc(el.offsetWidth);
    let overflow = false;
    while (currentHeight <= initialHeight) {
      overflow = checkOverflowWidth(el, 0);
      if (overflow) {
        if (debug) {
          console.log("balance overflowing, j=" + j);
        }
        break;
      }
      // tighten until it changes something
      k = k - 1;
      el.style.width = k + "px";
      currentHeight = el.offsetHeight;
      j += 1;
      if (j > 200) {
        if (debug) {
          console.log("Max text reduction reached for");
          console.log(el);
        }
        break;
      }
    }
    if (debug) {
      console.log(
        "reset at w=" + el.offsetWidth + ",h=" + el.offsetHeight + ",overflow=" + overflow
      );
    }
    k = k + 1;
    el.style.width = k + "px";
    if (debug) {
      console.log("reset to w=" + el.offsetWidth + ",h=" + el.offsetHeight);
    }
    // el.style.width = el.offsetWidth + "px";
  }
}

function reduceLines(el) {
  const initialHeight = el.offsetHeight;
  let currentHeight = initialHeight;
  let j = 0;
  let k = Math.trunc(el.offsetWidth);
  console.log(el.textContent + ": starting height = " + initialHeight);
  while (currentHeight >= initialHeight) {
    k = k + 1;
    el.style.width = k + "px";
    currentHeight = el.offsetHeight;
    j += 1;
    if (j > 50) {
      console.log("Max line reduction reached for");
      console.log(el);
      break;
    }
  }
  el.style.width = el.offsetWidth + "px";
  console.log(el.textContent + ": final height = " + currentHeight);
}

function addLine(el) {
  const initialHeight = el.offsetHeight;
  let currentHeight = initialHeight;
  let j = 0;
  let k = Math.trunc(el.offsetWidth);
  while (currentHeight <= initialHeight) {
    k = k - 1;
    el.style.width = k + "px";
    currentHeight = el.offsetHeight;
    j += 1;
    if (j > 80) {
      console.log("Add line maxed out");
      console.log(el);
      break;
    }
  }
  el.style.width = k + "px";
}

function checkOverflowWidth(el, slack = 30) {
  let curOverflow = el.style.overflowX;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflowX = "auto";
  }
  let isOverflowing = el.clientWidth + slack < el.scrollWidth ? el.scrollWidth : false;
  el.style.overflowX = curOverflow;

  return isOverflowing;
}

function checkOverflowHeight(el, slack = 2) {
  let debug = false;
  let curOverflow = el.style.overflowY;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflowY = "auto";
  }
  let isOverflowing = el.clientHeight + slack < el.scrollHeight;
  if (debug) {
    console.log(
      "check overflowY = " + (el.clientHeight + slack) + " " + slack + "," + el.scrollHeight
    );
  }
  el.style.overflowY = curOverflow;
  return isOverflowing;
}

// Putting this function on ice for now, it isn't used presently.
// function findBoundingRect(el) {
//   let growthCellRect;
//   // console.log(el.tagName+", "+el.classList.value)
//   if (el.children.length === 0) {
//     growthCellRect = el.getBoundingClientRect();
//     return growthCellRect;
//   } else {
//     growthCellRect = el.children[0].getBoundingClientRect();
//   }
//   // console.log(el.tagName+", "+el.classList.value+' left = '+growthCellRect.left)
//   // console.log(el.tagName+", "+el.classList.value+' right = '+growthCellRect.right)
//   for (const child of el.children) {
//     if (child.tagName !== "GROWTH-TEXT") {
//       let newCellRect = findBoundingRect(child);
//       if (newCellRect.left < growthCellRect.left) {
//         growthCellRect.left = newCellRect.left;
//       }
//       if (newCellRect.right > growthCellRect.right) {
//         growthCellRect.right = newCellRect.right;
//       }
//     }
//   }
//   // console.log('returning for '+el.tagName+", "+el.classList.value+':')
//   // console.log(' left = '+growthCellRect.left)
//   // console.log(' right = '+growthCellRect.right)
//   return growthCellRect;
// }

function parseInnatePowers() {
  console.log("BUILDING INNATE POWERS");
  const board = document.querySelectorAll("board")[0];

  let fullHTML = "";
  const innateHTML = board.getElementsByTagName("quick-innate-power");

  for (let i = 0; i < innateHTML.length; i++) {
    fullHTML += parseInnatePower(innateHTML[i], i);
  }

  let innatePowerContainer = board.getElementsByTagName("innate-powers")[0];
  // Allow custom heading name
  let customNameText = innatePowerContainer.getAttribute("customname")
    ? ` customName="${innatePowerContainer.getAttribute("customname")}"`
    : "";

  innatePowerContainer.innerHTML =
    `<section-title${customNameText}>Innate Powers</section-title><innate-power-container>` +
    fullHTML +
    "</innate-power-container>";
}

function parseInnatePower(innatePowerHTML, index) {
  const innatePowerID = "ip" + index;
  let currentPowerHTML =
    "<innate-power id='" +
    innatePowerID +
    "' class='" +
    innatePowerHTML.getAttribute("speed") +
    "'>";

  //Innate Power title
  currentPowerHTML +=
    "<innate-power-title id='" +
    innatePowerID +
    "title'>" +
    innatePowerHTML.getAttribute("name") +
    "</innate-power-title><info-container><info-title>";

  //Innate Power Speed and Range Header
  currentPowerHTML +=
    "<info-title-speed>SPEED</info-title-speed><info-title-range>RANGE</info-title-range>";

  //Innate Power Target Header
  currentPowerHTML +=
    "<info-title-target id='" +
    innatePowerID +
    "targettitle'>" +
    innatePowerHTML.getAttribute("target-title") +
    "</info-title-target></info-title><innate-info>";

  //Innater Power Speed value
  currentPowerHTML += "<innate-info-speed></innate-info-speed>";

  //Innate Power Range value
  currentPowerHTML += `<innate-info-range id="${innatePowerID}range">${getRangeModel(
    innatePowerHTML.getAttribute("range")
  )}</innate-info-range>`;

  //Innate Power Target value
  const targetValue = innatePowerHTML.getAttribute("target");
  currentPowerHTML += `<innate-info-target id="${innatePowerID}target">${replaceIcon(
    targetValue
  )}</innate-info-target></innate-info></info-container>`;

  currentPowerHTML += "<description-container>";

  let noteValue = innatePowerHTML.getAttribute("note");

  //If the note field is blank, don't include it
  if (noteValue === null || noteValue === "") {
    noteValue = "";
  } else {
    currentPowerHTML += "<note id='" + innatePowerID + "note'>" + noteValue + "</note>";
  }

  //Innate Power Levels and Thresholds
  const currentLevels = innatePowerHTML.getElementsByTagName("level");
  for (let j = 0; j < currentLevels.length; j++) {
    currentPowerHTML += writeInnateLevel(currentLevels[j], innatePowerID + "L" + j);
  }

  currentPowerHTML += "</description-container></innate-power>";
  return currentPowerHTML;
}

function getRangeModel(rangeString) {
  if (rangeString === "none" || rangeString === "") {
    return "<no-range></no-range>";
  } else {
    let result = "";
    for (const item of rangeString.split(",")) {
      if (!isNaN(item)) {
        result += `<range>${item}</range>`;
      } else {
        result += `<icon class="${item}"></icon>`;
      }
    }
    return result;
  }
}

function writeInnateLevel(currentLevel, levelID) {
  let debug = false;
  if (debug) {
    console.log("writing level");
  }
  if (debug) {
    console.log(currentLevel);
  }
  let levelHTML = "";
  const currentThreshold = currentLevel.getAttribute("threshold");
  const isText = currentLevel.getAttribute("text");
  if (isText !== null) {
    // User wants a special text-only line
    levelHTML += "<level><level-note>";
    levelHTML += currentLevel.innerHTML + "</level-note></level>";
  } else {
    // User wants a normal thershold-level effect

    let isLong = currentLevel.getAttribute("long");
    if (isLong !== null) {
      isLong = " long";
    } else {
      isLong = "";
    }

    // Break the cost into a numeral and element piece (then do error handling to allow switching the order)
    levelHTML += "<level>";
    levelHTML += writeInnateThreshold(currentThreshold, levelID);
    levelHTML += "<div class='description" + isLong + "' id='" + levelID + "'>";
    const currentDescription = currentLevel.innerHTML;
    levelHTML += currentDescription + "</div></level>";
  }

  return levelHTML;
}

function writeInnateThreshold(currentThreshold, levelID = "placeholder") {
  let debug = false;
  const regExp = /\(([^)]+)\)/;
  let thresholdHTML = "";
  if (debug) {
    console.log("writing threshold");
  }
  if (debug) {
    console.log(currentThreshold);
  }
  thresholdHTML += "<threshold id='" + levelID + "t'>";
  const currentThresholdPieces = currentThreshold.split(",");
  const elementPieces = [];
  const numeralPieces = [];
  for (let k = 0; k < currentThresholdPieces.length; k++) {
    elementPieces[k] = currentThresholdPieces[k].substring(
      currentThresholdPieces[k].indexOf("-") + 1
    );
    numeralPieces[k] = currentThresholdPieces[k].split("-")[0];
  }

  for (let k = 0; k < currentThresholdPieces.length; k++) {
    let currentNumeral = 0;
    let currentElement = "";
    if (isNaN(numeralPieces[k])) {
      currentNumeral = elementPieces[k].trim();
      currentElement = numeralPieces[k];
    } else {
      currentElement = elementPieces[k];
      currentNumeral = numeralPieces[k].trim();
    }
    let currentNumeralHTML = "<threshold-num>" + currentNumeral + "</threshold-num>";
    if (currentElement.toUpperCase() === "OR") {
      currentThresholdPieces[k] = "<threshold-or>or</threshold-or>";
    } else if (currentElement.toUpperCase().startsWith("TEXT")) {
      if (currentElement.split("(")[1]) {
        const customText = regExp.exec(currentElement)[1];
        currentThresholdPieces[k] = currentNumeralHTML + " " + customText;
      } else {
        currentThresholdPieces[k] = currentNumeralHTML + " " + "X";
      }
    } else if (currentElement.toUpperCase().startsWith("COST")) {
      if (currentElement.split("(")[1]) {
        const customCost = regExp.exec(currentElement)[1];
        currentThresholdPieces[k] =
          "<cost-threshold>Cost<icon class='" +
          customCost +
          " cost-custom'><value>-" +
          currentNumeral +
          "</value></icon></cost-threshold>";
      } else {
        currentThresholdPieces[k] =
          "<cost-threshold>Cost<cost-energy><value>-" +
          currentNumeral +
          "</value></cost-energy></cost-threshold>";
      }
    } else {
      currentThresholdPieces[k] = currentNumeralHTML + "{" + currentElement + "}";
    }
    thresholdHTML += currentThresholdPieces[k];
  }
  thresholdHTML += "</threshold>";
  return thresholdHTML;
}

function parseSpecialRules() {
  console.log("BUILDING SPECIAL RULES");
  const board = document.querySelectorAll("board")[0];

  const specialRules = board.getElementsByTagName("special-rules-container")[0];
  const specialRuleSection = specialRules.getElementsByTagName("section-title")[0];
  const specialRuleList = specialRules.getElementsByTagName("special-rule");
  const specialRuleNameList = specialRules.getElementsByTagName("special-rules-subtitle");

  // Enable snake-like presence track in special rules
  const specialTrack = board.getElementsByTagName("special-rules-track")[0];
  if (specialTrack) {
    const specialValues = specialTrack.getAttribute("values");
    const specialOptions = specialValues.split(",");
    let specialHTML = "";

    for (let i = 0; i < specialOptions.length; i++) {
      let nodeText = specialOptions[i];
      specialHTML += "<td>" + getPresenceNodeHtml(nodeText, i === 0, i, "special", true) + "</td>";
    }
    specialHTML += "</tr>";
    board.getElementsByTagName("special-rules-track")[0].removeAttribute("values");
    specialTrack.innerHTML = specialHTML;
    const subtextList = specialTrack.getElementsByTagName("subtext");
    for (let i = subtextList.length - 1; i >= 0; --i) {
      subtextList[i].remove();
    }
  }

  // Tag special rules with IDs
  for (let j = 0; j < specialRuleList.length; j++) {
    specialRuleList[j].id = "sr" + j + "effect";
    specialRuleNameList[j].id = "sr" + j + "name";
  }

  // Allow custom heading name
  if (specialRules.getAttribute("customname")) {
    console.log("special rule heading detected");
    console.log(specialRuleSection);
    console.log(specialRules.getAttribute("customname"));
    console.log(specialRuleSection);
    specialRuleSection.setAttribute("customname", specialRules.getAttribute("customname"));
  }

  // <special-rules-track values="2,3,4"></special-rules-track>
}

function tagSectionHeadings() {
  const board = document.querySelectorAll("board")[0];
  let sectionHeadings = board.getElementsByTagName("section-title");
  for (let j = 0; j < sectionHeadings.length; j++) {
    let headingName = sectionHeadings[j].textContent.split(" ")[0];
    sectionHeadings[j].id = "section-title-" + headingName.toLowerCase();
    if (sectionHeadings[j].getAttribute("customname")) {
      sectionHeadings[j].textContent = sectionHeadings[j].getAttribute("customname");
      console.log("custom heading name detected and assigned");
    }
  }
}
