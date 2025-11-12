// const { base } = require("$app/paths");
let lang = "en";
let localize = {
  en: {
    baseDifficulty: "BASE DIFFICULTY",
    additionalLossCondition: "Additional Loss Condition",
    specialRule: "Special Rule",
    none: "None",
    difficulty: "Difficulty",
    fearCards: "Fear Cards",
    cumulative: "cumulative",
    escalation: "Escalation",
    level: "Level",
    gameEffects: "Game Effects",
  },
  fr: {
    baseDifficulty: "DIFFICULTÉ DE BASE",
    additionalLossCondition: "Conditions supplémentaires de défaite",
    specialRule: "Règles spéciales",
    none: "Aucune",
    difficulty: "Difficulté",
    fearCards: "Cartes Peur",
    cumulative: "cumulatifs",
    escalation: "Escalade",
    level: "Niveau",
    gameEffects: "Effets",
  },
  ja: {
    baseDifficulty: "基本難易度",
    additionalLossCondition: "追加の敗北条件",
    specialRule: "特別ルール",
    none: "なし",
    difficulty: "難易度",
    fearCards: "恐怖カード",
    cumulative: "累積",
    escalation: "激化",
    level: "レベル",
    gameEffects: "ゲーム効果",
  },
  ko: {
    baseDifficulty: "기본 난이도",
    additionalLossCondition: "추가 패배 조건",
    specialRule: "특수 규칙",
    none: "없음",
    difficulty: "난이도",
    fearCards: "공포 카드 구성",
    cumulative: "누적",
    escalation: "II단계 침략 확대",
    level: "레벨",
    gameEffects: "게임 효과",
  },
};

function startMain() {
  quickAdversary = document.querySelectorAll("quick-adversary")[0];

  if (quickAdversary) {
    var adversary = document.createElement("adversary");
    adversary.innerHTML = buildAdversary(quickAdversary);
    quickAdversary.parentNode.insertBefore(adversary, quickAdversary.nextSibling);
    quickAdversary.remove();
  }

  processRules();

  var html = document.querySelectorAll("adversary")[0].innerHTML;
  document.querySelectorAll("adversary")[0].innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize();
  }, 200);

  return 4;
}

function buildAdversary(quickAdversary) {
  lang = quickAdversary.getAttribute("lang");
  adversaryName = quickAdversary.getAttribute("name");
  flagImage = quickAdversary.getAttribute("flag-image");
  baseDifficulty = quickAdversary.getAttribute("base-difficulty");
  let baseDifficultyText = "";
  if (baseDifficulty) {
    baseDifficultyText = `<adversary-base-dif>${localize[lang]["baseDifficulty"]}  <num>${baseDifficulty}</num></adversary-base-dif>`;
  }

  lossCondition = quickAdversary.querySelectorAll("loss-condition")[0];
  let lossConditionTitle = lossCondition.getAttribute("name");
  let lossConditionAlt = lossCondition.getAttribute("alternate") ? true : false;
  let lossConditionHeading = localize[lang]["additionalLossCondition"];
  if (lossConditionAlt) {
    console.log(lossConditionAlt);
    lossConditionHeading = localize[lang]["specialRule"];
  }
  if (lossConditionTitle) {
    lossConditionTitle = lossConditionTitle + "<strong>:</strong> ";
  }
  let lossConditionRules = lossCondition.getAttribute("rules");
  let topInfoClass = "";
  if (!lossConditionRules || lossConditionRules === "None") {
    // If none, create more space for escalation
    topInfoClass = "class='no-loss-condition'";
    lossConditionRules = localize[lang]["none"];
  }
  escalation = quickAdversary.querySelectorAll("escalation-effect")[0];

  levels = quickAdversary.querySelectorAll("level");

  html = `
    <adversary-title>${adversaryName}</adversary-title>
    <img class="flag" src="${flagImage}" />
    ${baseDifficultyText}
    <top-info ${topInfoClass}>
      <loss-condition>
        <section-title>${lossConditionHeading}</section-title>
        <div>
          <strong>${lossConditionTitle}</strong>${lossConditionRules}
        </div>
      </loss-condition>
      <escalation>
        <section-title>${
          localize[lang]["escalation"]
        } <icon class="escalation"></icon></section-title>
        <div>
          <strong>${escalation.getAttribute("name")}:</strong> ${escalation.getAttribute("rules")}
        </div>
      </escalation>
    </top-info>
    <adversary-levels>
      <header>
        <header-level>${localize[lang]["level"]}<br>(${localize[lang]["difficulty"]})</header-level>
        <div>${localize[lang]["fearCards"]}</div>
        <div>${localize[lang]["gameEffects"]} <span class="cumulative">(${
    localize[lang]["cumulative"]
  })</span></div>
      </header>`;

  html += buildLevel(quickAdversary.querySelectorAll("level-1")[0]);
  html += buildLevel(quickAdversary.querySelectorAll("level-2")[0]);
  html += buildLevel(quickAdversary.querySelectorAll("level-3")[0]);
  html += buildLevel(quickAdversary.querySelectorAll("level-4")[0]);
  html += buildLevel(quickAdversary.querySelectorAll("level-5")[0]);
  html += buildLevel(quickAdversary.querySelectorAll("level-6")[0]);

  html += `</adversary-levels><adversary-background></adversary-background><created-with>spiritislandbuilder.com</created-with><custom-meeple></custom-meeple>`;

  return html;
}

