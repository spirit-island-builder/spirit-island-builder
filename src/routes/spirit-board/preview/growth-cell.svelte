<script context="module">
  const terrains = new Set(["wetland", "mountain", "sand", "sands", "jungle"]);
  const elementNames = new Set(["sun", "moon", "fire", "air", "plant", "water", "earth", "animal"]);

  import ParseIcons from "./parse-icons.svelte";

  export const IconName = (str, iconNum = 1) => {
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
  };

  export const Capitalise = (str, plural = 0) => {
    str = str.trim();
    const hyphenCheck = str.split("-");
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
  };

  function makePlural(str) {
    if (str.charAt(-1).toUpperCase() !== "S") {
      return "s";
    }
    return "";
  }

  const debug = true;
  export const writeGrowthAction = (growthAction) => {
    const regExpOuterParentheses = /\(\s*(.+)\s*\)/;
    const regExpCommaNoParentheses = /,(?![^(]*\))/;

    let growthActionHTML = "";
    let growthActionType = growthAction.split("(")[0].split("^")[0];
    if (debug) {
      console.log("Growth Action: " + growthAction);
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

    return { icons: growthIcons, text: growthText };
  };

  function getGrowthActionTextAndIcons(growthAction) {
    let growthActionType = growthAction.split("(")[0].split("^")[0];
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
        let reclaimIcon = "<icon class='reclaim-all'></icon>";
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
        growthIcons = "<custom-icon><icon class='" + growthActionType + "'></icon></custom-icon>";
        growthText = "You may Pay 2 Energy to Gain a Power Card";
        break;
      }
      case "gain-power-card": {
        const matches = regExp.exec(growthAction);
        let gainPowerCardIcon = "<icon class='" + growthActionType + "'></icon>";
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
        let isolateIcons = "<icon class='isolate'></icon>";
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
                presenceIcon =
                  "<icon class='backslash'></icon>{" +
                  presenceOptions[2] +
                  "}</custom-presence-or>";
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
                  presenceIcon += "<icon class='no-presence'></icon>";
                  break;
                default:
                  presenceIcon += "<icon class='" + presenceReq + "'></icon>";
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
          "<plus-presence>+<icon class='presence'></icon></plus-presence>" +
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
        growthIcons =
          "<custom-presence-no-range>+<icon class='presence'></icon></custom-presence-no-range>";
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
          moveIcons =
            "<custom-icon><icon class='presence'></icon>{move-range-" +
            moveRange +
            "}</custom-icon>";
          moveText = "Move a Presence";
        } else if (!isNaN(moveOptions[1])) {
          moveIcons = "<custom-icon><token-wrap>";
          for (let i = 0; i < moveOptions[1]; i++) {
            moveIcons += "<icon class='presence'></icon>";
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
                elementIcons += "<icon class='backslash'></icon>";
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
          growthIcons = "<gain><icon class='" + gainedElement + "'></icon></gain>";
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
        growthIcons = "<icon class='" + growthActionType + "'></icon>";
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
          growthIcons = "<gain><icon class='markerplus'></icon></gain>";
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
          growthIcons = "<icon class='discard-card'></icon>";
          growthText = "Discard a Card";
        }
        break;
      }
      case "incarna": {
        const matches = regExp.exec(growthAction);
        let incarnaOptions = matches[1].split(",");
        let incarnaAction = incarnaOptions[0];
        let incarnaRangeOrToken = incarnaOptions[1] !== undefined ? incarnaOptions[1] : 0;
        let customIncarnaIcon =
          incarnaOptions[2] !== undefined ? incarnaOptions[2] : "incarna-ember";
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
            growthIcons = "<icon class='empower-incarna'></icon>";
            growthText = "Empower Incarna";
            break;
          case "add-move":
            growthIcons =
              '<custom-icon><add-move-upper>+<icon class="backslash"></icon><icon class="move-arrow"></icon></add-move-upper><add-move-lower><icon class="incarna add-move ' +
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
        growthIcons = "<icon class='" + growthActionType + "'></icon>";
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
</script>

<script>
  export let effect;
  let icons, text;
  $: {
    ({ icons, text } = writeGrowthAction(effect));
  }
</script>

<growth-cell>
  <ParseIcons text={icons} /><growth-text><ParseIcons {text} /></growth-text>
</growth-cell>
