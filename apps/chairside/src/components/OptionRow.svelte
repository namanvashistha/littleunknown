<script lang="ts">
  import { compute, ivTxt, rng, type Option } from "../lib/engine.ts";
  import { ROLE } from "../lib/labels.ts";
  import { href, ui } from "../lib/state.svelte.ts";
  import type { Diagnosis, ReadyPatient } from "../lib/types.ts";

  let { dx, o, p }: { dx: Diagnosis; o: Option; p?: ReadyPatient } = $props();

  const blocked = $derived(!!o.why);
  const name = $derived(o.drug.name.split(" (")[0]);
  const brands = $derived((o.drug.brands ?? []).slice(0, 3).join(" · "));
  const formTypes = $derived([...new Set(o.drug.forms.map((f) => f.t))].slice(0, 3).join(", "));
  const dose = $derived.by(() => {
    const { rx } = o;
    if (rx.kind === "none") return "no paediatric dose";
    if (rx.kind === "topical") return rx.instruction ?? "";
    if (rx.kind === "fixed") return rx.fixed ?? "";
    if (!p) return "";
    const c = compute(rx, p);
    return c.dose ? `${rng(c.dose[0], c.dose[1])} mg${rx.every ? ` · ${ivTxt(rx.every)}` : ""}` : "";
  });
</script>

{#snippet body()}
  <span class="l">
    <span class="dn">{name}</span>
    {#if !blocked && dose}<span class="dz" style:color={o.rx.kind === "none" ? "var(--stop)" : null}>{dose}</span>{/if}
    {#if blocked}<span class="why">✕ {o.why}</span>{/if}
    {#if o.ref.note}<span class="mt">{o.ref.note}</span>{/if}
    {#if brands}<span class="br"><b class="lab" style="font-size:9px">BRANDS</b> {brands}</span>{/if}
    {#if formTypes}<span class="mt">{formTypes}</span>{/if}
  </span>
  <span class="rt"><span class="rl">{ROLE[o.ref.role]}</span>{#if !blocked}<span aria-hidden="true" style="font-size:17px">›</span>{/if}</span>
{/snippet}

{#if blocked}
  <div class="opt blk">{@render body()}</div>
{:else if p}
  <a class="opt" href={href.dose(dx.id, o.ref.k)}>{@render body()}</a>
{:else}
  <button class="opt" onclick={() => (ui.sheet = true)}>{@render body()}</button>
{/if}
