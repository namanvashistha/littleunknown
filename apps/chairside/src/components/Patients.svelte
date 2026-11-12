<script lang="ts">
  import { DX } from "../lib/data.ts";
  import { ALLERGY, VERDICT, ageLong } from "../lib/labels.ts";
  import { SAMPLES, type Sample } from "../lib/samples.ts";
  import { href, isReady, loadSample, patient, resetPatient, ui } from "../lib/state.svelte.ts";
  import Header from "./Header.svelte";
  import Icon from "./Icon.svelte";
  import Tabs from "./Tabs.svelte";

  const dxOf = (s: Sample) => DX.find((d) => d.id === s.dx)!;
  const ownPatient = $derived(isReady(patient) && !patient.sample);

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

<div class="page">
  <Header title="Chairside" />
  <h1 class="title">Who are you treating?</h1>
  <p class="lead">Pick a sample patient to see how Chairside works, or add a new one.</p>
  <button class="btn primary" onclick={fresh}><Icon name="plus" size={20} /> New patient</button>
  {#if ownPatient}
    <a class="btn secondary" href={href.browse()}>Continue with current patient</a>
  {/if}

  <h2 class="section-title">Sample patients</h2>
  <ul class="stack">
    {#each SAMPLES as s (s.id)}
      {@const d = dxOf(s)}
      {@const v = VERDICT[d.verdict]}
      <li>
        <button class="card pt" class:on={patient.sample === s.id} onclick={() => open(s)}>
          <span class="pt-head">
            <span class="pt-name">{s.name}</span>
            <span class="muted small">{ageLong(s.months)} · <span class="num">{s.kg} kg</span></span>
            <span class="chev"><Icon name="chevron" size={20} /></span>
          </span>
          {#if s.allergy !== "none" || s.immuno}
            <span class="pills">
              {#if s.allergy !== "none"}<span class="pill red">{ALLERGY[s.allergy]}</span>{/if}
              {#if s.immuno}<span class="pill amber">Weak immune system</span>{/if}
            </span>
          {/if}
          <span class="small muted">{s.complaint}</span>
          <span class="pt-visit"><span class="small"><b>{d.n}</b></span><span class="pill {v.tone}">{v.label}</span></span>
        </button>
      </li>
    {/each}
  </ul>

  <p class="tiny faint">The sample patients are made up. Chairside supports, and doesn't replace, the dentist's own judgement.</p>
</div>
<Tabs />

<style>
  .stack { display: flex; flex-direction: column; gap: 10px; }
  .pt { display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: left; }
  .pt.on { border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
  .pt-head { display: flex; align-items: baseline; gap: 10px; }
  .pt-name { font-size: 19px; font-weight: 750; }
  .pt-head .muted { flex: 1; }
  .pt-head .chev { align-self: center; }
  .pt-visit { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 8px; border-top: 1px solid var(--line); }
</style>
