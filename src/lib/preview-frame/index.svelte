<script>
  export let id;
  export let baseURI = "/";
  let classList;
  export { classList as class };

  import { tick, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { installHotReloadEvent } from "$lib/hmr-helper.js";
  import { jsPDF } from "jspdf";

  // Using a query string of `?worker&url` gives a URL from which we can
  // pass to `<script type="module">` tag, which we can inject into the
  // preview frame.
  import takeScreenshotURL from "./take-screenshot?worker&url";

  import { downloadImage } from "$lib/download";

  export let clickFunction = () => {};

  let previewIframe;
  let wrapper;
  let large = false;

  let previewTemplate;

  const waitForEvent = (eventTarget, eventType, rejectEventType) => {
    return new Promise((resolve, reject) => {
      eventTarget.addEventListener(eventType, resolve, { once: true });
      if (rejectEventType) {
        eventTarget.addEventListener(rejectEventType, reject, { once: true });
      }
    });
  };

  export const copyHTMLFrom = async (fragment) => {
    await updateSrc();
    previewIframe.contentDocument.body.replaceChildren(
      previewIframe.contentDocument.importNode(fragment, true)
    );
  };

  export const takeScreenshot = (
    fileNames,
    elementNamesInIframe,
    options = "for-image-download"
  ) => {
    console.log("screenshot with " + options);
    elementNamesInIframe.forEach((elementNameInIframe, index) => {
      let element = previewIframe.contentDocument.querySelector(elementNameInIframe);
      console.log(element);
      element.classList.add(options);
      let scale = 1.8;
      previewIframe.contentWindow.takeScreenshot(elementNameInIframe, scale).then((imageURL) => {
        downloadImage(imageURL, fileNames[index]);
        element.classList.remove(options);
      });
    });
  };

  export const getPDF = (
    fileName,
    elementNamesInIframe,
    pageType,
    wid = 9,
    hit = 6,
    flip = false,
    orientation = "landscape"
  ) => {
    const doc = new jsPDF({
      orientation: orientation,
      unit: "in",
      format: pageType,
    });
    let i = 0;
    let xi = 0.5;
    let x = xi;
    let yi = 0.5;
    let y = yi;
    let pw = doc.getPageWidth();
    let count = elementNamesInIframe.length;
    elementNamesInIframe.forEach((elementNameInIframe, n) => {
      previewIframe.contentWindow
        .takeScreenshot(elementNameInIframe, large ? 2 : 1.5)
        .then((imageURL) => {
          const col_n = n % Math.floor((pw - xi) / wid);
          x = xi + col_n * wid;
          const row_n = Math.floor(((n + 1) * wid) / (pw - xi));
          y = yi + row_n * hit;
          if (flip) {
            x = pw - wid - xi;
          }
          doc.addImage(imageURL, "PNG", x, y, wid, hit);
          console.log("add card " + elementNameInIframe + " to " + x + "," + y);
          if (++i === count) {
            doc.save(fileName);
          }
        });
    });
  };

  //startMain also handles clicks
  export const startMain = async () => {
    const status = await previewIframe.contentWindow.startMain();
    if (status === 1) {
      const specialRulesSectionElement =
        previewIframe.contentDocument.getElementsByTagName("special-rules-container")[0];
      specialRulesSectionElement.addEventListener("click", clickFunction());

      const growthSectionElement = previewIframe.contentDocument.getElementsByTagName("growth")[0];
      growthSectionElement.addEventListener("click", clickFunction());

      const presenceSectionElement =
        previewIframe.contentDocument.getElementsByTagName("presence-tracks")[0];
      presenceSectionElement.addEventListener("click", clickFunction());

      const innatePowersSectionElement =
        previewIframe.contentDocument.getElementsByTagName("innate-powers")[0];
      innatePowersSectionElement.addEventListener("click", clickFunction());

      const boardElement = previewIframe.contentDocument.getElementsByTagName("board")[0];
      boardElement.addEventListener("click", clickFunction());
    }
    if (status === 2) {
      const names = Array.from(previewIframe.contentDocument.getElementsByTagName("name"));
      console.log(names);
      names.forEach((name) => {
        name.addEventListener("click", clickFunction());
      });

      const cards = Array.from(previewIframe.contentDocument.getElementsByTagName("card"));
      console.log(cards);
      cards.forEach((card) => {
        card.addEventListener("click", clickFunction());
      });
    }
    if (status === 3) {
      const aspectEffectsElement =
        previewIframe.contentDocument.getElementsByTagName("aspect-container")[0];
      aspectEffectsElement.addEventListener("click", clickFunction());

      const aspectSubtextElement =
        previewIframe.contentDocument.getElementsByTagName("aspect-name")[0];
      aspectSubtextElement.addEventListener("click", clickFunction());

      const aspectNameElement =
        previewIframe.contentDocument.getElementsByTagName("aspect-subtext")[0];
      aspectNameElement.addEventListener("click", clickFunction());
    }
    if (status === 4) {
      const adversaryLevelsEl =
        previewIframe.contentDocument.getElementsByTagName("ADVERSARY-LEVELS")[0];
      adversaryLevelsEl.addEventListener("click", clickFunction());

      const adversaryTopInfoEl = previewIframe.contentDocument.getElementsByTagName("TOP-INFO")[0];
      adversaryTopInfoEl.addEventListener("click", clickFunction());

      const adversaryTitleEl =
        previewIframe.contentDocument.getElementsByTagName("ADVERSARY-TITLE")[0];
      adversaryTitleEl.addEventListener("click", clickFunction());
    }
  };

  export const writeGrowthAction = (action) => {
    return previewIframe.contentWindow.writeGrowthAction(action);
  };

  export const toggleSize = () => {
    large = !large;
    if (large) {
      const scrollAmount = getComputedStyle(wrapper).getPropertyValue("--scroll-amount");
      tick().then(() => window.scrollBy(0, scrollAmount));
    }
  };

  /** Holds a promise that will fire when the frame has finished loading.
   *
   *  This should only be used by updateSrc.
   */
  let loaded;
  /**
   * Update frame srcdoc if necessary, and return a promise that resolves
   * when the frame has finished loading.
   */
  function updateSrc() {
    if (previewIframe.srcdoc === previewTemplate.innerHTML) {
      return loaded;
    } else {
      loaded = waitForEvent(previewIframe, "load");
      previewIframe.srcdoc = previewTemplate.innerHTML;
      return loaded;
    }
  }
  onMount(updateSrc);

  installHotReloadEvent();
</script>

<div {id} class={"preview-wrap " + classList} class:large bind:this={wrapper}>
  <template bind:this={previewTemplate}>
    <html lang="en">
      <head>
        <base href={browser ? new URL(baseURI, document.baseURI) : baseURI} />
        <script type="module" src={takeScreenshotURL}></script>
        <slot name="head" />
      </head>
      <body />
    </html>
  </template>
  <iframe bind:this={previewIframe} class="preview-frame" id="preview-iframe" title="Preview" />
</div>
