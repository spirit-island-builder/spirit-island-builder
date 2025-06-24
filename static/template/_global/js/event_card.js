async function startMain() {
  console.log("Start Main: Event Card");

  templateEventCard = document.querySelectorAll("template-event-card")[0];
  let eventType = templateEventCard.getAttribute("type");
  if (templateEventCard) {
    let eventCard = buildCard(templateEventCard);
    templateEventCard.parentNode.insertBefore(eventCard, templateEventCard.nextSibling);
    templateEventCard.remove();
  }

  processEffects();

  var html = document.querySelectorAll("event-card")[0].innerHTML;
  document.querySelectorAll("event-card")[0].innerHTML = replaceIcon(html);

  setTimeout(() => {
    resize(eventType);
  }, 200);
}

function resize(eventType) {
  // resizes title (for choice events)
  dynamicSizing(document.getElementsByClassName("title")[0], 55);

  // checks for resize on blight, then applies it to both headers if needed
  if (eventType === "blight" || eventType === "stage" || eventType === "terror") {
    let subeventHeaders = document.querySelectorAll("subevent-header");
    subeventHeaders.forEach((header) => {
      let fontUpdate = dynamicSizing(header, 58);
      if (fontUpdate) {
        subeventHeaders.forEach((header2) => {
          header2.style.fontSize = fontUpdate;
        });
      }
    });
  }
}

function buildCard(template) {
  let eventCard = document.createElement("event-card");
  template.parentNode.insertBefore(eventCard, templateEventCard.nextSibling);
  let eventName = template.getAttribute("name");
  let eventLore = template.getAttribute("lore");
  let eventType = template.getAttribute("type");
  let eventSubtype = template.getAttribute("subtype");
  const subEvents = document.querySelectorAll("subevent");

  const tokenEvents = document.querySelectorAll("token-event");

  html = `<event-body class="${eventType} ${eventSubtype}">
          <event-header class="title">${eventName}</event-header>
          <effect class = "title"> ${eventLore} </effect>`;

  subEvents.forEach((subEvent, i) => {
    html += parseSubevent(subEvents[i], i + 1, eventType);
  });

  html += `</event-body>
          `;

  let bottomOffset = 40 + 120 * (tokenEvents.length - 1);
  tokenEvents.forEach((tokenEvent) => {
    html += parseTokenEvent(tokenEvent, bottomOffset);
    bottomOffset -= 120;
  });

  html += `
          <event-card-overlay> </event-card-overlay>
         `;

  eventCard.innerHTML = html;
  return eventCard;
}

function parseCustomSubevent(el, eventNumber) {
  let bannerType = el.getAttribute("type");

  return parseSubevent(el, eventNumber, bannerType);
}

function parseSubevent(el, eventNumber, bannerType) {
  let name = el.getAttribute("name");
  let effect = el.getAttribute("effect");
  let bannerText = el.getAttribute("bannerText");

  let html = `<subevent class="${"sub" + eventNumber}" style="z-index:${4 - eventNumber}">
  <subevent-banner></subevent-banner>
  <subevent-body>
  <subevent-header class = ${bannerType}>${name}</subevent-header>
  <effect>${effect}</effect> 
  ${bannerType != "choice" && eventNumber != 1 ? "<event-line></event-line>" : ""}
  </subevent-body>
  </subevent>
  `;

  return html;
}

function parseTokenEvent(el, bottomOffset) {
  let name = el.getAttribute("name");
  let effect = el.getAttribute("effect");
  let tokens = el.getAttribute("tokens");

  //The colors each token is associated with.
  var colorMap = {
    badlands: "#FFB82B",
    wilds: "#BAE58B",
    strife: "#8EC7E1",
    vitality: "#A0CF45",
    dahan: "#decaac",
    disease: "#e0d567",
    beasts: "#fac9b8",
    blight: "#CDD4D1",
    fear: "#E0C7FF",
  };

  const tokensArray = tokens.split(",");

  let background = "";

  console.log(tokensArray);

  if (tokensArray.length > 1) {
    background = "linear-gradient(90deg";
    tokensArray.forEach((token) => {
      background += "," + colorMap[token];
    });
    background += ")";
    console.log(background);
  } else {
    background = colorMap[tokensArray[0]];
    console.log(background);
  }

  let html = `

      <token-event style="bottom: ${bottomOffset}px; background: ${background}">
      <token-event-icon-container>
      `;
  tokensArray.slice().forEach((token) => {
    html += `
        <token-event-icon class="${token}"> </token-event-icon>
        `;
  });

  html += `
      </token-event-icon-container>
      <token-event-texture> </token-event-texture>
      <token-event-effect><token-event-name>${name}</token-event-name><b>: </b>${effect}</token-event-effect>
      
      </token-event class="${tokens}">
      `;

  return html;
}

function dynamicSizing(el, maxSize = el.offsetHeight) {
  let j = 0;
  let fontSizeFormat;
  if (!el) {
    console.log("no element to resize");
    return;
  }
  console.log("resizing ");
  console.log(el);
  while (checkOverflow(el)) {
    console.log("thats an overflow");
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var fontSize = parseFloat(style);
    console.log("fontSize = " + fontSize);
    fontSizeFormat = fontSize - 1 + "px";
    el.style.fontSize = fontSizeFormat;

    // safety valve
    j += 1;
    if (j > 12) {
      console.log("safety");
      break;
    }
  }
  return fontSizeFormat;
}

function checkOverflow(el) {
  console.log("checking overflow:" + el.tagName);
  let curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflow = "auto";
  }
  let isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
  el.style.overflow = curOverflow;
  return isOverflowing;
}

function processEffects() {
  const eventCard = document.querySelectorAll("event-card")[0];
  const effects = eventCard.getElementsByTagName("effect");
  let effectsArray = Array.from(effects);
  effectsArray.forEach((effect) => {
    processRulesText(effect, "effect-line");
  });
}
