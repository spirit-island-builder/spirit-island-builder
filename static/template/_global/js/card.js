function startMain() {
  console.log("Start Main cards");

  var quickCards = document.querySelectorAll("quick-card");
  let cardHolder = document.createElement("cards");
  document.body.appendChild(cardHolder);
  let cardIndex = 0;
  for (var quickCard of quickCards) {
    var data = getData(quickCard, cardIndex);
    var card = constructCard(data, cardIndex);
    cardHolder.appendChild(card);
    // insertAfter(card, quickCard);
    quickCard.remove();
    cardIndex++;
  }

  let cardBack = document.querySelectorAll("card-back");
  if (cardBack[0]) {
    console.log(cardBack);
    cardHolder.appendChild(cardBack[0]);
    cardBack[0].style.zIndex = cardIndex;
  }

  const cards = document.querySelectorAll("card");
  for (i = 0; i < cards.length; ++i) {
    cards[i].innerHTML = replaceIcon(cards[i].innerHTML);
    cards[i].style.zIndex = i + 1;
  }

  setTimeout(() => {
    resize();
  }, 200);

  const stackView = document.querySelectorAll("stack-view-on")[0];
  if (stackView) {
    cardHolder.classList.add("enable-stack-view");
  }

  return 2;
}

function constructCard(data, cardIndex) {
  var card = document.createElement("card");
  let lang = data.lang;
  card.id = `card${cardIndex}`;
  card.className = data.speed;
  if (data.type) {
    card.classList.add(data.type);
    console.log(data);
  }
  let targetType = "spirit";
  if (data.targetTitle.toUpperCase() === "TARGET LAND") {
    targetType = "land";
  }
  card.innerHTML = `
  <card-art><div class="image" style="background-image:url(${data.image});"></div></card-art>
  <card-frame></card-frame>
  <power-subtitle>${data.subtitle || ""}</power-subtitle>
  <cost></cost>
  <type-watermark></type-watermark>
  <cost id='${card.id}cost'>${data.cost}</cost>
  <name-holder><name id='${card.id}name'>${data.name}</name></name-holder>
  
  ${data.printFriendly ? "<element-background></element-background>" : ""}

  ${getElementHtml(data.elements)}

  <info-title>
    <info-title-speed>${localize[lang]["speed"]}</info-title-speed>
    <info-title-range>${localize[lang]["range"]}</info-title-range>
    <info-title-target id='${card.id}targettitle'>${localize[lang][targetType]}</info-title-target>
  </info-title>

  <info>
    <info-speed></info-speed>
    <info-range id='${card.id}range'>
      ${data.range}
    </info-range>
    <info-target id='${card.id}target'>
      ${data.target}
    </info-target>
  </info>

  <rules-container>
    ${data.innerHTML}
  </rules-container>

  <artist-name>${data.artistName}</artist-name>
  `;
  card.setAttribute("lang", lang);
  setThreshold(card, cardIndex);
  return card;
}

function resize() {
  //Name
  nameBlocks = document.querySelectorAll("name");
  nameHolders = document.querySelectorAll("name-holder");
  for (let i = 0; i < nameBlocks.length; i++) {
    dynamicSizing(nameBlocks[i], nameHolders[i]);
    balanceText(nameBlocks[i], 33);
  }

  //Rules & Threshold
  rulesContainers = document.querySelectorAll("rules-container");

  for (let i = 0; i < rulesContainers.length; i++) {
    rulesBlock = rulesContainers[i].querySelectorAll("rules")[0];
    thresholdBlock = rulesContainers[i].querySelectorAll("threshold")[0];
    limitingBlock = thresholdBlock == undefined ? rulesContainers[i] : thresholdBlock;
    let j = 0;
    while (checkOverflowHeight(limitingBlock)) {
      var style = window.getComputedStyle(rulesBlock, null).getPropertyValue("font-size");
      var line = window.getComputedStyle(rulesBlock, null).getPropertyValue("line-height");
      var fontSize = parseFloat(style);
      var lineHeight = parseFloat(line);
      rulesBlock.style.fontSize = fontSize - 1 + "px";
      rulesBlock.style.lineHeight = lineHeight - 1 + "px";
      if (thresholdBlock) {
        thresholdBlock.style.fontSize = fontSize - 1 + "px";
        thresholdBlock.style.lineHeight = lineHeight - 1 + "px";
      }
      // safety valve
      j += 1;
      if (j > 10) {
        console.log("safety");
        break;
      }
    }
  }

  //Images
  imageContainers = document.querySelectorAll("img");
  for (let i = 0; i < imageContainers.length; i++) {}
}

