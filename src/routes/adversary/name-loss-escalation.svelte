<script>
  export let adversary;
  import AutoComplete from "$lib/auto-complete/index.svelte";
  import { iconValuesSorted } from "$lib/auto-complete/autoCompleteValues";
  import Section from "$lib/section.svelte";
  import ImageInput from "$lib/image-input.svelte";
</script>

<Section
  title="Name, Loss Condition, and Escalation"
  bind:isVisible={adversary.nameLossEscalation.isVisible}>
  <div class="mb-1 p-1 note">
    <a
      href="https://neubee.github.io/spirit-island-builder/instructions#adversary-name"
      target="_blank">Instructions</a>
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
          bind:value={adversary.nameLossEscalation.name} />
      </div>
      <div class="control" style="width:20%; min-width:2rem;">
        <input
          id="baseDifficulty"
          class="input"
          type="text"
          placeholder="Difficulty"
          bind:value={adversary.nameLossEscalation.baseDif} />
      </div>
    </div>
    <!-- FLAG ART -->
    <ImageInput
      id="adversaryFlag"
      title="Flag Art"
      bind:imageURL={adversary.nameLossEscalation.flagImg} />
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
</Section>
