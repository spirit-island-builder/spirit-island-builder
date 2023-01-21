<script>
  export let id;
  export let baseURI = "/";

  export let component;
  export let props;

  import { tick, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { installHotReloadEvent, onHotReload } from "$lib/hmr-helper.js";

  // Using a query string of `?worker&url` gives a URL from which we can
  // pass to `<script type="module">` tag, which we can inject into the
  // preview frame.
  import takeScreenshotURL from "./take-screenshot?worker&url";

  import { downloadFile } from "$lib/download";

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
    (previewIframe.contentWindow.running || Promise.resolve()).then(updateDiff);
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
    if (
      previewIframe.srcdoc === previewTemplate.innerHTML &&
      (!componentFrame || componentFrame.srcdoc === previewIframe.innerHTML)
    ) {
      return loaded;
    } else {
      loaded = Promise.all([
        waitForEvent(previewIframe, "load"),
        componentFrame ? waitForEvent(componentFrame, "load") : Promise.resolve(),
      ]);
      previewIframe.srcdoc = previewTemplate.innerHTML;
      if (componentFrame) {
        componentFrame.srcdoc = previewTemplate.innerHTML;
      }
      return loaded;
    }
  }
  onMount(updateSrc);

  installHotReloadEvent();

  let instance;
  let componentFrame;
  $: if (instance) {
    instance.$set(props);
    tick().then(updateDiff);
  }
  $: if (component && componentFrame) {
    loadHandler();
  }

  const loadHandler = async () => {
    if (!componentFrame) {
      return;
    }
    await updateSrc();
    if (instance) {
      instance.$destroy();
    }
    instance = new component({ target: componentFrame.contentDocument.body, props });
  };
  onHotReload(loadHandler);

  import { createPatch } from "diff";
  import format from "diffable-html";
  import { downloadData } from "$lib/download";

  const whitespaceRE = /[ \n]+/g;
  const dataURLRE = /data:image\/png;base64,([a-zA-Z0-9+/=]+)/g;
  const updateDiff = () => {
    let s = new XMLSerializer();
    let oldBody = previewIframe.contentDocument.body.cloneNode(true);
    for (const node of oldBody.querySelectorAll("[id]")) {
      node.removeAttribute("id");
    }
    let newBody = componentFrame.contentDocument.body.cloneNode(true);
    for (const node of newBody.querySelectorAll("[title]")) {
      node.removeAttribute("title");
    }
    for (const node of newBody.querySelectorAll("[id]")) {
      node.removeAttribute("id");
    }
    newBody.normalize();
    const patch = createPatch(
      "html",
      format(oldBody.innerHTML.replace(dataURLRE, "data:...")),
      format(newBody.innerHTML.replace(dataURLRE, "data:..."))
    );
    downloadData.set({ fileContent: patch, fileName: "html.diff" });
  };

  let show = "both";
</script>

{#if component}
  <div class="field has-addons mb-2">
    {#each ["both", "new", "old"] as state}
      <p class="control">
        <button
          class="button"
          class:is-info={show === state}
          on:click={() => (show = state)}
          style:text-transform="capitalize">{state}</button>
      </p>
    {/each}
  </div>
{/if}
<div {id} class="preview-wrap" class:large style:position="relative" bind:this={wrapper}>
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
  {#if component}
    <iframe
      bind:this={componentFrame}
      class="preview-frame"
      title="Preview"
      style:opacity={show === "both" ? "50%" : null}
      style:display={show === "old" ? "none" : null} />
  {/if}
</div>

<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
