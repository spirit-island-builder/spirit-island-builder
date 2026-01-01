/* global checkOverflowHeight */
/* global checkOverflowWidth */

function startMain() {
  console.log("aspect startMain");
  var aspects = document.querySelectorAll("aspect");
  for (var i = 0; i < aspects.length; i++) {
    if (aspects[i].hasAttribute("profile")) {
      aspects[i].classList.add("profile");
      aspects[i].removeAttribute("profile");
    }
    let aspectname = aspects[i].querySelectorAll("aspect-name")[0];
    if (aspectname.hasAttribute("showparts")) {
      aspectname.innerHTML = `${aspectname.innerHTML} (${i + 1} of ${aspects.length})`;
    }
    parseComplexity(aspects[i]);
    parseBonusNodes(aspects[i]);
    parseSubtexts(aspects[i]);
    parseSubNodes(aspects[i]);
    parseSpecialRulesAspect(aspects[i]);
    //add background to card
    aspects[i].innerHTML = "<aspect-background>" + aspects[i].innerHTML + "</aspect-background>";

    aspects[i].innerHTML = replaceIcon(aspects[i].innerHTML);
  }
  var backs = document.querySelectorAll("aspect-back");
  for (var i = 0; i < backs.length; i++) {
    parseAspectBack(backs[i]);
  }

  innatePowerSizing(document);

  setTimeout(function () {
    resizeAspect(aspects);
  }, 200);
  setTimeout(function () {
    resizeAspectBack(backs[0]);
  }, 200);

  return 3;
}

function parseSubNodes(aspect) {
  var container = aspect.querySelector("aspect-container");
  for (var i = 0; i < container.childNodes.length; i++) {
    if (
      container.childNodes[i].nodeType === 1 &&
      container.childNodes[i].nodeName === "QUICK-INNATE-POWER"
    ) {
      container.childNodes[i].outerHTML = parseInnatePower(container.childNodes[i]); //leveraging board_front.js
    }
  }
}

function parseSubtexts(aspect) {
  let subtexts = Array.from(aspect.getElementsByTagName("aspect-subtext"));
  let replacementHTML = "";
  if (subtexts.length) {
    subtexts.forEach((subtext) => {
      if (subtext.innerHTML.includes(":")) {
        replacementHTML += `<aspect-rule>${subtext.innerHTML}</aspect-rule>`;
      } else {
        replacementHTML += `<aspect-rule class="no-replacement">${subtext.innerHTML}</aspect-rule>`;
      }
    });
    for (var i = subtexts.length - 1; i > 0; i--) {
      subtexts[i].remove();
    }
    subtexts[0].innerHTML = replacementHTML;
  } else {
    let title = aspect.getElementsByTagName("aspect-name")[0];
    title.classList.add("no-subtext");
  }
}

function parseBonusNodes(aspect) {
  let bonusNode = aspect.querySelector("bonus-node");
  if (bonusNode) {
    aspect.classList.add("has-bonus-node");
    let nodeText = bonusNode.getAttribute("effect");
    let bonusNodeHTML = getPresenceNodeHtml(nodeText, true, 0, "card", false);
    bonusNode.innerHTML = bonusNodeHTML;
    let bonusText = document.createElement("bonus-text");
    bonusText.innerHTML = "BONUS:";
    bonusNode.appendChild(bonusText);
  }
}

function parseComplexity(aspect) {
  var complexityHolder = aspect.querySelector("complexity");
  if (complexityHolder) {
    var aspectNameHTML = aspect.querySelector("aspect-name");
    aspectNameHTML.classList.add("has-complexity");
    var aspectSubtextHTML = aspect.querySelector("aspect-subtext");
    if (aspectSubtextHTML) {
      aspectSubtextHTML.classList.add("has-complexity");
    }
    var complexityLevel = complexityHolder.getAttribute("value");
    var newComplexityElement = document.createElement("complexity");
    newComplexityElement.classList.add(complexityLevel);
    aspect.appendChild(newComplexityElement);
    complexityHolder.remove();
  }
}

