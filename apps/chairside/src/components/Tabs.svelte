<script lang="ts">
  import { href, nav } from "../lib/state.svelte.ts";
  import Icon from "./Icon.svelte";
</script>

<nav class="tabs" aria-label="Sections">
  <div>
    <a href={href.patients()} aria-current={nav.route.view === "patients" ? "page" : undefined}>
      <Icon name="people" /><span>Patients</span>
    </a>
    <a href={href.browse()} aria-current={nav.route.view === "browse" ? "page" : undefined}>
      <Icon name="list" /><span>Conditions</span>
    </a>
  </div>
</nav>

<style>
  .tabs {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 6; background: var(--card); border-top: 1px solid var(--line);
    padding: 6px 16px calc(6px + env(safe-area-inset-bottom, 0px));
  }
  .tabs > div { max-width: 488px; margin: 0 auto; display: flex; gap: 8px; }
  .tabs a {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 0 6px; min-height: 56px;
    border-radius: 12px; font-size: 13px; font-weight: 600; color: var(--faint);
  }
  .tabs a[aria-current="page"] { color: var(--ink); background: var(--soft); }
</style>
