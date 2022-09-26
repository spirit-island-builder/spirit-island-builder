window.onload = (event) =>{
	startMain();
    console.log('Page Loaded');

};

function startMain(){
	quickAdversary = document.querySelectorAll('quick-adversary')[0];
	console.log(quickAdversary)
	if (quickAdversary){
		var adversary = document.createElement('adversary');
		adversary.innerHTML = buildAdversary(quickAdversary)
		quickAdversary.parentNode.insertBefore(adversary, quickAdversary.nextSibling);
		quickAdversary.remove()
	}
	
	var html = document.querySelectorAll('adversary')[0].innerHTML;
    document.querySelectorAll('adversary')[0].innerHTML = replaceIcon(html);
	setTimeout(() => {resize()}, 200);
}

function resize(){
	dynamicSizing(document.querySelectorAll('top-info')[0],55)
}

function buildAdversary(quickAdversary) {
adversaryName = quickAdversary.getAttribute('name')
flagImage = quickAdversary.getAttribute('flag-image')
baseDifficulty = quickAdversary.getAttribute('base-difficulty')

lossCondition = quickAdversary.querySelectorAll('loss-condition')[0]
var lossConditionTitle = lossCondition.getAttribute('name');
if(lossConditionTitle){
  lossConditionTitle=lossConditionTitle+'<strong>:</strong> '
}
escalation = quickAdversary.querySelectorAll('escalation-effect')[0]

levels = quickAdversary.querySelectorAll('level')

html = `
    <adversary-title>${adversaryName}</adversary-title>
    <img class="flag" src="${flagImage}" />
    <adversary-base-dif>BASE DIFFICULTY ${baseDifficulty}</adversary-base-dif>
    <top-info>
      <loss-condition>
        <section-title>Additional Loss Condition</section-title>
        <div>
          <strong>${lossConditionTitle}</strong>${lossCondition.getAttribute('rules')}
        </div>
      </loss-condition>
      <escalation>
        <section-title>Escalation <icon class="escalation"></icon></section-title>
        <div>
          <strong>${escalation.getAttribute('name')}:</strong> ${escalation.getAttribute('rules')}
        </div>
      </escalation>
    </top-info>
    <adversary-levels>
      <header>
        <header-level>Level<br>(Difficulty)</header-level>
        <div>Fear Cards</div>
        <div>Game Effects <span class="cumulative">(cumulative)</span></div>
      </header>`;

		html+= buildLevel(quickAdversary.querySelectorAll('level-1')[0])
		html+=`<line></line>`
		html+= buildLevel(quickAdversary.querySelectorAll('level-2')[0])
		html+=`<line></line>`
		html+= buildLevel(quickAdversary.querySelectorAll('level-3')[0])
		html+=`<line></line>`
		html+= buildLevel(quickAdversary.querySelectorAll('level-4')[0])
		html+=`<line></line>`
		html+= buildLevel(quickAdversary.querySelectorAll('level-5')[0])
		html+=`<line></line>`
		html+= buildLevel(quickAdversary.querySelectorAll('level-6')[0])

    html+=`</adversary-levels>`

	return html
}

function buildLevel(quickLevel){
	fearCards = quickLevel.getAttribute('fear-cards')
	fearCardList = fearCards.split(",");
	if(!fearCardList[1]){
		fearCardList = fearCards.split("/");
	}
	let fearCardNum = 0;
	for (var i = 0; i < fearCardList.length; i++) {
	  fearCardNum += parseInt(fearCardList[i]);
	}
	fearCards=fearCardList.join('/')
    levelHTML =`<level>
        <div>${quickLevel.tagName.at(-1)}<level-difficulty class="level-difficulty">(${quickLevel.getAttribute('difficulty')})</level-difficulty></div>
        <div>${fearCardNum} (${fearCards})</div>
        <div>
          <strong>${quickLevel.getAttribute('name')}:</strong> ${quickLevel.getAttribute('rules')}
        </div>
      </level>`
return levelHTML
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