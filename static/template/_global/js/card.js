var quickCards = document.querySelectorAll("quick-card");

window.onload = function startMain() {
	const cards = document.querySelectorAll("card");

	for (i = 0; i < cards.length; ++i) {
		cards[i].innerHTML = replaceIcon(cards[i].innerHTML);
	}
};

for (var quickCard of quickCards) {
	var data = getData(quickCard);
	var card = constructCard(data);
	insertAfter(card, quickCard);
	quickCard.remove();
}

setTimeout(() => {
	resize();
}, 200);

function constructCard(data) {
	var card = document.createElement("card");
	card.className = data.speed;
	card.innerHTML = `
  <img class="image" src=${data.image} />
  <cost>${data.cost}</cost>
  <name>${data.name}</name>
  
  ${data.printFriendly ? "<element-background></element-background>" : ""}

  ${getElementHtml(data.elements)}

  <info-title>
    <info-title-speed>SPEED</info-title-speed>
    <info-title-range>RANGE</info-title-range>
    <info-title-target>${data.targetTitle}</info-title-target>
  </info-title>

  <info>
    <info-speed></info-speed>
    <info-range>
      ${data.range}
    </info-range>
    <info-target>
      ${data.target}
    </info-target>
  </info>

  <rules-container>
    ${data.innerHTML}
  </rules-container>

  <artist-name>${data.artistName}</artist-name>
  `;

	setThreshold(card);
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
		console.log("limiting block is...");
		console.log(limitingBlock);
		let j = 0;
		while (checkOverflow(limitingBlock)) {
			console.log("Resizing... " + i);
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
			threshold.setAttribute("data-before", customThresholdText);
		}

		//set elemental thresholds
		var conditions = threshold.getAttribute("condition");
		if (conditions) {
			threshold.innerHTML = `
		<threshold-condition>
		  ${getThresholdElements(threshold)}:
		</threshold-condition>
		${threshold.innerHTML}
		`;
		}
	}
}

function getThresholdElements(threshold) {
	var result = "";

	var conditions = threshold.getAttribute("condition");
	if (conditions) {
		var condition = conditions.split(",");
		for (let i = 0; i < condition.length; i++) {
			var number = condition[i].split("-")[0];
			var element = condition[i].split("-")[1];
			result += `${number}<icon class="${element}"></icon>`;
			if (i < condition.length - 1) {
				result += "<div style='width:10px; height:1px; display:inline-block'></div>";
			}
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

function getData(quickCard) {
	return {
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
		innerHTML: getRulesNew(quickCard),
	};
}

/* function getRulesHTML(html)
{
  var result = replaceIcon(html);
  return result;
} */

function getRulesNew(quickCard) {
	var rules = quickCard.querySelectorAll("rules")[0];
	ruleLines = rules.innerHTML.split("\n");
	rulesHTML = "<rules>";
	for (let i = 0; i < ruleLines.length; i++) {
		if (ruleLines[i] && ruleLines[i].trim().length) {
			rulesHTML += "<div>" + ruleLines[i] + "</div>";
		} else if (i > 0 && i < ruleLines.length - 1) {
			rulesHTML += "<br>";
			// allows user's line breaks to show up on the card
		}
	}
	rulesHTML += "</rules>";

	var threshold = quickCard.querySelectorAll("threshold")[0];
	/*   console.log("threshold? ="+threshold)
  console.log(threshold)
  console.log(quickCard.querySelectorAll('threshold')) */
	thresholdInner = "";
	if (threshold) {
		thresholdLines = threshold.innerHTML.split("\n");
		// console.log(thresholdLines)
		for (let i = 0; i < thresholdLines.length; i++) {
			if (thresholdLines[i]) {
				thresholdInner += "<div>" + thresholdLines[i] + "</div>";
			}
		}
		threshold.innerHTML = thresholdInner;
		rulesHTML += threshold.outerHTML;
	}
	return rulesHTML;
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
	console.log("resizing text for " + el.tagName);
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
