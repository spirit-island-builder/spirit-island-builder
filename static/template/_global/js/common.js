function replaceIcon(html) {
  var result = html;

  var regEx = new RegExp("(\\{[^\\}]*\\})", "ig");
  var matchs = result.match(regEx);
  const elementNames = new Set([
    "sun",
    "moon",
    "fire",
    "air",
    "plant",
    "water",
    "earth",
    "animal",
    "any",
    "markerplus",
    "markerminus",
  ]);
  const terrainSingle = new Set(["wetland", "wetlands", "mountain", "sand", "sands", "jungle"]);
  const terrainDouble = new Set([
    "ocean",
    "jungle-wetland",
    "wetland-jungle",
    "jungle-sand",
    "sand-jungle",
    "jungle-sands",
    "sands-jungle",
    "sand-wetland",
    "wetland-sand",
    "sands-wetland",
    "wetland-sands",
    "mountain-jungle",
    "jungle-mountain",
    "mountain-wetland",
    "wetland-mountain",
    "mountain-sand",
    "sand-mountain",
    "mountain-sands",
    "sands-mountain",
  ]);

  for (var match of matchs || []) {
    iconHtml = getIconHTML(match);
    result = result.replace(new RegExp(match, "ig"), iconHtml);
  }

  return result;

  // Function that processes matches into icon HTML
  function getIconHTML(match) {
    var iconName = match.replace("{", "").replace("}", "");
    let iconHtml;

    var iconNamePieces = iconName.split(",");
    let elementCount = "";
    let elementCountText = "";
    if (iconNamePieces[1]) {
      iconName = iconNamePieces[0];
      elementCount = iconNamePieces[1];
      elementCountText += "<icon-count>" + elementCount + "</icon-count>";
    }

    iconHtml = elementCountText;

    // Catch "/" options to merge into single icon
    var iconSplit = iconName.split("/");
    if (iconSplit[1]) {
      let finalIcon = "";
      iconSplit.forEach((icon, i) => {
        finalIcon += getIconHTML("{" + icon + "}");
        if (i < iconSplit.length - 1) {
          finalIcon += "/";
        }
      });
      iconHtml = "<binder>" + elementCountText + finalIcon + "</binder>";
      return iconHtml;
    }

    let HTMLTag = "icon";
    let iconClass = [];

    // Check for Size
    if (iconName.startsWith("huge-")) {
      iconName = iconName.substring(5);
      iconClass.push("huge");
    }
    if (iconName.startsWith("large-")) {
      iconName = iconName.substring(6);
      iconClass.push("large");
    }
    if (iconName.startsWith("medium-")) {
      iconName = iconName.substring(7);
      iconClass.push("medium");
    }
    if (iconName.startsWith("small-")) {
      iconName = iconName.substring(6);
      iconClass.push("small");
    }
    if (iconName.startsWith("tiny-")) {
      iconName = iconName.substring(5);
      iconClass.push("tiny");
    }

    // Check for 'no'
    let no_icon = "";
    if (iconName.startsWith("no-")) {
      no_icon = "<no-icon></no-icon>";
      iconName = iconName.substring(3);
    }

    // Check for terrain types
    if (terrainSingle.has(iconName)) {
      iconClass.push("terrain-single");
    } else if (terrainDouble.has(iconName)) {
      iconClass.push("terrain-double");
    }

    // Check for elements
    if (elementNames.has(iconName)) {
      iconClass.push("element");
    }

    // Check for Incarna
    if (iconName.startsWith("incarna-")) {
      iconName = iconName.substring(8);
      iconClass.push("incarna");
    }

    // Check for Custom
    let regex = /custom(\d+)/;
    const matches = regex.exec(iconName);
    if (matches) {
      iconClass.push("custom-icon");
    }

    // Check for Range
    let range_num = "";
    let num_val = "";
    if (iconName.startsWith("range-")) {
      HTMLTag = "range";
      range_num = iconName.substring(6);
      if (isNaN(range_num)) {
        // range_num = `<icon class="range-small-icon ${range_num}"></icon>`;
        range_num = getIconHTML(`{${range_num}}`);
        range_num = `<range-value class="range-icon">${range_num}</range-value>`;
      } else {
        range_num = `<range-value>${range_num}</range-value>`;
      }
      iconName = "range";
      num_val = range_num;
    } else if (iconName.startsWith("gain-range-")) {
      HTMLTag = "range";
      range_num = "+" + iconName.substring(11);
      range_num = `<range-value>${range_num}</range-value>`;
      iconName = "gain-range";
      num_val = range_num;
    } else if (iconName.startsWith("lose-range-")) {
      HTMLTag = "range";
      range_num = "-" + iconName.substring(11);
      range_num = `<range-value>${range_num}</range-value>`;
      iconName = "gain-range";
      num_val = range_num;
    }

    // gain energy icons
    if (iconName.startsWith("energy-") && !iconName.startsWith("energy-per")) {
      energy_num = iconName.substring(7);
      if (isNaN(energy_num)) {
        // energy_num = energy_num.charAt(0)
        energy_num = `<value-text>${energy_num}</value-text>`;
      } else {
        energy_num = `<value>${energy_num}</value>`;
      }
      HTMLTag = "custom-energy"; //"<growth-energy><value>" + flatEnergy + "</value></growth-energy>"
      iconName = "";
      num_val = energy_num;
      console.log("energy icon test");
    } else if (iconName.startsWith("gain-energy-")) {
      energy_num = iconName.substring(12);
      if (isNaN(energy_num)) {
      } else {
        HTMLTag = "custom-energy"; //"<growth-energy><value>" + flatEnergy + "</value></growth-energy>"
        energy_num = `<value>${energy_num}</value>`;
        iconName = "gain";
        num_val = energy_num;
        console.log("energy gain icon test");
      }
    }

    // Output a line break, otherwise output normal
    if (iconName.startsWith("line-break")) {
      iconHtml = "<br>";
    } else {
      //FINAL OUTPUT
      iconClass.push(iconName);
      iconHtml +=
        `<${HTMLTag} class="${iconClass.join(" ")}">` + num_val + no_icon + `</${HTMLTag}>`;
    }
    return iconHtml;
  }
}

