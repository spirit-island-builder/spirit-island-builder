
window.onload = (event) =>{
	startMain();
    console.log('Page Loaded');

};

function startMain(){
    
	console.log('CREATING SPIRIT BOARD')
  	parseGrowthTags();
    
	if(document.getElementById("presence-table")) {
        enhancePresenceTracksTable();
    } else {        
        setNewEnergyCardPlayTracks(parseEnergyTrackTags(), parseCardPlayTrackTags());
    }

    parseInnatePowers();
	
	parseSpecialRules();

    const board = document.querySelectorAll('board')[0];
    var html = board.innerHTML;
    board.innerHTML = replaceIcon(html);
	
	setTimeout(function() { 
    dynamicCellWidth()
    dynamicSpecialRuleHeight(board)
    addImages(board)
  }, 200);

}

function dynamicSpecialRuleHeight(board){
  var debug = true;
  console.log('RESIZING: Special Rule')
    const specialRules = board.querySelectorAll('special-rules-container')[0]
    let height = specialRules.getAttribute('height')

    if(!height){
        const computedStyle = window.getComputedStyle(specialRules)
        height = computedStyle.getPropertyValue('height')
    }


    const spiritName = board.querySelectorAll('spirit-name')[0]
    if(specialRules){
      if(debug) console.log(`calc(100% - ${height})`)
        specialRules.style.top = `calc(100% - ${height})`
        specialRules.style.height = height
    }
    if(spiritName){
        spiritName.style.top = `calc(100% - ${height})`
    }
}

function addImages(board) {
  console.log('ADDING IMAGES')
  const spiritImage = board.getAttribute('spirit-image');
  const artistCredit = board.getElementsByTagName('artist-name');
  const spiritBorder = board.getAttribute('spirit-border');
  
  const imageSize = board.getAttribute('spirit-image-scale');

  
  const specialRules = board.querySelectorAll('special-rules-container')[0]
  let height = specialRules.getAttribute('height')
      if(!height){
      const computedStyle = window.getComputedStyle(specialRules)
      height = computedStyle.getPropertyValue('height')
  }
  
  if(spiritBorder){
      const specialRules = board.querySelectorAll('special-rules-container')[0]
  const spiritBorderSize = board.getAttribute('spirit-border-scale');
  if(spiritBorderSize){
    borderHeight = spiritBorderSize;
    specialRules.innerHTML = `<div class="spirit-border" style="background-image: url(${spiritBorder}); background-size: 705px ${borderHeight};" ></div>` + specialRules.innerHTML
  }else{
    specialRules.innerHTML = `<div class="spirit-border" style="background-image: url(${spiritBorder});" ></div>` + specialRules.innerHTML
  }
  }
  if(spiritImage){
    //Image now scales to fill gap. 'imageSize' allows the user to specify what % of the gap to cover
    board.innerHTML = `<div class="spirit-image" style="background-image: url(${spiritImage}); background-size: auto ${imageSize}; height:calc(100% - ${height}); width:1700px;" ></div>` + board.innerHTML
    artistCredit[0].style.display = "block";
    artistCredit[0].innerHTML = "Artist Credit: "+ artistCredit[0].innerHTML
  }
	
	//Add Meeple
	const spiritName = board.getElementsByTagName('spirit-name');
	spiritName[0].outerHTML += "<custom-meeple></custom-meeple>";
	
}

function parseGrowthTags(){
    console.log("BUILDING GROWTH PANEL")
    var debug = false;
	var fullHTML = "";
	const board = document.querySelectorAll('board')[0];
    var growthHTML = board.getElementsByTagName("growth");
    
    var growthTitle = "<section-title>"+growthHTML[0].title+"</section-title>";

    const subList = Array.from(growthHTML[0].getElementsByTagName('sub-growth'))
    let subTitle = subList
        .map(e => `<sub-section-title><sub-section-line></sub-section-line><span>${e.title}</span><sub-section-line></sub-section-line></sub-section-title>`).join('')


    var newGrowthTableTagOpen = "<growth-table>";
    var newGrowthTableTagClose = "</growth-table>";

    //Find values between parenthesis
    var regExp = /\(([^)]+)\)/;
