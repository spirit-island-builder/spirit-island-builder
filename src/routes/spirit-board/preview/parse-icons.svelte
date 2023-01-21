<script context="module">
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

  const regEx = /\{([^}]*)\}/gi;
  function splitText(text) {
    let result = [];

    let match;
    let lastIndex = 0;
    while ((match = regEx.exec(text))) {
      result.push(text.slice(lastIndex, match.index));
      let iconName = match[1];
      const iconNamePieces = iconName.split(",");
      let elementCount = "";
      let elementCountText = "";
      if (iconNamePieces[1]) {
        iconName = iconNamePieces[0];
        elementCount = iconNamePieces[1];
        elementCountText += "<div class='element-for-each'><span>" + elementCount + "</span></div>";
      }

      let tag = "icon";

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

      let body = "";
      // Check for Range
      if (iconName.startsWith("range-")) {
        tag = "range";
        let range_num = iconName.substring(6);
        if (isNaN(range_num)) {
          body = { tag: "icon", class: "range-small-icon " + range_num };
        } else {
          body = range_num;
        }
        iconName = "range";
      } else if (iconName.startsWith("gain-range-")) {
        tag = "range";
        body = "+" + iconName.substring(11);
        iconName = "gain-range";
      }

      const element = document.createElement(tag);
      element.innerText = body;
      element.className = is_no + iconName + is_terrain;
      result.push(element);

      lastIndex = regEx.lastIndex;
    }
    result.push(text.slice(lastIndex));
    return result;
  }

  export const parseIcons = (text) => {
    const span = document.createElement("span");
    span.innerHTML = text;

    const recurse = (element, depth = 0) => {
      // console.log(element.outerHTML)
      if (depth > 10) {
        console.log("hit recursion limit");
        return element;
      }
      if (!element.hasChildNodes()) {
        return element;
      }
      element.replaceChildren(
        ...Array.from(element.childNodes).flatMap((node) => {
          switch (node.nodeType) {
            case Node.TEXT_NODE:
              return splitText(node.data);
              break;
            case Node.ELEMENT_NODE:
              return recurse(node, depth + 1);
            default:
              return node;
          }
        })
      );
      return element;
    };
    span.normalize();
    //let start = performance.now();
    recurse(span);
    //let end = performance.now();
    //console.log("time", end-start, text);
    return span.innerHTML;
  };
</script>

<script>
  export let text;
</script>

{@html parseIcons(text)}
