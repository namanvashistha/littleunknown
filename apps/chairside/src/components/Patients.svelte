<script lang="ts">
  import { DX } from "../lib/data.ts";
  import { ageTxt } from "../lib/engine.ts";
  import { VERDICT } from "../lib/labels.ts";
  import { SAMPLES, type Sample } from "../lib/samples.ts";
  import { href, loadSample, patient, resetPatient, ui } from "../lib/state.svelte.ts";

  const ALLERGY = { none: "No allergy", mild: "Penicillin allergy", typeI: "Penicillin anaphylaxis" } as const;
  const dxOf = (s: Sample) => DX.find((d) => d.id === s.dx)!;

  function open(s: Sample) {
    loadSample(s);
    location.hash = href.dx(s.dx);
  }
  function fresh() {
    resetPatient();
    location.hash = href.browse();
    ui.sheet = true;
  }
</script>

<header class="sbar">
  <span class="brand">CHAIRSIDE</span><span class="lab">AAPD · 2024</span>
</header>
<div class="hd" style="border-top:2px solid var(--heavy)">
  <h1 class="h1">Who's in<br />the chair?</h1>
  <p class="sub" style="margin-top:10px">Sample patients, made up to show what Chairside does. Tap one to open their visit, or start a new patient.</p>
</div>

<ul>
  {#each SAMPLES as s (s.id)}
    {@const d = dxOf(s)}
    {@const on = patient.sample === s.id}
    <li>
      <button class="pt" class:on onclick={() => open(s)}>
        <span class="row">
          <span class="nm">{s.name}</span>
          {#if on}<span class="here">IN THE CHAIR</span>{/if}
        </span>
        <span class="facts mn">
          {ageTxt(s.months)} · {s.kg} kg{#if s.allergy !== "none"}{" · "}<b class="al">{ALLERGY[s.allergy]}</b>{/if}{#if s.immuno}{" · "}<b class="al">Immunocompromised</b>{/if}
        </span>
        <span class="cc">“{s.complaint}”</span>
        <span class="dx"><span class="vb v-{d.verdict}"></span><span class="dn">{d.n}</span><span class="tg {d.verdict}">{VERDICT[d.verdict].label.toUpperCase()}</span></span>
        <span class="mt">Shows: {s.shows}</span>
      </button>
    </li>
  {/each}
</ul>

<a class="skip" href={href.browse()}>
  {patient.kg !== null && !patient.sample ? "Continue with the current patient" : "Browse diagnoses without a patient"}
  <span aria-hidden="true">→</span>
</a>
<div class="sec hv">
  <p class="cite">Names and histories are fictional. Weights are set to land on the cases worth seeing: real children are weighed on the day.</p>
</div>
<div class="btm"><button class="p" onclick={fresh}>New patient</button></div>

<style>
  ul { list-style: none; }
  .skip { display: flex; justify-content: space-between; padding: 16px 18px; border-top: 1px solid var(--hair); font-size: 14px; font-weight: 600; min-height: 52px; }
  .pt { display: flex; flex-direction: column; gap: 7px; width: 100%; padding: 16px 18px; border-top: 1px solid var(--hair); }
  .pt.on { background: var(--field); box-shadow: inset 4px 0 0 var(--heavy); }
  @media (hover: hover) { .pt:hover { background: var(--field); } }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .nm { font-size: 20px; font-weight: 800; font-stretch: 118%; letter-spacing: -.01em; }
  .here { font-family: var(--mono); font-size: 9px; font-weight: 600; letter-spacing: .08em; background: var(--heavy); color: var(--paper); padding: 3px 6px; }
  .facts { font-size: 12px; color: var(--ink2); }
  .al { color: var(--stop); font-weight: 600; }
  .cc { font-size: 13.5px; line-height: 1.45; }
  .dx { display: flex; align-items: center; gap: 10px; padding: 8px 0 2px; }
  .vb { width: 4px; align-self: stretch; min-height: 18px; flex: none; }
  .dn { flex: 1; font-size: 13px; font-weight: 600; }
  .tg { font-family: var(--mono); font-size: 9px; font-weight: 600; letter-spacing: .06em; }
  .mt { font-size: 11.5px; color: var(--ink3); line-height: 1.4; }
</style>
