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

  // Guides for printing fronts and backs onto the two sides of one sheet.
  // Everything is centered on the page, so the two sides line up no matter
  // which edge the sheet is flipped on, on both Letter and A4.
  const DUPLEX_GUIDE = {
    front: [
      "SIDE 1 of 2 (Play side). Print at Actual Size / 100% - turn off 'Fit to page'.",
      "Then put this sheet back in the printer and print the Lore side PDF on the back.",
      "Flip it like turning a book page, so the TOP edge stays on the same side.",
    ],
    back: [
      "SIDE 2 of 2 (Lore side). Print on the back of the Play side, at Actual Size / 100%.",
      "The TOP marks on both sides should be on the same edge of the sheet.",
      "Not sure how your printer feeds? Pencil an X in one corner of a test sheet and see where it lands.",
    ],
  };

  // Keyed by print mode ("duplex" | "fronts" | "backs"), then by side.
  const CARD_GUIDE = {
    duplex: {
      front: (sheet, sheets) => [
        `FRONTS (sheet ${sheet} of ${sheets}). Print at Actual Size / 100% - turn off 'Fit to page'.`,
        "Print the whole PDF double-sided with 'Flip on short edge', so each backs page lands behind its fronts.",
        "No duplex printer? Create the 'Fronts only' and 'Backs only' PDFs instead.",
      ],
      back: (sheet, sheets) => [
        `BACKS (sheet ${sheet} of ${sheets}). These print on the back of the fronts page before this one.`,
        "The TOP marks on both sides should be on the same edge of the sheet.",
        "If the backs come out upside down, switch to 'Flip on long edge'.",
      ],
    },
    fronts: {
      front: (sheet, sheets) => [
        `PRINT THE FRONTS (sheet ${sheet} of ${sheets}). Print at Actual Size / 100% - turn off 'Fit to page'.`,
        "Then put the printed sheets back in the printer and print the 'Backs only' PDF on the other side.",
        "Flip them like turning a book page, so the TOP edge stays on the same side.",
      ],
    },
    backs: {
      back: (sheet, sheets) => [
        `PRINT THE BACKS (sheet ${sheet} of ${sheets}). Print on the back of the fronts, at Actual Size / 100%.`,
        "The TOP marks on both sides should be on the same edge. Back sheet 1 goes on front sheet 1, and so on.",
        "Not sure how your printer feeds? Pencil an X in one corner of a test sheet and see where it lands.",
      ],
    },
  };

  /** Crop marks around a cols x rows grid of wid x hit cells at (x, y), plus a
   *  TOP marker and guide text in the top margin. Holding the sheet to a light
   *  shows how well the two sides lined up. */
  const drawPrintGuide = (doc, lines, x, y, wid, hit, cols = 1, rows = 1) => {
    const pw = doc.getPageWidth();
    const gw = cols * wid;
    const gh = rows * hit;
    // A card grid leaves too little top margin for both the guide text and
    // crop marks, so there the column marks only go below the grid.
    const roomy = y > 0.95;
    const gap = roomy ? 0.06 : 0.04;
    const len = roomy ? 0.25 : 0.15;

    doc.setDrawColor(150);
    doc.setFillColor(150);
    doc.setTextColor(110);
    doc.setLineWidth(0.01);

    for (let c = 0; c <= cols; c++) {
      const cx = x + c * wid;
      if (roomy) doc.line(cx, y - gap, cx, y - gap - len);
      doc.line(cx, y + gh + gap, cx, y + gh + gap + len);
    }
    for (let r = 0; r <= rows; r++) {
      const cy = y + r * hit;
      doc.line(x - gap, cy, x - gap - len, cy);
      doc.line(x + gw + gap, cy, x + gw + gap + len, cy);
    }

    if (!lines.length) return;
    const tx = pw / 2;
    if (roomy) {
      // TOP marker centered above the text, pointing at the top edge.
      const ty = 0.2;
      doc.triangle(tx - 0.09, ty + 0.12, tx + 0.09, ty + 0.12, tx, ty, "F");
      doc.setFontSize(8);
      doc.text("TOP", tx, ty + 0.25, { align: "center" });
      doc.setFontSize(7.5);
      lines.forEach((line, n) => {
        doc.text(line, tx, ty + 0.42 + n * 0.13, { align: "center" });
      });
    } else {
      // Compact: TOP marker to the left of the text block.
      doc.setFontSize(7);
      const ty = 0.3;
      const textW = Math.max(...lines.map((line) => doc.getTextWidth(line)));
      const mx = tx - textW / 2 - 0.25;
      doc.triangle(mx - 0.08, ty + 0.06, mx + 0.08, ty + 0.06, mx, ty - 0.05, "F");
      doc.text("TOP", mx, ty + 0.18, { align: "center" });
      lines.forEach((line, n) => {
        doc.text(line, tx, ty + n * 0.12, { align: "center" });
      });
    }
  };

  /** Power cards. mode "duplex": each sheet of fronts is followed by its sheet
   *  of backs; "fronts" / "backs": just that side, for printers that can't
   *  print both. Every back is mirrored left-right so it lands behind its own
   *  front. */
  export const getCardSheetPDF = async (
    fileName,
    frontElements,
    backElement,
    pageType,
    mode = "duplex",
    wid = 2.48,
    hit = 3.465
  ) => {
    showToast(`💾 Saving file locally`);
    const doc = new jsPDF({ orientation: "landscape", unit: "in", format: pageType });
    const pw = doc.getPageWidth();
    const ph = doc.getPageHeight();
    const margin = 0.5;
    const cols = Math.floor((pw - 2 * margin) / wid);
    const rows = Math.floor((ph - 2 * margin) / hit);
    const perSheet = cols * rows;
    const sheets = Math.ceil(frontElements.length / perSheet);
    const x0 = (pw - cols * wid) / 2;
    const y0 = (ph - rows * hit) / 2;

    const scale = large ? 2 : 1.5;
    const takeShot = (el) => previewIframe.contentWindow.takeScreenshot(el, scale);
    if (!backElement) mode = "fronts";
    const printFronts = mode !== "backs";
    const printBacks = mode !== "fronts";
    const [backImage, ...frontImages] = await Promise.all([
      printBacks ? takeShot(backElement) : null,
      ...(printFronts ? frontElements.map(takeShot) : []),
    ]);

    let firstPage = true;
    const nextPage = () => {
      if (!firstPage) doc.addPage();
      firstPage = false;
    };

    for (let s = 0; s < sheets; s++) {
      const onSheet = frontElements.slice(s * perSheet, (s + 1) * perSheet);

      if (printFronts) {
        nextPage();
        // Without backs there's nothing to line up, so just the crop marks.
        const guide = backElement ? CARD_GUIDE[mode].front(s + 1, sheets) : [];
        drawPrintGuide(doc, guide, x0, y0, wid, hit, cols, rows);
        onSheet.forEach((_, n) => {
          const col = n % cols;
          const row = Math.floor(n / cols);
          const image = frontImages[s * perSheet + n];
          doc.addImage(image, "PNG", x0 + col * wid, y0 + row * hit, wid, hit);
        });
      }

      if (printBacks) {
        nextPage();
        const guide = CARD_GUIDE[mode].back(s + 1, sheets);
        drawPrintGuide(doc, guide, x0, y0, wid, hit, cols, rows);
        onSheet.forEach((_, n) => {
          const col = cols - 1 - (n % cols);
          const row = Math.floor(n / cols);
          // Same alias each time, so the back image is embedded only once.
          doc.addImage(backImage, "PNG", x0 + col * wid, y0 + row * hit, wid, hit, "cardBack");
        });
      }
    }
    doc.save(fileName);
  };

  export const getPDF = (
    fileName,
    elementNamesInIframe,
    pageType,
    wid = 9,
    hit = 6,
    duplexSide = null, // "front" | "back": center the board and add a back-to-back print guide
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

    if (duplexSide) {
      drawPrintGuide(doc, DUPLEX_GUIDE[duplexSide], (pw - wid) / 2, (ph - hit) / 2, wid, hit);
    }

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

          if (duplexSide) {
            x = (pw - wid) / 2;
            y = (ph - hit) / 2;
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
