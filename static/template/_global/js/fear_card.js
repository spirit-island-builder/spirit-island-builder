async function startMain() {
  // window.onload = function startMain() {
  // window.onload is for template mode
  console.log("Start Main: Fear Card");

  templateFearCard = document.querySelectorAll("template-fear-card")[0];
  templateFearCard = buildFearCard(templateFearCard);

  // if (templateFearCard) {
  //   let fearCard = buildFearCard(templateFearCard);
  //   templateFearCard.parentNode.insertBefore(fearCard, templateFearCard.nextSibling);
  //   templateFearCard.remove();
  // }

  var html = templateFearCard.innerHTML;
  templateFearCard.innerHTML = replaceIcon(html);
  setTimeout(() => {
    resize(templateFearCard);
  }, 200);
}

function resize(templateFearCard) {
  let terrorEffects = templateFearCard.querySelectorAll("effect");
  terrorEffects.forEach((terrorEffect, i) => {
    balanceText(terrorEffect);
  });
}

function buildFearCard(template) {
  let terrorLevels = template.querySelectorAll("terror-level");
  terrorLevels.forEach((terrorLevel, i) => {
    let effect = document.createElement("effect");
    effect.innerHTML = terrorLevel.innerHTML;
    terrorLevel.innerHTML = effect.outerHTML;
  });
  return template;
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
