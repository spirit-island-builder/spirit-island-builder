function startMain() {
  console.log("aspect startMain");
  var aspects = document.querySelectorAll("aspect");
  for (var i = 0; i < aspects.length; i++) {
    if (aspects[i].hasAttribute("profile")) {
      aspects[i].classList.add("profile");
      aspects[i].removeAttribute("profile");
    }
    parseComplexity(aspects[i]);
    parseSubtexts(aspects[i]);
    parseInnatePowersOrPresenceNodes(aspects[i]);
    parseSpecialRules();
    aspects[i].innerHTML = replaceIcon(aspects[i].innerHTML);
    resizeAspect(aspects[i]);
  }
  var backs = document.querySelectorAll("aspect-back");
  for (var i = 0; i < backs.length; i++) {
    parseAspectBack(backs[i]);
  }

  setTimeout(function () {
    resizeInnatePowersAspect();
  }, 200);
}

function parseInnatePowersOrPresenceNodes(aspect) {
  let container = aspect.querySelector("aspect-container");
  let innatePowers = container.querySelectorAll("quick-innate-power");
  if (innatePowers[0]) {
    console.log(container.querySelectorAll("quick-innate-power"));

    for (var i = 0; i < innatePowers.length; i++) {
      innatePowers[i].outerHTML = parseInnatePowerAspect(innatePowers[i]);
    }

    // for (var i = 0; i < container.childNodes.length; i++) {
    //   if (
    //     container.childNodes[i].nodeType === 1 &&
    //     container.childNodes[i].nodeName === "QUICK-INNATE-POWER"
    //   ) {
    //     console.log(container.childNodes[i])
    //     console.log(innatePowers[i])
    //     console.log(i)
    //     container.childNodes[i].outerHTML = parseInnatePowerAspect(container.childNodes[i]);
    //   }
    // }
  } else {
    // we're doing presence nodes
    container.classList.add("nodes");
  }
}

function parseSubtexts(aspect) {
  var subtexts = aspect.getElementsByTagName("aspect-subtext");
  if (subtexts) {
    if (subtexts.length > 1) {
      var finalsubtext = subtexts[0];
      for (var i = 1; i < subtexts.length; i++) {
        finalsubtext.innerHTML += "<br>" + subtexts[i].innerHTML;
        //console.log(subtexts[i].remove());
      }
      for (var i = subtexts.length - 1; i > 0; i--) {
        subtexts[i].remove();
      }
    }
  }
}

function parseAspectBack(back) {
  var html = '<img src="' + back.getAttribute("src") + '" />';
  html += "<aspect-overlay/>";
  html += '<div class="aspect-back-title">ASPECT</div>';
  html += '<div class="aspect-back-name">' + back.getAttribute("spirit-name") + "</div>";
  back.innerHTML = html;
}

function parseComplexity(aspect) {
  var complexityHolder = aspect.querySelector("complexity");
  if (complexityHolder) {
    console.log(aspect);
    var aspectNameHTML = aspect.querySelector("aspect-name");
    aspectNameHTML.classList.add("has-complexity");
    var aspectSubtextHTML = aspect.querySelector("aspect-subtext");
    aspectSubtextHTML.classList.add("has-complexity");
    var complexityLevel = complexityHolder.getAttribute("value");
    var newComplexityElement = document.createElement("complexity");
    newComplexityElement.classList.add(complexityLevel);
    aspect.appendChild(newComplexityElement);
    complexityHolder.remove();
  }
}

