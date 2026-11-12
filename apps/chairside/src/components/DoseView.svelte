<script lang="ts">
  import { DRUGS } from "../lib/data.ts";
  import { bestForm, compute, f1, isLiquid, ivTxt, r1, rng, scriptText, strengthMg, unitsFor } from "../lib/engine.ts";
  import { href, isReady, patient, toast, ui } from "../lib/state.svelte.ts";
  import type { Diagnosis, Regimen } from "../lib/types.ts";
  import Cite from "./Cite.svelte";
  import PatientBar from "./PatientBar.svelte";

  let { dx, rx }: { dx: Diagnosis; rx: Regimen } = $props();

  const drug = $derived(DRUGS[rx.drug]);
  const ready = $derived(isReady(patient) ? patient : null);
  const c = $derived(ready ? compute(rx, ready) : null);
  const dosed = $derived(!!c?.dose);

  let picked = $state<number | null>(null);
  let brandIdx = $state(0);
  const formIdx = $derived(
    picked ?? (c?.dose ? bestForm(drug, (c.dose[0] + c.dose[1]) / 2) : 0),
  );
  const form = $derived(drug.forms[Math.min(formIdx, drug.forms.length - 1)]);
  const liquid = $derived(isLiquid(form) ? form : null);
  const units = $derived(c?.dose && form ? unitsFor(form, c.dose[1]) : null);
  const duration = $derived(patient.immuno && rx.durImmuno ? rx.durImmuno : rx.dur);

  async function copy() {
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(scriptText(rx, ready, rx.kind === "topical" || rx.kind === "fixed" ? undefined : form));
      toast("Script copied");
    } catch {
      toast("Couldn't copy on this device");
    }
  }
</script>

<nav class="nav">
  <a class="bk" href={href.dx(dx.id)} aria-label="Back to {dx.n}">←</a><span class="t">{dx.n}</span>
</nav>
<PatientBar />

