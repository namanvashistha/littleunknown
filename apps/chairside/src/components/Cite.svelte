<script lang="ts">
  import { SRC } from "../lib/data.ts";
  import type { SourceKey } from "../lib/types.ts";

  let { src, page }: { src: SourceKey; page?: string } = $props();
</script>

<div class="sec">
  <p class="cite">
    {SRC[src].label}<br />{SRC[src].cite}{page ? ` · ${page}` : ""} · {SRC[src].rev}
  </p>
</div>
