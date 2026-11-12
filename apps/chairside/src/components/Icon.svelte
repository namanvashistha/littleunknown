<script lang="ts">
  let { name, size = 22 }: { name: "back" | "chevron" | "sun" | "moon" | "plus" | "copy"; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if name === "back"}<path d="M15 18l-6-6 6-6" />
  {:else if name === "chevron"}<path d="M9 6l6 6-6 6" />
  {:else if name === "sun"}<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  {:else if name === "moon"}<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  {:else if name === "plus"}<path d="M12 5v14M5 12h14" />
  {:else if name === "copy"}<rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
  {/if}
</svg>
