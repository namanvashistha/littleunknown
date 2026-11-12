<script lang="ts">
  import { compute, ivTxt, rng, type Option } from "../lib/engine.ts";
  import { href, ui } from "../lib/state.svelte.ts";
  import type { Diagnosis, ReadyPatient } from "../lib/types.ts";
  import Icon from "./Icon.svelte";

  let { dx, o, p }: { dx: Diagnosis; o: Option; p?: ReadyPatient } = $props();

  const name = $derived(o.drug.name.split(" (")[0]);
  const dose = $derived.by(() => {
    const { rx } = o;
    if (rx.kind === "none") return "";
    if (rx.kind === "topical") return rx.instruction ?? "";
    if (rx.kind === "fixed") return rx.fixed ?? "";
    if (!p) return "";
    const c = compute(rx, p);
    return c.dose ? `${rng(c.dose[0], c.dose[1])} mg${rx.every ? `, ${ivTxt(rx.every)}` : ""}` : "";
  });
</script>

{#snippet body()}
  <span class="row-main">
    <span class="row-name">{name}</span>
    {#if o.why}
      <span class="small" style="color:var(--red)">{o.why}</span>
    {:else if o.rx.kind === "none"}
      <span class="small" style="color:var(--red)">No child dose in the guideline</span>
    {:else if dose}
      <span class="small {o.rx.kind === 'topical' || o.rx.kind === 'fixed' ? 'muted' : 'num'}">{dose}</span>
    {:else if !p}
      <span class="small muted">Add weight and age to see the dose</span>
    {/if}
    {#if o.ref.note}<span class="tiny faint">{o.ref.note}</span>{/if}
  </span>
  {#if !o.why}<span class="chev"><Icon name="chevron" size={20} /></span>{/if}
{/snippet}

{#if o.why}
  <div class="row">{@render body()}</div>
{:else if p || o.rx.kind === "topical" || o.rx.kind === "fixed" || o.rx.kind === "none"}
  <a class="row" href={href.dose(dx.id, o.ref.k)}>{@render body()}</a>
{:else}
  <button class="row" onclick={() => (ui.sheet = true)}>{@render body()}</button>
{/if}
