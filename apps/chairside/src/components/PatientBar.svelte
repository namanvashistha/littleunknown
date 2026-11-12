<script lang="ts">
  import { ageTxt } from "../lib/engine.ts";
  import { SAMPLES } from "../lib/samples.ts";
  import { href, patient, ui } from "../lib/state.svelte.ts";

  const ALLERGY = { none: "None", mild: "Penicillin", typeI: "Type I" } as const;
  const sample = $derived(SAMPLES.find((s) => s.id === patient.sample));
</script>

<a class="who" href={href.patients()}>
  {#if sample}<span><b>{sample.name}</b> · sample patient</span>{:else}<span>No patient in the chair</span>{/if}
  <span class="lab">{sample ? "Switch" : "Sample patients"} →</span>
</a>
<button class="pbar" onclick={() => (ui.sheet = true)} aria-label="Edit patient details">
  <span class="pb" class:empty={patient.kg === null}>
    <span class="lab">Weight</span><span class="v">{patient.kg === null ? "Enter" : `${patient.kg} kg`}</span>
  </span>
  <span class="pb" class:empty={patient.months === null}>
    <span class="lab">Age</span><span class="v">{patient.months === null ? "Enter" : ageTxt(patient.months)}</span>
  </span>
  <span class="pb" class:alert={patient.allergy !== "none"}>
    <span class="lab">Allergy</span><span class="v">{ALLERGY[patient.allergy]}</span>
  </span>
  {#if patient.immuno}
    <span class="pb alert"><span class="lab">Immune</span><span class="v">Compr.</span></span>
  {/if}
</button>

<style>
  .who { display: flex; justify-content: space-between; align-items: center; padding: 9px 18px; border-top: 1px solid var(--hair); font-size: 13px; min-height: 40px; }
  .who b { font-weight: 800; font-stretch: 118%; }
</style>
