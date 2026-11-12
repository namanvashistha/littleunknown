<script lang="ts">
  import { DRUGS, DX, PX_CONDITIONS, PX_NOT, PX_PROCEDURES, PX_REMOVED, RX, SRC } from "../lib/data.ts";
  import { compute, gateCheck, resolve, rng, type Option } from "../lib/engine.ts";
  import { COVERAGE, ROLE, VERDICT } from "../lib/labels.ts";
  import { href, isReady, nav, patient, ui } from "../lib/state.svelte.ts";
  import type { Diagnosis, Role } from "../lib/types.ts";
  import Header from "./Header.svelte";
  import Icon from "./Icon.svelte";
  import OptionRow from "./OptionRow.svelte";
  import PatientCard from "./PatientCard.svelte";

  let { dx }: { dx: Diagnosis } = $props();

  const v = $derived(VERDICT[dx.verdict]);
  const ready = $derived(isReady(patient) ? patient : null);
  const res = $derived(ready ? resolve(dx, ready) : null);
  // Before weight and age are in, show every option so the plan is visible.
  const offered: Option[] = $derived(
    res?.ok ??
      (dx.rx ?? []).flatMap((ref) => (RX[ref.k] ? [{ ref, rx: RX[ref.k], drug: DRUGS[RX[ref.k].drug], why: null }] : [])),
  );
  const byRole = $derived(
    (["first", "alt", "adjunct"] as Role[])
      .map((role) => ({ role, items: offered.filter((o) => o.ref.role === role) }))
      .filter((g) => g.items.length),
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

<div class="page">
  <Header
    title={dx.g}
    back={nav.tab === "patients" ? href.patients() : href.browse()}
    backLabel={nav.tab === "patients" ? "Patients" : "Conditions"}
  />
  <PatientCard />

  <section class="card verdict">
    <h1 class="title" style="margin:0">{dx.n}</h1>
    <span class="pill {v.tone}" style="align-self:flex-start">{v.headline}</span>
    <p>{dx.why}</p>
  </section>

  {#if dx.red}
    <div class="notice red">
      <b>Get urgent help if you see:</b>
      <ul class="dots">{#each dx.red as r}<li>{r}</li>{/each}</ul>
    </div>
  {/if}
  {#if escalateTo}
    <a class="notice amber" href={href.dx(escalateTo.id)}>Spreading, or the child has a fever? See {escalateTo.n} →</a>
  {/if}

  {#if dx.plan}
    <section class="card">
      <h2 class="label" style="margin-bottom:10px">What to do</h2>
      <ol class="steps">{#each dx.plan as s}<li>{s}</li>{/each}</ol>
    </section>
  {/if}

  {#if dx.prophylaxis}
    <h2 class="section-title">Check both before giving</h2>
    <section class="card stack">
      <b>1. Does the procedure need it?</b>
      <p class="small">Yes, if it involves {PX_PROCEDURES.yes.replace(/^Any procedure involving /, "").replace(/\.$/, "")}.</p>
      <details class="sub"><summary class="small muted">Procedures that don't need it</summary>
        <ul class="dots small muted">{#each PX_PROCEDURES.no as n}<li>{n}</li>{/each}</ul>
      </details>
    </section>
    <section class="card stack">
      <b>2. Does the child have one of these heart conditions?</b>
      {#each PX_CONDITIONS as g}
        <div><span class="label">{g.g}</span><ul class="dots small">{#each g.items as it}<li>{it}</li>{/each}</ul></div>
      {/each}
      <details class="sub"><summary class="small muted">Conditions that don't need it</summary>
        <ul class="dots small muted">{#each PX_NOT as n}<li>{n}</li>{/each}</ul>
      </details>
    </section>
    <p class="notice neutral small">{PX_REMOVED}</p>
  {/if}

  {#if dx.rx?.length}
    <h2 class="section-title">Medicines{ready ? " for this child" : ""}</h2>
    {#if !ready}
      <button class="notice amber" onclick={() => (ui.sheet = true)}>Add the child's weight and age to see doses and what they can have →</button>
    {/if}
    {#each byRole as g (g.role)}
      <span class="label" style="margin:4px 4px -6px">{ROLE[g.role]}</span>
      <div class="list">{#each g.items as o (o.ref.k)}<OptionRow {dx} {o} p={ready ?? undefined} />{/each}</div>
    {/each}
    {#if res?.blk.length}
      <details class="more">
        <summary>Not suitable for this child ({res.blk.length})</summary>
        <div class="list">{#each res.blk as o (o.ref.k)}<OptionRow {dx} {o} p={ready ?? undefined} />{/each}</div>
      </details>
    {/if}
  {/if}

  {#if dx.analgesia}
    <h2 class="section-title">Pain relief</h2>
    <div class="list">
      {#each pain as a (a.k)}
        {#if a.c?.dose}
          <a class="row" href={href.dose(dx.id, a.k)}>
            <span class="row-main"><span class="row-name">{a.name}</span><span class="small num">{rng(a.c.dose[0], a.c.dose[1])} mg per dose</span></span>
            <span class="chev"><Icon name="chevron" size={20} /></span>
          </a>
        {:else}
          <div class="row"><span class="row-main"><span class="row-name">{a.name}</span>
            <span class="small {a.why ? '' : 'muted'}" style:color={a.why ? "var(--red)" : null}>{a.why ?? "Add weight and age to see the dose"}</span></span></div>
        {/if}
      {/each}
    </div>
  {/if}

  {#if dx.quote}
    <details class="more">
      <summary>What the guideline says</summary>
      <div class="more-body"><blockquote class="quote">“{dx.quote}”</blockquote></div>
    </details>
  {/if}

  <p class="tiny faint">{COVERAGE[dx.coverage]} Source: {SRC[dx.src].label}, {SRC[dx.src].cite}{dx.page ? `, ${dx.page}` : ""}.</p>
</div>

<style>
  .verdict { display: flex; flex-direction: column; gap: 10px; }
  .stack { display: flex; flex-direction: column; gap: 10px; }
  .dots { list-style: disc; padding-left: 20px; margin-top: 4px; display: flex; flex-direction: column; gap: 2px; }
  details.sub summary { cursor: pointer; }
</style>
