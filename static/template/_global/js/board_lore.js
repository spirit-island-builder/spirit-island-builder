window.onload = (event) =>{
	startMain();
    console.log('Page Loaded');

};

function startMain(){
    var html = document.querySelectorAll('board')[0].innerHTML;
    document.querySelectorAll('board')[0].innerHTML = replaceIcon(html);
    adjustComplexityValue();
    createPowerProperties();
	
	setTimeout(() => {resize()}, 200);
}

function resize() {
	dynamicSizing(document.querySelectorAll('lore-description')[0]);
	
	secondContainer = document.querySelectorAll('second-section-container')[0]
	setup = document.querySelectorAll('setup-description')[0]
	playstyle = document.querySelectorAll('play-style-description')[0]
	console.log('resizing text for setup and playstyle')
	let j = 0
	while (checkOverflow(secondContainer)){
		var style = window.getComputedStyle(setup, null).getPropertyValue('font-size');
		var fontSize = parseFloat(style); 
		setup.style.fontSize = (fontSize - 1) + 'px';
		playstyle.style.fontSize = (fontSize - 1) + 'px';
		// safety valve
		j += 1
		if (j>8){ 
			console.log('safety')
			break;
		}
	}
	// dynamicSizing(document.querySelectorAll('setup-description')[0]);
	// dynamicSizing(document.querySelectorAll('play-style-description')[0]);
}

function adjustComplexityValue() {
	
	//Quick Complexity
	var quickComplexity = document.getElementsByTagName("complexity")[0].getAttribute("value");
	if (quickComplexity){
		var quickDescriptor = document.getElementsByTagName("complexity")[0].getAttribute("descriptor");
		var inner = `
                <complexity-title>COMPLEXITY</complexity-title>
                <complexity-value value="${quickComplexity}" style="width: 300px;">${quickDescriptor}</complexity-value>
                <red-box></red-box>`;
		document.getElementsByTagName("complexity")[0].innerHTML = inner
	}
	
    var complexityValue = document.getElementsByTagName("complexity-value")[0].getAttribute("value");
    console.log(complexityValue);
    //add 45px for each value
    var basePixels = 120;
    var addedPixels = (complexityValue*45);
    var totalPixels = basePixels+addedPixels+"px";
    console.log(totalPixels);
    document.getElementsByTagName("complexity-value")[0].style.width = totalPixels;
}

function createPowerProperties(){
	// Quick Summary of Powers
	var valueSummary = document.getElementsByTagName("summary-of-powers")[0].getAttribute("values");
	if (valueSummary){
		var values = valueSummary.split(",");
		var offenseValue = values[0];
		var controlValue = values[1];
		var fearValue = values[2];
		var defenseValue = values[3];
		var utilityValue = values[4];
		var powerTable = document.createElement('table');
		powerTable.className = 'powers-summary';
		powerTable.innerHTML = `
                    <tbody><tr class="power-bar">
                        <td>
                            <div class="summary-of-powers-title">Summary of Powers
                        </div></td>
                        <td valign="bottom">
                            <div class="offense" value="${offenseValue}"></div>
                        </td>
                        <td valign="bottom">
                            <div class="control" value="${controlValue}"></div>
                        </td>
                        <td valign="bottom">
                            <div class="fear" value="${fearValue}"></div>
                        </td>
                        <td valign="bottom">
                            <div class="defense" value="${defenseValue}"></div>
                        </td>
                        <td valign="bottom">
                            <div class="utility" value="${utilityValue}"></div>
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
		  document.getElementsByTagName("summary-of-powers")[0].appendChild(powerTable)
	}
	
	var summaryOfPowers = document.getElementsByTagName("summary-of-powers")[0]
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

    offenseTag.style.height = (offenseValue * 15) + 'px';
    controlTag.style.height = (controlValue * 15) + 'px';
    fearTag.style.height = (fearValue * 15) + 'px';
    defenseTag.style.height = (defenseValue * 15) + 'px';
    utilityTag.style.height = (utilityValue * 15) + 'px';
	
	uses = document.getElementsByTagName("summary-of-powers")[0].getAttribute("uses");
	if(uses){
		table = document.getElementsByClassName("powers-summary")[0];
		rowElements = table.getElementsByTagName("td")
		for(let i = 0; i < rowElements.length; i++){ 
			rowElements[i].style.width = 90 + "px";
		}
		offenseTag.style.marginLeft = 14 + 'px';
		controlTag.style.marginLeft = 14 + 'px';
		fearTag.style.marginLeft = 14 + 'px';
		defenseTag.style.marginLeft = 14 + 'px';
		utilityTag.style.marginLeft = 14 + 'px';
		table = document.getElementsByClassName("powers-summary")[0]
		table.paddingRight = 15+'px'
		topRow = table.getElementsByTagName("tr")[0];
		lineCol = document.createElement('td');
		lineCol.className = "power-divider"
		lineCol.style.width = "10px"
		usesCol = document.createElement('td');
		usesCol.rowSpan = "2"
		usesCol.className = "uses-icon"
		usesCol.style.width = "140px"
		usesCol.append('USES')
		usesList = uses.split(',')
		console.log(usesList)
		iconHolder = document.createElement('uses-icon-holder');
		for(let i = 0; i < usesList.length; i++){ 
			usesIcon = document.createElement('icon');
			usesIcon.className = usesList[i]+' uses-icon';
			iconHolder.append(usesIcon)
		}
		usesCol.append(iconHolder)
		topRow.append(lineCol)
		topRow.append(usesCol)
	}
}

function dynamicSizing(el, maxSize=el.offsetHeight)
{
	console.log('resizing text for ' + el.tagName)
	let j = 0
	while (checkOverflow(el)){
		var style = window.getComputedStyle(el, null).getPropertyValue('font-size');
		var fontSize = parseFloat(style); 
		el.style.fontSize = (fontSize - 1) + 'px';

		// safety valve
		j += 1
		if (j>8){ 
			console.log('safety')
			break;
		}
	}
}

function checkOverflow(el) {
    let curOverflow = el.style.overflow
    if (!curOverflow || curOverflow === "visible") {
        el.style.overflow = "hidden"
    }
    let isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight
    el.style.overflow = curOverflow
    return isOverflowing
}