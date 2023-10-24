<script>
  import Section from "$lib/section.svelte";
  import * as Lib from "../lib";

  export let incarnaToken;

  function toggleEmpower(val) {
    incarnaToken.incarna.empowered = val;
    incarnaToken = incarnaToken;
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function nextNode(event) {
    Lib.nextNode(event);
  }
</script>

<Section title="Name & Effects" bind:isVisible={incarnaToken.incarna.isVisible}>
  <div class="field">
    <label class="label is-flex is-justify-content-space-between" for={`levelNameInput`}
      >Incarna Token Info
    </label>
    <div class="field is-flex is-small mb-0">
      <div class="control">
        <input
          id={`incarnaTokenName`}
          class="input"
          type="text"
          placeholder="Name"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={incarnaToken.incarna.name} />
      </div>
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="control">
        <input
          id={`incarnaTokenIcon`}
          class="input"
          type="text"
          placeholder="Incarna Icon"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={incarnaToken.incarna.icon} />
      </div>
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="control">
        <input
          id={`incarnaTokenToken`}
          class="input"
          type="text"
          placeholder="Token (ie. beasts or sacred-site, etc)"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={incarnaToken.incarna.token} />
      </div>
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="control">
        <input
          id={`incarnaTokenColor`}
          class="input"
          type="text"
          placeholder="Color"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={incarnaToken.incarna.color} />
      </div>
    </div>
    <div>
      {#if incarnaToken.incarna.empowered === true}
        <button class="button is-success mb-0" on:click={toggleEmpower(true, incarnaToken)}
          >Empowered</button>
        <button
          class="button is-warning is-light mb-0"
          on:click={toggleEmpower(false, incarnaToken)}>Unempowered</button>
      {:else}
        <button class="button is-success is-light mb-0" on:click={toggleEmpower(true, incarnaToken)}
          >Empowered</button>
        <button class="button is-warning mb-0" on:click={toggleEmpower(false, incarnaToken)}
          >Unempowered</button>
      {/if}
    </div>
  </div>
</Section>
