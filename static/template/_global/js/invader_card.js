async function startMain() {
  // window.onload = function startMain() {
  // window.onload is for template mode
  console.log("Start Main: Invader Card");

  templateInvaderCard = document.querySelectorAll("template-invader-card")[0];
  templateInvaderCard = buildInvaderCard(templateInvaderCard);

  var html = templateInvaderCard.innerHTML;
  templateInvaderCard.innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize(templateInvaderCard);
  }, 200);
}

function resize(templateInvaderCard) {
  const fields = document.querySelectorAll("invader-field");
  fields.forEach((field) => {
    dynamicSizing(field, field);
    processRulesText(field, "field-line");
  });

  function dynamicSizing(el, container) {
    let debug = true;
    if (debug) {
      console.log("Shrinking: " + el.textContent);
    }
    //Shrink text to fit
    let j = 0;
    while (checkOverflowWidth(container, 0)) {
      var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
      var line = window.getComputedStyle(el, null).getPropertyValue("line-height");
      var fontSize = parseFloat(style);
      var lineWidth = parseFloat(line);
      el.style.fontSize = fontSize - 1 + "px";
      el.style.lineWidth = lineWidth - 1 + "px";
      // safety valve
      j += 1;
      if (j > 100) {
        console.log("safety");
        break;
      }
    }
  }
}

function buildInvaderCard(template) {
  const type = template.getAttribute("type") || "single";
  const top = template.getAttribute("top");
  template.removeAttribute("top");
  const bottom = template.getAttribute("bottom") || "";

  // Set type
  template.classList.add(type);

  // Add terrains
  const topTerrain = document.createElement("invader-card-terrain");
  template.appendChild(topTerrain);
  topTerrain.style.backgroundImage = `url(${top})`;

  if (type === "double") {
    const botTerrain = document.createElement("invader-card-terrain");
    template.appendChild(botTerrain);
    botTerrain.style.backgroundImage = `url(${bottom})`;
  }

  // Interate through text fields
  let fields = document.querySelectorAll("invader-field");
  fields.forEach((field) => {
    if (field.getAttribute("type")) {
      let fieldType = field.getAttribute("type");
      field.classList.add(fieldType);
      // Specials for various types
      if (fieldType === "spacer") {
        field.innerHTML = "";
      }
      if (fieldType === "image" && field.getAttribute("imgsrc")) {
        field.style.backgroundImage = `url(${field.getAttribute("imgsrc")})`;
        field.removeAttribute("imgsrc");
      }
      if ((fieldType === "para" || fieldType === "reminder") && field.getAttribute("color")) {
        field.style.color = field.getAttribute("color");
        field.removeAttribute("color");
      }
    }
  });
  // Add text
  // const textHeadingHTML = document.createElement("text-heading");
  // template.appendChild(textHeadingHTML)
  // textHeadingHTML.innerHTML = textHeading
  // if (!textBody) {
  //   textHeadingHTML.classList.add("nobody")
  // }

  // Add mask depending on what type of invader card
  const mask = document.createElement("invader-card-mask");
  template.appendChild(mask);

  return template;
}
