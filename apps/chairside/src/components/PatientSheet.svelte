<script lang="ts">
  import { r1 } from "../lib/engine.ts";
  import Icon from "./Icon.svelte";
  import { patient, resetPatient, savePatient, ui } from "../lib/state.svelte.ts";
  import type { Allergy } from "../lib/types.ts";

  const ALLERGY: [Allergy, string, string][] = [
    ["none", "No", ""],
    ["mild", "Yes", "For example a rash"],
    ["typeI", "Yes, a severe reaction", "Anaphylaxis, swelling of the face or throat, or hives"],
  ];
  function setAllergy(k: Allergy) {
    if (patient.allergy !== k) patient.sample = undefined;
    patient.allergy = k;
    savePatient();
  }
  function setImmuno(v: boolean) {
    if (patient.immuno !== v) patient.sample = undefined;
    patient.immuno = v;
    savePatient();
  }
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
    const k = kgNum !== null && !kgErr ? r1(kgNum) : null;
    const m = ageMonths !== null && !ageErr ? ageMonths : null;
    // Editing a sample patient makes them someone else.
    if (k !== patient.kg || m !== patient.months) patient.sample = undefined;
    patient.kg = k;
    patient.months = m;
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
  <div class="page">
    <header class="top">
      <button class="iconbtn" onclick={close} aria-label="Close"><Icon name="back" /></button>
      <h2 class="top-title" id="sheet-t">Patient details</h2>
      <button class="btn sm" style="color:var(--red)" onclick={fresh}>Clear</button>
    </header>

    <div class="field">
      <label class="label" for="kg">Weight</label>
      <div class="stepper">
        <button onclick={() => stepKg(-0.5)} aria-label="Weight down 0.5 kg">−</button>
        <input id="kg" type="text" inputmode="decimal" placeholder="0" bind:value={kg} use:autofocus aria-describedby="kg-h" />
        <span class="unit">kg</span>
        <button onclick={() => stepKg(0.5)} aria-label="Weight up 0.5 kg">+</button>
      </div>
      {#if kgErr}<p class="err">{kgErr}</p>{/if}
      <p class="tiny faint" id="kg-h">{kgNum && !kgErr ? `That's ${r1(kgNum * 2.2046)} lb. ` : ""}Weigh the child on the day; don't guess from age.</p>
    </div>

    <div class="field">
      <span class="label" id="age-l">Age</span>
      <div class="agerow" role="group" aria-labelledby="age-l">
        <div class="stepper">
          <button onclick={() => stepAge(-12)} aria-label="One year younger">−</button>
          <input type="text" inputmode="numeric" placeholder="0" bind:value={years} aria-label="Years" />
          <span class="unit">years</span>
          <button onclick={() => stepAge(12)} aria-label="One year older">+</button>
        </div>
        <div class="stepper">
          <button onclick={() => stepAge(-1)} aria-label="One month younger">−</button>
          <input type="text" inputmode="numeric" placeholder="0" bind:value={months} aria-label="Months" />
          <span class="unit">months</span>
          <button onclick={() => stepAge(1)} aria-label="One month older">+</button>
        </div>
      </div>
      {#if ageErr}<p class="err">{ageErr}</p>{/if}
      <p class="tiny faint">Some medicines have age limits, like doxycycline from 8 years.</p>
    </div>

    <div class="field">
      <span class="label" id="al-l">Allergic to penicillin?</span>
      <div class="choices" role="group" aria-labelledby="al-l">
        {#each ALLERGY as [k, label, hint]}
          <button class="choice" aria-pressed={patient.allergy === k} onclick={() => setAllergy(k)}>
            <span class="dot"></span><span class="c-main"><b>{label}</b>{#if hint}<span class="tiny muted">{hint}</span>{/if}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="field">
      <span class="label" id="im-l">Weak immune system?</span>
      <div class="choices" role="group" aria-labelledby="im-l">
        <button class="choice" aria-pressed={!patient.immuno} onclick={() => setImmuno(false)}><span class="dot"></span><span class="c-main"><b>No</b></span></button>
        <button class="choice" aria-pressed={patient.immuno} onclick={() => setImmuno(true)}>
          <span class="dot"></span><span class="c-main"><b>Yes</b><span class="tiny muted">For example during chemotherapy. Some courses run longer.</span></span>
        </button>
      </div>
    </div>
  </div>

  <div class="bottombar" style="z-index:11"><div>
    <button class="btn primary" onclick={close}>{patient.kg !== null && patient.months !== null ? "Done" : "Close"}</button>
  </div></div>
</div>

<style>
  .agerow { display: flex; flex-direction: column; gap: 8px; }
  .field { margin-top: 8px; }
</style>
