<script lang="ts">
  import type { Article } from '$lib/types';
  export let items: Article[] = []; // expects newest first
  $: lead = items[0];
  $: side = items.slice(1,5);
</script>

<section class="hero container">
  {#if lead}
  <div class="hero-grid">
    <a class="hero-lead" href={lead.url} target="_blank" rel="noopener">
      {#if lead.image}<img src={lead.image} alt={lead.title} loading="lazy" class="leadimg"/>{/if}
      <div class="body">
        {#if lead.category}<div class="kicker">{lead.category}</div>{/if}
        <h2>{lead.title}</h2>
        {#if lead.excerpt || lead.summary}
          <p class="muted">{lead.excerpt || lead.summary}</p>
        {/if}
        <div class="meta">{lead.source} · {new Date(lead.publishedAt).toLocaleTimeString()}</div>
      </div>
    </a>

    <div class="hero-side">
      {#each side as a (a.id || a.url)}
      <a class="card" href={a.url} target="_blank" rel="noopener">
        {#if a.image}<img class="thumb" src={a.image} alt={a.title} loading="lazy"/>{/if}
        <div class="body">
          {#if a.category}<div class="kicker">{a.category}</div>{/if}
          <div style="font-weight:600;line-height:1.25">{a.title}</div>
          <div class="meta">{a.source} · {new Date(a.publishedAt).toLocaleTimeString()}</div>
        </div>
      </a>
      {/each}
    </div>
  </div>
  {/if}
</section>
