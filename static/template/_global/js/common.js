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
    var iconName = match.replace("{", "").replace("}", "");
    var iconNamePieces = iconName.split(",");
    let elementCount = "";
    let elementCountText = "";
    if (iconNamePieces[1]) {
      iconName = iconNamePieces[0];
      elementCount = iconNamePieces[1];
      elementCountText += "<div class='element-for-each'><span>" + elementCount + "</span></div>";
    }

    let iconHtml = elementCountText;
    let HTMLTag = "icon";

    // Check for 'no'
    let is_no = "";
    if (iconName.startsWith("no-")) {
      is_no = "no ";
      iconName = iconName.substring(3);
    }

    // Check for terrain types
    let is_terrain = "";
    if (terrainSingle.has(iconName)) {
      is_terrain = " terrain-single";
    } else if (terrainDouble.has(iconName)) {
      is_terrain = " terrain-double";
    }

    let range_num = "";
    // Check for Range
    if (iconName.startsWith("range-")) {
      HTMLTag = "range";
      range_num = iconName.substring(6);
      if (isNaN(range_num)) {
        range_num = '<icon class="range-small-icon ' + range_num + '"></icon>';
      }
      iconName = "range";
    } else if (iconName.startsWith("gain-range-")) {
      HTMLTag = "range";

      range_num = "+" + iconName.substring(11);
      iconName = "gain-range";
      /*       if(isNaN(range_num)){
        range_num = '<icon class="range-small-icon '+range_num+'"></icon>'
      } */
    }

    iconHtml +=
      `<` +
      HTMLTag +
      ` class="` +
      is_no +
      iconName +
      is_terrain +
      `">` +
      range_num +
      `</` +
      HTMLTag +
      `>`;

    result = result.replace(new RegExp(match, "ig"), iconHtml);
  }

  return result;
}

async function takeScreenshot(elementName) {
  let { default: html2canvas } = await import(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js"
  );
  let element = document.querySelector(elementName);
  let canvas = await html2canvas(element, {
    allowTaint: true,
    scale: 1,
  });
  return canvas.toDataURL();
}
