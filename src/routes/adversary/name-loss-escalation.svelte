<script>
  export let adversary;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
  import InstructionsLink from "$lib/instructions/link.svelte";
  import * as Lib from "../lib";

  function nextNode(event) {
    Lib.nextNode(event);
  }

  function selectNode(event) {
    let nodeID = event.target.id;
    document.getElementById(nodeID).select();
  }

  function toggleLossToSpecialRule() {
    adversary.nameLossEscalation.lossCondition.alternate =
      !adversary.nameLossEscalation.lossCondition.alternate;
    adversary = adversary;
    document.getElementById("updateButton").click();
  }
</script>

<Section
  title="Name, Loss Condition, and Escalation"
  bind:isVisible={adversary.nameLossEscalation.isVisible}>
  <div class="mb-1 p-1 note">
    <InstructionsLink anchor="adversary-name" />
  </div>
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
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={adversary.nameLossEscalation.name} />
      </div>
      <div class="control" style="width:20%; min-width:2rem;">
        <input
          id="baseDifficulty"
          class="input"
          type="text"
          placeholder="Difficulty"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={adversary.nameLossEscalation.baseDif} />
      </div>
    </div>
  </div>
  <!-- Loss Condition -->
  <div class="field">
    <div class="field is-flex is-justify-content-space-between mb-0">
      {#if !adversary.nameLossEscalation.lossCondition.alternate}
        <label class="label is-flex is-justify-content-space-between" for="LossConditionInput"
          >Additional Loss Condition
        </label>
        <button class="button is-small" on:click={toggleLossToSpecialRule}
          >Switch to Special Rule</button>
      {:else}
        <label class="label is-flex is-justify-content-space-between" for="LossConditionInput"
          >Special Rule
        </label>
        <button class="button is-small" on:click={toggleLossToSpecialRule}
          >Switch to Loss Condition</button>
      {/if}
    </div>
    <div class="field is-flex is-small mb-0">
      <div class="control" style="width:100%">
        <input
          id="LossConditionInput"
          class="input"
          type="text"
          placeholder="Name"
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={adversary.nameLossEscalation.lossCondition.name} />
      </div>
    </div>
    <div class="control">
      <AutoComplete
        id="lossConditionEffectInput"
        elementType="textarea"
        placeholder="Effect"
        classNames="is-small"
        validAutoCompleteValues={iconValuesSorted}
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
          on:keyup={nextNode}
          on:focus={selectNode}
          bind:value={adversary.nameLossEscalation.escalation.name} />
      </div>
    </div>
    <div class="control">
      <AutoComplete
        id="escalationEffectInput"
        elementType="textarea"
        classNames="is-small"
        placeholder="Effect"
        validAutoCompleteValues={iconValuesSorted}
        bind:value={adversary.nameLossEscalation.escalation.effect} />
    </div>
  </div>
  <div class="field">
    <!-- FLAG ART -->
    <ImageInput
      id="adversaryFlag"
      title="Flag Art"
      bind:imageURL={adversary.nameLossEscalation.flagImg} />
  </div>
</Section>
