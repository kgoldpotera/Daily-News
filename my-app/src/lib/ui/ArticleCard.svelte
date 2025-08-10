<script lang="ts">
  import type { Article } from '$lib/types';
  export let a: Article;
</script>

<a class="card" href={a.url} target="_blank" rel="noopener">
  {#if a.image}<img class="thumb" src={a.image} alt={a.title} loading="lazy"/>{/if}
  <div class="pad">
    {#if a.category}<div class="kicker">{a.category}</div>{/if}
    <h4>{a.title}</h4>
    {#if a.summary || a.excerpt}<p class="muted" style="margin:.25rem 0 .35rem">{a.summary || a.excerpt}</p>{/if}
    <div class="meta">{a.source} · {new Date(a.publishedAt).toLocaleTimeString()}</div>
  </div>
</a>
