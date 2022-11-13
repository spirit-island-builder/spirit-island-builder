export const addSpecialRule = (spiritBoard, ruleName = "", ruleEffect = "") => {
  console.log('here we are')
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

export const addGrowthGroup = (spiritBoard, setIndex, groupCost = "", groupTint = "", groupTitle = "") => {
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
  spiritBoard.innatePowers.powers[powerIndex].levels.push({
    id: spiritBoard.innatePowers.powers[powerIndex].levels.length,
    threshold: levelThreshold,
    effect: levelEffect,
    isLong: levelLong,
  });
  return spiritBoard;
};

export const addCustomIcon = (customIcons, iconName = "") => {
  customIcons.icons.push({
    id: customIcons.icons.length,
    name: iconName,
  });
  return customIcons;
};

export const takeScreenShot = async (frame, divAroundIframe, frameLarge) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const videoElem = document.createElement("video");
  window.scrollTo(0, 0);

  try {
    const captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    videoElem.autoplay = true;
    videoElem.srcObject = captureStream;
    // No idea why this setTimeout is needed (it shouldn't be) but without it the canvas is always blank. It seems like the videoElem.srcObject = captureStream line doesn't take effect right away.
    await window.setTimeout(() => {
      console.log("frame.getBoundingClientRect(): ", frame.getBoundingClientRect());
      console.log(
        "divAroundIframe.getBoundingClientRect(): ",
        divAroundIframe.getBoundingClientRect()
      );
      console.log("divAroundIframe.offsetWidth: ", divAroundIframe.offsetWidth);
      console.log("divAroundIframe.offsetHeight: ", divAroundIframe.offsetHeight);
      console.log("divAroundIframe.clientWidth: ", divAroundIframe.clientWidth);
      console.log("divAroundIframe.clientHeight: ", divAroundIframe.clientHeight);
      const board = frame.contentWindow.document.querySelectorAll("board")[0];
      console.log("board.getBoundingClientRect(): ", board.getBoundingClientRect());
      let boardWidth = board.getBoundingClientRect().width;
      let boardHeight = board.getBoundingClientRect().height;
      if (frameLarge) {
        boardWidth = boardWidth * (1 - 0.745);
        boardHeight = boardHeight * (1 - 0.745);
      } else {
        boardWidth = boardWidth * 0.55;
        boardHeight = boardHeight * 0.55;
        // boardWidth = boardWidth * (1 - 0.55)
        // boardHeight = boardHeight * (1 - 0.55)
      }
      canvas.width = boardWidth;
      canvas.height = boardHeight;
      context.drawImage(
        videoElem,
        divAroundIframe.getBoundingClientRect().left,
        divAroundIframe.getBoundingClientRect().top,
        boardWidth,
        boardHeight,
        0,
        0,
        boardWidth,
        boardHeight
      );
      const screenshot = canvas.toDataURL("image/png");
      const saveLink = document.createElement("a");
      saveLink.href = screenshot;
      saveLink.download = "boardFront.png";
      document.body.appendChild(canvas);
      captureStream.getTracks().forEach((track) => track.stop());

      document.body.appendChild(saveLink);
      saveLink.click();
      videoElem.srcObject = undefined;
    }, 1000);
  } catch (err) {
    console.error("Error: " + err);
  }
};