/*     var newGrowthCellHTML = subList.length > 0
        ? "<growth-group header='0'>"
        : "<growth-group>" */
    var newGrowthCellHTML = "";
    
    let currentHeaderIndex = 0

    for (let i = 0; i < growthHTML[0].children.length; i++) {
        const childElement = growthHTML[0].children[i];
        const previousElement = i > 0
            ? growthHTML[0].children[i - 1]
            : undefined
        const nextElement = i < growthHTML[0].children.length - 1
            ? growthHTML[0].children[i + 1]
            : undefined

        //childElement is the thing that should be replaced when all is said and done
        if (childElement.nodeName.toLowerCase() == 'sub-growth') {
          // Using Growth Sets
          if (childElement.getAttribute('bordered') !== undefined && previousElement && (previousElement.nodeName.toLowerCase() != 'sub-growth' || previousElement.getAttribute('bordered') == !undefined)) {
              // I'm not sure when this is used, tbh.
              newGrowthCellHTML += "<growth-border double></growth-border>";
          }

          for (let j = 0; j < childElement.children.length; j++) {
            const nextSubElement = j < childElement.children.length - 1
              ? childElement.children[j + 1]
              : undefined
            
            writeGrowthNode(childElement.children[j], nextSubElement, childElement.title ? currentHeaderIndex : undefined);
          }
          if (childElement.title) {
              currentHeaderIndex++
          }
          
          if (childElement.getAttribute('bordered') !== undefined && nextElement) {
            newGrowthCellHTML += `<growth-border double></growth-border>`;
          }
        } else {
          // Not Growth Sets
            writeGrowthNode(childElement, nextElement);
        }

    }
    fullHTML += growthTitle + subTitle + newGrowthTableTagOpen + newGrowthCellHTML + newGrowthTableTagClose

    board.getElementsByTagName("growth")[0].removeAttribute("title");
    board.getElementsByTagName("growth")[0].innerHTML = fullHTML;

  function writeGrowthNode(childElement, nextElement, headerIndex=NaN) {

    const tint = childElement.getAttribute("tint");
    let tint_text = ""
    if (tint) {
      tint_text += "<div class='tint' style='background-color:"+tint+";'></div>"
    }

    var headerText = !isNaN(headerIndex) ? ` header='${headerIndex}'` : "";
    var specialTitleText = childElement.getAttribute('special-title') ? ` special-title='${childElement.getAttribute('special-title')}'` : "";
    newGrowthCellHTML += `<growth-group`+headerText+specialTitleText+`>`;
    var titleHolder = "";
    if(childElement.getAttribute('special-title')){titleHolder=childElement.getAttribute('special-title')}
    
    const cost = childElement.getAttribute("cost");
    if (cost) {
      costSplit=cost.split(",");
      if (isNaN(costSplit[0])){
        // Non-numerical cost (ie. forget a card)
        if (costSplit[1]){
          // Non-numerical cost with text
          newGrowthCellHTML += "<growth-cost-custom-nonscaling><icon class='"+costSplit[0]+"'></icon><growth-cost-custom-nonscaling-description>"+costSplit[1]+"</growth-cost-custom-nonscaling-description></growth-cost-custom-nonscaling>";
        }else{
          // non-numerical cost by itself
          newGrowthCellHTML += "<growth-cost-custom-nonscaling><icon class='"+costSplit[0]+"'></icon><growth-cost-custom-nonscaling-description></growth-cost-custom-nonscaling-description></growth-cost-custom-nonscaling>";
        }
      } else if (costSplit[1]){
        // User wants to use a non-energy scaling cost
        if(debug){console.log("Cost with custom icon")};
        newGrowthCellHTML += "<growth-cost-custom><icon class='"+costSplit[1]+"'><value>-" + costSplit[0] + "</value></icon></growth-cost-custom>";
      }else{
        // Its just a number, so do energy cost
        newGrowthCellHTML += `<growth-cost>-${costSplit[0]}</growth-cost>`;
      }
    }
    
    
    const growthClass = childElement.getAttribute("values");
    const classPieces = growthClass.split(';');
    const openTag = "<growth-cell>" + tint_text
    const closeTag = '</growth-cell>'
		const terrains = new Set(['wetland', 'mountain', 'sand', 'sands', 'jungle'])
		const elementNames = new Set(['sun', 'moon', 'fire', 'air', 'plant','water','earth','animal'])

		console.log("--Growth Group:--")
		console.log(classPieces)
		
		// Create some tools for 'or' growth options
		let isOr = false;
		let isPresenceNode = false;
		let orTextHold = ""
		let orIconsHold = ""
		let orGrowthOpenHold = ""
		let orGrowthTextOpenHold = ""

        for (j = 0; j < classPieces.length; j++) {
			
			
			//Find a parenthesis and split out the string before it
			let growthItem = classPieces[j].split("(")[0].split("^")[0];
			if(debug){console.log("Growth Option: "+classPieces[j]+", "+j)};
			// Check for OR
			var regExpOuterParentheses = /\(\s*(.+)\s*\)/;
			var regExpCommaNoParentheses = /,(?![^(]*\))/;

			if(growthItem=='or'){
				isOr = true;
				let matches = regExpOuterParentheses.exec(classPieces[j])[1]
				orGrowthOptions = matches.split(regExpCommaNoParentheses)
				// orGrowthOptions = matches.split(",")
				classPieces[j]=orGrowthOptions[1]
				classPieces.splice(j,0,orGrowthOptions[0]);
				growthItem = classPieces[j].split("(")[0].split("^")[0];
			}
			
			// Check for Presence Node in Growth
			if(growthItem=='presence-node'){
				let matches = regExpOuterParentheses.exec(classPieces[j])[1]
				if(debug){console.log("Putting Presence Node in Growth")};
				isPresenceNode = true;
				classPieces[j]=matches
				growthItem = classPieces[j].split("(")[0].split("^")[0];
			}
			
			if(debug){console.log('growth item= '+growthItem)};
			
			//Find if a growth effect is repeated (Fractured Days)
			repeatOpen = ""
			repeatClose = ""
			repeatText = ""
			if(classPieces[j].split("^")[1]){
				console.log("repeat detected")
				const repeat = classPieces[j].split("^")[1];
				repeatOpen = "<repeat-growth><value>"+repeat+"</value></repeat-growth>"
				repeatClose = ""
				repeatText = "x"+repeat+": ";
			}
			
			// Establish Growth HTML Openers and Closers
			// let growthOpen = `${openTag}${repeatOpen}`;
			let growthOpen = `${openTag}`;
			let growthTextOpen = "<growth-text>"+repeatText;
			let growthTextClose = "</growth-text>"+repeatClose+`${closeTag}`;
			
			
			
            switch (growthItem) {
				// Simple growth items are handled in the 'Default' case. See function IconName.
				// Only growth items with options are handled here.
        case 'reclaim': {
          const matches = regExp.exec(classPieces[j])
          let reclaimIcon = "{reclaim-all}";
          let reclaimText = IconName('reclaim'+"-all");
          if (matches){
            let reclaimOptions = matches[1].split(",");
            let reclaimType = reclaimOptions[0];
            let reclaimModifiersOrText = reclaimOptions[1];
            switch(reclaimType)
            {
              case 'all':
                if(reclaimModifiersOrText){
                  reclaimIcon = "<icon class='reclaim-"+reclaimType+"'>"+"<icon class='reclaim-element "+reclaimModifiersOrText+"'></icon></icon>"
                  reclaimText = 'Reclaim All Cards with '+Capitalise(reclaimModifiersOrText)
                }
                break;
              case 'one':
                if(reclaimModifiersOrText){
                  reclaimIcon = "<icon class='reclaim-"+reclaimType+"'>"+"<icon class='reclaim-element "+reclaimModifiersOrText+"'></icon></icon>"
                  reclaimText = 'Reclaim One Card with '+Capitalise(reclaimModifiersOrText)
                }else{
                  reclaimIcon = "{reclaim-"+reclaimType+"}"
                  reclaimText = IconName('reclaim-'+reclaimType)
                }
                break;
              case 'none':
                reclaimIcon = "{reclaim-"+reclaimType+"}"
                reclaimText = IconName('reclaim-'+reclaimType)
                break;
              case 'half':
                reclaimIcon = "{reclaim-"+reclaimType+"}"
                reclaimText = IconName('reclaim-'+reclaimType)
                break;
              case 'custom':
                reclaimIcon = "{reclaim-"+reclaimType+"}"
                reclaimText = "Reclaim " + reclaimModifiersOrText
                break;
              default:
                reclaimText = "TEXT NOT RECOGNIZED - use 'all','one',or 'custom'";
            }
          }
          growthIcons = reclaimIcon
          growthText = reclaimText
          break;
        }
        case 'gain-card-pay-2': {
          growthIcons = "<custom-icon>{" + growthItem + "}</custom-icon>"
          growthText = "You may Pay 2 Energy to Gain a Power Card"
          break;
        }
        case 'gain-power-card': {
          const matches = regExp.exec(classPieces[j])
          let gainPowerCardIcon = "{"+growthItem+"}";
          let gainPowerCardText = IconName(growthItem);
          if (matches){
            let gainPowerCardOptions = matches[1].split(",");
            let gainPowerCardType = gainPowerCardOptions[0];
            let gainPCModifiersOrText = gainPowerCardOptions[1];
            gainPowerCardIcon = "<icon class='gain-power-card'>"
            switch(gainPowerCardType)
            {
              case 'minor':
                gainPowerCardIcon += "<icon class='minor gain-card-modifier'></icon>"
                gainPowerCardText = "Gain Minor Power Card"
                // if(gainPCModifiersOrText){
                  // gainPowerCardIcon = "<icon class='reclaim-"+gainPowerCardType+"'>"+"<icon class='reclaim-element "+gainPCModifiersOrText+"'></icon></icon>"
                  // gainPowerCardText = 'Reclaim All Cards with '+Capitalise(gainPCModifiersOrText)
                // }
                break;
              case 'major':
                gainPowerCardIcon += "<icon class='major gain-card-modifier'></icon>"
                gainPowerCardText = "Gain Major Power Card"
                if(gainPCModifiersOrText){
                  gainPowerCardText += gainPCModifiersOrText
                }
                break;
              default:
                gainPowerCardIcon += "<icon class='"+gainPowerCardType.toLowerCase()+" gain-card-modifier'></icon>"
                gainPowerCardText = "Gain "+Capitalise(gainPowerCardType)+" Power Card"
            }
            gainPowerCardIcon += "</icon>"
          }
          growthIcons = gainPowerCardIcon
          growthText = gainPowerCardText
          break;
        } 
        case 'isolate': {
          const matches = regExp.exec(classPieces[j])
          let isolateIcons = "{isolate}"
          let isolateText = "Isolate 1 of Your Lands"
          let isolateReqOpen = "";
          let isolateReqClose = "";
          if (matches){
            let isolateOptions = matches[1].split(",");
            let isolateRange = isolateOptions[0];
            isolateReqOpen = "<custom-icon>";
            isolateReqClose = "</custom-icon>";
            isolateIcons += "<range-growth>" + isolateRange + "</range-growth>";
            isolateText = "Isolate a Land";
          }
          growthIcons = isolateReqOpen + isolateIcons + isolateReqClose
          growthText = isolateText
          break;
        }
        case 'damage': {
          const matches = regExp.exec(classPieces[j]);
          let damageOptions = matches[1].split(",");
          let range = damageOptions[0];
          let damage = damageOptions[1];
          growthIcons = "<custom-icon><growth-damage><value>" + damage + "</value></growth-damage>"+ "<range-growth>" + range + "</range-growth></custom-icon>"
          growthText = "Deal "+damage+" Damage at Range " + range
          break;
        }
        case 'gain-energy': {
          const matches = regExpOuterParentheses.exec(classPieces[j]);
          const gainEnergyBy = matches[1];
          let energyOptions = matches[1].split(",");
                let energyManyIconOpen = "" 
          let energyManyIconClose = ""
          if (isNaN(energyOptions[0]) || energyOptions.length!=1) {
              energyManyIconOpen = "<growth-cell-double>"
              energyManyIconClose = "</growth-cell-double>"
          }
          let energyGrowthIcons = ""
          let energyGrowthText = ""
          let x_is_num = !isNaN(energyOptions[0]);
          let x_is_zero = (energyOptions[0]==0);
          let x_is_text = energyOptions[0]=='text';
          let x_is_flat = x_is_num && !x_is_zero;
          let y_is_text = energyOptions[1]!==undefined ? energyOptions[1]=='text' : false;
          let has_custom_text = (x_is_text || y_is_text);
          let custom_text = ""
          if(has_custom_text){custom_text += y_is_text ? energyOptions[2]:energyOptions[1]}
          
          shift = 0;
          shift += (x_is_num) ? 1 : 0;
          shift += (has_custom_text) ? 2 : 0;
          let flatEnergy = energyOptions[0];
          let scaling_entity = energyOptions[shift];
          let scaling_value = energyOptions[shift+1]!==undefined ? energyOptions[shift+1] : 1;
          if (!isNaN(scaling_entity)){
            scaling_value=scaling_entity;
            scaling_entity = undefined;
          }
          var customScalingIcon = (scaling_entity !== undefined) ? ("<icon class='" + scaling_entity + "'></icon>") : "<div class='custom-scaling'>!!!</div>"
          
          // Flat Energy
          if(x_is_flat){
            energyGrowthIcons = "<growth-energy><value>" + flatEnergy + "</value></growth-energy>"
            if(scaling_entity){
              energyGrowthText = "Gain "+flatEnergy+" Energy"
            }else{
              energyGrowthText = "Gain Energy"
            }
          }
          
          // Scaling Energy
          if(scaling_entity || has_custom_text){
            energyGrowthIcons += "<gain-per><value>"+scaling_value+"</value></gain-per>"
            energyGrowthIcons += "<gain-per-element><ring-icon>"+customScalingIcon+"</ring-icon></gain-per-element>";
            if(x_is_flat){
              energyGrowthText += " and +"+scaling_value+" more per "
            }else{
              energyGrowthText += "Gain "+scaling_value+" Energy per "
            }
            energyGrowthText += has_custom_text ? custom_text : Capitalise(scaling_entity);
            energyGrowthText += elementNames.has(scaling_entity) ? ' Showing' : '';
          }
          growthIcons = energyManyIconOpen + energyGrowthIcons + energyManyIconClose
          growthText = energyGrowthText
          break;
        }
        case 'add-presence': {
          const matches = regExpOuterParentheses.exec(classPieces[j]);

          let presenceOptions = matches[1].split(",");
          let presenceRange = presenceOptions[0];
          let presenceReqOpen = "<custom-presence>";
          let presenceReqClose = "</custom-presence>";
          let presenceReq = "none";
          let presenceText = "";
          let presenceIcon = "";
          let presenceTextLead = "";
          let presenceTextEnd = "";
          let presenceRangeOpen = "<range-growth>";
          let presenceRangeClose = "</range-growth>";

          if (presenceRange=='any' && presenceOptions.length==1) {
            presenceReqOpen = "<custom-presence-no-range>";
            presenceReqClose = "</custom-presence-no-range>";
            presenceRangeOpen = "<range-growth-any>";
            presenceRangeClose = "</range-growth-any>";
            presenceText = " to any Land"
          } else if (presenceOptions.length > 1) {
            presenceReqOpen = "<custom-presence-req>";
            presenceReqClose = "</custom-presence-req>";
            presenceIcon += "<presence-req>";
                        
            if (presenceRange=='any'){
              presenceReqOpen += "<presence-req></presence-req>"
              presenceRangeOpen = "<range-growth-any>";
              presenceRangeClose = "</range-growth-any>";
            }
            
            if(presenceOptions[1]=='text'){
            // User wants a custom text presence addition
            presenceText += " "+presenceOptions[2];
              if(presenceOptions[3]){
                presenceIcon += "<display-custom>"
                for(i = 3; i < presenceOptions.length; i++){
                  presenceIcon += "<icon class='"+presenceOptions[i]+"'></icon>"
                }
                presenceIcon += "</display-custom>"
              }else{
                presenceIcon += "<span style='font-family: DK Snemand; font-size: 24pt; font-style: normal;'>!!!</span>";
              }
            } else if (presenceOptions[1]=='token'){
            // User wants to add a token in growth
              switch (presenceOptions[3]){
                case 'and':
                  //add presence and token
                  presenceIcon += "<span class='plus-text'>+ </span>";
                  presenceIcon += "{"+presenceOptions[2]+"}";
                  presenceText += " and a " + Capitalise(presenceOptions[2]);
                  break;
                case 'or':
                  //add presence or token
                  presenceReqOpen = "<custom-presence-req><custom-presence-or>";
                  presenceReqClose = "</custom-presence-req>";
                  presenceIcon = "{backslash}{"+presenceOptions[2]+"}</custom-presence-or>";
                  presenceText += " or a " + Capitalise(presenceOptions[2]);
                case 'instead':
                  //no option to add presence, just token
              }
            } else {
              // User wants an OR or an AND requirement
              let operator = "";
              if (presenceOptions.length > 4) {
                operator = "/";
              }else{
                operator = " "+presenceOptions.at(-1)+" ";
              }
              
              presenceText += " to ";
              presenceText += presenceRange === 'any' ? 'any ' : '';
              
              let flag = 0; // This flag is used to figure out if 'land with' has been said already. It comes up with add-presence(3,jungle,beasts,or)
              let and_flag = 0;
              for (var i = 1; i < presenceOptions.length; i++) {
                
                presenceReq = presenceOptions[i];
                
                // Check to see if we've reached an 'or' or 'and', which shouldn't be parsed
                if (presenceReq.toLowerCase() === 'or' || presenceReq.toLowerCase() === 'and') {
                    break;
                }
                
                // Check for common typos
                presenceReq = presenceReq.includes('sands') ? presenceReq : presenceReq.replace('sand','sands');
                presenceReq = presenceReq.replace('wetlands','wetland');
                
                // Icons
                switch (presenceReq){
                  case 'inland':
                  case 'coastal':
                  case 'invaders':
                    presenceIcon += presenceOptions.length < 3
                      ? "<span class='non-icon'>"+presenceReq.toUpperCase()+"</span>" // This do-nothing Icon just creates 50px of height to make everything line up. Other ideas?
                      : "<span class='non-icon small'>"+presenceReq.toUpperCase()+"</span>"
                    break;
                  case 'no-own-presence':
                    presenceIcon += "{no-presence}";
                    break;
                  default:
                    presenceIcon += "{"+presenceReq+"}";
                }

                if (i < presenceOptions.length - 2) {
                    presenceIcon += operator;
                }
                                
                // Text
                multiLandCheck = presenceReq.split("-");
                if (terrains.has(multiLandCheck[1])){
                  multiLandText = Capitalise(multiLandCheck[0]) + " or " + Capitalise(multiLandCheck[1]);
                  presenceReq = 'multiland';
                }
                
                presenceTextLead = "";
                presenceTextEnd = "";
                
                switch (presenceReq){
                  case 'sand':
                  case 'sands':
                  case 'mountain':
                  case 'wetland':
                  case 'jungle':
                  case 'ocean':
                    presenceText += i != 1 ? operator : "";
                    presenceText += Capitalise(presenceReq);
                    and_flag = 1;
                    break;
                  case 'inland':
                  case 'coastal':
                    presenceText += i != 1 ? operator : "";
                    presenceText += Capitalise(presenceReq) + " land";
                    break;
                  case 'multiland':
                    presenceText += multiLandText;
                    and_flag = 1;
                    break;
                  case 'no-blight':
                    if(i == 1){
                      presenceText += " Land without "
                    }else{
                      presenceText += operator == ' and ' ? " and no " : " or no ";
                    }
                    presenceText += "Blight";
                    break;
                  case 'beast':
                      presenceTextEnd = "s"
                  case 'no-own-presence':
                    if(i == 1){
                      presenceText += " Land without "
                    }else{
                      presenceText += operator == ' and ' ? " and no " : " or no ";
                    }
                    presenceText += "Your Presence";
                    break;
                  case 'presence':
                    presenceTextLead += presenceTextEnd==="" ? "Your " : "";
                    //Intentionally do not break.
                  default:
                    if (flag == 0 && i != 1 && operator != ' and ') {
                        presenceText += operator+"Land with ";
                    }else if(flag == 0 && operator != ' and '){
                        presenceText += " Land with ";
                    }else{
                      if(operator === ' and ' && flag !== 1){
                        presenceText += (and_flag===1) ? ' with ' : ' Land with ';
                      }else{
                        presenceText += operator;
                      }
                    }
                    flag = 1;
                    presenceText += presenceTextLead + Capitalise(presenceReq) + presenceTextEnd;
                }
              }                            
            }
            presenceIcon += "</presence-req>";
          }
          growthIcons = presenceReqOpen + "<plus-presence>+{presence}</plus-presence>" + presenceIcon + presenceRangeOpen + presenceRange + presenceRangeClose + presenceReqClose
          growthText = "Add a Presence" + presenceText
          break;
        }
        case 'push':
        case 'gather': {
          const matches = regExp.exec(classPieces[j]);
          
          let preposition = growthItem=='push'
            ? 'from'
            : 'into'
          
          let moveText = ""
          let moveIcons = ""
          let moveTarget = matches[1];
          let moveOptions = matches[1].split(",");
          let moveRange = moveOptions[1];
          let moveNum = moveOptions[2];
          let plural = 0;
          if(!moveNum){
            moveNum = 1;
          }else if(isNaN(moveNum)){
            moveNum = moveNum.toUpperCase();
          }else{
            plural = moveNum > 1 ? 1 : 0;
          }
          if(moveRange){
            moveTarget = moveOptions[0];
            if(isNaN(moveRange)){
              let moveCondition = moveRange;
              // Gather/Push into/from a sacred site, land with token, or terrain
              
              // Text
              if(isNaN(moveNum)){
                moveText += Capitalise(growthItem)+" 1 " + Capitalise(moveTarget) +" "+ preposition + " " + moveNum;
              }else{
                moveText += Capitalise(growthItem)+" "+moveNum+" " + Capitalise(moveTarget) +" "+ preposition;
              }
              switch (moveCondition){
                case 'sacred-site':
                  if(isNaN(moveNum)){moveText += " of"};
                  moveText += " your Sacred Sites"
                  moveIcons += "<push-gather><icon class='" + growthItem + "-" + preposition + "'><icon class='" + moveTarget + "'></icon><icon class='" + preposition + " " + moveCondition + "'></icon></icon></push-gather>"
                  break;
                case 'wetland':
                case 'sand':
                case 'sands':
                case 'mountain':
                case 'jungle':
                case 'jungle-wetland':
                case 'jungle-sand':
                case 'jungle-sands':
                case 'jungle-mountain':
                case 'sand-wetland':
                case 'sands-wetland':
                case 'mountain-wetland':
                case 'mountain-sand':
                case 'mountain-sands':
                case 'mountain-jungle':
                case 'sand-jungle':
                case 'sands-jungle':
                case 'sand-mountain':
                case 'sands-mountain':
                case 'wetland-jugnle':
                case 'wetland-mountain':
                case 'wetland-sand':
                case 'wetland-sands':
                case 'ocean':
                  moveIcons += "<push-gather><icon class='" + moveCondition + " terrain-"+growthItem+"'>{"+growthItem+"-arrow}<icon class='" + moveTarget + " "+preposition+"'></icon></icon></push-gather>"
                  moveText += " " + Capitalise(moveCondition,plural)
                  break;
                default:
                  if(moveNum==1){moveText += " 1"}
                  moveText += " of your Lands with " + Capitalise(moveCondition)
                  moveIcons += "<push-gather><icon class='" + growthItem + "-" + preposition + "'><icon class='" + moveTarget + "'></icon><icon class='" + preposition + " " + moveCondition + "'></icon></icon></push-gather>"
              }
            }else{
            // Gather/Push at range
              moveIcons += "<push-gather-range-req><icon class='" + growthItem + "'><icon class='" + moveTarget + "'></icon></icon>"+"<range-growth>" + moveRange + "</range-growth></push-gather-range-req>"
              moveText += Capitalise(growthItem)+" up to 1 " + Capitalise(moveTarget)+" " + preposition + " a Land"
            }
          }else{
            moveIcons += "<push-gather><icon class='" + growthItem + "'><icon class='" + moveTarget + "'></icon></icon></push-gather>"
            moveText += Capitalise(growthItem)+" 1 " + Capitalise(moveTarget)+" " + preposition + ` 1 of your Lands`;
          }
          growthIcons = moveIcons
          growthText = moveText
          break;
        }
        case 'presence-no-range': {
          //This is potentially redundant.
          growthIcons = "<custom-presence-no-range>+{presence}</custom-presence-no-range>"
          growthText = "Add a Presence to any Land"
          break;
        }
        case 'move-presence': {        
          const matches = regExp.exec(classPieces[j]);
          const moveOptions = matches[1].split(',');
          const moveRange = moveOptions[0];
          let moveText = ""
          let moveIcons = ""
          if(!moveOptions[1]){
            moveIcons = "<custom-icon>{presence}{move-range-" + moveRange + "}</custom-icon>"
            moveText = "Move a Presence"
          }else if(!isNaN(moveOptions[1])){
            moveIcons = "<custom-icon><token-wrap>"
            for (var i = 0; i < moveOptions[1]; i++) {
              moveIcons+="{presence}";
            }
            moveIcons+="</token-wrap>{move-range-" + moveRange + "}</custom-icon>"
            moveText = "Move up to "+moveOptions[1]+" Presence together"
          }
          
          growthIcons = moveIcons
          growthText = moveText
          break;
        }
        case 'gain-element': {
          const matches = regExp.exec(classPieces[j]);
          const gainedElement = matches[1];
          const elementOptions = matches[1].split(",");
          //Check if they want 2 elements (multiple of the same element, and OR between multiple elements are implemented. AND is not)
          if (elementOptions.length > 1) {
            
            //Check if they want multiples of the same element or a choice of elements by looking for a numeral
            if (isNaN(elementOptions[1]) && elementOptions.at(-1) !== 'and') {
              //No numeral - user wants different elements. For example gain-element(water,fire)
              if (elementOptions.at(-1) === 'or' || elementOptions.at(-1) === 'and'){}
          
              //Icons
              elementIcons = "<gain class='or'>"
              for (var i = 0; i < elementOptions.length; i++) {
                elementIcons += "<icon class='orelement " + elementOptions[i] + "'></icon>";
                if (i < elementOptions.length - 1) {
                  elementIcons += "{backslash}";
                }
              }
              elementIcons += "</gain>"
              //Text
              elementText = "Gain ";
              for (var i = 0; i < elementOptions.length; i++) {
                elementText += IconName(elementOptions[i]);
                if (i < elementOptions.length-2) {
                  elementText += ", ";
                } else if (i == elementOptions.length-2) {
                  elementText += " or ";
                }
              }
              growthIcons = elementIcons
              growthText = elementText
                
            } else { 
              // Gain multiple of the same element or gain multiple different elements (all of them, not or)

              let numLocs                                
              // Text
              let elementText = "";
              if (elementOptions.at(-1) == 'and'){
                // gain multiple different elements
                numLocs = elementOptions.length - 1;
                for (var i = 0; i < numLocs; i++) {
                  elementText += IconName(elementOptions[i]);
                  if (i < numLocs-2) {
                    elementText += ", ";
                  } else if (i == numLocs-2) {
                    elementText += " and ";
                  }
                }
              } else {
                // gain multiple of the same element
                numLocs = elementOptions[1];
                elementText = elementOptions[1] +" "+ IconName(elementOptions[0]);
              }
              
              // Icons
              let rad_size = 20 + 5*(numLocs-2); // this expands slightly as more icons are used
              var elementIcons = ""
              for (var i = 0; i < numLocs; i++) {
                pos_angle = i * 2*Math.PI / numLocs - (Math.PI)*(1-(1/6));
                x_loc = 1.3*rad_size * Math.cos(pos_angle) - 30;
                y_loc = rad_size * Math.sin(pos_angle) - 20;
                theta = -Math.PI/12
                x_loc_prime = Math.cos(theta)*x_loc + Math.sin(theta)*y_loc
                y_loc_prime = -Math.sin(theta)*x_loc + Math.cos(theta)*y_loc
                let element_loc = "style='transform: translateY("+y_loc_prime+"px) translateX("+x_loc_prime+"px)'";
                let cur_element = elementOptions.at(-1) === 'and'
                  ? elementOptions[i]
                  : elementOptions[0]
                elementIcons += "<icon-multi-element><icon class='"+cur_element+"'"+element_loc+"></icon></icon-multi-element>"
              }
              elementIcons += "<icon style='width:0px;height:99px'></icon>"; // This is a filler icon to make sure the spacing is right. Any idea for a better solution?
              
              growthIcons = "<gain>" + elementIcons + "</gain>"
              growthText = "Gain "+elementText
            }
                
          } else {
            growthIcons = "<gain>{" + gainedElement + "}</gain>"
            growthText = "Gain " + IconName(gainedElement)
          }
          break;
        }
        case 'custom': {
          const matches = regExpOuterParentheses.exec(classPieces[j]);
          let customOptions = matches[1].split(",");
          customIcon = customOptions[1];
          customText = customOptions[0];
          listIcons = ""
          if (customIcon){
            if(customIcon == 'text'){
              customIcon = "<span class='non-icon'>"+customOptions[2]+"</span>"
            }else{
              for(i = 1; i < customOptions.length; i++){
                listIcons +="<icon class='"+customOptions[i]+" custom-growth-icon'></icon>";
              }
              customIcon = listIcons;
            }
          }else{
            customIcon = "<div class='custom-scaling'>!!!</div>";
          }
          growthIcons = "<custom-growth-icon>" + customIcon + "</custom-growth-icon>"
          growthText = customText
          break;
        }
        case 'fear': {
          const matches = regExp.exec(classPieces[j]);
          const gainFearBy = matches[1];
          let fearOptions = matches[1].split(",");
          let fearManyIconOpen = "" 
          let fearManyIconClose = ""
          if (isNaN(fearOptions[0]) || fearOptions.length!=1) {
            fearManyIconOpen = "<growth-cell-double>"
            fearManyIconClose = "</growth-cell-double>"
          }
          let fearGrowthIcons = ""
          let fearGrowthText = ""
          let x_is_num = !isNaN(fearOptions[0]);
          let x_is_zero = (fearOptions[0]==0);
          let x_is_text = fearOptions[0]=='text';
          let x_is_flat = x_is_num && !x_is_zero;
          let y_is_text = fearOptions[1]!==undefined ? fearOptions[1]=='text' : false;
          let has_custom_text = (x_is_text || y_is_text);
          let custom_text = ""
          if(has_custom_text){custom_text += y_is_text ? fearOptions[2]:fearOptions[1]}
          
          shift = 0;
          shift += (x_is_num) ? 1 : 0;
          shift += (has_custom_text) ? 2 : 0;
          let flatFear = fearOptions[0];
          let scaling_entity = fearOptions[shift];
          let scaling_value = fearOptions[shift+1]!==undefined ? fearOptions[shift+1] : 1;
          if (!isNaN(scaling_entity)){
            scaling_value=scaling_entity;
            scaling_entity = undefined;
          }
          var customScalingIcon = (scaling_entity !== undefined) ? ("<icon class='" + scaling_entity + "'></icon>") : "<div class='custom-scaling'>!!!</div>"
          
          // Flat Fear
          if(x_is_flat){
            fearGrowthIcons = "<growth-fear><value>" + flatFear + "</value></growth-fear>"
            if(scaling_entity){
              fearGrowthText = "Generate "+flatFear+" Fear"
            }else{
              fearGrowthText = "Generate Fear"
            }
          }
          
          // Scaling Fear
          if(scaling_entity || has_custom_text){
            fearGrowthIcons += "<fear-per><value>"+scaling_value+"</value></fear-per>"
            fearGrowthIcons += "<gain-per-fear><ring-icon>"+customScalingIcon+"</ring-icon></gain-per-fear>";
            if(x_is_flat){
              fearGrowthText += " and +"+scaling_value+" more per "
            }else{
              fearGrowthText += "Generate "+scaling_value+" Fear per "
            }
            fearGrowthText += has_custom_text ? custom_text : Capitalise(scaling_entity);
            fearGrowthText += elementNames.has(scaling_entity) ? ' Showing' : '';
          }
          growthIcons = fearManyIconOpen + fearGrowthIcons + fearManyIconClose
          growthText = fearGrowthText
          break;
        }
        case 'gain-range': {
          const matches = regExp.exec(classPieces[j]);
          let rangeOptions = matches[1].split(",");
          let range = rangeOptions[0];
          let type = rangeOptions[1];
          let gainRangeText = ""
          if (type) {
            switch (type) {
              case 'powers':
              case 'power':
                gainRangeText = "Your Powers gain +"+range+" Range this turn"
                break;
              case 'power cards':
                gainRangeText = "Your Power Cards gain +"+range+" Range this turn"
                break;
              case 'everything':
                gainRangeText = "+"+range+" Range on everything this turn"
                break;
              case 'innate':
              case 'innate power':
              case 'innate powers':
                gainRangeText = "Your Innate Powers gain +"+range+" Range this turn"
                break;
              default:
                gainRangeText = "Your Powers gain +"+range+" Range this turn"
            }
          } else {
            gainRangeText = "Your Powers gain +"+range+" Range this turn"
          }
          growthIcons = "{gain-range-" + range +"}"
          growthText = gainRangeText
          break;
        }
        case 'gain-card-play': {
          const matches = regExp.exec(classPieces[j]);
          growthIcons = "{"+growthItem+"}"
          growthText = IconName(growthItem)
          
          if(matches){
            let cardplayOptions = matches[1].split(",");
            num_card_plays = cardplayOptions[0];
            plural = num_card_plays > 1 ? "s" : "";
            growthIcons = "<card-play-num><value>" + num_card_plays + "</value></card-play-num>"
            growthText = " +"+num_card_plays+" Card Play"+plural+" this turn"
          }
          break;
        }
        case 'element-marker': {
          const matches = regExp.exec(classPieces[j]);
          
          if(matches){
            let markerOptions = matches[1].split(",");
            num_markers = markerOptions[0];
            marker_type = num_markers > 0 ? 'markerplus' : 'markerminus';
            marker_verb = num_markers > 0 ? 'Prepare' : 'Discard';
            num_markers = Math.abs(num_markers)
            plural = num_markers > 1 ? "s" : "";
            numLocs = num_markers
            let rad_size = 20 + 5*(numLocs-2); // this expands slightly as more icons are used
            var markerIcons = ""
            for (var i = 0; i < numLocs; i++) {
              pos_angle = i * 2*Math.PI / numLocs - (Math.PI)*(1-(1/6));
              x_loc = rad_size * Math.cos(pos_angle) - 30;
              y_loc = rad_size * Math.sin(pos_angle) - 20;
              let marker_loc = "style='transform: translateY("+y_loc+"px) translateX("+x_loc+"px)'";
              markerIcons += "<icon-multi-element><icon class='"+marker_type+"'"+marker_loc+"></icon></icon-multi-element>"
            }
            markerIcons += "<icon style='width:0px;height:99px'></icon>"; // This is a filler icon to make sure the spacing is right. Any idea for a better solution?
            
            growthIcons = "<gain>" + markerIcons + "</gain>";
            growthText = marker_verb+" "+num_markers+" Element Marker"+plural;
          }else{
            growthIcons = "<gain>{markerplus}</gain>"
            growthText = "Prepare 1 Element Marker"
          }
          break;
        }
        case 'discard': {
          const matches = regExp.exec(classPieces[j]);
          if(matches){
            let discardOptions = matches[1].split(",");
            num_discard = discardOptions[0];
            if(!isNaN(num_discard)){
              //handle number discards
            }else{
              //handle element discards
              var discardElement=num_discard;
              discardIcon = "<icon class='discard-card'><icon class='discard-element "+discardElement+"'></icon></icon>"
              discardText = 'Discard a Power Card with '+Capitalise(discardElement)
            }
          }else{
            discardIcon = "{discard-card}"
            discardText = "Discard a Card"
          }
          growthIcons = discardIcon;
          growthText = discardText;
          break;
        }
        case 'incarna': {
          const matches = regExp.exec(classPieces[j]);
          let incarnaOptions = matches[1].split(",");
          let incarnaAction = incarnaOptions[0];
          let incarnaRangeOrToken = incarnaOptions[1] !== undefined ? incarnaOptions[1] : 0;
          let customIncarnaIcon = incarnaOptions[2] !== undefined ? incarnaOptions[2] : 'incarna-ember';
          switch(incarnaAction) {
            case 'move':
              incarnaIcon = '<custom-icon2><icon class="incarna '+customIncarnaIcon+'"></icon>{move-range-' + incarnaRangeOrToken + '}</custom-icon2>';
              incarnaText = 'Move Incarna';
              break;
            case 'empower':
              incarnaIcon = '{empower-incarna}';
              incarnaText = 'Empower Incarna';
              break;
            case 'add-move':
              incarnaIcon = '<custom-icon><add-move-upper>+{backslash}{move-arrow}</add-move-upper><add-move-lower><icon class="incarna add-move '+customIncarnaIcon+'"></icon><icon class="'+incarnaRangeOrToken+' with-your"></icon></add-move-lower></custom-icon>'
              incarnaText = 'Add/Move Incarna to Land with '+IconName(incarnaRangeOrToken);
              break;
            case 'replace':
              incarnaIcon = '<custom-icon><icon class="incarna with-incarna '+customIncarnaIcon+'"><icon class="replace-with-incarna no '+incarnaRangeOrToken+'"></custom-icon>'
              incarnaText = 'You may Replace '+IconName(incarnaRangeOrToken)+' with your Incarna';
              break;
            case 'add-token':
              incarnaIcon = '<custom-icon><add-token-upper>+<icon class="add-token '+incarnaRangeOrToken+'"></add-token-upper><add-token-lower><icon class="incarna '+customIncarnaIcon+'"><add-token-lower></custom-icon>'
              incarnaText = 'Add a '+IconName(incarnaRangeOrToken)+' at your Incarna';
              break;
            default:
          }
          growthIcons = incarnaIcon;
          growthText = incarnaText;
          break;
        }
        case 'add-token': {
          const matches = regExp.exec(classPieces[j]);
          let tokenOptions = matches[1].split(",");
          let range = tokenOptions[0];
          let tokenRange = "<range-growth>" + range + "</range-growth>"
          let token = tokenOptions[1];
          let tokenNum = tokenOptions[2];
          let tokenReqOpen = "<custom-icon>";
          let tokenReqClose = "</custom-icon>";
          let tokenText = ""
          let tokenIcons = ""
          if(!tokenNum){
            tokenIcons = "+<icon class='"+token+" token'></icon>"
            tokenText = "Add a " + Capitalise(token);
          }else if(!isNaN(tokenNum)){
            // multiple of the same token
            tokenIcons += "+"
            if (tokenNum>3){
              tokenIcons += tokenNum+"<icon class='"+token+" token'></icon>";
            }else{
              for (var i = 0; i < tokenNum; i++) {
                tokenIcons += "<icon class='"+token+" token'></icon>"
              }
            }
            tokenText = "Add "+ IconName(token,tokenNum)+" together";
          }else{
            // two or more different tokens
            operator = tokenOptions.at(-1);
            tokenIcons += "+<icon class='"+token+" token'></icon>";
            tokenText += "Add a " + Capitalise(token);
            if (operator=='and' || operator=='or'){
              for (var i = 2; i < tokenOptions.length-1; i++) {
                tokenIcons += operator=='or' ? "/" : "";
                tokenIcons += "<icon class='"+tokenOptions[i]+" token'></icon>"
                tokenText += i==tokenOptions.length-2 ? " "+operator+" " : ", ";
                tokenText += Capitalise(tokenOptions[i]);
              }
              if(operator=='and'){tokenText += ' together';}
            }else{
              tokenText = "MUST use AND or OR"
            }
          }
          growthIcons = tokenReqOpen +'<token-wrap>'+ tokenIcons+'</token-wrap>' + tokenRange + tokenReqClose;
          growthText = tokenText
          break;
        }
        case 'replace': {
          let replaceText = ""
          let replaceIcons = ""
          const matches = regExp.exec(classPieces[j]);
          let replaceOptions = matches[1].split(",");
          let range = replaceOptions[0];
          let x_is_num = !isNaN(replaceOptions[0]);

          var shift = 0
          if(x_is_num){shift += 1}  
          if(x_is_num){
            // Ranged replace
            replaceIcons = '<custom-icon><replace-wrap><icon class="replace-this no '+replaceOptions[shift]+'"></icon>+<icon class="replace-with '+replaceOptions[shift+1]+'"></icon></replace-wrap><range-growth>' + range + '</range-growth></custom-icon>';
            console.log(replaceIcons)
            replaceText = 'You may Replace '+IconName(replaceOptions[shift])+' with '+IconName(replaceOptions[shift+1]);
            console.log(replaceText)
          }else{
            // Local replace
            replaceIcons = '<custom-icon><replace-wrap><icon class="replace-this-no-range no '+replaceOptions[shift]+'"></icon>+<icon class="replace-with '+replaceOptions[shift+1]+'"></icon></replace-wrap></custom-icon>';
            replaceText = 'You may Replace 1 '+IconName(replaceOptions[shift])+' in your Lands with '+IconName(replaceOptions[shift+1]);
          }
          
          
          growthIcons = replaceIcons;
          growthText = replaceText;
          break;
        }
        default: {
          growthIcons = "{"+growthItem+"}"
          growthText = IconName(growthItem)
        }

            }
      
      if (repeatText){
        growthIcons = '<repeat-wrapper>' + repeatOpen + growthIcons+'</repeat-wrapper>';
      }
      if(isPresenceNode){
        growthIcons = '<presence-node class="growth"><ring-icon>' + growthIcons+'</ring-icon></presence-node>';
        isPresenceNode = false;
      }
      
      //Handle Ors
      if(isOr){
        // break out the ICON and TEXT
        // Save it for next time
        // Append it
        orTextHold += growthText + " or "
        orIconsHold += growthIcons +"or"
        orGrowthOpenHold = growthOpen
        orGrowthTextOpenHold = orGrowthTextOpenHold=="" ? growthTextOpen : orGrowthTextOpenHold
        isOr = false;
        console.log('Part 1: '+orTextHold)
      } else if(orTextHold){
        console.log('Part 2: '+growthText)
        growthText = orTextHold + growthText
        growthIcons = '<growth-cell-double>'+orIconsHold+ growthIcons+'</growth-cell-double>'
        newGrowthCellHTML += orGrowthOpenHold + growthIcons + orGrowthTextOpenHold + growthText + growthTextClose;
        orTextHold = ""
        orIconsHold = ""
        orGrowthOpenHold = ""
        orGrowthTextOpenHold = ""
      } else {
        // Normal growth
        newGrowthCellHTML += growthOpen + growthIcons + growthTextOpen + growthText + growthTextClose;
      }
      
        }

        if (nextElement && nextElement.nodeName.toLowerCase() == 'growth-group') {
            var headerText = !isNaN(headerIndex) ? ` header=${headerIndex}` : "";
            newGrowthCellHTML += "</growth-group><growth-border"+headerText+"></growth-border>"
        }
        if (!nextElement){newGrowthCellHTML += "</growth-group>"}

    }
}

