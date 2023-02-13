<script>
  export let title;
  export let examples;
  export let loadExample;

  let modal;

  const load = (example) => {
    loadExample(example).finally(() => {
      close();
    });
  };

  export const open = () => {
    modal.showModal();
  };

  const close = () => {
    modal.close();
  };

  const clickBackdrop = (event) => {
    if (event.target === modal) {
      close();
    }
  };
</script>

<dialog bind:this={modal} style:overflow="none" on:click={clickBackdrop}>
  <div class="box">
    <h1><b>{title}</b></h1>
    <p><em>warning: will replace existing content</em></p>
    {#each examples as section}
      <p>{section.title}:</p>
      {#each section.examples as example}
        <button class="button" on:click={() => load(example)}>{example.name}</button>
      {/each}
    {/each}
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={close} />
</dialog>

<style>
  .box {
    overflow-y: auto;
    max-height: calc(100vh - 40px);
    max-width: 65ch;
  }
  dialog {
    /* reset */
    background-color: transparent;
    width: max-content;
    height: max-content;
    overflow: hidden;
    border: 0;
    padding: 0;
  }
  dialog::backdrop {
    background-color: rgba(10, 10, 10, 0.86);
  }
</style>
