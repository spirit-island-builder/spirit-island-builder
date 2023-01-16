"use strict";

/* global replaceIcon */

window.onload = () => {
  startMain();
  console.log("Page Loaded");
};

function startMain() {
  console.log("CREATING SPIRIT BOARD");
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

  setTimeout(function () {
    dynamicResizing();
    addImages(board);
  }, 200);
}

function addImages(board) {
  console.log("ADDING IMAGES");
  const spiritImage = board.getAttribute("spirit-image");
  const artistCredit = board.getElementsByTagName("artist-name");
  const spiritBorder = board.getAttribute("spirit-border");

  const imageSize = board.getAttribute("spirit-image-scale");

  const specialRules = board.querySelectorAll("special-rules-container")[0];
  let height = specialRules.getAttribute("height");
  if (!height) {
    const computedStyle = window.getComputedStyle(specialRules);
    height = computedStyle.getPropertyValue("height");
  }

  if (spiritBorder) {
    const spiritBorderSize = board.getAttribute("spirit-border-scale");
    const spiritNamePanel = board.querySelectorAll("spirit-name")[0];
    console.log("here");
    console.log(spiritBorderSize);
    spiritNamePanel.style.backgroundImage = `url(${spiritBorder})`;
    const borderHeight = spiritBorderSize !== null ? spiritBorderSize : "100px";
    console.log("here too");
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
}

function buildGrowthPanel() {
  console.log("BUILDING GROWTH PANEL");
  const board = document.querySelectorAll("board")[0];
  const growthHTML = board.getElementsByTagName("growth");

  const growthTitle = "<section-title>" + growthHTML[0].title + "</section-title>";

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
  let debug = false;

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
  growthGroupHTML += `<growth-group` + headerText + specialTitleText + `>`;

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

  for (let j = 0; j < growthActions.length; j++) {
    growthGroupHTML += writeGrowthAction(growthActions[j], setIndex, groupIndex, j, tint_text);
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
  if (growthActionType === "or") {
    console.log("or detected");
    isOr = true;
    const matches = regExpOuterParentheses.exec(growthAction)[1];
    orGrowthActions = matches.split(regExpCommaNoParentheses);
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
  let firstAction, secondAction;
  if (isOr) {
    firstAction = getGrowthActionTextAndIcons(orGrowthActions[0]);
    secondAction = getGrowthActionTextAndIcons(orGrowthActions[1]);
    growthIcons = firstAction[0];
    growthText = firstAction[1];
  } else {
    let actionIconsAndText = getGrowthActionTextAndIcons(growthAction);
    growthIcons = actionIconsAndText[0];
    growthText = actionIconsAndText[1];
  }

  //Handle Presence Node
  if (isPresenceNode) {
    growthIcons =
      '<presence-node class="growth"><ring-icon>' + growthIcons + "</ring-icon></presence-node>";
    isPresenceNode = false;
  }

  //Handle Ors
  if (isOr) {
    growthText += " or " + secondAction[1];
    growthIcons += "or" + secondAction[0];
    growthIcons = "<growth-cell-double>" + growthIcons + "</growth-cell-double>";
    isOr = false;
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
    repeatOpen = "<repeat-growth><value>" + repeat + "</value></repeat-growth>";
    repeatText = "x" + repeat + ": ";
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
            if (gainPCModifiersOrText) {
              gainPowerCardText += gainPCModifiersOrText;
            }
            break;
          default:
            gainPowerCardIcon +=
              "<icon class='" + gainPowerCardType.toLowerCase() + " gain-card-modifier'></icon>";
            gainPowerCardText = "Gain " + Capitalise(gainPowerCardType) + " Power Card";
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
        isolateIcons += "<range-growth>" + isolateRange + "</range-growth>";
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
        "<range-growth>" +
        range +
        "</range-growth></custom-icon>";
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
          : "<div class='custom-scaling'>!!!</div>";

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
      let presenceRangeOpen = "<range-growth>";
      let presenceRangeClose = "</range-growth>";

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
              "<span style='font-family: DK Snemand; font-size: 24pt; font-style: normal;'>!!!</span>";
          }
        } else if (presenceOptions[1] === "token") {
          // User wants to add a token in growth
          switch (presenceOptions[3]) {
            case "and":
              //add presence and token
              presenceIcon += "<span class='plus-text'>+ </span>";
              presenceIcon += "{" + presenceOptions[2] + "}";
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
            "<range-growth>" +
            moveRange +
            "</range-growth></push-gather-range-req>";
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
        moveIcons = "<custom-icon>{presence}{move-range-" + moveRange + "}</custom-icon>";
        moveText = "Move a Presence";
      } else if (!isNaN(moveOptions[1])) {
        moveIcons = "<custom-icon><token-wrap>";
        for (let i = 0; i < moveOptions[1]; i++) {
          moveIcons += "{presence}";
        }
        moveIcons += "</token-wrap>{move-range-" + moveRange + "}</custom-icon>";
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
            const x_loc = 1.3 * rad_size * Math.cos(pos_angle) - 30;
            const y_loc = rad_size * Math.sin(pos_angle) - 20;
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
          elementIcons += "<icon style='width:0px;height:99px'></icon>"; // This is a filler icon to make sure the spacing is right. Any idea for a better solution?

          growthIcons = "<gain>" + elementIcons + "</gain>";
          growthText = "Gain " + elementText;
        }
      } else {
        growthIcons = "<gain>{" + gainedElement + "}</gain>";
        growthText = "Gain " + IconName(gainedElement);
      }
      break;
    }
    case "custom": {
      const matches = regExpOuterParentheses.exec(growthAction);
      let customOptions = matches[1].split(",");
      let customIcon = customOptions[1];
      let customText = customOptions[0];
      let listIcons = "";
      if (customIcon) {
        if (customIcon === "text") {
          customIcon = "<span class='non-icon'>" + customOptions[2] + "</span>";
        } else {
          for (let i = 1; i < customOptions.length; i++) {
            listIcons += "<icon class='" + customOptions[i] + " custom-growth-icon'></icon>";
          }
          customIcon = listIcons;
        }
      } else {
        customIcon = "<div class='custom-scaling'>!!!</div>";
      }
      growthIcons = "<custom-growth-icon>" + customIcon + "</custom-growth-icon>";
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
          : "<div class='custom-scaling'>!!!</div>";

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
          const x_loc = rad_size * Math.cos(pos_angle) - 30;
          const y_loc = rad_size * Math.sin(pos_angle) - 20;
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
      let customIncarnaIcon = incarnaOptions[2] !== undefined ? incarnaOptions[2] : "incarna-ember";
      switch (incarnaAction) {
        case "move":
          growthIcons =
            '<custom-icon2><icon class="incarna ' +
            customIncarnaIcon +
            '"></icon>{move-range-' +
            incarnaRangeOrToken +
            "}</custom-icon2>";
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
      let tokenRange = "<range-growth>" + range + "</range-growth>";
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
          '"></icon></replace-wrap><range-growth>' +
          range +
          "</range-growth></custom-icon>";
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
    console.log("banner reported in px");
    energyBannerScale = energyBannerScale + "px";
  }
  let energyHTML = "";

  //Determine the length of the energy track
  //If for some reason the width of a presence track spot changes, this needs to be updated. Ideas for automating?
  let energyLength = energyOptions.length * 130 + 15;
  if (energyBanner) {
    energyHTML =
      "<tr class='energy-track' style='background-image:  url(" +
      energyBanner +
      "); background-size: " +
      energyLength +
      "px " +
      energyBannerScale +
      "; background-repeat: no-repeat; background-position: left 0px top 20px;'>";
  } else {
    energyHTML = "<tr class='energy-track'>";
  }

  // This can be scaled to move the first presence icon.
  energyHTML += "<td style='width:10px'></td>";
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
    if (nodeText.startsWith("middle")) {
      nodeText = regExpOuterParentheses.exec(nodeText)[1];
      isMiddle = ' rowspan="2" class="middle"';
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
    console.log("banner reported in px");
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
  cardPlayHTML += "<td style='width:10px'></td>";

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
    console.log("Node Text:" + nodeText + ", is first?:" + first);
  }
  //Allows adding an icon top-left of the node using ^ (as with Stone)
  let addDeepLayers = false;
  let iconDeepLayers;
  if (nodeText.split("^")[1]) {
    iconDeepLayers = nodeText.split("^")[1];
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

    const splitOptions = nodeText.split("+");

    //This code allows user to include +energy in addition to just energy
    const plus_check = splitOptions.indexOf("");
    if (plus_check !== -1) {
      splitOptions.splice(plus_check, 1);
      splitOptions[plus_check] = "+" + splitOptions[plus_check];
      nodeClass = "energy";
    }

    if (splitOptions.length === 1) {
      //It's just a single item
      const option = splitOptions[0].split("(")[0];
      switch (option) {
        case "push": {
          const matches = regExp.exec(splitOptions[0]);
          const moveTarget = matches[1];
          let moveIcons = "<div class='push'>";
          let moveText = "";
          for (let i = 0; i < moveTarget.split(";").length; i++) {
            moveIcons += "{" + moveTarget.split(";")[i] + "}";
            moveText += Capitalise(moveTarget.split(";")[i]);
            if (i < moveTarget.split(";").length - 1) {
              moveIcons += "{backslash}";
              moveText += "/";
            }
          }
          moveIcons += "</div>";
          const preposition = option === "push" ? "from" : "into";
          inner = "<icon class='push'>" + moveIcons + "</icon>";
          subText = Capitalise(option) + " 1 " + moveText + " " + preposition + " 1 of your Lands";
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
          inner = inner = "<energy-icon><value>" + num + "</value></energy-icon>";
          subText = num;
          addEnergyRing = true;
          addIconShadow = false;
          break;
        }
        case "plays": {
          const matches = regExp.exec(splitOptions[0]);
          const num = matches[1];
          inner = inner = "<card-icon><value>" + num + "</value></card-icon>";
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
            inner = "<" + nodeClass + "-icon><value>!!!</value></" + nodeClass + "-icon>";
            addEnergyRing = false;
          }
          subText = custom_text;
          break;
        }
        case "move-presence": {
          const matches = regExp.exec(splitOptions[0]);
          const moveRange = matches[1];
          inner = "{move-presence-" + moveRange + "}";
          subText = "Move a Presence " + moveRange;
          addIconShadow = true;
          if (addEnergyRing) {
            addIconShadow = false;
          }
          break;
        }
        case "elements": {
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
            subText = elementText + " (choose each turn)";
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
      const rad_size = 22 + 1 * numLocs; // this expands slightly as more icons are used
      let trackIcons = "";
      for (let i = 0; i < numLocs; i++) {
        const pos_angle = (i * 2 * Math.PI) / numLocs - Math.PI * (1 - 1 / 6);
        const x_loc = rad_size * Math.cos(pos_angle) - 31;
        const y_loc = rad_size * Math.sin(pos_angle) - 25;
        const track_icon_loc =
          "style='transform: translateY(" + y_loc + "px) translateX(" + x_loc + "px)'";
        if (pnDebug) {
          console.log("Multinode: " + splitOptions[i]);
        }
        // deal with cards and energy
        if (!isNaN(splitOptions[i])) {
          trackIcons +=
            "<icon-multi-element><" +
            nodeClass +
            "-icon class='small'" +
            track_icon_loc +
            "><value>" +
            splitOptions[i] +
            "</value></" +
            nodeClass +
            "-icon></icon-multi-element>";
          if (nodeClass === "energy") {
            addEnergyRing = false;
          }
        } else if (splitOptions[i].startsWith("reclaim")) {
          trackIcons +=
            "<icon-multi-element><icon class='" +
            splitOptions[i] +
            " small-reclaim'" +
            track_icon_loc +
            "></icon></icon-multi-element>";
        } else if (splitOptions[i].startsWith("energy")) {
          const matches = regExp.exec(splitOptions[i]);
          const num = matches[1];
          trackIcons +=
            "<icon-multi-element><energy-icon class='small'" +
            track_icon_loc +
            "><value>" +
            num +
            "</value></energy-icon></icon-multi-element>";
          addEnergyRing = false;
        } else if (splitOptions[i].startsWith("plays")) {
          const matches = regExp.exec(splitOptions[i]);
          const num = matches[1];
          addEnergyRing = false;
          trackIcons +=
            "<icon-multi-element><card-icon class='small'" +
            track_icon_loc +
            "><value>" +
            num +
            "</value></card-icon></icon-multi-element>";
        } else if (splitOptions[i].startsWith("gain-card-play")) {
          trackIcons +=
            "<icon-multi-element><icon class='" +
            splitOptions[i] +
            " small'" +
            track_icon_loc +
            "></icon></icon-multi-element>";
        } else if (splitOptions[i].startsWith("move-presence")) {
          const matches = regExp.exec(splitOptions[i]);
          const moveRange = matches[1];
          trackIcons +=
            "<icon-multi-element><icon-shadow class = 'small'" +
            track_icon_loc +
            "><icon class='move-presence-" +
            moveRange +
            " small'></icon></icon-shadow></icon-multi-element>";
          addEnergyRing = false;
          addIconShadow = false;
        } else if (splitOptions[i].startsWith("gain-range")) {
          const matches = regExp.exec(splitOptions[i]);
          let gainRange = matches[1];
          gainRange = gainRange.split(";")[0];
          trackIcons +=
            "<icon-multi-element><icon-shadow class = 'small'" +
            track_icon_loc +
            "><range class='small'>+" +
            gainRange +
            "</range></icon-shadow></icon-multi-element>";
          addEnergyRing = false;
          addIconShadow = false;
        } else if (splitOptions[i].startsWith("custom")) {
          const matches = regExp.exec(splitOptions[i]);
          const custom = matches[1].split(";")[1];
          if (pnDebug) {
            console.log("Multinode custom: " + custom);
          }
          trackIcons +=
            "<icon-multi-element><icon class='" +
            custom +
            " small'" +
            track_icon_loc +
            "></icon></icon-multi-element>";
        } else if (splitOptions[i].startsWith("elements")) {
          const matches = regExp.exec(splitOptions[i]);
          const elementList = matches[1].split(";");
          let elementIcons = "";
          if (elementList.length === 2) {
            elementIcons +=
              "<icon-multi-element><element-or-wrap class='small'" +
              track_icon_loc +
              "><icon class='" +
              elementList[0] +
              " presence-or-first small'></icon>";
            elementIcons += "<icon class='backslash small'></icon>";
            elementIcons +=
              "<icon class='" +
              elementList[1] +
              " presence-or-second small'></icon></element-or-wrap></icon-multi-element>";
          }
          trackIcons += elementIcons;
        } else {
          trackIcons +=
            "<icon-multi-element><icon class='" +
            splitOptions[i] +
            "'" +
            track_icon_loc +
            "></icon></icon-multi-element>";
        }
      }
      inner = trackIcons;
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
      "<icon class='" +
      iconDeepLayers +
      " " +
      nodeClass +
      "-deep-layers'>" +
      valueText +
      "</icon>" +
      presenceNode.innerHTML;
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
    case "energy":
      subText = iconNum + " Energy";
      break;
    case "plays":
      subText = iconNum + " Card Play" + plural;
      break;
    case "elements":
      subText = Capitalise(num) + " OR " + Capitalise(txt);
      break;
    case "gain-power-card":
      subText = "Gain Power Card";
      break;
    case "gain-card-play":
      subText = "Gain a Card Play";
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

function makePlural(str) {
  if (str.charAt(-1).toUpperCase() !== "S") {
    return "s";
  }
  return "";
}

function setNewEnergyCardPlayTracks(energyHTML, cardPlayHTML) {
  console.log("BUILDING PRESENCE TRACK PANEL");
  const board = document.querySelectorAll("board")[0];
  const presenceTable = board.getElementsByTagName("presence-tracks")[0];
  presenceTable.innerHTML =
    "<presence-title><section-title>Presence</section-title></presence-title>" +
    "<table id='presence-table'>" +
    energyHTML +
    cardPlayHTML +
    "</table>";
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

function growthHeadersAndTitles() {
  // Create Headers (if using Subsets)
  let debug = true;
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
      console.log("maxIndex is defined");
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
        group.appendChild(specialSectionTitle);
        //find the parent, add a class that creates space.
        table.classList.add("has-special-title");
      }
    }
  }
}

function dynamicResizing() {
  let debug = false;
  const board = document.querySelectorAll("board")[0];

  console.log("RESIZING: Growth");
  // Growth Sizing
  // const allGrowthCells = board.getElementsByTagName("growth-cell");
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
      hasTall = texts[i].offsetHeight > 90 ? true : hasTall;
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
  /* console.log('total icon width = '+totalIconWidths) */
  // console.log('old way = '+totalWidth)
  // console.log(cellWidthV2)

  //Iterate through growth table(s) to resize
  const largeCellScale = 1.5;
  const extraLargeCellScale = 1.8;
  const growthTables = board.getElementsByTagName("growth-table");

  let tightFlag = false; // flag for tightening presence tracks later
  for (let i = 0; i < growthTables.length; i++) {
    growthTable = growthTables[i];
    if (growthTables.length > 1) {
      growthTable.style.marginTop = "10px";
      tightFlag = true;
      console.log("will tighten presence tracks");
    }

    const growthCells = growthTable.getElementsByTagName("growth-cell");
    let widthArray = [];

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
    for (let j = 0; j < growthCells.length; j++) {
      totalCellWidth += growthCells[j].offsetWidth;
      widthArray[j] = growthCells[j].offsetWidth;
    }

    const averageWidth = totalCellWidth / growthCells.length;
    if (debug) {
      console.log("aveage width = " + averageWidth);
    }
    if (totalCellWidth > 1000 || i === 0) {
      let smallCellFinder = widthArray.map((x) => x <= averageWidth * 1.35);
      let largeCellFinder = widthArray.map((x) => x > averageWidth * 1.35);
      let extraLargeCellFinder = widthArray.map((x) => x > averageWidth * 2);
      largeCellFinder = largeCellFinder.map((x, index) => x && !extraLargeCellFinder[index]);
      const largeCell = largeCellFinder.filter(Boolean).length;
      const smallCell = smallCellFinder.filter(Boolean).length;
      const extraLargeCell = extraLargeCellFinder.filter(Boolean).length;
      const weightedSmallCellWidth =
        growthPanelWidth /
        (smallCell + largeCellScale * largeCell + extraLargeCellScale * extraLargeCell);
      const weightedLargeCellWidth = weightedSmallCellWidth * largeCellScale;
      const weightedExtraLargeCellWidth = weightedSmallCellWidth * extraLargeCellScale;
      for (let j = 0; j < growthCells.length; j++) {
        if (extraLargeCellFinder[j]) {
          growthCells[j].style.width = weightedExtraLargeCellWidth + "px";
        } else if (largeCellFinder[j]) {
          growthCells[j].style.width = weightedLargeCellWidth + "px";
        } else {
          growthCells[j].style.width = weightedSmallCellWidth + "px";
        }
      }
    } else if (i > 0) {
      growthTable.style.maxWidth = growthCells.length * averageWidth + "px";
      growthTable.style.justifyContent = "flex-start";
      for (let j = 0; j < growthCells.length; j++) {
        growthCells[j].style.maxWidth = averageWidth + "px";
        growthCells[j].style.minWidth = "100px";
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

  // Final resize (catches really big things that were missed)
  let growthItems = board.getElementsByTagName("growth-cell");
  for (let i = 0; i < growthItems.length; i++) {
    if (checkOverflowWidth(growthItems[i])) {
      const children = growthItems[i].children;
      if (debug) {
        console.log("scroll width is larger for");
        console.log(growthItems[i]);
        console.log(children);
      }
      let childrenWidth = 0;
      for (let j = 0; j < children.length; j++) {
        childrenWidth = Math.max(children[j].offsetWidth, childrenWidth);
      }
      growthItems[i].style.width = childrenWidth + "px";
    }
  }

  // Balance Growth Text
  const maxGrowthTextHeight = newGrowthTable !== undefined ? 50 : 100;
  for (let i = 0; i < growthTexts.length; i++) {
    if (growthTexts[i].offsetHeight < 50) {
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
    } else if (growthTexts[i].offsetHeight > maxGrowthTextHeight) {
      reduceLines(growthTexts[i]);
      if (debug) {
        console.log("Reducing growth text lines for " + growthTexts[i].textContent);
      }
    }
  }

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

  // Innate Power Thresholds
  const thresholds = board.getElementsByTagName("threshold");
  const thresholdsCount = thresholds.length;
  let outerThresholdWidth = [];
  for (let i = 0; i < thresholdsCount; i++) {
    // Check if the threshold width is overflowing. If so, just let it size itself...
    const thresholdHeight = thresholds[i].offsetHeight;
    if (thresholdHeight > 60) {
      thresholds[i].style.width = "auto";
    }
    outerThresholdWidth[i] =
      thresholds[i].clientWidth +
      parseFloat(
        window.getComputedStyle(thresholds[i]).getPropertyValue("margin-right").replace(/px/, "")
      );
  }

  // Innate Power Descriptions
  const description = board.getElementsByClassName("description");
  for (let i = 0; i < description.length; i++) {
    // Scale the text width to the threshold size...
    description[i].style.paddingLeft = outerThresholdWidth[i] + "px";
    const textHeight = description[i].clientHeight;

    if (textHeight < 40) {
      description[i].classList.add("single-line");
      // Align-middle the text if its a single line
    } else if (textHeight > 75) {
      description[i].style.paddingLeft = "0px";
      // Spill over below the threshold if its greater than three lines
    }
  }

  console.log("RESIZING: Presence Tracks");
  // Presence node subtext (for longer descriptions, allows flowing over into neighbors.
  const presenceTrack = board.getElementsByTagName("presence-tracks")[0];
  const energyTrack = board.getElementsByClassName("energy-track")[0];
  const playsTrack = board.getElementsByClassName("plays-track")[0];
  let currentTrack;
  debug = false;
  let adjustment_flag = 0;
  let default_row_height = 48 * (3 / 4);
  if (tightFlag) {
    default_row_height = 0;
    console.log("tightening presence tracks");
    board.getElementsByTagName("presence-title")[0].style.marginBottom = "0px";
  }
  let row_max_height = default_row_height;
  let first_row_max = 0;
  let height_adjust = 0;
  for (let j = 0; j < 2; j++) {
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

    for (let i = 0; i < subtext.length; i++) {
      // Only read/apply to non-middle nodes
      let textHeight = subtext[i].offsetHeight;
      if (track_tds[1].classList.contains("middle")) {
        textHeight = 0;
        adjustment_flag = 0;
        //This solution is really jank, but it works for now
      } else if (textHeight > 55) {
        if (!adjustment_flag) {
          subtext[i].className = "adjust-subtext";
          textHeight = subtext[i].offsetHeight;
          adjustment_flag = 1;
          console.log("adjusting node: " + subtext[i].innerHTML);
        } else {
          console.log(
            "rejected text adjstment for: " +
              subtext[i].innerHTML +
              " :Reason: neighbor already adjusted: "
          );
          adjustment_flag = 0;
        }
      } else {
        adjustment_flag = 0;
      }
      row_max_height = textHeight > row_max_height ? textHeight : row_max_height;
    }

    // Prepare for second row
    height_adjust += row_max_height;
    if (j === 0) {
      first_row_max = row_max_height;
    }
    row_max_height = default_row_height;

    // Find first non-middle and set subtext height
    if (
      presence_nodes[0].classList.contains("first") &&
      track_tds[1].classList.contains("middle")
    ) {
      presence_nodes[1].style.marginBottom = first_row_max + 2 - 24 + "px";
      if (debug) {
        console.log("found middle & first node");
      }
    } else {
      presence_nodes[0].style.marginBottom = first_row_max + 2 - 24 + "px";
    }
  }
  const presence_table = document.getElementById("presence-table");
  presence_table.style.height = presence_table.offsetHeight + height_adjust + "px";

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
  const growth = board.getElementsByTagName("growth")[0];
  const presenceTracks = board.getElementsByTagName("presence-tracks")[0];
  const right = board.getElementsByTagName("right")[0];
  const innatePowers = board.getElementsByTagName("innate-power");

  // Shrink Innate Power notes if needed for space
  const innatePowerBox = board.getElementsByTagName("innate-powers")[0];
  let moveFlag = false;
  innatePowerBox.style.height =
    right.clientHeight - presenceTracks.clientHeight - growth.clientHeight + "px";
  let k = 0;
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

function balanceText(el) {
  let debug = false;
  const initialHeight = el.offsetHeight;
  let currentHeight = initialHeight;
  let j = 0;
  let k = 100;
  while (currentHeight <= initialHeight) {
    k = k - 3;
    el.style.width = k + "%";
    currentHeight = el.offsetHeight;
    j += 1;
    if (j > 10) {
      if (debug) {
        console.log("Max text reduction reached for");
        console.log(el);
      }
      break;
    }
  }
  k = k + 3;
  el.style.width = k + "%";
}

function reduceLines(el) {
  const initialHeight = el.offsetHeight;
  let currentHeight = initialHeight;
  let j = 0;
  let k = 100;
  while (currentHeight >= initialHeight) {
    k = k + 1;
    el.style.width = k + "%";
    currentHeight = el.offsetHeight;
    j += 1;
    if (j > 10) {
      console.log("Max text reduction reached for");
      console.log(el);
      break;
    }
  }
  el.style.width = k + "%";
}

function checkOverflowWidth(el) {
  let curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflow = "auto";
  }
  let isOverflowing = el.clientWidth + 30 < el.scrollWidth ? el.scrollWidth : false;
  el.style.overflow = curOverflow;

  return isOverflowing;
}

function checkOverflowHeight(el) {
  let curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflow = "auto";
  }
  let isOverflowing = el.clientHeight < el.scrollHeight;
  el.style.overflow = curOverflow;

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
  board.getElementsByTagName("innate-powers")[0].innerHTML =
    "<section-title>Innate Powers</section-title><innate-power-container>" +
    fullHTML +
    "</innate-power-container>";

  //Enable custom line breaks
  const levelList = board.getElementsByClassName("description");

  for (let j = 0; j < levelList.length; j++) {
    const ruleLines = levelList[j].innerHTML.split("\n");
    let rulesHTML = "";
    for (let i = 0; i < ruleLines.length; i++) {
      let rulesText = ruleLines[i];
      rulesText = rulesText.replaceAll("\t", "");
      if (rulesText && rulesText.trim().length) {
        rulesHTML += "<div>" + ruleLines[i] + "</div>";
      } else if (i > 0 && i < ruleLines.length - 1) {
        rulesHTML += "<br>";
        // allows user's line breaks to show up on the card
      }
    }
    levelList[j].innerHTML = rulesHTML;
  }
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
  currentPowerHTML += `<innate-info-range>${getRangeModel(
    innatePowerHTML.getAttribute("range")
  )}</innate-info-range>`;

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

  //Innate Power Target value
  const targetValue = innatePowerHTML.getAttribute("target");
  currentPowerHTML += `<innate-info-target>${replaceIcon(
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
      currentNumeral = elementPieces[k];
      currentElement = numeralPieces[k];
    } else {
      currentElement = elementPieces[k];
      currentNumeral = numeralPieces[k];
    }

    if (currentElement.toUpperCase() === "OR") {
      currentThresholdPieces[k] = "<threshold-or>or</threshold-or>";
    } else if (currentElement.toUpperCase().startsWith("TEXT")) {
      if (currentElement.split("(")[1]) {
        const customText = regExp.exec(currentElement)[1];
        currentThresholdPieces[k] = currentNumeral + " " + customText;
      } else {
        currentThresholdPieces[k] = currentNumeral + " " + "X";
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
      currentThresholdPieces[k] = currentNumeral + "{" + currentElement + "}";
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

  // Enable user's own line breaks to show up in code
  for (let j = 0; j < specialRuleList.length; j++) {
    const ruleLines = specialRuleList[j].innerHTML.split("\n");
    let rulesHTML = "";
    for (let i = 0; i < ruleLines.length; i++) {
      if (ruleLines[i] && ruleLines[i].trim().length) {
        rulesHTML += "<div>" + ruleLines[i] + "</div>";
      } else if (i > 0 && i < ruleLines.length - 1) {
        rulesHTML += "<br>";
        // allows user's line breaks to show up on the card
      }
    }
    specialRuleList[j].innerHTML = rulesHTML;
  }
  // <special-rules-track values="2,3,4"></special-rules-track>
}
