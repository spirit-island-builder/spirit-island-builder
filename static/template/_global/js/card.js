function startMain() {
  console.log("Start Main cards");

  var quickCards = document.querySelectorAll("quick-card");

  let cardIndex = 0;
  for (var quickCard of quickCards) {
    var data = getData(quickCard, cardIndex);
    var card = constructCard(data, cardIndex);
    insertAfter(card, quickCard);
    quickCard.remove();
    cardIndex++;
  }

  const cards = document.querySelectorAll("card");

  for (i = 0; i < cards.length; ++i) {
    cards[i].innerHTML = replaceIcon(cards[i].innerHTML);
  }

  setTimeout(() => {
    resize();
  }, 200);
}

function constructCard(data, cardIndex) {
  var card = document.createElement("card");
  card.id = `card${cardIndex}`;
  card.className = data.speed;
  card.innerHTML = `
  <div class="image" style="background-image:url(${data.image});"></div>
  <cost id='${card.id}cost'>${data.cost}</cost>
  <name id='${card.id}name'>${data.name}</name>
  
  ${data.printFriendly ? "<element-background></element-background>" : ""}

  ${getElementHtml(data.elements)}

  <info-title>
    <info-title-speed>SPEED</info-title-speed>
    <info-title-range>RANGE</info-title-range>
    <info-title-target id='${card.id}targettitle'>${data.targetTitle}</info-title-target>
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

  setThreshold(card, cardIndex);
  return card;
}

function resize() {
  //Name
  nameBlocks = document.querySelectorAll("name");
  for (let i = 0; i < nameBlocks.length; i++) {
    dynamicSizing(nameBlocks[i]);
  }

  //Rules & Threshold
  rulesContainers = document.querySelectorAll("rules-container");

  for (let i = 0; i < rulesContainers.length; i++) {
    /* dynamicSizing(rulesBlocks[i]) */
    rulesBlock = rulesContainers[i].querySelectorAll("rules")[0];
    thresholdBlock = rulesContainers[i].querySelectorAll("threshold")[0];
    limitingBlock = thresholdBlock == undefined ? rulesContainers[i] : thresholdBlock;
    let j = 0;
    while (checkOverflow(limitingBlock)) {
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
  var threshold = card.querySelector("threshold");

  if (threshold) {
    // deal with custom text
    var customThresholdText = threshold.getAttribute("text");

    if (customThresholdText) {
      threshold.className = "threshold-custom";
      // threshold.setAttribute("data-before", customThresholdText);
      threshold.innerHTML += `<custom-threshold-flex><arrow-left></arrow-left><custom-threshold-text>${customThresholdText}</custom-threshold-text><arrow-right></arrow-right></custom-threshold-text>`;
    }

    //set elemental thresholds
    var conditions = threshold.getAttribute("condition");
    if (conditions) {
      threshold.innerHTML = `<threshold-condition id="${
        card.id
      }thresholdCondition"><span>${getThresholdElements(conditions)}:</span></threshold-condition>${
        threshold.innerHTML
      }`;
    }
  }
}

function getThresholdElements(conditions) {
  var result = "";
  var condition = conditions.split(",");
  for (let i = 0; i < condition.length; i++) {
    var number = condition[i].split("-")[0];
    var element = condition[i].split("-")[1];
    // result += `${number}<icon class="${element}"></icon>`;
    if (i === condition.length - 1) {
      result += `${number}<icon class="${element} last"></icon>`;
    } else {
      result += `${number}<icon class="${element}"></icon>`;
    }

    /* for(var condition of conditions.split(','))
	  {
		var number = condition.split('-')[0];
		var element = condition.split('-')[1];
		result += `${number}<icon class="${element}"></icon>`;
	  } */
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
    image: quickCard.getAttribute("image"),
    elements: (quickCard.getAttribute("elements") || "").split(","),
    range: getRangeModel(quickCard.getAttribute("range")),
    target: getTargetModel(quickCard.getAttribute("target")),
    targetTitle: quickCard.getAttribute("target-title") || "TARGET LAND",
    artistName: quickCard.getAttribute("artist-name"),
    printFriendly: quickCard.getAttribute("print-friendly") === "yes",
    innerHTML: getRulesNew(quickCard, cardIndex),
  };
}

/* function getRulesHTML(html)
{
  var result = replaceIcon(html);
  return result;
} */

function getRulesNew(quickCard, cardIndex) {
  var rules = quickCard.querySelectorAll("rules")[0];

  rulesHTML = "<rules>" + getFormatRulesText(rules.innerHTML) + "</rules>";
  rulesHTML = `<rules id='card${cardIndex}rules'>${getFormatRulesText(rules.innerHTML)}</rules>`;

  var threshold = quickCard.querySelectorAll("threshold")[0];
  if (threshold) {
    threshold.innerHTML = getFormatRulesText(threshold.innerHTML);
    threshold.setAttribute("id", `card${cardIndex}threshold`);
    rulesHTML += threshold.outerHTML;
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

function getTargetModel(targetString) {
  return replaceIcon(targetString);
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function dynamicSizing(el, maxSize = el.offsetHeight) {
  let j = 0;
  while (checkOverflow(el, maxSize)) {
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

function checkOverflow(el, maxSize = el.clientHeight) {
  let curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflow = "auto";
  }
  let isOverflowing = maxSize < el.scrollHeight;
  el.style.overflow = curOverflow;
  /* 	console.log('el.clientHeight='+el.clientHeight)
	console.log('el.scrollHeight='+el.scrollHeight)
	console.log('isOverflowing?='+isOverflowing) */

  return isOverflowing;
}
