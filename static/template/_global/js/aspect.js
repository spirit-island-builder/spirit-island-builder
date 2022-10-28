
window.onload = (event) =>{
	startMain();
    console.log('Page Loaded');

};

function startMain(){
    console.log('aspect startMain')
    var aspects = document.querySelectorAll('aspect');
    for(var i = 0; i < aspects.length; i++){
        parseSubNodes(aspects[i]);
        parseComplexity(aspects[i]);
        aspects[i].innerHTML = replaceIcon(aspects[i].innerHTML);
    }
    var backs = document.querySelectorAll('aspect-back');
    for(var i = 0; i < backs.length; i++){
        parseAspectBack(backs[i]);
    }
}

function parseSubNodes(aspect){
    var container = aspect.querySelector('aspect-container');
    for(var i = 0; i < container.childNodes.length; i++){
        if (container.childNodes[i].nodeType === 1 && container.childNodes[i].nodeName === "QUICK-INNATE-POWER") {
            container.childNodes[i].outerHTML = parseInnatePower(container.childNodes[i]);
        }
    }
}

function parseAspectBack(back){
  var html = '<img src="' + back.getAttribute("src") + '" />';
  html += '<img class="overlay" />';
  html += '<div class="aspect-back-title">ASPECT</div>';
  html += '<div class="aspect-back-name">' + back.getAttribute("spirit-name") + '</div>';
  back.innerHTML = html;
}

function parseComplexity(aspect){
  var complexityHolder = aspect.querySelector('complexity');
  if(complexityHolder){
    console.log(aspect)
    var aspectNameHTML = aspect.querySelector('aspect-name');
    aspectNameHTML.classList.add("has-complexity");
    var aspectSubtextHTML = aspect.querySelector('aspect-subtext');
    aspectSubtextHTML.classList.add("has-complexity");
    var complexityLevel = complexityHolder.getAttribute("value");
    var newComplexityElement = document.createElement('complexity')
    newComplexityElement.classList.add(complexityLevel);
    aspect.appendChild(newComplexityElement);
    complexityHolder.remove();
  }

}

function parseInnatePower(innatePowerHTML){
    var debug = false;
    var currentPowerHTML = "<innate-power class='"+innatePowerHTML.getAttribute("speed")+"'>";
    
    //Innate Power title
    currentPowerHTML += "<innate-power-title>"+innatePowerHTML.getAttribute("name")+"</innate-power-title><info-container><info-title>";
    
    //Innate Power Speed and Range Header
    currentPowerHTML += "<info-title-speed>SPEED</info-title-speed><info-title-range>RANGE</info-title-range>";
    
    //Innate Power Target Header
    currentPowerHTML += "<info-title-target>"+innatePowerHTML.getAttribute("target-title")+"</info-title-target></info-title><innate-info>";
    
    //Innater Power Speed value
    currentPowerHTML += "<innate-info-speed></innate-info-speed>";
    
    //Innate Power Range value
    currentPowerHTML += `<innate-info-range>${getRangeModel(innatePowerHTML.getAttribute("range"))}</innate-info-range>`;

    function getRangeModel(rangeString)
    {
      if(rangeString === "none"){
        return "<no-range></no-range>";
      }else {
        var result = '';
        for(var item of rangeString.split(',')){
          if(!isNaN(item)){
            result += `<range>${item}</range>`;
          }
          else
          {
            result += `<icon class="${item}"></icon>`;
          }
        }
        return result;
      }
    }
    
    //Innate Power Target value
    var targetValue = innatePowerHTML.getAttribute("target");
    currentPowerHTML += `<innate-info-target>${replaceIcon(targetValue)}</innate-info-target></innate-info></info-container>`;
    
    currentPowerHTML += "<description-container>";
    
    var noteValue = innatePowerHTML.getAttribute("note");

    //If the note field is blank, don't include it
    if(noteValue == null || noteValue == ""){
        noteValue = "";
    }else{
        currentPowerHTML += "<note>" + noteValue + "</note>";
    }       


    //Innate Power Levels and Thresholds
    var currentLevels = innatePowerHTML.getElementsByTagName("level");
    var regExp = /\(([^)]+)\)/;
    for (j = 0; j < currentLevels.length; j++){
    var currentThreshold = currentLevels[j].getAttribute("threshold");
		var isText = currentLevels[j].getAttribute("text");
		if(isText!=null){
			// User wants a special text-only line
			currentPowerHTML += "<level><level-note>";
			currentPowerHTML += currentLevels[j].innerHTML+"</level-note></level>";
		}else{
			// User wants a normal thershold-level effect
			
			let isLong = currentLevels[j].getAttribute("long");
			if(isLong!=null){
				isLong = " long"
			}else{
				isLong = ""
			}
			
			// Break the cost into a numeral and element piece (then do error handling to allow switching the order)
			var currentThresholdPieces = currentThreshold.split(",");
			var elementPieces = []
			var numeralPieces = []
			for (k = 0; k < currentThresholdPieces.length; k++){
				elementPieces[k]=currentThresholdPieces[k].substring(currentThresholdPieces[k].indexOf('-')+1)
				numeralPieces[k]=currentThresholdPieces[k].split('-')[0]
			}
			
			currentPowerHTML += "<level><threshold>";
			for (k = 0; k < currentThresholdPieces.length; k++){
				var currentNumeral = 0;
				var currentElement = '';
				if(isNaN(numeralPieces[k])){
					currentNumeral = elementPieces[k];
					currentElement = numeralPieces[k];
				}else{
					currentElement = elementPieces[k];
					currentNumeral = numeralPieces[k];
				}
				
				if(currentElement.toUpperCase()=='OR'){
					currentThresholdPieces[k]='<threshold-or>or</threshold-or>'
				}else if(currentElement.toUpperCase().startsWith('TEXT')){
					if(currentElement.split('(')[1]){
						customText = regExp.exec(currentElement)[1];
						currentThresholdPieces[k]=currentNumeral+" "+customText;
					}else{
						currentThresholdPieces[k]=currentNumeral+" "+"X";
					}
				}else if(currentElement.toUpperCase().startsWith('COST')){
					if(currentElement.split('(')[1]){
						customCost = regExp.exec(currentElement)[1];
						currentThresholdPieces[k]="<cost-threshold>Cost<icon class='"+customCost+" cost-custom'><value>-" + currentNumeral + "</value></icon></cost-threshold>";
					}else{
						currentThresholdPieces[k]="<cost-threshold>Cost<cost-energy><value>-" + currentNumeral + "</value></cost-energy></cost-threshold>";
					}
				}else{
					currentThresholdPieces[k]=currentNumeral+"{"+currentElement+"}";
				}
				currentPowerHTML += currentThresholdPieces[k];
			}
			currentPowerHTML += "</threshold><div class='description"+isLong+"'>";
			var currentDescription = currentLevels[j].innerHTML;
			currentPowerHTML += currentDescription+"</div></level>";
		}
    }
    
    currentPowerHTML+="</description-container></innate-power>";
    return currentPowerHTML;
}