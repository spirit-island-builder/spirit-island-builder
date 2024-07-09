"use strict";

// const { text } = require("svelte/internal");

/* global replaceIcon */
/* global checkOverflowHeight */
/* global checkOverflowWidth */

let lang = "en";

/* exported startMain */
async function startMain() {
  console.log("Spirit Board startMain");
  if (document.getElementsByTagName("board")[0]) {
    console.log("CREATING SPIRIT BOARD");
    const board = document.querySelectorAll("board")[0];
    if (board.getAttribute("lang")) {
      lang = board.getAttribute("lang");
      console.log("found language " + lang);
    }

    setupCustomIcons();

    buildGrowthPanel();

    setNewEnergyCardPlayTracks(parseEnergyTrackTags(), parseCardPlayTrackTags());

    parseInnatePowers();

    parseSpecialRules();

    const html = board.innerHTML;
    board.innerHTML = replaceIcon(html);

    // This needs to be removed at some point, none of the code in here should be asynchronus and both dynamicResizing and addImages should not need to wait before they work properly. We have a race condition that works most of the time but will fail for some people.
    // Counterpoint: Resize needs the browser to draw the spirit board first, and then adjust things, so it needs to be drawn.
    await waitPromise(200);
    dynamicResizing();
    addImages(board);
    addTrackBanners(board);
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
    if (nameFontSize < 32) {
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
      `<spirit-image-holder><spirit-image class="spirit-image" style="height:${imageSize}; background-image: url(${spiritImage});" ></spirit-image></spirit-image-holder>` +
      board.innerHTML;
    artistCredit[0].style.display = "block";
    artistCredit[0].innerHTML = "Artist Credit: " + artistCredit[0].innerHTML;
  }

  //Add Meeple
  const spiritName = board.getElementsByTagName("spirit-name");
  spiritName[0].outerHTML += "<custom-meeple></custom-meeple>";
  spiritName[0].outerHTML += "<created-with>spiritislandbuilder.com</created-with>";
}

function addTrackBanners(board) {
  let debug = false;
  const presenceTracks = board.getElementsByTagName("presence-tracks")[0];

  // Check for Combined Banner
  let combinedBanner = board.getElementsByClassName("combined-track")[0];
  if (combinedBanner) {
    if (debug) {
      console.log("Combined banner");
    }
    presenceTracks.appendChild(combinedBanner);
    let table = document.getElementById("presence-table");
    let tableRows = presenceTracks.getElementsByTagName("tr");
    let firstRowNodes = tableRows[0].getElementsByTagName("presence-node");
    let lastRowNodes = tableRows[tableRows.length - 1].getElementsByTagName("presence-node");
    let tracksHeight =
      lastRowNodes[1].getBoundingClientRect().top -
      firstRowNodes[1].getBoundingClientRect().top +
      130;
    let trackTop =
      firstRowNodes[1].getBoundingClientRect().top -
      presenceTracks.getBoundingClientRect().top +
      tracksHeight / 2;
    combinedBanner.style.top = trackTop + "px";
    combinedBanner.style.width = table.getBoundingClientRect().width + "px";
    combinedBanner.style.height = tracksHeight + "px";
    console.log(tracksHeight);
  } else {
    // Default: Not combined track
    if (debug) {
      console.log("Default track art");
    }
    const tracks = Array.from(presenceTracks.getElementsByTagName("tr"));
    const bannerArts = Array.from(board.getElementsByTagName("track-banner-art"));
    const bannerTags = bannerArts.map((banner) => banner.className);
    bannerArts.forEach((banner) => {
      presenceTracks.appendChild(banner);
    });
    tracks.forEach((track) => {
      let nodes = track.getElementsByTagName("td");
      let trackType = track.classList[0];
      let trackWidth =
        nodes[nodes.length - 1].getBoundingClientRect().right -
        nodes[0].getBoundingClientRect().left;
      let trackTop =
        nodes[1].getBoundingClientRect().top + 130 / 2 - presenceTracks.getBoundingClientRect().top;
      if (track.classList.contains("has-split-node")) {
        trackTop += parseFloat(
          window.getComputedStyle(nodes[1]).getPropertyValue("padding-top").replace(/px/, "")
        );
      }
      let banner = bannerArts[bannerTags.indexOf(trackType)];
      banner.style.width = trackWidth + "px";
      banner.style.top = trackTop + "px";
    });
  }
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
        `<sub-section-title><sub-section-line></sub-section-line><sub-section-header>${e.title}</sub-section-header><sub-section-line></sub-section-line></sub-section-title>`
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

  const growthBottom = document.createElement("growth-bottom");
  growthHTML[0].appendChild(growthBottom);
  const growthBackground = document.createElement("growth-background");
  growthHTML[0].appendChild(growthBackground);
}

function writeGrowthGroup(growthGroup, setIndex = 0, groupIndex = 0, headerIndex = NaN) {
  let debug = true;

  console.log("--Growth Group s" + setIndex + "g" + groupIndex + "--");
  if (debug) {
    console.log("growthGroup: " + growthGroup.getAttribute("values"));
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
  const newRowFlag = growthGroup.getAttribute("new-row") ? ` new-row=true` : "";

  if (specialTitleTextLeft) {
    console.log("Found special title");
    console.log(growthGroup);
  }
  growthGroupHTML +=
    `<growth-group` + headerText + newRowFlag + specialTitleText + specialTitleTextLeft + `>`;

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
    console.log(growthAction);
  }

  // Establish Growth HTML Openers and Closers
  let growthOpen = "<growth-cell id='" + growthActionID + "'>" + tint_text;
  let growthTextOpen = "<growth-text>";
  let growthTextClose = "</growth-text></growth-cell>";
  let growthIcons = "";
  let growthText = "";
  let growthWasDefault;

  // Get the Text and Icons for the Growth Action
  let actionIconsAndText = getGrowthActionTextAndIcons(growthAction);
  growthIcons = actionIconsAndText[0];
  growthText = actionIconsAndText[1];
  growthWasDefault = actionIconsAndText[2];
  for (let a = 1; a < numActions; a++) {
    // For an 'or' growth, loop through the additional actions
    actionIconsAndText = getGrowthActionTextAndIcons(orGrowthActions[a]);
    growthText += " or " + actionIconsAndText[1];
    growthIcons += "or" + actionIconsAndText[0];
    growthWasDefault = 0;
  }

  //Handle Presence Node
  if (isPresenceNode) {
    console.log(growthIcons);
    if (growthAction.includes("blank")) {
      growthIcons =
        '<presence-node class="growth blank"><ring-icon>' +
        growthIcons +
        "</ring-icon></presence-node>";
    } else {
      if (growthWasDefault) {
        // Assume user wants Presence Node options
        console.log(growthIcons);
        console.log(growthAction);
        let nodeHTML = getPresenceNodeHtml(growthAction, false, 0, "card", false);
        let wrapper = document.createElement("div");
        wrapper.innerHTML = nodeHTML;
        let div = wrapper.firstChild;
        div.classList.add("growth");
        growthIcons = div.outerHTML;
        growthText = "";
      } else {
        growthIcons =
          '<presence-node class="growth"><ring-icon>' +
          growthIcons +
          "</ring-icon></presence-node>";
        console.log("node in growth with: " + growthIcons);
      }
    }
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
  let growthActionType = growthAction.split("(")[0].split("^")[0].split("*")[0];
  const regExp = /\(([^)]+)\)/;
  const regExpOuterParentheses = /\(\s*(.+)\s*\)/;

  let overrideText = "";
  if (growthAction.split("*")[1]) {
    overrideText = growthAction.split("*")[1].split("(")[0].split("^")[0];
    console.log("override detected:" + overrideText);
  }

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
      const matches = regExp.exec(repeat);
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
  let isDefault = 0;
  switch (growthActionType) {
    // Simple growth items are handled in the 'Default' case. See function IconName.
    // Only growth items with options are handled here.
    case "reclaim": {
      const matches = regExp.exec(growthAction);
      let reclaimIcon = "{reclaim-all}";
      let reclaimText = IconName("reclaim");
      if (matches) {
        console.log(matches);
        let reclaimOptions = matches[1].split(",");
        let reclaimType = reclaimOptions[0];
        let reclaimModifiersOrText = reclaimOptions[1];
        let reclaimSyntax = `${growthActionType}-${reclaimType}${matches[0]}`;
        reclaimText = IconName(reclaimSyntax);
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
            } else {
              reclaimIcon = "{reclaim-" + reclaimType + "}";
            }
            break;
          case "none":
            reclaimIcon = "{reclaim-" + reclaimType + "}";
            break;
          case "half":
            reclaimIcon = "{reclaim-" + reclaimType + "}";
            break;
          case "custom":
            reclaimIcon = "{reclaim-" + reclaimType + "}";
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
      growthText = IconName(growthActionType);
      break;
    }
    case "take-power-card":
    case "gain-power-card": {
      const matches = regExp.exec(growthAction);
      let gainPowerCardIcon = "{" + growthActionType + "}";
      if (matches) {
        let gainPowerCardOptions = matches[1].split(",");
        let gainPowerCardType = gainPowerCardOptions[0] || "";
        let gainPCModifierIcon = gainPowerCardOptions[2];
        gainPowerCardIcon = `<icon class='${growthActionType}'>`;
        gainPowerCardIcon +=
          "<icon class='" + gainPowerCardType.toLowerCase() + " gain-card-modifier'></icon>";
        if (gainPCModifierIcon) {
          gainPowerCardIcon += `<div class="gain-card-second-modifier">{${gainPCModifierIcon}}</div>`;
        }
        gainPowerCardIcon += "</icon>";
      }
      growthIcons = gainPowerCardIcon;
      growthText = IconName(growthAction);
      break;
    }
    case "isolate": {
      const matches = regExp.exec(growthAction);
      let isolateIcons = "{isolate}";
      let isolateReqOpen = "";
      let isolateReqClose = "";
      if (matches) {
        let isolateOptions = matches[1].split(",");
        let isolateRange = isolateOptions[0];
        isolateReqOpen = "<custom-icon>";
        isolateReqClose = "</custom-icon>";
        isolateIcons += "<range-growth><value>" + isolateRange + "</value></range-growth>";
      }
      growthIcons = isolateReqOpen + isolateIcons + isolateReqClose;
      let isolateText = IconName(growthAction);
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
      let damageText = IconName(growthAction);
      growthText = damageText;
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

      let iconNamevars = "0";
      // Flat Energy
      if (x_is_flat) {
        energyGrowthIcons = "<growth-energy><value>" + flatEnergy + "</value></growth-energy>";
        iconNamevars = flatEnergy + "";
      }

      // Scaling Energy
      if (scaling_entity || has_custom_text) {
        energyGrowthIcons += "<gain-per><value>" + scaling_value + "</value></gain-per>";
        energyGrowthIcons +=
          "<gain-per-element><ring-icon>" + customScalingIcon + "</ring-icon></gain-per-element>";
        iconNamevars += "," + scaling_value + "," + scaling_entity;
        iconNamevars += has_custom_text ? "," + custom_text : "";
      }
      growthIcons = energyManyIconOpen + energyGrowthIcons + energyManyIconClose;
      growthText = IconName(`gain-energy(${iconNamevars})`);
      break;
    }
    case "add-presence-custom": {
      console.log(growthAction);
      const fullMatch = regExpOuterParentheses.exec(growthAction);
      let initialOptions = fullMatch[1].split(",");
      overrideText = initialOptions[0];
      console.log(initialOptions);
      initialOptions.shift();
      growthAction = `add-presence(${initialOptions.join()})`;
    }
    // intentional fallthrough
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
      let presenceIcon = "";
      let presenceRangeOpen = "<range-growth><value>";
      let presenceRangeClose = "</value></range-growth>";

      if (presenceRange === "any" && presenceOptions.length === 1) {
        presenceReqOpen = "<custom-presence-no-range>";
        presenceReqClose = "</custom-presence-no-range>";
        presenceRangeOpen = "<range-growth-any>";
        presenceRangeClose = "</range-growth-any>";
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
              break;
            case "or":
              //add presence or token
              presenceReqOpen = "<custom-presence-req><custom-presence-or>";
              presenceReqClose = "</custom-presence-req>";
              presenceIcon = "{backslash}{" + presenceOptions[2] + "}</custom-presence-or>";
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

          for (let i = 1; i < presenceOptions.length; i++) {
            presenceReq = presenceOptions[i].toLowerCase().trim();

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
      growthText = IconName(growthAction);

      if (overrideText) {
        growthText = overrideText;
      }
      break;
    }
    case "push":
    case "gather": {
      const matches = regExp.exec(growthAction);

      let preposition = growthActionType === "push" ? "from" : "into";

      let moveIcons = "";
      let moveTarget = matches[1];
      let moveOptions = moveTarget.split(",");
      let moveRange = moveOptions[1];
      let moveNum = moveOptions[2];
      if (!moveNum) {
        moveNum = 1;
      } else if (isNaN(moveNum)) {
        moveNum = moveNum.toUpperCase();
      }
      if (moveRange) {
        moveTarget = moveOptions[0];
        if (isNaN(moveRange)) {
          let moveCondition = moveRange;
          // Gather/Push into/from a sacred site, land with token, or terrain

          switch (moveCondition) {
            case "sacred-site":
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
              break;
            default:
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
        }
      } else {
        moveIcons +=
          "<push-gather><icon class='" +
          growthActionType +
          "'>{" +
          moveTarget +
          "}</icon></push-gather>";
      }
      growthIcons = moveIcons;
      growthText = IconName(growthAction);
      break;
    }
    case "move-presence": {
      const matches = regExp.exec(growthAction);
      const moveOptions = matches[1].split(",");
      const moveRange = moveOptions[0];
      let moveText = IconName(growthAction);
      let moveIcons = "";
      if (!moveOptions[1]) {
        // Move presence range X
        moveIcons = `<custom-icon>{presence}<move-growth><value>
          ${moveRange}
          </value></move-growth></custom-icon>`;
        moveText = IconName(growthActionType);
      } else if (!isNaN(moveOptions[1])) {
        // Move X presence together
        moveIcons = "<custom-icon><token-wrap>";
        for (let i = 0; i < moveOptions[1]; i++) {
          moveIcons += "{presence}";
        }
        moveIcons += `</token-wrap><move-growth><value>
          ${moveRange}
          </value></move-growth></custom-icon>`;
      } else {
        // Move presence + token together
        moveIcons = `<custom-icon>
        <token-wrap>{presence}<icon class="${moveOptions[1]} token"></icon></token-wrap>
        <move-growth><value>${moveRange}</value></move-growth>
        </custom-icon>`;
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
          growthIcons = elementIcons;
        } else {
          // Gain multiple of the same element or gain multiple different elements (all of them, not or)

          let numLocs;
          // Text
          if (elementOptions.at(-1) === "and") {
            // gain multiple different elements
            numLocs = elementOptions.length - 1;
          } else {
            // gain multiple of the same element
            numLocs = elementOptions[1];
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
        }
      } else {
        growthIcons = "<gain>{" + gainedElement + "}</gain>";
      }
      growthText = IconName(growthAction);
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
      growthIcons = `<custom-growth-icon class='${isWide}'>${customIcon}</custom-growth-icon>`;
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

      let iconNamevars = "0";
      // Flat Fear
      if (x_is_flat) {
        fearGrowthIcons = "<growth-fear><value>" + flatFear + "</value></growth-fear>";
        iconNamevars = flatFear + "";
      }

      // Scaling Fear
      if (scaling_entity || has_custom_text) {
        fearGrowthIcons += "<fear-per><value>" + scaling_value + "</value></fear-per>";
        fearGrowthIcons +=
          "<gain-per-fear><ring-icon>" + customScalingIcon + "</ring-icon></gain-per-fear>";
        iconNamevars += "," + scaling_value + "," + scaling_entity;
        iconNamevars += has_custom_text ? "," + custom_text : "";
      }
      growthIcons = fearManyIconOpen + fearGrowthIcons + fearManyIconClose;
      growthText = IconName(`growth-fear(${iconNamevars})`);
      break;
    }
    case "gain-range": {
      const matches = regExp.exec(growthAction);
      let rangeOptions = matches[1].split(",");
      let range = rangeOptions[0];
      growthIcons = `{gain-range-${range}}`;
      growthText = IconName(`growth-${growthAction}`);
      break;
    }
    case "gain-card-play": {
      const matches = regExp.exec(growthAction);
      growthIcons = `{${growthActionType}}`;
      if (matches) {
        const cardplayOptions = matches[1].split(",");
        const num_card_plays = cardplayOptions[0];
        growthIcons = "<card-play-num><value>" + num_card_plays + "</value></card-play-num>";
      }
      growthText = IconName("growth-" + growthAction);
      break;
    }
    case "element-marker": {
      const matches = regExp.exec(growthAction);
      let num_markers = 1;
      if (matches) {
        let markerOptions = matches[1].split(",");
        num_markers = markerOptions[0];
      }
      const marker_type = num_markers > 0 ? "markerplus" : "markerminus";
      num_markers = Math.abs(num_markers);
      let markerIcons = "";
      if (num_markers > 1) {
        const numLocs = num_markers;
        let rad_size = 20 + 5 * (numLocs - 2); // this expands slightly as more icons are used
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
          // markerIcons += "<icon style='width:0px;height:99px'></icon>"; // This is a filler icon to make sure the spacing is right. Any idea for a better solution?
        }
      } else {
        markerIcons = `{${marker_type}}`;
      }
      growthIcons = "<gain>" + markerIcons + "</gain>";
      growthText = IconName(marker_type, num_markers);
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
        }
      } else {
        growthIcons = "{discard-card}";
      }
      growthText = IconName(growthAction);
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
          break;
        case "empower":
          growthIcons = "{empower-incarna}";
          break;
        case "add-move":
          growthIcons =
            '<custom-icon><add-move-upper>+{backslash}{move-arrow}</add-move-upper><add-move-lower><icon class="incarna add-move ' +
            customIncarnaIcon +
            '"></icon><icon class="' +
            incarnaRangeOrToken +
            ' with-your"></icon></add-move-lower></custom-icon>';
          break;
        case "replace":
          growthIcons =
            '<custom-icon><icon class="incarna with-incarna ' +
            customIncarnaIcon +
            '"><icon class="replace-with-incarna no ' +
            incarnaRangeOrToken +
            '"></custom-icon>';
          break;
        case "add-token":
          growthIcons =
            '<custom-icon><add-token-upper>+<icon class="add-token ' +
            incarnaRangeOrToken +
            '"></add-token-upper><add-token-lower><icon class="incarna ' +
            customIncarnaIcon +
            '"><add-token-lower></custom-icon>';
          break;
        default:
      }
      growthText = IconName(growthAction);
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
      let tokenIcons = "";
      let iconNameVars = range;
      if (!tokenNum) {
        tokenIcons = "+<icon class='" + token + " token'></icon>";
        iconNameVars += `,${"and"},${token}`;
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
        iconNameVars += `,${"and"},${token},${tokenNum}`;
      } else {
        // two or more different tokens
        const operator = tokenOptions.at(-1);
        tokenIcons += "+<icon class='" + token + " token'></icon>";
        if (operator === "and" || operator === "or") {
          for (let i = 2; i < tokenOptions.length - 1; i++) {
            tokenIcons += operator === "or" ? "/" : "";
            tokenIcons += "<icon class='" + tokenOptions[i] + " token'></icon>";
          }
        }
        iconNameVars += `,${operator},${tokenOptions.slice(1, -1)}`;
      }
      growthIcons =
        tokenReqOpen + "<token-wrap>" + tokenIcons + "</token-wrap>" + tokenRange + tokenReqClose;
      growthText = IconName(`add-token(${iconNameVars})`);
      break;
    }
    case "replace": {
      let replaceIcons = "";
      let iconNameVars = "0";
      const matches = regExp.exec(growthAction);
      let replaceOptions = matches[1].split(",");
      let range = replaceOptions[0];
      let x_is_num = !isNaN(replaceOptions[0]);

      let shift = 0;
      if (x_is_num) {
        iconNameVars = replaceOptions[0];
        shift += 1;
      }
      iconNameVars += "," + replaceOptions[shift] + "," + replaceOptions[shift + 1];
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
      } else {
        // Local replace
        replaceIcons =
          '<custom-icon><replace-wrap><icon class="replace-this-no-range no ' +
          replaceOptions[shift] +
          '"></icon>+<icon class="replace-with ' +
          replaceOptions[shift + 1] +
          '"></icon></replace-wrap></custom-icon>';
      }
      growthIcons = replaceIcons;
      growthText = IconName(`replace(${iconNameVars})`);
      break;
    }
    case "destroy-presence": {
      const matches = regExp.exec(growthAction);
      let destroyOptions = matches[1].split(",");
      let num = destroyOptions[0] || 1;
      let destroyIcons = "";
      for (let i = 0; i < num; i++) {
        destroyIcons += "{destroyed-presence}";
      }
      destroyIcons = `<destroy-wrap>${destroyIcons}</destroy-wrap>`;
      growthIcons = destroyIcons;
      growthText = IconName(growthAction);
      break;
    }
    default: {
      growthIcons = "{" + growthActionType + "}";
      growthText = IconName(growthActionType);
      isDefault = 1;
    }
  }

  //Handle Repeats
  if (repeatText) {
    growthIcons = "<repeat-wrapper>" + repeatOpen + growthIcons + "</repeat-wrapper>";
    growthText = repeatText + growthText;
  }

  if (overrideText) {
    growthText = overrideText;
  }

  return [growthIcons, growthText, isDefault];
}

