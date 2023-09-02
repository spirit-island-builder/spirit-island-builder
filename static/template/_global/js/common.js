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
    let num_val = "";
    // Check for Range
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
      /*       if(isNaN(range_num)){
        range_num = '<icon class="range-small-icon '+range_num+'"></icon>'
      } */
    }

    if (iconName.startsWith("energy-")) {
      energy_num = iconName.substring(7);
      if (isNaN(energy_num)) {
      } else {
        HTMLTag = "growth-energy"; //"<growth-energy><value>" + flatEnergy + "</value></growth-energy>"
        energy_num = "<value>" + energy_num + "</value>";
        iconName = "";
        num_val = energy_num;
      }
    } else if (iconName.startsWith("gain-energy-")) {
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
      `</` +
      HTMLTag +
      `>`;

    result = result.replace(new RegExp(match, "ig"), iconHtml);
  }

  return result;
}
