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

export const moveSpecialRule = (spiritBoard, to, from) => {
  // console.log(spiritBoard.specialRules.rules.splice(from, 1)[0])
  console.log(to);
  spiritBoard.specialRules.rules.splice(to, 0, spiritBoard.specialRules.rules.splice(from, 1)[0]);
  spiritBoard.specialRules.rules.forEach((rule, i) => {
    rule.id = i;
  });
  console.log(spiritBoard.specialRules.rules);
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
  groupTitle = "",
  groupTitleLeft = false,
  groupNewRow = false
) => {
  let groupHasCost = false;
  let groupHasTint = false;
  let groupHasTitle = false;
  let groupHasLeftTitle = false;
  if (groupCost) {
    groupHasCost = true;
  }
  if (groupTint) {
    groupHasTint = true;
  }
  if (groupTitle) {
    groupHasTitle = true;
  }
  if (groupTitleLeft) {
    groupHasLeftTitle = true;
  }
  spiritBoard.growth.growthSets[setIndex].growthGroups.push({
    id: spiritBoard.growth.growthSets[setIndex].growthGroups.length,
    cost: groupCost,
    tint: groupTint,
    title: groupTitle,
    hasCost: groupHasCost,
    hasTint: groupHasTint,
    hasTitle: groupHasTitle,
    hasTitleLeft: groupHasLeftTitle,
    newRow: groupNewRow,
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

// Splits a <growth-group values="..."> list back into one string per growth
// action. Semicolons inside parentheses belong to the action's own options
// (presence-node(split(fire;animal))), so only the ones outside count. Must stay
// in step with _semicolonOutsideParensRegex in _global/js/board_front.js — the
// inner page splits the same attribute the same way.
export const splitGrowthValues = (values) => {
  return values.split(/;(?![^(]*\))/);
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

export const addAdditionalTrackNode = (track, nodeEffect = "") => {
  let focusId = "plays" + track.additionalNodes.length;
  track.additionalNodes.push({
    id: track.additionalNodes.length,
    effect: nodeEffect,
  });
  //Set the focus to the new Node if it is visible.
  if (track.isVisible) {
    setTimeout(() => {
      document.getElementById(focusId).focus();
    }, 100);
  }
  return track;
};

export const addPresenceTrack = (spiritBoard) => {
  spiritBoard.presenceTrack.hasAdditionalTracks = true;
  if (spiritBoard.presenceTrack.additionalTracks) {
    spiritBoard.presenceTrack.additionalTracks.push({
      id: spiritBoard.presenceTrack.additionalTracks.length,
      additionalNodes: [
        {
          id: 0,
          effect: "",
        },
      ],
    });
  } else {
    spiritBoard.presenceTrack["additionalTracks"] = [
      {
        id: 0,
        additionalNodes: [
          {
            id: 0,
            effect: "",
          },
        ],
      },
    ];
  }
  console.log(spiritBoard.presenceTrack);
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

  setTimeout(() => {
    if (document.getElementById(focusId) !== null) {
      document.getElementById(focusId).focus();
    }
  }, 100);

  return spiritBoard;
};

// A custom icon's proportions belong to its image, like every built-in icon's
// (see the --icon-ratio tokens in _global/css/icon-ratios.css). Built-in art is
// measured at build time; a user upload can only be measured once it exists, so
// width/height ride on the icon object and are written into its style rule.
export const measureImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
};

const parseIconRatio = (ratioText) => {
  // "640 / 480" as written by getCustomIconHTML; tolerate a bare number too.
  const match = /^\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?\s*$/.exec(ratioText || "");
  if (!match) return null;
  return { width: Number(match[1]), height: match[2] === undefined ? 1 : Number(match[2]) };
};

export const addCustomIcon = (
  customIcons,
  iconName = "",
  customIconName = "",
  width = null,
  height = null
) => {
  customIcons.icons.push({
    id: customIcons.icons.length,
    name: iconName,
    displayName: customIconName ?? "custom" + customIcons.icons.length,
    width,
    height,
  });
  return customIcons;
};

export const loadCustomIconsFromHTML = (htmlElement, customIcons, baseURI) => {
  const spiritStyle = htmlElement.querySelectorAll("style")[0];
  if (spiritStyle) {
    console.log("Loading Custom Icons from HTML (Lib)");
    customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
    if (spiritStyle.sheet.cssRules) {
      let iconStyles = Array.from(spiritStyle.sheet.cssRules);
      let iconsText = spiritStyle.textContent.split(/icon.custom\d+{/);
      iconsText.shift();
      const measurements = [];
      iconStyles.forEach((iconStyle, i) => {
        let customIconURI = iconStyle.style.backgroundImage.split(/['"]/)[1];
        let customIconName = "";
        if (iconsText[i].includes("data-iconname")) {
          customIconName = iconsText[i]
            .split("data-iconname:")[1]
            .trim()
            .split(";")[0]
            .replaceAll("'", "");
        }
        let customIcon = maybeResolveURL(customIconURI, baseURI);
        // data-iconname is an invalid property the parser drops, hence the text
        // split above; --icon-ratio is a real custom property and survives.
        const ratio = parseIconRatio(iconStyle.style.getPropertyValue("--icon-ratio"));
        customIcons = addCustomIcon(
          customIcons,
          customIcon,
          customIconName,
          ratio ? ratio.width : null,
          ratio ? ratio.height : null
        );
        if (!ratio) {
          // Older files predate the ratio token: measure the image instead.
          const icon = customIcons.icons[customIcons.icons.length - 1];
          measurements.push(
            measureImage(customIcon).then((size) => {
              if (!size) return false;
              icon.width = size.width;
              icon.height = size.height;
              return true;
            })
          );
        }
      });
      // The caller renders synchronously right after this returns, so the first
      // paint is square. Once the measurements land, ask the mounted
      // PreviewFrame to re-render from state (it forwards this to the tab's
      // reloadPreview). One event for the whole batch, and none if nothing
      // could be measured.
      Promise.all(measurements).then((results) => {
        if (results.some(Boolean)) {
          document.dispatchEvent(new CustomEvent("custom-icons-measured"));
        }
      });
    }
  }
  return customIcons;
};

export const getCustomIconHTML = (customIcons) => {
  console.log("Saving Custom Icons to HTML...");
  let customIconText = "";
  customIcons.icons.forEach((icon) => {
    // Same shape as the generated rules in _global/css: the ratio sits in the
    // rule that sets the background-image, so the sizing engine in global.css
    // can give the icon its art's proportions instead of a square.
    const ratioText =
      icon.width && icon.height ? ` --icon-ratio: ${icon.width} / ${icon.height};` : "";
    customIconText +=
      "icon.custom" +
      (icon.id + 1) +
      `{data-iconname:'${icon.displayName}'; background-image: url('${icon.name}');${ratioText} }\n`;
  });
  return customIconText;
};

export const selectNode = (event) => {
  let nodeID = event.target.id;
  document.getElementById(nodeID).select();
};

export const nextNode = (event) => {
  if (event.key === "Enter") {
    console.log(event);
    if (!event.srcElement.classList.contains("textarea") || event.shiftKey) {
      event.preventDefault();
      const el = event.target;
      let focusID = el.dataset.nextField;
      if (!focusID) return;
      if (document.getElementById(focusID) === null) {
        focusID = el.dataset.nextFieldDefault || "";
      }
      if (focusID && document.getElementById(focusID) !== null) {
        document.getElementById(focusID).focus();
      } else {
        console.log("No next node");
      }
    }
  }
};

// eslint-disable-next-line no-unused-vars
const nextNode_DEPRECATED = (event) => {
  if (event.key === "Enter") {
    console.log(event);
    if (!event.srcElement.classList.contains("textarea") || event.shiftKey) {
      // For textarea, require SHIFT to advance
      event.preventDefault();
      let currentID = event.target.id;
      let numlessID = currentID.replace(/\d/g, "");
      let focusID = "";
      let regFindNumbers = /^\d+|\d+\b|\d+(?=\w)/g;
      let numMatches = currentID.match(regFindNumbers);

      switch (numlessID) {
        //Board - Special Rule
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
        //Board - Growth
        case "growthDirections":
          focusID = "growthSet0Group0Action0";
          if (document.getElementById(focusID) === null) {
            break;
          }
          break;
        case "growthSetChoice":
          focusID = "growthSet" + numMatches[0] + "Group0Action0";
          if (document.getElementById(focusID) === null) {
            break;
          }
          break;
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
        //Board - Presence Tracks
        case "energybuilder":
        case "playsbuilder":
          focusID = currentID.replace(/(\d+)+/g, function (match, number) {
            return parseInt(number) + 1;
          });
          if (document.getElementById(focusID) === null) {
            focusID = currentID + "add";
          }
          break;
        case "additionalnodebuilder":
          focusID = "additional" + numMatches[0] + "node" + (numMatches[1] + 1) + "builder";
          if (document.getElementById(focusID) === null) {
            focusID = currentID + "add";
          }
          break;
        //Board - Innate Powers
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
        // Lore
        case "spiritLoreNameInput":
          focusID = "spiritLoreInput";
          break;
        case "spiritLoreSetup":
          focusID = "spiritLorePlaystyle";
          break;
        case "spiritLorePlaystyle":
          focusID = "spiritLoreComplexity";
          break;
        case "spiritLoreComplexity":
          focusID = "spiritLoreComplexityValue";
          break;
        case "spiritLoreComplexityValue":
          focusID = "spiritLoreOffense";
          break;
        case "spiritLoreOffense":
          focusID = "spiritLoreControl";
          break;
        case "spiritLoreControl":
          focusID = "spiritLoreFear";
          break;
        case "spiritLoreFear":
          focusID = "spiritLoreDefense";
          break;
        case "spiritLoreDefense":
          focusID = "spiritLoreUtility";
          break;
        case "spiritLoreUtility":
          focusID = "spiritLoreUses";
          break;
        case "spiritLoreUses":
          focusID = "spiritLoreNote";
          break;
        // Power Card
        case "cardName":
          focusID = "cardCost" + numMatches[0];
          break;
        case "cardCost":
          focusID = "cardRange" + numMatches[0];
          break;
        case "cardRange":
          focusID = "cardTarget" + numMatches[0];
          break;
        case "cardTarget":
          focusID = "cardRules" + numMatches[0];
          break;
        case "cardRules":
          focusID = "powerThresholdCondition" + numMatches[0];
          break;
        case "powerThresholdCondition":
          focusID = "cardThreshold" + numMatches[0];
          break;
        // Adversary
        case "adversaryNameInput":
          focusID = "baseDifficulty";
          break;
        case "baseDifficulty":
          focusID = "LossConditionInput";
          break;
        case "LossConditionInput":
          focusID = "lossConditionEffectInput";
          break;
        case "lossConditionEffectInput":
          focusID = "EscalationInput";
          break;
        case "EscalationInput":
          focusID = "escalationEffectInput";
          break;
        case "levelNameInput":
          focusID = "levelDifficultyInput" + numMatches[0];
          break;
        case "levelDifficultyInput":
          focusID = "levelFearInput" + numMatches[0];
          break;
        case "levelFearInput":
          focusID = "levelEffectInput" + numMatches[0];
          break;
        case "levelEffectInput":
          focusID = "levelSecondNameInput" + numMatches[0];
          if (document.getElementById(focusID) === null) {
            focusID = "levelNameInput" + numMatches[0];
            focusID = focusID.replace(/\d+$/, function (m) {
              return parseInt(m) + 1;
            });
          }
          break;
        case "levelSecondNameInput":
          focusID = "levelSecondEffectInput" + numMatches[0];
          break;
        case "levelSecondEffectInput":
          focusID = "levelNameInput" + numMatches[0];
          focusID = focusID.replace(/\d+$/, function (m) {
            return parseInt(m) + 1;
          });
          break;
        // Aspect
        case "aspectInput":
          focusID = "replacesInput0";
          if (document.getElementById(focusID) === null) {
            focusID = "aspectSpiritName";
          }
          break;
        case "partReplacesInput":
          focusID = currentID.replace("ReplacesInput", "RulesReplacedInput");
          break;
        case "partRulesReplacedInput":
          focusID = currentID.replace("RulesReplacedInput", "ReplacesInput");
          focusID = focusID.replace(/\d+$/, function (m) {
            return parseInt(m) + 1;
          });
          if (document.getElementById(focusID) === null) {
            focusID = focusID.replace("ReplacesInput", "addReplacement");
            focusID = focusID.replace(/\d+$/, "");
            console.log(focusID);
          }
          break;
        case "partRuleNameInput":
          focusID = currentID.replace("RuleNameInput", "RuleEffectInput");
          break;
        // Blight Cards
        case "blightCardName":
          focusID = "blightCardBlightPerPlayer";
          break;
        case "blightCardBlightPerPlayer":
          focusID = "blightCardEffect";
          break;
        // Incarna Token
        case "incarnaTokenName":
          focusID = "incarnaTokenIcon";
          break;
        case "incarnaTokenIcon":
          focusID = "incarnaTokenToken";
          break;
        case "incarnaTokenToken":
          focusID = "incarnaTokenEmpoweredToken";
          break;
        // Scenarios
        case "scenarioNameInput":
          focusID = "baseDifficulty";
          break;
        case "commentLore":
          focusID = "panel0comment0Front";
          break;
        case "panelcommentFront":
          focusID = "panel" + numMatches[0] + "comment" + (parseInt(numMatches[1]) + 1) + "Front";
          if (document.getElementById(focusID) === null) {
            focusID = "panel" + (parseInt(numMatches[0]) + 1) + "comment0Front";
          }
          console.log(focusID);
          break;
        case "commentBackLeft":
          focusID = "comment" + (parseInt(numMatches[0]) + 1) + "BackLeft";
          if (document.getElementById(focusID) === null) {
            focusID = "comment0BackRight";
          }
          console.log(focusID);
          break;
        case "commentBackRight":
          focusID = "comment" + (parseInt(numMatches[0]) + 1) + "BackRight";
          console.log(focusID);
          break;
        // Event card
        case "eventCardName":
          focusID = "eventCardLore";
          break;
        case "eventCardLore":
          focusID = "subeventName0";
          break;
        case "subeventName":
          focusID = "subeventEffect" + numMatches[0];
          break;
        case "subeventEffect":
          focusID = "subeventName" + (parseInt(numMatches[0]) + 1);
          break;
        case "tokenEventName":
          focusID = "tokenEventTokens" + numMatches[0];
          break;
        case "tokenEventTokens":
          focusID = "tokenEventEffects" + numMatches[0];
          break;
        case "tokenEventEffects":
          focusID = "tokenEventName" + (parseInt(numMatches[0]) + 1);
          break;
      }

      if (document.getElementById(focusID) === null) {
        console.log("No next node");
      } else {
        document.getElementById(focusID).focus();
      }
    }
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
  if (!baseURI || ["blob:", "data:"].includes(baseURI.protocol)) {
    return url;
  } else {
    if (url) {
      return new URL(url, baseURI);
    } else {
      return null;
    }
  }
};