function setNewEnergyCardPlayTracks(energyHTML, cardPlayHTML) {
  console.log("BUILDING PRESENCE TRACKS");
  const board = document.querySelectorAll("board")[0];
  const presenceTable = board.getElementsByTagName("presence-tracks")[0];

  // Allow custom heading name
  let customNameText = presenceTable.getAttribute("customname")
    ? ` customName="${presenceTable.getAttribute("customname")}"`
    : "";

  // Enable additional presence tracks
  const additionalTracks = Array.from(document.getElementsByTagName("additional-track"));
  let additionalTrackHTML = "";
  additionalTracks.forEach((additionalTrack, i) => {
    additionalTrackHTML += parseAdditionalTrackTags(additionalTrack, i);
  });

  presenceTable.innerHTML =
    `<presence-title><section-title${customNameText}>Presence</section-title></presence-title>` +
    "<table id='presence-table'><tbody>" +
    energyHTML +
    cardPlayHTML +
    additionalTrackHTML +
    "</tbody></table>";

  //detect combined-banners
  const combinedBanner = presenceTable.getAttribute("banner");
  if (combinedBanner) {
    // Prepare banner
    console.log("preparing combined banner");
    if (combinedBanner) {
      createTrackBannerArt(combinedBanner, presenceTable, "combined");
    }
    presenceTable.removeAttribute("banner");
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

  const presenceBottom = document.createElement("presence-bottom");
  presenceTable.appendChild(presenceBottom);
}

function createTrackBannerArt(banner, trackTemplate, type, i = "") {
  const board = document.querySelectorAll("board")[0];
  const newTrackBanner = document.createElement("track-banner-art");
  newTrackBanner.classList.add(`${type}-track${i}`);
  newTrackBanner.style.backgroundImage = `url(${banner})`;
  board.appendChild(newTrackBanner);
  let bannerScale = trackTemplate.getAttribute("banner-v-scale");
  if (!bannerScale) {
    bannerScale = "100";
  }
  if (bannerScale.at(-1) !== "%") {
    bannerScale = bannerScale + "px";
  }
  newTrackBanner.style.backgroundSize = `100% ${bannerScale}`;
}

function parseEnergyTrackTags() {
  const board = document.querySelectorAll("board")[0];
  const energyTrackTemplate = board.getElementsByTagName("energy-track")[0];
  const energyValues = energyTrackTemplate.getAttribute("values");
  const energyOptions = energyValues.split(",");

  // Prepare banner
  const energyBanner = energyTrackTemplate.getAttribute("banner");
  if (energyBanner) {
    createTrackBannerArt(energyBanner, energyTrackTemplate, "energy");
  }

  let energyHTML = "<tr class='energy-track'>";

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
  const playsTrackTemplate = board.getElementsByTagName("card-play-track")[0];
  const cardPlayValues = playsTrackTemplate.getAttribute("values");
  const cardPlayOptions = cardPlayValues.split(",");

  // Prepare banner
  const cardPlayBanner = playsTrackTemplate.getAttribute("banner");
  if (cardPlayBanner) {
    createTrackBannerArt(cardPlayBanner, playsTrackTemplate, "plays");
  }

  let cardPlayHTML = "<tr class='plays-track'>";

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

function parseAdditionalTrackTags(additionalTrack, i) {
  const board = document.querySelectorAll("board")[0];
  const additionalTrackValues = additionalTrack.getAttribute("values");
  const additionalTrackOptions = additionalTrackValues.split(",");
  const additionalTrackTemplate = board.getElementsByTagName("card-play-track")[0];

  // Prepare banner
  const additionalTrackBanner = additionalTrackTemplate.getAttribute("banner"); //Use CardPlay banner
  if (additionalTrackBanner) {
    createTrackBannerArt(additionalTrackBanner, additionalTrackTemplate, "additional", i);
  }

  let additionalTrackHTML = `<tr class='additional-track${i}'>`;

  // This can be scaled to move the first presence icon.
  additionalTrackHTML += "<td class='spacer'></td>";

  for (let i = 0; i < additionalTrackOptions.length; i++) {
    additionalTrackHTML +=
      "<td>" + getPresenceNodeHtml(additionalTrackOptions[i], i === 0, i, "card", false) + "</td>";
  }
  additionalTrackHTML += "</tr>";
  additionalTrack.removeAttribute("values");
  return additionalTrackHTML;
}

// Localize
let Energy = {
  en: "Energy",
  de: "Energie",
  pl: "Energia",
  ar: "طاقة",
};
let Turn = {
  en: "Turn",
  de: "Runde",
  pl: "Rundę",
  ar: "دور",
};
let CardPlay = {
  en: "Card Play",
  de: "Karte ausspielen",
  pl: "Zagraj jedną",
};
let CardPlays = {
  en: "Card Plays",
  de: "Karten ausspielen",
  pl: "Zagrane Karty",
};
// let Gain = {
//   en: "Gain",
//   de: "",
//   pl: "Pozyskaj",
// };
// let PowerCard = {
//   en: "Power Card",
//   de: "",
//   pl: "Kartę Mocy",
// };
// let Minor = {
//   en: "Minor",
//   de: "",
//   pl: "Pomniejsza",
// };
// let Major = {
//   en: "Major",
//   de: "",
//   pl: "Większa",
// };
let elNames = {
  en: {
    sun: "sun",
    moon: "moon",
    fire: "fire",
    air: "air",
    plant: "plant",
    water: "water",
    earth: "earth",
    animal: "animal",
    star: "element",
    any: "any",
  },
  de: {
    sun: "Sonne",
    moon: "Mond",
    fire: "Feuer",
    air: "Luft",
    plant: "Pflanze",
    water: "Wasser",
    earth: "Erde",
    animal: "Tier",
    star: "Element",
    any: "Beliebig",
  },
  pl: {
    sun: "słońce",
    moon: "księżyc",
    fire: "ogień",
    air: "powietrze",
    plant: "roślinność",
    water: "woda",
    earth: "ziemia",
    animal: "zwierzęcość",
    star: "źródło mocy",
    any: "dowolne",
  },
  ar: {
    sun: "الشمس",
    moon: "القمر",
    fire: "نار",
    air: "هواء",
    plant: "نبات",
    water: "ماء",
    earth: "أرض",
    animal: "حيوان",
    star: "عنصر تقليدي",
    any: "اي",
  },
  zh: {
    sun: "日",
    moon: "月",
    fire: "火",
    air: "氣",
    plant: "植物",
    water: "水",
    earth: "土",
    animal: "動物",
    star: "元素",
    any: "任意",
  },
};

let landtypeNames = {
  en: {
    "ocean": "Ocean",
    "oceans": "Ocean",
    "mountain": "Mountain",
    "jungle": "Jungle",
    "sand": "Sands",
    "sands": "Sands",
    "wetland": "Wetland",
    "jungle-wetland": "Jungle or Wetland",
    "wetland-jungle": "Jungle or Wetland",
    "jungle-sand": "Jungle or Sands",
    "sand-jungle": "Jungle or Sands",
    "jungle-sands": "Jungle or Sands",
    "sands-jungle": "Jungle or Sands",
    "sand-wetland": "Sands or Wetland",
    "wetland-sand": "Sands or Wetland",
    "sands-wetland": "Sands or Wetland",
    "wetland-sands": "Sands or Wetland",
    "mountain-jungle": "Mountain or Jungle",
    "jungle-mountain": "Mountain or Jungle",
    "mountain-wetland": "Mountain or Wetland",
    "wetland-mountain": "Mountain or Wetland",
    "mountain-sand": "Mountain or Sands",
    "sand-mountain": "Mountain or Sands",
    "mountain-sands": "Mountain or Sands",
    "sands-mountain": "Mountain or Sands",
    "inland": "Inland",
    "coastal": "Coastal",
    "invaders": "Invaders",
  },
  de: {
    inland: "inland",
    coastal: "coastal",
    invaders: "invaders",
  },
  pl: {
    inland: "wewnętrzna",
    coastal: "nadbrzeżna",
    invaders: "najeźdźcy",
  },
};

let numLocalize = {
  en: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  },
  de: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  },
  pl: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  },
  ar: {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  },
  zh: {
    0: "零",
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
  },
};
const elementNames = new Set(["sun", "moon", "fire", "air", "plant", "water", "earth", "animal"]);
const terrainSingle = new Set(["wetland", "wetlands", "mountain", "sand", "sands", "jungle"]);
const terrainDouble = new Set([
  "ocean",
  "jungle-wetland",
  "wetland-jungle",
  "jungle-sand",
  "sand-jungle",
  "jungle-sands",
  "sands-jungle",
  "sand-wetland",
  "wetland-sand",
  "sands-wetland",
  "wetland-sands",
  "mountain-jungle",
  "jungle-mountain",
  "mountain-wetland",
  "wetland-mountain",
  "mountain-sand",
  "sand-mountain",
  "mountain-sands",
  "sands-mountain",
]);
const terrainTypes = new Set(["coastal", "inland"]);
const terrains = new Set([...terrainSingle, ...terrainDouble, ...terrainTypes]);
// let tokenNames = {
//   en: {
//     beast: "beasts",
//     beasts: "beasts",
//     disease: "disease",
//     wilds: "wilds",
//     badland: "badlands",
//     badlands: "badlands",
//     strife: "strife",
//     vitality: "vitality",
//   },
//   de: {
//     beast: "beasts",
//     beasts: "beasts",
//     disease: "disease",
//     wilds: "wilds",
//     badland: "badlands",
//     badlands: "badlands",
//     strife: "strife",
//     vitality: "vitality",
//   },
//   pl: {
//     beast: "bestie",
//     beasts: "bestie",
//     disease: "choroba",
//     wilds: "dzicz",
//     badland: "pustkowia",
//     badlands: "pustkowia",
//     strife: "niezgoda",
//     vitality: "witalność",
//   },
// };

