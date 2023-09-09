window.onload = function startMain() {
  //remove the window.onload when transferring over to Builder
  console.log("Start Main: Blight Card");

  tempalteBlightCard = document.querySelectorAll("template-blight-card")[0];

  if (tempalteBlightCard) {
    let blightCard = buildBuildCard(tempalteBlightCard);
    tempalteBlightCard.parentNode.insertBefore(blightCard, tempalteBlightCard.nextSibling);
    tempalteBlightCard.remove();
  }

  var html = document.querySelectorAll("blight-card")[0].innerHTML;
  document.querySelectorAll("blight-card")[0].innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize();
  }, 200);
};

function resize() {
  dynamicSizing(document.querySelectorAll("top-info")[0], 55);
}

function buildBuildCard(template) {
  let blightCard = document.createElement("blight-card");
  template.parentNode.insertBefore(blightCard, tempalteBlightCard.nextSibling);
  let effectName = template.getAttribute("name");
  let cardEffect = template.querySelectorAll("effect")[0];
  let effectHTML = cardEffect.innerHTML;
  let blightPerPlayer = template.getAttribute("per-player");
  let stillHealthy = template.getAttribute("still-healthy") !== "true" ? false : true;
  let headingText = stillHealthy
    ? "Still Healthy Island<br><for-now>(for now)</for-now>"
    : "Blighted Island";
  if (stillHealthy) {
    blightCard.classList.add("still-healthy"); //this doesn't exist yet so we can't add
  }

  html = `<blight-heading>${headingText}</blight-heading>
    <blight-banner><effect-name>${effectName}</effect-name>
    <effect>${effectHTML}</effect></blight-banner>
    <per-player-text>
    ${blightPerPlayer} {blight} per player
    </per-player-text>
    <blight-reminder>
    Any {blight} removed from<br>the board returns here.<br><br>If there is ever NO {blight} here,<br>players lose.
    </blight-reminder>`;

  blightCard.innerHTML = html;

  return blightCard;
}

function buildLevel(quickLevel) {
  fearCards = quickLevel.getAttribute("fear-cards");
  fearCardList = fearCards.split(",");
  if (!fearCardList[1]) {
    fearCardList = fearCards.split("/");
  }
  let fearCardNum = 0;
  for (var i = 0; i < fearCardList.length; i++) {
    fearCardNum += parseInt(fearCardList[i]);
  }
  fearCards = fearCardList.join("/");

  let name2 = quickLevel.getAttribute("name2");
  let rules2 = quickLevel.getAttribute("rules2");
  console.log(quickLevel);
  console.log(name2);
  console.log(rules2);
  let rule2HTML = "";
  if (name2 && rules2) {
    console.log("second rule detected");
    rule2HTML = `<rule><strong>${quickLevel.getAttribute(
      "name2"
    )}:</strong> ${quickLevel.getAttribute("rules2")}</rule>`;
  }

  levelHTML = `<level>
        <div>${quickLevel.tagName.at(
          -1
        )}<level-difficulty class="level-difficulty">(${quickLevel.getAttribute(
    "difficulty"
  )})</level-difficulty></div>
        <div>${fearCardNum} (${fearCards})</div>
        <div>
          <rule><strong>${quickLevel.getAttribute("name")}:</strong> ${quickLevel.getAttribute(
    "rules"
  )}</rule>
          ${rule2HTML}
        </div>
      </level>`;
  return levelHTML;
}

function dynamicSizing(el, maxSize = el.offsetHeight) {
  let j = 0;
  while (checkOverflow(el)) {
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var line = window.getComputedStyle(el, null).getPropertyValue("line-height");
    var fontSize = parseFloat(style);
    var lineHeight = parseFloat(line);
    el.style.lineHeight = lineHeight - 1 + "px";
    if (lineHeight < 15) {
      // there's more room in line height first
      el.style.fontSize = fontSize - 1 + "px";
    }
    // safety valve
    j += 1;
    if (j > 8) {
      console.log("safety");
      break;
    }
  }
}

function checkOverflow(el) {
  let curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflow = "hidden";
  }
  let isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
  el.style.overflow = curOverflow;
  return isOverflowing;
}
