<script lang="ts">
  import { ageTxt } from "../lib/engine.ts";
  import { patient, ui } from "../lib/state.svelte.ts";

  const ALLERGY = { none: "None", mild: "Penicillin", typeI: "Type I" } as const;
</script>

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
