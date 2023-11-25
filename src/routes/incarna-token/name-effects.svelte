<script>
  import Section from "$lib/section.svelte";
  import * as Lib from "../lib";
  // import {HsvPicker} from 'svelte-color-picker';

  export let incarnaToken;

  function toggleEmpower(val) {
    incarnaToken.incarna.empowered = val;
    incarnaToken = incarnaToken;
    document.getElementById("updateButton").click();
  }

  function toggleEmpowerToken() {
    incarnaToken.incarna.empoweredOnlyToken = !incarnaToken.incarna.empoweredOnlyToken;
    document.getElementById("updateButton").click();
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
      <label class="label incarna-label" for={`incarnaTokenToken`}>Name: </label>
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
      <label class="label incarna-label" for={`incarnaTokenToken`}>Incarna: </label>
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
      <label class="label incarna-label" for={`incarnaTokenToken`}>Token: </label>
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
      {#if incarnaToken.incarna.empowered === true}
        <button
          class:is-light={incarnaToken.incarna.empoweredOnlyToken}
          class="button is-warning is-light mb-0"
          on:click={() => toggleEmpowerToken()}>Both</button>
      {/if}
    </div>
    <div class="field is-flex is-align-items-center is-small mb-0">
      <label class="label incarna-label" for="head">Color: </label>
      <div class="input-color-container">
        <input
          type="color"
          class="input-color"
          id="head"
          on:change={() => document.getElementById("updateButton").click()}
          bind:value={incarnaToken.incarna.color} />
      </div>
    </div>
    <div>
      {#if incarnaToken.incarna.empowered === true}
        <button class="button is-warning mb-0" on:click={toggleEmpower(true, incarnaToken)}
          >Empowered</button>
        <button
          class="button is-success is-light mb-0"
          on:click={toggleEmpower(false, incarnaToken)}>Unempowered</button>
      {:else}
        <button class="button is-warning is-light mb-0" on:click={toggleEmpower(true, incarnaToken)}
          >Empowered</button>
        <button class="button is-success mb-0" on:click={toggleEmpower(false, incarnaToken)}
          >Unempowered</button>
      {/if}
    </div>
  </div>
</Section>

<style>
  .input-color {
    position: absolute;
    right: -8px;
    top: -8px;
    width: 220px;
    height: 56px;
    border: none;
  }
  .input-color-container {
    position: relative;
    overflow: hidden;
    width: 205px;
    height: 40px;
    border: solid 2px #ddd;
    border-radius: 4px;
  }
  .incarna-label {
    width: 65px;
  }
</style>
