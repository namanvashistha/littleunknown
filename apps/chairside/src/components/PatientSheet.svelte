<script lang="ts">
  import { r1 } from "../lib/engine.ts";
  import { patient, resetPatient, savePatient, ui } from "../lib/state.svelte.ts";
  import type { Allergy } from "../lib/types.ts";

  const ALLERGY: [Allergy, string][] = [["none", "None"], ["mild", "Penicillin"], ["typeI", "Type I"]];
  const MAX_KG = 150;

  // Local drafts so a half-typed number never reaches the dose engine.
  let kg = $state(patient.kg === null ? "" : String(patient.kg));
  let years = $state(patient.months === null ? "" : String(Math.floor(patient.months / 12)));
  let months = $state(patient.months === null ? "" : String(patient.months % 12));

  const kgNum = $derived(kg.trim() === "" ? null : Number(kg.replace(",", ".")));
  const kgErr = $derived(kgNum !== null && (!Number.isFinite(kgNum) || kgNum < 1 || kgNum > MAX_KG) ? `Weight must be 1–${MAX_KG} kg.` : "");
  const ageMonths = $derived.by(() => {
    if (years.trim() === "" && months.trim() === "") return null;
    const y = Number(years || 0), m = Number(months || 0);
    if (!Number.isInteger(y) || !Number.isInteger(m) || y < 0 || y > 18 || m < 0 || m > 11) return NaN;
    return y * 12 + m;
  });
  const ageErr = $derived(Number.isNaN(ageMonths) ? "Age must be 0–18 years and 0–11 months." : "");

  $effect(() => {
    patient.kg = kgNum !== null && !kgErr ? r1(kgNum) : null;
    patient.months = ageMonths !== null && !ageErr ? ageMonths : null;
    savePatient();
  });

  function stepKg(d: number) {
    const base = kgNum !== null && Number.isFinite(kgNum) ? kgNum : 10;
    kg = String(Math.min(MAX_KG, Math.max(1, r1(base + d))));
  }
  function stepAge(d: number) {
    const cur = ageMonths !== null && !Number.isNaN(ageMonths) ? ageMonths : 0;
    const next = Math.min(216, Math.max(0, cur + d));
    years = String(Math.floor(next / 12));
    months = String(next % 12);
  }
  function close() {
    ui.sheet = false;
  }
  function fresh() {
    resetPatient();
    kg = years = months = "";
    document.getElementById("kg")?.focus();
  }
  function autofocus(el: HTMLElement) {
    if (patient.kg === null) el.focus();
  }
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && close()} />

<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t">
  <nav class="nav" style="padding-left:18px">
    <h2 class="t" id="sheet-t">Patient</h2>
    <button class="lab" style="padding:12px 8px;color:var(--stop)" onclick={fresh}>New patient</button>
    <button class="bk" onclick={close} aria-label="Close">✕</button>
  </nav>

  <div class="fld">
    <label class="lab" for="kg">Weight</label>
    <div class="stepper">
      <button onclick={() => stepKg(-0.5)} aria-label="Weight down 0.5 kg">−</button>
      <input id="kg" type="text" inputmode="decimal" placeholder="—" bind:value={kg} use:autofocus aria-describedby="kg-h" />
      <span class="unit">kg</span>
      <button onclick={() => stepKg(0.5)} aria-label="Weight up 0.5 kg">+</button>
    </div>
    {#if kgErr}<p class="err">{kgErr}</p>{/if}
    <p class="cite" id="kg-h">{kgNum && !kgErr ? `${r1(kgNum * 2.2046)} lb · ` : ""}Doses always use kg. Weigh the child; don't estimate from age.</p>
  </div>

  <div class="fld">
    <span class="lab" id="age-l">Age</span>
    <div class="agerow" role="group" aria-labelledby="age-l">
      <div class="stepper">
        <button onclick={() => stepAge(-12)} aria-label="Age down 1 year">−</button>
        <input type="text" inputmode="numeric" placeholder="—" bind:value={years} aria-label="Years" />
        <span class="unit">y</span>
        <button onclick={() => stepAge(12)} aria-label="Age up 1 year">+</button>
      </div>
      <div class="stepper">
        <button onclick={() => stepAge(-1)} aria-label="Age down 1 month">−</button>
        <input type="text" inputmode="numeric" placeholder="0" bind:value={months} aria-label="Months" />
        <span class="unit">m</span>
        <button onclick={() => stepAge(1)} aria-label="Age up 1 month">+</button>
      </div>
    </div>
    {#if ageErr}<p class="err">{ageErr}</p>{/if}
    <p class="cite">Gates doxycycline (8 y), chlorhexidine (8 y), clotrimazole lozenge (3 y), miconazole buccal (13 y), topical aciclovir (12 y)</p>
  </div>

  <div class="fld">
    <span class="lab" id="al-l">Penicillin allergy</span>
    <div class="segs" role="group" aria-labelledby="al-l">
      {#each ALLERGY as [k, v]}
        <button aria-pressed={patient.allergy === k} onclick={() => { patient.allergy = k; savePatient(); }}>{v}</button>
      {/each}
    </div>
    <p class="cite">Type I = anaphylaxis, angioedema or urticaria. Cephalosporins are withheld as well.</p>
  </div>

  <div class="fld">
    <span class="lab" id="im-l">Immune status</span>
    <div class="segs" role="group" aria-labelledby="im-l">
      <button aria-pressed={!patient.immuno} onclick={() => { patient.immuno = false; savePatient(); }}>Normal</button>
      <button aria-pressed={patient.immuno} onclick={() => { patient.immuno = true; savePatient(); }}>Compromised</button>
    </div>
    <p class="cite">Extends antiviral course length where the guideline specifies it.</p>
  </div>

  <div class="btm"><button class="p" onclick={close}>Done</button></div>
</div>
