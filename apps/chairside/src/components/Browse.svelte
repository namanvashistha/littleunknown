<script lang="ts">
  import { DRUGS, DX, RX } from "../lib/data.ts";
  import { VERDICT } from "../lib/labels.ts";
  import { href } from "../lib/state.svelte.ts";
  import Header from "./Header.svelte";
  import Icon from "./Icon.svelte";
  import PatientCard from "./PatientCard.svelte";
  import Tabs from "./Tabs.svelte";

  let q = $state("");

  const haystack = new Map(
    DX.map((d) => [
      d.id,
      [d.n, d.g, ...(d.rx ?? []).flatMap((r) => {
        const drug = DRUGS[RX[r.k]?.drug];
        return drug ? [drug.name, ...(drug.brands ?? [])] : [];
      })].join(" ").toLowerCase(),
    ]),
  );

  const list = $derived.by(() => {
    const t = q.trim().toLowerCase();
    return t ? DX.filter((d) => haystack.get(d.id)!.includes(t)) : DX;
  });
  const groups = $derived([...new Set(list.map((d) => d.g))]);
</script>

<div class="page">
  <Header title="Chairside" />
  <h1 class="title">Conditions</h1>
  <p class="lead">Every condition in Chairside and whether it needs an antibiotic. Tap one for what to do and the doses.</p>
  <PatientCard />
  <label class="sr" for="q">Search</label>
  <input id="q" class="search" type="search" placeholder="Search a condition, medicine or brand" bind:value={q} autocomplete="off" />

  {#each groups as g (g)}
    <h2 class="section-title">{g}</h2>
    <div class="list">
      {#each list.filter((d) => d.g === g) as d (d.id)}
        {@const v = VERDICT[d.verdict]}
        <a class="row" href={href.dx(d.id)}>
          <span class="row-main row-name">{d.n}</span>
          <span class="pill {v.tone}">{v.label}</span>
          <span class="chev"><Icon name="chevron" size={20} /></span>
        </a>
      {/each}
    </div>
  {/each}
  {#if !list.length}
    <p class="card muted">Nothing matches “{q}”. Try a condition like “abscess” or a medicine like “amoxicillin”.</p>
  {/if}

  <p class="tiny faint">Doses from the AAPD Reference Manual. Chairside supports, and doesn't replace, the dentist's own judgement.</p>
</div>
<Tabs />