function parseEnergyTrackTags(){
    
  const board = document.querySelectorAll('board')[0];
  var energyValues = board.getElementsByTagName("energy-track")[0].getAttribute("values");
  var energyOptions = energyValues.split(",");

  var energyBanner = board.getElementsByTagName("energy-track")[0].getAttribute("banner");
  var energyBannerScale = board.getElementsByTagName("energy-track")[0].getAttribute("banner-v-scale");
  if(!energyBannerScale){
      energyBannerScale = "100"
  }
  if(energyBannerScale.at(-1)!='%'){
    console.log('banner reported in px')
    energyBannerScale=energyBannerScale+'px';
  }
  var energyHTML = "";
  
  //Determine the length of the energy track
  //If for some reason the width of a presence track spot changes, this needs to be updated. Ideas for automating?
  let energyLength = energyOptions.length * 130 + 15;
  if(energyBanner){
      energyHTML = "<tr class='energy-track' style='background-image:  url("+energyBanner+"); background-size: "+energyLength+"px "+energyBannerScale+"; background-repeat: no-repeat; background-position: left 0px top 20px;'>"
  } else {
      energyHTML = "<tr class='energy-track'>";
  }
  
  // This can be scaled to move the first presence icon. 
  energyHTML += "<td style='width:10px'></td>"
  var firstIsMiddle = false;
  var isFirst = false;
  for(i = 0; i < energyOptions.length; i++){
    // option allows for placing presence track icons in the "middle row"
    let nodeText = energyOptions[i];
    let isMiddle = '';
    var addRing=true;
    var regExpOuterParentheses = /\(\s*(.+)\s*\)/;
    if(i==0 || (firstIsMiddle && !nodeText.startsWith("middle"))){
      isFirst=true;
    }
    firstIsMiddle=false;
    if (nodeText.startsWith("middle")){
      nodeText = regExpOuterParentheses.exec(nodeText)[1];
      isMiddle = ' rowspan="2" class="middle"';
      if(i==0){
        firstIsMiddle = true;
      }
      addRing=false
    }

    energyHTML += "<td"+isMiddle+">"+getPresenceNodeHtml(nodeText, isFirst, "energy", addRing)+"</td>";
    isFirst=false;
  }
  energyHTML += "</tr>"
  board.getElementsByTagName("energy-track")[0].removeAttribute("values");
  return energyHTML;
    
}

