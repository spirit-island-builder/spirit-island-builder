"use strict";

// const { text } = require("svelte/internal");

/* global replaceIcon */
/* global checkOverflowHeight */
/* global checkOverflowWidth */
/* global processRulesText */
/* global getRangeModel */

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

    buildSpecialRules();

    const html = board.innerHTML;
    board.innerHTML = replaceIcon(html);

    // This needs to be removed at some point, none of the code in here should be asynchronus and both dynamicResizing and addImages should not need to wait before they work properly. We have a race condition that works most of the time but will fail for some people.
    // Counterpoint: Resize needs the browser to draw the spirit board first, and then adjust things, so it needs to be drawn.
    await waitPromise(200);
    dynamicResizing();
    addImages(board);
    addTrackBanners(board);
    tagSectionHeadings();
    addCustomOverlayImages(board);

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

  const spiritNameText = document.createElement("spirit-name-text");
  spiritNameText.innerHTML = spiritNamePanel.innerHTML;
  spiritNamePanel.innerHTML = "";
  spiritNamePanel.appendChild(spiritNameText);

  const specialRules = board.querySelectorAll("special-rules-container")[0];
  let height = specialRules.getAttribute("height");
  if (!height) {
    const computedStyle = window.getComputedStyle(specialRules);
    height = computedStyle.getPropertyValue("height");
  }

  //Scale Spirit Name if too large
  let nameFontSize = parseFloat(
    window.getComputedStyle(spiritNameText, null).getPropertyValue("font-size")
  );
  while (checkOverflowWidth(spiritNameText, 0)) {
    nameFontSize -= 1;
    spiritNameText.style.fontSize = nameFontSize + "px";
    if (nameFontSize < 32) {
      console.log("too small, break");
      break;
    }
  }

  if (spiritBorder) {
    const spiritBorderSize = board.getAttribute("spirit-border-scale");
    const spiritNameArt = document.createElement("spirit-name-art");
    spiritNamePanel.appendChild(spiritNameArt);
    spiritNameArt.style.backgroundImage = `url(${spiritBorder})`;
    const borderHeight = spiritBorderSize !== null ? spiritBorderSize : "100px";
    spiritNameArt.style.backgroundSize = `705px ${borderHeight}`;
  }
  if (spiritImage) {
    //Image now scales to fill gap. 'imageSize' allows the user to specify what % of the gap to cover
    board.innerHTML = `<spirit-image-holder><spirit-image class="spirit-image" style="height:${imageSize}; background-image: url(${spiritImage});" >
      </spirit-image></spirit-image-holder>${board.innerHTML}`;
    artistCredit[0].style.display = "block";
    artistCredit[0].innerHTML = "Artist Credit: " + artistCredit[0].innerHTML;
  }

  //Add Meeple
  const spiritName = board.getElementsByTagName("spirit-name");
  spiritName[0].outerHTML += "<custom-meeple></custom-meeple>";
  spiritName[0].outerHTML += "<created-with>spiritislandbuilder.com</created-with>";
}

