<script lang="ts">
  import { DRUGS, DX, PX_CONDITIONS, PX_NOT, PX_PROCEDURES, PX_REMOVED, RX } from "../lib/data.ts";
  import { compute, gateCheck, resolve, rng, type Option } from "../lib/engine.ts";
  import { COVERAGE, VERDICT } from "../lib/labels.ts";
  import { href, isReady, patient, ui } from "../lib/state.svelte.ts";
  import type { Diagnosis } from "../lib/types.ts";
  import Cite from "./Cite.svelte";
  import OptionRow from "./OptionRow.svelte";
  import PatientBar from "./PatientBar.svelte";

  let { dx }: { dx: Diagnosis } = $props();

  const v = $derived(VERDICT[dx.verdict]);
  const ready = $derived(isReady(patient) ? patient : null);
  const res = $derived(ready ? resolve(dx, ready) : null);
  const usable = $derived(res?.ok.filter((o) => o.rx.kind !== "none") ?? []);
  const nodose = $derived(res?.ok.filter((o) => o.rx.kind === "none") ?? []);
  // Before weight and age are in, list every option so the clinician can see the plan.
  const all: Option[] = $derived(
    (dx.rx ?? []).flatMap((ref) => (RX[ref.k] ? [{ ref, rx: RX[ref.k], drug: DRUGS[RX[ref.k].drug], why: null }] : [])),
  );
  const escalateTo = $derived(dx.escalate ? DX.find((x) => x.id === dx.escalate) : undefined);
  const pain = $derived(
    (["para", "ibu"] as const).map((k) => {
      const rx = RX[k];
      const why = ready ? gateCheck(rx, ready) : null;
      const c = ready && !why ? compute(rx, ready) : null;
      return { k, name: DRUGS[rx.drug].name.split(" (")[0], why, c };
    }),
  );
</script>

<nav class="nav">
  <a class="bk" href={href.browse()} aria-label="All diagnoses">←</a><span class="t">{dx.g}</span>
</nav>
<PatientBar />

<section class="band {v.tone}">
  <span class="cov">{COVERAGE[dx.coverage]}</span>
  <h1 class="big">{dx.n}</h1>
  <p class="sm">{dx.verdict === "none" ? "No antibiotic indicated" : v.label}</p>
</section>

<div class="sec">
  <p class="sub">{dx.why}</p>
  {#if dx.quote}<blockquote class="quote">“{dx.quote}”</blockquote>{/if}
</div>

{#if dx.plan}
  <div class="sec">
    <h2 class="lab">Do this</h2>
    <ol class="plan">
      {#each dx.plan as s, i}<li><span class="n">{String(i + 1).padStart(2, "0")}</span><span>{s}</span></li>{/each}
    </ol>
  </div>
{/if}

{#if dx.red}
  <div class="sec">
    <h2 class="lab" style="color:var(--stop)">Escalate if any appear</h2>
    <div class="flags">{#each dx.red as r}<span>{r}</span>{/each}</div>
    {#if escalateTo}<a class="warnbox s" href={href.dx(escalateTo.id)}>→ Go to {escalateTo.n}</a>{/if}
  </div>
{:else if escalateTo}
  <div class="sec"><a class="warnbox s" href={href.dx(escalateTo.id)}>Systemic signs appear → {escalateTo.n}</a></div>
{/if}

{#if dx.prophylaxis}
  <div class="sec">
    <h2 class="lab">Gate 1 — procedure</h2>
    <p class="quote">{PX_PROCEDURES.yes}</p>
    <p class="sub" style="font-size:12px">Not needed for: {PX_PROCEDURES.no.join(" · ").toLowerCase()}.</p>
  </div>
  <div class="sec">
    <h2 class="lab">Gate 2 — cardiac condition</h2>
    {#each PX_CONDITIONS as g}
      <div>
        <h3 class="lab" style="font-size:9px">{g.g}</h3>
        <ul class="plan">{#each g.items as it}<li style="font-size:13px"><span class="n">□</span><span>{it}</span></li>{/each}</ul>
      </div>
    {/each}
    <p class="sub" style="font-size:12px">Not indicated for: {PX_NOT.join(" · ").toLowerCase()}.</p>
    <p class="warnbox">{PX_REMOVED}</p>
  </div>
{/if}

{#if dx.rx?.length}
  {#if !ready}
    <div class="sec hv">
      <button class="warnbox s" onclick={() => (ui.sheet = true)}>
        Enter weight and age to see doses and which options this child can have →
      </button>
    </div>
    {#each all as o (o.ref.k)}<OptionRow {dx} {o} />{/each}
  {:else}
    {#if usable.length}
      <div class="sec hv head"><h2 class="lab">Available for this child — {usable.length}</h2></div>
      {#each usable as o (o.ref.k)}<OptionRow {dx} {o} p={ready} />{/each}
    {/if}
    {#if nodose.length}
      <div class="sec hv head"><h2 class="lab" style="color:var(--stop)">No paediatric dose in the source — {nodose.length}</h2></div>
      {#each nodose as o (o.ref.k)}<OptionRow {dx} {o} p={ready} />{/each}
    {/if}
    {#if res?.blk.length}
      <div class="sec hv head"><h2 class="lab">Withheld — {res.blk.length}</h2></div>
      {#each res.blk as o (o.ref.k)}<OptionRow {dx} {o} p={ready} />{/each}
    {/if}
  {/if}
{/if}

{#if dx.analgesia}
  <div class="sec hv">
    <h2 class="lab">Pain cover</h2>
    {#each pain as a (a.k)}
      {#if ready && !a.why}
        <a class="opt" style="padding:8px 0;border:0" href={href.dose(dx.id, a.k)}>
          <span class="l"><span style="font-size:14px;font-weight:600">{a.name}</span></span>
          <span class="mn" style="font-size:12.5px;font-weight:600">{rng(a.c!.dose![0], a.c!.dose![1])} mg ›</span>
        </a>
      {:else}
        <div class="opt" style="padding:8px 0;border:0">
          <span class="l"><span style="font-size:14px;font-weight:600">{a.name}</span></span>
          <span class="mn" style="font-size:12px;color:var(--ink3)">{a.why ?? "enter weight and age"}</span>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<Cite src={dx.src} page={dx.page} />
<div class="btm"><a href={href.browse()}>All diagnoses</a></div>
