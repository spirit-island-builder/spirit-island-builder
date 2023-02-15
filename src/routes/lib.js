export const addSpecialRule = (spiritBoard, ruleName = "", ruleEffect = "") => {
  let focusId = "ruleNameInput" + spiritBoard.specialRules.rules.length;
  spiritBoard.specialRules.rules.push({
    id: spiritBoard.specialRules.rules.length,
    name: ruleName,
    effect: ruleEffect,
  });
  //Set the focus to the Special Rule if it is visible.
  if (spiritBoard.specialRules.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }
  return spiritBoard;
};

export const removeSpecialRule = (spiritBoard, index) => {
  spiritBoard.specialRules.rules.splice(index, 1);
  spiritBoard.specialRules.rules.forEach((rule, i) => {
    rule.id = i;
  });
  return spiritBoard;
};

export const addGrowthSet = (spiritBoard, growthChoiceText = "") => {
  spiritBoard.growth.growthSets.push({
    id: spiritBoard.growth.growthSets.length,
    choiceText: growthChoiceText,
    growthGroups: [],
  });
  return spiritBoard;
};

export const addGrowthGroup = (
  spiritBoard,
  setIndex,
  groupCost = "",
  groupTint = "",
  groupTitle = ""
) => {
  let groupHasCost = false;
  let groupHasTint = false;
  let groupHasTitle = false;
  if (groupCost) {
    groupHasCost = true;
  }
  if (groupTint) {
    groupHasTint = true;
  }
  if (groupTitle) {
    groupHasTitle = true;
  }
  spiritBoard.growth.growthSets[setIndex].growthGroups.push({
    id: spiritBoard.growth.growthSets[setIndex].growthGroups.length,
    cost: groupCost,
    tint: groupTint,
    title: groupTitle,
    hasCost: groupHasCost,
    hasTint: groupHasTint,
    hasTitle: groupHasTitle,
    growthActions: [],
  });
  return spiritBoard;
};

export const addGrowthAction = (spiritBoard, setIndex, groupIndex, actionEffect = "") => {
  let focusId =
    "growthSet" +
    setIndex +
    "Group" +
    groupIndex +
    "Action" +
    spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.length;
  spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.push({
    id: spiritBoard.growth.growthSets[setIndex].growthGroups[groupIndex].growthActions.length,
    effect: actionEffect,
  });
  //Set the focus to the Growth Action if it is visible.
  if (spiritBoard.growth.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }
  return spiritBoard;
};

export const addEnergyTrackNode = (spiritBoard, nodeEffect = "") => {
  let focusId = "energy" + spiritBoard.presenceTrack.energyNodes.length;
  spiritBoard.presenceTrack.energyNodes.push({
    id: spiritBoard.presenceTrack.energyNodes.length,
    effect: nodeEffect,
  });
  //Set the focus to the new Node if it is visible.
  if (spiritBoard.presenceTrack.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }
  return spiritBoard;
};

export const addPlaysTrackNode = (spiritBoard, nodeEffect = "") => {
  let focusId = "plays" + spiritBoard.presenceTrack.playsNodes.length;
  spiritBoard.presenceTrack.playsNodes.push({
    id: spiritBoard.presenceTrack.playsNodes.length,
    effect: nodeEffect,
  });
  //Set the focus to the new Node if it is visible.
  if (spiritBoard.presenceTrack.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }
  return spiritBoard;
};

export const addInnatePower = (
  spiritBoard,
  powerName = "",
  powerSpeed = "",
  powerRange = "",
  powerTarget = "",
  powerTargetTitle = "",
  powerNote = ""
) => {
  let focusId = "powerName" + spiritBoard.innatePowers.powers.length;
  spiritBoard.innatePowers.powers.push({
    id: spiritBoard.innatePowers.powers.length,
    name: powerName,
    speed: powerSpeed,
    range: powerRange,
    target: powerTarget,
    targetTitle: powerTargetTitle,
    note: powerNote,
    noteShow: true,
    levels: [],
  });
  //Set the focus to the new Power if it is visible.
  if (spiritBoard.innatePowers.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }
  return spiritBoard;
};

