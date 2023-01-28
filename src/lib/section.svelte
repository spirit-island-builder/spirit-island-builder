<script>
  import { chevronDownOutline, chevronUpOutline } from "ionicons/icons";
  export let isVisible = false;
  export let title;
</script>

<section>
  <h3 class="subtitle is-6 mb-0 is-unselectable">
    <button
      aria-expanded={isVisible}
      on:click={() => {
        isVisible = !isVisible;
      }}
      class="is-flex is-justify-content-space-between is-align-items-center pl-1 mt-1">
      <span>{title}</span>
      {#if isVisible}
        <ion-icon icon={chevronDownOutline} aria-hidden="true" />
      {:else}
        <ion-icon icon={chevronUpOutline} aria-hidden="true" />
      {/if}
    </button>
  </h3>
  <div style:display={isVisible ? null : "none"} class="mt-1">
    <slot />
  </div>
</section>

<style>
  button {
    /* reset */
    padding: unset;
    border: unset;
    font: unset;
    color: unset;
    background: unset;
    /* sizing */
    width: 100%;
    /* color and highlight */
    background-color: #eff1fa;
    border-inline-start: 0.25rem solid #bfc0c5;
  }
  button:hover {
    background-color: #bfc0c575;
  }
</style>
