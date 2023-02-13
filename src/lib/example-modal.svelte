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
    modal.classList.add("is-active");
  };

  const close = () => {
    modal.classList.remove("is-active");
  };
</script>

<div bind:this={modal} class="modal">
  <div class="modal-background" />
  <div class="modal-content">
    <div class="box">
      <h1><b>{title}</b></h1>
      <p><em>warning: will replace existing content</em></p>
      {#each examples as section}
        {#if section.title}
          <p>{section.title}:</p>
        {/if}
        {#each section.examples as example}
          <button class="button" on:click={() => load(example)}>{example.name}</button>
          {#if example.imageURL}
            <img src={example.imageURL} alt={example.name} />
          {/if}
        {/each}
      {/each}
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={close} />
</div>
