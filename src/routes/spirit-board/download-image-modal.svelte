<script>
  /** Called with the layers to download, in order: any of "full",
   *  "background", "foreground". */
  export let onDownload;

  const options = [
    {
      value: "full",
      label: "Whole board",
      help: "The board exactly as shown in the preview. One PNG.",
      layers: ["full"],
    },
    {
      value: "layers",
      label: "Background and foreground layers",
      help:
        "Two PNGs that stack back into the whole board: the art (frame, spirit image, " +
        "panels, banners) and, on a transparent background, everything drawn on top of it. " +
        "Put your own effects between them.",
      layers: ["background", "foreground"],
    },
    {
      value: "background",
      label: "Background only",
      help: "Just the art: frame, spirit image, name banner, panel parchments, track banners.",
      layers: ["background"],
    },
    {
      value: "foreground",
      label: "Foreground only",
      help: "Just the content: text, icons, presence nodes, innate powers, on a transparent background.",
      layers: ["foreground"],
    },
  ];

  let modal;
  let choice = "full";

  export const open = () => {
    // Always start from the plain download; the layer split is the special case.
    choice = "full";
    modal.showModal();
  };

  const close = () => {
    modal.close();
  };

  const download = () => {
    close();
    onDownload(options.find((option) => option.value === choice).layers);
  };

  const clickBackdrop = (event) => {
    if (event.target === modal) {
      close();
    }
  };
</script>

<dialog bind:this={modal} on:click={clickBackdrop}>
  <div class="box">
    <h1 class="mb-3"><b>Download Image</b></h1>

    <p class="mb-1">What to download</p>
    {#each options as option}
      <div class="field mb-2">
        <label class="radio">
          <input type="radio" bind:group={choice} value={option.value} />
          <b>{option.label}</b>
        </label>
        <p class="help">{option.help}</p>
      </div>
    {/each}

    <div class="mt-4">
      <button class="button is-success mr-1" on:click={download}>Download</button>
      <button class="button" on:click={close}>Cancel</button>
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={close} />
</dialog>

<style>
  .box {
    overflow-y: auto;
    max-height: calc(100vh - 40px);
    max-width: 50ch;
  }
  dialog {
    /* reset */
    background-color: transparent;
    width: max-content;
    max-width: calc(100vw - 32px);
    height: max-content;
    overflow: hidden;
    border: 0;
    padding: 0;
  }
  dialog::backdrop {
    background-color: rgba(10, 10, 10, 0.86);
  }
</style>