function parseCardPlayTrackTags(){    
    
	const board = document.querySelectorAll('board')[0];
    var cardPlayValues = board.getElementsByTagName("card-play-track")[0].getAttribute("values");
    var cardPlayOptions = cardPlayValues.split(",");
    var cardPlayBanner = board.getElementsByTagName("card-play-track")[0].getAttribute("banner");
    var cardPlayBannerScale = board.getElementsByTagName("card-play-track")[0].getAttribute("banner-v-scale");
    if(!cardPlayBannerScale){
        cardPlayBannerScale = "100"
    }
	if(cardPlayBannerScale.at(-1)!='%'){
		console.log('banner reported in px')
		cardPlayBannerScale=cardPlayBannerScale+'px';
	}
    var energyHTML = "";
    var cardPlayHTML = "";
    
    //Determine the length of the energy track
    //If for some reason the width of a presence track spot changes, this needs to be updated. Ideas for automating?
    let cardPlayLength = cardPlayOptions.length * 130 + 15;
    if(cardPlayBanner){
        cardPlayHTML = "<tr class='plays-track' style='background-image:  url("+cardPlayBanner+"); background-size: "+cardPlayLength+"px "+cardPlayBannerScale+"; background-repeat: no-repeat; background-position: left 0px top 20px;'>"
    } else {
        cardPlayHTML = "<tr class='plays-track'>";
    }
    
    // This can be scaled to move the first presence icon.
    cardPlayHTML += "<td style='width:10px'></td>"

    for(i = 0; i < cardPlayOptions.length; i++){
        cardPlayHTML += "<td>"+getPresenceNodeHtml(cardPlayOptions[i], i == 0, "card", false)+"</td>";
    }
    cardPlayHTML += "</tr>"    
    board.getElementsByTagName("card-play-track")[0].removeAttribute("values");
    return cardPlayHTML;    
}

