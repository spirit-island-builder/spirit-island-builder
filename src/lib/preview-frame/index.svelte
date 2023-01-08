<script>
  export let id;
  export let baseURI = "/";

  import { tick, onMount } from "svelte";
  import { browser } from "$app/environment";

  import { downloadFile } from "../../routes/lib.js";

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
</script>

<div {id} class="preview-wrap" class:large bind:this={wrapper}>
  <template bind:this={previewTemplate}>
    <html lang="en">
      <head>
        <base href={browser ? new URL(baseURI, document.baseURI) : baseURI} />
        <slot name="head" />
      </head>
      <body />
    </html>
  </template>
  <iframe bind:this={previewIframe} class="preview-frame" id="preview-iframe" title="Preview" />
</div>
