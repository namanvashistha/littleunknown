<script lang="ts">
  import { DRUGS, SRC } from "../lib/data.ts";
  import { bestForm, compute, f1, isLiquid, ivTxt, r1, rng, scriptText, strengthMg, unitsFor } from "../lib/engine.ts";
  import { timesADay } from "../lib/labels.ts";
  import { href, isReady, patient, toast, ui } from "../lib/state.svelte.ts";
  import type { Diagnosis, Regimen } from "../lib/types.ts";
  import Header from "./Header.svelte";
  import Icon from "./Icon.svelte";
  import PatientCard from "./PatientCard.svelte";

  let { dx, rx }: { dx: Diagnosis; rx: Regimen } = $props();

  const drug = $derived(DRUGS[rx.drug]);
  const name = $derived(drug.name.split(" (")[0]);
  const ready = $derived(isReady(patient) ? patient : null);
  const c = $derived(ready ? compute(rx, ready) : null);
  const weighed = $derived(rx.kind === "perDay" || rx.kind === "perDose" || rx.kind === "single");

  let picked = $state<number | null>(null);
  const formIdx = $derived(picked ?? (c?.dose ? bestForm(drug, (c.dose[0] + c.dose[1]) / 2) : 0));
  const form = $derived(drug.forms[Math.min(formIdx, drug.forms.length - 1)]);
  const liquid = $derived(isLiquid(form) ? form : null);
  const units = $derived(c?.dose && form ? unitsFor(form, c.dose[1]) : null);

  const duration = $derived(patient.immuno && rx.durImmuno ? rx.durImmuno : rx.dur);
  const often = $derived.by(() => {
    if (rx.kind === "single") return "One dose only";
    if (rx.doses) return `${timesADay(rx.doses)}${rx.every ? ` (${ivTxt(rx.every)})` : ""}`;
    if (rx.every) return `${ivTxt(rx.every)[0].toUpperCase()}${ivTxt(rx.every).slice(1)}, when needed`;
    return "";
  });
  const unitTxt = (u: number) => (u === 0.5 ? "½" : u % 1 ? `${Math.floor(u)}½` : String(u));
  const plural = (t: string, u: number) => t.toLowerCase() + (u > 1 ? "s" : "");

  async function copy() {
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(scriptText(rx, ready, weighed ? form : undefined));
      toast("Prescription copied");
    } catch {
      toast("Couldn't copy on this device");
    }
  }
</script>

