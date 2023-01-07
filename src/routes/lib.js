export const addSpecialRule = (spiritBoard, ruleName = "", ruleEffect = "") => {
  var focusId = "ruleNameInput" + spiritBoard.specialRules.rules.length;
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
  var focusId =
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
  var focusId = "energy" + spiritBoard.presenceTrack.energyNodes.length;
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
  var focusId = "plays" + spiritBoard.presenceTrack.playsNodes.length;
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
  var focusId = "powerName" + spiritBoard.innatePowers.powers.length;
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
  var focusId =
    "power" +
    powerIndex +
    "levelThreshold" +
    spiritBoard.innatePowers.powers[powerIndex].levels.length;
  console.log(focusId);
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

export const downloadFile = (fileURL, fileName) => {
  var element = document.createElement("a");
  element.setAttribute("href", fileURL);
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const downloadString = (mimeType, fileContent, fileName) => {
  downloadFile(`${mimeType},${encodeURIComponent(fileContent)}`, fileName);
};

export const takeScreenshot = (frame, fileNames, elementNamesInIframe) => {
  elementNamesInIframe.forEach((elementNameInIframe, index) => {
    frame.contentWindow
      .takeScreenshot(elementNameInIframe)
      .then((imageURL) => downloadFile(imageURL, fileNames[index]));
  });
};

export const nextNode = (event) => {
  if (event.key == "Enter") {
    var currentID = event.target.id;
    var numlessID = currentID.replace(/\d/g, "");
    var focusID = "";
    var regFindNumbers = /^\d+|\d+\b|\d+(?=\w)/g;
    var numMatches = currentID.match(regFindNumbers);

    switch (numlessID) {
      //Special Rule
      case "ruleNameInput":
        focusID = currentID.replace("Name", "Effect");
        break;
      //Growth
      case "growthSetGroupAction":
        focusID = currentID.replace(/\d+$/, function (m) {
          return parseInt(m) + 1;
        });
        if (document.getElementById(focusID) == null) {
          focusID = currentID.replace("Action", "AddAction");
          focusID = focusID.slice(0, -1);
        }
        break;
      //Presence Tracks
      case "energybuilder":
      case "playsbuilder":
        focusID = currentID.replace(/(\d+)+/g, function (match, number) {
          return parseInt(number) + 1;
        });
        if (document.getElementById(focusID) == null) {
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
        if (document.getElementById(focusID) == null) {
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
        if (document.getElementById(focusID) == null) {
          focusID = "power" + numMatches[0] + "addLevel";
        }
        break;
    }

    document.getElementById(focusID).focus();
  }
};
