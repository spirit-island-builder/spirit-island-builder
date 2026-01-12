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
  import { showToast } from "$lib/alert.js";

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
    let ph = doc.getPageHeight();
    let count = elementNamesInIframe.length;
    console.log(`${pw},${ph}`);

    //figure out number of pages and rows per page
    let rowperpage = Math.floor((ph - 2 * yi) / hit);
    let colperpage = Math.floor((pw - 2 * xi) / wid);
    let cardperpage = rowperpage * colperpage;
    let numpages = Math.ceil(elementNamesInIframe.length / cardperpage);
    for (let i = 1; i < numpages; i++) {
      doc.addPage();
    }
    doc.setPage(1);

    elementNamesInIframe.forEach((elementNameInIframe, n) => {
      previewIframe.contentWindow
        .takeScreenshot(elementNameInIframe, large ? 2 : 1.5)
        .then((imageURL) => {
          //page focus
          let pagefocus = Math.ceil((n + 1) / cardperpage);
          doc.setPage(pagefocus);
          console.log(`Focusing page ${pagefocus} for ${elementNameInIframe}, n=${n}`);

          // x & y location
          const col_n = n % Math.floor((pw - 2 * xi) / wid);
          x = xi + col_n * wid;

          const row_n = Math.floor(n / colperpage) % rowperpage;
          y = yi + row_n * hit;

          if (flip) {
            x = pw - wid - 2 * xi;
          }

          doc.addImage(imageURL, "PNG", x, y, wid, hit);
          console.log("add card " + elementNameInIframe + " to " + x + "," + y);

          if (++i === count) {
            doc.save(fileName);
          }
        });
    });
    showToast(`💾 Saving file locally`);
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
      const aspectEffectsElement = Array.from(
        previewIframe.contentDocument.getElementsByTagName("aspect-background")
      );
      aspectEffectsElement.forEach((effectElement) => {
        effectElement.addEventListener("click", clickFunction());
      });

      const aspectSubtextElement = Array.from(
        previewIframe.contentDocument.getElementsByTagName("aspect-name")
      );
      aspectSubtextElement.forEach((subtextElement) => {
        subtextElement.addEventListener("click", clickFunction());
      });

      const aspectNameElement = Array.from(
        previewIframe.contentDocument.getElementsByTagName("aspect-subtext")
      );
      aspectNameElement.forEach((nameElement) => {
        nameElement.addEventListener("click", clickFunction());
      });

      const aspectBackElement =
        previewIframe.contentDocument.getElementsByTagName("aspect-back-overlay")[0];
      if (aspectBackElement) {
        aspectBackElement.addEventListener("click", clickFunction());
      }
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
