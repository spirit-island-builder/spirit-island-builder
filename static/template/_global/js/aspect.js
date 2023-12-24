function startMain() {
  console.log("aspect startMain");
  var aspects = document.querySelectorAll("aspect");
  for (var i = 0; i < aspects.length; i++) {
    if (aspects[i].hasAttribute("profile")) {
      aspects[i].classList.add("profile");
      aspects[i].removeAttribute("profile");
    }
    parseComplexity(aspects[i]);
    parseBonusNodes(aspects[i]);
    parseSubtexts(aspects[i]);
    parseSubNodes(aspects[i]);
    parseSpecialRules(aspects[i]);
    aspects[i].innerHTML = replaceIcon(aspects[i].innerHTML);
    resizeAspect(aspects[i]);
  }
  var backs = document.querySelectorAll("aspect-back");
  for (var i = 0; i < backs.length; i++) {
    parseAspectBack(backs[i]);
  }

  setTimeout(function () {
    innatePowerSizing(document);
  }, 200);
}

function parseSubNodes(aspect) {
  var container = aspect.querySelector("aspect-container");
  for (var i = 0; i < container.childNodes.length; i++) {
    if (
      container.childNodes[i].nodeType === 1 &&
      container.childNodes[i].nodeName === "QUICK-INNATE-POWER"
    ) {
      container.childNodes[i].outerHTML = parseInnatePower(container.childNodes[i]);
    }
  }
}

function parseSubtexts(aspect) {
  var subtexts = aspect.getElementsByTagName("aspect-subtext");
  if (subtexts && subtexts.length > 0) {
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
  } else {
    var title = aspect.getElementsByTagName("aspect-name")[0];
    title.classList.add("no-subtext");
  }
}

function parseAspectBack(back) {
  var html = '<img src="' + back.getAttribute("src") + '" />';
  html += "<aspect-overlay/>";
  html += '<div class="aspect-back-title">ASPECT</div>';
  html += '<div class="aspect-back-name">' + back.getAttribute("spirit-name") + "</div>";
  back.innerHTML = html;
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

function parseSpecialRules(aspect) {
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
        growthGroups[j].outerHTML = tableHolder.outerHTML;
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