function setThreshold(card) {
  var thresholds = card.querySelectorAll("threshold");
  let lang = card.getAttribute("lang");
  if (thresholds.length) {
    // deal with custom text
    var threshold = thresholds[0];
    var customThresholdText = threshold.getAttribute("text");

    //set elemental thresholds got first threshold
    var conditions = threshold.getAttribute("condition");
    if (conditions) {
      threshold.innerHTML = `<threshold-condition id="${
        card.id
      }thresholdCondition"><span>${getThresholdElements(conditions)}:</span></threshold-condition>${
        threshold.innerHTML
      }`;
    }

    //add additional thresholds
    let secondThreshold = thresholds[1];
    if (secondThreshold) {
      var addCondition = secondThreshold.getAttribute("condition");
      var addConditionText = `<threshold-condition id="${
        card.id
      }thresholdCondition${1}"><span>${getThresholdElements(
        addCondition
      )}:</span></threshold-condition>`;
      threshold.innerHTML += addConditionText + secondThreshold.innerHTML;
      secondThreshold.remove();
    }
    if (lang !== "en" && !customThresholdText) {
      customThresholdText = localize[lang]["threshold"];
    }
    if (customThresholdText) {
      threshold.className = "threshold-custom";
      let customThresholdElement = `<custom-threshold-flex><arrow-left></arrow-left><custom-threshold-text>${customThresholdText}</custom-threshold-text><arrow-right></arrow-right></custom-threshold-flex>`;
      threshold.innerHTML = customThresholdElement + threshold.innerHTML;
    }
  }
}

function getThresholdElements(conditions) {
  var result = "";
  var condition = conditions.split(",");
  for (let i = 0; i < condition.length; i++) {
    var number = condition[i].split("-")[0].trim();
    var element = condition[i].split("-")[1].trim();
    if (i === condition.length - 1) {
      result += `${number}<icon class="${element} last"></icon>`;
    } else {
      result += `${number}<icon class="${element}"></icon>`;
    }
  }
  return result;
}

function getElementHtml(elements) {
  var result = "";
  for (var element of elements) {
    result += `<element class="${element}"></element>`;
  }

  return result;
}

function getData(quickCard, cardIndex) {
  return {
    // cardId: cardIndex,
    speed: quickCard.getAttribute("speed"),
    cost: quickCard.getAttribute("cost"),
    name: quickCard.getAttribute("name"),
    type: quickCard.getAttribute("type"),
    image: quickCard.getAttribute("image"),
    elements: (quickCard.getAttribute("elements") || "").split(","),
    range: getRangeModel(quickCard.getAttribute("range")),
    target: getTargetModel(quickCard.getAttribute("target")),
    targetTitle: quickCard.getAttribute("target-title") || "TARGET LAND",
    artistName: quickCard.getAttribute("artist-name"),
    printFriendly: quickCard.getAttribute("print-friendly") === "yes",
    innerHTML: getRulesNew(quickCard, cardIndex),
    subtitle: quickCard.getAttribute("subtitle"),
    lang: quickCard.getAttribute("lang") || "en",
  };
}

