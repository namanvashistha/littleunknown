<script lang="ts">
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import { DX, RX } from "./lib/data.ts";
  import { nav, ui } from "./lib/state.svelte.ts";
  import Browse from "./components/Browse.svelte";
  import DxView from "./components/DxView.svelte";
  import DoseView from "./components/DoseView.svelte";
  import PatientSheet from "./components/PatientSheet.svelte";
  import Patients from "./components/Patients.svelte";

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // A clinic tablet may stay open all day: look for new guidance every hour.
      if (reg) setInterval(() => reg.update(), 60 * 60 * 1000);
    },
  });

  const dx = $derived.by(() => {
    const r = nav.route;
    return r.view === "browse" || r.view === "patients" ? undefined : DX.find((d) => d.id === r.dx);
  });
  const rx = $derived(nav.route.view === "dose" ? RX[nav.route.rx] : undefined);
  const rxKey = $derived(nav.route.view === "dose" ? nav.route.rx : "");
  // A dose page only opens for a regimen this diagnosis lists, or its pain cover.
  const rxBelongs = $derived(
    !!dx && !!rx && ((dx.rx ?? []).some((r) => r.k === rxKey) || (!!dx.analgesia && (rxKey === "para" || rxKey === "ibu"))),
  );

  $effect(() => {
    document.title = dx
      ? `${dx.n} · Chairside`
      : nav.route.view === "patients" ? "Patients · Chairside" : "Chairside — paediatric dental prescribing";
  });
</script>

<div inert={ui.sheet}>
  {#if nav.route.view === "dose" && dx && rx && rxBelongs}
    {#key rxKey}<DoseView {dx} {rx} />{/key}
  {:else if nav.route.view === "patients"}
    <Patients />
  {:else if nav.route.view !== "browse" && dx}
    <DxView {dx} />
  {:else}
    <Browse />
  {/if}
</div>

{#if ui.sheet}<PatientSheet />{/if}

{#if $needRefresh}
  <div class="toast" role="status">
    Updated guidance is ready.
    <button onclick={() => updateServiceWorker(true)}>Reload</button>
  </div>
{:else if ui.toast}
  <div class="toast" role="status">{ui.toast}</div>
{/if}
