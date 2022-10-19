function replaceIcon(html)
{
  var result = html;

  var regEx = new RegExp('(\\{[^\\}]*\\})', "ig");
  var matchs = result.match(regEx);
  for(var match of (matchs || []))
  {
    var iconName = match.replace('{', '').replace('}', '');
	var iconNamePieces = iconName.split(",");
	let elementCount = "";
	let elementCountText = "";
	if(iconNamePieces[1]){
		iconName = iconNamePieces[0];
		elementCount = iconNamePieces[1];
		elementCountText += "<div class='element-for-each'><span>"+elementCount+"</span></div>";
	}
	
    let iconHtml
	iconHtml = elementCountText;
    if(iconName.startsWith('no-')){
        iconHtml += `<icon class="no ${iconName.substring(3)}"></icon>`;
    }else{
        iconHtml += `<icon class="${iconName}"></icon>`;
    }
    result = result.replace(new RegExp(match, "ig"), iconHtml);
  }

  return result;
}