function enhancePresenceTracksTable() {
  console.log("BUILDING PRESENCE TRACK PANEL")
  console.log("This method of creating middle node is no longer supported. Your results may very. Use middle() instead.")
  const board = document.querySelectorAll('board')[0];
  var elmt = board.getElementsByTagName("presence-tracks")[0];
  var title = document.createElement("section-title");
  title.innerHTML = "Presence";    
  elmt.insertBefore(title, elmt.firstChild); 
  console.log('creating dynamic presence tracks...')
  var table = document.getElementById("presence-table");
  table.innerHTML = table.innerHTML.replaceAll('middle=""','rowspan="2" class="middle"')

  for (var i = 0, row; row = table.rows[i]; i++) {
     for (var j = 0, cell; cell = row.cells[j]; j++) {
      cell.innerHTML = getPresenceNodeHtml(cell.firstChild.nodeValue, j == 0, 'dynamic', i == 0);
     }  
  }

  // Add spacing row to the front of the table
  var firstRow = table.getElementsByTagName("tr")[0];
  var firstCell = firstRow.getElementsByTagName("td")[0];
  var spacerRow = document.createElement("td");
  spacerRow.style.width = "10px";
  spacerRow.rowSpan = "2";
  firstRow.insertBefore(spacerRow,firstCell);
  
/*   // Detect presence note
  presenceNote = table.getAttribute("note");
  if(presenceNote){
    var note = document.createElement("presence-note");
    note.innerHTML = presenceNote;
    title.after(note)
    title.classList.add('has-note')
  } */
}

function getPresenceNodeHtml(nodeText, first, trackType, addEnergyRing) {
  var result = '';
  //Find values between parenthesis
  var regExp = /\(([^)]+)\)/;    
  var pnDebug = false;
  var nodeClass = '';
  
  // Every node will have a presence-node element with
  // a ring-icon element inside, so we can add these now.
  presenceNode = document.createElement("presence-node");    
  ring = document.createElement("ring-icon");
  presenceNode.appendChild(ring);
  // Will be populated with the sub text that will be added at the end
  var subText = '';
  // Will be populated with the raw HTML that will go inside the ring-icon element.
  var inner = "";
  if(pnDebug){console.log('Node Text:'+nodeText+', is first?:'+first)}
  //Allows adding an icon top-left of the node using ^ (as with Stone)
  let addDeepLayers = false;
  if(nodeText.split("^")[1]){
    iconDeepLayers = nodeText.split("^")[1]
    addDeepLayers = true;
    nodeText = nodeText.split("^")[0]
  }

  if(trackType == 'dynamic'){
    if(nodeText.startsWith("energy")) {
      nodeText = nodeText.substr(6);
      nodeClass = 'energy';
      subText = 'Energy/Turn';
    }else if(nodeText.startsWith("+energy")){
      nodeText = nodeText.replace('+energy','+');
      nodeClass = 'energy';
      subText = 'Energy/Turn';
    }else if(nodeText.startsWith("card")) {
      nodeText = nodeText.substr(4);
      nodeClass = 'card';
      subText = 'Card Plays';
    }
  }else if(trackType == 'energy'){
    nodeClass = 'energy';
    subText = 'Energy/Turn';
  }else if(trackType == 'card'){
    nodeClass = 'card';
    subText = 'Card Plays';
  }else if(trackType == 'special'){
    nodeClass = 'special-ring';
    subText = '';
    addEnergyRing = false;
  }

  addIconShadow = false;
  if(!isNaN(nodeText)){
    //The value is only a number
    addEnergyRing = false;
    if(first === true && trackType != 'special'){
      presenceNode.classList.add("first");
    } else {
      subText = nodeText;
      if(isNaN(nodeText[0])){
        subText += " Energy";
        nodeClass = 'energy';
      }
    }
    inner = "<" + nodeClass + "-icon><value>" + nodeText + "</value></" + nodeClass + "-icon>";
  } else {
    //It is either a single element or a mix of elements/numbers/other options
    
    if(first === true && trackType != 'special'){
      presenceNode.classList.add("first");
    }
    
    var splitOptions = nodeText.split("+");
  
    //This code allows user to include +energy in addition to just energy
    plus_check = splitOptions.indexOf("");
    if(plus_check!=-1){
      splitOptions.splice(plus_check,1)
      splitOptions[plus_check]="+"+splitOptions[plus_check]
      nodeClass = 'energy';
    }
		
    if(splitOptions.length == 1){
      //It's just a single item
      var option = splitOptions[0].split("(")[0];
      switch(option){
        case 'push':
          var matches = regExp.exec(splitOptions[0]);
          var moveTarget = matches[1];
          let moveIcons = "<div class='push'>"
          let moveText = "";
          for (var i = 0; i < moveTarget.split(";").length; i++) {
            moveIcons += "{"+moveTarget.split(";")[i]+"}"
            moveText += Capitalise(moveTarget.split(";")[i]);
            if (i < moveTarget.split(";").length-1){
              moveIcons += "{backslash}";
              moveText += "/";
              
            }
          }
          moveIcons +="</div>"
          let preposition = option =='push' ? 'from' : 'into';
          inner = "<icon class='push'>"+moveIcons+"</icon>";
          subText = Capitalise(option)+" 1 "+ moveText + " "+preposition+" 1 of your Lands";
          break;    
        case 'gather':
          var matches = regExp.exec(splitOptions[0]);
          var moveTarget = matches[1];
          inner = "<icon class='gather'><icon class='"+moveTarget+"'></icon></icon>";
          subText = "Gather 1 "+Capitalise(moveTarget) + " into 1 of your Lands";
          break;
        case 'energy':
          var matches = regExp.exec(splitOptions[0]);
          var num = matches[1];
          inner = inner = "<energy-icon><value>" + num + "</value></energy-icon>";;
          subText = num;
          addEnergyRing = true;
          addIconShadow = false;
          break;
        case 'plays':
          var matches = regExp.exec(splitOptions[0]);
          var num = matches[1];
          inner = inner = "<card-icon><value>" + num + "</value></card-icon>";;
          subText = num;
          addEnergyRing = false;
          addIconShadow = false;
          break;
        case 'incarna':
          var matches = regExp.exec(splitOptions[0]);
          var incarnaAction = matches[1];
          switch (incarnaAction){
            case 'empower':
              subText = "Empower Incarna";
              inner = "{empower-incarna}";
            break;
            default:
              subText = "Empower Incarna";
              inner = "{empower-incarna}";
          }
          break;
        case 'token':
          var matches = regExp.exec(splitOptions[0]);
          var tokenAdd = matches[1];
          inner = "<icon class='your-land'>{misc-plus}<icon class='"+tokenAdd+"'></icon></icon>";
          subText = "Add 1 "+Capitalise(tokenAdd) + " to 1 of your Lands";
          break;
        case 'custom':
          if(pnDebug){console.log('Custom Node w/ Single Icon:'+splitOptions[0])};
          var matches = regExp.exec(splitOptions[0]);
          var custom_node = matches[1].split(";");
          var custom_text = custom_node[0];
          addEnergyRing = false;
          addIconShadow = true;
          if(custom_node[1]){
            if(custom_node[1].split('{')[1]){
              // User is using icon shorthand
              inner = "<custom-presence-track-icon>"+custom_node[1]+"</custom-presence-track-icon>"
            }else{
              // User is not using icon shorthand (only 1 icon allowed)
              inner = "<icon class='"+custom_node[1]+" custom-presence-track-icon'></icon>";
            }
          }else{
            inner = "<" + nodeClass + "-icon><value>!!!</value></" + nodeClass + "-icon>";
            addEnergyRing = false;
          }
          subText = custom_text
          break;
        case 'move-presence':
          var matches = regExp.exec(splitOptions[0]);
          var moveRange = matches[1];
          inner = "<icon class='move-presence-"+moveRange+"'></icon>";
          subText = "Move a Presence "+moveRange;
          addIconShadow = true;
          if(addEnergyRing){addIconShadow = false};
          break;
        case 'elements':
          var matches = regExp.exec(splitOptions[0]);
          var elementList = matches[1].split(";");
          let elementIcons = "";
          let elementText = "";
          if(elementList.length==2){
            elementIcons += "<icon class='"+elementList[0]+" presence-or-first'></icon>";
            elementIcons += "{backslash}";
            elementIcons += "<icon class='"+elementList[1]+" presence-or-second'></icon>";
            elementText += Capitalise(elementList[0]);
            elementText += " OR ";
            elementText += Capitalise(elementList[1]);
            inner = "<element-or-wrap>"+elementIcons+"</element-or-wrap>";
            subText = elementText + " (choose each turn)";
          }else{
            var iconText = matches[1];
            inner = "<icon class='"+iconText+"'></icon>";
            subText = IconName(iconText);
          }
          break;
        case 'gain-range':
          var matches = regExp.exec(splitOptions[0]);
          var gainRange = matches[1];
          var custom_node = matches[1].split(";");
          inner = "<icon class='gain-range-"+custom_node[0]+"'></icon>";
          subText = IconName(splitOptions[0]);
          addEnergyRing = false;
          addIconShadow = true;
          break;
        case 'gain-card-play':
          var matches = regExp.exec(splitOptions[0]);
          cardplay_text = splitOptions[0]
          if(matches){
            var cardplay_text = matches[1].split(";");
            inner = "<icon class='"+option+" deep-layers'><icon class='"+cardplay_text+"'></icon></icon>";
          }else{
            inner = "<icon class='"+cardplay_text+"'></icon>";
          }
          subText = "+1 Card Play/Turn"
          break;
        default:
          var iconText = splitOptions[0];
          inner = "<icon class='"+iconText+"'></icon>";
          subText = IconName(iconText);
          break;                
      }            
    } else {
      var subText = ""

      // Find unique names and report multiples
      const nameCounts = {};
      splitOptions.forEach(function (x) { nameCounts[x] = (nameCounts[x] || 0) + 1; });
      let namesList = Object.keys(nameCounts);
      let countList = Object.values(nameCounts);
      for (var i = 0; i < namesList.length; i++) {
        subText += IconName(namesList[i],countList[i]);
        if(i < namesList.length-1){
          subText += ", "
        }
      }
        
      numLocs = splitOptions.length;
      let rad_size = 22 + 1*numLocs; // this expands slightly as more icons are used
      var trackIcons = ""
      for (var i = 0; i < numLocs; i++) {
        pos_angle = i * 2*Math.PI / numLocs - (Math.PI)*(1-(1/6));
        x_loc = rad_size * Math.cos(pos_angle) - 31;
        y_loc = rad_size * Math.sin(pos_angle) - 25;
        let track_icon_loc = "style='transform: translateY("+y_loc+"px) translateX("+x_loc+"px)'";
        if(pnDebug){console.log('Multinode: '+splitOptions[i])}
        // deal with cards and energy
        if(!isNaN(splitOptions[i])){
            trackIcons += "<icon-multi-element><" + nodeClass + "-icon class='small'"+track_icon_loc+"><value>" + splitOptions[i] + "</value></" + nodeClass + "-icon></icon-multi-element>";
            if(nodeClass == 'energy') { 
                addEnergyRing = false;
            }
        } else if(splitOptions[i].startsWith("reclaim")){
          trackIcons += "<icon-multi-element><icon class='"+splitOptions[i]+" small-reclaim'"+track_icon_loc+"></icon></icon-multi-element>"
        } else if(splitOptions[i].startsWith("energy")){
          var matches = regExp.exec(splitOptions[i]);
          var num = matches[1];
          trackIcons += "<icon-multi-element><energy-icon class='small'"+track_icon_loc+"><value>" + num + "</value></energy-icon></icon-multi-element>"
          addEnergyRing = false;
        } else if(splitOptions[i].startsWith("plays")){
          var matches = regExp.exec(splitOptions[i]);
          var num = matches[1];
          addEnergyRing = false;
          trackIcons += "<icon-multi-element><card-icon class='small'"+track_icon_loc+"><value>" + num + "</value></card-icon></icon-multi-element>"
        } else if(splitOptions[i].startsWith("gain-card-play")){
          trackIcons += "<icon-multi-element><icon class='"+splitOptions[i]+" small'"+track_icon_loc+"></icon></icon-multi-element>"
        } else if(splitOptions[i].startsWith("move-presence")){
          var matches = regExp.exec(splitOptions[i]);
          var moveRange = matches[1];
          trackIcons += "<icon-multi-element><icon-shadow class = 'small'"+track_icon_loc+"><icon class='move-presence-"+moveRange+" small'></icon></icon-shadow></icon-multi-element>"
          addEnergyRing = false;
          addIconShadow = false;
        } else if(splitOptions[i].startsWith("gain-range")){
          var matches = regExp.exec(splitOptions[i]);
          var gainRange = matches[1];
          gainRange = gainRange.split(";")[0];
          trackIcons += "<icon-multi-element><icon-shadow class = 'small'"+track_icon_loc+"><icon class='gain-range-"+gainRange+" small'></icon></icon-shadow></icon-multi-element>"
          addEnergyRing = false;
          addIconShadow = false;
        } else if(splitOptions[i].startsWith("custom")){
          var matches = regExp.exec(splitOptions[i]);
          var custom = matches[1].split(";")[1];
          if(pnDebug){console.log('Multinode custom: '+custom)}
          trackIcons += "<icon-multi-element><icon class='"+custom+" small'"+track_icon_loc+"></icon></icon-multi-element>"
         } else if(splitOptions[i].startsWith("elements")){
          var matches = regExp.exec(splitOptions[i]);
          var elementList = matches[1].split(";");
          let elementIcons = "";
          let elementText = "";
          if(elementList.length==2){
            elementIcons += "<icon-multi-element><element-or-wrap class='small'"+track_icon_loc+"><icon class='"+elementList[0]+" presence-or-first small'></icon>";
            elementIcons += "<icon class='backslash small'></icon>";
            elementIcons += "<icon class='"+elementList[1]+" presence-or-second small'></icon></element-or-wrap></icon-multi-element>";
            elementText += Capitalise(elementList[0]);
            elementText += " OR ";
            elementText += Capitalise(elementList[1]);
          }
          trackIcons += elementIcons
        } else {
          trackIcons += "<icon-multi-element><icon class='"+splitOptions[i]+"'"+track_icon_loc+"></icon></icon-multi-element>"
        }
      }
      var inner = trackIcons;
    }
  }

  if(addEnergyRing){ inner = "<energy-icon>"+inner+"</energy-icon>"; }
  if(addIconShadow){ inner = "<icon-shadow>"+inner+"</icon-shadow>"; }
  ring.innerHTML = inner;
  presenceNode.innerHTML += "<subtext>" + subText + "</subtext>";
  if(addDeepLayers){
    valueText = ""
    if(iconDeepLayers.startsWith("energy")){
      var matches = regExp.exec(iconDeepLayers);
      var valueNum = matches[1];
      valueText = "<value>" + valueNum + "</value>"
      iconDeepLayers = 'energy-blank';
    }
    presenceNode.innerHTML = "<icon class='"+iconDeepLayers+" "+nodeClass+"-deep-layers'>"+valueText+"</icon>" + presenceNode.innerHTML; 
  }
  return presenceNode.outerHTML;
}

