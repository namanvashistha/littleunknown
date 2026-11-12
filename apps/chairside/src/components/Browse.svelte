<script lang="ts">
  import { DRUGS, DX, RX, SRC } from "../lib/data.ts";
  import { href } from "../lib/state.svelte.ts";
  import { VERDICT } from "../lib/labels.ts";
  import PatientBar from "./PatientBar.svelte";

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

<nav class="nav">
  <a class="bk" href={href.patients()} aria-label="Patients">←</a><span class="t">Diagnoses</span><span class="lab">AAPD · 2024</span>
</nav>
<PatientBar />
<div class="hd"><h1 class="h1">What are you<br />treating?</h1></div>
<label class="sr" for="q">Search</label>
<input id="q" class="srch" type="search" placeholder="Search diagnosis, drug or brand" bind:value={q} autocomplete="off" />

{#each groups as g (g)}
  {@const rows = list.filter((d) => d.g === g)}
  <h2 class="gh"><span class="lab">{g}</span><span class="lab">{rows.length}</span></h2>
  {#each rows as d (d.id)}
    <a class="dxr" href={href.dx(d.id)}>
      <span class="vb v-{d.verdict}"></span>
      <span class="nm">{d.n}</span>
      <span class="tg {d.verdict}">{VERDICT[d.verdict].label.toUpperCase()}</span>
    </a>
  {/each}
{/each}
{#if !list.length}
  <div class="sec"><p class="sub">Nothing matches “{q}”.</p></div>
{/if}

<div class="sec hv">
  <p class="cite">
    Decision support. It does not replace the independent judgement of the clinician.<br />
    {SRC.meds.label} — {SRC.meds.cite}, {SRC.meds.rev}.<br />
    Made by <a href="/" style="text-decoration:underline">little unknown</a>.
  </p>
</div>
