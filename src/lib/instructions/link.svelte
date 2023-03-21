<script>
  import { instructions, instructionsURL } from "./index.svelte";

  export let anchor;
  let className = null;
  export { className as class };

  function isEventModified(event) {
    return event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  }

  function open(event) {
    // If the event is modified, we let the normal action take place.
    // This is likely opening the link in a new tab.
    if (isEventModified(event)) {
      return;
    }
    instructions.open(anchor);
    event.preventDefault();
  }
</script>

<a
  class={className}
  href="{instructionsURL}#{anchor}"
  on:click={open}
  rel="noreferrer"
  target="_blank">Instructions</a>