function IconName(str, iconNum = 1){
  var regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(str);
  num = ""
  txt = ""
  if(matches){
    options = matches[1].split(";");
    num = options[0];
    txt = options[1];
  }
  str = str.split("(")[0];
  if(!isNaN(str) && isNaN(str[0])){
    num = str[1];
    str = "increase-energy";
  }
  let plural = iconNum > 1 ? 's' : '';
  switch(str){

    case 'presence':
      subText = "Your Presence"
      break;
    case 'energy':
      subText = iconNum+" Energy"
      break;
    case 'plays':
      subText = iconNum+" Card Play"+plural;
      break;
    case 'elements':
      subText = Capitalise(num)+' OR '+Capitalise(txt)
      break;
    case 'gain-power-card':
      subText = "Gain Power Card"
      break;
    case 'gain-card-play':
      subText = "Gain a Card Play"
      break;
    case 'reclaim-all':
      subText = "Reclaim Cards"
      break;
    case 'reclaim-one':
      subText = "Reclaim One";
      break;
    case 'reclaim':
      subText = "Reclaim Cards";
      break;
    case 'reclaim-half':
      subText = "Reclaim Half <em>(round up)</em>";
      break;
    case 'forget-power-card':
      subText = "Forget Power Card";
      break;    
    case 'discard-cards':
      subText = "Discard 2 Power Cards"
      break;
    case 'discard-2-cards':
      subText = "Discard 2 Power Cards"
      break;
    case 'discard-card':
      subText = "Discard 1 Power Card"
      break;
    case 'discard-1-card':
      subText = "Discard 1 Power Card"
      break;
    case 'gain-1-time':
      subText = "Gain 1 Time"
      break;
    case 'gain-2-time':
      subText = "Gain 2 Time"
      break;
    case 'days-never-were':
      subText = "Gain Power Card from Days That Never Were"
      break;
    case 'destroy-presence':
      subText = "Destroy 1 of your Presence"
      break;
    case 'destroyed-presence':
      subText = "Destroyed Presence"
      if(iconNum>1){
        subText = "up to "+iconNum+" Destroyed Presence"
      }
      break;
    case 'make-fast':  
      subText = "One of your Powers may be Fast"
      break;
    case 'forget-power-card':
      subText = "Forget Power";
      break;    
    case 'gain-card-pay-2':
      subText = "Pay 2 Energy to Gain a Power Card";
      break;
    case 'ignore-range':
      subText = "You may ignore Range this turn"
      break;
    case 'star':
      subText = "Element"
      break;
    case 'markerplus':
      subText = "Prepare "+iconNum+" Element Marker"+plural;
      break;
    case 'markerminus':
      subText = "Discard "+iconNum+" Element Marker"+plural;
      break;
    case 'isolate':
      subText = "Isolate "+iconNum+" of your Lands";
      break;
    case 'reclaim-none':
      subText = "Reclaim None"
      break;
    case 'increase-energy':
      subText = "+"+num+" Energy"
      break;
    case 'move-presence':
      subText = "Move Presence " + num[0];
      break;
    case 'star':
      subText = "Element";
      break;
    case 'damage-1':
      subText = "Deal 1 Damage in one of your Lands";
      break;
    case 'damage-2':
      subText = "Deal 2 Damage in one of your Lands";
      break;
    case 'custom':
      subText = num;
      break;
    case 'gain-range':
      subText = "+" + num[0]+ " Range";
      if (typeof(txt)!="undefined") {
        subText += " on " + txt;
        }
      break;
    case 'inland':
    case 'coastal':
    case 'invaders':
      subText = str.toUpperCase();
      break;
    default:
      subText = iconNum > 1 ? iconNum + " " + Capitalise(str) : Capitalise(str);
  }

  return subText

}

function Capitalise(str, plural=0){
  str=str.trim()
  hyphenCheck = str.split("-");
  const terrains = new Set(['wetland', 'mountain', 'sand', 'sands', 'jungle'])
  let return_str = hyphenCheck[0].charAt(0).toUpperCase() + hyphenCheck[0].slice(1);
  if(plural){return_str += makePlural(hyphenCheck[0])}
  for (var i = 1; i < hyphenCheck.length; i++) {
    if (terrains.has(hyphenCheck[i])){
      return_str += ' or ';
    }else{
      return_str += ' ';
    }		
    return_str += hyphenCheck[i].charAt(0).toUpperCase() + hyphenCheck[i].slice(1);
    if(plural){return_str += makePlural(hyphenCheck[i])}
  }		

  return return_str;
}

function makePlural(str){
  if(str.charAt(-1).toUpperCase() != "S"){
      return "s";
  }
  return "";
}

function setNewEnergyCardPlayTracks(energyHTML, cardPlayHTML){
	console.log("BUILDING PRESENCE TRACK PANEL")
	const board = document.querySelectorAll('board')[0];
  var presenceTable = board.getElementsByTagName("presence-tracks")[0]
  presenceTable.innerHTML = "<presence-title><section-title>Presence</section-title></presence-title>" + "<table id='presence-table'>"+energyHTML + cardPlayHTML+"</table>";
  presenceNote = presenceTable.getAttribute("note");
  presenceTable.removeAttribute("note");
  if(presenceNote){
    var note = document.createElement("presence-note");
    var title = presenceTable.querySelectorAll('section-title')[0];
    title.classList.add('has-note')
    note.innerHTML = presenceNote;
    title.after(note)
  }
  //should add some kind of first check here
  
  //detect & correct first circles when using middle
  energyTrack = presenceTable.getElementsByClassName('energy-track')[0];
  energyNodes = energyTrack.getElementsByTagName('td');
  playsTrack = presenceTable.getElementsByClassName('plays-track')[0];
  playsNodes = playsTrack.getElementsByTagName('td');
  if(energyNodes[1].classList.contains('middle')){
    if(energyNodes[2].classList.contains('middle')){
      playsNodes[1].getElementsByTagName('presence-node')[0].classList.remove('first');
    }
  }
}

