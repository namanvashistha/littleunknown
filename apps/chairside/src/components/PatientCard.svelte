<script lang="ts">
  import { ALLERGY, ageLong } from "../lib/labels.ts";
  import { SAMPLES } from "../lib/samples.ts";
  import { isReady, patient, ui } from "../lib/state.svelte.ts";

  const sample = $derived(SAMPLES.find((s) => s.id === patient.sample));
</script>

{#if !isReady(patient)}
  <div class="card pc">
    <div class="pc-main">
      <span class="label">Patient</span>
      <span class="small">Add the child's weight and age to see doses.</span>
    </div>
    <button class="btn primary sm" onclick={() => (ui.sheet = true)}>Add details</button>
  </div>
{:else}
  <div class="card pc">
    <div class="pc-main">
      <span class="label">{sample ? `${sample.name} · sample patient` : "Patient"}</span>
      <span class="pc-facts"><span class="num">{patient.kg} kg</span> · {ageLong(patient.months)}</span>
      {#if patient.allergy !== "none" || patient.immuno}
        <span class="pills">
          {#if patient.allergy !== "none"}<span class="pill red">{ALLERGY[patient.allergy]}</span>{/if}
          {#if patient.immuno}<span class="pill amber">Weak immune system</span>{/if}
        </span>
      {/if}
    </div>
    <button class="btn secondary sm" onclick={() => (ui.sheet = true)}>Edit</button>
  </div>
{/if}

<style>
  .pc { display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 16px; }
  .pc-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .pc-facts { font-size: 17px; font-weight: 650; }
</style>