function parseInnatePowerAspect(innatePowerHTML) {
  var debug = false;
  var currentPowerHTML = "<innate-power class='" + innatePowerHTML.getAttribute("speed") + "'>";

  //Innate Power title
  currentPowerHTML +=
    "<innate-power-title>" +
    innatePowerHTML.getAttribute("name") +
    "</innate-power-title><info-container><info-title>";

  //Innate Power Speed and Range Header
  currentPowerHTML +=
    "<info-title-speed>SPEED</info-title-speed><info-title-range>RANGE</info-title-range>";

  //Innate Power Target Header
  currentPowerHTML +=
    "<info-title-target>" +
    innatePowerHTML.getAttribute("target-title") +
    "</info-title-target></info-title><innate-info>";

  //Innater Power Speed value
  currentPowerHTML += "<innate-info-speed></innate-info-speed>";

  //Innate Power Range value
  currentPowerHTML += `<innate-info-range>${getRangeModel(
    innatePowerHTML.getAttribute("range")
  )}</innate-info-range>`;

  function getRangeModel(rangeString) {
    if (rangeString === "none") {
      return "<no-range></no-range>";
    } else {
      var result = "";
      for (var item of rangeString.split(",")) {
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
  var targetValue = innatePowerHTML.getAttribute("target");
  currentPowerHTML += `<innate-info-target>${replaceIcon(
    targetValue
  )}</innate-info-target></innate-info></info-container>`;

  currentPowerHTML += "<description-container>";

  var noteValue = innatePowerHTML.getAttribute("note");

  //If the note field is blank, don't include it
  if (noteValue == null || noteValue == "") {
    noteValue = "";
  } else {
    currentPowerHTML += "<note>" + noteValue + "</note>";
  }

  //Innate Power Levels and Thresholds
  var currentLevels = innatePowerHTML.getElementsByTagName("level");
  var regExp = /\(([^)]+)\)/;
  for (j = 0; j < currentLevels.length; j++) {
    var currentThreshold = currentLevels[j].getAttribute("threshold");
    var isText = currentLevels[j].getAttribute("text");
    if (isText != null) {
      // User wants a special text-only line
      currentPowerHTML += "<level><level-note>";
      currentPowerHTML += currentLevels[j].innerHTML + "</level-note></level>";
    } else {
      // User wants a normal thershold-level effect

      let isLong = currentLevels[j].getAttribute("long");
      if (isLong != null) {
        isLong = " long";
      } else {
        isLong = "";
      }

      // Break the cost into a numeral and element piece (then do error handling to allow switching the order)
      var currentThresholdPieces = currentThreshold.split(",");
      var elementPieces = [];
      var numeralPieces = [];
      for (k = 0; k < currentThresholdPieces.length; k++) {
        elementPieces[k] = currentThresholdPieces[k].substring(
          currentThresholdPieces[k].indexOf("-") + 1
        );
        numeralPieces[k] = currentThresholdPieces[k].split("-")[0];
      }

      currentPowerHTML += "<level><threshold>";
      for (k = 0; k < currentThresholdPieces.length; k++) {
        var currentNumeral = 0;
        var currentElement = "";
        if (isNaN(numeralPieces[k])) {
          currentNumeral = elementPieces[k];
          currentElement = numeralPieces[k];
        } else {
          currentElement = elementPieces[k];
          currentNumeral = numeralPieces[k];
        }

        if (currentElement.toUpperCase() == "OR") {
          currentThresholdPieces[k] = "<threshold-or>or</threshold-or>";
        } else if (currentElement.toUpperCase().startsWith("TEXT")) {
          if (currentElement.split("(")[1]) {
            customText = regExp.exec(currentElement)[1];
            currentThresholdPieces[k] = currentNumeral + " " + customText;
          } else {
            currentThresholdPieces[k] = currentNumeral + " " + "X";
          }
        } else if (currentElement.toUpperCase().startsWith("COST")) {
          if (currentElement.split("(")[1]) {
            customCost = regExp.exec(currentElement)[1];
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
        currentPowerHTML += currentThresholdPieces[k];
      }
      currentPowerHTML += "</threshold><div class='description" + isLong + "'>";
      var currentDescription = currentLevels[j].innerHTML;
      currentPowerHTML += currentDescription + "</div></level>";
    }
  }

  currentPowerHTML += "</description-container></innate-power>";
  return currentPowerHTML;
}

function resizeInnatePowersAspect() {
  // copied 12/6/22
  // Innate Power Sizing
  console.log("RESIZING: Innate Powers for Aspects");

  // Innate Power Notes (scale font size)
  noteBlocks = document.getElementsByTagName("note");
  for (let i = 0; i < noteBlocks.length; i++) {
    let noteHeight = noteBlocks[i].offsetHeight;
    let j = 0;
    while (noteHeight > 92) {
      var style = window.getComputedStyle(noteBlocks[i], null).getPropertyValue("font-size");
      var fontSize = parseFloat(style);
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
  const thresholds = document.getElementsByTagName("threshold");
  const thresholdsCount = thresholds.length;
  let outerThresholdWidth = [];
  for (let i = 0; i < thresholdsCount; i++) {
    // Check if the threshold width is overflowing. If so, just let it size itself...
    const thresholdHeight = thresholds[i].offsetHeight;
    if (thresholdHeight > 60) {
      thresholds[i].style.width = "auto";
      // I suspect this is no longer doing anything 2/25
    }
    outerThresholdWidth[i] =
      thresholds[i].clientWidth +
      parseFloat(
        window.getComputedStyle(thresholds[i]).getPropertyValue("margin-right").replace(/px/, "")
      );
  }

  // Innate Power Descriptions
  var description = document.getElementsByClassName("description");
  for (let i = 0; i < description.length; i++) {
    // Scale the text width to the threshold size...
    description[i].style.paddingLeft = outerThresholdWidth[i] + "px";
    // description[i].style.position = "relative";
    const textHeight = description[i].clientHeight;

    if (textHeight < 40) {
      description[i].classList.add("single-line");
      // Align-middle the text if its a single line
    } else if (textHeight > 86) {
      description[i].style.paddingLeft = "0px";
      thresholds[i].style.position = "relative";
      thresholds[i].style.top = "unset";
      thresholds[i].style.transform = "unset";
      // Spill over below the threshold if its greater than three lines
    }
  }
}

function parseSpecialRules() {
  // copied 12/6/22
  console.log("BUILDING SPECIAL RULES");
  const aspectContainer = document.querySelectorAll("aspect-container")[0];

  // Enable snake-like presence track in special rules
  var specialTrack = aspectContainer.getElementsByTagName("special-rules-track")[0];
  if (specialTrack) {
    var specialValues = specialTrack.getAttribute("values");
    var specialOptions = specialValues.split(",");
    var specialHTML = "";

    for (i = 0; i < specialOptions.length; i++) {
      let nodeText = specialOptions[i];
      specialHTML += "<td>" + getPresenceNodeHtml(nodeText, i == 0, "special", true) + "</td>";
    }
    specialHTML += "</tr>";
    aspectContainer.getElementsByTagName("special-rules-track")[0].removeAttribute("values");
    specialTrack.innerHTML = specialHTML;
    var subtextList = specialTrack.getElementsByTagName("subtext");
    for (var i = subtextList.length - 1; i >= 0; --i) {
      subtextList[i].remove();
    }
  }

  // <special-rules-track values="2,3,4"></special-rules-track>
}

function resizeAspect(aspect) {
  const aspectContainer = aspect.getElementsByTagName("aspect-container")[0];
  const aspectName = aspect.getElementsByTagName("aspect-name")[0];
  const aspectSubtext = aspect.getElementsByTagName("aspect-subtext")[0];
  if (checkOverflowHeight(aspectContainer)) {
    console.log("its overflowing");
    console.log(aspectContainer);
    aspectContainer.style.height =
      aspect.clientHeight - aspectName.clientHeight - aspectSubtext.clientHeight + "px";

    const lastRuleType = aspectContainer.lastChild;
    console.log(lastRuleType);
    if (lastRuleType.tagName.toUpperCase() === "INNATE-POWER") {
      console.log("here");
      if (checkOverflowHeight(lastRuleType)) {
        console.log("Innate Powers overflowing, shrinking space between levels");
        let levels = Array.from(aspect.getElementsByTagName("level"));
        levels.forEach((level) => {
          level.style.marginBottom = "2px";
        });
      }
      // Then tighten up the power level font spacing
      if (checkOverflowHeight(lastRuleType)) {
        console.log("Innate Powers overflowing, shrinking level description line height");
        let descriptions = Array.from(aspect.getElementsByClassName("description"));
        descriptions.forEach((description) => {
          description.style.lineHeight = "1";
        });
      }
    }
  }
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