function dynamicCellWidth() {

  var debug = true;
	const board = document.querySelectorAll('board')[0];


	console.log("RESIZING: Growth")	
	// Growth Sizing
  growthCells =  board.getElementsByTagName("growth-cell");
  growthCellCount = growthCells.length;
  growthBorders = Array.from(board.getElementsByTagName("growth-border"));
  growthBorderCount = growthBorders.length;
  let growthTable = board.getElementsByTagName("growth-table")[0];
  

  
  
  // Add additional Growth Row if necessary
  let totalWidth = getGrowthTableWidth(growthTable);
  let growthTexts = board.getElementsByTagName("growth-text");
  let tallGrowthText = hasTallGrowthText(growthTexts)
  if(debug){console.log('Tall growth text found? (4 or more lines) '+tallGrowthText)}
  
  function hasTallGrowthText(texts){
    hasTall = false;
    for(i = 0; i < texts.length; i++){
      hasTall = texts[i].offsetHeight > 90 ? true : hasTall;
      // true if any growth-text is more than 3 lines
    } 
    return hasTall;
  }
  
  if(totalWidth > 1090 || tallGrowthText){
    growthGroups = growthTable.getElementsByTagName("growth-group");
    growthBorders = growthTable.getElementsByTagName("growth-border");
    var newGrowthTable = document.createElement("growth-table");
    var growthLine = document.createElement("growth-row-line");    
    var c = 0;
    while(totalWidth > 1090 || tallGrowthText){
      if(c==0){
        newGrowthTable.appendChild(growthGroups[growthGroups.length-1])
      }else{
        var growthBorder = document.createElement("growth-border");
        newGrowthTable.insertBefore(growthBorder, newGrowthTable.firstChild);
        newGrowthTable.insertBefore(growthGroups[growthGroups.length-1], newGrowthTable.firstChild);
      }
      growthBorders[growthBorders.length-1].remove();
      totalWidth = getGrowthTableWidth(growthTable);
      tallGrowthText = hasTallGrowthText(growthTable.getElementsByTagName("growth-text"))
      c++;
    }
    document.getElementsByTagName("growth")[0].append(growthLine)
    document.getElementsByTagName("growth")[0].append(newGrowthTable)
  }
  
  
  // TEST iterate through growth cells
  var totalIconWidths = 0
  var cellWidthV2 = []
  for (const cell of growthCells) {
    var cellRect = findBoundingRect(cell)
    // console.log('-- TEST --')
    // console.log(cellRect)
    // console.log(cell)
    // console.log(cellRect.width)
    // console.log('^--RESULT--^')
    totalIconWidths+=cellRect.width
    cellWidthV2.push(cellRect.width)
  }
  console.log('total icon width = '+totalIconWidths)
  // console.log('old way = '+totalWidth)
  // console.log(cellWidthV2)
  
  //Iterate through growth table(s) to resize
  const largeCellScale = 1.5;
  const extraLargeCellScale = 1.8;
  const growthTables = board.getElementsByTagName("growth-table");
  
  let tightFlag = false; // flag for tightening presence tracks later
  for (i = 0; i < growthTables.length; i++){
    growthTable = growthTables[i];
    if(growthTables.length>1){
      growthTable.style.marginTop = '10px';
      tightFlag = true;
      console.log('will tighten presence tracks')
    }
    const growthCells = board.getElementsByTagName("growth-table")[i].getElementsByTagName("growth-cell");
    const growthTableStyle = window.getComputedStyle(growthTable);
    const growthTableWidth = growthTableStyle.getPropertyValue('width');
    let widthArray = [];
    
    var localBorders = growthTable.getElementsByTagName("growth-border")
    let localBorderPixels = 0;
    for (j = 0; j < localBorders.length; j++) {
      localBorderPixels += localBorders[j].offsetWidth;
    }
    growthPanelWidth = 1090-10-localBorderPixels;
    console.log('width for growth actions = '+growthPanelWidth)
    totalWidth = 0;
    for (j = 0; j < growthCells.length; j++){
      totalWidth += growthCells[j].offsetWidth;
      widthArray[j] = growthCells[j].offsetWidth;
    }

    averageWidth = totalWidth/growthCells.length;
    console.log('aveage width = '+averageWidth)
    if (totalWidth > 1000 || i==0){
      let smallCellFinder = widthArray.map(x => x <= averageWidth*1.35)
      let largeCellFinder = widthArray.map(x => x > averageWidth*1.35)
      let extraLargeCellFinder = widthArray.map(x => x > averageWidth*2)
      largeCellFinder = largeCellFinder.map((x,index) => x&&!extraLargeCellFinder[index])
      const largeCell = largeCellFinder.filter(Boolean).length
      const smallCell = smallCellFinder.filter(Boolean).length
      const extraLargeCell = extraLargeCellFinder.filter(Boolean).length
      weightedSmallCellWidth = ( growthPanelWidth / (smallCell + largeCellScale*largeCell+extraLargeCellScale*extraLargeCell))
      weightedLargeCellWidth = weightedSmallCellWidth*largeCellScale;
      weightedExtraLargeCellWidth = weightedSmallCellWidth*extraLargeCellScale;
      for (j = 0; j < growthCells.length; j++){
        if(extraLargeCellFinder[j]){
          growthCells[j].style.width = weightedExtraLargeCellWidth+"px"
        }else if(largeCellFinder[j]){
          growthCells[j].style.width = weightedLargeCellWidth+"px"
        }else{
          growthCells[j].style.width = weightedSmallCellWidth+"px"
        }
        
      }
    } else if(i>0) {
      growthTable.style.maxWidth = (growthCells.length *averageWidth)+"px"
      growthTable.style.justifyContent = 'flex-start'
      for (j = 0; j < growthCells.length; j++){
        growthCells[j].style.maxWidth = (averageWidth)+"px"
        growthCells[j].style.minWidth = "100px"
      }
    }
    
    totalWidth = 0;
    for (j = 0; j < growthCells.length; j++){
      totalWidth += growthCells[j].offsetWidth;
    }
    if(i>0){
      growthLines = board.getElementsByTagName("growth-row-line");
      growthLines[i-1].style.width = totalWidth+"px";
    }
  }
  
  // Create Headers (if using Subsets)
  growthTable = board.getElementsByTagName("growth-table")[0];
  const headerWidth = {}
  const headerAdditionalWidth = {}
  let maxIndex = undefined
  if(debug){console.log('Checking growth for headers')}
  for (const c of growthTable.children) {
    if(debug){console.log(c)}
    const header = parseInt(c.getAttribute('header'))
    if (!isNaN( header )) {
      maxIndex = header
      const addWidth = parseFloat(window.getComputedStyle(c).getPropertyValue('margin-right').replace(/px/, ""))
          + parseFloat(window.getComputedStyle(c).getPropertyValue('margin-left').replace(/px/, ""))
          + parseFloat(window.getComputedStyle(c).getPropertyValue('width').replace(/px/, ""))

      if (headerWidth[header]) {
          headerWidth[header] += addWidth
      } else {
          headerWidth[header] = addWidth
      }
    } else if (maxIndex != undefined) {
      console.log('maxIndex is defined')
      const addWidth = parseFloat(window.getComputedStyle(c).getPropertyValue('margin-right').replace(/px/, ""))
          + parseFloat(window.getComputedStyle(c).getPropertyValue('margin-left').replace(/px/, ""))
          + parseFloat(window.getComputedStyle(c).getPropertyValue('width').replace(/px/, ""))
      if (headerAdditionalWidth[maxIndex]) {
          headerAdditionalWidth[maxIndex] += addWidth
      } else {
          headerAdditionalWidth[maxIndex] = addWidth
      }
    } else {
      if(debug){console.log('No header')}
    }
  }

  const subGrowthTitle = board.getElementsByTagName('sub-section-title')
  if(board.getElementsByTagName("growth-table").length>1 && subGrowthTitle.length){console.log('Warning: growth sets does not work correctly when a second growth row is used')}
  let position = 0
  for (let i = 0; i < subGrowthTitle.length; i++) {
      subGrowthTitle[i].style.left = `${position}px`
      subGrowthTitle[i].style.width = `${headerWidth[i]}px`
      position += headerWidth[i] + headerAdditionalWidth[i]
  }

  // Create special titles
  var growthTableTitles = board.getElementsByTagName("growth-table");
  var specialTitleFlag = false;
  for(const table of growthTableTitles){
    var growthGroupsTitles = table.getElementsByTagName("growth-group");
    for(const group of growthGroupsTitles){
      var specialTitle = group.getAttribute('special-title');
      if(specialTitle){
        specialTitleFlag = true;
        var growthActionsTitles = group.getElementsByTagName("growth-cell")
        var growthGroupWidth = 0;
        for(const action of growthActionsTitles){
          console.log(action.style.width)
          growthGroupWidth += parseFloat(action.style.width.replace(/px/, ""));
        }
        growthGroupWidth = Math.ceil(growthGroupWidth)
        group.style.width = growthGroupWidth+"px";
        specialSectionTitle = document.createElement("special-section-title");
        specialSectionTitle.innerHTML=specialTitle;
        group.appendChild(specialSectionTitle);
        //find the parent, add a class that creates space.
        table.classList.add("has-special-title")
      }
    }
  }


  // Final resize (catches really big things that were missed)
  let growthItems = board.getElementsByTagName("growth-cell");
  for(i = 0; i < growthItems.length; i++){
    if(checkOverflowWidth(growthItems[i])){
      var children = growthItems[i].children;
      if(debug){
        console.log('scroll width is larger for')
        console.log(growthItems[i])
        console.log(children)
      }
			var childrenWidth = 0;
			for (var j = 0; j < children.length; j++) {
				childrenWidth = Math.max(children[j].offsetWidth,childrenWidth)
			}
			growthItems[i].style.width =childrenWidth+"px"
		}
    }

	// Balance Growth Text
	maxGrowthTextHeight = newGrowthTable!==undefined ? 50 : 100;
	for(i = 0; i < growthTexts.length; i++){
		if(growthTexts[i].offsetHeight<50){
			balanceText(growthTexts[i]);
			if(debug){console.log('Balancing growth text "'+growthTexts[i].textContent+'" to '+growthTexts[i].style.width+' width.')};
		}else if(growthTexts[i].offsetHeight>maxGrowthTextHeight){
			reduceLines(growthTexts[i]);
      if(debug){console.log('Reducing growth text lines for '+growthTexts[i].textContent)};
		}
  }
	
  // Handle Tint (corners)
  let growthGroupsTint = board.getElementsByTagName("growth-group");
  if(growthGroupsTint){
    for(let group of growthGroupsTint){
      let growthTints = group.getElementsByClassName("tint");
      if(growthTints.length==1){
        console.log('found solo tint')
        growthTints[0].classList.add("solo-tint");
      }else if(growthTints.length){
        growthTints[0].classList.add("start-tint");
        growthTints[growthTints.length-1].classList.add("end-tint");
      }
    }
  }  
  
	// Innate Power Sizing
	console.log("RESIZING: Innate Powers")
	// Innate Power Notes (scale font size)
	noteBlocks = board.getElementsByTagName("note");
	for(let i = 0; i < noteBlocks.length; i++){
		let noteHeight = noteBlocks[i].offsetHeight;
		let j = 0
		while (noteHeight>92){
			var style = window.getComputedStyle(noteBlocks[i], null).getPropertyValue('font-size');
			var fontSize = parseFloat(style); 
			noteBlocks[i].style.fontSize = (fontSize - 1) + 'px';
			noteHeight = noteBlocks[i].offsetHeight
			
			// safety valve
			j += 1
			if (j>5){ break;}
		}
	}
	
	// Innate Power Thresholds
  thresholds = board.getElementsByTagName("threshold");
  thresholdsCount = thresholds.length;
  ICONWIDTH = 60;
	let dynamicThresholdWidth = []
	let outerThresholdWidth = []
  for (i = 0; i < thresholdsCount; i++){
    icon = thresholds[i].getElementsByTagName("icon");
    iconCount = icon.length;
    dynamicThresholdWidth = (iconCount * ICONWIDTH) + (iconCount * 12);
    // Check if the threshold width is overflowing. If so, just let it size itself...
    var thresholdHeight = thresholds[i].offsetHeight
    if (thresholdHeight > 60){
      thresholds[i].style.width = "auto";
    }
    outerThresholdWidth[i] = thresholds[i].clientWidth + parseFloat(window.getComputedStyle(thresholds[i]).getPropertyValue('margin-right').replace(/px/, ""));
  }
	
	// Innate Power Descriptions
  var description = board.getElementsByClassName("description");
  for(i = 0; i < description.length; i++){
      // Scale the text width to the threshold size...
  description[i].style.paddingLeft = outerThresholdWidth[i]+"px";
  var textHeight = description[i].clientHeight;
    console.log(description[i])
    console.log('text height = ' +textHeight)
    console.log('text width = ' +description[i].offsetWidth)
      if (textHeight < 40){
          description[i].id = "single-line";
    // Align-middle the text if its a single line
  }else if (textHeight > 75){
    description[i].style.paddingLeft = "0px";
    // Spill over below the threshold if its greater than three lines
      }
  }

  console.log("RESIZING: Presence Tracks")
  // Presence node subtext (for longer descriptions, allows flowing over into neighbors.
  var presenceTrack = board.getElementsByTagName("presence-tracks")[0];
  var energyTrack = board.getElementsByClassName("energy-track")[0];
  var playsTrack = board.getElementsByClassName("plays-track")[0];
  var currentTrack
  debug = false;
  let adjustment_flag = 0
  let default_row_height = 48*(3/4)
  if(tightFlag){
    default_row_height = 0;
    console.log('tightening presence tracks');
    board.getElementsByTagName("presence-title")[0].style.marginBottom = '0px';
  }
  let row_max_height = default_row_height;
  let first_row_max = 0;
  let height_adjust = 0;
  for(j=0;j<2;j++){
    if(j==0){
      currentTrack = energyTrack
      if(debug){console.log('energy track')}
    }else{
      currentTrack = playsTrack
      if(debug){console.log('plays track')}
    }
    var subtext = currentTrack.getElementsByTagName("subtext");
    var presence_nodes = currentTrack.getElementsByTagName("presence-node");
    var track_tds = currentTrack.getElementsByTagName("td");
    if(debug){console.log(presence_nodes[0].classList)}
    if(debug){console.log(track_tds)}
    
    for(i = 0; i < subtext.length; i++){
      // Only read/apply to non-middle nodes
      var textHeight = subtext[i].offsetHeight;
      if(track_tds[1].classList.contains('middle')){
        textHeight = 0;
        adjustment_flag = 0;
      //This solution is really jank, but it works for now
      }else if (textHeight > 55){
        if(!adjustment_flag){
          subtext[i].className = "adjust-subtext";
          textHeight = subtext[i].offsetHeight;
          adjustment_flag = 1
          console.log('adjusting node: '+subtext[i].innerHTML)
        }else{
          console.log('rejected text adjstment for: '+subtext[i].innerHTML+' :Reason: neighbor already adjusted: ')
          adjustment_flag = 0
        }
      }else{
        adjustment_flag = 0
      }
      row_max_height = textHeight > row_max_height ? textHeight : row_max_height;
    }
    
    // Prepare for second row
    height_adjust += row_max_height;
    if(j==0){first_row_max = row_max_height};
    row_max_height=default_row_height;
    
    // Find first non-middle and set subtext height
    if(presence_nodes[0].classList.contains('first')&&track_tds[1].classList.contains('middle')){
      subtext[1].style.height = first_row_max+2+"px"
      if(debug){console.log('found middle & first node')}
    }else{
      subtext[0].style.height = first_row_max+2+"px"
    }
  }
  var presence_table = document.getElementById("presence-table");
  presence_table.style.height = (presence_table.offsetHeight + height_adjust)+"px";
    
  // Place middle presence nodes
  var firstRow = energyTrack
  var firstRowHeight = firstRow.offsetHeight;
  if(debug){console.log('first row height: '+firstRowHeight)}
  var middleNodes = presenceTrack.getElementsByClassName("middle");
  for(i = 0; i < middleNodes.length; i++){
    let presenceNode = middleNodes[i].getElementsByTagName("presence-node")
    presenceNode[0].style.top = (firstRowHeight/2)+"px";
  }

  
  
	console.log('RESIZING: INNATE NOTES (IF NEEDED)')
	// Size Innate Power box
	growth = board.getElementsByTagName("growth")[0];
	presenceTracks = board.getElementsByTagName("presence-tracks")[0];
	right = board.getElementsByTagName("right")[0];
	innatePowers = board.getElementsByTagName("innate-power");
	
	// Shrink Innate Power notes if needed for space
	var innatePowerBox = board.getElementsByTagName("innate-powers")[0];
  var moveFlag = false;
  innatePowerBox.style.height = (right.clientHeight - presenceTracks.clientHeight - growth.clientHeight) + "px";
	let k = 0;
	if(checkOverflowHeight(innatePowerBox)){
    console.log('Innate Powers overflowing, shrinking notes (if applicable)...')
    
    // First, check if its just one IP, and if so, move it to the side (see Ember-Eyed)
    if(innatePowers.length==1 ){
      note = innatePowers[0].getElementsByTagName("note")[0];
      if(note){
        note.classList.add('single-squish');
        console.log('Single power note detected. Moving note to side.')
        moveFlag = true;
      }
    }
    
		descriptionContainers = innatePowerBox.getElementsByTagName("description-container");
		tallest = 0;
		tallest_index = 0;
		for(i = 0; i < descriptionContainers.length; i++){
			if(descriptionContainers[i].clientHeight > tallest){
				tallest = descriptionContainers[i].clientHeight;
				tallest_index = i
			}
		}
		console.log('tallest is Innate Power: ' + (tallest_index+1))
		
		//check for note in tallest innate power
		noteBox = descriptionContainers[tallest_index].getElementsByTagName("note")[0];
		if(noteBox && !moveFlag){
			console.log('notebox detected, attempting to shrink')
			while(checkOverflowHeight(innatePowerBox)){
				var style = window.getComputedStyle(noteBox, null).getPropertyValue('font-size');
				var fontSize = parseFloat(style);
				noteBox.style.fontSize = (fontSize - 1) + 'px';
				var line = window.getComputedStyle(noteBox, null).getPropertyValue('line-height');
				var lineHeight = parseFloat(line);
				noteBox.style.lineHeight = (lineHeight - 1) + 'px';
				// safety valve
				k += 1
				if (k>10){ 
					console.log('Notes shrunk as far as reasonable')
					break;
				}
			}
		}else{
			console.log('Unable to shrink notes - note not detected in tallest power')
		}
		
	}
}

