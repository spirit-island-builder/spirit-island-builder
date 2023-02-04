<script>
  export let title;
  export let banners;
  export let loadBanner;

  let modal;

  const load = (banner) => {
    loadBanner(banner).finally(() => {
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
      {#each banners as section}
        {#each section.banners as banner}
          <button class="button" on:click={() => load(banner)}>{banner.name}</button>
          <img src={banner.url} alt={banner.name} />
        {/each}
      {/each}
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={close} />
</div>