function buildLevel(quickLevel) {
  fearCards = quickLevel.getAttribute("fear-cards");
  fearCards = fearCards.replaceAll(",", "/");
  let pullNumbersRegex = /\d+/g;
  let fearCardNum = fearCards
    .match(pullNumbersRegex)
    .reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue), 0);

  let name2 = quickLevel.getAttribute("name2");
  let rules2 = quickLevel.getAttribute("rules2");
  let rule2HTML = "";
  if (name2 && rules2) {
    console.log("second rule detected");
    rule2HTML = `<rule><strong>${quickLevel.getAttribute(
      "name2"
    )}:</strong> ${quickLevel.getAttribute("rules2")}</rule>`;
  }

  levelHTML = `<level>
        <div>${quickLevel.tagName.at(-1)}<level-difficulty>(<num>${quickLevel.getAttribute(
    "difficulty"
  )}</num>)</level-difficulty></div>
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

function processRules() {
  // Capture lines to control line break heights
  let rules = document.querySelectorAll("rule");
  let rulesArray = Array.from(rules);
  rulesArray.forEach((rule) => {
    processRulesText(rule, "rule-line"); // Function from common
  });
}

function resize() {
  dynamicSizing(document.querySelectorAll("top-info")[0], 55);
  dynamicSizingRules();
}

function dynamicSizing(el, maxSize = el.offsetHeight) {
  let debug = true;
  if (debug) {
    console.log("Shinking: " + el.tagName);
  }
  let j = 0;
  while (checkOverflowHeight(el, 0)) {
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var line = window.getComputedStyle(el, null).getPropertyValue("line-height");
    var fontSize = parseFloat(style);
    var lineHeight = parseFloat(line);
    el.style.lineHeight = lineHeight - 1 + "px";
    el.style.fontSize = fontSize - 1 + "px";
    // safety valve
    j += 1;
    if (j > 20) {
      console.log("safety");
      break;
    }
  }
}

function dynamicSizingRules() {
  let debug = true;
  let levelsHolder = document.querySelectorAll("adversary-levels")[0];
  if (debug) {
    console.log("Shinking: " + levelsHolder.tagName);
  }
  let rules = document.querySelectorAll("rule");
  let firstRule = rules[0];
  let j = 0;
  while (checkOverflowHeight(levelsHolder, 0)) {
    var style = window.getComputedStyle(firstRule, null).getPropertyValue("font-size");
    var line = window.getComputedStyle(firstRule, null).getPropertyValue("line-height");
    var fontSize = parseFloat(style);
    var lineHeight = parseFloat(line);
    rules.forEach((rule) => {
      rule.style.lineHeight = lineHeight - 1 + "px";
      rule.style.fontSize = fontSize - 1 + "px";
    });

    // safety valve
    j += 1;
    if (j > 20) {
      console.log("safety");
      break;
    }
  }
}