function getGrowthTableWidth(growthTable){

  var growthCells =  growthTable.getElementsByTagName("growth-cell");
  var growthGroups = growthTable.getElementsByTagName("growth-group");
  var growthBorders = Array.from(growthTable.getElementsByTagName("growth-border"));
  
  let borderPixels = 0;
  for (i = 0; i < growthBorders.length; i++) {
    borderPixels += growthBorders[i].offsetWidth;
  }

  let totalGroupWidth = 0;
  for (i = 0; i < growthGroups.length; i++){
    totalGroupWidth += growthGroups[i].offsetWidth;
  }
  
  var totalWidth = totalGroupWidth+borderPixels
  return totalWidth
}

function balanceText(el){
  var debug = false;
	var initialHeight = el.offsetHeight
	var currentHeight = initialHeight
	let j = 0
	let k = 100
	while(currentHeight <= initialHeight){
		k = k - 3
		el.style.width = k+"%";
		currentHeight = el.offsetHeight
		j += 1
		if (j>10){ 
			if(debug){
        console.log('Max text reduction reached for')
        console.log(el)
      }
			break;
		}
	}
	k = k + 3
	el.style.width = k+"%";
}

function reduceLines(el){
	var initialHeight = el.offsetHeight
	var currentHeight = initialHeight
	let j = 0
	let k = 100
	while(currentHeight >= initialHeight){
		k = k + 1
		el.style.width = k+"%";
		currentHeight = el.offsetHeight
		j += 1
		if (j>10){ 
			console.log('Max text reduction reached for')
			console.log(el)
			break;
		}
	}
	el.style.width = k+"%";
}

function checkOverflowWidth(el){
  let curOverflow = el.style.overflow
  if (!curOverflow || curOverflow === "visible") {
      el.style.overflow = "auto"
  }
  let isOverflowing = (el.clientWidth+30) < el.scrollWidth ? el.scrollWidth : false;
  el.style.overflow = curOverflow
	
  return isOverflowing
}

function checkOverflowHeight(el){
	let curOverflow = el.style.overflow
    if (!curOverflow || curOverflow === "visible") {
        el.style.overflow = "auto"
    }
    let isOverflowing = el.clientHeight < el.scrollHeight
    el.style.overflow = curOverflow

    return isOverflowing
}

function findBoundingRect(el){

  var growthCellRect;
  // console.log(el.tagName+", "+el.classList.value)
  if(el.children.length==0){
    growthCellRect = el.getBoundingClientRect();
    return growthCellRect
  }else{
    growthCellRect = el.children[0].getBoundingClientRect();
  }
  // console.log(el.tagName+", "+el.classList.value+' left = '+growthCellRect.left)
  // console.log(el.tagName+", "+el.classList.value+' right = '+growthCellRect.right)
  for (const child of el.children) {
    if(child.tagName != "GROWTH-TEXT"){
      var newCellRect = findBoundingRect(child);
      if(newCellRect.left < growthCellRect.left){
        growthCellRect.left=newCellRect.left
      }
      if(newCellRect.right > growthCellRect.right){
        growthCellRect.right=newCellRect.right
      }
    }
  }
  // console.log('returning for '+el.tagName+", "+el.classList.value+':')
  // console.log(' left = '+growthCellRect.left)
  // console.log(' right = '+growthCellRect.right)
  return growthCellRect
}

function parseInnatePowers(){
    
	console.log('BUILDING INNATE POWERS')
	const board = document.querySelectorAll('board')[0];
	
	var fullHTML = "";
  var innateHTML = board.getElementsByTagName("quick-innate-power");
  
  for(i = 0; i < innateHTML.length; i++){
      fullHTML += parseInnatePower(innateHTML[i]);
  }
  board.getElementsByTagName("innate-powers")[0].innerHTML = '<section-title>Innate Powers</section-title><innate-power-container>'+fullHTML+'</innate-power-container>';
	
	//Enable custom line breaks
	var levelList = board.getElementsByClassName('description')
	
  for (let j = 0; j < levelList.length; j++) {
    ruleLines = levelList[j].innerHTML.split("\n")
    rulesHTML = "";
    for (let i = 0; i < ruleLines.length; i++) {
      rulesText = ruleLines[i];
      rulesText=rulesText.replaceAll('\t','')
      if(rulesText && rulesText.trim().length){
      rulesHTML += "<div>"+ruleLines[i]+"</div>"
      }else if(i>0 && i<ruleLines.length-1){
        rulesHTML += "<br>"
        // allows user's line breaks to show up on the card
      }
    }
    levelList[j].innerHTML = rulesHTML
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

function parseSpecialRules(){
  console.log('BUILDING SPECIAL RULES')
  const board = document.querySelectorAll('board')[0];

  var specialRules = board.getElementsByTagName("special-rules-container")[0];

  // Enable snake-like presence track in special rules
  var specialTrack = board.getElementsByTagName("special-rules-track")[0];
  if(specialTrack){
    var specialValues = specialTrack.getAttribute("values");
    var specialOptions = specialValues.split(",");
    var specialHTML = "";
    
    for(i = 0; i < specialOptions.length; i++){
      let nodeText = specialOptions[i];
      specialHTML += "<td>"+getPresenceNodeHtml(nodeText, i == 0, "special", true)+"</td>";
    }
    specialHTML += "</tr>"
    board.getElementsByTagName("special-rules-track")[0].removeAttribute("values");
    specialTrack.innerHTML = specialHTML;
    var subtextList = specialTrack.getElementsByTagName("subtext");
    for (var i = subtextList.length - 1; i >= 0; --i) {
      subtextList[i].remove();
    }
  }

  // Enable user's own line breaks to show up in code
    var specialRuleList = specialRules.getElementsByTagName('special-rule')
    for (let j = 0; j < specialRuleList.length; j++) {
      ruleLines = specialRuleList[j].innerHTML.split("\n")
      rulesHTML = "";
      for (let i = 0; i < ruleLines.length; i++) {
        if(ruleLines[i] && ruleLines[i].trim().length){
        rulesHTML += "<div>"+ruleLines[i]+"</div>"
        }else if(i>0 && i<ruleLines.length-1){
          rulesHTML += "<br>"
          // allows user's line breaks to show up on the card
        }
      }
      specialRuleList[j].innerHTML = rulesHTML
    }
  // <special-rules-track values="2,3,4"></special-rules-track>
}