<div class="page">
  <Header title={name} back={href.dx(dx.id)} backLabel="Back to {dx.n}" />
  <PatientCard />

  {#if rx.kind === "none"}
    <section class="card answer">
      <span class="label">{name} · {rx.label}</span>
      <p class="big-text" style="color:var(--red)">No child dose in the guideline</p>
    </section>
    <p class="notice red">{rx.gap}</p>
  {:else if !weighed}
    <section class="card answer">
      <span class="label">{name} · {rx.label}</span>
      <p class="big-text">{rx.instruction ?? rx.fixed}</p>
      {#if duration}<dl class="facts"><div><dt>How long</dt><dd>{duration}</dd></div></dl>{/if}
    </section>
  {:else if !ready || !c?.dose}
    <section class="card answer">
      <span class="label">{name} · {rx.label}</span>
      <p class="big-text">Add the child's weight and age to work out the dose.</p>
      <button class="btn primary" onclick={() => (ui.sheet = true)}>Add details</button>
    </section>
  {:else}
    {@const d = c.dose}
    <section class="card answer" aria-live="polite">
      <span class="label">Give each time</span>
      {#if liquid}
        <p class="big num">{f1(d[0] / liquid.mgml)}{f1(d[0] / liquid.mgml) !== f1(d[1] / liquid.mgml) ? `–${f1(d[1] / liquid.mgml)}` : ""} <span class="unit">mL</span></p>
        <p class="muted">of {form.t.toLowerCase()} {form.s} <span class="num">({rng(d[0], d[1])} mg)</span></p>
      {:else if units !== null}
        <p class="big num">{unitTxt(units)} <span class="unit">{plural(form.t, units)}</span></p>
        <p class="muted">of {form.s} <span class="num">({rng(d[0], d[1])} mg)</span></p>
      {:else}
        <p class="big num">{rng(d[0], d[1])} <span class="unit">mg</span></p>
        <p class="notice amber small">{form.t} {form.s} doesn't split into this dose. Choose another form below.</p>
      {/if}
      <dl class="facts">
        {#if often}<div><dt>How often</dt><dd>{often}</dd></div>{/if}
        {#if duration}<div><dt>How long</dt><dd>{duration}{patient.immuno && rx.durImmuno ? " (weak immune system)" : ""}</dd></div>{/if}
        {#if rx.followOn}
          <div><dt>After day 1</dt><dd class="num">{rng(rx.followOn.perDose[0] * ready.kg, rx.followOn.perDose[1] * ready.kg)} mg once a day</dd></div>
        {/if}
      </dl>
    </section>

    {#if c.capped}
      <p class="notice amber">
        {#if c.capped.by === "single"}
          <b>Lowered to the {c.capped.limit} mg maximum.</b> By weight it would be {r1(c.raw![1])} mg.
        {:else}
          <b>Lowered so the day's total stays within {c.capped.limit} mg,</b> the daily maximum.
        {/if}
      </p>
    {/if}
    {#if c.dailyFlag}<p class="notice amber">{c.dailyFlag}</p>{/if}
    {#if liquid && d[1] / liquid.mgml > 15}
      <p class="notice amber">{f1(d[1] / liquid.mgml)} mL is a lot to swallow at once. A tablet or capsule may be easier.</p>
    {/if}

    <section class="card stack">
      <h2 class="label">Choose the form</h2>
      <div class="chips">
        {#each drug.forms as f, i}
          <button class="chip" aria-pressed={i === formIdx} onclick={() => (picked = i)}>{f.t} {f.s}</button>
        {/each}
      </div>
      <p class="tiny faint">{form.fromGuideline ? "This strength is stated in the AAPD guide." : "Check this strength against the pack: it isn't from the AAPD guide."}</p>
    </section>
  {/if}

  {#if rx.caution}<p class="notice amber"><b>Caution:</b> {rx.caution}</p>{/if}
  {#if rx.gap && rx.kind !== "none"}<p class="notice red">{rx.gap}</p>{/if}
  {#if rx.note || drug.note}
    <section class="card stack small">
      <h2 class="label">Good to know</h2>
      {#if rx.note}<p>{rx.note}</p>{/if}
      {#if drug.note}<p>{drug.note}</p>{/if}
    </section>
  {/if}

  {#if c?.dose && weighed}
    <details class="more">
      <summary>How this was worked out</summary>
      <div class="more-body">
        <dl class="facts num small">{#each c.math as [k, v]}<div><dt>{k}</dt><dd>{v}</dd></div>{/each}
          {#if liquid}<div><dt>÷ {liquid.mgml} mg/mL</dt><dd>{f1(c.dose[0] / liquid.mgml)}–{f1(c.dose[1] / liquid.mgml)} mL</dd></div>{/if}
          {#if units !== null && !liquid}<div><dt>÷ {strengthMg(form)} mg</dt><dd>{unitTxt(units)} {plural(form.t, units)}</dd></div>{/if}
        </dl>
        <p class="tiny faint">Rounded to 0.1 mg and 0.1 mL.</p>
      </div>
    </details>
  {/if}
  {#if rx.verbatim}
    <details class="more">
      <summary>What the guideline says</summary>
      <div class="more-body"><blockquote class="quote">“{rx.verbatim}”</blockquote></div>
    </details>
  {/if}
  {#if drug.brands?.length}
    <details class="more">
      <summary>Brand names in India</summary>
      <div class="more-body">
        <p>{drug.brands.join(" · ")}</p>
        <p class="tiny faint">Not from the AAPD guide, and they vary by market. Check the strength on the pack.</p>
      </div>
    </details>
  {/if}

  <p class="tiny faint">Source: {SRC[rx.src].label}, {SRC[rx.src].cite}, {rx.page}.</p>
</div>

{#if rx.kind !== "none"}
  <div class="bottombar"><div>
    <button class="btn primary" onclick={copy} disabled={!ready || (weighed && !c?.dose)}><Icon name="copy" size={20} /> Copy prescription</button>
  </div></div>
{/if}

<style>
  .answer { display: flex; flex-direction: column; gap: 6px; }
  .big { font-size: 48px; font-weight: 750; line-height: 1.05; letter-spacing: -.02em; }
  .big .unit { font-size: 20px; font-weight: 500; color: var(--muted); letter-spacing: 0; }
  .big-text { font-size: 20px; font-weight: 650; line-height: 1.35; }
  .answer .facts { margin-top: 10px; border-top: 1px solid var(--line); }
  .answer .facts > div:first-child { border-top: 0; }
  .stack { display: flex; flex-direction: column; gap: 10px; }
</style>