{#if rx.kind === "none"}
  <section class="band stop">
    <h1 class="big">No paediatric dose</h1>
    <p class="sm">{drug.name} · {rx.label}</p>
  </section>
  <div class="sec"><p class="gapbox">{rx.gap}</p></div>
{:else if rx.kind === "topical" || rx.kind === "fixed"}
  <section class="dose">
    <h1 class="lab">{drug.name} · {rx.label}</h1>
    <p class="instr">{rx.instruction ?? rx.fixed}</p>
    <p class="sub2">{duration ?? ""}</p>
  </section>
{:else if !ready || !c?.dose}
  <section class="dose">
    <h1 class="lab">{drug.name} · {rx.label}</h1>
    <p class="instr">Enter weight and age to work out the dose.</p>
  </section>
  <div class="sec"><button class="warnbox s" onclick={() => (ui.sheet = true)}>Enter patient details →</button></div>
{:else}
  {@const d = c.dose}
  <section class="dose" aria-live="polite">
    <h1 class="lab">{drug.name} · {rx.label}</h1>
    {#if liquid}
      <p class="big">
        <span class="n">{f1(d[0] / liquid.mgml)}{f1(d[0] / liquid.mgml) !== f1(d[1] / liquid.mgml) ? `–${f1(d[1] / liquid.mgml)}` : ""}</span>
        <span class="u">mL</span>
      </p>
      <p class="sub2">{rng(d[0], d[1])} mg{c.per && c.per > 1 ? ` · ${c.per}× daily` : ""}{rx.every ? ` · ${ivTxt(rx.every)}` : ""}</p>
    {:else}
      <p class="big"><span class="n">{rng(d[0], d[1])}</span><span class="u">mg</span></p>
      {#if units !== null}<p class="sub2">{units} × {form.t.toLowerCase()} {form.s}</p>{/if}
      <p class="sub2">{c.per && c.per > 1 ? `${c.per}× daily · ` : ""}{rx.every ? ivTxt(rx.every) : ""}</p>
    {/if}
    <p class="sub2">{duration ?? ""}</p>
  </section>

  {#if c.capped}
    <div class="sec">
      <p class="warnbox s">
        <b>Capped at the guideline maximum.</b><br />
        {#if c.capped.by === "single"}
          Calculated {r1(c.raw![1])} mg is {c.capped.over} mg above the {c.capped.limit} mg maximum single dose, so {c.capped.limit} mg is given.
        {:else}
          The daily total would be {c.capped.over} mg above the {c.capped.limit} mg daily maximum, so each dose is {r1(d[1])} mg.
        {/if}
      </p>
      {#if c.capped.by === "single"}
        <div class="bar" aria-hidden="true"><i style="width:{Math.round((c.capped.limit / c.raw![1]) * 100)}%;background:var(--heavy)"></i><i style="flex:1;background:var(--stop)"></i></div>
      {/if}
    </div>
  {:else if c.headroom != null && rx.maxSingle}
    <div class="sec">
      <div class="bar" aria-hidden="true"><i style="width:{Math.round(c.headroom * 100)}%;background:var(--heavy)"></i></div>
      <div class="rcp">
        <div><span class="k">this dose</span><span class="v">{r1(d[1])} mg</span></div>
        <div><span class="k">maximum single dose</span><span class="v">{rx.maxSingle} mg</span></div>
      </div>
    </div>
  {/if}
  {#if c.dailyFlag}<div class="sec"><p class="warnbox">{c.dailyFlag}</p></div>{/if}

  <div class="sec hv">
    <h2 class="lab">Formulation</h2>
    <div class="pick">
      {#each drug.forms as f, i}
        <button class="pk" aria-pressed={i === formIdx} onclick={() => (picked = i)}>{f.t} {f.s}</button>
      {/each}
    </div>
    {#if liquid}
      <div class="rcp">
        <div><span class="k">{r1(d[0])} mg ÷ {liquid.mgml} mg/mL</span><span class="v">{f1(d[0] / liquid.mgml)} mL</span></div>
        {#if r1(d[0]) !== r1(d[1])}
          <div><span class="k">{r1(d[1])} mg ÷ {liquid.mgml} mg/mL</span><span class="v">{f1(d[1] / liquid.mgml)} mL</span></div>
        {/if}
      </div>
      {#if d[1] / liquid.mgml > 15}
        <p class="warnbox">{f1(d[1] / liquid.mgml)} mL is a large volume for one dose. A tablet or capsule may suit this child better.</p>
      {/if}
    {:else if units !== null}
      <div class="rcp"><div><span class="k">{r1(d[1])} mg ÷ {strengthMg(form)} mg</span><span class="v">{units} × {form.t.toLowerCase()}</span></div></div>
    {:else}
      <p class="sub" style="font-size:12px">{rng(d[0], d[1])} mg per dose doesn't make whole or half units of this strength. Choose another form.</p>
    {/if}
    <p class="cite">{form.fromGuideline ? "Strength is stated in the AAPD document." : "Strength is NOT from the AAPD document — confirm against the pack."}</p>
  </div>

  {#if drug.brands}
    <div class="sec">
      <h2 class="lab">Brand examples · India</h2>
      <div class="pick">
        {#each drug.brands as b, i}<button class="pk" aria-pressed={i === brandIdx} onclick={() => (brandIdx = i)}>{b}</button>{/each}
      </div>
      <p class="cite">Trade names are not from the AAPD guideline and vary by market. Verify the strength on the pack before prescribing.</p>
    </div>
  {/if}

  <div class="sec hv">
    <h2 class="lab">How this was worked out</h2>
    <div class="rcp">{#each c.math as [k, v]}<div><span class="k">{k}</span><span class="v">{v}</span></div>{/each}</div>
    <p class="cite">mg rounded to 0.1 · mL rounded to 0.1</p>
  </div>
{/if}

{#if rx.followOn && ready}
  <div class="sec">
    <h2 class="lab">{rx.followOn.label}</h2>
    <div class="rcp"><div>
      <span class="k">{rx.followOn.perDose[0]}–{rx.followOn.perDose[1]} mg/kg × {ready.kg} kg</span>
      <span class="v">{rng(rx.followOn.perDose[0] * ready.kg, rx.followOn.perDose[1] * ready.kg)} mg</span>
    </div></div>
  </div>
{/if}
{#if patient.immuno && rx.durImmuno}<div class="sec"><p class="warnbox">Immunocompromised: course length is {rx.durImmuno}.</p></div>{/if}
{#if rx.caution}<div class="sec"><p class="warnbox">{rx.caution}</p></div>{/if}
{#if rx.gap && rx.kind !== "none"}<div class="sec"><p class="warnbox s">{rx.gap}</p></div>{/if}
{#if rx.note}<div class="sec"><p class="sub" style="font-size:12px">{rx.note}</p></div>{/if}
{#if drug.note}<div class="sec"><p class="sub" style="font-size:12px">{drug.note}</p></div>{/if}
{#if rx.verbatim}
  <div class="sec"><h2 class="lab">Guideline wording</h2><blockquote class="quote">“{rx.verbatim}”</blockquote></div>
{/if}
<Cite src={rx.src} page={rx.page} />

<div class="btm">
  <a href={href.dx(dx.id)}>Back</a>
  {#if rx.kind !== "none"}
    <button class="p" onclick={copy} disabled={!ready || (!dosed && rx.kind !== "topical" && rx.kind !== "fixed")}>Copy script</button>
  {/if}
</div>
