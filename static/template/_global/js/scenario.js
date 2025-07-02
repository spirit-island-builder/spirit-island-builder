// const { base } = require("$app/paths");

function startMain() {
  buildScenario();

  var html = document.querySelectorAll("scenario")[0].innerHTML;
  document.querySelectorAll("scenario")[0].innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize();
  }, 200);
}

function getElement(name) {
  let newEl = document.querySelectorAll(name)[0];
  if (!newEl) {
    newEl = document.createElement(name);
    console.log("not found, creating " + newEl.tagName);
  } else {
    console.log("found " + newEl.tagName);
  }
  return newEl;
}

function buildScenario(quickScenario) {
  quickScenario = document.querySelectorAll("quick-scenario")[0];

  // Build Scenario
  let scenario = document.createElement("scenario");
  quickScenario.parentNode.appendChild(scenario);
  let scenarioFront = getElement("scenario-front");
  let scenarioBack = getElement("scenario-back");
  scenario.appendChild(scenarioFront);
  scenario.appendChild(scenarioBack);

  // Build Scenario Front
  let scenarioFrontBackground = document.createElement("scenario-background");
  let scenarioName = document.createElement("scenario-front-name");
  scenarioName.innerHTML = quickScenario.getAttribute("name");
  let scenarioArtHolder = document.createElement("scenario-art-holder");
  if (quickScenario.getAttribute("image")) {
    scenarioArtHolder.innerHTML = `<div class="image" style="background-image:url(${quickScenario.getAttribute(
      "image"
    )});"></div>`;
  }
  let panels = scenarioFront.querySelectorAll("panel");
  let scenarioRight = getElement("scenario-right");
  let scenarioLore = scenarioFront.querySelectorAll("lore-panel")[0];
  if (scenarioLore && quickScenario.getAttribute("shiftLore") === true) {
    scenarioFront.appendChild(scenarioLore);
  }
  let scenarioHeadingFront = document.createElement("scenario-heading");
  scenarioHeadingFront.innerHTML = "Scenario";

  scenarioFront.appendChild(scenarioFrontBackground);
  scenarioFront.appendChild(scenarioArtHolder);
  scenarioFront.appendChild(scenarioName);
  scenarioFront.appendChild(scenarioHeadingFront);
  scenarioFront.appendChild(scenarioRight);

  // Stack panels
  let allPanels = Array.from(scenarioFront.querySelectorAll("panel"));
  console.log("number of panels in js: " + allPanels.length);
  allPanels.forEach((panel, i) => {
    panel.style.zIndex = 10 - i;
  });

  // Build Scenario Back
  let scenarioBackBackground = document.createElement("scenario-background");
  let scenarioDifficulty = document.createElement("scenario-back-difficulty");
  scenarioDifficulty.innerHTML = `Difficulty <num>${quickScenario.getAttribute(
    "difficulty"
  )}</num>`;
  let scenarioBackName = document.createElement("scenario-back-name");
  scenarioBackName.innerHTML = quickScenario.getAttribute("name");
  let scenarioHeadingBack = document.createElement("scenario-heading");
  scenarioHeadingBack.innerHTML = "Scenario";

  scenarioBack.appendChild(scenarioBackBackground);
  scenarioBack.appendChild(scenarioDifficulty);
  scenarioBack.appendChild(scenarioBackName);
  scenarioBack.appendChild(scenarioHeadingBack);

  evaluateComments(scenarioFront);
  evaluateComments(scenarioBack);

  let credit = document.createElement("created-with");
  credit.textContent = "spiritislandbuilder.com";
  let meeple = document.createElement("custom-meeple");
  scenarioBack.appendChild(credit);
  scenarioBack.appendChild(meeple);

  let allComments = document.querySelectorAll("comment");
  console.log("number of comments in js: " + allComments.length);

  function evaluateComments(el) {
    console.log("doing comments for " + el.tagName);
    let allComments = Array.from(el.querySelectorAll("comment"));
    allComments.forEach((comment, i) => {
      if (comment.getAttribute("type")) {
        comment.classList.add(comment.getAttribute("type"));
      }
      if (comment.classList.contains("bullets")) {
        let commentLines = comment.innerHTML.split(/\r?\n|\r|\n/g);
        comment.innerHTML = "";
        commentLines.forEach((line) => {
          if (line.replace(/\W/g, "").length > 0) {
            let commentLine = document.createElement("li");
            commentLine.innerHTML = line;
            comment.appendChild(commentLine);
          }
        });
        comment.innerHTML = `<ul>${comment.innerHTML}</ul>`;
      }
      if (comment.classList.contains("para")) {
        let commentLines = comment.innerHTML.split(/\r?\n|\r|\n/g);
        comment.innerHTML = "";
        commentLines.forEach((line) => {
          if (line.replace(/\W/g, "").length > 0) {
            let commentLine = document.createElement("comment-line");
            commentLine.innerHTML = line;
            comment.appendChild(commentLine);
          }
        });
      }
      if (comment.classList.contains("image")) {
        comment.innerHTML = "";
        console.log(comment);
        commentImage = document.createElement("img");
        comment.appendChild(commentImage);
        commentImage.setAttribute("src", comment.getAttribute("imgsrc"));
      }
    });
  }

  // Clean up
  quickScenario.remove();
}

function resize() {
  dynamicSizing(
    document.querySelectorAll("scenario-right")[0],
    document.querySelectorAll("scenario-front")[0]
  );
  dynamicSizing(
    document.querySelectorAll("back-left")[0],
    document.querySelectorAll("scenario-back")[0]
  );
  dynamicSizing(
    document.querySelectorAll("back-right")[0],
    document.querySelectorAll("scenario-back")[0]
  );
  // dynamicSizingRules();
}

function dynamicSizing(panel, scope, maxSize = panel.offsetHeight) {
  let debug = true;
  if (debug) {
    console.log("Shinking: " + panel.tagName);
  }
  let j = 0;
  let commentsPara = scope.querySelectorAll("comment.para");
  let commentsBullet = scope.querySelectorAll("comment.bullets");
  let commentsLead = commentsPara[0] ? commentsPara[0] : commentsBullet[0];

  while (checkOverflowHeight(panel, 0)) {
    var fontSizePara = parseFloat(
      window.getComputedStyle(commentsLead, null).getPropertyValue("font-size")
    );
    var lineHeightPara = parseFloat(
      window.getComputedStyle(commentsLead, null).getPropertyValue("line-height")
    );
    commentsPara.forEach((para) => {
      para.style.lineHeight = lineHeightPara - 1 + "px";
      para.style.fontSize = fontSizePara - 1 + "px";
    });
    commentsBullet.forEach((bullet) => {
      bullet.style.lineHeight = lineHeightPara - 1 + "px";
      bullet.style.fontSize = fontSizePara - 1 + "px";
    });
    j += 1;
    if (j > 20) {
      console.log("safety");
      break;
    }
  }
}

function dynamicSizingRules() {
  let debug = true;
  let levelsHolder = document.querySelectorAll("scenario-levels")[0];
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
