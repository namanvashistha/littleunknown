<script lang="ts">
  import { theme, toggleTheme } from "../lib/state.svelte.ts";
  import Icon from "./Icon.svelte";

  let { title, back, backLabel = "Back" }: { title: string; back?: string; backLabel?: string } = $props();
</script>

<header class="top">
  {#if back}<a class="iconbtn" href={back} aria-label={backLabel}><Icon name="back" /></a>{/if}
  <span class="top-title">{title}</span>
  <button class="iconbtn" onclick={toggleTheme} aria-label={theme.value === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
    <Icon name={theme.value === "dark" ? "sun" : "moon"} />
  </button>
</header>