function addTrackBanners(board) {
  let debug = true;
  const presenceTracks = board.getElementsByTagName("presence-tracks")[0];

  // Check for Combined Banner
  let combinedBanner = board.getElementsByClassName("combined-track")[0];
  if (combinedBanner) {
    if (debug) {
      console.log("Combined banner");
      console.log(combinedBanner);
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
      let trackType = track.id;
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
      if (banner) {
        banner.style.width = trackWidth + "px";
        banner.style.top = trackTop + "px";
      }
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
          newGrowthCellHTML += `<growth-border header=${currentHeaderIndex}></growth-border>`;
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

  const headerText = !isNaN(headerIndex) ? ` header='${headerIndex}'` : "";
  const specialTitleText = growthGroup.getAttribute("special-title")
    ? ` special-title='${growthGroup.getAttribute("special-title")}'`
    : "";
  const specialTitleTextLeft = growthGroup.getAttribute("special-title-left")
    ? ` special-title-left='${growthGroup.getAttribute("special-title-left")}'`
    : "";
  const newRowFlag = growthGroup.getAttribute("new-row") ? ` new-row=true` : "";
  const tint = growthGroup.getAttribute("tint");
  const tintText = tint ? ` tint=${tint}` : ``;

  if (specialTitleTextLeft) {
    console.log("Found special title");
    console.log(growthGroup);
  }
  growthGroupHTML +=
    `<growth-group` +
    headerText +
    newRowFlag +
    specialTitleText +
    specialTitleTextLeft +
    tintText +
    `>`;

  // Tint
  if (tint) {
    growthGroupHTML += `<tint class='tint' style='background-color:${tint};'></tint>`;
  }

  // Costs
  const cost = growthGroup.getAttribute("cost");
  if (cost) {
    const costSplit = cost.split(",");
    if (isNaN(costSplit[0])) {
      // Non-numerical cost (ie. forget a card)
      if (costSplit[1]) {
        // Non-numerical cost with text
        growthGroupHTML += `<growth-cost class='custom nonscaling'>{${costSplit[0]}}<growth-cost-custom-nonscaling-description>${costSplit[1]}</growth-cost-custom-nonscaling-description></growth-cost>`;
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
      growthGroupHTML += `<growth-cost class='custom'>{${costSplit[1]}}<value>-${costSplit[0]}</value></icon></growth-cost>`;
    } else {
      // Its just a number, so do energy cost
      growthGroupHTML += `<growth-cost>-${costSplit[0]}</growth-cost>`;
    }
  }

  const growthActions = growthGroup.getAttribute("values").split(";");

  let nextGrowthAction;
  for (let j = 0; j < growthActions.length; j++) {
    try {
      nextGrowthAction = writeGrowthAction(growthActions[j], setIndex, groupIndex, j);
    } catch (e) {
      nextGrowthAction = writeGrowthAction("custom(error! check syntax)");
    }
    growthGroupHTML += nextGrowthAction;
  }

  growthGroupHTML += "</growth-group>";

  return growthGroupHTML;
}

function writeGrowthAction(growthAction, setIndex = 0, groupIndex = 0, actionIndex = 0) {
  let debug = true;
  const regExpOuterParentheses = /\(\s*(.+)\s*\)/;
  const regExpCommaNoParentheses = /,(?![^(]*\))/;

  let growthActionHTML = "";
  let growthActionType = growthAction.split("(")[0].split("^")[0];
  let growthActionID = `s${setIndex}g${groupIndex}a${actionIndex}`;
  if (debug) {
    console.log("Growth Action " + growthActionID + ": " + growthAction);
    console.log("Growth Action Type: " + growthActionType);
  }

  // Some tools for OR and Presence nodes
  let isOr = false;
  let isPresenceNode = false;

  let orGrowthActions;
  let numActions = 1;
  let orText = "or";
  if (growthActionType === "or" || growthActionType === "then") {
    console.log("'or' growth detected");
    isOr = true;
    orText = growthActionType;
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
  let growthOpen = `<growth-cell id='${growthActionID}'>`;
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
    growthText += ` ${orText} ${actionIconsAndText[1]}`;
    growthIcons += `${orText}${actionIconsAndText[0]}`;
    growthWasDefault = 0;
  }

  //Handle Presence Node
  if (isPresenceNode) {
    console.log(growthIcons);
    if (growthAction.includes("blank")) {
      growthIcons = `<presence-node class="growth blank"><ring-icon>${growthIcons}
        </ring-icon></presence-node>`;
    } else if (growthAction.includes("empty")) {
      console.log("empty - getting presence node modifiers");
      console.log(growthAction);
      growthIcons = getPresenceNodeHtml(growthAction, false, 0, "growth-empty", false);
      console.log(growthIcons);
      let wrapper = document.createElement("div");
      wrapper.innerHTML = growthIcons;
      let div = wrapper.firstChild;
      console.log(div);
      div.classList.add("growth", "blank");
      growthIcons = div.outerHTML;
      growthText = "";
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
        growthIcons = `<presence-node class="growth"><ring-icon>${growthIcons}</ring-icon></presence-node>`;
        console.log("node in growth with: " + growthIcons);
      }
    }
    isPresenceNode = false;
  }

  //Handle Ors
  if (isOr) {
    growthIcons = `<growth-cell-double>${growthIcons}</growth-cell-double>`;
  }

  //Check for blanks & relax constraint on growth-text if so
  if (growthText.length < 1) {
    growthTextOpen = "<growth-text class=blank-text>";
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
      repeatOpen = `<repeat-growth><value>${repeat}</value></repeat-growth>`;
      repeatText = `x${repeat}: `;
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
      growthIcons = `<custom-icon>{${growthActionType}}</custom-icon>`;
      growthText = IconName(growthActionType);
      break;
    }
    case "take-power-card":
    case "gain-power-card": {
      const matches = regExp.exec(growthAction);
      let gainPowerCardIcon = `{${growthActionType}}`;
      if (matches) {
        let gainPowerCardOptions = matches[1].split(",");
        let gainPowerCardType = gainPowerCardOptions[0] || "";
        let gainPCModifierIcon = gainPowerCardOptions[2];
        gainPowerCardIcon = `<icon class='${growthActionType}'>
                            <icon class='${gainPowerCardType.toLowerCase()} gain-card-modifier'></icon>`;
        if (gainPCModifierIcon) {
          gainPowerCardIcon += `<div class="gain-card-second-modifier">{${gainPCModifierIcon}}</div>`;
        }
        gainPowerCardIcon += `</icon>`;
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
        isolateIcons += `<range-growth><value>${isolateRange}</value></range-growth>`;
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
        energyGrowthIcons = `<growth-energy><value>${flatEnergy}</value></growth-energy>`;
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
      //no longer needed since the *wildcard was added
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
      presenceOptions = presenceOptions.map((str) => str.trim());
      let presenceRange = presenceOptions[0];
      let addPresenceOpen = "<custom-presence>";
      let addPresenceClose = "</custom-presence>";
      let presenceReq = "none";
      let presenceReqsIcons = "";
      let presenceRangeHTML = `{range-${presenceRange}}`;

      if (presenceRange === "any" && presenceOptions.length === 1) {
        addPresenceOpen = "<custom-presence-no-range>";
        addPresenceClose = "</custom-presence-no-range>";
        presenceRangeHTML = "<range-growth-any></range-growth-any>";
      } else if (presenceOptions.length > 1) {
        addPresenceOpen = "<custom-presence-req>";
        addPresenceClose = "</custom-presence-req>";
        presenceReqsIcons += "<presence-req>";

        if (presenceRange === "any") {
          addPresenceOpen += "<presence-req></presence-req>";
          presenceRangeHTML = "<range-growth-any></range-growth-any>";
        }

        if (presenceOptions[1] === "text") {
          // User wants a custom text presence addition
          if (presenceOptions[3]) {
            presenceReqsIcons += "<display-custom>";
            for (let i = 3; i < presenceOptions.length; i++) {
              presenceReqsIcons += "{" + presenceOptions[i] + "}";
            }
            presenceReqsIcons += "</display-custom>";
          } else {
            presenceReqsIcons +=
              "<span style='font-family: DK Snemand; font-size: 24pt; line-height: 24pt; font-style: normal;'></span>";
          }
        } else if (presenceOptions[1] === "token") {
          // User wants to add a token in growth
          switch (presenceOptions[3]) {
            case "and":
              //add presence and token
              presenceReqsIcons += "<span class='plus-text'>+ </span>";
              presenceReqsIcons += "<icon class='" + presenceOptions[2] + " add-token'></icon>";
              break;
            case "or":
              //add presence or token
              addPresenceOpen = "<custom-presence-req><custom-presence-or>";
              addPresenceClose = "</custom-presence-req>";
              presenceReqsIcons = "{backslash}{" + presenceOptions[2] + "}</custom-presence-or>";
              break;
            case "instead":
              // no option to add presence, just token
              break;
          }
        } else if (presenceOptions[1] === "relative") {
          presenceReqsIcons = "<add-relative>" + presenceReqsIcons;
          presenceRangeHTML += "</add-relative>";
          presenceReq = presenceOptions[2].toLowerCase().trim();
          presenceReqsIcons += `{${presenceReq}}`;
        } else {
          // User wants an OR or an AND requirement
          let operator = "";
          if (presenceOptions.length > 4) {
            operator = presenceOptions.at(-1).toLowerCase() === "or" ? "/" : "&";
          } else {
            operator = " " + IconName(presenceOptions.at(-1)) + " ";
          }

          for (let i = 1; i < presenceOptions.length; i++) {
            presenceReq = presenceOptions[i].toLowerCase().trim();

            // Check to see if we've reached an 'or' or 'and', which shouldn't be parsed
            if (presenceReq === "or" || presenceReq === "and") {
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
                presenceReqsIcons +=
                  presenceOptions.length < 3
                    ? "<span class='non-icon'>" + presenceReq.toUpperCase() + "</span>" // This do-nothing Icon just creates 50px of height to make everything line up. Other ideas?
                    : "<span class='non-icon small'>" + presenceReq.toUpperCase() + "</span>";
                break;
              case "no-own-presence":
                presenceReqsIcons += "{no-presence}";
                break;
              default:
                presenceReqsIcons += "{" + presenceReq + "}";
            }

            if (i < presenceOptions.length - 2) {
              presenceReqsIcons += operator;
            }
          }
        }
        presenceReqsIcons += "</presence-req>";
      }
      growthIcons =
        addPresenceOpen +
        "<plus-presence>+{presence}</plus-presence>" +
        presenceReqsIcons +
        presenceRangeHTML +
        addPresenceClose;
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
      let moveOptions = matches[1].split(",");
      let moveTarget = isNaN(moveOptions[0]) ? moveOptions[0] : moveOptions[1];
      let targetHTML = `{${moveTarget}}`;
      if (moveTarget.includes("/")) {
        // "Or" targets
        let moveTargets = moveTarget.split("/");
        targetHTML = "<icon-holder>";
        moveTargets.forEach((target) => {
          targetHTML += `{${target}}/`;
        });
        targetHTML = targetHTML.slice(0, -1); // Remove the last "/"
        targetHTML = targetHTML.replaceAll("/", `{backslash}`);
        targetHTML += "</icon-holder>";
      }
      let moveRange = isNaN(moveOptions[0]) ? 0 : moveOptions[0];
      let moveTag = moveRange > 0 ? "push-gather-range-req" : "push-gather";
      let rangeHTML =
        moveRange > 0 ? `<range-growth><value>${moveRange}</value></range-growth>` : ``;
      let moveCondition;
      let iconNum = 1;
      let moveArrowOrCondition = ``;
      let landClass = growthActionType;
      let shift = moveRange > 0 ? 1 : 0;
      if (moveOptions[1 + shift]) {
        console.log("conditions discovered");
        moveCondition = moveOptions[1 + shift];
        if (!isNaN(moveCondition)) {
          iconNum = moveCondition;
          moveCondition = ``;
        } else if (terrains.has(moveCondition)) {
          landClass = `${moveCondition} terrain-${growthActionType}`;
          moveArrowOrCondition = `{${growthActionType}-arrow}`;
        } else {
          landClass = `${growthActionType}-${preposition}`;
          moveArrowOrCondition = `<icon class="${preposition} ${moveCondition}"></icon>`;
        }
        if (moveOptions[2 + shift]) {
          iconNum = moveOptions[2 + shift];
        }
      }

      if (iconNum > 1) {
        targetHTML = `<icon-holder>`;
        for (let i = 0; i < iconNum; i++) {
          targetHTML += `<icon class="${moveTarget}"></icon>`;
        }
        targetHTML += `</icon-holder>`;
      }

      growthIcons = `<${moveTag}><icon class="${landClass}">${moveArrowOrCondition}${targetHTML}</icon>${rangeHTML}</${moveTag}>`;
      growthText = IconName(
        `${growthActionType}(${moveRange},${moveTarget},${moveCondition},${iconNum})`
      );
      break;
    }
    case "move-presence": {
      const matches = regExp.exec(growthAction);
      const moveOptions = matches[1].split(",");
      let moveRange = moveOptions[0];
      let moveText = IconName(`growth-${growthAction}`);
      let moveIcons = "";
      if (isNaN(moveRange)) {
        moveRange = `{${moveRange}}`;
      }
      if (!moveOptions[1]) {
        // Move presence range X
        moveIcons = `<custom-icon>{presence}<move-growth><value>
          ${moveRange}
          </value></move-growth></custom-icon>`;
        // moveText = IconName(growthActionType);
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
            elementIcons += `<icon class='orelement element ${elementOptions[i]}'></icon>`;
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
            let element_loc = `style='transform: translateY(${y_loc_prime}px) translateX(${x_loc_prime}px)'`;
            let cur_element =
              elementOptions.at(-1) === "and" ? elementOptions[i] : elementOptions[0];
            elementIcons += `<icon-multi-element><icon class='element ${cur_element}'
              ${element_loc}
              ></icon></icon-multi-element>`;
          }

          growthIcons = `<gain>${elementIcons}</gain>`;
        }
      } else {
        growthIcons = `<gain><icon class='element ${gainedElement}'></icon></gain>`;
      }
      growthText = IconName(growthAction);
      break;
    }
    case "blank": {
      let blankMatches = regExpOuterParentheses.exec(growthAction);
      let blankWidth = 75;
      if (blankMatches) {
        let blankOptions = blankMatches[1];
        if (!isNaN(blankOptions)) {
          blankWidth = blankOptions;
        }
      }
      growthIcons = `<custom-growth-icon style='max-width:${blankWidth}px;'></custom-growth-icon>`;
      growthText = "";
      break;
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
      growthIcons = `<growth-range>{gain-range-${range}}</growth-range>`;
      growthText = IconName(`growth-${growthAction}`);
      break;
    }
    case "gain-card-play": {
      const matches = regExp.exec(growthAction);
      growthIcons = `{${growthActionType}}`;
      if (matches) {
        const cardplayOptions = matches[1].split(",");
        const num_card_plays = cardplayOptions[0];
        growthIcons = `<card-play-num><value>${num_card_plays}</value></card-play-num>`;
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
          const marker_loc = `style='transform: translateY(${y_loc}px) translateX(${x_loc}px)'`;
          markerIcons += `<icon-multi-element><icon class='element ${marker_type}' ${marker_loc}>
            </icon></icon-multi-element>`;
        }
      } else {
        markerIcons = `{${marker_type}}`;
      }
      growthIcons = `<gain>${markerIcons}</gain>`;
      growthText = IconName(marker_type, num_markers);
      break;
    }
    case "discard": {
      const matches = regExp.exec(growthAction);
      growthText = IconName(growthAction);
      if (matches) {
        let discardOptions = matches[1].split(",");
        const numDiscard = discardOptions[0];
        if (isNaN(numDiscard)) {
          //handle element discards
          const discardElement = numDiscard;
          growthIcons =
            "<icon class='discard-card'><icon class='discard-element " +
            discardElement +
            "'></icon></icon>";
        } else {
          //handle number discards
          let discardAction = numDiscard > 1 ? "discard-cards" : "discard-card";
          growthIcons = "{" + discardAction + "}";
          growthText = IconName(discardAction);
        }
      } else {
        growthIcons = "{discard-card}";
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
            '<custom-icon2><icon class="incarna move ' +
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
      console.log("sending this to IconName: " + growthAction);
      growthText = IconName(growthAction);
      break;
    }
    case "add-token": {
      const matches = regExp.exec(growthAction);
      let tokenOptions = matches[1].split(",");
      let range = tokenOptions[0];
      let token = tokenOptions[1];
      let tokenNum = tokenOptions[2];
      if (isNaN(range) && range !== "any") {
        // error handling if no range is input
        console.log("no range input, setting to 0");
        range = 0;
        token = tokenOptions[0];
        tokenNum = tokenOptions[1];
      }
      let tokenRange = "";
      if (range !== "any") {
        tokenRange = `<range-growth><value>${range}</value></range-growth>`;
        console.log("token range isn't any");
      }
      let tokenReqOpen = `<custom-icon class="add-token">`;
      let tokenReqClose = "</custom-icon>";
      let tokenIcons = "";
      let tokenConditional = "";
      let operator = tokenOptions.at(-1);
      let iconNameVars = range;
      if (!tokenNum) {
        tokenIcons = `+{${token}}`;
        iconNameVars += `,${"and"},${token}`;
      } else if (!isNaN(tokenNum)) {
        // multiple of the same token
        tokenIcons += "+";
        if (tokenNum > 3) {
          tokenIcons += tokenNum + `{${token}}`;
        } else {
          for (let i = 0; i < tokenNum; i++) {
            tokenIcons += `{${token}}`;
          }
        }
        iconNameVars += `,${"and"},${token},${tokenNum}`;
      } else if (operator === "and" || operator === "or") {
        // two or more different tokens
        const operator = tokenOptions.at(-1);
        tokenIcons += `+{${token}}`;
        if (operator === "and" || operator === "or") {
          for (let i = 2; i < tokenOptions.length - 1; i++) {
            tokenIcons += operator === "or" ? "/" : "";
            tokenIcons += `{${tokenOptions[i]}}`;
          }
        }
        iconNameVars += `,${operator},${tokenOptions.slice(1, -1)}`;
      } else {
        // conditional
        tokenIcons = `+{${token}}`;
        let condition = tokenNum.toLowerCase();
        if (terrainSingle.has(condition)) {
          tokenConditional = `<presence-req><icon class="${condition} terrain-single"></icon></presence-req>`;
        } else if (terrainDouble.has(condition)) {
          tokenConditional = `<presence-req><icon class="${condition} terrain-double"></icon></presence-req>`;
        } else if (terrainNoIcons.has(condition)) {
          //coastal,inland,invaders
          tokenConditional = `<presence-req><span class="non-icon">${condition}</span></presence-req>`;
        } else {
          //a land with a particular token
          tokenConditional = `<presence-req><icon class="your-land add-token"><icon class="${condition}"></icon></icon></presence-req>`;
        }
        operator = "conditional";
        iconNameVars += `,${operator},${token},${condition}`;
      }
      growthIcons =
        tokenReqOpen +
        "<token-wrap>" +
        tokenIcons +
        "</token-wrap>" +
        tokenConditional +
        tokenRange +
        tokenReqClose;
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
  if (combinedBanner && combinedBanner !== "null") {
    // Prepare banner
    console.log("preparing combined banner");
    console.log(combinedBanner);
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
  const energyTrack = document.getElementById("energy-track");
  const energyNodes = energyTrack.getElementsByTagName("td");
  const playsTrack = document.getElementById("plays-track");
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

  let energyHTML = "<tr id='energy-track'>";

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

  let cardPlayHTML = "<tr id='plays-track'>";

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

  let additionalTrackHTML = `<tr id='additional-track${i}' class='additional-track'>`;

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
  fr: "Energie",
  de: "Energie",
  pl: "Energia",
  ar: "طاقة",
  zh: "能量",
  hu: "Energia",
  ko: `에너지`,
  ja: `エネルギー`,
};
let Turn = {
  en: "Turn",
  fr: "Tour",
  de: "Runde",
  pl: "Rundę",
  ar: "دور",
  zh: "回合",
  hu: "Forduló",
  ko: `차례`,
  ja: `ターン`,
};
let CardPlay = {
  en: "Card Play",
  fr: "Jouer une Carte",
  de: "Karte ausspielen",
  pl: "Zagraj jedną",
  ar: "استخدام البطاقة",
  zh: "卡牌使用",
  hu: "Kártyakijátszás",
  ko: `카드 사용 횟수`,
  ja: `カードプレイ`,
};
let CardPlays = {
  en: "Card Plays",
  fr: "Jouer des Cartes",
  de: "Karten ausspielen",
  pl: "Zagrane Karty",
  ar: "استخدامات البطاقة",
  zh: "卡牌使用次數",
  hu: "Kijátszható kártyák",
  ko: `카드 사용 횟수`,
  ja: `カードプレイ`,
};
let Cost = {
  en: "Cost",
  fr: "Coût",
  de: "Kosten",
  pl: "Koszt",
  ar: "التكلفة",
  zh: "費用",
  hu: "Költség",
  ko: `비용`,
  ja: `コスト`,
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
    "land": "land",
    "invaders": "Invaders",
  },
  fr: {
    "ocean": "océan",
    "oceans": "océans",
    "mountain": "montagne",
    "jungle": "jungle",
    "sand": "désert",
    "sands": "déserts",
    "wetland": "fange",
    "jungle-wetland": "jungle ou fange",
    "wetland-jungle": "fange ou jungle",
    "jungle-sand": "jungle ou désert",
    "sand-jungle": "désert ou jungle",
    "jungle-sands": "jungle ou déserts",
    "sands-jungle": "déserts ou jungle",
    "sand-wetland": "désert ou fange",
    "wetland-sand": "fange ou désert",
    "sands-wetland": "déserts ou fange",
    "wetland-sands": "fange ou déserts",
    "mountain-jungle": "montagne ou jungle",
    "jungle-mountain": "jungle ou montagne",
    "mountain-wetland": "montagne ou fange",
    "wetland-mountain": "fange ou montagne",
    "mountain-sand": "montagne ou désert",
    "sand-mountain": "désert ou montagne",
    "mountain-sands": "montagne ou déserts",
    "sands-mountain": "déserts ou montagne",
    "inland": "Intérieures",
    "coastal": "Côtières",
    "land": "région",
    "invaders": "Envahisseurs",
  },
  de: {
    "ocean": "Ozean",
    "oceans": "Ozeane",
    "mountain": "Berg",
    "jungle": "Dschungel",
    "sand": "Wüste",
    "sands": "Wüste",
    "wetland": "Sumpf",
    "jungle-wetland": "Dschungel oder Sumpf",
    "wetland-jungle": "Dschungel oder Sumpf",
    "jungle-sand": "Dschungel oder Wüste",
    "sand-jungle": "Dschungel oder Wüste",
    "jungle-sands": "Dschungel oder Wüste",
    "sands-jungle": "Dschungel oder Wüste",
    "sand-wetland": "Wüste oder Sumpf",
    "wetland-sand": "Wüste oder Sumpf",
    "sands-wetland": "Wüste oder Sumpf",
    "wetland-sands": "Wüste oder Sumpf",
    "mountain-jungle": "Berg oder Dschungel",
    "jungle-mountain": "Berg oder Dschungel",
    "mountain-wetland": "Berg oder Sumpf",
    "wetland-mountain": "Berg oder Sumpf",
    "mountain-sand": "Berg oder Wüste",
    "sand-mountain": "Berg oder Wüste",
    "mountain-sands": "Berg oder Wüste",
    "sands-mountain": "Berg oder Wüste",
    "inland": "Binnengebiet",
    "coastal": "Küste",
    "land": "gebiet",
    "invaders": "Invasoren",
  },
  pl: {
    "ocean": "Ocean",
    "oceans": "Ocean",
    "mountain": "Góry",
    "jungle": "Dżungla",
    "sand": "Pustynia",
    "sands": "Pustynia",
    "wetland": "Mokradła",
    "jungle-wetland": "Dżungla lub Pustynia",
    "wetland-jungle": "Mokradła lub Dżungla",
    "jungle-sand": "Dżungla lub Pustynia",
    "sand-jungle": "Dżungla lub Pustynia",
    "jungle-sands": "Dżungla lub Pustynia",
    "sands-jungle": "Dżungla lub Pustynia",
    "sand-wetland": "Pustynia lub Mokradła",
    "wetland-sand": "Pustynia lub Mokradła",
    "sands-wetland": "Pustynia lub Mokradła",
    "wetland-sands": "Pustynia lub Mokradła",
    "mountain-jungle": "Góry lub Jungle",
    "jungle-mountain": "Góry lub Jungle",
    "mountain-wetland": "Góry lub Mokradła",
    "wetland-mountain": "Góry lub Mokradła",
    "mountain-sand": "Góry lub Pustynia",
    "sand-mountain": "Góry lub Pustynia",
    "mountain-sands": "Góry lub Pustynia",
    "sands-mountain": "Góry lub Pustynia",
    "inland": "Wewnętrzne",
    "coastal": "Zewnętrzne",
    "land": "kraina",
    "invaders": "Najeźdźcy",
  },
  hu: {
    "ocean": "Óceán",
    "oceans": "Óceán",
    "mountain": "Hegyvidék",
    "jungle": "Őserdő",
    "sand": "Sivatag",
    "sands": "Sivatag",
    "wetland": "Mocsár",
    "jungle-wetland": "Őserdő vagy Mocsár",
    "wetland-jungle": "Őserdő vagy Mocsár",
    "jungle-sand": "Őserdő vagy Sivatag",
    "sand-jungle": "Őserdő vagy Sivatag",
    "jungle-sands": "Őserdő vagy Sivatag",
    "sands-jungle": "Őserdő vagy Sivatag",
    "sand-wetland": "Sivatag vagy Mocsár",
    "wetland-sand": "Sivatag vagy Mocsár",
    "sands-wetland": "Sivatag vagy Mocsár",
    "wetland-sands": "Sivatag vagy Mocsár",
    "mountain-jungle": "Hegyvidék vagy Őserdő",
    "jungle-mountain": "Hegyvidék vagy Őserdő",
    "mountain-wetland": "Hegyvidék vagy Mocsár",
    "wetland-mountain": "Hegyvidék vagy Mocsár",
    "mountain-sand": "Hegyvidék vagy Sivatag",
    "sand-mountain": "Hegyvidék vagy Sivatag",
    "mountain-sands": "Hegyvidék vagy Sivatag",
    "sands-mountain": "Hegyvidék vagy Sivatag",
    "inland": "Belső",
    "coastal": "Tengerparti",
    "land": "terület",
    "invaders": "Telepesek",
  },
  zh: {
    "ocean": "海洋",
    "oceans": "海洋",
    "mountain": "山地",
    "jungle": "叢林",
    "sand": "沙漠",
    "sands": "沙漠",
    "wetland": "濕地",
    "jungle-wetland": "叢林或濕地",
    "wetland-jungle": "叢林或濕地",
    "jungle-sand": "叢林或沙漠",
    "sand-jungle": "叢林或沙漠",
    "jungle-sands": "叢林或沙漠",
    "sands-jungle": "叢林或沙漠",
    "sand-wetland": "沙漠或濕地",
    "wetland-sand": "沙漠或濕地",
    "sands-wetland": "沙漠或濕地",
    "wetland-sands": "沙漠或濕地",
    "mountain-jungle": "山地或叢林",
    "jungle-mountain": "山地或叢林",
    "mountain-wetland": "山地或濕地",
    "wetland-mountain": "山地或濕地",
    "mountain-sand": "山地或沙漠",
    "sand-mountain": "山地或沙漠",
    "mountain-sands": "山地或沙漠",
    "sands-mountain": "山地或沙漠",
    "inland": "內陸",
    "coastal": "海岸",
    "land": "區域",
    "invaders": "侵略者",
  },
  ar: {
    "ocean": "محيط",
    "oceans": "محيط",
    "mountain": "جبل",
    "jungle": "غابة",
    "sand": "صحراء",
    "sands": "صحراء",
    "wetland": "أرض رطبة",
    "jungle-wetland": "غابة أو أرض رطبة",
    "wetland-jungle": "غابة أو أرض رطبة",
    "jungle-sand": "غابة أو صحراء",
    "sand-jungle": "غابة أو صحراء",
    "jungle-sands": "غابة أو صحراء",
    "sands-jungle": "غابة أو صحراء",
    "sand-wetland": "صحراء أو أرض رطبة",
    "wetland-sand": "صحراء أو أرض رطبة",
    "sands-wetland": "صحراء أو أرض رطبة",
    "wetland-sands": "صحراء أو أرض رطبة",
    "mountain-jungle": "جبل أو غابة",
    "jungle-mountain": "جبل أو غابة",
    "mountain-wetland": "جبل أو أرض رطبة",
    "wetland-mountain": "جبل أو أرض رطبة",
    "mountain-sand": "جبل أو صحراء",
    "sand-mountain": "جبل أو صحراء",
    "mountain-sands": "جبل أو صحراء",
    "sands-mountain": "جبل أو صحراء",
    "inland": "داخلي",
    "coastal": "ساحلي",
    "land": "أرض",
    "invaders": "غزاة",
  },
  ko: {
    "ocean": "바다",
    "oceans": "바다",
    "mountain": "산악",
    "jungle": "정글",
    "sand": "사막",
    "sands": "사막",
    "wetland": "습지",
    "jungle-wetland": "정글 또는 습지",
    "wetland-jungle": "정글 또는 습지",
    "jungle-sand": "정글 또는 사막",
    "sand-jungle": "정글 또는 사막",
    "jungle-sands": "정글 또는 사막",
    "sands-jungle": "정글 또는 사막",
    "sand-wetland": "사막 또는 습지",
    "wetland-sand": "사막 또는 습지",
    "sands-wetland": "사막 또는 습지",
    "wetland-sands": "사막 또는 습지",
    "mountain-jungle": "산악 또는 정글",
    "jungle-mountain": "산악 또는 정글",
    "mountain-wetland": "산악 또는 습지",
    "wetland-mountain": "산악 또는 습지",
    "mountain-sand": "산악 또는 사막",
    "sand-mountain": "산악 또는 사막",
    "mountain-sands": "산악 또는 사막",
    "sands-mountain": "산악 또는 사막",
    "inland": "내륙",
    "coastal": "해안",
    "land": "지역",
    "invaders": "침략자",
  },
  ja: {
    "ocean": "海",
    "oceans": "海",
    "mountain": "山",
    "jungle": "ジャングル",
    "sand": "砂漠",
    "sands": "砂漠",
    "wetland": "湿地",
    "jungle-wetland": "ジャングルまたは湿地",
    "wetland-jungle": "ジャングルまたは湿地",
    "jungle-sand": "ジャングルまたは砂漠",
    "sand-jungle": "ジャングルまたは砂漠",
    "jungle-sands": "ジャングルまたは砂漠",
    "sands-jungle": "ジャングルまたは砂漠",
    "sand-wetland": "砂漠または湿地",
    "wetland-sand": "砂漠または湿地",
    "sands-wetland": "砂漠または湿地",
    "wetland-sands": "砂漠または湿地",
    "mountain-jungle": "山またはジャングル",
    "jungle-mountain": "山またはジャングル",
    "mountain-wetland": "山または湿地",
    "wetland-mountain": "山または湿地",
    "mountain-sand": "山または砂漠",
    "sand-mountain": "山または砂漠",
    "mountain-sands": "山または砂漠",
    "sands-mountain": "山または砂漠",
    "inland": "内陸",
    "coastal": "沿岸",
    "land": "土地",
    "invaders": "侵略者",
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
  fr: {
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
  hu: {
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
  ko: {
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
  ja: {
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
const terrainNoIcons = new Set(["coastal", "inland", "invaders"]);
const terrains = new Set([...terrainSingle, ...terrainDouble, ...terrainTypes]);

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
  const regExpOuterParentheses = /\(\s*(.+)\s*\)/;
  let pnDebug = false;

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
  // Will be populated with some info useful for TTS.
  let ttsInfo = "";

  let force_first = false;

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

  // Blank nodes
  if (nodeText.startsWith("blank")) {
    ring.classList.add("blank-ring");
  }

  // Check splitpath nodes
  if (nodeText.startsWith("split(")) {
    if (pnDebug) {
      console.log("Split Path node - version 1");
    }
    nodeText = regExpOuterParentheses.exec(nodeText)[1];
    let splitNodes = nodeText.split(";");
    console.log(splitNodes);
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

  //Handle text override
  let overrideText = "";
  if (nodeText.split("*")[1]) {
    overrideText = nodeText.split("*")[1].split("^")[0].split("_")[0].split("~")[0];
    // nodeText = nodeText.split("*")[0];
    if (pnDebug) {
      console.log("Override Text: " + overrideText);
    }
  }

  //Correct any inclusion of commas (now that override is done)
  nodeText = nodeText.replace(",", ";");

  //Handle ^ (node notation)
  let addDeepLayers = false;
  let iconDeepLayers;
  if (nodeText.split("^")[1]) {
    iconDeepLayers = nodeText.split("^")[1].split("_")[0].split("*")[0].split("~")[0];
    addDeepLayers = true;
    if (pnDebug) {
      console.log("Adding Icon: " + iconDeepLayers);
    }
  }

  // Handle _ (force node backgrounds)
  let optionsNodeBack;
  if (nodeText.split("_")[1]) {
    optionsNodeBack = nodeText.split("_")[1].split("^")[0].split("*")[0].split("~")[0];
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
      force_first = true;
    }
    if (optionsNodeBack.includes("shift(")) {
      const matches = regExp.exec(optionsNodeBack);
      const shiftOptions = matches[1].split(";");
      let shift = shiftOptions[0] ? shiftOptions[0] + "%" : "0%";
      let slide = shiftOptions[1] ? -1 * shiftOptions[1] + "%" : "0%";
      // store shift info for later
      presenceNode.setAttribute("shift", `translate(${shift},${slide})`);
    }
  }

  // Handle ~ (subtext location)
  if (nodeText.split("~")[1]) {
    let optionsSubtextLocation = nodeText.split("~")[1].split("^")[0].split("*")[0].split("_")[0];
    if (optionsSubtextLocation.includes("top")) {
      presenceNode.classList.add("top-subtext");
    }
    if (optionsSubtextLocation.includes("left")) {
      presenceNode.classList.add("left-subtext");
    }
    if (optionsSubtextLocation.includes("right")) {
      presenceNode.classList.add("right-subtext");
    }
  }

  //Clean the node text
  nodeText = nodeText.split("_")[0].split("^")[0].split("*")[0].split("~")[0];

  //Check for first
  if (first === true && trackType !== "special") {
    presenceNode.classList.add("first");
  }
  if (force_first === true) {
    presenceNode.classList.add("force-first");
  }

  //Get the node inners and subtext
  [inner, subText, addEnergyRing, addIconShadow, ttsInfo] = getPresenceNodeInnerHTML(
    nodeText,
    trackType,
    first
  );

  presenceNode.setAttribute("ttsInfo", ttsInfo);

  if (!forceNone) {
    if ((addEnergyRing || forceEnergyRing) && !forceShadow) {
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
        en: `Pay ${valueNum} Energy to ${subText}`,
        fr: ``,
        de: ``,
        pl: ``,
        ar: ``,
        zh: ``,
        hu: ``,
        ko: ``,
        ja: ``,
      };
      subText = localize[lang];
    }
    presenceNode.innerHTML =
      "<deep-layers>" +
      "<icon class='" +
      iconDeepLayers +
      " " +
      trackType +
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

function getPresenceNodeInnerHTML(
  nodeText,
  trackType = "card",
  first = false,
  addEnergyRing = false
) {
  // Variables
  let subText = "";
  let inner = "";
  const regExp = /\(([^)]+)\)/;
  let pnDebug = false;
  let addIconShadow = false;
  let ttsInfo = [[], [], [], []]; // energy,bonusenergy,plays,elements

  // Setup node class
  if (trackType === "special") {
    trackType = "special-ring";
    addEnergyRing = false;
  }
  if (trackType === "energy") {
    addEnergyRing = true;
  }

  const plusRegex = /\+(?![^()]*(?:\([^()]*\))?\))/gm;
  let splitOptions = nodeText.split(plusRegex).map((item) => item.trim());

  //This code allows user to include +energy such as: +1
  const plus_check = splitOptions.indexOf("");
  if (plus_check !== -1) {
    splitOptions.splice(plus_check, 1);
    splitOptions[plus_check] = `bonusenergy(${splitOptions[plus_check]})`;
    trackType = "energy";
  }

  //This code allows the user to include +energy in this way too: energy(+1)
  if (nodeText.includes("energy(+")) {
    let findInd = splitOptions.indexOf("energy(");
    if (splitOptions.length > 2) {
      // Multioption
      splitOptions[findInd] = "bonusenergy(" + splitOptions[findInd + 1] + ")";
      splitOptions[findInd] = splitOptions[findInd].substring(0, splitOptions[findInd].length - 1);
    } else {
      // Single Option
      splitOptions[findInd] = "bonus" + splitOptions[findInd] + splitOptions[findInd + 1];
    }
    splitOptions.splice(findInd + 1, 1);
  }

  if (pnDebug) {
    console.log(`Processing ${splitOptions}`);
  }

  const numLocs = splitOptions.length;
  let innerFinal = "";
  let subTextFinal = "";
  for (let i = 0; i < splitOptions.length; i++) {
    let option = splitOptions[i].split("(")[0];
    let fullOption = splitOptions[i];

    // Convert number values into energy/plays
    if (!isNaN(option)) {
      if (trackType === "energy") {
        fullOption = `energy-default(${option})`;
        option = `energy-default`;
      } else if (trackType === "special-ring") {
        fullOption = `special-default(${option})`;
        option = `special-default`;
      } else {
        fullOption = `plays-default(${option})`;
        option = `plays-default`;
      }
    }

    if (pnDebug) {
      console.log(`Option(${i}):${option} with ${splitOptions[i]}`);
    }

    // process the node
    switch (option) {
      case "push": {
        const matches = regExp.exec(fullOption);
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
        splitOptions[i] = "track-" + fullOption; // rename the option
        break;
      }
      case "gather": {
        const matches = regExp.exec(fullOption);
        const moveTarget = matches[1];
        inner = "<icon class='gather'><icon class='" + moveTarget + "'></icon></icon>";
        splitOptions[i] = "track-" + fullOption; // rename the option
        break;
      }
      case "energy": {
        const matches = regExp.exec(fullOption);
        const num = matches[1];
        inner = `<energy-icon><value>${num}</value></energy-icon>`;
        splitOptions[i] = `energy-special(${num})`; // rename the option
        addEnergyRing = false; //adds its own
        addIconShadow = false;
        ttsInfo[0].push(num);
        break;
      }
      case "energy-default": {
        const matches = regExp.exec(fullOption);
        const num = matches[1];
        inner = `<energy-icon><value>${num}</value></energy-icon>`;
        splitOptions[i] = first ? `energy-first(${num})` : num; // rename the option
        addEnergyRing = false; //adds its own
        addIconShadow = false;
        ttsInfo[0].push(num);
        break;
      }
      case "bonusenergy": {
        const matches = regExp.exec(fullOption);
        const num = matches[1];
        inner = `<energy-icon><value>+${num}</value></energy-icon>`;
        addEnergyRing = false; //adds its own
        addIconShadow = false;
        ttsInfo[1].push(num);
        break;
      }
      case "plays": {
        const matches = regExp.exec(fullOption);
        const num = matches[1];
        inner = `<card-icon><value>${numLocalize[lang][num] || num}</value></card-icon>`;
        splitOptions[i] = `plays-special(${num})`;
        addEnergyRing = false;
        addIconShadow = false;
        ttsInfo[2].push(num);
        break;
      }
      case "plays-default": {
        const matches = regExp.exec(fullOption);
        const num = matches[1];
        inner = `<card-icon><value>${numLocalize[lang][num] || num}</value></card-icon>`;
        splitOptions[i] = first ? `plays-first(${num})` : num; // rename the option
        addEnergyRing = false;
        addIconShadow = false;
        ttsInfo[2].push(num);
        break;
      }
      case "special-default": {
        const matches = regExp.exec(fullOption);
        const num = matches[1];
        inner = `<special-track-presence><value>${
          numLocalize[lang][num] || num
        }</value></special-track-presence>`;
        addEnergyRing = false;
        addIconShadow = false;
        break;
      }
      case "incarna": {
        const matches = regExp.exec(fullOption);
        const incarnaOptions = matches[1].split(";");
        const incarnaAction = incarnaOptions[0];
        const customIncarnaIcon = incarnaOptions[2] ? incarnaOptions[2] : "incarna";
        let addMoveHelper;
        switch (incarnaAction) {
          case "empower":
            inner = "{empower-incarna}";
            break;
          case "addmove":
          case "add-move":
            addMoveHelper = incarnaOptions[1] ? incarnaOptions[1] : "presence";
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
        break;
      }
      case "token": {
        const matches = regExp.exec(fullOption);
        const options = matches[1].split(";");
        if (options[0] && isNaN(options[0])) {
          const tokenAdd = options[0];
          inner = `<icon class='your-land'>{misc-plus}{${tokenAdd}}</icon>`;
          splitOptions[i] = `add-token(${tokenAdd})`;
        } else {
          const range = options[0];
          const tokenAdd = options[1];
          inner = `<icon class='range-token'><div>{misc-plus}{${tokenAdd}}</div><div>{range-${range}}</div></icon>`;
          splitOptions[i] = `add-token(${range},and,${tokenAdd})`;
          addEnergyRing = false;
          addIconShadow = true;
        }
        break;
      }
      case "custom": {
        const matches = regExp.exec(fullOption);
        if (pnDebug) {
          console.log("Custom Node w/ Single Icon:" + fullOption);
          console.log(matches);
        }
        const custom_node = matches[1].split(";");
        // addEnergyRing = false;
        addIconShadow = true;
        if (custom_node[1]) {
          inner = "<custom-presence-track-icon>";
          if (custom_node[1].split("{")[1]) {
            // User is using icon shorthand
            inner += custom_node[1];
          } else {
            // User is not using icon shorthand
            for (let i = 1; i < custom_node.length; i++) {
              inner += `{${custom_node[i]}}`;
            }
          }
          inner += "</custom-presence-track-icon>";
        } else {
          inner = "<" + trackType + "-icon><value></value></" + trackType + "-icon>";
          addEnergyRing = false;
        }
        break;
      }
      case "move-presence": {
        const matches = regExp.exec(fullOption);
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
          if (addEnergyRing && splitOptions.length === 1) {
            addIconShadow = false;
          }
        }
        break;
      }
      case "elements":
      case "or": {
        const matches = regExp.exec(fullOption);
        const elementList = matches[1].split(";");
        let elementIcons = "";
        if (elementList.length === 2) {
          elementIcons += "<icon class='" + elementList[0] + " presence-or-first'></icon>";
          elementIcons += "{backslash}";
          elementIcons += "<icon class='" + elementList[1] + " presence-or-second'></icon>";
          inner = "<element-or-wrap>" + elementIcons + "</element-or-wrap>";
        } else {
          const iconText = matches[1];
          inner = "{" + iconText + "}";
        }
        if (option === "or") {
          splitOptions[i] = `or-presence(${elementList[0]},${elementList[1]})`;
        }
        break;
      }
      case "gain-range": {
        const matches = regExp.exec(fullOption);
        const gainRange = matches[1];
        const custom_node = gainRange.split(";");
        inner = "{gain-range-" + custom_node[0] + "}";
        addEnergyRing = false;
        addIconShadow = true;
        if (numLocs > 1) {
          inner = "<icon-shadow>" + inner + "</icon-shadow>";
        }
        break;
      }
      case "gain-card-play": {
        const matches = regExp.exec(fullOption);
        const gainPlays = matches ? matches[1] : 1;
        inner = "<card-play-num><value>" + gainPlays + "</value></card-play-num>";
        addEnergyRing = false;
        break;
      }
      case "damage": {
        const matches = regExp.exec(fullOption);
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
        addIconShadow = true;
        break;
      }
      case "gain-power-card": {
        const iconText = fullOption;
        const matches = regExp.exec(fullOption);
        if (matches) {
          inner = `<icon class='gain-power-card-blank'>{${matches[1]}}</icon>`;
        } else {
          inner = "{" + iconText + "}";
        }
        break;
      }
      case "take-power-card": {
        const iconText = fullOption;
        const matches = regExp.exec(fullOption);
        if (matches) {
          inner = `<icon class='take-power-card-blank'>{${matches[1]}}</icon>`;
        } else {
          inner = "{" + iconText + "}";
        }
        break;
      }
      case "reclaim": {
        const matches = regExp.exec(fullOption);
        if (matches) {
          const reclaimType = `reclaim-${matches[1]}`;
          inner += `{${reclaimType}}`;
        } else {
          inner += `{${fullOption}}`;
        }
        break;
      }
      case "blank": {
        addEnergyRing = false;
        addIconShadow = false;
        break;
      }
      case "sun":
      case "moon":
      case "air":
      case "fire":
      case "water":
      case "plant":
      case "earth":
      case "animal": {
        ttsInfo[3].push(option);
      }
      // eslint-disable-next-line no-fallthrough
      default: {
        const iconText = fullOption;
        inner = `{${iconText}}`;
        break;
      }
    }

    // placement
    if (splitOptions.length === 1) {
      innerFinal = inner;
    } else {
      const pos_angle = (i * 2 * Math.PI) / numLocs - Math.PI * (4.5 / 6);
      const x_loc = 0.4 * Math.cos(pos_angle) * 50 + 50;
      const y_loc = 0.4 * Math.sin(pos_angle) * 50 + 50;
      const track_icon_loc = `style='top:${y_loc.toPrecision(2)}%; left:${x_loc.toPrecision(2)}%;'`;
      let incShadow = "";
      if (addIconShadow) {
        incShadow = "class='add-shadow' ";
        addIconShadow = false;
      }
      innerFinal += `<presence-node-multi ${incShadow}${track_icon_loc}>${inner}</presence-node-multi>`;
    }
  }

  // subText - mostly handled in IconName
  // Find unique names and report multiples
  const nameCounts = {};
  splitOptions.forEach(function (x) {
    nameCounts[x] = (nameCounts[x] || 0) + 1;
  });
  let namesList = Object.keys(nameCounts);
  let countList = Object.values(nameCounts);
  subText = "";
  for (let i = 0; i < namesList.length; i++) {
    subText += IconName(namesList[i], countList[i]);
    if (i < namesList.length - 1) {
      subText += ", ";
    }
  }
  subTextFinal = subText;

  if (pnDebug) {
    console.log(
      "--Result-- Text:" +
        subTextFinal +
        ", Icon:" +
        innerFinal +
        ", addEnergyRing:" +
        addEnergyRing +
        ", addIconShadow: " +
        addIconShadow
    );
  }
  ttsInfo = ttsInfo.map((e) => e.join(",")).join(";");
  return [innerFinal, subTextFinal, addEnergyRing, addIconShadow, ttsInfo];
}

/* exported updatePresenceNodeIDs */
function updatePresenceNodeIDs() {
  const board = document.querySelectorAll("board")[0];
  console.log(board);
  const presenceTable = document.getElementById("presence-table");
  const energyTrack = document.getElementById("energy-track");
  const energyNodes = energyTrack.getElementsByTagName("presence-node");
  const playsTrack = document.getElementById("plays-track");
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

// Module-level constants for IconName — avoids per-call allocation
const _iconNameRegex = /\(([^)]+)\)/;
const _iconNameCache = new Map();
const _localizeElements = {
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
    copy: "Element you have at least 1 of",
  },
  fr: {
    sun: "Soleil",
    moon: "Lune",
    fire: "Feu",
    air: "Air",
    plant: "Flore",
    water: "Eau",
    earth: "Terre",
    animal: "Faune",
    star: "Elément",
    any: "Au choix",
    copy: "Elément dont vous avez au moins 1",
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
    copy: "Element, von dem du mindestens 1 hast",
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
    copy: "Żywioł, którego masz co najmniej 1",
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
    any: "أي",
    copy: "عنصر لديك واحد منه على الأقل",
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
    copy: "你至少有1個的元素",
  },
  hu: {
    sun: "Nap",
    moon: "Hold",
    fire: "Tűz",
    air: "Levegő",
    plant: "Növény",
    water: "Víz",
    earth: "Föld",
    animal: "Állat",
    star: "Elem",
    any: "Bármi",
    copy: "Elem, amiből legalább 1 van",
  },
  ko: {
    sun: "태양",
    moon: "달",
    fire: "불",
    air: "공기",
    plant: "식물",
    water: "물",
    earth: "흙",
    animal: "동물",
    star: "원소",
    any: "아무거나",
    copy: "최소 1개 있는 원소",
  },
  ja: {
    sun: "太陽",
    moon: "月",
    fire: "火",
    air: "空気",
    plant: "植物",
    water: "水",
    earth: "大地",
    animal: "動物",
    star: "エレメント",
    any: "任意",
    copy: "少なくとも1つ持っているエレメント",
  },
};
const _localizeCardTypes = {
  en: { major: "major", minor: "minor", unique: "unique" },
  fr: { major: "Majeur", minor: "Mineur", unique: "Unique" },
  de: { major: "Größere", minor: "Kleinere", unique: "Einzigartige" },
  pl: { major: "Większą", minor: "Mniejszą", unique: "Unikalną" },
  ar: { major: "كبرى", minor: "صغرى", unique: "فريدة" },
  zh: { major: "重要", minor: "次要", unique: "獨特" },
  hu: { major: "Nagyobb", minor: "Kisebb", unique: "Egyedi" },
  ko: { major: "메이저", minor: "마이너", unique: "고유" },
  ja: { major: "メジャー", minor: "マイナー", unique: "ユニーク" },
};
const _localizeTokens = {
  en: {
    explorer: "explorer",
    town: "town",
    city: "city",
    blight: "blight",
    beast: "beasts",
    beasts: "beasts",
    disease: "disease",
    wilds: "wilds",
    badland: "badlands",
    badlands: "badlands",
    strife: "strife",
    vitality: "vitality",
  },
  fr: {
    explorer: "Explorateur",
    town: "Village",
    city: "Ville",
    blight: "Désolation",
    beast: "Bêtes",
    beasts: "Bêtes",
    disease: "Maladie",
    wilds: "Ronces",
    badland: "Terres Hostiles",
    badlands: "Terres Hostiles",
    strife: "Discorde",
    vitality: "Vitalité",
  },
  de: {
    explorer: "Entdecker",
    town: "Siedlung",
    city: "Stadt",
    blight: "Seuche",
    beast: "Bestien",
    beasts: "Bestien",
    disease: "Krankheit",
    wilds: "Wildnis",
    badland: "Ödlande",
    badlands: "Ödlande",
    strife: "Zwist",
    vitality: "Lebenskraft",
  },
  pl: {
    explorer: "odkrywca",
    town: "miasteczko",
    city: "miasto",
    blight: "zaraźliwość",
    beast: "bestie",
    beasts: "bestie",
    disease: "choroba",
    wilds: "dzicz",
    badland: "pustkowia",
    badlands: "pustkowia",
    strife: "niezgoda",
    vitality: "witalność",
  },
  ar: {
    explorer: "مستكشف",
    town: "بلدة",
    city: "مدينة",
    blight: "آفة",
    beast: "وحوش",
    beasts: "وحوش",
    disease: "مرض",
    wilds: "برية",
    badland: "أرض قاحلة",
    badlands: "أراض قاحلة",
    strife: "صراع",
    vitality: "حيوية",
  },
  zh: {
    explorer: "探險者",
    town: "城鎮",
    city: "城市",
    blight: "荒疫",
    beast: "野獸",
    beasts: "野獸",
    disease: "疾病",
    wilds: "荒野",
    badland: "荒地",
    badlands: "荒地",
    strife: "紛爭",
    vitality: "活力",
  },
  hu: {
    explorer: "Felfedező",
    town: "Falu",
    city: "Város",
    blight: "Métely",
    beast: "Fenevad",
    beasts: "Fenevad",
    disease: "Betegség",
    wilds: "Vadon",
    badland: "Pusztaság",
    badlands: "Pusztaság",
    strife: "Viszály",
    vitality: "Vitalitás",
  },
  ko: {
    explorer: "탐험가",
    town: "마을",
    city: "도시",
    blight: "황폐",
    beast: "야수",
    beasts: "야수",
    disease: "질병",
    wilds: "야생",
    badland: "불모지",
    badlands: "불모지",
    strife: "분쟁",
    vitality: "활력",
  },
  ja: {
    explorer: "探検者",
    town: "町",
    city: "都市",
    blight: "荒廃",
    beast: "獣",
    beasts: "獣",
    disease: "病気",
    wilds: "荒野",
    badland: "荒れ地",
    badlands: "荒れ地",
    strife: "争い",
    vitality: "活力",
  },
};
const _localizeConjunctions = {
  en: { and: "and", or: "or", at: "at", from: "from" },
  fr: { and: "et", or: "ou", at: "à", from: "de" },
  de: { and: "und", or: "oder", at: "bei", from: "von" },
  pl: { and: "i", or: "lub", at: "w", from: "z" },
  ar: { and: "و", or: "أو", at: "في", from: "من" },
  zh: { and: "和", or: "或", at: "在", from: "從" },
  hu: { and: "és", or: "vagy", at: "-nál/-nél", from: "-ról/-ről" },
  ko: { and: "그리고", or: "또는", at: "에서", from: "에서" },
  ja: { and: "と", or: "または", at: "で", from: "から" },
};

function IconName(str, iconNum = 1) {
  const cacheKey = str + "|" + iconNum;
  if (_iconNameCache.has(cacheKey)) return _iconNameCache.get(cacheKey);
  let num = "";
  let txt = "";
  let opt3 = "";
  let opt4 = "";
  let options;
  let localize;
  let debug = false;

  // identify if 'str' contains options
  const matches = _iconNameRegex.exec(str);
  if (matches) {
    options = matches[1];
    if (options.includes(";")) {
      options = matches[1].split(";");
    } else {
      options = matches[1].split(",");
    }
    options = options.map((str) => str.trim());
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
  if (str && !isNaN(str) && isNaN(str[0])) {
    num = str[1];
    str = "increase-energy";
  }
  let plural = iconNum > 1 ? "s" : "";
  let subText;

  // handle icon name pre-fixes
  if (str.includes("incarna")) {
    str = str.replace("incarna", "");
    if (str.length === 0) {
      // if it was an incarna growth, we have to rebuild incarna.
      str = "incarna";
    }
  }
  if (str.includes("huge")) {
    str = str.replace("huge", "");
  }
  if (str.includes("large")) {
    str = str.replace("large", "");
  }
  if (str.includes("medium")) {
    str = str.replace("medium", "");
  }
  if (str.includes("small")) {
    str = str.replace("small", "");
  }
  if (str.includes("tiny")) {
    str = str.replace("tiny", "");
  }
  if (str.startsWith("-")) {
    str = str.replace("-", "");
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

  if (str.includes("/")) {
    // If it is a split icon, unsplit it.
    localize = {};
    subText = `${IconName(str.split("/")[0])}/${IconName(str.split("/")[1])}`;
    return subText;
  }

  switch (str) {
    case "presence":
      localize = {
        en: "Presence",
        fr: `Présence`,
        de: "Präsenz",
        pl: "Obecnością",
        ar: "حضور",
        zh: "你的靈跡",
        hu: "Jelenléted",
        ko: "현신",
        ja: `プレゼンス`,
      };
      subText = localize[lang];
      break;
    case "your-presence":
      localize = {
        en: "Your Presence",
        fr: `Votre Présence`,
        de: "Deine Präsenz",
        pl: "twoją Obecnością",
        ar: "حضورك",
        zh: "你的靈跡",
        hu: "Jelenléted",
        ko: "당신의 현신",
        ja: `あなたのプレゼンス`,
      };
      subText = localize[lang];
      break;
    case "incarna":
      if (num) {
        switch (num) {
          case "empower":
            localize = {
              en: "Empower Incarna",
              fr: `Renforcer Incarna`,
              de: "Incarna verstärken",
              pl: "Wzmocnij Inkarna",
              ar: `تمكين التجسد`,
              zh: `強化化身`,
              hu: "Megtestesülés Megerősítése",
              ko: `화신의 권능 활성화`,
              ja: `インカルナ強化`,
            };
            break;
          case "addmove":
          case "add-move": {
            const iconTxt = IconName(txt);
            const iconPresence = IconName("presence");
            localize = {
              en: !terrains.has(txt)
                ? `Add/Move Incarna to Land with ${iconTxt}`
                : `Add/Move Incarna to ${iconTxt}`,
              fr: !terrains.has(txt)
                ? `Ajoutez/Déplacez Incarna vers une Région avec ${iconTxt}`
                : `Ajoutez/Déplacez Incarna vers ${iconTxt}`,
              de: !terrains.has(txt)
                ? `Füge hinzu/Verschiebe Incarna in ein Gebiet mit ${iconTxt}`
                : `Füge hinzu/Verschiebe Incarna in ${iconTxt}`,
              pl: !terrains.has(txt)
                ? `Dodaj/Przenieś Inkarna do Krainy z ${iconTxt}`
                : `Dodaj/Przenieś Inkarna do Krainy z ${iconPresence}`,
              ar: !terrains.has(txt)
                ? `أضف/حرّك التجسد إلى أرض مع ${iconTxt}`
                : `أضف/حرّك التجسد إلى أرض مع ${iconPresence}`,
              zh: !terrains.has(txt)
                ? `添加/移動化身到有${iconTxt}的區域`
                : `添加/移動化身到有${iconPresence}的區域`,
              hu: !terrains.has(txt)
                ? `Megtestesülés Lerakása/Mozgatása egy területre, ahol van ${iconTxt}`
                : `Megtestesülés Lerakása/Mozgatása egy területre, ahol van ${iconPresence}`,
              ko: !terrains.has(txt)
                ? `${iconTxt}이 있는 지역에 화신 이동/추가`
                : `${iconPresence}이 있는 지역에 화신 이동/추가`,
              ja: !terrains.has(txt)
                ? `${iconTxt}がある土地にインカルナを追加/移動`
                : `${iconPresence}がある土地にインカルナを追加/移動`,
            };
            break;
          }
          case "replace": {
            const iconTxt = IconName(txt);
            localize = {
              en: `You may Replace ${iconTxt} with your Incarna`,
              fr: `Vous pouvez remplacer ${iconTxt} avec votre Incarna`,
              de: `Du darfst ${iconTxt} durch dein Incarna ersetzen`,
              pl: `Możesz Zamienić ${iconTxt} na twoje Inkarna`,
              ar: `يمكنك استبدال ${iconTxt} بتجسدك`,
              zh: `你可以用你的化身替換${iconTxt}`,
              hu: `Lecserélheted egy ${iconTxt}-ed a Megtestesülésedre`,
              ko: `${iconTxt} 1개를 당신의 화신으로 교체할 수 있다`,
              ja: `${iconTxt}をあなたのインカルナと交換できます`,
            };
            break;
          }
          case "move":
            localize = {
              en: "Move Incarna",
              fr: `Déplacez Incarna`,
              de: "Bewege Incarna",
              pl: "Przesuń Inkarna",
              ar: `حرّك التجسد`,
              zh: `移動化身`,
              hu: "Megtestesülés Mozgatása",
              ko: `화신 이동`,
              ja: `インカルナ移動`,
            };
            break;
          case "add-token": {
            const iconTxt = IconName(txt);
            localize = {
              en: `Add a ${iconTxt} at your Incarna`,
              fr: `Ajoutez un ${iconTxt} à votre Incarna`,
              de: `Füge ein ${iconTxt} zu deinem Incarna hinzu`,
              pl: `Dodaj ${iconTxt} na twoje Inkarna`,
              ar: `أضف ${iconTxt} عند تجسدك`,
              zh: `在你的化身處添加${iconTxt}`,
              hu: `Rakj le egy ${iconTxt}-t a Megtestesülésedre`,
              ko: `당신의 화신이 있는 지역에 ${iconTxt} 1개 추가`,
              ja: `あなたのインカルナに${iconTxt}を追加`,
            };
            break;
          }
          default:
            localize = {
              en: "Empower Incarna",
              fr: `Renforcer Incarna`,
              de: "Incarna verstärken",
              pl: "Wzmocnij Inkarna",
              ar: `تمكين التجسد`,
              zh: `強化化身`,
              hu: "Megtestesülés Megerősítése",
              ko: `화신의 권능 활성화`,
              ja: `インカルナ強化`,
            };
        }
      } else {
        localize = {
          en: "Your Incarna",
          fr: `Votre Incarna`,
          de: "Dein Incarna",
          pl: "Twoje Inkarna",
          ar: "تجسدك",
          zh: "你的化身",
          hu: "a Megtestesülésed",
          ko: `당신의 화신`,
          ja: `あなたのインカルナ`,
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
    case "energy-first":
      subText = `${Energy[lang]}/${Turn[lang]}`;
      break;
    case "energy-special":
      subText = `${num} ${Energy[lang]}`;
      break;
    case "plays":
      subText = `${num} ${num > 1 ? CardPlays[lang] : CardPlay[lang]}`;
      break;
    case "plays-special":
      subText = `${num} ${num > 1 ? CardPlays[lang] : CardPlay[lang]}`;
      break;
    case "plays-first":
      subText = `${CardPlays[lang]}`;
      break;
    case "add-presence":
      if (num === "any" && options.length === 1) {
        localize = {
          en: `Add a Presence to any Land`,
          fr: `Ajoutez une Présence sur n'importe quelle Région`,
          de: `Füge eine Präsenz auf einem beliebigen Land hinzu`,
          pl: `Dodaj Obecność do dowolnej Krainy`,
          ar: `أضف حضوراً إلى أي أرض`,
          zh: `添加靈跡到任意區域`,
          hu: `Jelenlét lerakása`,
          ko: `원하는 지역에 현신 1개 추가`,
          ja: `任意の土地にプレゼンスを追加`,
        };
        subText = localize[lang];
      } else if (options.length > 1) {
        if (txt === "text") {
          // User wants a custom text presence addition
          localize = {
            en: `Add a Presence ${opt3}`,
            fr: `Ajoutez une Présence ${opt3}`,
            de: `Füge eine Präsenz hinzu ${opt3}`,
            pl: `Dodaj Obecność ${opt3}`,
            ar: `أضف حضوراً ${opt3}`,
            zh: `添加靈跡 ${opt3}`,
            hu: `Jelenlét lerakása ${opt3}`,
            ko: `${opt3}에 현신 1개 추가`,
            ja: `プレゼンスを追加 ${opt3}`,
          };
          subText = localize[lang];
        } else if (txt === "relative") {
          let preposition = "at";
          if (num > 0) {
            preposition = "from";
          }
          const iconPreposition = IconName(preposition);
          const iconOpt3 = IconName(opt3);
          localize = {
            en: `Add a Presence ${iconPreposition} ${iconOpt3}`,
            fr: `Ajoutez une Présence ${iconPreposition} ${iconOpt3}`,
            de: `Füge eine Präsenz ${iconPreposition} ${iconOpt3} hinzu`,
            pl: `Dodaj Obecność ${iconPreposition} ${iconOpt3}`,
            ar: `أضف حضوراً ${iconPreposition} ${iconOpt3}`,
            zh: `添加靈跡 ${iconPreposition} ${iconOpt3}`,
            hu: `Jelenlét lerakása ${iconPreposition} ${iconOpt3}`,
            ko: `${iconOpt3}${iconPreposition} 현신 1개 추가`,
            ja: `${iconOpt3} ${iconPreposition} プレゼンスを追加`,
          };
          subText = localize[lang];
        } else if (txt === "token") {
          // User wants to add a token in growth
          switch (opt4) {
            case "and": {
              //add presence and token
              const iconOpt3 = IconName(opt3);
              localize = {
                en: `Add a Presence and a ${iconOpt3}`,
                fr: `Ajoutez une Présence et un ${iconOpt3}`,
                de: `Füge eine Präsenz und ein ${iconOpt3} hinzu`,
                pl: `Dodaj Obecność i ${iconOpt3}`,
                ar: `أضف حضوراً و ${iconOpt3}`,
                zh: `添加靈跡和${iconOpt3}`,
                hu: `Jelenlét és ${iconOpt3} lerakása`,
                ko: `현신 1개 및 ${iconOpt3} 1개 추가`,
                ja: `プレゼンスと${iconOpt3}を追加`,
              };
              break;
            }
            case "or": {
              //add presence or token
              const iconOpt3 = IconName(opt3);
              localize = {
                en: `Add a Presence or a ${iconOpt3}`,
                fr: `Ajoutez une Présence ou un ${iconOpt3}`,
                de: `Füge eine Präsenh oder eine ${iconOpt3} hinzu`,
                pl: `Dodaj Obecność lub ${iconOpt3}`,
                ar: `أضف حضوراً أو ${iconOpt3}`,
                zh: `添加靈跡或${iconOpt3}`,
                hu: `Jelenlét vagy ${iconOpt3} lerakása`,
                ko: `현신 1개 혹은 ${iconOpt3} 1개 추가`,
                ja: `プレゼンスまたは${iconOpt3}を追加`,
              };
              break;
            }
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
            operator = options.at(-1).toLowerCase() === "or" ? "/" : " & ";
          } else {
            operator = ` ${IconName(options.at(-1))} `; //looking for 'or' or 'and'
          }
          localize = {
            en: num === "any" ? `Add a Presence to any ` : `Add a Presence to `,
            fr:
              num === "any" ? `Ajoutez une Présence à n'importe quel ` : `Ajoutez une Présence à `,
            de: num === "any" ? `Ergänze um eine Präsenz ` : `Füge eine Präsenz hinzu `,
            pl: num === "any" ? `Dodaj Obecność do dowolnej ` : `Dodaj Obecność do `,
            ar: num === "any" ? `أضف حضوراً إلى أي ` : `أضف حضوراً إلى `,
            zh: num === "any" ? `添加靈跡到任意` : `添加靈跡到`,
            hu: num === "any" ? `Jelenlét lerakása bármely ` : `Jelenlét lerakása `,
            ko: num === "any" ? `아무 대지에 현신 1개 추가 ` : ` 대지에 현신 1개 추가 `,
            ja: num === "any" ? `任意の土地にプレゼンスを追加 ` : `プレゼンスを追加 `,
          };
          subText = localize[lang];

          let landwith = 1; // This flag is used to figure out if 'land with' has been said already. It comes up with add-presence(3,jungle,beasts,or)
          for (let i = 1; i < options.length; i++) {
            // Check to see if we've reached an 'or' or 'and', which shouldn't be parsed
            let req = options[i];
            if (req.toLowerCase() === "presence") {
              req = `your-presence`;
            }
            if (req.toLowerCase() === "or" || req.toLowerCase() === "and") {
              break;
            } else if (i > 1) {
              subText += operator;
            }

            if (req.startsWith("no-")) {
              const iconReqSub = IconName(req.substring(3));
              localize = {
                en: landwith ? `Land without ${iconReqSub} ` : `no ${iconReqSub} `,
                fr: landwith ? `Région sans ${iconReqSub} ` : `aucun ${iconReqSub} `,
                de: landwith ? `Land ohne ${iconReqSub} ` : `keine ${iconReqSub} `,
                pl: landwith ? `Kraina bez ${iconReqSub} ` : `bez ${iconReqSub} `,
                ar: landwith ? `أرض بدون ${iconReqSub} ` : `بدون ${iconReqSub} `,
                zh: landwith ? `沒有${iconReqSub}的區域 ` : `沒有${iconReqSub} `,
                hu: landwith ? `${iconReqSub} nélküli terület ` : `${iconReqSub} nélküli `,
                ko: landwith ? `${iconReqSub}가 없는 지역 ` : `${iconReqSub} 없음 `,
                ja: landwith ? `${iconReqSub}のない土地 ` : `${iconReqSub}なし `,
              };
              subText += localize[lang];
              landwith = 0;
            } else if (terrainTypes.has(req)) {
              subText += `${IconName(req + "-land")} `;
            } else if (terrains.has(req)) {
              subText += `${IconName(req)} `;
            } else {
              const iconReq = IconName(req);
              localize = {
                en: landwith ? `Land with ${iconReq}` : `${iconReq}`,
                fr: landwith ? `Région avec ${iconReq}` : `${iconReq}`,
                de: landwith ? `Land mit ${iconReq}` : `${iconReq}`,
                pl: landwith ? `Kraina z ${iconReq}` : `${iconReq}`,
                ar: landwith ? `أرض مع ${iconReq}` : `${iconReq}`,
                zh: landwith ? `有${iconReq}的區域` : `${iconReq}`,
                hu: landwith ? `, ahol van ${iconReq}` : `${iconReq}`,
                ko: landwith ? `${iconReq}가 있는 지역` : `${iconReq}`,
                ja: landwith ? `${iconReq}がある土地` : `${iconReq}`,
              };
              subText += localize[lang];
              landwith = 0;
            }
          }
        }
      } else {
        localize = {
          en: `Add a Presence`,
          fr: `Ajoutez une Présence`,
          de: `Füge eine Präsenz hinzu`,
          pl: `Dodaj Obecność`,
          ar: `أضف حضوراً`,
          zh: `添加靈跡`,
          hu: `Jelenlét lerakása`,
          ko: `현신 1개 추가`,
          ja: `プレゼンスを追加`,
        };
        subText = localize[lang];
      }
      // variable range
      if (isNaN(num) && num !== "any") {
        const iconNum = IconName(num);
        localize = {
          en: elementNames.has(num)
            ? ` at Range equal to ${iconNum} Showing`
            : ` at Range ${iconNum}`,
          fr: elementNames.has(num)
            ? ` à Portée égale aux ${iconNum} Présents`
            : ` à Portée ${iconNum}`,
          de: elementNames.has(num)
            ? ` mit Reichweite gleich ausliegender ${iconNum}`
            : ` mit Reichweite ${iconNum}`,
          pl: elementNames.has(num)
            ? ` w Zasięgu równym widocznym ${iconNum}`
            : ` w Zasięgu ${iconNum}`,
          ar: elementNames.has(num) ? ` في مدى يساوي ${iconNum} الظاهرة` : ` في مدى ${iconNum}`,
          zh: elementNames.has(num) ? ` 距離等於顯示的${iconNum}` : ` 距離${iconNum}`,
          hu: elementNames.has(num)
            ? ` a látható ${iconNum}-nek megfelelő távolságra`
            : ` ${iconNum} távolságra`,
          ko: elementNames.has(num) ? ` ${iconNum} 표시와 동일한 거리에` : ` 거리 ${iconNum}에`,
          ja: elementNames.has(num) ? ` 表示されている${iconNum}と同じ距離で` : ` 距離${iconNum}で`,
        };
        subText = subText + localize[lang];
      }
      break;
    case "gain-element":
      // Growth
      if (txt && !isNaN(txt)) {
        const iconNumTxt = IconName(num, txt);
        localize = {
          en: `Gain ${iconNumTxt}`,
          fr: `Gagnez ${iconNumTxt}`,
          de: `Erhalte ${iconNumTxt}`,
          pl: `Zyskaj ${iconNumTxt}`,
          ar: `احصل على ${iconNumTxt}`,
          zh: `獲得${iconNumTxt}`,
          hu: `${iconNumTxt} szerzése`,
          ko: `${iconNumTxt} 획득`,
          ja: `${iconNumTxt}を獲得`,
        };
      } else if (options.at(-1).toLowerCase() === "and") {
        localize = {
          en: `Gain ${ListLocalize(options.slice(0, -1))}`,
          fr: `Gagnez ${ListLocalize(options.slice(0, -1))}`,
          de: `Erhalte ${ListLocalize(options.slice(0, -1))}`,
          pl: `Zyskaj ${ListLocalize(options.slice(0, -1))}`,
          ar: `احصل على ${ListLocalize(options.slice(0, -1))}`,
          zh: `獲得${ListLocalize(options.slice(0, -1))}`,
          hu: `${ListLocalize(options.slice(0, -1))} szerzése`,
          ko: `${ListLocalize(options.slice(0, -1))} 획득`,
          ja: `${ListLocalize(options.slice(0, -1))}を獲得`,
        };
      } else {
        localize = {
          en: `Gain ${ListLocalize(options, "or")}`,
          fr: `Gagnez ${ListLocalize(options, "or")}`,
          de: `Erhalte ${ListLocalize(options, "or")}`,
          pl: `Zyskaj ${ListLocalize(options, "lub")}`,
          ar: `احصل على ${ListLocalize(options, "or")}`,
          zh: `獲得${ListLocalize(options, "or")}`,
          hu: `${ListLocalize(options, "or")} szerzése`,
          ko: `${ListLocalize(options, "or")} 획득`,
          ja: `${ListLocalize(options, "or")}を獲得`,
        };
      }
      subText = localize[lang];
      break;
    case "elements":
    case "or-presence":
      localize = {
        en: "OR",
        fr: `OU`,
        de: "ODER",
        pl: "ALBO",
        ar: "أو",
        zh: "或",
        hu: `VAGY`,
        ko: `혹은`,
        ja: `または`,
      };
      subText = `${IconName(num)} ${localize[lang]} ${IconName(txt)}`;
      break;
    case "gain-power-card":
      if (txt) {
        let numName = IconName(num);
        localize = {
          en: `Gain ${numName} Power Card ${txt}`,
          fr: `Gagnez ${numName} Carte Pouvoir ${txt}`,
          de: "Fähigkeiten-karte erhalten",
          pl: `Pozyskaj ${numName} Kartę Mocy ${txt}`,
          ar: `احصل على بطاقة قوة ${numName} ${txt}`,
          zh: `獲得${numName}法術牌${txt}`,
          hu: `${numName} Erőkártya szerzése ${txt}`,
          ko: `${txt} 능력 카드 ${numName}장 획득`,
          ja: `${numName} パワーカード獲得 ${txt}`,
        };
      } else if (num) {
        let numName = IconName(num);
        localize = {
          en: `Gain ${numName} Power Card`,
          fr: `Gagnez ${numName} Carte Pouvoir`,
          de: "Fähigkeiten-karte erhalten",
          pl: "Pozyskaj Kartę Mocy",
          ar: `احصل على بطاقة قوة ${numName}`,
          zh: `獲得${numName}法術牌`,
          hu: `${numName} Erőkártya szerzése`,
          ko: `능력 카드 ${numName}장 획득`,
          ja: `${numName} パワーカード獲得`,
        };
      } else {
        localize = {
          en: "Gain Power Card",
          fr: `Gagnez Carte Pouvoir`,
          de: "Fähigkeiten-karte erhalten",
          pl: "Pozyskaj Kartę Mocy",
          ar: "احصل على بطاقة قوة",
          zh: "獲得法術牌",
          hu: "Erőkártya szerzése",
          ko: "능력 카드 획득",
          ja: `パワーカード獲得`,
        };
      }
      subText = localize[lang];
      break;
    case "take-power-card":
      if (txt) {
        let numName = IconName(num);
        localize = {
          en: `Take ${numName} Power Card ${txt}`,
          fr: `Prenez ${numName} Carte Pouvoir ${txt}`,
          de: "Fähigkeiten-karte nehmen",
          pl: "Weź Kartę Mocy",
          ar: `خذ بطاقة قوة ${numName} ${txt}`,
          zh: `拿取${numName}法術牌${txt}`,
          hu: `${numName} Erőkártya elvétele ${txt}`,
          ko: `${txt} 능력 카드 ${numName}장 가져오기`,
          ja: `${numName} パワーカードを取る ${txt}`,
        };
      } else if (num) {
        let numName = IconName(num);
        localize = {
          en: `Take ${numName} Power Card`,
          fr: `Prenez ${numName} Carte Pouvoir`,
          de: "Fähigkeiten-karte nehmen",
          pl: "Weź Kartę Mocy",
          ar: `خذ بطاقة قوة ${numName}`,
          zh: `拿取${numName}法術牌`,
          hu: `${numName} Erőkártya elvétele`,
          ko: `능력 카드 ${numName}장 가져오기`,
          ja: `${numName} パワーカードを取る`,
        };
      } else {
        localize = {
          en: "Take Power Card",
          fr: `Prenez Carte Pouvoir`,
          de: "Fähigkeiten-karte nehmen",
          pl: "Weź Kartę Mocy",
          ar: "خذ بطاقة قوة",
          zh: "拿取法術牌",
          hu: "Erőkártya elvétele",
          ko: `능력 카드 가져오기`,
          ja: `パワーカードを取る`,
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
            fr: `Gagnez ${txt} Energie par ${opt4}`,
            de: `Erhalte ${txt} Energie pro ${opt4} `,
            pl: `+${txt} Energii za każde ${opt4}`,
            ar: `احصل على ${txt} طاقة لكل ${opt4}`,
            zh: `每個${opt4}獲得${txt}能量`,
            hu: `Szerzel ${txt} Energiát minden ${opt4} után`,
            ko: `${opt4}마다 ${txt} 에너지 획득`,
            ja: `${opt4}ごとに${txt}エネルギーを獲得`,
          };
        } else {
          // custom text, with flat energy
          localize = {
            en: `Gain ${num} Energy and +${txt} more per ${opt4}`,
            fr: `Gagnez ${num} Energie et +${txt} plus par ${opt4}`,
            de: `Erhalte ${num} Energie und +${txt} mehr pro ${opt4}`,
            pl: `+${num} Energii. +${txt} za każde ${opt4}`,
            ar: `احصل على ${num} طاقة و+${txt} إضافية لكل ${opt4}`,
            zh: `獲得${num}能量，每個${opt4}額外+${txt}`,
            hu: `Szerzel ${num} Energiát és +${txt}-t minden ${opt4} után`,
            ko: `${num} 에너지 획득, ${txt} ${opt4}마다 1씩 추가 획득`,
            ja: `${num}エネルギーを獲得し、${opt4}ごとに+${txt}追加`,
          };
        }
      } else if (opt3) {
        const perIcon = IconName(opt3);
        if (num === 0 || num === "0") {
          // scaling, no flat energy
          localize = {
            en: elementNames.has(opt3)
              ? `Gain ${txt} Energy per ${perIcon} Showing`
              : `Gain ${txt} Energy per ${perIcon}`,
            fr: elementNames.has(opt3)
              ? `Gagnez ${txt} Energie par ${perIcon} Présent`
              : `Gagnez ${txt} Energie par ${perIcon}`,
            de: elementNames.has(opt3)
              ? `Erhalte ${txt} Energie pro ausliegendem ${perIcon}`
              : `Erhalte ${txt} Energie pro ${perIcon}`,
            pl: elementNames.has(opt3)
              ? `+${txt} Energii za każdy widoczny ${perIcon}`
              : `+${txt} Energii za każdy ${perIcon}`,
            ar: elementNames.has(opt3)
              ? `احصل على ${txt} طاقة لكل ${perIcon} ظاهر`
              : `احصل على ${txt} طاقة لكل ${perIcon}`,
            zh: elementNames.has(opt3)
              ? `每個顯示的${perIcon}獲得${txt}能量`
              : `每個${perIcon}獲得${txt}能量`,
            hu: elementNames.has(opt3)
              ? `Szerzel ${txt} Energiát minden látható ${perIcon} után`
              : `Szerzel ${txt} Energiát minden ${perIcon} után`,
            ko: elementNames.has(opt3)
              ? `표시된 ${perIcon}당 ${txt} 에너지 획득`
              : `${perIcon}당 ${txt} 에너지 획득`,
            ja: elementNames.has(opt3)
              ? `表示されている${perIcon}ごとに${txt}エネルギーを獲得`
              : `${perIcon}ごとに${txt}エネルギーを獲得`,
          };
        } else {
          // scaling w/ flat energy
          localize = {
            en: elementNames.has(opt3)
              ? `Gain ${num} Energy and +${txt} more per ${perIcon} Showing`
              : `Gain ${num} Energy and +${txt} more per ${perIcon}`,
            fr: elementNames.has(opt3)
              ? `Gagnez ${num} Energie et +${txt} plus par ${perIcon} Présent`
              : `Gagnez ${num} Energie et +${txt} plus par ${perIcon}`,
            de: elementNames.has(opt3)
              ? `Erhalte ${num} Energie und +${txt} mehr pro ausliegender ${perIcon} `
              : `Erhalte ${num} Energie und +${txt} mehr pro ${perIcon}`,
            pl: elementNames.has(opt3)
              ? `+${num} Energii i +${txt} za każdy widoczny ${perIcon}`
              : `+${num} Energii i +${txt} za każdy ${perIcon}`,
            ar: elementNames.has(opt3)
              ? `احصل على ${num} طاقة و+${txt} إضافية لكل ${perIcon} ظاهر`
              : `احصل على ${num} طاقة و+${txt} إضافية لكل ${perIcon}`,
            zh: elementNames.has(opt3)
              ? `獲得${num}能量，每個顯示的${perIcon}額外+${txt}`
              : `獲得${num}能量，每個${perIcon}額外+${txt}`,
            hu: elementNames.has(opt3)
              ? `Szerzel ${num} Energiát és +${txt} minden látható ${perIcon} után`
              : `Szerzel ${num} Energiát és +${txt}-t minden ${perIcon} után`,
            ko: elementNames.has(opt3)
              ? `${num} 에너지 획득 및 표시된 ${perIcon}당 +${txt} 추가`
              : `${num} 에너지 획득 및 ${perIcon}당 +${txt} 추가`,
            ja: elementNames.has(opt3)
              ? `${num}エネルギーを獲得し、表示されている${perIcon}ごとに+${txt}追加`
              : `${num}エネルギーを獲得し、${perIcon}ごとに+${txt}追加`,
          };
        }
      } else {
        // flat energy
        localize = {
          en: `Gain Energy`,
          fr: `Gagnez Energie`,
          de: `Erhalte Energie`,
          pl: `Zbierz Energię`,
          ar: `احصل على طاقة`,
          zh: `獲得能量`,
          hu: `Energia szerzése`,
          ko: `에너지 획득`,
          ja: `エネルギーを獲得`,
        };
      }
      subText = localize[lang];
      break;
    case "gain-card-play":
      subText =
        num && num > 1
          ? `+${num} ${CardPlays[lang]}/${Turn[lang]}`
          : `+1 ${CardPlay[lang]}/${Turn[lang]}`;
      break;
    case "growth-gain-card-play":
      num = num || 1;
      localize = {
        en: num > 1 ? ` +${num} Card Plays this turn` : ` +${num} Card Play this turn`,
        fr: num > 1 ? ` +${num} Cartes jouées ce tour` : ` +${num} Cartes jouées ce tour`,
        de: num > 1 ? "Karte ausspielen" : "Karte ausspielen",
        pl: num > 1 ? "Zagrane Karty" : "Zagraj jedną",
        ar: num > 1 ? ` +${num} استخدامات البطاقة هذا الدور` : ` +${num} استخدام البطاقة هذا الدور`,
        zh: num > 1 ? ` +${num}張卡牌使用次數本回合` : ` +${num}張卡牌使用次數本回合`,
        hu:
          num > 1
            ? ` +${num} kijátszható kártya ebben a fordulóban`
            : ` +${num} kijátszható kártya ebben a fordulóban`,
        ko: num > 1 ? ` 이번 차례에 카드 사용 횟수 +${num}` : ` 이번 차례에 카드 사용 횟수 +${num}`,
        ja: num > 1 ? ` +${num} 今ターンのカードプレイ` : ` +${num} 今ターンのカードプレイ`,
      };
      subText = localize[lang];
      break;
    case "reclaim-all":
    case "reclaim":
      if (txt) {
        const iconTxt = IconName(txt);
        if (elementNames.has(txt)) {
          localize = {
            en: "Reclaim All Cards with " + iconTxt,
            fr: "Récupérez toutes les Cartes avec " + iconTxt,
            de: "Nimm alle Karten wieder auf " + iconTxt,
            pl: "Odzyskaj wszystkie Karty z " + iconTxt,
            ar: "استعد جميع البطاقات مع " + iconTxt,
            zh: "回收所有有" + iconTxt + "的法術牌",
            hu: "Kártyák visszavétele, amin van " + iconTxt,
            ko: iconTxt + "능력 카드 모두 회수 ",
            ja: iconTxt + "を持つすべてのカードを回収",
          };
        } else {
          // non-english need translation updates
          localize = {
            en: `Reclaim All ${iconTxt} Cards`,
            fr: "Récupérez toutes les Cartes avec " + iconTxt,
            de: "Nimm alle Karten wieder auf " + iconTxt,
            pl: "Odzyskaj wszystkie Karty z " + iconTxt,
            ar: "استعد جميع البطاقات مع " + iconTxt,
            zh: "回收所有有" + iconTxt + "的法術牌",
            hu: "Kártyák visszavétele, amin van " + iconTxt,
            ko: iconTxt + "능력 카드 모두 회수 ",
            ja: iconTxt + "を持つすべてのカードを回収",
          };
        }
      } else {
        localize = {
          en: "Reclaim Cards",
          fr: `Récupérez les Cartes`,
          de: "Alle Karten wiedererlangen",
          pl: "Odzyskaj Karty",
          ar: "استعد البطاقات",
          zh: "回收法術牌",
          hu: "Kártyák visszavétele",
          ko: `카드 회수`,
          ja: `カードを回収`,
        };
      }
      subText = localize[lang];
      break;
    case "reclaim-one":
      if (txt) {
        const iconTxt = IconName(txt);
        if (elementNames.has(txt)) {
          localize = {
            en: "Reclaim One Card with " + iconTxt,
            fr: "Récupérer une Carte avec " + iconTxt,
            de: "Nimm eine Karte mit wieder auf " + iconTxt,
            pl: "Odzyskaj Jedną Kartę z " + iconTxt,
            ar: "استعد بطاقة واحدة مع " + iconTxt,
            zh: "回收1張有" + iconTxt + "的法術牌",
            hu: "Egy Erőkártya visszavétele, amin van " + iconTxt,
            ko: iconTxt + "카드 1장 회수",
            ja: iconTxt + "を持つカード1枚を回収",
          };
        } else {
          localize = {
            // non-english need translation updates
            en: `Reclaim One ${iconTxt} Card`,
            fr: "Récupérer une Carte avec " + iconTxt,
            de: "Nimm eine Karte mit wieder auf " + iconTxt,
            pl: "Odzyskaj Jedną Kartę z " + iconTxt,
            ar: "استعد بطاقة واحدة مع " + iconTxt,
            zh: "回收1張有" + iconTxt + "的法術牌",
            hu: "Egy Erőkártya visszavétele, amin van " + iconTxt,
            ko: iconTxt + "카드 1장 회수",
            ja: iconTxt + "を持つカード1枚を回収",
          };
        }
      } else {
        localize = {
          en: "Reclaim One",
          fr: "Récupérer une Carte",
          de: "1 Karte wiedererlangen",
          pl: "Odzyskaj Jedną",
          ar: "استعد بطاقة واحدة",
          zh: "回收1張法術牌",
          hu: "Egy Erőkártya visszavétele",
          ko: `카드 1장 회수`,
          ja: `カード1枚を回収`,
        };
      }
      subText = localize[lang];
      break;
    case "reclaim-half":
      localize = {
        en: "Reclaim Half <em>(round up)</em>",
        fr: "Récupérez la moitié <em>(arrondi vers le haut)</em>",
        de: "Hälfte der Karten wiedererlangen",
        pl: "Odzyskaj połowę <em>(zaokrąglając w górę)</em>",
        ar: "استعد النصف <em>(تقريب للأعلى)</em>",
        zh: "回收一半法術牌<em>(向上取整)</em>",
        hu: "Erőkártyák felének visszavétele <em>(felfelé kerekítve)</em>",
        ko: "카드 절반 회수 <em>(올림)</em>",
        ja: `半分回収 <em>(切り上げ)</em>`,
      };
      subText = localize[lang];
      break;
    case "reclaim-custom":
      localize = {
        en: "Reclaim " + txt,
        fr: "Récupérez " + txt,
        de: "Karten wiedererlangen " + txt,
        pl: "Odzyskaj " + txt,
        ar: "استعد " + txt,
        zh: "回收" + txt,
        hu: txt + " visszavétele",
        ko: txt + " 카드 회수",
        ja: txt + "を回収",
      };
      subText = localize[lang];
      break;
    case "forget-power-card":
      localize = {
        en: "Forget Power Card",
        fr: "Oubliez des Cartes Pouvoir",
        de: "Fähigkeiten-karte vergessen",
        pl: "Zapomnij Kartę Mocy",
        ar: "انسَ بطاقة القوة",
        zh: "遺忘法術牌",
        hu: "Erőkártya elfelejtése",
        ko: `카드 1장 망각`,
        ja: `パワーカードを忘れる`,
      };
      subText = localize[lang];
      break;
    case "discard":
      if (num) {
        localize = {
          en: "Discard a Power Card with " + num,
          fr: "Défaussez une Carte Pouvoir avec " + num,
          de: "Wirf eine Fähigkeiten-karte ab mit " + num,
          pl: "Odrzuć 1 Kartę Mocy z " + num,
          ar: "تخلص من بطاقة قوة مع " + num,
          zh: "棄置有" + num + "的法術牌",
          hu: "Erőkártya eldobása, amin van " + num,
          ko: "능력 카드" + num + "장을 버리기",
          ja: num + "を持つパワーカードを捨てる",
        };
      } else {
        localize = {
          en: "Discard a Card",
          fr: "Défaussez une Carte",
          de: "1 Fähigkeiten-karte abwerfen",
          pl: "Odrzuć 1 Kartę Mocy",
          ar: "تخلص من بطاقة",
          zh: "棄置1張法術牌",
          hu: "Erőkártya eldobása",
          ko: "능력 카드 1장 버리기",
          ja: `カードを捨てる`,
        };
      }
      subText = localize[lang];
      break;
    case "destroy-presence":
      num = num ? num : 1;
      localize = {
        en: `Destroy ${num} of your Presence`,
        fr: `Détruisez ${num} de votre Présence`,
        de: "Zerstöre 1 deiner Präsenzen",
        pl: "Zniszcz 1 ze swoich Obecności",
        ar: `دمّر ${num} من حضورك`,
        zh: `摧毀${num}個你的靈跡`,
        hu: `${num} Jelenléted Elpusztítása`,
        ko: "현신 ${num}개 파괴",
        ja: `あなたのプレゼンス${num}個を破壊`,
      };
      subText = localize[lang];
      break;
    case "destroyed-presence":
      localize = {
        en: "Destroyed Presence",
        fr: "Destruisez la Présence",
        de: "Zerstörte Präsenz",
        pl: "Zniszczona Obecność",
        ar: "حضور مدمّر",
        zh: "被摧毀的靈跡",
        hu: "Elpusztított Jelenlét",
        ko: "파괴된 현신",
        ja: `破壊されたプレゼンス`,
      };
      if (iconNum > 1) {
        localize = {
          en: "up to " + iconNum + " Destroyed Presence",
          fr: "jusqu'à " + iconNum + " Présence Détruite",
          de: "bis zu " + iconNum + " zerstörte Präsenz",
          pl: "do " + iconNum + " Zniszczonych Obecności",
          ar: "حتى " + iconNum + " حضور مدمّر",
          zh: "至多" + (numLocalize[lang][iconNum] || iconNum) + " 被摧毀的靈跡",
          hu: "legfeljebb " + iconNum + " Elpusztított Jelenlét",
          ko: "파괴된 현신을" + iconNum + "개까지",
          ja: `最大` + iconNum + `個の破壊されたプレゼンス`,
        };
      }
      subText = localize[lang];
      break;
    case "make-fast":
      localize = {
        en: "One of your Powers may be Fast",
        fr: "Un de vos Pouvoirs peut être Rapide",
        de: "Eine deiner Fähigkeiten darf schnell sein",
        pl: "Jedna z twoich Mocy może być Szybka",
        ar: "يمكن أن تكون إحدى قواك سريعة",
        zh: "可以將你的一個法術改為快速",
        hu: "Egy Erőd ehet Gyors",
        ko: "당신의 능력 1개를 빠른 능력으로 간주",
        ja: `あなたのパワーの1つを高速にできます`,
      };
      subText = localize[lang];
      break;
    case "gain-card-pay-2":
      localize = {
        en: "Pay 2 Energy to Gain a Power Card",
        fr: "Payez 2 Energie pour Gagnez une Carte Pouvoir",
        de: "Zahle 2 Energie, um 1 Fähigkeiten-karte zu erlangen",
        pl: "Wydaj 2 Energii, by Pozyskać Kartę Mocy",
        ar: "ادفع 2 طاقة للحصول على بطاقة قوة",
        zh: "支付2能量以獲得1張法術牌",
        hu: "Fizess 2 Energiát, hogy szerezz 1 Erőkártyát",
        ko: "에너지 2를 지불해서 능력 카드 1장 획득",
        ja: `エネルギー2を支払ってパワーカードを獲得`,
      };
      subText = localize[lang];
      break;
    case "ignore-range":
      localize = {
        en: "You may ignore Range this turn",
        fr: "Vous pouvez ignorer la Portée ce tour-ci",
        de: "Ignoriere diese Runde Reichweite",
        pl: "W tej turze możesz ignorować Zasięg Mocy",
        ar: "يمكنك تجاهل المدى هذا الدور",
        zh: "這回合你可以無視距離上限",
        hu: "A távolságokat figyelmen kívül hagyhatod ebben a fordulóban",
        ko: "이번 차례에 사정거리 무시 가능",
        ja: `今ターンは距離を無視できます`,
      };
      subText = localize[lang];
      break;
    case "markerplus":
      localize = {
        en: "Prepare " + iconNum + " Element Marker" + plural,
        fr: "Preparez " + iconNum + " Marqueur d'Element" + plural,
        de: iconNum + " Element-Marker vorbereiten",
        pl:
          iconNum > 1
            ? "Przygotuj " + iconNum + " Znaczników Żywiołów"
            : "Przygotuj 1 Znacznik Żywiołów",
        ar: "جهّز " + iconNum + " علامة عنصر" + plural,
        zh: "準備" + iconNum + "個元素標記" + plural,
        hu: "Készíts elő " + iconNum + " Elemjelzőt" + plural,
        ko: "원소 마커" + iconNum + "개 준비",
        ja: iconNum + "個のエレメントマーカーを準備" + plural,
      };
      subText = localize[lang];
      break;
    case "markerminus":
      localize = {
        en: "Discard " + iconNum + " Element Marker" + plural,
        fr: "Défaussez " + iconNum + " Marqueur d'Element" + plural,
        de: iconNum + " Element-Marker ablegen",
        pl:
          iconNum > 1 ? "Odrzuć " + iconNum + " Znaczników Żywiołów" : "Odrzuć 1 Znacznik Żywiołów",
        ar: "تخلص من " + iconNum + " علامة عنصر" + plural,
        zh: "棄置" + iconNum + "個元素標記" + plural,
        hu: "Dobj el " + iconNum + " Elemjelzőt" + plural,
        ko: "원소 마커" + iconNum + "개 버리기",
        ja: iconNum + "個のエレメントマーカーを捨てる" + plural,
      };
      subText = localize[lang];
      break;
    case "isolate":
      if (num) {
        localize = {
          en: "Isolate a Land",
          fr: "Isolez une Région",
          de: "Isoliere ein Land",
          pl: "Izoluj Krainę",
          ar: "اعزل أرضاً",
          zh: "隔離一個區域",
          hu: "Izolálj egy területet",
          ko: "대상 지역을 고립시킨다",
          ja: `土地1つを孤立させる`,
        };
      } else {
        localize = {
          en: "Isolate " + iconNum + " of your Lands",
          fr: "Isolez " + iconNum + " de vos Régions",
          de: iconNum + " deiner Gebiete isolieren",
          pl: iconNum > 1 ? "Izoluj " + iconNum + " twoje krainy" : "Izoluj 1 twoją krainę",
          ar: "اعزل " + iconNum + " من أراضيك",
          zh: "阻隔 " + (numLocalize[lang][iconNum] || iconNum) + " 你的區域",
          hu: "Izoláld " + iconNum + " területedet",
          ko: "당신의 지역 중 " + iconNum + "개의 지역을 고립시킨다",
          ja: `あなたの土地` + iconNum + `個を孤立させる`,
        };
      }
      subText = localize[lang];
      break;
    case "reclaim-none":
      localize = {
        en: "Reclaim None",
        fr: "Ne Récupérez Aucun",
        de: "Nichts wiedererlangen",
        pl: "Nie Odzyskuj Karty",
        ar: "لا تسترد شيئاً",
        zh: "不回收法術牌",
        hu: "Nem vehetsz vissza",
        ko: "회수 없음",
        ja: `回収しない`,
      };
      subText = localize[lang];
      break;
    case "increase-energy":
      localize = {
        en: "+" + num + " Energy",
        fr: "+" + num + " Energie",
        de: "+" + num + " Energie",
        pl: "+" + num + " Energii",
        ar: "+" + num + " طاقة",
        zh: "+" + num + " 能量",
        hu: "+" + num + " Energia",
        ko: "에너지" + "+" + num,
        ja: `+` + num + ` エネルギー`,
      };
      subText = localize[lang];
      break;
    case "move-presence":
    case "growth-move-presence":
      if (txt) {
        if (isNaN(txt)) {
          // Move a presence and a token together
          const iconTxt = IconName(txt);
          localize = {
            en: `Move a Presence and ${iconTxt} together`,
            fr: `Déplacez une Présence et ${iconTxt} ensemble`,
            de: `Verschiebe gemeinsam 1 Präsenz und 1 ${iconTxt}`,
            pl: `Przesuń Obecność i ${iconTxt} jednocześnie`,
            ar: `حرّك حضوراً و${iconTxt} معاً`,
            zh: `一起移動靈跡和${iconTxt}`,
            hu: `Jelenlét és ${iconTxt} mozgatása együtt`,
            ko: `${iconTxt}와 함께 현신 이동`,
            ja: `プレゼンスと${iconTxt}を一緒に移動`,
          };
        } else {
          // Move x presence
          localize = {
            en: "Move up to " + txt + " Presence together",
            fr: "Déplacez jusqu'à " + txt + " Présences ensemble",
            de: "Bewege bis zu " + txt + " Präsenzen gemeinsam",
            pl: "Przesuń do " + txt + " Obecności jednocześnie",
            ar: "حرّك حتى " + txt + " حضور معاً",
            zh: "一起移動最多" + txt + "個靈跡",
            hu: "Legfeljebb " + txt + " Jelenlét mozgatása együtt",
            ko: "현신을 " + txt + "개까지 함께 이동",
            ja: "最大" + txt + "個のプレゼンスを一緒に移動",
          };
        }
      } else {
        // only one parameter
        if (isNaN(num) && !elementNames.has(num)) {
          // its a terrain
          const iconNum = IconName(num);
          localize = {
            en: "Move a Presence to " + iconNum + " land",
            fr: "Déplacez une Présence vers " + iconNum + " Région",
            de: "Verschiebe eine Präsenz in das Gebiet " + iconNum,
            pl: "Przesuń Obecność do " + iconNum,
            ar: "حرّك حضوراً إلى أرض " + iconNum,
            zh: "移動靈跡到" + iconNum + "區域",
            hu: "Jelenlét mozgatása " + iconNum + " területre",
            ko: iconNum + "지역으로 현신 1개 이동",
            ja: iconNum + "の土地にプレゼンスを移動",
          };
        } else {
          // its a number or an element
          if (str.includes("growth")) {
            // no # in growth
            localize = {
              en: "Move a Presence",
              fr: "Déplacez une Presence",
              de: "Präsenz " + num + " bewegen",
              pl: "Przesuń Obecność",
              ar: "حرّك حضوراً",
              zh: "移動靈跡",
              hu: "Jelenlét mozgatása",
              ko: "현신 1개 이동",
              ja: `プレゼンスを移動`,
            };
          } else {
            localize = {
              en: "Move a Presence " + num,
              fr: "Déplacez une Présence " + num,
              de: "Präsenz " + num + " bewegen",
              pl: "Przenieś Obecność " + num,
              ar: "حرّك حضوراً " + num,
              zh: "移動靈跡" + num,
              hu: "Jelenlét mozgatása " + num,
              ko: "현신 " + num + "개 이동",
              ja: "プレゼンスを移動 " + num,
            };
          }
        }
      }
      subText = localize[lang];
      // Check for element-range
      if (elementNames.has(num)) {
        const iconNum = IconName(num);
        localize = {
          en: ` at Range equal to ${iconNum} Showing`,
          fr: ` à Portée égale aux ${iconNum} Présents`,
          de: ` mit Reichweite gleich ausliegender ${iconNum}`,
          pl: ` w Zasięgu równym widocznym ${iconNum}`,
          ar: ` في مدى يساوي ${iconNum} الظاهرة`,
          zh: ` 距離等於顯示的${iconNum}`,
          hu: ` a látható ${iconNum}-nek megfelelő távolságra`,
          ko: `사정거리는 ${iconNum}의 수와 같다`,
          ja: ` 表示されている${iconNum}と同じ距離で`,
        };
        subText += localize[lang];
      }
      break;
    case "damage":
      if (txt) {
        localize = {
          en: `${txt} Damage at Range ${num}`,
          fr: `${txt} Dégat à ${num} de portée`,
          de: `${txt} Schaden mit ${num} Reichweite`,
          pl: `${txt} Obrażeń w Zasięgu ${num}`,
          ar: `${txt} ضرر في المدى ${num}`,
          zh: `距離${num}造成${txt}傷害`,
          hu: `${txt} Sebzés ${num} távolságra`,
          ko: `사정거리 ${num}내에 피해 ${txt}`,
          ja: `距離${num}で${txt}ダメージ`,
        };
      } else {
        localize = {
          en: `${num} Damage in one of your Lands`,
          fr: `${num} Dégat à une de vos Régions`,
          de: "1 Schaden in 1 deiner Gebiete",
          pl: "1 Obrażenie w jednej z twoich Krain",
          ar: `${num} ضرر في إحدى أراضيك`,
          zh: `在你的1個區域造成${num}點傷害`,
          hu: `${num} Sebzés az egyik területeden`,
          ko: `당신의 지역 중 한 곳에 피해 ${num}`,
          ja: `あなたの土地1つで${num}ダメージ`,
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
        fr: `+${num} Portée`,
        de: `+${num} Reichweite`,
        pl: `+${num} Zasięgu`,
        ar: `+${num} مدى`,
        zh: `+${num} 距離`,
        hu: `+${num} távolság`,
        ko: `사정거리 +${num}`,
        ja: `+${num} 距離`,
      };
      subText = localize[lang];
      if (txt) {
        localize = {
          en: ` on ${txt}`,
          fr: ` sur ${txt}`,
          de: ` kein ${txt}`,
          pl: ` na ${txt}`,
          ar: ` على ${txt}`,
          zh: ` 在${txt}上`,
          hu: ` ${txt} területre`,
          ko: `${txt}에`,
          ja: ` ${txt}で`,
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
              fr: `Vos Pouvoirs gagnent +${num} de Portée ce tour`,
              de: `Deine Fähigkeiten erhalten +${num} Reichweite in diesem Zug`,
              pl: `W tej turze twoje Moce zyskują +${num} zasięgu`,
              ar: `تكتسب قواك +${num} مدى هذا الدور`,
              zh: `你的法術本回合獲得+${num}距離`,
              hu: `+${num} távolság minden Erődre ebben a fordulóban`,
              ko: `이번 차례에 당신의 능력은 사정 거리 +${num}`,
              ja: `今ターン、あなたのパワーは+${num}距離を得る`,
            };
            break;
          case "power cards":
            localize = {
              en: `Your Power Cards gain +${num} Range this turn`,
              fr: `Vos Cartes Pouvoirs gagnent +${num} de Portée ce tour-ci`,
              de: `Deine Fähigkeiten erhalten +${num} Reichweite in diesem Zug`,
              pl: `W tej turze twoje Karty Mocy zyskują +${num} zasięgu`,
              ar: `تكتسب بطاقات القوة لديك +${num} مدى هذا الدور`,
              zh: `你的法術牌本回合獲得+${num}距離`,
              hu: `+${num} távolság minden Erőkártyádra ebben a fordulóban`,
              ko: `이번 차례에 당신의 능력 카드들은 사정 거리 +${num}`,
              ja: `今ターン、あなたのパワーカードは+${num}距離を得る`,
            };
            break;
          case "everything":
            localize = {
              en: `+${num} Range on everything this turn`,
              fr: `+${num} de Portée sur tout ce tour-ci`,
              de: `+${num} Reichweite in diesem Zug`,
              pl: `+${num} zasięgu dla wszystkich twoich akcji w tej turze`,
              ar: `+${num} مدى على كل شيء هذا الدور`,
              zh: `本回合所有東西獲得+${num}距離`,
              hu: `+${num} távolság mindenre ebben a fordulóban`,
              ko: `이번 차례에 사정 거리 +${num}(모든 경우에 대해)`,
              ja: `今ターン、すべてに+${num}距離`,
            };
            break;
          case "innate":
          case "innate power":
          case "innate powers":
            localize = {
              en: `Your Innate Powers gain +${num} Range this turn`,
              fr: `Vos Pouvoirs Innés gagnent +${num} de Portée ce tour`,
              de: `Deine Basisfähigkeiten erhalten +${num} Reichweite während diesem Zug`,
              pl: `W tej turze twoje Wrodzone Moce zyskują +${num} zasięgu`,
              ar: `تكتسب قواك الفطرية +${num} مدى هذا الدور`,
              zh: `你的固有法術本回合獲得+${num}距離`,
              hu: `+${num} távolság az Ősi Erőidre ebben a fordulóban`,
              ko: `이번 차례에 당신의 타고난 능력은 사정 거리 +${num}`,
              ja: `今ターン、あなたの固有パワーは+${num}距離を得る`,
            };
            break;
          default:
            localize = {
              en: `+${num} Range on ${txt} this turn`,
              fr: `+${num} de Portée sur ${txt} ce tour`,
              de: `+${num} Reichweite auf ${txt} in diesem Zug`,
              pl: `W tej turze ${txt} zyskuje +${num} zasięgu`,
              ar: `+${num} مدى على ${txt} هذا الدور`,
              zh: `${txt}本回合獲得+${num}距離`,
              hu: `+${num} távolság ${txt} ebben a fordulóban`,
              ko: `이번 차례에 ${txt} 사정 거리 +${num}`,
              ja: `今ターン、${txt}に+${num}距離`,
            };
        }
      } else {
        localize = {
          en: `Your Powers gain +${num} Range this turn`,
          fr: `Vos Pouvoirs gagnent +${num} de Portée ce tour`,
          de: `Deine Fähigkeiten erhalten +${num} Reichweite in diesem Zug`,
          pl: `W tej turze twoje Moce zyskują +${num} zasięgu`,
          ar: `تكتسب قواك +${num} مدى هذا الدور`,
          zh: `你的法術本回合獲得+${num}距離`,
          hu: `+${num} távolság minden Erődre ebben a fordulóban`,
          ko: `이번 차례에 당신의 능력은 사정 거리 +${num}`,
          ja: `今ターン、あなたのパワーは+${num}距離を得る`,
        };
      }
      subText = localize[lang];
      break;
    case "add-token":
      //add-token(range#/token,and/or/conditional,token,num/[othertokens])
      if (isNaN(num) && num !== "any") {
        // its a presence track token
        const iconNum = IconName(num);
        localize = {
          en: `Add 1 ${iconNum} to 1 of your Lands`,
          fr: `Ajoutez 1 ${iconNum} sur 1 de vos Régions`,
          de: `Füge 1 ${iconNum} auf eines deiner Gebiete mit einer Präsenz hinzu`,
          pl: `Dodaj 1 ${iconNum} do jednej z twoich Krain`,
          ar: `أضف 1 ${iconNum} إلى إحدى أراضيك`,
          zh: `添加1個${iconNum}到你的1個區域`,
          hu: `Rakj le 1 ${iconNum} jelzőt az egyik területedre`,
          ko: `당신의 지역에 ${iconNum} 1개 추가`,
          ja: `あなたの土地1つに${iconNum}1個を追加`,
        };
      } else {
        // its a growth token
        if (opt4 && isNaN(opt4)) {
          if (txt === "conditional") {
            //condition
            let token = IconName(opt3);
            let landtype = IconName(opt4);
            let particle = num === "any" ? "any" : "a";
            localize = {
              en: landtypeNames[lang][opt4]
                ? `Add a ${token} to ${particle} ${landtype}`
                : `Add a ${token} to ${particle} Land with ${landtype}`,
              fr: landtypeNames[lang][opt4]
                ? `Ajoutez un ${token} à un ${landtype}`
                : `Ajoutez un ${token} à une Région avec ${landtype}`,
              de: landtypeNames[lang][opt4]
                ? `Füge ein ${token} zu einem ${landtype} hinzu`
                : `Füge ein ${token} zu einem Gebiet mit ${landtype} hinzu`,
              pl: landtypeNames[lang][opt4]
                ? `Dodaj ${token} do ${landtype}`
                : `Dodaj ${token} do Krainy z ${landtype}`,
              ar: landtypeNames[lang][opt4]
                ? `أضف ${token} إلى ${landtype}`
                : `أضف ${token} إلى أرض مع ${landtype}`,
              zh: landtypeNames[lang][opt4]
                ? `添加${token}到${landtype}`
                : `添加${token}到有${landtype}的區域`,
              hu: landtypeNames[lang][opt4]
                ? `Rakj le egy ${token} jelzőt ${landtype} területre`
                : `Rakj le egy ${token} jelzőt egy területre, ahol van ${landtype}`,
              ko: landtypeNames[lang][opt4]
                ? `${landtype}에 ${token} 추가`
                : `${landtype}가 있는 지역에 ${token} 추가`,
              ja: landtypeNames[lang][opt4]
                ? `${landtype}に${token}を追加`
                : `${landtype}がある土地に${token}を追加`,
            };
          } else {
            //multiple tokens of different types
            localize = {
              en: `Add a ${ListLocalize(options.slice(2), txt)} ${txt === "and" ? "together" : ""}`,
              fr: `Ajoutez un ${ListLocalize(options.slice(2), txt)} ${
                txt === "et" ? "ensemble" : ""
              }`,
              de: `Lege ein ${ListLocalize(options.slice(2), txt)} ${
                txt === "und" ? "zusammen" : ""
              }`,
              pl: `Dodaj ${ListLocalize(options.slice(2), txt)} ${
                txt === "i" ? "jednocześnie" : ""
              }`,
              ar: `أضف ${ListLocalize(options.slice(2), txt)} ${txt === "و" ? "معاً" : ""}`,
              zh: `添加${ListLocalize(options.slice(2), txt)} ${txt === "和" ? "一起" : ""}`,
              hu: `Rakj le egy ${ListLocalize(options.slice(2), txt)} ${
                txt === "és" ? "együtt" : ""
              }`,
              ko: `${ListLocalize(options.slice(2), txt)} ${txt === "와" ? "함께" : ""} 추가`,
              ja: `${ListLocalize(options.slice(2), txt)}を追加 ${txt === "と" ? "一緒に" : ""}`,
            };
          }
        } else if (opt4) {
          //multiple tokens of the same type
          const iconOpt3Opt4 = IconName(opt3, opt4);
          localize = {
            en: `Add ${iconOpt3Opt4} together`,
            fr: `Ajoutez ${iconOpt3Opt4} ensemble`,
            de: `Füge ${iconOpt3Opt4} zusammen`,
            pl: `Dodaj ${iconOpt3Opt4} jednocześnie`,
            ar: `أضف ${iconOpt3Opt4} معاً`,
            zh: `一起添加${iconOpt3Opt4}`,
            hu: `Rakj le ${iconOpt3Opt4} jelzőket együtt`,
            ko: `${iconOpt3Opt4} 함께 추가`,
            ja: `${iconOpt3Opt4}を一緒に追加`,
          };
        } else {
          // one token
          const iconOpt3 = IconName(opt3);
          localize = {
            en: `Add a ${iconOpt3}`,
            fr: `Ajoutez un ${iconOpt3}`,
            de: `Füge ein ${iconOpt3} hinzu`,
            pl: `Dodaj ${iconOpt3}`,
            ar: `أضف ${iconOpt3}`,
            zh: `添加${iconOpt3}`,
            hu: `Rakj le egy ${iconOpt3} jelzőt`,
            ko: `${iconOpt3} 1개 추가`,
            ja: `${iconOpt3}を追加`,
          };
        }
      }
      subText = localize[lang];
      break;
    case "replace":
      if (num > 0) {
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: `You may Replace ${iconTxt} with ${iconOpt3}`,
          fr: `Vous pouvez Remplacer ${iconTxt} par ${iconOpt3}`,
          de: `Du darfst ${iconTxt} durch ${iconOpt3} ersetzen`,
          pl: `Możesz Zamienić ${iconTxt} na ${iconOpt3}`,
          ar: `يمكنك استبدال ${iconTxt} بـ ${iconOpt3}`,
          zh: `你可以用${iconOpt3}替換${iconTxt}`,
          hu: `Lecserélhetsz egy ${iconTxt}-t egy ${iconOpt3} jelzőre`,
          ko: `${iconTxt}를 ${iconOpt3}로 교체할 수 있다`,
          ja: `${iconTxt}を${iconOpt3}と交換できます`,
        };
      } else {
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: `You may Replace 1 ${iconTxt} in your Lands with ${iconOpt3}`,
          fr: `Vous pouvez Remplacer 1 ${iconTxt} dans votre Région par ${iconOpt3}`,
          de: `Du darfst 1 ${iconTxt} in einem deiner Gebiete mit ${iconOpt3} ersetzen`,
          pl: `Możesz Zamienić 1 ${iconTxt} w jednej z Twoich krain z ${iconOpt3}`,
          ar: `يمكنك استبدال 1 ${iconTxt} في أراضيك بـ ${iconOpt3}`,
          zh: `你可以用${iconOpt3}替換你區域中的1個${iconTxt}`,
          hu: `Lecserélhetsz 1 ${iconTxt}-t az egyik területeden egy ${iconOpt3} jelzőre`,
          ko: `당신의 지역에 ${iconOpt3}를 ${iconTxt}로 교체할 수 있다`,
          ja: `あなたの土地にある${iconTxt}1個を${iconOpt3}と交換できます`,
        };
      }
      subText = localize[lang];
      break;
    case "push":
      num = num === "undefined" ? "" : num * 1;
      txt = txt === "undefined" ? "" : txt;
      opt3 = opt3 === "undefined" ? "" : opt3;
      opt4 = opt4 === "undefined" ? "" : opt4;

      if (num > 0 && !opt3) {
        // Range, no conditions
        // ie. Gather up to 1 Beasts into a Land
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        localize = {
          en: `Push up to ${iconOpt4} ${iconTxt} from a Land`,
          fr: `Repoussez ${iconOpt4} ${iconTxt} d'une Région`,
          de: `Verschiebe bis zu ${iconOpt4} ${iconTxt} aus einem Gebiet`,
          pl: `Wypchnij do ${iconOpt4} ${iconTxt} z krainy`,
          ar: `ادفع حتى ${iconOpt4} ${iconTxt} من أرض`,
          zh: `從一個區域推出最多${iconOpt4}個${iconTxt}`,
          hu: `Tolj el legfeljebb ${iconOpt4} ${iconTxt} jelzőt egy területről`,
          ko: `목표 지역에서 ${iconTxt}를 최대 ${iconOpt4}개까지 밀어낸다`,
          ja: `土地から最大${iconOpt4}個の${iconTxt}を押し出す`,
        };
      } else if (num > 0 && opt3) {
        // Range, with conditions
        // ie. Push 1 Beasts from Jungle
        // ie. Push 1 Beasts from a Land with Wilds
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: landtypeNames[lang][opt3]
            ? `Push ${iconOpt4} ${iconTxt} from a ${iconOpt3}`
            : `Push ${iconOpt4} ${iconTxt} from a Land with ${iconOpt3}`,
          fr: landtypeNames[lang][opt3]
            ? `Repoussez ${iconOpt4} ${iconTxt} depuis ${iconOpt3}`
            : `Repoussez ${iconOpt4} ${iconTxt} d'une Région avec ${iconOpt3}`,
          de: landtypeNames[lang][opt3]
            ? `Verschiebe ${iconOpt4} ${iconTxt} aus einem ${iconOpt3}`
            : `Verschiebe ${iconOpt4} ${iconTxt} aus einem Land mit ${iconOpt3}`,
          pl: landtypeNames[lang][opt3]
            ? `Wypchnij ${iconOpt4} ${iconTxt} z ${iconOpt3}`
            : `Wypchnij ${iconOpt4} ${iconTxt} z twojej krainy z ${iconOpt3}`,
          ar: landtypeNames[lang][opt3]
            ? `ادفع ${iconOpt4} ${iconTxt} من ${iconOpt3}`
            : `ادفع ${iconOpt4} ${iconTxt} من أرض مع ${iconOpt3}`,
          zh: landtypeNames[lang][opt3]
            ? `從${iconOpt3}推出${iconOpt4}個${iconTxt}`
            : `從有${iconOpt3}的區域推出${iconOpt4}個${iconTxt}`,
          hu: landtypeNames[lang][opt3]
            ? `Tolj el egy ${iconOpt4} ${iconTxt} jelzőt ${iconOpt3} területről`
            : `Tolj el egy ${iconOpt4} ${iconTxt} jelzőt egy területről, ahol van ${iconOpt3}`,
          ko: landtypeNames[lang][opt3]
            ? `${iconOpt3}에서 ${iconOpt4} ${iconTxt} 밀어내기`
            : `${iconOpt3}가 있는 지역에서 ${iconOpt4} ${iconTxt} 밀어내기`,
          ja: landtypeNames[lang][opt3]
            ? `${iconOpt3}から${iconOpt4}個の${iconTxt}を押し出す`
            : `${iconOpt3}がある土地から${iconOpt4}個の${iconTxt}を押し出す`,
        };
      } else if (num === 0 && !opt3) {
        // ie. Push 1 Beasts from 1 of your Lands
        // gather(0,presence,sacred-site,each)
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        localize = {
          en: `Push ${iconOpt4} ${iconTxt} from 1 of your Lands`,
          fr: `Repoussez ${iconOpt4} ${iconTxt} depuis 1 de vos Région`,
          de: `Verschiebe ${iconOpt4} ${iconTxt} aus 1 deiner Gebiete`,
          pl: `Wypchnij ${iconOpt4} ${iconTxt} z twojej krainy`,
          ar: `ادفع ${iconOpt4} ${iconTxt} من إحدى أراضيك`,
          zh: `從你的1個區域推出${iconOpt4}個${iconTxt}`,
          hu: `Tolj el egy ${iconOpt4} ${iconTxt} jelzőt az egyik területedről`,
          ko: `당신의 지역 한 곳에서 ${iconTxt}를 ${iconOpt4}개 밀어낸다`,
          ja: `あなたの土地1つから${iconOpt4}個の${iconTxt}を押し出す`,
        };
      } else if (num === 0 && !isNaN(opt4)) {
        // ie. Push 3 Beasts from Mountain or Wetland
        // push(0,presence,sacred-site,each)
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: `Push ${iconOpt4} ${iconTxt} from ${iconOpt3}`,
          fr: `Repoussez ${iconOpt4} ${iconTxt} depuis ${iconOpt3}`,
          de: `Verschiebe ${iconOpt4} ${iconTxt} aus ${iconOpt3}`,
          pl: `Wypchnij ${iconOpt4} ${iconTxt} z ${iconOpt3}`,
          ar: `ادفع ${iconOpt4} ${iconTxt} من ${iconOpt3}`,
          zh: `從${iconOpt3}推出${iconOpt4}個${iconTxt}`,
          hu: `Tolj el ${iconOpt4} ${iconTxt} jelzőt ${iconOpt3} területről`,
          ko: `${iconOpt3}에서 ${iconTxt}를 ${iconOpt4}개 밀어낸다`,
          ja: `${iconOpt3}から${iconOpt4}個の${iconTxt}を押し出す`,
        };
      } else if (num === 0 && isNaN(opt4)) {
        // third option is text - Conditional P/G at TEXT
        // ie. Push 1 Beasts from Each Wetland
        const iconTxt = IconName(txt);
        const iconOpt4 = IconName(opt4);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: `Push 1 ${iconTxt} from ${iconOpt4} ${iconOpt3}`,
          fr: `Repoussez 1 ${iconTxt} depuis ${iconOpt4} ${iconOpt3}`,
          de: `Verschiebe 1 ${iconTxt} aus ${iconOpt4} ${iconOpt3}`,
          pl: `Wypchnij ${iconOpt4} ${iconTxt} z ${iconOpt3}`,
          ar: `ادفع 1 ${iconTxt} من ${iconOpt4} ${iconOpt3}`,
          zh: `從${iconOpt4}${iconOpt3}推出1個${iconTxt}`,
          hu: `Tolj el 1 ${iconTxt} jelzőt ${iconOpt4} ${iconOpt3}`,
          ko: `${iconOpt4} ${iconOpt3}에서 ${iconTxt} 1개를 밀어낸다`,
          ja: `${iconOpt4} ${iconOpt3}から${iconTxt}1個を押し出す`,
        };
      } else if (num === 0 && opt3) {
        // only two options, the second is text - P/G
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: landtypeNames[lang][opt3]
            ? `Push ${iconOpt4} ${iconTxt} from ${iconOpt3}`
            : `Push ${iconOpt4} ${iconTxt} from 1 of your Lands with ${iconOpt3}`,
          fr: landtypeNames[lang][opt3]
            ? `Repoussez ${iconOpt4} ${iconTxt} depuis ${iconOpt3}`
            : `Repoussez ${iconOpt4} ${iconTxt} depuis 1 de vos Régions avec ${iconOpt3}`,
          de: landtypeNames[lang][opt3]
            ? `Verschiebe ${iconOpt4} ${iconTxt} aus ${iconOpt3}`
            : `Verschiebe ${iconOpt4} ${iconTxt} aus 1 deiner Gebiete mit ${iconOpt3}`,
          pl: landtypeNames[lang][opt3]
            ? `Wypchnij ${iconOpt4} ${iconTxt} z ${iconOpt3}`
            : `Wypchnij ${iconOpt4} ${iconTxt} z twojej krainy z ${iconOpt3}`,
          ar: landtypeNames[lang][opt3]
            ? `ادفع ${iconOpt4} ${iconTxt} من ${iconOpt3}`
            : `ادفع ${iconOpt4} ${iconTxt} من إحدى أراضيك مع ${iconOpt3}`,
          zh: landtypeNames[lang][opt3]
            ? `從${iconOpt3}推出${iconOpt4}個${iconTxt}`
            : `從你有${iconOpt3}的1個區域推出${iconOpt4}個${iconTxt}`,
          hu: landtypeNames[lang][opt3]
            ? `Tolj el egy ${iconOpt4} ${iconTxt} jelzőt ${iconOpt3} területről`
            : `Tolj el egy ${iconOpt4} ${iconTxt} jelzőt az egyik területedről, ahol van ${iconOpt3}`,
          ko: landtypeNames[lang][opt3]
            ? `${iconOpt3}에서 ${iconOpt4} ${iconTxt} 밀어내기`
            : `${iconOpt3}가 있는 당신의 지역에서 ${iconOpt4} ${iconTxt} 밀어내기`,
          ja: landtypeNames[lang][opt3]
            ? `${iconOpt3}から${iconOpt4}個の${iconTxt}を押し出す`
            : `${iconOpt3}があるあなたの土地1つから${iconOpt4}個の${iconTxt}を押し出す`,
        };
      } else {
        // only one option
        const iconTxt = IconName(txt);
        localize = {
          en: `Push 1 ${iconTxt} from 1 of your Lands`,
          fr: `Repoussez 1 ${iconTxt} depuis 1 de vos Régions`,
          de: `Verschiebe 1 ${iconTxt} aus 1 deiner Gebiete`,
          pl: `Wypchnij 1 ${iconTxt} z twojej krainy`,
          ar: `ادفع 1 ${iconTxt} من إحدى أراضيك`,
          zh: `從你的1個區域推出1個${iconTxt}`,
          hu: `Tolj el 1 ${iconTxt} jelzőt az egyik területedről`,
          ko: `당신의 지역 1곳에서 ${iconTxt} 1개를 밀어낸다`,
          ja: `あなたの土地1つから${iconTxt}1個を押し出す`,
        };
      }
      subText = localize[lang];
      break;
    case "track-push":
      if (num === "incarna") {
        const iconNum = IconName(num);
        localize = {
          en: `Push ${iconNum}`,
          fr: `Repoussez ${iconNum}`,
          de: `Verschiebe ${iconNum}`,
          pl: `Wypchnij ${iconNum}`,
          ar: `ادفع ${iconNum}`,
          zh: `推出${iconNum}`,
          hu: `Told el a ${iconNum}-t`,
          ko: `${iconNum}을 밀어낸다`,
          ja: `${iconNum}を押し出す`,
        };
      } else {
        subText = IconName(num);
        for (let i = 1; i < options.length; i++) {
          subText += "/" + IconName(options[i]);
        }
        localize = {
          en: `Push 1 ${subText} from 1 of your Lands`,
          fr: `Repoussez 1 ${subText} depuis 1 de vos Régions`,
          de: `Verschiebe 1 ${subText} aus 1 deiner Gebiete`,
          pl: `Wypchnij ${IconName(num)} z twojej krainy`,
          ar: `ادفع 1 ${subText} من إحدى أراضيك`,
          zh: `從你的1個區域推出1個${subText}`,
          hu: `Tolj el 1 ${subText}-t az egyik területedről`,
          ko: `당신의 지역 1곳에서 ${subText} 1개를 민다`,
          ja: `あなたの土地1つから${subText}1個を押し出す`,
        };
      }
      subText = localize[lang];
      break;
    case "gather":
      //IconName(`${growthActionType}(${moveRange},${moveTarget},${moveCondition})`);
      //num=moveRange,txt=moveTarget,opt3=moveCondition
      //gather(0,presence,sacred-site,each)
      //Gather 1 Your Presence into Each Sacred Site
      num = num === "undefined" ? "" : num * 1;
      txt = txt === "undefined" ? "" : txt;
      opt3 = opt3 === "undefined" ? "" : opt3;
      opt4 = opt4 === "undefined" ? "" : opt4;

      if (num > 0 && !opt3) {
        // Range, no conditions
        // ie. Gather up to 1 Beasts into a Land
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        localize = {
          en: `Gather up to ${iconOpt4} ${iconTxt} into a Land`,
          fr: `Rassemblez jusqu'à ${iconOpt4} ${iconTxt} dans une Région`,
          de: `Versammele bis zu ${iconOpt4} ${iconTxt} in einem Gebiet`,
          pl: `Zgromadź do ${iconOpt4} ${iconTxt} w krainie`,
          ar: `اجمع حتى ${iconOpt4} ${iconTxt} في أرض`,
          zh: `聚集最多${iconOpt4}個${iconTxt}到一個區域`,
          hu: `Gyűjts össze legfeljebb ${iconOpt4} ${iconTxt} jelzőt egy területre`,
          ko: `${iconTxt}를 최대 ${iconOpt4}개까지 대상 지역으로 끌어온다`,
          ja: `土地1つに最大${iconOpt4}個の${iconTxt}を集める`,
        };
      } else if (num > 0 && opt3) {
        // Range, with conditions
        // ie. Gather 1 Beasts into Jungle
        // ie. Gather 1 Beasts into a Land with Wilds
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: landtypeNames[lang][opt3]
            ? `Gather ${iconOpt4} ${iconTxt} into a ${iconOpt3}`
            : `Gather ${iconOpt4} ${iconTxt} into a Land with ${iconOpt3}`,
          fr: landtypeNames[lang][opt3]
            ? `Rassemblez ${iconOpt4} ${iconTxt} dans un ${iconOpt3}`
            : `Rassemblez ${iconOpt4} ${iconTxt} dans une Région ${iconOpt3}`,
          de: landtypeNames[lang][opt3]
            ? `Versammele ${iconOpt4} ${iconTxt} im ${iconOpt3}`
            : `Versammele ${iconOpt4} ${iconTxt} in ein Gebiet mit ${iconOpt3}`,
          pl: landtypeNames[lang][opt3]
            ? `Zgromadź ${iconOpt4} ${iconTxt} w ${iconOpt3}`
            : `Zgromadź ${iconOpt4} ${iconTxt} w krainie z ${iconOpt3}`,
          ar: landtypeNames[lang][opt3]
            ? `اجمع ${iconOpt4} ${iconTxt} في ${iconOpt3}`
            : `اجمع ${iconOpt4} ${iconTxt} في أرض مع ${iconOpt3}`,
          zh: landtypeNames[lang][opt3]
            ? `聚集${iconOpt4}個${iconTxt}到${iconOpt3}`
            : `聚集${iconOpt4}個${iconTxt}到有${iconOpt3}的區域`,
          hu: landtypeNames[lang][opt3]
            ? `Gyűjts össze egy ${iconOpt4} ${iconTxt} jelzőt ${iconOpt3} területre`
            : `Gyűjts össze egy ${iconOpt4} ${iconTxt} jelzőt egy területre, ahol van ${iconOpt3}`,
          ko: landtypeNames[lang][opt3]
            ? `${iconOpt3}에 ${iconOpt4} ${iconTxt} 모으기`
            : `${iconOpt3}가 있는 지역에 ${iconOpt4} ${iconTxt} 모으기`,
          ja: landtypeNames[lang][opt3]
            ? `${iconOpt3}に${iconOpt4}個の${iconTxt}を集める`
            : `${iconOpt3}がある土地に${iconOpt4}個の${iconTxt}を集める`,
        };
      } else if (num === 0 && !opt3) {
        // ie. Gather 1 Beasts into 1 of your Lands
        // gather(0,presence,sacred-site,each)
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        localize = {
          en: `Gather ${iconOpt4} ${iconTxt} into 1 of your Lands`,
          fr: `Rassemblez ${iconOpt4} ${iconTxt} dans 1 de vos Régions`,
          de: `Versammele ${iconOpt4} ${iconTxt} in einem deiner Gebiete`,
          pl: `Zgromaź ${iconOpt4} ${iconTxt} w twojej krainie`,
          ar: `اجمع ${iconOpt4} ${iconTxt} في إحدى أراضيك`,
          zh: `聚集${iconOpt4}個${iconTxt}到你的1個區域`,
          hu: `Gyűjts össze egy ${iconOpt4} ${iconTxt} jelzőt az egyik területedre`,
          ko: `당신의 지역 한 곳으로 ${iconOpt4}을 ${iconTxt}개 끌어온다`,
          ja: `あなたの土地1つに${iconOpt4}個の${iconTxt}を集める`,
        };
      } else if (num === 0 && !isNaN(opt4)) {
        // ie. Gather 3 Beasts into Mountain or Wetland
        // gather(0,presence,sacred-site,each)
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: `Gather ${iconOpt4} ${iconTxt} into ${iconOpt3}`,
          fr: `Rassemblez ${iconOpt4} ${iconTxt} dans ${iconOpt3}`,
          de: `Versammele ${iconOpt4} ${iconTxt} im ${iconOpt3}`,
          pl: `Zgromadź ${iconOpt4} ${iconTxt} w ${iconOpt3}`,
          ar: `اجمع ${iconOpt4} ${iconTxt} في ${iconOpt3}`,
          zh: `聚集${iconOpt4}個${iconTxt}到${iconOpt3}`,
          hu: `Gyűjts össze ${iconOpt4} ${iconTxt} jelzőt ${iconOpt3} területre`,
          ko: `${iconOpt3}에서 ${iconOpt4}을 ${iconTxt}개 끌어온다`,
          ja: `${iconOpt3}に${iconOpt4}個の${iconTxt}を集める`,
        };
      } else if (num === 0 && isNaN(opt4)) {
        // third option is text - Conditional P/G at TEXT
        // ie. Gather 1 Beasts into Each Wetland
        const iconTxt = IconName(txt);
        const iconOpt4 = IconName(opt4);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: `Gather 1 ${iconTxt} into ${iconOpt4} ${iconOpt3}`,
          fr: `Rassemblez 1 ${iconTxt} dans ${iconOpt4} ${iconOpt3}`,
          de: `Versammele 1 ${iconTxt} in ${iconOpt4} ${iconOpt3}`,
          pl: `Zgromadź 1 ${iconTxt} w ${iconOpt4} ${iconOpt3}`,
          ar: `اجمع 1 ${iconTxt} في ${iconOpt4} ${iconOpt3}`,
          zh: `聚集1個${iconTxt}到${iconOpt4}${iconOpt3}`,
          hu: `Gyűjts össze 1 ${iconTxt} jelzőt ${iconOpt4} ${iconOpt3}`,
          ko: `${iconOpt4} ${iconOpt3}에서 ${iconOpt4}을 1개 끌어온다`,
          ja: `${iconOpt4} ${iconOpt3}に${iconTxt}1個を集める`,
        };
      } else if (num === 0 && opt3) {
        // only two options, the second is text - P/G
        const iconOpt4 = IconName(opt4);
        const iconTxt = IconName(txt);
        const iconOpt3 = IconName(opt3);
        localize = {
          en: landtypeNames[lang][opt3]
            ? `Gather ${iconOpt4} ${iconTxt} into ${iconOpt3}`
            : `Gather ${iconOpt4} ${iconTxt} into 1 of your Lands with ${iconOpt3}`,
          fr: landtypeNames[lang][opt3]
            ? `Rassemblez ${iconOpt4} ${iconTxt} dans ${iconOpt3}`
            : `Rassemblez ${iconOpt4} ${iconTxt} dans 1 de vos Régions avec ${iconOpt3}`,
          de: landtypeNames[lang][opt3]
            ? `Versammele ${iconOpt4} ${iconTxt} in ${iconOpt3}`
            : `Vresammele ${iconOpt4} ${iconTxt} in 1 deiner Gebiete mit ${iconOpt3}`,
          pl: landtypeNames[lang][opt3]
            ? `Zgromadź ${iconOpt4} ${iconTxt} w ${iconOpt3}`
            : `Zgromadź ${iconOpt4} ${iconTxt} w twojej krainie z ${iconOpt3}`,
          ar: landtypeNames[lang][opt3]
            ? `اجمع ${iconOpt4} ${iconTxt} في ${iconOpt3}`
            : `اجمع ${iconOpt4} ${iconTxt} في إحدى أراضيك مع ${iconOpt3}`,
          zh: landtypeNames[lang][opt3]
            ? `聚集${iconOpt4}個${iconTxt}到${iconOpt3}`
            : `聚集${iconOpt4}個${iconTxt}到你有${iconOpt3}的1個區域`,
          hu: landtypeNames[lang][opt3]
            ? `Gyűjts össze egy ${iconOpt4} ${iconTxt} jelzőt ${iconOpt3} területre`
            : `Gyűjts össze egy ${iconOpt4} ${iconTxt} jelzőt az egyik területedre, ahol van ${iconOpt3}`,
          ko: landtypeNames[lang][opt3]
            ? `${iconOpt3}에 ${iconOpt4} ${iconTxt} 모으기`
            : `${iconOpt3}가 있는 당신의 지역에 ${iconOpt4} ${iconTxt} 모으기`,
          ja: landtypeNames[lang][opt3]
            ? `${iconOpt3}に${iconOpt4}個の${iconTxt}を集める`
            : `${iconOpt3}があるあなたの土地1つに${iconOpt4}個の${iconTxt}を集める`,
        };
      } else {
        // only one option
        const iconTxt = IconName(txt);
        localize = {
          en: `Gather 1 ${iconTxt} into 1 of your Lands`,
          fr: `Rassemblez 1 ${iconTxt} dans 1 de vos Régions`,
          de: `Versammele 1 ${iconTxt} in 1 deiner Gebiete`,
          pl: `Zgromaź 1 ${iconTxt} w twojej krainie`,
          ar: `اجمع 1 ${iconTxt} في إحدى أراضيك`,
          zh: `聚集1個${iconTxt}到你的1個區域`,
          hu: `Gyűjts össze 1 ${iconTxt} jelzőt az egyik területedre`,
          ko: `당신의 지역 한 곳으로 ${iconTxt}을 1개 끌어온다`,
          ja: `あなたの土地1つに${iconTxt}1個を集める`,
        };
      }
      subText = localize[lang];
      break;
    case "track-gather":
      if (num === "incarna") {
        const iconNum = IconName(num);
        localize = {
          en: `Gather ${iconNum}`,
          fr: `Rassemblez ${iconNum}`,
          de: `Versammele ${iconNum}`,
          pl: `Zgromadź ${iconNum}`,
          ar: `اجمع ${iconNum}`,
          zh: `聚集${iconNum}`,
          hu: `Gyűjtsd össze a ${iconNum}-t`,
          ko: `${iconNum}을 끌어온다`,
          ja: `${iconNum}を集める`,
        };
      } else {
        subText = IconName(num);
        for (let i = 1; i < options.length; i++) {
          subText += "/" + IconName(options[i]);
        }
        localize = {
          en: `Gather 1 ${subText} into 1 of your Lands`,
          fr: `Rassemblez 1 ${subText} dans 1 de vos Régions`,
          de: `Versammele 1 ${subText} in 1 deiner Gebiete`,
          pl: `Zgromaź 1 ${subText} w twojej krainie`,
          ar: `اجمع 1 ${subText} في إحدى أراضيك`,
          zh: `聚集1個${subText}到你的1個區域`,
          hu: `Gyűjts össze 1 ${subText}-t az egyik területedre`,
          ko: `당신의 지역에서 ${subText}을 1개 끌어온다`,
          ja: `あなたの土地1つに${subText}1個を集める`,
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
            fr: `Générez ${txt} Peur par ${opt4}`,
            de: `Erzeuge ${txt} Furcht pro ${opt4}`,
            pl: `${num} Strachu za każde ${opt4}`,
            ar: `اولّد ${txt} خوف لكل ${opt4}`,
            zh: `每個${opt4}產生${txt}恐懼`,
            hu: `Generálj ${txt} Félelmet minden ${opt4} után`,
            ko: `${opt4} 1개당 공포 ${txt}`,
            ja: `${opt4}ごとに${txt}恐怖を生成`,
          };
        } else {
          // custom text, with flat energy
          localize = {
            en: `Generate ${num} Fear and +${txt} more per ${opt4}`,
            fr: `Générez ${num} Peur et +${txt} de plus par ${opt4}`,
            de: `Erzeuge ${num} Furcht und +${txt} mehr pro ${opt4}`,
            pl: `${num} Strachu i +${txt} Strachu za każde ${opt4} `,
            ar: `اولّد ${num} خوف و+${txt} إضافي لكل ${opt4}`,
            zh: `產生${num}恐懼，每個${opt4}額外+${txt}`,
            hu: `Generálj ${num} Félelmet +${txt} minden ${opt4} után`,
            ko: `공포 ${num}, 그리고 ${opt4} 1개당 +${txt}`,
            ja: `${num}恐怖を生成し、${opt4}ごとに+${txt}追加`,
          };
        }
      } else if (opt3) {
        const perIcon = IconName(opt3);
        if (num === 0 || num === "0") {
          // scaling, no flat fear
          localize = {
            en: elementNames.has(opt3)
              ? `Generate ${txt} Fear per ${perIcon} Showing`
              : `Generate ${txt} Fear per ${perIcon}`,
            fr: elementNames.has(opt3)
              ? `Générez ${txt} Peur par ${perIcon} Présent`
              : `Générez ${txt} Peur par ${perIcon}`,
            de: elementNames.has(opt3)
              ? `Erzeuge ${txt} Furcht pro ausliegendes ${perIcon}`
              : `Erzeuge ${txt} Furcht pro ${perIcon}`,
            pl: elementNames.has(opt3)
              ? `${txt} Strachu za każdy widoczny ${perIcon}`
              : `${txt} Strachu za każdy ${perIcon}`,
            ar: elementNames.has(opt3)
              ? `اولّد ${txt} خوف لكل ${perIcon} ظاهر`
              : `اولّد ${txt} خوف لكل ${perIcon}`,
            zh: elementNames.has(opt3)
              ? `每個顯示的${perIcon}產生${txt}恐懼`
              : `每個${perIcon}產生${txt}恐懼`,
            hu: elementNames.has(opt3)
              ? `Generálj ${txt} Félelmet minden látható ${perIcon} után`
              : `Generálj ${txt} Félelmet minden ${perIcon} után`,
            ko: elementNames.has(opt3)
              ? `표시된 ${perIcon}당 ${txt} 공포 생성`
              : `${perIcon}당 ${txt} 공포 생성`,
            ja: elementNames.has(opt3)
              ? `表示されている${perIcon}ごとに${txt}恐怖を生成`
              : `${perIcon}ごとに${txt}恐怖を生成`,
          };
        } else {
          // scaling w/ flat energy
          localize = {
            en: elementNames.has(opt3)
              ? `Generate ${num} Fear and +${txt} more per ${perIcon} Showing`
              : `Generate ${num} Fear and +${txt} more per ${perIcon}`,
            fr: elementNames.has(opt3)
              ? `Générez ${num} Peur et +${txt} de plus par ${perIcon} Présent`
              : `Générez ${num} Peur et +${txt} de plus par ${perIcon}`,
            de: elementNames.has(opt3)
              ? `Erzeuge ${num} Furcht und +${txt} mehr pro ausliegenden ${perIcon}`
              : `Erzeuge ${num} Furcht und +${txt} mehr pro ${perIcon}`,
            pl: elementNames.has(opt3)
              ? `${num} Strachu i +${txt} za każdy widoczny ${perIcon}`
              : `${num} Strachu i +${txt} za każdy ${perIcon}`,
            ar: elementNames.has(opt3)
              ? `اولّد ${num} خوف و+${txt} إضافي لكل ${perIcon} ظاهر`
              : `اولّد ${num} خوف و+${txt} إضافي لكل ${perIcon}`,
            zh: elementNames.has(opt3)
              ? `產生${num}恐懼，每個顯示的${perIcon}額外+${txt}`
              : `產生${num}恐懼，每個${perIcon}額外+${txt}`,
            hu: elementNames.has(opt3)
              ? `Generálj ${num} Félelmet +${txt} minden látható ${perIcon} után`
              : `Generálj ${num} Félelmet +${txt} minden ${perIcon} után`,
            ko: elementNames.has(opt3)
              ? `${num} 공포 생성 및 표시된 ${perIcon}당 +${txt} 추가`
              : `${num} 공포 생성 및 ${perIcon}당 +${txt} 추가`,
            ja: elementNames.has(opt3)
              ? `${num}恐怖を生成し、表示されている${perIcon}ごとに+${txt}追加`
              : `${num}恐怖を生成し、${perIcon}ごとに+${txt}追加`,
          };
        }
      } else {
        // flat energy
        localize = {
          en: `Generate Fear`,
          fr: `Générer de la peur`,
          de: `Erzeuge Furcht`,
          pl: `Generujesz Strach`,
          ar: `اولّد خوفاً`,
          zh: `產生恐懼`,
          hu: `Generálj Félelmet`,
          ko: `공포 1`,
          ja: `恐怖を生成`,
        };
      }
      subText = localize[lang];
      break;
    case "damage-1":
      localize = {
        en: "1 Damage in one of your Lands",
        fr: "1 Dégat dans une de vos Régions",
        de: "1 Schaden in 1 deiner Gebiete",
        pl: "1 Obrażenie w jednej z twoich Krain",
        ar: "1 ضرر في إحدى أراضيك",
        zh: "在你的1個區域造成1點傷害",
        hu: "1 Sebzés az egyik területeden",
        ko: "당신의 지역 한 곳에 피해 1",
        ja: `あなたの土地1つで1ダメージ`,
      };
      subText = localize[lang];
      break;
    case "damage-2":
      localize = {
        en: "2 Damage in one of your Lands",
        fr: "2 Dégats dans une de vos Régions",
        de: "1 Schaden in 2 deiner Gebiete",
        pl: "2 Obrażenia w jednej z twoich Krain",
        ar: "2 ضرر في إحدى أراضيك",
        zh: "在你的1個區域造成2點傷害",
        hu: "2 Sebzés az egyik területeden",
        ko: "당신의 지역 한 곳에 피해 2",
        ja: `あなたの土地1つで2ダメージ`,
      };
      subText = localize[lang];
      break;
    case "gain-1-time":
      localize = {
        en: "Gain 1 Time",
        fr: "Gagnez 1 Fois",
        de: "Erhalte 1 Zeit",
        pl: "Zyskaj 1 Jednostkę Czasu",
        ar: "احصل على 1 وقت",
        zh: "獲得1時間",
        hu: "Szerzel 1 Időt",
        ko: `시간 1개 획득`,
        ja: `1時間を獲得`,
      };
      subText = localize[lang];
      break;
    case "discard-cards":
    case "discard-2-cards":
      localize = {
        en: "Discard 2 Power Cards",
        fr: "Défaussez 2 Cartes Pouvoir",
        de: "2 Fähigkeiten-karten abwerfen",
        pl: "Odrzuć 2 Karty Mocy",
        ar: "تخلص من 2 بطاقات قوة",
        zh: "棄置2張法術牌",
        hu: "2 Erőkártya eldobása",
        ko: "능력 카드 2장 버리기",
        ja: `パワーカード2枚を捨てる`,
      };
      subText = localize[lang];
      break;
    case "discard-card":
    case "discard-1-card":
      localize = {
        en: "Discard 1 Power Card",
        fr: "Défaussez 1 Carte Pouvoir",
        de: "1 Fähigkeiten-karte abwerfen",
        pl: "Odrzuć 1 Kartę Mocy",
        ar: "تخلص من بطاقة قوة واحدة",
        zh: "棄置1張法術牌",
        hu: "Erőkártya eldobása",
        ko: "능력 카드 1장 버리기",
        ja: `パワーカード1枚を捨てる`,
      };
      subText = localize[lang];
      break;
    case "gain-2-time":
      localize = {
        en: "Gain 2 Time",
        fr: "Gagnez 2 Fois",
        de: "Erhalte 2 Zeit",
        pl: "Zyskaj 2 Jednostki Czasu",
        ar: "احصل على 2 وقت",
        zh: "獲得2時間",
        hu: "Szerzel 2 Időt",
        ko: "시간 2개 획득",
        ja: `2時間を獲得`,
      };
      subText = localize[lang];
      break;
    case "days-never-were":
      localize = {
        en: "Gain Power Card from Days That Never Were",
        fr: `Gagnez Carte Pouvoir des Jours Qui Ne Sont Jamais Arrivés`,
        de: "Fähigkeiten-karte von Tage die nie waren erlangen",
        pl: "Pozyskaj Kartę Mocy z Dni, Które Nigdy Nie Nadeszły",
        ar: "احصل على بطاقة قوة من الأيام التي لم تكن أبداً",
        zh: "從未現時日牌堆中獲得法術牌",
        hu: "Erőkártya szerzése a Sosem Volt Napok pakliból",
        ko: "'존재하지 않았던 나날들'에서 능력 카드 획득",
        ja: `決して訪れなかった日々からパワーカードを獲得`,
      };
      subText = localize[lang];
      break;
    case "blank":
      subText = "<br>";
      subText = subText.repeat(num || 1);
      break;
    case "empty":
      subText = "";
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
    case "inland-land":
    case "coastal-land":
      {
        const landTrim = str.split("-")[0];
        subText = `${Capitalise(landtypeNames[lang][landTrim])} ${Capitalise(
          landtypeNames[lang]["land"]
        )}`;
      }
      break;
    case "inland":
    case "coastal":
      subText = `${Capitalise(landtypeNames[lang][str])}`;
      break;
    case "empower-incarna":
      localize = {
        en: "Empower Incarna",
        fr: "Renforcer Incarna",
        de: "Incarna verstärken",
        pl: "Wzmocnij Inkarna",
        ar: `تمكين التجسد`,
        zh: `強化化身`,
        hu: "Megtestesülés Megerősítése",
        ko: `화신의 권능 활성화`,
        ja: `インカルナ強化`,
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
    case "copy":
      str = Capitalise(_localizeElements[lang][str]);
      subText = _defaultProcessIcon(str, iconNum);
      break;
    // Major/Minor/Unique
    case "major":
    case "minor":
    case "unique":
      str = Capitalise(_localizeCardTypes[lang][str]);
      subText = _defaultProcessIcon(str, iconNum);
      break;
    // Tokens
    case "explorer":
    case "town":
    case "city":
    case "blight":
    case "beasts":
    case "beast":
    case "wilds":
    case "disease":
    case "strife":
    case "badland":
    case "badlands":
    case "vitality":
      str = Capitalise(_localizeTokens[lang][str]) || str;
      subText = _defaultProcessIcon(str, iconNum);
      break;
    // and/or
    case "and":
    case "or":
    case "at":
    case "from":
      subText = _localizeConjunctions[lang][str];
      break;
    case "":
      subText = "";
      break;
    default:
      subText = _defaultProcessIcon(str, iconNum);
  }

  if (debug) {
    console.log("Return: " + subText);
  }
  _iconNameCache.set(cacheKey, subText);
  return subText;
}