function getPresenceNodeHtml(
  nodeText,
  first,
  nodeIndex,
  trackType,
  addEnergyRing,
  forceEnergyRing = false,
  forceShadow = false,
  forceNone = false
) {
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

  // Setup values
  let addIconShadow = false;

  if (pnDebug) {
    console.log(
      "--Presence Node-- Text:" +
        nodeText +
        ", First?:" +
        first +
        ", nodeIndex:" +
        nodeIndex +
        ", trackType: " +
        trackType
    );
  }

  // Handle Splitpath nodes
  if (nodeText.includes("/")) {
    let splitNodes = nodeText.split("/");
    let splitSubtext = "";
    for (let i = 0; i < splitNodes.length; i++) {
      let splitNodeHTML = getPresenceNodeHtml(
        splitNodes[i],
        first,
        nodeIndex + "-" + i,
        trackType,
        addEnergyRing,
        forceEnergyRing,
        forceShadow,
        forceNone
      );
      let holder = document.createElement("holder");
      holder.innerHTML = splitNodeHTML;
      let subtext = holder.getElementsByTagName("subtext")[0];
      if (i === 0) {
        splitSubtext += subtext.innerHTML;
        subtext.remove();
        inner += holder.innerHTML;
      } else {
        subtext.innerHTML = splitSubtext + "/" + subtext.innerHTML;
        inner += holder.innerHTML;
        holder.remove();
      }
    }
    inner = `<split-presence-node>${inner}</split-presence-node>`;
    return inner;
  }

  //Handle ^ (node notation)
  let addDeepLayers = false;
  let iconDeepLayers;
  if (nodeText.split("^")[1]) {
    iconDeepLayers = nodeText.split("^")[1].split("_")[0].split("*")[0];
    addDeepLayers = true;
    if (pnDebug) {
      console.log("Adding Icon: " + iconDeepLayers);
    }
  }

  // Handle _ (force node backgroundss)
  let optionsNodeBack;
  if (nodeText.split("_")[1]) {
    optionsNodeBack = nodeText.split("_")[1].split("^")[0].split("*")[0];
    if (optionsNodeBack.includes("energy")) {
      forceEnergyRing = true;
    }
    if (optionsNodeBack.includes("shadow")) {
      forceShadow = true;
    }
    if (optionsNodeBack.includes("none")) {
      forceNone = true;
    }
    if (optionsNodeBack.includes("nofirst")) {
      first = false;
    } else if (optionsNodeBack.includes("first")) {
      first = true;
    }
  }
  let overrideText = "";
  if (nodeText.split("*")[1]) {
    overrideText = nodeText.split("*")[1].split("^")[0].split("_")[0];
  }

  nodeText = nodeText.split("_")[0].split("^")[0].split("*")[0];

  // Setup node class
  if (trackType === "energy") {
    nodeClass = "energy";
    subText = `${Energy[lang]}/${Turn[lang]}`;
  } else if (trackType === "card") {
    nodeClass = "card";
    subText = `${CardPlays[lang]}`;
  } else if (trackType === "special") {
    nodeClass = "special-ring";
    subText = "";
    addEnergyRing = false;
  }

  // Assess node
  if (!isNaN(nodeText)) {
    //The value is only a number
    addEnergyRing = false;
    if (first === true && trackType !== "special") {
      presenceNode.classList.add("first");
    } else {
      subText = nodeText;
      if (pnDebug) {
        console.log("setting nodetext:" + subText);
      }
      if (isNaN(nodeText[0])) {
        subText += ` ${Energy[lang]}`;
        nodeClass = "energy";
      } else {
        subText = numLocalize[lang][nodeText] || nodeText;
      }
    }
    inner = `<${nodeClass}-icon><value>${
      numLocalize[lang][nodeText] || nodeText
    }</value></${nodeClass}-icon>`;
  } else {
    //It is either a single option or a mix of elements/numbers/other options

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
        splitOptions[findInd] = "bonusenergy(" + splitOptions[findInd + 1] + ")";
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
          let moveIcons = "<div class='push'>";
          if (moveTarget.split(";")[0].toLocaleLowerCase() === "incarna") {
            if (moveTarget.split(";")[1]) {
              moveIcons += `<icon class="incarna ${moveTarget.split(";")[1]}"></icon>`;
            } else {
              moveIcons += "{incarna}";
            }
          } else {
            for (let i = 0; i < moveTarget.split(";").length; i++) {
              moveIcons += "{" + moveTarget.split(";")[i] + "}";
              if (i < moveTarget.split(";").length - 1) {
                moveIcons += "{backslash}";
              }
            }
          }
          moveIcons += "</div>";
          inner = "<icon class='push'>" + moveIcons + "</icon>";
          subText = IconName("track-" + splitOptions[0]);
          break;
        }
        case "gather": {
          const matches = regExp.exec(splitOptions[0]);
          const moveTarget = matches[1];
          inner = "<icon class='gather'><icon class='" + moveTarget + "'></icon></icon>";
          subText = IconName("track-" + splitOptions[0]);
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
          subText = `+${num} ${Energy[lang]}`;
          addEnergyRing = true;
          addIconShadow = false;
          break;
        }
        case "plays": {
          const matches = regExp.exec(splitOptions[0]);
          const num = matches[1];
          inner = "<card-icon><value>" + num + "</value></card-icon>";
          subText = IconName(splitOptions[0]);
          addEnergyRing = false;
          addIconShadow = false;
          break;
        }
        case "incarna": {
          const matches = regExp.exec(splitOptions[0]);
          const incarnaOptions = matches[1].split(";");
          const incarnaAction = incarnaOptions[0];
          const customIncarnaIcon = incarnaOptions[1];
          let addMoveHelper;
          switch (incarnaAction) {
            case "empower":
              inner = "{empower-incarna}";
              break;
            case "addmove":
            case "add-move":
              addMoveHelper = incarnaOptions[2] ? incarnaOptions[2] : "presence";
              inner =
                '<custom-icon><add-move-upper>+{backslash}{move-arrow}</add-move-upper><add-move-lower><icon class="incarna add-move ' +
                customIncarnaIcon +
                '"></icon><icon class="' +
                addMoveHelper +
                ' with-your"></icon></add-move-lower></custom-icon>';
              break;
            default:
              inner = "{empower-incarna}";
          }
          subText = IconName(splitOptions[0]);
          break;
        }
        case "token": {
          const matches = regExp.exec(splitOptions[0]);
          const tokenAdd = matches[1];
          inner =
            "<icon class='your-land'>{misc-plus}<icon class='" + tokenAdd + "'></icon></icon>";
          subText = IconName(`add-token(${tokenAdd})`);
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
              for (let i = 1; i < custom_node.length; i++) {
                inner += "<icon class='" + custom_node[i] + " custom-presence-track-icon'></icon>";
              }
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
          let moveRange = 1;
          inner =
            "<track-move-presence>{presence}<move-value>" +
            moveRange +
            "</move-value>{move-arrow}</track-move-presence>";
          if (matches[1]) {
            moveRange = matches[1];
            if (isNaN(moveRange)) {
              inner =
                "<track-move-presence>{presence}<move-text>" +
                moveRange +
                "</move-text>{move-arrow}</track-move-presence>";
            } else {
              inner =
                "<track-move-presence>{presence}<move-value>" +
                moveRange +
                "</move-value>{move-arrow}</track-move-presence>";
            }
            addIconShadow = true;
            if (addEnergyRing) {
              addIconShadow = false;
            }
          }
          subText = IconName(splitOptions[0]);
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
            elementText = IconName(splitOptions[0]);
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
          const cardplay_text = splitOptions[0];
          inner = "<icon class='" + cardplay_text + "'></icon>";
          subText = IconName(option);
          addEnergyRing = false;
          break;
        }
        case "damage": {
          const matches = regExp.exec(splitOptions[0]);
          let damageOptions = matches[1].split(";");
          if (damageOptions[1]) {
            // damage at range
            let range = damageOptions[0];
            let damage = damageOptions[1];
            inner = `<damage><track-damage><value>${damage}</value></track-damage><range class="small">${range}</range></damage>`;
          } else {
            // damage in one of your lands
            let damage = damageOptions[0];
            inner = `<track-damage><value>${damage}</value></track-damage>`;
          }
          subText = IconName(splitOptions[0]);
          addIconShadow = true;
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
        case "gain-power-card": {
          const iconText = splitOptions[0];
          const matches = regExp.exec(splitOptions[0]);
          if (matches) {
            inner =
              "<icon class='gain-power-card-blank'><icon class='" + matches[1] + "'></icon></icon>";
          } else {
            inner = "{" + iconText + "}";
          }
          subText = IconName(iconText);
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
          let num = splitOptions[i];
          num = numLocalize[lang][num] || num;
          trackIcons +=
            "<" +
            nodeClass +
            "-icon class='small'" +
            "><value>" +
            num +
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
          let num = matches[1];
          num = numLocalize[lang][num] || num;
          trackIcons += "<energy-icon class='small'" + "><value>" + num + "</value></energy-icon>";
          addEnergyRing = false;
        } else if (splitOptions[i].startsWith("bonusenergy")) {
          const matches = regExp.exec(splitOptions[i]);
          let num = matches[1];
          num = numLocalize[lang][num] || num;
          trackIcons += "<energy-icon class='small'" + "><value>+" + num + "</value></energy-icon>";
          addEnergyRing = false;
        } else if (splitOptions[i].startsWith("plays")) {
          const matches = regExp.exec(splitOptions[i]);
          let num = matches[1];
          num = numLocalize[lang][num] || num;
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
        trackIcons = `<presence-node-multi ${track_icon_loc}>${trackIcons}</presence-node-multi>`;
        inner += trackIcons;
      }
    }
  }

  if (!forceNone) {
    if (addEnergyRing || forceEnergyRing) {
      inner = "<energy-icon>" + inner + "</energy-icon>";
    }
    if (addIconShadow || forceShadow) {
      inner = "<icon-shadow>" + inner + "</icon-shadow>";
    }
  }
  ring.innerHTML = inner;
  if (addDeepLayers) {
    let valueText = "";
    if (iconDeepLayers.startsWith("energy")) {
      const matches = regExp.exec(iconDeepLayers);
      const valueNum = matches[1];
      valueText = "<value>" + valueNum + "</value>";
      iconDeepLayers = "energy-blank";
    }
    if (iconDeepLayers.startsWith("pay")) {
      const matches = regExp.exec(iconDeepLayers);
      const valueNum = Math.abs(matches[1]);
      valueText = `<value>${-valueNum}</value>`;
      iconDeepLayers = "energy-blank";
      let localize = {
        en: `You may pay ${valueNum} Energy to ${subText}`,
        de: ``,
        pl: ``,
        ar: ``,
        zh: ``,
      };
      subText = localize[lang];
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
  if (overrideText) {
    subText = overrideText;
  }
  presenceNode.innerHTML += "<subtext>" + subText + "</subtext>";
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
  const additionalTracks = presenceTable.getElementsByClassName("additional-track");
  for (let i = 0; i < additionalTracks.length; i++) {
    const additionalNodes = additionalTracks[i].getElementsByTagName("presence-node");
    for (let j = 0; j < additionalNodes.length; j++) {
      additionalNodes[j].id = "addtrack" + i + "node" + j;
    }
  }
}

function IconName(str, iconNum = 1) {
  const regExp = /\(([^)]+)\)/;
  let num = "";
  let txt = "";
  let opt3 = "";
  let opt4 = "";
  let options;
  let localize;
  let debug = false;

  // identify if 'str' contains options
  const matches = regExp.exec(str);
  if (matches) {
    options = matches[1];
    if (options.includes(";")) {
      options = matches[1].split(";");
    } else {
      options = matches[1].split(",");
    }
    num = options[0];
    if (!isNaN(num)) {
      num = numLocalize[lang][num] || num;
    }
    txt = options[1] || "";
    opt3 = options[2] || "";
    opt4 = options[3] || "";
  }

  // Remove the options, if present
  str = str.split("(")[0];

  // if its a number, but it starts with +/-
  if (!isNaN(str) && isNaN(str[0])) {
    num = str[1];
    str = "increase-energy";
  }
  let plural = iconNum > 1 ? "s" : "";
  let subText;

  // handle icon name pre-fixes
  if (str.startsWith("incarna-")) {
    str = str.replace("incarna-", "");
    console.log("removing incarna from icon name");
  }
  // if (str.startsWith("custom")) {
  //   str = getCustomIconName(str);
  // }

  if (debug) {
    console.log("IconName. Input: " + str);
    if (options) {
      console.log("Options: " + options);
    }
    if (iconNum > 1) {
      console.log("iconNum =" + iconNum);
    }
  }

  switch (str) {
    case "presence":
      localize = {
        en: "Your Presence",
        de: "Deine Präsenz",
        pl: "twoją Obecnością",
        ar: "",
        zh: "你的靈跡",
      };
      subText = localize[lang];
      break;
    case "incarna":
      if (num) {
        switch (num) {
          case "empower":
            localize = {
              en: "Empower Incarna",
              de: "Incarna verstärken",
              pl: "Wzmocnij Inkarna",
              ar: ``,
              zh: ``,
            };
            break;
          case "addmove":
          case "add-move":
            localize = {
              en: txt
                ? `Add/Move Incarna to Land with ${IconName(txt)}`
                : `Add/Move Incarna to Land with ${IconName("presence")}`,
              de: ``,
              pl: txt
                ? `Dodaj/Przenieś Inkarna do Krainy z ${IconName(txt)}`
                : `Dodaj/Przenieś Inkarna do Krainy z ${IconName("presence")}`,
              ar: ``,
              zh: ``,
            };
            break;
          case "replace":
            localize = {
              en: `You may Replace ${IconName(txt)} with your Incarna`,
              de: ``,
              pl: `Możesz Zamienić ${IconName(txt)} na twoje Inkarna`,
              ar: ``,
              zh: ``,
            };
            break;
          case "move":
            localize = {
              en: "Move Incarna",
              de: "",
              pl: "Przesuń Inkarna",
              ar: ``,
              zh: ``,
            };
            break;
          case "add-token":
            localize = {
              en: `Add a ${IconName(txt)} at your Incarna`,
              de: "",
              pl: `Dodaj ${IconName(txt)} na twoje Inkarna`,
              ar: ``,
              zh: ``,
            };
            break;
          default:
            localize = {
              en: "Empower Incarna",
              de: "Incarna verstärken",
              pl: "Wzmocnij Inkarna",
              ar: ``,
              zh: ``,
            };
        }
      } else {
        localize = {
          en: "Your Incarna",
          de: "Dein Incarna",
          pl: "Twoje Inkarna",
          ar: "",
          zh: "你的化身",
        };
      }
      subText = localize[lang];
      break;
    case "energy":
      subText = `${num} ${Energy[lang]}`;
      break;
    case "bonusenergy":
      subText = `+${num} ${Energy[lang]}`;
      break;
    case "plays":
      subText = `${num} ${num > 1 ? CardPlays[lang] : CardPlay[lang]}`;
      break;
    case "add-presence":
      if (num === "any" && options.length === 1) {
        localize = {
          en: `Add a Presence to any Land`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
        subText = localize[lang];
      } else if (options.length > 1) {
        if (txt === "text") {
          // User wants a custom text presence addition
          localize = {
            en: `Add a Presence ${opt3}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
          subText = localize[lang];
        } else if (txt === "token") {
          // User wants to add a token in growth
          switch (opt4) {
            case "and":
              //add presence and token
              localize = {
                en: `Add a Presence and a ${IconName(opt3)}`,
                de: ``,
                pl: ``,
                ar: ``,
                zh: ``,
              };
              break;
            case "or":
              //add presence or token
              localize = {
                en: `Add a Presence or a ${IconName(opt3)}`,
                de: ``,
                pl: ``,
                ar: ``,
                zh: ``,
              };
              break;
            case "instead":
              // no option to add presence, just token
              break;
          }
          subText = localize[lang];
        } else {
          // User wants an OR or an AND requirement
          let operator = "";
          if (options.length > 4) {
            operator = "/";
          } else {
            if (options.at(-1) === "and") {
              localize = {
                en: `and `,
                de: ``,
                pl: ``,
                ar: ``,
                zh: ``,
              };
            } else {
              localize = {
                en: `or `,
                de: ``,
                pl: ``,
                ar: ``,
                zh: ``,
              };
            }
            operator = ` ${localize[lang]}`;
          }
          localize = {
            en: num === "any" ? `Add a Presence to any ` : `Add a Presence to `,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
          subText = localize[lang];

          let landwith = 1; // This flag is used to figure out if 'land with' has been said already. It comes up with add-presence(3,jungle,beasts,or)
          for (let i = 1; i < options.length; i++) {
            // Check to see if we've reached an 'or' or 'and', which shouldn't be parsed
            const req = options[i];
            if (req.toLowerCase() === "or" || req.toLowerCase() === "and") {
              break;
            } else if (i > 1) {
              subText += operator;
            }

            if (req.startsWith("no-")) {
              localize = {
                en: landwith
                  ? `Land without ${IconName(req.substring(3))} `
                  : `no ${IconName(req.substring(3))} `,
                de: ``,
                pl: ``,
                ar: ``,
                zh: ``,
              };
              subText += localize[lang];
              landwith = 0;
            } else if (terrains.has(req)) {
              subText += `${IconName(req)} `;
            } else {
              localize = {
                en: landwith ? `Land with ${IconName(req)}` : `${IconName(req)}`,
                de: ``,
                pl: ``,
                ar: ``,
                zh: ``,
              };
              subText += localize[lang];
              landwith = 0;
            }
          }
        }
      } else {
        localize = {
          en: `Add a Presence`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
        subText = localize[lang];
      }
      break;
    case "gain-element":
      // Growth
      if (txt && !isNaN(txt)) {
        localize = {
          en: `Gain ${IconName(num, txt)}`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
      } else if (options.at(-1).toLowerCase() === "and") {
        localize = {
          en: `Gain ${ListLocalize(options.slice(0, -1))}`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
      } else {
        localize = {
          en: `Gain ${ListLocalize(options, "or")}`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "elements":
      localize = {
        en: "OR",
        de: "ODER",
        pl: "ALBO",
        ar: "",
        zh: "或",
      };
      subText = `${IconName(num)} ${localize[lang]} ${IconName(txt)}`;
      break;
    case "gain-power-card":
      if (txt) {
        localize = {
          en: `Gain ${IconName(num)} Power Card ${txt}`,
          de: "Fähigkeitenkare erhalten",
          pl: "Pozyskaj Kartę Mocy",
          ar: "",
          zh: "獲得法術牌",
        };
      } else if (num) {
        localize = {
          en: `Gain ${IconName(num)} Power Card`,
          de: "Fähigkeitenkare erhalten",
          pl: "Pozyskaj Kartę Mocy",
          ar: "",
          zh: "獲得法術牌",
        };
      } else {
        localize = {
          en: "Gain Power Card",
          de: "Fähigkeitenkare erhalten",
          pl: "Pozyskaj Kartę Mocy",
          ar: "",
          zh: "獲得法術牌",
        };
      }
      subText = localize[lang];
      break;
    case "take-power-card":
      if (txt) {
        localize = {
          en: `Take ${IconName(num)} Power Card ${txt}`,
          de: "Fähigkeitenkarte nehmen",
          pl: "Weź Kartę Mocy",
          ar: "",
          zh: "拿取法術牌",
        };
      } else if (num) {
        localize = {
          en: `Take ${IconName(num)} Power Card`,
          de: "Fähigkeitenkarte nehmen",
          pl: "Weź Kartę Mocy",
          ar: "",
          zh: "拿取法術牌",
        };
      } else {
        localize = {
          en: "Take Power Card",
          de: "Fähigkeitenkarte nehmen",
          pl: "Weź Kartę Mocy",
          ar: "",
          zh: "拿取法術牌",
        };
      }
      subText = localize[lang];
      break;
    case "gain-energy":
      // gain-energy(2,  1  ,days-never-were,custom text & chosen icon)
      // gain-energy(num,txt,opt3           ,opt4)
      if (opt4) {
        // custom text
        if (num === 0 || num === "0") {
          // custom text, no flat energy
          localize = {
            en: `Gain ${txt} Energy per ${opt4}`,
            de: ``,
            pl: `+${txt} Energii za każde ${opt4}`,
            ar: ``,
            zh: ``,
          };
        } else {
          // custom text, with flat energy
          localize = {
            en: `Gain ${num} Energy and +${txt} more per ${opt4}`,
            de: ``,
            pl: `+${num} Energii. +${txt} za każde ${opt4}`,
            ar: ``,
            zh: ``,
          };
        }
      } else if (opt3) {
        if (num === 0 || num === "0") {
          // scaling, no flat energy
          localize = {
            en: elementNames.has(opt3)
              ? `Gain ${txt} Energy per ${IconName(opt3)} Showing`
              : `Gain ${txt} Energy per ${IconName(opt3)}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        } else {
          // scaling w/ flat energy
          localize = {
            en: elementNames.has(opt3)
              ? `Gain ${num} Energy and +${txt} more per ${IconName(opt3)} Showing`
              : `Gain ${num} Energy and +${txt} more per ${IconName(opt3)}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        }
      } else {
        // flat energy
        localize = {
          en: `Gain Energy`,
          de: ``,
          pl: `Zbierz Energię`,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "gain-card-play":
      subText = `+1 ${CardPlay[lang]}/${Turn[lang]}`;
      break;
    case "growth-gain-card-play":
      num = num || 1;
      localize = {
        en: num > 1 ? ` +${num} Card Plays this turn` : ` +${num} Card Play this turn`,
        de: num > 1 ? "Karte ausspielen" : "Karte ausspielen",
        pl: num > 1 ? "Zagrane Karty" : "Zagraj jedną",
        ar: ``,
        zh: ``,
      };
      subText = localize[lang];
      break;
    case "reclaim-all":
    case "reclaim":
      if (txt) {
        localize = {
          en: "Reclaim All Cards with " + IconName(txt),
          de: "",
          pl: "Odzyskaj wszystkie Karty z " + IconName(txt),
          ar: "",
          zh: "",
        };
      } else {
        localize = {
          en: "Reclaim Cards",
          de: "Alle Karten wiedererlangen",
          pl: "Odzyskaj Karty",
          ar: "",
          zh: "回收法術牌",
        };
      }
      subText = localize[lang];
      break;
    case "reclaim-one":
      if (txt) {
        localize = {
          en: "Reclaim One Card with " + IconName(txt),
          de: "",
          pl: "Odzyskaj Jedną Kartę z " + IconName(txt),
          ar: "",
          zh: "",
        };
      } else {
        localize = {
          en: "Reclaim One",
          de: "1 Karte wiedererlangen",
          pl: "Odzyskaj Jedną",
          ar: "",
          zh: "回收1張法術牌",
        };
      }
      subText = localize[lang];
      break;
    case "reclaim-half":
      localize = {
        en: "Reclaim Half <em>(round up)</em>",
        de: "Hälfte der Karten wiedererlangen",
        pl: "Odzyskaj połowę <em>(zaokrąglając w górę)</em>",
        ar: "",
        zh: "回收一半法術牌",
      };
      subText = localize[lang];
      break;
    case "forget-power-card":
      localize = {
        en: "Forget Power Card",
        de: "Fähigkeitenkarte vergessen",
        pl: "Zapomnij Kartę Mocy",
        ar: "",
        zh: "遺忘法術牌",
      };
      subText = localize[lang];
      break;
    case "discard":
      if (num) {
        localize = {
          en: "Discard a Power Card with " + IconName(num),
          de: "",
          pl: "Odrzuć 1 Kartę Mocy z " + IconName(num),
          ar: "",
          zh: "",
        };
      } else {
        localize = {
          en: "Discard a Card",
          de: "1 Fähigkeitenkarte abwerfen",
          pl: "Odrzuć 1 Kartę Mocy",
          ar: "",
          zh: "棄置1張法術牌",
        };
      }
      subText = localize[lang];
      break;
    case "destroy-presence":
      num = num ? num : 1;
      localize = {
        en: `Destroy ${num} of your Presence`,
        de: "Zerstöre 1 deiner Präsenzen",
        pl: "Zniszcz 1 ze swoich Obecności",
        ar: "",
        zh: "摧毀1個你的靈跡",
      };
      subText = localize[lang];
      break;
    case "destroyed-presence":
      localize = {
        en: "Destroyed Presence",
        de: "Zerstörte Präsenz",
        pl: "Zniszczona Obecność",
        ar: "",
        zh: "被摧毀的靈跡",
      };
      if (iconNum > 1) {
        localize = {
          en: "up to " + iconNum + " Destroyed Presence",
          de: "bis zu " + iconNum + " zerstörte Präsenz",
          pl: "do " + iconNum + " Zniszczonych Obecności",
          ar: "",
          zh: "至多" + numLocalize[lang][iconNum] || iconNum + " 被摧毀的靈跡",
        };
      }
      subText = localize[lang];
      break;
    case "make-fast":
      localize = {
        en: "One of your Powers may be Fast",
        de: "Eine deiner Fähigkeiten darf schnell sein",
        pl: "Jedna z twoich Mocy może być Szybka",
        ar: "",
        zh: "可以將你的一個法術改為快速",
      };
      subText = localize[lang];
      break;
    case "gain-card-pay-2":
      localize = {
        en: "Pay 2 Energy to Gain a Power Card",
        de: "Zahle 2 Energie, um 1 Fähigkeitenkarte zu erlangen",
        pl: "Wydaj 2 Energii, by Pozyskać Kartę Mocy",
        ar: "",
        zh: "支付2能來以獲得1張法術牌",
      };
      subText = localize[lang];
      break;
    case "ignore-range":
      localize = {
        en: "You may ignore Range this turn",
        de: "Ignoriere diese Runde Reichweite",
        pl: "W tej turze możesz ignorować Zasięg Mocy",
        ar: "",
        zh: "這回合你可以無視距離上限",
      };
      subText = localize[lang];
      break;
    case "markerplus":
      localize = {
        en: "Prepare " + iconNum + " Element Marker" + plural,
        de: iconNum + " Element-Marker vorbereiten",
        pl:
          iconNum > 1
            ? "Przygotuj " + iconNum + " Znaczników Żywiołów"
            : "Przygotuj 1 Znacznik Żywiołów",
        ar: "",
        zh: "",
      };
      subText = localize[lang];
      break;
    case "markerminus":
      localize = {
        en: "Discard " + iconNum + " Element Marker" + plural,
        de: iconNum + " Element-Marker ablegen",
        pl:
          iconNum > 1 ? "Odrzuć " + iconNum + " Znaczników Żywiołów" : "Odrzuć 1 Znacznik Żywiołów",
        ar: "",
        zh: "",
      };
      subText = localize[lang];
      break;
    case "isolate":
      if (num) {
        localize = {
          en: "Isolate a Land",
          de: "",
          pl: "Izoluj Krainę",
          ar: "",
          zh: "",
        };
      } else {
        localize = {
          en: "Isolate " + iconNum + " of your Lands",
          de: iconNum + " deiner Gebiete isolieren",
          pl: iconNum > 1 ? "Izoluj " + iconNum + " twoje krainy" : "Izoluj 1 twoją krainę",
          ar: "",
          zh: "阻隔 " + numLocalize[lang][iconNum] || iconNum + " 你的區域",
        };
      }
      subText = localize[lang];
      break;
    case "reclaim-none":
      localize = {
        en: "Reclaim None",
        de: "Nichts wiedererlangen",
        pl: "Nie Odzyskuj Karty",
        ar: "",
        zh: "不回收法術牌",
      };
      subText = localize[lang];
      break;
    case "increase-energy":
      localize = {
        en: "+" + num + " Energy",
        de: "+" + num + " Energie",
        pl: "+" + num + " Energii",
        ar: "",
        zh: "",
      };
      subText = localize[lang];
      break;
    case "move-presence":
      if (txt) {
        if (isNaN(txt)) {
          // Move a presence and a token together
          localize = {
            en: `Move a Presence and ${IconName(txt)} together`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        } else {
          // Move x presence
          localize = {
            en: "Move up to " + txt + " Presence together",
            de: ``,
            pl: "Przesuń do " + txt + " Obecności jednocześnie",
            ar: ``,
            zh: ``,
          };
        }
      } else if (num) {
        if (isNaN(num)) {
          // its text
          localize = {
            en: "Move a Presence to " + IconName(num) + " land",
            de: ``,
            pl: "Przesuń Obecność do " + IconName(num),
            ar: ``,
            zh: ``,
          };
        } else {
          // its a number
          localize = {
            en: "Move a Presence " + num,
            de: "Präsenz " + num + " bewegen",
            pl: "Przenieś Obecność " + num,
            ar: ``,
            zh: ``,
          };
        }
      } else {
        // its just move-presence text
        localize = {
          en: "Move a Presence",
          de: "Präsenz " + num + " bewegen",
          pl: "Przesuń Obecność",
          ar: "",
          zh: "",
        };
      }
      subText = localize[lang];
      break;
    case "damage":
      if (txt) {
        localize = {
          en: `${num} Damage at Range ${txt}`,
          de: `${num} Schaden mit ${txt} Reichweite`,
          pl: `${num} Obrażeń w Zasięgu ${txt}`,
          ar: "",
          zh: "",
        };
      } else {
        localize = {
          en: `${num} Damage in one of your Lands`,
          de: "1 Schaden in 1 deiner Gebiete",
          pl: "1 Obrażenie w jednej z twoich Krain",
          ar: "",
          zh: "在你的1個區域造成1點傷害",
        };
      }
      subText = localize[lang];
      break;
    case "custom":
      subText = num;
      break;
    case "gain-range":
      localize = {
        en: `+${num} Range`,
        de: `+${num} Reichweite`,
        pl: `+${num} Zasięgu`,
        ar: ``,
        zh: ``,
      };
      subText = localize[lang];
      if (txt) {
        localize = {
          en: ` on ${txt}`,
          de: ` kein ${txt}`,
          pl: ` na ${txt}`,
          ar: ``,
          zh: ``,
        };
        subText += localize[lang];
      }
      break;
    case "growth-gain-range":
      if (txt) {
        switch (txt) {
          case "powers":
          case "power":
            localize = {
              en: `Your Powers gain +${num} Range this turn`,
              de: ``,
              pl: ``,
              ar: ``,
              zh: ``,
            };
            break;
          case "power cards":
            localize = {
              en: `Your Power Cards gain +${num} Range this turn`,
              de: ``,
              pl: ``,
              ar: ``,
              zh: ``,
            };
            break;
          case "everything":
            localize = {
              en: `+${num} Range on everything this turn`,
              de: ``,
              pl: ``,
              ar: ``,
              zh: ``,
            };
            break;
          case "innate":
          case "innate power":
          case "innate powers":
            localize = {
              en: `Your Innate Powers gain +${num} Range this turn`,
              de: ``,
              pl: ``,
              ar: ``,
              zh: ``,
            };
            break;
          default:
            localize = {
              en: `+${num} Range on ${txt} this turn`,
              de: ``,
              pl: ``,
              ar: ``,
              zh: ``,
            };
        }
      } else {
        localize = {
          en: `Your Powers gain +${num} Range this turn`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "add-token":
      //add-token(range#/token,and/or,token,num/[othertokens])
      if (isNaN(num)) {
        // its a presence track token
        localize = {
          en: `Add 1 ${IconName(num)} to 1 of your Lands`,
          de: "",
          pl: `Dodaj 1 ${IconName(num)} do jednej z twoich Krain`,
          ar: ``,
          zh: ``,
        };
      } else {
        // its a growth token
        if (opt4 && isNaN(opt4)) {
          //multiple tokens of different types
          localize = {
            en: `Add a ${ListLocalize(options.slice(2), txt)} ${txt === "and" ? "together" : ""}`,
            de: ``,
            pl: `Dodaj ${ListLocalize(options.slice(2), txt)} ${txt === "i" ? "jednocześnie" : ""}`,
            ar: ``,
            zh: ``,
          };
        } else if (opt4) {
          //multiple tokens of the same type
          localize = {
            en: `Add ${IconName(opt3, opt4)} together`,
            de: ``,
            pl: `Dodaj ${IconName(opt3, opt4)} jednocześnie`,
            ar: ``,
            zh: ``,
          };
        } else {
          // one token
          localize = {
            en: `Add a ${IconName(opt3)}`,
            de: ``,
            pl: `Dodaj ${IconName(opt3)}`,
            ar: ``,
            zh: ``,
          };
        }
      }
      subText = localize[lang];
      break;
    case "replace":
      if (num > 0) {
        localize = {
          en: `You may Replace ${IconName(txt)} with ${IconName(opt3)}`,
          de: ``,
          pl: `Możesz Zamienić ${IconName(txt)} na ${IconName(opt3)}`,
          ar: ``,
          zh: ``,
        };
      } else {
        localize = {
          en: `You may Replace 1 ${IconName(txt)} in your Lands with ${IconName(opt3)}`,
          de: ``,
          pl: `Możesz Zamienić 1 ${IconName(txt)} w jednej z Twoich krain z ${IconName(opt3)}`,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "push":
      if (txt && !isNaN(txt)) {
        // second option is a number - P/G at range
        localize = {
          en: `Push up to 1 ${IconName(num)} from a Land`,
          de: ``,
          pl: `Wypchnij do 1 ${IconName(num)} z krainy`,
          ar: ``,
          zh: ``,
        };
      } else if (opt3 && !isNaN(opt3)) {
        // third option is a number - Conditional P/G at multiple sites
        localize = {
          en: `Push ${IconName(opt3)} ${IconName(num)} from ${IconName(txt)}`,
          de: ``,
          pl: `Wypchnij ${IconName(opt3)} ${IconName(num)} z ${IconName(txt)}`,
          ar: ``,
          zh: ``,
        };
      } else if (opt3) {
        // third option is text - Conditional P/G at TEXT
        localize = {
          en: `Push 1 ${IconName(num)} from ${IconName(opt3)} ${IconName(txt)}`,
          de: ``,
          pl: `Wypchnij ${IconName(opt3)} ${IconName(num)} z ${IconName(txt)}`,
          ar: ``,
          zh: ``,
        };
      } else if (txt) {
        // only two options, the second is text - P/G
        localize = {
          en: landtypeNames[lang][txt]
            ? `Push 1 ${IconName(num)} from ${IconName(txt)}`
            : `Push 1 ${IconName(num)} from 1 of your Lands with ${IconName(txt)}`,
          de: ``,
          pl: landtypeNames[lang][txt]
            ? `Wypchnij 1 ${IconName(num)} z ${IconName(txt)}`
            : `Wypchnij 1 ${IconName(num)} z twojej krainy z ${IconName(txt)}`,
          ar: ``,
          zh: ``,
        };
      } else {
        // only one option
        localize = {
          en: `Push 1 ${IconName(num)} from 1 of your Lands`,
          de: ``,
          pl: `Wypchnij 1 ${IconName(num)} z twojej krainy`,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "track-push":
      if (num === "incarna") {
        localize = {
          en: `Push ${IconName(num)}`,
          de: ``,
          pl: `Wypchnij ${IconName(num)}`,
          ar: ``,
          zh: ``,
        };
      } else {
        subText = IconName(num);
        for (let i = 1; i < options.length; i++) {
          subText += "/" + IconName(options[i]);
        }
        localize = {
          en: `Push 1 ${subText} from 1 of your Lands`,
          de: ``,
          pl: `Wypchnij ${IconName(num)} z twojej krainy`,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "gather":
      if (txt && !isNaN(txt)) {
        // second option is a number - P/G at range
        localize = {
          en: `Gather up to 1 ${IconName(num)} into a Land`,
          de: ``,
          pl: `Zgromadź do 1 ${IconName(num)} w krainie`,
          ar: ``,
          zh: ``,
        };
      } else if (opt3 && !isNaN(opt3)) {
        // third option is a number - Conditional P/G at multiple sites
        localize = {
          en: `Gather ${IconName(opt3)} ${IconName(num)} into ${IconName(txt)}`,
          de: ``,
          pl: `Zgromadź ${IconName(opt3)} ${IconName(num)} w ${IconName(txt)}`,
          ar: ``,
          zh: ``,
        };
      } else if (opt3) {
        // third option is text - Conditional P/G at TEXT
        localize = {
          en: `Gather 1 ${IconName(num)} into ${IconName(opt3)} ${IconName(txt)}`,
          de: ``,
          pl: `Zgromadź 1 ${IconName(num)} w ${IconName(opt3)} ${IconName(txt)}`,
          ar: ``,
          zh: ``,
        };
      } else if (txt) {
        // only two options, the second is text - P/G
        localize = {
          en: landtypeNames[lang][txt]
            ? `Gather 1 ${IconName(num)} into ${IconName(txt)}`
            : `Gather 1 ${IconName(num)} into 1 of your Lands with ${IconName(txt)}`,
          de: ``,
          pl: landtypeNames[lang][txt]
            ? `Zgromadź 1 ${IconName(num)} w ${IconName(txt)}`
            : `Zgromadź 1 ${IconName(num)} w twojej krainie z ${IconName(txt)}`,
          ar: ``,
          zh: ``,
        };
      } else {
        // only one option
        localize = {
          en: `Gather 1 ${IconName(num)} into 1 of your Lands`,
          de: ``,
          pl: `Zgromaź 1 ${IconName(num)} w twojej krainie`,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "track-gather":
      if (num === "incarna") {
        localize = {
          en: `Gather ${IconName(num)}`,
          de: ``,
          pl: `Zgromadź ${IconName(num)}`,
          ar: ``,
          zh: ``,
        };
      } else {
        subText = IconName(num);
        for (let i = 1; i < options.length; i++) {
          subText += "/" + IconName(options[i]);
        }
        localize = {
          en: `Gather 1 ${subText} into 1 of your Lands`,
          de: ``,
          pl: `Zgromadź 1 ${subText} w twojej krainie`,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "growth-fear":
      // fear(2,  1  ,days-never-were,custom text & chosen icon)
      // fear(num,txt,opt3           ,opt4)
      if (opt4) {
        // custom text
        if (num === 0 || num === "0") {
          // custom text, no flat energy
          localize = {
            en: `Generate ${txt} Fear per ${opt4}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        } else {
          // custom text, with flat energy
          localize = {
            en: `Generate ${num} Fear and +${txt} more per ${opt4}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        }
      } else if (opt3) {
        if (num === 0 || num === "0") {
          // scaling, no flat fear
          localize = {
            en: elementNames.has(opt3)
              ? `Generate ${txt} Fear per ${IconName(opt3)} Showing`
              : `Generate ${txt} Fear per ${IconName(opt3)}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        } else {
          // scaling w/ flat energy
          localize = {
            en: elementNames.has(opt3)
              ? `Generate ${num} Fear and +${txt} more per ${IconName(opt3)} Showing`
              : `Generate ${num} Fear and +${txt} more per ${IconName(opt3)}`,
            de: ``,
            pl: ``,
            ar: ``,
            zh: ``,
          };
        }
      } else {
        // flat energy
        localize = {
          en: `Generate Fear`,
          de: ``,
          pl: ``,
          ar: ``,
          zh: ``,
        };
      }
      subText = localize[lang];
      break;
    case "damage-1":
      localize = {
        en: "1 Damage in one of your Lands",
        de: "1 Schaden in 1 deiner Gebiete",
        pl: "1 Obrażenie w jednej z twoich Krain",
        ar: "",
        zh: "在你的1個區域造成1點傷害",
      };
      subText = localize[lang];
      break;
    case "damage-2":
      localize = {
        en: "2 Damage in one of your Lands",
        de: "1 Schaden in 2 deiner Gebiete",
        pl: "2 Obrażenia w jednej z twoich Krain",
        ar: "",
        zh: "在你的1個區域造成2點傷害",
      };
      subText = localize[lang];
      break;
    case "gain-1-time":
      localize = {
        en: "Gain 1 Time",
        de: "Erhalte 1 Zeit",
        pl: "Zyskaj 1 Jednostkę Czasu",
        ar: "",
        zh: "獲得1時間",
      };
      subText = localize[lang];
      break;
    case "discard-cards":
    case "discard-2-cards":
      localize = {
        en: "Discard 2 Power Cards",
        de: "2 Fähigkeitenkarten abwerfen",
        pl: "Odrzuć 2 Karty Mocy",
        ar: "",
        zh: "棄置2張法術牌",
      };
      subText = localize[lang];
      break;
    case "discard-card":
    case "discard-1-card":
      localize = {
        en: "Discard 1 Power Card",
        de: "1 Fähigkeitenkarte abwerfen",
        pl: "Odrzuć 1 Kartę Mocy",
        ar: "",
        zh: "棄置1張法術牌",
      };
      subText = localize[lang];
      break;
    case "gain-2-time":
      localize = {
        en: "Gain 2 Time",
        de: "Erhalte 2 Zeit",
        pl: "Zyskaj 2 Jednostki Czasu",
        ar: "",
        zh: "獲得2時間",
      };
      subText = localize[lang];
      break;
    case "days-never-were":
      localize = {
        en: "Gain Power Card from Days That Never Were",
        de: "Fähigkeitenkarte von Tage die nie waren erlangen",
        pl: "Pozyskaj Kartę Mocy z Dni, Które Nigdy Nie Nadeszły",
        ar: "",
        zh: "從未現時日牌堆中獲得法術牌",
      };
      subText = localize[lang];
      break;
    // Land types
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
    case "sand-jungle":
    case "sands-jungle":
    case "sand-mountain":
    case "sands-mountain":
    case "mountain-wetland":
    case "mountain-sand":
    case "mountain-sands":
    case "mountain-jungle":
    case "wetland-jugnle":
    case "wetland-mountain":
    case "wetland-sand":
    case "wetland-sands":
    case "ocean":
    case "oceans":
      subText = landtypeNames[lang][str];
      break;
    case "inland":
    case "coastal":
      subText = `${Capitalise(landtypeNames[lang][str])} land`;
      break;
    case "empower-incarna":
      localize = {
        en: "Empower Incarna",
        de: "Incarna verstärken",
        pl: "Wzmocnij Inkarna",
        ar: ``,
        zh: ``,
      };
      subText = localize[lang];
      break;
    // Elements
    case "sun":
    case "moon":
    case "air":
    case "fire":
    case "water":
    case "plant":
    case "earth":
    case "animal":
    case "star":
    case "any":
      str = Capitalise(elNames[lang][str]);
    // eslint-disable-next-line no-fallthrough
    default:
      subText =
        iconNum > 1
          ? (numLocalize[lang][iconNum] || iconNum) + " " + Capitalise(str)
          : Capitalise(str);
      subText = numLocalize[lang][subText] || subText;
  }

  if (debug) {
    console.log("Return: " + subText);
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

function ListLocalize(list, conjuction = "and") {
  let listText = "";
  console.log(list);
  switch (lang) {
    case "en":
      // goal is to construct lists of items in your language:
      // list1, list2 and list3
      // list1 and list2
      // list1, list2 or list3
      if (conjuction === "and" || conjuction === "or") {
        listText += IconName(list[0]);
        for (let i = 1; i < list.length; i++) {
          listText += i === list.length - 1 ? ` ${conjuction} ` : ", ";
          listText += IconName(list[i]);
        }
      }
      break;
  }
  return listText;
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

  let subHeaders = Array.from(board.getElementsByTagName("sub-section-header"));
  subHeaders.forEach((header, i) => {
    subHeaders[i].style.width =
      Math.ceil(
        parseFloat(window.getComputedStyle(header).getPropertyValue("width").replace(/px/, ""))
      ) + "px";
  });

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
  const right = board.getElementsByTagName("right")[0];
  const growthSection = board.getElementsByTagName("growth")[0];
  const innatePowerBox = board.getElementsByTagName("innate-powers")[0];

  //Optional: Starlight type boards
  let starlight = board.getAttribute("starlight") ? true : false;
  const rightRight = document.createElement("right-right");
  if (starlight) {
    rightRight.appendChild(innatePowerBox);
    board.appendChild(rightRight);
    board.classList.add("starlight");
  }

  console.log("RESIZING: Growth");
  // Growth Sizing

  //Custom growth new line breaks
  let growthTable = board.getElementsByTagName("growth-table")[0];
  if (debug) {
    console.log("growth table before resizing");
    console.log(growthTable);
  }
  let growthGroups = growthSection.getElementsByTagName("growth-group");
  let currTable = growthTable;
  let customNewTablesFlag = false;
  for (let j = 1; j < growthGroups.length; j++) {
    let newTableFlag = growthGroups[j].getAttribute("new-row");
    if (newTableFlag) {
      customNewTablesFlag = true;
      let newGrowthTable = document.createElement("growth-table");
      growthSection.appendChild(newGrowthTable);
      let index = Array.prototype.indexOf.call(
        growthGroups[j].parentElement.children,
        growthGroups[j]
      );
      while (currTable.children.length > index) {
        // brings all remaining growth groups over to the next growth table
        newGrowthTable.appendChild(currTable.children[index]);
      }
      // remove the extra growth border
      currTable.children[index - 1].remove();
      currTable = newGrowthTable;
    }
  }

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
  if (!customNewTablesFlag) {
    //Automatical new growth row (deactivated if custom is used)

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

  //Iterate through growth table(s) to resize
  const growthTables = board.getElementsByTagName("growth-table");

  let tightFlag = false; // flag for tightening presence tracks later
  for (let i = 0; i < growthTables.length; i++) {
    growthTable = growthTables[i];
    if (i === 0 && growthTables.length > 1) {
      growthTable.classList.add("two-table-top");
      tightFlag = true;
      console.log("  Flag: will tighten presence tracks");
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

    const growthPanelWidth = right.offsetWidth - 10 - localBorderPixels - growthCostsPixels;
    if (debug) {
      console.log("table" + i + " width for growth actions = " + growthPanelWidth);
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
      console.log("total cell width = " + totalCellWidth);
      console.log("growth panel width = " + growthPanelWidth);
    }
    // if (totalCellWidth > 1000 || i === 0) {

    // if (totalCellWidth > growthPanelWidth || i === 0) {
    if (i < growthTables.length - 1 || i === 0 || starlight) {
      if (debug) {
        console.log("setting widths");
        console.log(growthPanelWidth);
        console.log(totalAdjustedIconWidth);
      }
      for (let j = 0; j < growthCells.length; j++) {
        if (debug) {
          console.log(adjustedGrowthWidths[j]);
        }
        growthCells[j].style.width =
          adjustedGrowthWidths[j] * (growthPanelWidth / totalAdjustedIconWidth) + "px";
      }
    } else {
      growthTable.classList.add("two-table-bottom");
      // growthTable.style.maxWidth = growthCells.length * averageWidth +100 + "px";
      for (let j = 0; j < growthCells.length; j++) {
        let iconWidth = getGrowthActionIconWidth(growthCells[j]);
        let textWidth = growthTexts[j].getBoundingClientRect().width;
        let cellWidth = Math.max(iconWidth, textWidth);
        if (debug) {
          console.log("cellwidth = " + cellWidth);
        }
        growthCells[j].style.width = 1.1 * cellWidth + 20 + "px"; //10 for padding (maybe tweak the 1.15) maybe instead update the width based on text & icons
        if (debug) {
          console.log(adjustedGrowthWidths);
        }
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

    if (i > 0 && !customNewTablesFlag) {
      const growthLines = board.getElementsByTagName("growth-row-line");
      growthLines[i - 1].style.width = totalWidth + "px";
    }
  }

  // Adjust headers and titles
  growthHeadersAndTitles();

  // Handle Tint (corners)
  let growthGroupsTint = board.getElementsByTagName("growth-group");
  if (growthGroupsTint) {
    for (let group of growthGroupsTint) {
      let growthTints = group.getElementsByClassName("tint");
      if (growthTints.length === 1) {
        if (debug) {
          console.log("found solo tint");
        }
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
  innatePowerSizing(board); //Moved to its own function

  // Presence Track Sizing
  console.log("RESIZING: Presence Tracks");
  //Load tracks
  const presenceTrack = board.getElementsByTagName("presence-tracks")[0];
  const energyTrack = board.getElementsByClassName("energy-track")[0];
  const playsTrack = board.getElementsByClassName("plays-track")[0];
  //Load board ojects
  const growth = board.getElementsByTagName("growth")[0];

  //Check for split nodes and resize as appropriate
  if (energyTrack.getElementsByTagName("split-presence-node")[0]) {
    energyTrack.classList.add("has-split-node");
  }
  if (playsTrack.getElementsByTagName("split-presence-node")[0]) {
    playsTrack.classList.add("has-split-node");
    if (energyTrack.getElementsByTagName("split-presence-node")[0]) {
      playsTrack.classList.add("has-split-node-tight");
    }
  }

  //Check horizontal overflow
  if (checkOverflowWidth(presenceTrack, 0)) {
    let spacers = Array.from(presenceTrack.getElementsByClassName("spacer"));
    spacers.forEach((spacer) => {
      spacer.classList.add("tight");
    });
    if (debug) {
      console.log("> Compressing horizontally; smaller initial spacer");
    }
  }
  if (checkOverflowWidth(presenceTrack, 20)) {
    let tdNodes = Array.from(presenceTrack.getElementsByTagName("td"));
    tdNodes.forEach((tdNode) => {
      tdNode.classList.add("tight");
    });
    if (debug) {
      console.log("> Compressing horizontally; less space between nodes");
    }
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
  debug = false;
  // let last_node_adjusted = false;
  if (tightFlag) {
    console.log("  Flag: tightening presence tracks");
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
      if (debug) {
        console.log(text);
      }
      if (i > 0) {
        if (text.offsetHeight > 50) {
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
          if (debug) {
            console.log(leftTextLocation);
            console.log(curTextLocation);
            console.log(rightTextLocation);
          }
          let deltaL = curTextLocation.left - leftTextLocation.right - 10;
          let deltaR = rightLeft - curTextLocation.right;
          let delta = deltaL < deltaR ? deltaL : deltaR;
          if (debug) {
            console.log("delta:" + delta);
          }
          if (delta > 0) {
            delta = delta > 30 ? 30 : delta;
            let newWidth = curTextLocation.width + 2 * delta;
            subtext[i].style.width = newWidth + "px";
            if (debug) {
              console.log(curTextLocation.width + " " + newWidth);
              console.log(text);
              console.log(subtext[i]);
            }
            balanceText(subtext[i]);
          }
        }
      }
    });
    if (debug) {
      console.log("textHeightsArray");
      console.log(textHeightsArray);
    }
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
    console.log("  > Compressing Presence Tracks Vertically");
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
  // const innatePowerBox = board.getElementsByTagName("innate-powers")[0];
  innatePowerBox.style.height =
    right.clientHeight - presenceTracks.clientHeight - growth.clientHeight + "px";
  let moveFlag = false;
  let k = 0;

  // First give left innate more horizontal room
  if (checkOverflowHeight(innatePowerBox)) {
    if (debug) {
      console.log("  > Innate Power 1 overflowing, giving more room to IP1");
    }
    innatePowers[0].classList.add("ip1-wide");
  }
  // Then tighten up the power levels
  if (checkOverflowHeight(innatePowerBox)) {
    if (debug) {
      console.log("  > Innate Powers overflowing, shrinking space between levels");
    }
    innatePowerBoxCheck.classList.add("tight-levels");
  }
  // Then tighten up the power level font spacing
  if (checkOverflowHeight(innatePowerBox)) {
    if (debug) {
      console.log("  > Innate Powers overflowing, shrinking level description line height");
    }
    let descriptions = Array.from(board.getElementsByClassName("description"));
    descriptions.forEach((description) => {
      description.style.lineHeight = "1";
    });
  }
  if (checkOverflowHeight(innatePowerBox)) {
    if (debug) {
      console.log("Innate Powers overflowing, shrinking notes (if applicable)...");
    }

    // First, check if its just one IP, and if so, move its note to the side (see Ember-Eyed)
    if (innatePowers.length === 1) {
      const note = innatePowers[0].getElementsByTagName("note")[0];
      if (note) {
        note.classList.add("single-squish");
        if (debug) {
          console.log("Single power note detected. Moving note to side.");
        }
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
    if (debug) {
      console.log("tallest is Innate Power: " + (tallest_index + 1));
    }

    //check for note in tallest innate power
    const noteBox = descriptionContainers[tallest_index].getElementsByTagName("note")[0];
    if (noteBox && !moveFlag) {
      if (debug) {
        console.log("notebox detected, attempting to shrink");
      }
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

function innatePowerSizing(board) {
  console.log("RESIZING: Innate Powers (from board_front.js)");

  let debug = false;
  if (debug) {
    console.log(board);
  }

  // Innate Power Notes (scale font size)
  const noteBlocks = board.getElementsByTagName("note");

  for (let i = 0; i < noteBlocks.length; i++) {
    let noteHeight = noteBlocks[i].offsetHeight;
    const lineHeight = parseFloat(
      window.getComputedStyle(noteBlocks[i]).getPropertyValue("line-height").replace(/px/, "")
    );
    if (debug) {
      console.log(lineHeight);
      console.log(lineHeight * 4.25);
    }
    let j = 0;
    while (noteHeight > lineHeight * 4.1) {
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

  thresholds.forEach((threshold, i) => {
    thresholds[i].style.width =
      Math.ceil(
        parseFloat(window.getComputedStyle(threshold).getPropertyValue("width").replace(/px/, ""))
      ) + "px";
  });

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
      description[i].style.paddingLeft = "0px"; // delete this if nothing seems broken
      description[i].classList.add("description-wrap");
      thresholds[i].classList.add("description-wrap");
      levels[i].classList.add("description-wrap");
    }
  }
}

function balanceText(el, lineHeight = 23) {
  let debug = false;
  const initialHeight = el.offsetHeight;
  const initialWidth = el.offsetWidth;
  if (debug) {
    console.log(
      "Balancing Text: " + el.textContent + " H:" + initialHeight + ", W:" + initialWidth
    );
  }
  if (initialHeight > lineHeight) {
    // No action needed for 1 liners (~19px growth, ~22px presence)
    let currentHeight = initialHeight;
    let j = 0;
    let k = Math.trunc(initialWidth);
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
      if (debug) {
        console.log(" H:" + currentHeight + ", W:" + k);
      }
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

// function checkOverflowWidth(el, slack = 30) {
//   let curOverflow = el.style.overflowX;
//   if (!curOverflow || curOverflow === "visible") {
//     el.style.overflowX = "auto";
//   }
//   let isOverflowing = el.clientWidth + slack < el.scrollWidth ? el.scrollWidth : false;
//   el.style.overflowX = curOverflow;

//   return isOverflowing;
// }

// function checkOverflowHeight(el, slack = 2) {
//   let debug = false;
//   let curOverflow = el.style.overflowY;
//   if (!curOverflow || curOverflow === "visible") {
//     el.style.overflowY = "auto";
//   }
//   let isOverflowing = el.clientHeight + slack < el.scrollHeight;
//   if (debug) {
//     console.log(
//       "check overflowY = " + (el.clientHeight + slack) + " " + slack + "," + el.scrollHeight
//     );
//   }
//   el.style.overflowY = curOverflow;
//   return isOverflowing;
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
    "</innate-power-container><innate-powers-background></innate-powers-background>";
}

function parseInnatePower(innatePowerHTML, index = 0) {
  let debug = false;
  if (debug) {
    console.log("Parsing Innate Power in boardfront.js");
  }
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
    "</innate-power-title>";

  //Innate Power info block
  currentPowerHTML += writeInnatePowerInfoBlock(
    innatePowerID,
    innatePowerHTML.getAttribute("speed"),
    innatePowerHTML.getAttribute("range"),
    innatePowerHTML.getAttribute("target"),
    innatePowerHTML.getAttribute("target-title")
  );

  //Innate Power effect
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
    console.log(currentLevel);
  }
  let levelHTML = "";
  const currentThreshold = currentLevel.getAttribute("threshold");
  if (currentThreshold === "text") {
    // User wants a special text-only line
    levelHTML += "<level><level-note>";
    levelHTML += currentLevel.innerHTML + "</level-note></level>";
  } else if (currentThreshold === "new-power") {
    const subpowerOptions = currentLevel.innerHTML.split(";");
    const subpowerName = subpowerOptions[0];
    const subpowerSpeed = subpowerOptions[1];
    const subpowerRange = subpowerOptions[2];
    const subpowerTarget = subpowerOptions[3];
    const subpowerTargetType = subpowerOptions[4] ? subpowerOptions[4] : "Target Land";
    const subID = levelID + "-2";
    //Innate Power title
    levelHTML +=
      "<innate-power-title id='" + subID + "title'>" + subpowerName + "</innate-power-title>";
    //Info Block
    levelHTML += writeInnatePowerInfoBlock(
      subID,
      subpowerSpeed,
      subpowerRange,
      subpowerTarget,
      subpowerTargetType
    );
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
    let numeralTag = currentNumeral >= 10 ? "threshold-num-double" : "threshold-num";
    let currentNumeralHTML = `<${numeralTag}>${currentNumeral}</${numeralTag}>`;
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

function writeInnatePowerInfoBlock(
  innatePowerID,
  powerSpeed,
  powerRange,
  powerTarget,
  targetTitle = "TARGET LAND"
) {
  targetTitle = targetTitle === "TARGET LAND" ? "land" : "spirit";
  // localize
  let infoTitles = {
    en: {
      speed: "SPEED",
      range: "RANGE",
      land: "TARGET LAND",
      spirit: "TARGET",
    },
    de: {
      speed: "WANN",
      range: "WIE WEIT",
      land: "WO",
      spirit: "WEN",
    },
    pl: {
      speed: "SZYBKOŚĆ",
      range: "ZASIĘG",
      land: "CEL (KRAINA)",
      spirit: "CEL",
    },
    ar: {
      speed: "سرعة",
      range: "مدى",
      land: "الأرض المستهدفة",
      spirit: "هدف",
    },
    zh: {
      speed: "速度",
      range: "距離",
      land: "目標區域",
      spirit: "目標精靈",
    },
  };

  let newPowerHTML = "";

  //Innate Power Speed and Range Header
  newPowerHTML += `<info-container><info-title><info-title-speed>${infoTitles[lang].speed}</info-title-speed><info-title-range>${infoTitles[lang].range}</info-title-range>`;

  //Innate Power Target Header
  newPowerHTML +=
    "<info-title-target id='" +
    innatePowerID +
    "targettitle'>" +
    infoTitles[lang][targetTitle] +
    "</info-title-target></info-title><innate-info>";

  //Innater Power Speed value
  newPowerHTML += `<innate-info-speed class="${powerSpeed.toLowerCase()}"></innate-info-speed>`;

  //Innate Power Range value
  newPowerHTML += `<innate-info-range id="${innatePowerID}range">${getRangeModel(
    powerRange
  )}</innate-info-range>`;

  //Innate Power Target value
  const targetValue = powerTarget;
  newPowerHTML += `<innate-info-target id="${innatePowerID}target">${replaceIcon(
    targetValue
  )}</innate-info-target></innate-info></info-container>`;

  return newPowerHTML;
}

function parseSpecialRules() {
  console.log("BUILDING SPECIAL RULES");
  const board = document.querySelectorAll("board")[0];

  const specialRules = board.getElementsByTagName("special-rules-container")[0];
  const specialRuleSection = specialRules.getElementsByTagName("section-title")[0];
  const specialRuleList = specialRules.getElementsByTagName("special-rule");
  const specialRuleNameList = specialRules.getElementsByTagName("special-rules-subtitle");

  // Re-organize slightly and add background
  const specialRulesHolder = document.createElement("special-rules");
  specialRules.after(specialRulesHolder);
  specialRulesHolder.appendChild(specialRules);
  const specialRulesBackground = document.createElement("special-rules-background");
  specialRulesHolder.appendChild(specialRulesBackground);

  // Enable snake-like presence track in special rules
  const specialTracks = board.getElementsByTagName("special-rules-track");
  if (specialTracks.length) {
    for (let j = 0; j < specialTracks.length; j++) {
      let specialTrack = specialTracks[j];
      if (specialTrack) {
        let specialValues = specialTrack.getAttribute("values");
        let specialOptions = specialValues.split(",");
        let specialHTML = "";

        for (let i = 0; i < specialOptions.length; i++) {
          let nodeText = specialOptions[i];
          specialHTML +=
            "<td>" + getPresenceNodeHtml(nodeText, i === 0, i, "special", true) + "</td>";
        }
        specialHTML += "</tr>";
        board.getElementsByTagName("special-rules-track")[0].removeAttribute("values");
        specialTrack.innerHTML = specialHTML;
        let subtextList = specialTrack.getElementsByTagName("subtext");
        for (let i = subtextList.length - 1; i >= 0; --i) {
          subtextList[i].remove();
        }
      }
    }
  }

  // Tag special rules with IDs
  for (let j = 0; j < specialRuleList.length; j++) {
    specialRuleList[j].id = "sr" + j + "effect";
    specialRuleNameList[j].id = "sr" + j + "name";
  }

  // Capture lines to control line break heights
  let specialRulesArray = Array.from(specialRuleList);
  specialRulesArray.forEach((specialRule) => {
    let separateLines = specialRule.innerHTML.split(/\r?\n|\r|\n/g);
    specialRule.innerHTML = "";
    separateLines.forEach((line) => {
      if (line.replace(/\W/g, "").length > 0) {
        let specialRuleLine = document.createElement("special-rule-line");
        specialRuleLine.innerHTML = line;
        specialRule.appendChild(specialRuleLine);
      }
    });
  });

  // Transfer over the custom name
  if (specialRules.getAttribute("customname")) {
    specialRuleSection.setAttribute("customname", specialRules.getAttribute("customname"));
  }

  // <special-rules-track values="2,3,4"></special-rules-track>
}

function tagSectionHeadings() {
  let sectionTitles = {
    //localize
    en: {
      growth: "GROWTH",
      presence: "PRESENCE",
      innate: "INNATE POWERS",
      special: "SPECIAL RULES",
    },
    de: {
      growth: "WACHSTUM",
      presence: "PRÄSENZ",
      innate: "PERMANENTE FÄHIGKEITEN",
      special: "SPEZIALREGELN",
    },
    pl: {
      growth: "ROZWÓJ",
      presence: "OBECNOŚĆ",
      innate: "WRODZONE MOCE",
      special: "SPECJALNE ZASADY",
    },
    ar: {
      growth: "نمو",
      presence: "وجود",
      innate: "القوة الفطري",
      special: "قواعد خاصة",
    },
    zh: {
      growth: "成長",
      presence: "靈跡",
      innate: "天賦法術",
      special: "特殊規則",
    },
  };

  const board = document.querySelectorAll("board")[0];
  let sectionHeadings = board.getElementsByTagName("section-title");
  for (let j = 0; j < sectionHeadings.length; j++) {
    let headingName = sectionHeadings[j].textContent.split(" ")[0].toLowerCase();
    sectionHeadings[j].id = "section-title-" + headingName;
    if (sectionHeadings[j].getAttribute("customname")) {
      sectionHeadings[j].textContent = sectionHeadings[j].getAttribute("customname");
      console.log("custom heading name detected and assigned");
    } else {
      if (headingName === "growth") {
        sectionHeadings[j].textContent = sectionHeadings[j].textContent.replace(
          "Growth",
          sectionTitles[lang][headingName]
        );
      } else {
        sectionHeadings[j].textContent = sectionTitles[lang][headingName];
      }
    }
  }
}
