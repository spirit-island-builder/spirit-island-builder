async function startMain() {
  //remove the window.onload when transferring over to Builder
  console.log("Start Main: Event Card");

  templateEventCard = document.querySelectorAll("template-event-card")[0];

  if (templateEventCard) {
    let eventCard = buildBuildCard(templateEventCard);
    templateEventCard.parentNode.insertBefore(eventCard, templateEventCard.nextSibling);
    templateEventCard.remove();
  }

  var html = document.querySelectorAll("event-card")[0].innerHTML;
  document.querySelectorAll("event-card")[0].innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize();
  }, 200);
}

function resize() {
  dynamicSizing(document.querySelectorAll("event-card")[0], 55);
}

function buildBuildCard(template) {
  let eventCard = document.createElement("event-card");
  template.parentNode.insertBefore(eventCard, templateEventCard.nextSibling);
  let eventName = template.getAttribute("name");
  let eventLore = template.getAttribute("lore");
  let eventType = template.getAttribute("type");
  let eventSubtype = template.getAttribute("subtype");
  const subEvents = document.querySelectorAll("subevent");

  const tokenEvents = document.querySelectorAll("token-event");

  // const eventHeader = document.querySelector('event-header');

  html = `<event-body>         
          `;

  if (!(eventName == "" || eventName == "none")) {
    html += ` <subevent-header class = "title" >${eventName}</subevent-header>
    `;
  }

  if (!(eventLore == "" || eventLore == "none")) {
    html += `<effect class = "title"> ${eventLore} </effect>
    `;
  }

  let eventNumber = subEvents.length;

  if (eventNumber == 2) {
    if (eventType == "blight") {
      html += parseSubevent(subEvents[0], 2, "healthy");
      html += parseSubevent(subEvents[1], 1, "blighted");
    }
    if (eventType == "terror") {
      if (eventSubtype == "terror12") {
        html += parseSubevent(subEvents[0], 2, "terror12");
        html += parseSubevent(subEvents[1], 1, "terror3");
      } else {
        html += parseSubevent(subEvents[0], 2, "terror1");
        html += parseSubevent(subEvents[1], 1, "terror23");
      }
    }
    if (eventType == "stage") {
      if (eventSubtype == "stage12") {
        html += parseSubevent(subEvents[0], 2, "stage12");
        html += parseSubevent(subEvents[1], 1, "stage3");
      } else {
        html += parseSubevent(subEvents[0], 2, "stage1");
        html += parseSubevent(subEvents[1], 1, "stage23");
      }
    }
    if (!(eventType == "stage" || eventType == "blight" || eventType == "terror")) {
      //default to choiche
      html += parseSubevent(subEvents[0], 2, "choice");
      html += parseSubevent(subEvents[1], 1, "choice");
    }
  } else {
    subEvents.forEach((subEvent) => {
      html += parseCustomSubevent(subEvent, eventNumber);
      eventNumber--;
    });
  }

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

  let html = `<subevent style = "z-index: ${eventNumber}">`;

  if (bannerType != "none") {
  }

  switch (bannerType) {
    case "choice":
      break;

    case "healthy":
      html += `
      <subevent-banner class="${bannerType}"> <subevent-banner-text> Healthy Island </subevent-banner-text> </subevent-banner>
      `;
      break;

    case "blighted":
      html += `
        <subevent-banner class="${bannerType}"> <subevent-banner-text> Blighted Island </subevent-banner-text> </subevent-banner>
      `;
      break;

    case "terror1":
      html += `
        <subevent-banner class="${bannerType}"> 
        <subevent-banner-icon class="terror1"> </subevent-banner-icon>
        </subevent-banner> 
        `;
      break;

    case "terror12":
      html += `
        <subevent-banner class="${bannerType}"> 
        <subevent-banner-icon class="terror1"> </subevent-banner-icon>
        <subevent-banner-icon class="terror12"> </subevent-banner-icon>
        </subevent-banner>
        `;
      break;

    case "terror23":
      html += `
        <subevent-banner class="${bannerType}"> 
        <subevent-banner-icon class="terror23"> </subevent-banner-icon>
        <subevent-banner-icon class="terror3"> </subevent-banner-icon>
        </subevent-banner>
        `;
      break;

    case "terror3":
      html += `
        <subevent-banner class="${bannerType}"> 
        <subevent-banner-icon class="terror3"> </subevent-banner-icon>
        </subevent-banner>
        `;
      break;

    case "stage1":
      html += `
        <subevent-banner class="stage1"> <subevent-banner-text> STAGE I </subevent-banner-text> </subevent-banner>
        `;
      break;

    case "stage12":
      html += `
        <subevent-banner class="stage1"> <subevent-banner-text> STAGES I + II </subevent-banner-text> </subevent-banner>

        `;
      break;

    case "stage23":
      html += `
        <subevent-banner class="stage3"> <subevent-banner-text> STAGES II + III </subevent-banner-text> </subevent-banner>
        `;
      break;

    case "stage3":
      html += `
        <subevent-banner class="stage3"> <subevent-banner-text> STAGE III </subevent-banner-text> </subevent-banner>
        `;
      break;
    case "custom":
      html += `
        <subevent-banner class="${bannerType}"> <subevent-banner-text> ${bannerText} </subevent-banner-text> </subevent-banner>
        `;
      break;
    default:
      break;
  }

  html += `
    <subevent-body>
    <subevent-header class = ${bannerType}> ${name} </subevent-header>
    <effect> ${effect} </effect> 
  `;
  if (bannerType != "choice" && eventNumber != 1) {
    html += `<event-line> </event-line>`;
  }
  html += `
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
  tokensArray
    .slice()
    .reverse()
    .forEach((token) => {
      html += `
        <token-event-icon class="${token}"> </token-event-icon>
        `;
    });

  html += `
      </token-event-icon-container>
      <token-event-texture> </token-event-texture>
      <token-event-effect><span style="font-family: Name Headings; letter-spacing: 0px;">${name}</span> ${effect}</token-event-effect>
      
      </token-event class="${tokens}">
      `;

  return html;
}

function dynamicSizing(el, maxSize = el.offsetHeight) {
  let j = 0;
  while (checkOverflow(el)) {
    var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
    var line = window.getComputedStyle(el, null).getPropertyValue("line-height");
    var fontSize = parseFloat(style);
    var lineHeight = parseFloat(line);
    el.style.lineHeight = lineHeight - 1 + "px";
    if (lineHeight < 15) {
      // there's more room in line height first
      el.style.fontSize = fontSize - 1 + "px";
    }
    // safety valve
    j += 1;
    if (j > 8) {
      console.log("safety");
      break;
    }
  }
}

function checkOverflow(el) {
  let curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === "visible") {
    el.style.overflow = "hidden";
  }
  let isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
  el.style.overflow = curOverflow;
  return isOverflowing;
}
