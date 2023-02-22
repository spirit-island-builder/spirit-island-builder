<script>
  import { instructionsURL } from "./index.svelte";

  export let anchor;
  let className = null;
  export { className as class };
</script>

<a
  class={className}
  href="{instructionsURL}#{anchor}"
  rel="noreferrer"
  target="_blank">Instructions</a>
