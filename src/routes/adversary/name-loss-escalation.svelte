<script>
  // import * as Lib from "./lib";
  // Do we need to define Lib for each, or should we move it around?
  
  export let adversary;

  export let showOrHideSection;
  
  
  function handleImageFileInput(event) {
    const file = event.target.files.item(0);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const imageURL = data.target.result;
        adversary.nameLossEscalation.flagImg = imageURL;

      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsDataURL(file);
    }
  }
  
</script>

<h6
  on:click={showOrHideSection}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light is-unselectable pl-1"
  id="nameLossEscalation">
  Name, Loss Condition, and Escalation
  <span on:click={showOrHideSection}>
    {#if adversary.previewBoard.isVisible}
      <ion-icon id="nameLossEscalation" on:click={showOrHideSection} name="chevron-down-outline" />
    {:else}
      <ion-icon id="nameLossEscalation" on:click={showOrHideSection} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
{#if adversary.nameLossEscalation.isVisible}
  <!-- The (rule.id) makes this a keyed each block. See https://svelte.dev/tutorial/keyed-each-blocks -->
  <article class="message is-small mb-1">
    <div class="message-body p-1">
      <span><a href="https://github.com/neubee/spirit-island-builder/blob/feature/start-of-tabbed-interface/docs/instructions.md#adversary-name" target="_blank">Instructions</a></span>
    </div>
  </article>
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for="adversaryNameInput"
        >Adversary Name & Diffuclty
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:80%">
          <input
            id="adversaryNameInput"
            class="input"
            type="text"
            placeholder="Name"
            tabindex="1"
            bind:value={adversary.nameLossEscalation.name} />
        </div>
        <div class="control" style="width:20%; min-width:2rem;">
          <input
            id="baseDifficulty"
            class="input"
            type="text"
            placeholder="Difficulty"
            tabindex="1"
            bind:value={adversary.nameLossEscalation.baseDif} />
        </div>
      </div>
      <!-- FLAG ART -->
      <div class="field has-addons is-horizontal is-justify-content-left mb-0">
        <div class="field-label is-small">
          <label class="label" for="adversaryFlagArt">Flag Art</label>
        </div>
        <div class="control">
          <input
            accept="image/png, image/jpeg"
            on:change={handleImageFileInput}
            id="adversaryFlagArt"
            name="adversaryFlagArt"
            type="file"
            class="input" />
          {#if adversary.nameLossEscalation.flagImg}
            <img id="adversaryFlagArtImage" src={adversary.nameLossEscalation.flagImg} alt="flag art" />
          {/if}
        </div>
      </div>
    </div>
    <!-- Loss Condition -->
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for="LossConditionInput"
        >Loss Condition
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:100%">
          <input
            id="LossConditionInput"
            class="input"
            type="text"
            placeholder="Name"
            tabindex="1"
            bind:value={adversary.nameLossEscalation.lossCondition.name} />
        </div>
      </div>
      <div class="control">
        <textarea
          id="lossConditionEffectInput"
          class="textarea is-small"
          type="text"
          placeholder="Effect"
          tabindex="1"
          bind:value={adversary.nameLossEscalation.lossCondition.effect} />
      </div>
    </div>
    <!-- Escalation -->
    <div class="field">
      <label class="label is-flex is-justify-content-space-between" for="EscalationInput"
        >Escalation
      </label>
      <div class="field is-flex is-small mb-0">
        <div class="control" style="width:100%">
          <input
            id="EscalationInput"
            class="input"
            type="text"
            placeholder="Name"
            tabindex="1"
            bind:value={adversary.nameLossEscalation.escalation.name} />
        </div>
      </div>
      <div class="control">
        <textarea
          id="lossConditionEffectInput"
          class="textarea is-small"
          type="text"
          placeholder="Effect"
          tabindex="1"
          bind:value={adversary.nameLossEscalation.escalation.effect} />
      </div>
    </div>
{/if}
