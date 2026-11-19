<script>
  /** Called with (pageType, mode) when the user clicks Create PDF. */
  export let onPrint;
  /** Whether there are backs to print; without them only "fronts" is offered. */
  export let hasBacks = true;

  const PAPER_KEY = "print-modal-paper";

  const modes = [
    {
      value: "fronts",
      label: "Fronts only",
      help: "No duplex printer: print this first, then put the sheets back in for the backs.",
    },
    {
      value: "backs",
      label: "Backs only",
      help: "Print onto the back of the fronts you already printed.",
    },
    {
      value: "duplex",
      label: "Duplex (one PDF)",
      help: "Fronts and backs on alternating pages, for printers that print both sides.",
    },
  ];

  let modal;
  let pageType = "letter";
  let mode = "duplex";

  $: if (!hasBacks) mode = "fronts";

  export const open = () => {
    try {
      pageType = localStorage.getItem(PAPER_KEY) || pageType;
    } catch (e) {
      // Storage unavailable: keep the default.
    }
    modal.showModal();
  };

  const close = () => {
    modal.close();
  };

  const print = () => {
    try {
      localStorage.setItem(PAPER_KEY, pageType);
    } catch (e) {
      // Storage unavailable: nothing to remember.
    }
    close();
    onPrint(pageType, mode);
  };

  const clickBackdrop = (event) => {
    if (event.target === modal) {
      close();
    }
  };
</script>

<dialog bind:this={modal} on:click={clickBackdrop}>
  <div class="box">
    <h1 class="mb-3"><b>Create PDF</b></h1>

    <p class="mb-1">Paper size</p>
    <div class="field">
      <label class="radio mr-3">
        <input type="radio" bind:group={pageType} value="letter" /> Letter
      </label>
      <label class="radio">
        <input type="radio" bind:group={pageType} value="a4" /> A4
      </label>
    </div>

    <p class="mb-1">What to print</p>
    {#each modes as option}
      {@const disabled = !hasBacks && option.value !== "fronts"}
      <div class="field mb-2" class:unavailable={disabled}>
        <label class="radio">
          <input type="radio" bind:group={mode} value={option.value} {disabled} />
          <b>{option.label}</b>
        </label>
        <p class="help">{option.help}</p>
      </div>
    {/each}
    {#if !hasBacks}
      <p class="help mb-2"><em>Add a card back image to print backs.</em></p>
    {/if}

    <div class="mt-4">
      <button class="button is-success mr-1" on:click={print}>Create PDF</button>
      <button class="button" on:click={close}>Cancel</button>
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={close} />
</dialog>

<style>
  /* Bulma's .radio and .help set their own colors, so fade the whole option. */
  .unavailable {
    opacity: 0.4;
  }
  .unavailable label {
    cursor: not-allowed;
  }
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