function checkOverflowHeight(el, slack = 2) {
  let debug = false;
  let curOverflow = el.style.overflowY;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflowY = "auto";
  }
  let isOverflowing = el.clientHeight + slack < el.scrollHeight;

  if (debug) {
    console.log(
      "check overflowY = " + (el.clientHeight + slack) + " " + slack + "," + el.scrollHeight
    );
  }
  el.style.overflowY = curOverflow;
  if (debug) {
    console.log(`Common: Check OverflowHeight (${el.tagName}); Result: ${isOverflowing}`);
  }
  return isOverflowing;
}

function checkOverflowWidth(el, slack = 30) {
  let debug = false;
  if (debug) {
    console.log(`Common: Check OverflowWidth (${el.tagName})`);
  }
  let curOverflow = el.style.overflowX;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflowX = "auto";
  }
  let isOverflowing = el.clientWidth + slack < el.scrollWidth ? el.scrollWidth : false;
  el.style.overflowX = curOverflow;

  return isOverflowing;
}

function balanceText(el, lineHeight = 23) {
  // Balances text in an element
  let debug = false;
  const initialHeight = el.offsetHeight;
  const initialWidth = el.offsetWidth;
  if (debug) {
    console.log(
      "Common. Balancing Text: " + el.tagName + " H:" + initialHeight + ", W:" + initialWidth
    );
  }
  if (initialHeight > lineHeight) {
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
    // el.style.width = el.offsetWidth + "px";
  }
}

function processRulesText(element, lineTagName = "special-rule-line") {
  let separateLines = element.innerHTML.split(/\r?\n|\r|\n/g);
  element.innerHTML = "";
  let listOpen = false;
  let debug = false;
  let ruleLine;
  let inlineList;
  separateLines.forEach((line) => {
    if (line.replace(/\W/g, "").length > 0) {
      // If the line isn't blank
      if (debug) {
        console.log(line);
      }
      if (line.trim().startsWith("*")) {
        if (debug) {
          console.log("bullet detected");
        }
        if (!ruleLine) {
          console.log("starting rule line (none present)");
          ruleLine = document.createElement(lineTagName);
        }
        if (!listOpen) {
          if (debug) {
            console.log("opening new list");
          }
          // List hasn't been opened, open list and add it to document
          // let ruleListItem = document.createElement(lineTagName);
          inlineList = document.createElement("ul");
          ruleLine.appendChild(inlineList);
          // element.appendChild(ruleListItem);
          listOpen = true;
        }
        if (debug) {
          console.log("adding item to list");
        }
        // Add list item to list (that either existed or was opened)
        let listItem = document.createElement("li");
        listItem.innerHTML = line.substring(1).trim();
        inlineList.appendChild(listItem);
      } else {
        if (listOpen) {
          listOpen = false;
          ruleLine.innerHTML += line; // add the last line to the end, below the lines
        } else {
          // New line is not part of a list, so just add it.
          ruleLine = document.createElement(lineTagName);
          ruleLine.innerHTML = line;
        }
        element.appendChild(ruleLine);
      }
    } else if (listOpen) {
      listOpen = false;
      element.appendChild(ruleLine);
    }
  });
}

function getRangeModel(rangeString) {
  if (rangeString === "none") {
    return "<no-range></no-range>";
  } else {
    let result = "";
    let rangeItems = rangeString.split(",");
    let numberCount = rangeItems.filter((x) => !isNaN(x)).length;
    let rangeClass = numberCount > 1 ? "class='multi-range'" : "";
    for (let item of rangeString.split(",")) {
      if (!isNaN(item)) {
        result += `<range ${rangeClass}>${item}</range>`;
      } else if (item.startsWith("{")) {
        result += item;
      } else {
        result += `{${item}}`;
      }
    }
    return result;
  }
}