function _defaultProcessIcon(str, iconNum) {
  let result =
    iconNum && iconNum > 1
      ? (numLocalize[lang][iconNum] || iconNum) + " " + Capitalise(str)
      : Capitalise(str);
  return numLocalize[lang][result] || result;
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
    case "de":
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
      ) +
      1 +
      "px";
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
  const presenceTracksBox = board.getElementsByTagName("presence-tracks")[0];

  //Optional: Starlight & Alternate (rumu) type boards
  let starlight = board.getAttribute("starlight") ? true : false;
  let rumu = board.getAttribute("rumu") ? true : false;
  if (starlight) {
    const rightRight = document.createElement("right-right");
    rightRight.appendChild(innatePowerBox);
    board.appendChild(rightRight);
    board.classList.add("starlight");
  } else if (rumu) {
    const rumuRight = document.createElement("rumu-right");
    rumuRight.appendChild(presenceTracksBox);
    rumuRight.appendChild(innatePowerBox);
    right.appendChild(rumuRight);
    board.classList.add("rumu");
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
    if (debug) {
      console.log(`growthTexts[i]`);
    }
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

  // Relax growth text
  const finalGrowthTexts = board.getElementsByTagName("growth-text");
  for (let i = 0; i < finalGrowthTexts.length; i++) {
    finalGrowthTexts[i].style.width = "unset";
    balanceText(growthTexts[i]);
    if (debug) {
      console.log("relaxing growth texts");
    }
    finalGrowthTexts[i].style.width =
      Math.ceil(
        parseFloat(window.getComputedStyle(finalGrowthTexts[i], null).getPropertyValue("width"))
      ) + "px";
  }

  // Innate Power Sizing
  console.log("RESIZING: Innate Powers");
  innatePowerSizing(board); //Moved to its own function

  // Presence Track Sizing
  console.log("RESIZING: Presence Tracks");
  //Load tracks
  const presenceTrack = board.getElementsByTagName("presence-tracks")[0];
  const energyTrack = document.getElementById("energy-track");
  const playsTrack = document.getElementById("plays-track");
  const additionalTracks = Array.from(board.getElementsByClassName("additional-track"));
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

  //Auto-tighten for Additional Tracks
  if (additionalTracks.length) {
    if (debug) {
      console.log("Additional Tracks detected, vertical tightening all tracks");
    }
    energyTrack.classList.add("vertical-tight");
    playsTrack.classList.add("vertical-tight");
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
  innatePowerBox.style.height = rumu
    ? right.clientHeight - growth.clientHeight + "px"
    : right.clientHeight - presenceTrack.clientHeight - growth.clientHeight + "px";
  if (checkOverflowHeight(innatePowerBox)) {
    innatePowerBox.classList.add("wide-levels");
    console.log("  > Widening IP levels");
  }
  if (checkOverflowHeight(innatePowerBox)) {
    energyTrack.classList.add("vertical-tight");
    console.log("  > Compressing Presence Tracks Vertically");
  }

  //Create space for top subtexts (if applicable)
  const energyNodesWithTopSubtexts = Array.from(energyTrack.getElementsByClassName("top-subtext"));
  const presenceNote = board.getElementsByTagName("presence-note")[0];
  if (energyNodesWithTopSubtexts.length) {
    console.log("found energy nodes with top subtexts");
    const maxTopSubtextHeight = Math.max(
      ...energyNodesWithTopSubtexts.map(
        (node) => node.getElementsByTagName("subtext")[0].offsetHeight
      )
    );
    const presenceTrackTitle = board.getElementsByTagName("presence-title")[0];
    if (presenceNote) {
      presenceTrackTitle.style.marginBottom = maxTopSubtextHeight + 3 + "px";
    } else {
      console.log("no note, can be more lenient");
      const nodeWithLargestSubtext = energyNodesWithTopSubtexts.reduce((prev, current) => {
        return prev.getElementsByTagName("subtext")[0].offsetHeight >
          current.getElementsByTagName("subtext")[0].offsetHeight
          ? prev
          : current;
      });
      const nodeNum = nodeWithLargestSubtext.id.match(/\d+/)[0]; // "3"
      if (nodeNum > 1) {
        console.log("largest top subtext is not under presence heading");
        presenceTrackTitle.style.marginBottom = Math.max(maxTopSubtextHeight - 25, 22) + "px";
      } else {
        console.log("large top subtext is under presence heading");
        presenceTrackTitle.style.marginBottom = maxTopSubtextHeight + "px";
      }
    }
  }

  // Set subtext widths to be their width (helps for image export)
  const subtexts = presenceTrack.getElementsByTagName("subtext");
  let subtextArray = Array.from(subtexts);

  subtextArray.forEach((subtext, i) => {
    subtextArray[i].style.width =
      Math.ceil(
        parseFloat(window.getComputedStyle(subtext).getPropertyValue("width").replace(/px/, ""))
      ) + "px";
  });

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
  debug = false;
  const presenceTracks = board.getElementsByTagName("presence-tracks")[0];
  const innatePowers = board.getElementsByTagName("innate-power");

  // Shrink Innate Power notes if needed for space
  // const innatePowerBox = board.getElementsByTagName("innate-powers")[0];
  // innatePowerBox.style.height =
  //   right.clientHeight - presenceTracks.clientHeight - growth.clientHeight + "px";
  let moveFlag = false;
  let k = 0;

  // First, if overflowing, check if its just one Innate Power and has a note, and move over the note if so
  if (checkOverflowHeight(innatePowerBox, 0)) {
    console.log("# of Innate Powers = " + innatePowers.length);
    if (innatePowers.length === 1) {
      const note = innatePowers[0].getElementsByTagName("note")[0];
      if (note) {
        note.classList.add("single-squish");
        if (debug) {
          console.log("  > Single power note detected. Moving note to side.");
        }
        moveFlag = true;
      }
    }
  }

  // Next give left innate more horizontal room
  if (checkOverflowHeight(innatePowerBox, 0)) {
    if (debug) {
      console.log("  > Innate Powers are overflowing, giving more room to IP1");
    }
    innatePowerBox.classList.add("wide-levels");
  }
  // Then tighten up the power levels
  if (checkOverflowHeight(innatePowerBox, 0)) {
    if (debug) {
      console.log("  > Innate Powers overflowing, shrinking space between levels");
    }
    innatePowerBox.classList.add("tight-levels");
  }
  // Then tighten up the power levels again
  if (checkOverflowHeight(innatePowerBox, 0)) {
    if (debug) {
      console.log("  > Innate Powers still overflowing, shrinking space between levels more");
    }
    innatePowerBox.classList.add("really-tight-levels");
  }
  // If one power & overflowing, make it wrap
  if (checkOverflowHeight(innatePowerBox, 0) && innatePowers.length === 1) {
    innatePowers[0].classList.add("two-column");
  }

  // Then tighten up the power level line spacing
  if (checkOverflowHeight(innatePowerBox, 0)) {
    if (debug) {
      console.log("  > Innate Powers overflowing, shrinking level description line height");
    }
    innatePowerBox.classList.add("tight-line-height");
  }

  if (checkOverflowHeight(innatePowerBox, 0)) {
    if (debug) {
      console.log("Innate Powers overflowing, shrinking notes (if applicable)...");
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
      while (checkOverflowHeight(innatePowerBox, 0)) {
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

  // Shift presence nodes (per user input)
  const presenceNodes = Array.from(presenceTracks.getElementsByTagName("presence-node"));
  presenceNodes.forEach((node) => {
    if (node.getAttribute("shift")) {
      node.parentNode.style.transform = node.getAttribute("shift");
      node.removeAttribute("shift");
    }
  });

  //Optional: Flip X boards
  let flipboard = board.getAttribute("flipboard") ? true : false;
  if (flipboard) {
    board.classList.add("flipboard");
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

  // Check for overflow in name
  let powerTitles = board.getElementsByTagName("innate-power-title");
  for (let i = 0; i < powerTitles.length; i++) {
    let el = powerTitles[i];
    let j = 0;
    while (checkOverflowWidth(el, 0)) {
      const style = window.getComputedStyle(powerTitles[i], null).getPropertyValue("font-size");
      const fontSize = parseFloat(style);
      powerTitles[i].style.fontSize = fontSize - 1 + "px";
      // safety valve
      j += 1;
      if (j > 5) {
        break;
      }
    }
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
  const effects = Array.from(board.getElementsByTagName("effect"));
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

  for (let i = 0; i < effects.length; i++) {
    // Scale the text width to the threshold size...
    effects[i].style.paddingLeft = outerThresholdWidth[i] + "px";
    const textHeight = effects[i].offsetHeight;
    const thresholdWidth = thresholds[i].offsetWidth;
    if (textHeight < 50) {
      effects[i].classList.add("single-line");
      if (debug) {
        console.log("single line");
      }
      // Align-middle the text if its a single line
    } else if (textHeight > 100 && thresholdWidth > 80) {
      // Wrap effects below the threshold if its greater than three lines
      if (debug) {
        console.log("wrapping large text");
      }
      effects[i].style.paddingLeft = "0px";
      levels[i].classList.add("description-wrap");
    } else {
      // It doesn't need to wrap. Line up threshold with middle of effect
      thresholds[i].classList.add("no-wrap");
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
  } else {
    console.log("One line, no balancing possible");
  }
}

function reduceLines(el) {
  const initialHeight = el.offsetHeight;
  let debug = false;
  let currentHeight = initialHeight;
  let j = 0;
  let k = Math.trunc(el.offsetWidth);
  if (debug) {
    console.log(el.textContent + ": starting height = " + initialHeight);
  }
  while (currentHeight >= initialHeight) {
    k = k + 1;
    el.style.width = k + "px";
    currentHeight = el.offsetHeight;
    j += 1;
    if (j > 50) {
      if (debug) {
        console.log("Max line reduction reached for");
      }
      console.log(el);
      break;
    }
  }
  el.style.width = el.offsetWidth + "px";
  if (debug) {
    console.log(el.textContent + ": final height = " + currentHeight);
  }
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
    currentPowerHTML += `<note id='${innatePowerID}note'>${noteValue}</note>`;
  }

  //Innate Power Levels and Thresholds
  const currentLevels = innatePowerHTML.getElementsByTagName("level");
  for (let j = 0; j < currentLevels.length; j++) {
    currentPowerHTML += writeInnateLevel(currentLevels[j], innatePowerID + "L" + j);
  }

  currentPowerHTML += "</description-container></innate-power>";
  return currentPowerHTML;
}

// function getRangeModel(rangeString) {
//   if (rangeString === "none" || rangeString === "") {
//     return "<no-range></no-range>";
//   } else {
//     let result = "";
//     for (const item of rangeString.split(",")) {
//       if (!isNaN(item)) {
//         result += `<range>${item}</range>`;
//       } else {
//         result += `<icon class="${item}"></icon>`;
//       }
//     }
//     return result;
//   }
// }

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
    levelHTML += `<level><level-note>${currentLevel.innerHTML}</level-note></level>`;
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
    levelHTML += "<effect class='" + isLong + "' id='" + levelID + "'>";
    const currentDescription = currentLevel.innerHTML;
    levelHTML += currentDescription + "</effect></level>";
  }

  return levelHTML;
}

function writeInnateThreshold(currentThreshold, levelID = "placeholder") {
  let debug = false;
  const regExp = /\(([^)]+)\)/;
  let thresholdHTML = "";
  if (debug) {
    console.log("Writing threshold: " + currentThreshold);
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
        currentThresholdPieces[
          k
        ] = `<cost-threshold><cost-text>${Cost[lang]}</cost-text><icon class='${customCost} cost-custom'>
          <value>-${currentNumeral}</value></icon></cost-threshold>`;
      } else {
        currentThresholdPieces[
          k
        ] = `<cost-threshold><cost-text>${Cost[lang]}</cost-text><cost-energy><value>- ${currentNumeral}
        </value></cost-energy></cost-threshold>`;
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
  targetTitle = targetTitle.toUpperCase() === "TARGET LAND" ? "land" : "spirit";

  // localize
  let infoTitles = {
    en: {
      speed: "SPEED",
      range: "RANGE",
      land: "TARGET LAND",
      spirit: "TARGET",
    },
    fr: {
      speed: "VITESSE",
      range: "PORTEE",
      land: "REGION CIBLE",
      spirit: "CIBLE",
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
    hu: {
      speed: "SEBESSÉG",
      range: "TÁVOLSÁG",
      land: "CÉLTERÜLET",
      spirit: "CÉLPONT",
    },
    ko: {
      speed: "속도",
      range: "사정 거리",
      land: "대상 지역",
      spirit: "대상",
      threshold: "조건 발동",
    },
    ja: {
      speed: "速度",
      range: "距離",
      land: "対象の土地",
      spirit: "対象",
      threshold: "必要条件",
    },
  };

  let newPowerHTML = "";

  //Innate Power Speed and Range Header
  newPowerHTML += `<info-container><info-title><info-title-speed>${infoTitles[lang].speed}</info-title-speed><info-title-range>${infoTitles[lang].range}</info-title-range>`;

  //Innate Power Target Header
  newPowerHTML += `<info-title-target id='${innatePowerID}targettitle'>
    ${infoTitles[lang][targetTitle]}
    </info-title-target></info-title><innate-info>`;

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

function buildSpecialRules() {
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

  // Tag special rules with IDs
  for (let j = 0; j < specialRuleList.length; j++) {
    specialRuleList[j].id = "sr" + j + "effect";
    specialRuleNameList[j].id = "sr" + j + "name";
  }

  parseSpecialRules(board);

  // Transfer over the custom name
  if (specialRules.getAttribute("customname")) {
    specialRuleSection.setAttribute("customname", specialRules.getAttribute("customname"));
  }
}

function parseSpecialRules(board) {
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

  // Add code for tables.

  // Capture lines to control line break heights
  const specialRuleList = board.getElementsByTagName("special-rule");
  let specialRulesArray = Array.from(specialRuleList);
  specialRulesArray.forEach((specialRule) => {
    processRulesText(specialRule); // Function from common
  });
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
    fr: {
      growth: "croissance",
      presence: "pistes de présence",
      innate: "pouvoirs innés",
      special: "règles spéciales",
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
    hu: {
      growth: "NÖVEKEDÉS",
      presence: "JELENLÉT",
      innate: "ŐSI ERŐK",
      special: "KÜLÖNLEGES SZABÁLYOK",
    },
    ko: {
      growth: "성장",
      presence: "현신",
      innate: "타고난 능력",
      special: "특별 규칙",
    },
    ja: {
      growth: "成長",
      presence: "プレゼンス",
      innate: "固有パワー",
      special: "特別ルール",
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

function addCustomOverlayImages(board) {
  const overlayImages = Array.from(board.querySelectorAll("overlay-image"));
  overlayImages.forEach((image) => {
    let overlayContainer = document.createElement("overlay-container");
    board.appendChild(overlayContainer);
    overlayContainer.appendChild(image);
    image.style.top = image.getAttribute("imgy") + "px";
    image.style.left = image.getAttribute("imgx") + "px";
    if (image.getAttribute("imgwidth")) {
      image.style.width = image.getAttribute("imgwidth") + "px";
    }
    if (image.getAttribute("imgheight")) {
      image.style.height = image.getAttribute("imgheight") + "px";
    }
    if (image.hasAttribute("imgurl")) {
      image.style.backgroundImage = `url(${image.getAttribute("imgurl")})`;
      image.removeAttribute("imgurl");
    }
  });
}
