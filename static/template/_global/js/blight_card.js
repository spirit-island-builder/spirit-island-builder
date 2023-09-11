async function startMain() {
  // window.onload = function startMain() {
  //remove the window.onload when transferring over to Builder
  console.log("Start Main: Blight Card");

  tempalteBlightCard = document.querySelectorAll("template-blight-card")[0];

  if (tempalteBlightCard) {
    let blightCard = buildBuildCard(tempalteBlightCard);
    tempalteBlightCard.parentNode.insertBefore(blightCard, tempalteBlightCard.nextSibling);
    tempalteBlightCard.remove();
  }

  var html = document.querySelectorAll("blight-card")[0].innerHTML;
  document.querySelectorAll("blight-card")[0].innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize();
  }, 200);
}

function resize() {
  balanceText(document.querySelectorAll("effect")[0]);
}

function buildBuildCard(template) {
  let blightCard = document.createElement("blight-card");
  template.parentNode.insertBefore(blightCard, tempalteBlightCard.nextSibling);
  let effectName = template.getAttribute("name");
  let cardEffect = template.querySelectorAll("effect")[0];
  let effectHTML = cardEffect.innerHTML;
  let blightPerPlayer = template.getAttribute("per-player");
  let stillHealthy = template.getAttribute("still-healthy");
  stillHealthy = stillHealthy === "true"; //converts to boolean

  console.log("stillhealthy=" + stillHealthy);
  //  !== "true" ? false : true;
  let headingText = stillHealthy
    ? "Still Healthy Island<br><for-now>(for now)</for-now>"
    : "Blighted Island";
  let noBlightText = stillHealthy
    ? "draw a new Blight Card.<br><b>It comes into play already flipped.</b>"
    : "players lose.";
  if (stillHealthy) {
    console.log("adding healthy island :" + stillHealthy);
    blightCard.classList.add("still-healthy"); //this doesn't exist yet so we can't add
  }

  html = `<blight-heading>${headingText}</blight-heading>
    <blight-banner><effect-name>${effectName}</effect-name>
    <effect>${effectHTML}</effect></blight-banner>
    <per-player-text>
    ${blightPerPlayer} {blight} per player
    </per-player-text>
    <blight-reminder>
    Any {blight} removed from<br>the board returns here.<br><br>If there is ever NO {blight} here,<br>${noBlightText}
    </blight-reminder>`;

  blightCard.innerHTML = html;

  return blightCard;
}

function balanceText(el) {
  let debug = true;
  if (debug) {
    console.log("Balancing Text: " + el.textContent);
  }
  const initialHeight = el.offsetHeight;
  if (initialHeight > 20) {
    // No action needed for 1 liners (19px)
    let currentHeight = initialHeight;
    let j = 0;
    let k = Math.trunc(el.offsetWidth);
    let overflow = false;
    while (currentHeight <= initialHeight) {
      // tighten until it changes something
      k = k - 1;
      el.style.width = k + "px";
      currentHeight = el.offsetHeight;
      j += 1;
      if (j > 200) {
        if (debug) {
          console.log("Max text reduction reached for");
          console.log(el);
        }
        break;
      }
    }
    if (debug) {
      console.log(
        "reset at w=" + el.offsetWidth + ",h=" + el.offsetHeight + ",overflow=" + overflow
      );
    }
    k = k + 1;
    el.style.width = k + "px";
    if (debug) {
      console.log("reset to w=" + el.offsetWidth + ",h=" + el.offsetHeight);
    }
    // el.style.width = el.offsetWidth + "px";
  }
}
