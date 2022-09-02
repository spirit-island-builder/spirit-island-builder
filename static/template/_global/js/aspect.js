
window.onload = function startMain(){
    var aspects = document.querySelectorAll('aspect');
    for(var i = 0; i < aspects.length; i++){
        parseSubNodes(aspects[i]);
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
