function replaceIcon(html)
{
  var result = html;

  var regEx = new RegExp('(\\{[^\\}]*\\})', "ig");
  var matchs = result.match(regEx);
  const terrainSingle = new Set(['wetland', 'wetlands', 'mountain', 'sand', 'sands', 'jungle'])
  const terrainDouble = new Set(['ocean', 'jungle-wetland', 'wetland-jungle', 'jungle-sand', 'sand-jungle', 'jungle-sands', 'sands-jungle', 'sand-wetland', 'wetland-sand', 'sands-wetland', 'wetland-sands', 'mountain-jungle', 'jungle-mountain', 'mountain-wetland', 'wetland-mountain', 'mountain-sand', 'sand-mountain', 'mountain-sands', 'sands-mountain' ])
  
  for(var match of (matchs || [])) {
    var iconName = match.replace('{', '').replace('}', '');
    var iconNamePieces = iconName.split(",");
    let elementCount = "";
    let elementCountText = "";
    if(iconNamePieces[1]){
      iconName = iconNamePieces[0];
      elementCount = iconNamePieces[1];
      elementCountText += "<div class='element-for-each'><span>"+elementCount+"</span></div>";
    }
    
    let iconHtml = elementCountText;
    if(iconName.startsWith('no-')){
      iconHtml += `<icon class="no ${iconName.substring(3)}"></icon>`;
    }else if(terrainSingle.has(iconName)) {
      iconHtml += `<icon class="${iconName} terrain-single"></icon>`;
    }else if(terrainDouble.has(iconName)) {
      iconHtml += `<icon class="${iconName} terrain-double"></icon>`;
    }else{
      iconHtml += `<icon class="${iconName}"></icon>`;
    }
    result = result.replace(new RegExp(match, "ig"), iconHtml);
  }

  return result;
}

async function screenshot() {
  html2canvas(document.querySelector("board")).then(canvas => {
    console.log(window.location.href)
    window.parent.postMessage(canvas.toDataURL(), window.location.href)
  });
}