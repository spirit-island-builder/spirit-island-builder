<script context="module">
  import { IconName, Capitalise } from "./growth-cell.svelte";
  import ParseIcons from "./parse-icons.svelte";
  export const getPresenceNodeHtml = (nodeText, first, trackType, addEnergyRing) => {
    //Find values between parenthesis
    const regExp = /\(([^)]+)\)/;
    let pnDebug = false;
    let nodeClass = "";

    // Every node will have a presence-node element with
    // a ring-icon element inside, so we can add these now.
    const presenceNode = document.createElement("presence-node");
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
            subText =
              Capitalise(option) + " 1 " + moveText + " " + preposition + " 1 of your Lands";
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
              inner = "<icon class='" + iconText + "'/>";
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
            inner = inner = "<icon class='" + iconText + "'/>";
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
  };
</script>

<script>
  export let effect, first, trackType, addEnergyRing;
</script>

<ParseIcons text={getPresenceNodeHtml(effect, first, trackType, addEnergyRing)} />
