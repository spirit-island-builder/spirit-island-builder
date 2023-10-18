function startMain() {
  var html = document.querySelectorAll("board")[0].innerHTML;
  document.querySelectorAll("board")[0].innerHTML = replaceIcon(html);
  adjustComplexityValue();
  createPowerProperties();
  var setup = document.querySelectorAll("setup-description")[0];
  var playstyle = document.querySelectorAll("play-style-description")[0];
  var lore = document.querySelectorAll("lore-description")[0];

  setTimeout(() => {
    resize();
  }, 200);
}

function resize() {
  dynamicSizing(document.querySelectorAll("lore-description")[0]);

  secondContainer = document.querySelectorAll("second-section-container")[0];
  setup = document.querySelectorAll("setup-description")[0];
  playstyle = document.querySelectorAll("play-style-description")[0];

  let j = 0;
  while (checkOverflow(secondContainer)) {
    var style = window.getComputedStyle(setup, null).getPropertyValue("font-size");
    var fontSize = parseFloat(style);
    setup.style.fontSize = fontSize - 1 + "px";
    playstyle.style.fontSize = fontSize - 1 + "px";
    // safety valve
    j += 1;
    if (j > 8) {
      console.log("safety");
      break;
    }
  }
  // dynamicSizing(document.querySelectorAll('setup-description')[0]);
  // dynamicSizing(document.querySelectorAll('play-style-description')[0]);

  loreImage = document.querySelectorAll("img")[0];
  var loreOverlay = document.createElement("lore-overlay");
  loreImage.after(loreOverlay);
  var imgWidth = window.getComputedStyle(loreImage, null).getPropertyValue("width");
  imageScale = loreImage.getAttribute("scale");
  if (imageScale) {
    if (isNaN(imageScale)) {
      loreImage.style.width = imageScale;
    } else {
      loreImage.style.width = imageScale + "%";
    }
  }
}

function adjustComplexityValue() {
  //Quick Complexity
  var quickComplexity = document.getElementsByTagName("complexity")[0].getAttribute("value");
  if (quickComplexity) {
    var quickDescriptor = document.getElementsByTagName("complexity")[0].getAttribute("descriptor");
    var inner = `
                <complexity-title>COMPLEXITY</complexity-title>
                <complexity-value value="${quickComplexity}" style="width: 300px;">${quickDescriptor}</complexity-value>
                <red-box></red-box>`;
    document.getElementsByTagName("complexity")[0].innerHTML = inner;
  }

  var complexityValue = document.getElementsByTagName("complexity-value")[0].getAttribute("value");
  //add 45px for each value
  var basePixels = 120;
  var addedPixels = complexityValue * 45;
  var totalPixels = basePixels + addedPixels + "px";
  document.getElementsByTagName("complexity-value")[0].style.width = totalPixels;
}

function createPowerProperties() {
  // Quick Summary of Powers
  var valueSummary = document.getElementsByTagName("summary-of-powers")[0].getAttribute("values");
  if (valueSummary) {
    var values = valueSummary.split(",");
    var offenseValue = values[0];
    var controlValue = values[1];
    var fearValue = values[2];
    var defenseValue = values[3];
    var utilityValue = values[4];
    var powerTable = document.createElement("table");
    powerTable.className = "powers-summary";
    powerTable.innerHTML = `
                    <tbody><tr class="power-bars">
                        <td>
                            <div class="summary-of-powers-title">Summary of Powers
                        </div></td>
                        <td valign="bottom">
                            <power-bar class="offense" value="${offenseValue}"></power-bar>
                        </td>
                        <td valign="bottom">
                            <power-bar class="control" value="${controlValue}"></power-bar>
                        </td>
                        <td valign="bottom">
                            <power-bar class="fear" value="${fearValue}"></power-bar>
                        </td>
                        <td valign="bottom">
                            <power-bar class="defense" value="${defenseValue}"></power-bar>
                        </td>
                        <td valign="bottom">
                            <power-bar class="utility" value="${utilityValue}"></power-bar>
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>
                            <div>OFFENSE</div>
                        </td>
                        <td>
                            <div>CONTROL</div>
                        </td>
                        <td>
                            <div>FEAR</div>
                        </td>
                        <td>
                            <div>DEFENSE</div>
                        </td>
                        <td>
                            <div>UTILITY</div>
                        </td>
                    </tr>
                </tbody>
		  `;
    document.getElementsByTagName("summary-of-powers")[0].appendChild(powerTable);
  }

  var summaryOfPowers = document.getElementsByTagName("summary-of-powers")[0];
  var offenseTag = summaryOfPowers.getElementsByClassName("offense")[0];
  var controlTag = summaryOfPowers.getElementsByClassName("control")[0];
  var fearTag = summaryOfPowers.getElementsByClassName("fear")[0];
  var defenseTag = summaryOfPowers.getElementsByClassName("defense")[0];
  var utilityTag = summaryOfPowers.getElementsByClassName("utility")[0];

  var offenseValue = offenseTag.getAttribute("value");
  var controlValue = controlTag.getAttribute("value");
  var fearValue = fearTag.getAttribute("value");
  var defenseValue = defenseTag.getAttribute("value");
  var utilityValue = utilityTag.getAttribute("value");

  offenseTag.style.height = offenseValue * 10 + "%";
  controlTag.style.height = controlValue * 10 + "%";
  fearTag.style.height = fearValue * 10 + "%";
  defenseTag.style.height = defenseValue * 10 + "%";
  utilityTag.style.height = utilityValue * 10 + "%";

  uses = document.getElementsByTagName("summary-of-powers")[0].getAttribute("uses");
  table = document.getElementsByClassName("powers-summary")[0];
  topRow = table.getElementsByTagName("tr")[0];
  note = document.getElementsByTagName("note")[0];
  if (note) {
    console.log("found note");
    table.classList.add("has-note");
    noteRow = document.createElement("tr");
    noteRow.className = "note-row";
    topRow.parentNode.insertBefore(noteRow, topRow);
    noteRow.appendChild(document.createElement("td"));
    noteCol = document.createElement("td");
    noteCol.colSpan = "5";
    noteCol.classList.add("note");
    noteRow.appendChild(noteCol);
    noteWrap = document.createElement("note-wrap");
    noteCol.appendChild(note);
    // noteWrap.innerHTML = note.textContent;

    // note.remove();
  } else {
    console.log("no note");
    console.log(note);
  }
  countRows = table.querySelectorAll("tr").length;
  if (uses) {
    table.classList.add("has-uses");
    topRow = table.getElementsByTagName("tr")[0]; // reset top row in case note was added
    lineCol = document.createElement("td");
    lineCol.className = "power-divider";
    lineCol.rowSpan = countRows - 1;
    usesCol = document.createElement("td");
    usesCol.rowSpan = countRows; //if we added a note, span that column too
    usesCol.className = "uses-icon";
    usesCol.append("USES");
    usesList = uses.split(",");
    iconHolder = document.createElement("uses-icon-holder");
    for (let i = 0; i < usesList.length; i++) {
      usesIcon = document.createElement("icon");
      usesIcon.className = usesList[i] + " uses-icon";
      iconHolder.append(usesIcon);
    }
    usesCol.append(iconHolder);
    topRow.append(lineCol);
    topRow.append(usesCol);
  }
}

function dynamicSizing(el, maxSize = el.offsetHeight) {
  let j = 0;
  while (checkOverflow(el)) {
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var fontSize = parseFloat(style);
    el.style.fontSize = fontSize - 1 + "px";

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
