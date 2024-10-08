<script>
  import { addOutline, removeOutline } from "ionicons/icons";
  export let isVisible = false;
  export let title;
</script>

<section>
  <h3 class="subtitle is-6 mb-0 is-unselectable">
    <span title={`${isVisible ? "Minimize" : "Expand"}`}>
      <button
        aria-expanded={isVisible}
        on:click={() => {
          isVisible = !isVisible;
        }}
        class="side-menu is-flex is-justify-content-space-between is-align-items-center pl-1 mt-1">
        <span>{title}</span>
        {#if isVisible}
          <ion-icon icon={removeOutline} aria-hidden="true" />
        {:else}
          <ion-icon icon={addOutline} aria-hidden="true" />
        {/if}
      </button>
    </span>
  </h3>
  <div style:display={isVisible ? null : "none"} class="mt-1">
    <slot />
  </div>
</section>

<style>
</style>
