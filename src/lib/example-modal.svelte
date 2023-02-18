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
          {#if example.imageURL}
            <button
              class="button"
              style="width: 95%; background-image: url('{example.imageURL}'); background-repeat: no-repeat; background-position: left center; background-size: contain; height: 60px;"
              on:click={() => load(example)} />
          {:else}
            <button class="button" on:click={() => load(example)}>{example.name}</button>
          {/if}
        {/each}
      {/each}
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={close} />
</div>