function getRulesNew(quickCard, cardIndex) {
  var rules = quickCard.querySelectorAll("rules")[0];

  rulesHTML = "<rules>" + getFormatRulesText(rules.innerHTML) + "</rules>";
  rulesHTML = `<rules id='card${cardIndex}rules'>${getFormatRulesText(rules.innerHTML)}</rules>`;

  var thresholds = quickCard.querySelectorAll("threshold");
  if (thresholds.length) {
    thresholds.forEach((threshold) => {
      threshold.innerHTML = getFormatRulesText(threshold.innerHTML);
      threshold.setAttribute("id", `card${cardIndex}threshold`);
      rulesHTML += threshold.outerHTML;
    });
  }

  return rulesHTML;
}

function getFormatRulesText(rulesHTML) {
  ruleLines = rulesHTML.split("\n");
  let rulesFormatted = "";
  for (let i = 0; i < ruleLines.length; i++) {
    if (ruleLines[i] && ruleLines[i].trim().length) {
      rulesFormatted += "<div>" + ruleLines[i] + "</div>";
    } else if (i > 0 && i < ruleLines.length - 1) {
      rulesFormatted += "<br>";
      // allows user's line breaks to show up on the card
    }
  }

  return rulesFormatted;
}

// function getRangeModel(rangeString) {
//   if (rangeString === "none") {
//     return "<no-range></no-range>";
//   } else {
//     var result = "";
//     let rangeItems = rangeString.split(",");
//     let numberCount = rangeItems.filter((x) => !isNaN(x)).length;
//     let rangeClass = numberCount > 1 ? "class='multi-range'" : "";
//     for (var item of rangeString.split(",")) {
//       if (!isNaN(item)) {
//         result += `<range ${rangeClass}>${item}</range>`;
//       } else if (item.startsWith("{")) {
//         result += item;
//       } else {
//         result += `{${item}}`;
//       }
//     }
//     return result;
//   }
// }

function getTargetModel(targetString) {
  return replaceIcon(targetString);
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function dynamicSizing(el, container, maxSize = container.offsetHeight) {
  let debug = false;
  if (debug) {
    console.log("Shrinking: " + el.textContent);
  }
  //Shrink text to fit
  let j = 0;
  while (checkOverflowHeight(container, 0)) {
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var line = window.getComputedStyle(el, null).getPropertyValue("line-height");
    var fontSize = parseFloat(style);
    var lineHeight = parseFloat(line);
    el.style.fontSize = fontSize - 1 + "px";
    el.style.lineHeight = lineHeight - 1 + "px";
    // safety valve
    j += 1;
    if (j > 10) {
      console.log("safety");
      break;
    }
  }
}

function balanceText(el) {
  // Balances text in an element
  let debug = false;
  const initialHeight = el.offsetHeight;
  const initialWidth = el.offsetWidth;
  const lineHeight = parseFloat(window.getComputedStyle(el, null).getPropertyValue("line-height"));
  if (debug) {
    console.log(
      "Balancing: " +
        el.textContent +
        " H:" +
        initialHeight +
        ", W:" +
        initialWidth +
        ", LH:" +
        lineHeight
    );
  }

  if (initialHeight > lineHeight + 2) {
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
  } else {
    if (debug) {
      console.log("No balance needed");
    }
  }
}

let localize = {
  en: {
    speed: "SPEED",
    range: "RANGE",
    land: "TARGET LAND",
    spirit: "TARGET",
    threshold: "IF YOU HAVE",
  },
  de: {
    speed: "WANN",
    range: "WIE WEIT",
    land: "WO",
    spirit: "WEN",
    threshold: "HAST DU ...",
  },
  pl: {
    speed: "SZYBKOŚĆ",
    range: "ZASIĘG",
    land: "CEL (KRAINA)",
    spirit: "CEL",
    threshold: "JEŚLI MASZ",
  },
  ar: {
    speed: "سرعة",
    range: "مدى",
    land: "الأرض المستهدفة",
    spirit: "هدف",
    threshold: "",
  },
  zh: {
    speed: "速度",
    range: "距離",
    land: "目標區域",
    spirit: "目標精靈",
    threshold: "",
  },
  hu: {
    speed: "SEBESSÉG",
    range: "TÁVOLSÁG",
    land: "CÉLTERÜLET",
    spirit: "CÉLPONT",
    threshold: "Ha kijátszottál",
  },
};
