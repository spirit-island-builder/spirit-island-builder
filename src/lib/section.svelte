<script>
  export let isVisible = false;
  export let title;
</script>

<div>
  <h6 class="subtitle is-6 has-background-link-light is-unselectable pl-1">
    <button
      on:click={() => {
        isVisible = !isVisible;
      }}
      class="is-flex is-justify-content-space-between">
      <span>{title}</span>
      {#if isVisible}
        <ion-icon name="chevron-down-outline" />
      {:else}
        <ion-icon name="chevron-up-outline" />
      {/if}
    </button>
  </h6>
  <div style:display={isVisible ? null : "none"}>
    <slot />
  </div>
</div>

<style>
  button {
    /* reset */
    padding: unset;
    border: unset;
    outline: unset;
    font: unset;
    color: unset;
    background: unset;
    /* sizing */
    width: 100%;
  }
</style>
