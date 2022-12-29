<svelte:options accessors={false} />

<script>
  export let id;
  export let src;

  import { tick } from "svelte";

  import { downloadFile } from "../routes/lib.js";

  let frame;
  let wrapper;
  let large = false;

  export const copyHTMLFrom = (sourceDocument, headFragment) => {
    frame.contentDocument.head.replaceWith(sourceDocument.head.cloneNode(true));
    if (headFragment) {
      frame.contentDocument.head.append(headFragment);
    }
    frame.contentDocument.body.replaceWith(sourceDocument.body.cloneNode(true));
  };

  export const takeScreenshot = (fileNames, elementNamesInIframe) => {
    elementNamesInIframe.forEach((elementNameInIframe, index) => {
      frame.contentWindow
        .takeScreenshot(elementNameInIframe)
        .then((imageURL) => downloadFile(imageURL, fileNames[index]));
    });
  };

  export const startMain = () => {
    frame.contentWindow.startMain();
  };

  export const toggleSize = () => {
    large = !large;
    if (large) {
      const scrollAmount = getComputedStyle(wrapper).getPropertyValue("--scroll-amount");
      tick().then(() => window.scrollBy(0, scrollAmount));
    }
  };
</script>

<div {id} class="preview-wrap" class:large bind:this={wrapper}>
  <iframe {src} bind:this={frame} class="preview-frame" title="Preview" />
</div>
