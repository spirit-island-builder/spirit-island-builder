function replaceIcon(html) {
  var result = html;

  var regEx = new RegExp("(\\{[^\\}]*\\})", "ig");
  var matchs = result.match(regEx);
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
      console.log("comining a split icon...");
      let finalIcon = "";
      iconSplit.forEach((icon, i) => {
        finalIcon += getIconHTML("{" + icon + "}");
        if (i < iconSplit.length - 1) {
          finalIcon += "/";
        }
      });
      iconHtml = "<binder>" + elementCountText + finalIcon + "</binder>";
      console.log(iconHtml);
      return iconHtml;
    }

    let HTMLTag = "icon";

    // Check for 'no'
    let is_no = "";
    let no_icon = "";
    if (iconName.startsWith("no-")) {
      // is_no = "no ";
      no_icon = "<no-icon></no-icon>";
      iconName = iconName.substring(3);
    }

    // Check for terrain types
    let is_terrain = "";
    if (terrainSingle.has(iconName)) {
      is_terrain = " terrain-single";
    } else if (terrainDouble.has(iconName)) {
      is_terrain = " terrain-double";
    }

    // Check for Incarna
    if (iconName.startsWith("incarna-")) {
      iconName = "incarna " + iconName.substring(8);
    }

    // Check for Range
    let range_num = "";
    let num_val = "";
    if (iconName.startsWith("range-")) {
      HTMLTag = "range";
      range_num = iconName.substring(6);
      if (isNaN(range_num)) {
        range_num = '<icon class="range-small-icon ' + range_num + '"></icon>';
      } else {
        range_num = "<range-value>" + range_num + "</range-value>";
      }
      iconName = "range";
      num_val = range_num;
    } else if (iconName.startsWith("gain-range-")) {
      HTMLTag = "range";

      range_num = "+" + iconName.substring(11);
      iconName = "gain-range";
      num_val = range_num;
    } else if (iconName.startsWith("lose-range-")) {
      HTMLTag = "range";

      range_num = "-" + iconName.substring(11);
      iconName = "gain-range";
      num_val = range_num;
    }

    if (iconName.startsWith("energy-")) {
      energy_num = iconName.substring(7);
      if (isNaN(energy_num)) {
      } else {
        HTMLTag = "custom-energy"; //"<growth-energy><value>" + flatEnergy + "</value></growth-energy>"
        energy_num = "<value>" + energy_num + "</value>";
        iconName = "";
        num_val = energy_num;
        console.log("energy icon test");
      }
    } else if (iconName.startsWith("gain-energy-")) {
      energy_num = iconName.substring(12);
      if (isNaN(energy_num)) {
      } else {
        HTMLTag = "custom-energy"; //"<growth-energy><value>" + flatEnergy + "</value></growth-energy>"
        energy_num = "<value>" + energy_num + "</value>";
        iconName = "gain";
        num_val = energy_num;
        console.log("energy gain icon test");
      }
    }

    iconHtml +=
      `<` +
      HTMLTag +
      ` class="` +
      is_no +
      iconName +
      is_terrain +
      `">` +
      num_val +
      no_icon +
      `</` +
      HTMLTag +
      `>`;

    return iconHtml;
  }
}

function checkOverflowHeight(el, slack = 2) {
  let debug = true;
  if (debug) {
    console.log(`Common: Check OverflowHeight (${el.tagName})`);
  }
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
  return isOverflowing;
}

function checkOverflowWidth(el, slack = 30) {
  let debug = true;
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
