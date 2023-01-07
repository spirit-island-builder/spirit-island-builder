<svelte:options accessors={false} />

<script>
  export let id;
  export let src;

  import { tick } from "svelte";

  import { downloadFile } from "../routes/lib.js";

  let previewIframe;
  let wrapper;
  let large = false;

  export const copyHTMLFrom = (sourceDocument, headFragment) => {
    previewIframe.contentDocument.head.replaceWith(sourceDocument.head.cloneNode(true));
    if (headFragment) {
      previewIframe.contentDocument.head.append(headFragment);
    }
    previewIframe.contentDocument.body.replaceWith(sourceDocument.body.cloneNode(true));
  };

  export const takeScreenshot = (fileNames, elementNamesInIframe) => {
    elementNamesInIframe.forEach((elementNameInIframe, index) => {
      previewIframe.contentWindow
        .takeScreenshot(elementNameInIframe)
        .then((imageURL) => downloadFile(imageURL, fileNames[index]));
    });
  };

  export const startMain = () => {
    previewIframe.contentWindow.startMain();
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
</script>

<div {id} class="preview-wrap" class:large bind:this={wrapper}>
  <iframe {src} bind:this={previewIframe} class="preview-frame" id="preview-iframe" title="Preview" />
</div>