function parseSpecialRulesAspect(aspect) {
  var specialRules = aspect.getElementsByTagName("special-rule");
  for (var i = 0; i < specialRules.length; i++) {
    let specialRule = specialRules[i];
    //Check for growth groups
    var growthGroups = specialRule.getElementsByTagName("growth-group");
    if (growthGroups) {
      for (var j = 0; j < growthGroups.length; j++) {
        console.log("Writing Growth Group: " + growthGroups[j].outerHTML);
        let tableHolder = document.createElement("growth-table");
        tableHolder.innerHTML = writeGrowthGroup(growthGroups[j]);
        specialRule.insertAdjacentElement("afterend", tableHolder);
        growthGroups[j].remove();
      }
    }
    if (i > 10) {
      console.log("overflow?");
      break;
    }
  }

  // copied 12/6/22
  console.log("BUILDING SPECIAL RULES");
  const aspectContainer = document.querySelectorAll("aspect-container")[0];
  parseSpecialRules(aspectContainer); // Leveraging praseSpecialRules on board_front.js
}

function resizeAspect(aspects) {
  let debug = true;
  aspects.forEach((aspect, j) => {
    const aspectContainer = aspect.getElementsByTagName("aspect-container")[0];
    const aspectName = aspect.getElementsByTagName("aspect-name")[0];
    const aspectSubtext = aspect.getElementsByTagName("aspect-subtext")[0];
    if (debug) {
      console.log("resizing aspect");
    }
    if (checkOverflowHeight(aspect)) {
      if (debug) {
        console.log("aspect is overflowing");
      }
    }
    if (checkOverflowHeight(aspectContainer)) {
      console.log("container is overflowing");

      // Try smaller text
      aspectContainer.classList.add("tight");
      aspectContainer.style.height =
        aspect.clientHeight - aspectName.clientHeight - aspectSubtext.clientHeight + "px";

      const lastRuleType = aspectContainer.lastChild;
      if (lastRuleType.tagName.toUpperCase() === "INNATE-POWER") {
        if (checkOverflowHeight(lastRuleType)) {
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

    const aspectRules = aspectSubtext.getElementsByTagName("aspect-rule");
    for (i = 0; i < aspectRules.length; i++) {
      balanceText(aspectRules[i]);
    }

    const growthTables = aspect.getElementsByTagName("growth-table");
    if (growthTables) {
      for (i = 0; i < growthTables.length; i++) {
        if (checkOverflowWidth(growthTables[i].parentNode, 0)) {
          growthTables[i].classList.add("tight");
        }
      }
    }

    aspectContainer.id = `effect-part${j}`;
    aspect.id = `aspect-part${j}`;
  });
}

function parseAspectBack(back) {
  var html = '<img src="' + back.getAttribute("src") + '" />';
  html += "<aspect-back-overlay/>";
  html += '<div class="aspect-back-title"><aspect-back-title>ASPECT</aspect-back-title></div>';
  html +=
    '<div class="aspect-back-name"><aspect-back-name>' +
    back.getAttribute("spirit-name") +
    "</aspect-back-name></div>";
  back.innerHTML = html;
}

function resizeAspectBack(back) {
  // Spirit Name / Card Heading
  const aspectSpiritName = back.getElementsByTagName("aspect-back-name")[0];
  console.log("resizing back");
  console.log(aspectSpiritName);
  let k = 0;
  while (aspectSpiritName.clientHeight > 33) {
    const style = window.getComputedStyle(aspectSpiritName, null).getPropertyValue("font-size");
    const fontSize = parseFloat(style);
    aspectSpiritName.style.fontSize = fontSize - 1 + "px";
    k += 1;
    if (k > 10) {
      console.log("Notes shrunk as far as reasonable");
      break;
    }
  }
}