export const addLevel = (
  spiritBoard,
  powerIndex,
  levelThreshold = "",
  levelEffect = "",
  levelLong = false
) => {
  let focusId =
    "power" +
    powerIndex +
    "levelThreshold" +
    spiritBoard.innatePowers.powers[powerIndex].levels.length;
  spiritBoard.innatePowers.powers[powerIndex].levels.push({
    id: spiritBoard.innatePowers.powers[powerIndex].levels.length,
    threshold: levelThreshold,
    effect: levelEffect,
    isLong: levelLong,
  });

  if (spiritBoard.innatePowers.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }

  return spiritBoard;
};

export const addCustomIcon = (customIcons, iconName = "") => {
  customIcons.icons.push({
    id: customIcons.icons.length,
    name: iconName,
  });
  return customIcons;
};

export const selectNode = (event) => {
  let nodeID = event.target.id;
  document.getElementById(nodeID).select();
};

export const nextNode = (event) => {
  if (event.key === "Enter") {
    let currentID = event.target.id;
    let numlessID = currentID.replace(/\d/g, "");
    let focusID = "";
    let regFindNumbers = /^\d+|\d+\b|\d+(?=\w)/g;
    let numMatches = currentID.match(regFindNumbers);

    switch (numlessID) {
      //Special Rule
      case "ruleNameInput":
        focusID = currentID.replace("Name", "Effect");
        break;
      case "ruleEffectInput":
        focusID = currentID.replace("Effect", "Name");
        focusID = focusID.replace(/\d+$/, function (m) {
          return parseInt(m) + 1;
        });
        if (document.getElementById(focusID) === null) {
          focusID = "addSpecialRule";
        }
        break;
      //Growth
      case "growthSetGroupAction":
        focusID = currentID.replace(/\d+$/, function (m) {
          return parseInt(m) + 1;
        });
        if (document.getElementById(focusID) === null) {
          focusID = currentID.replace("Action", "AddAction");
          focusID = focusID.slice(0, -1);
        }
        break;
      case "setgroupcost":
        focusID = currentID.replace("cost", "tint");
        if (document.getElementById(focusID) !== null) {
          break;
        }
        currentID = focusID;
      // Intentionally fallthrough.
      case "setgrouptint":
        focusID = currentID.replace("tint", "title");
        if (document.getElementById(focusID) !== null) {
          break;
        }
        currentID = focusID;
      // Intentionally fallthrough.
      case "setgrouptitle":
        focusID = "growthSet" + numMatches[0] + "Group" + numMatches[1] + "Action0";
        break;
      //Presence Tracks
      case "energybuilder":
      case "playsbuilder":
        focusID = currentID.replace(/(\d+)+/g, function (match, number) {
          return parseInt(number) + 1;
        });
        if (document.getElementById(focusID) === null) {
          focusID = currentID + "add";
        }
        break;
      //Innate Powers
      case "powerlevelThreshold":
        focusID = currentID.replace("Threshold", "Effect");
        break;
      case "powerlevelEffect":
        focusID = currentID.replace("Effect", "Threshold");
        focusID = focusID.replace(/\d+$/, function (m) {
          return parseInt(m) + 1;
        });
        if (document.getElementById(focusID) === null) {
          focusID = "power" + numMatches[0] + "addLevel";
        }
        break;
      case "powerName":
        focusID = "powerRange" + numMatches[0];
        break;
      case "powerRange":
        focusID = "powerTarget" + numMatches[0];
        break;
      case "powerTarget":
        focusID = "powerNote" + numMatches[0];
        break;
      case "powerNote":
        focusID = "power" + numMatches[0] + "levelThreshold0";
        if (document.getElementById(focusID) === null) {
          focusID = "power" + numMatches[0] + "addLevel";
        }
        break;
    }

    document.getElementById(focusID).focus();
  }
};

export async function loadHTML(url) {
  let response = await fetch(url);
  let parser = new DOMParser();
  return parser.parseFromString(await response.text(), "text/html");
}

/**
 * If url is provided, resolve it relative to baseURI.
 * Otherwise, return null.
 *
 * This is meant to be used when reading a possibly relative URL
 * that may be missing from a document.
 *
 * @param {string|URL|null} url
 * @param {URL} baseURI
 * @returns {string|URL|null}
 */
export const maybeResolveURL = (url, baseURI) => {
  // We can't resolve paths relative to `blob:` or `data:` URLs,
  // so we just return the given URL in that case, or if there is
  // no base URI.
  if (!baseURI || !["blob:", "data:"].includes(baseURI.protocol)) {
    return url;
  } else {
    if (url) {
      return new URL(url, baseURI);
    } else {
      return null;
    }
  }
};
