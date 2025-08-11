<script lang="ts">
  import type { Article } from '$lib/types';
  export let a: Article;
</script>

<a class="card" href={a.url} target="_blank" rel="noopener noreferrer">
  {#if a.image}
    <img class="thumb" src={a.image} alt={a.title} loading="lazy" referrerpolicy="no-referrer" />
  {:else}
    <div class="thumb placeholder" aria-hidden="true"></div>
  {/if}

  <div class="pad">
    {#if a.category}
      <div class="kicker">{a.category}</div>
    {/if}
    <h4 class="title">{a.title}</h4>

    {#if a.summary || a.excerpt}
      <p class="muted excerpt">{a.summary || a.excerpt}</p>
    {/if}

    <div class="meta">
      {a.source} · {new Date(a.publishedAt).toLocaleTimeString()}
    </div>
  </div>
</a>

<style>
  .card {
    display: block;
    border: 1px solid var(--border);
    background: var(--background);
    border-radius: 14px;
    overflow: hidden;
    transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
    text-decoration: none;
    color: var(--text-color);
    cursor: pointer;
  }
  .card:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0,0,0,.12);
    border-color: color-mix(in oklab, var(--border) 60%, var(--hdr-rose, #edbfc8));
  }
  .card:focus-visible {
    outline: 3px solid color-mix(in oklab, var(--hdr-rose, #edbfc8) 70%, white);
    outline-offset: 2px;
  }

  /* Image / placeholder share the same box to avoid layout shift */
  .thumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    display: block;
    object-fit: cover;
    background: var(--background-alt);
  }
  .placeholder {
    /* soft gradient using your header palette as fallback */
    background: linear-gradient(
      135deg,
      var(--hdr-crow, #260c1a) 0%,
      var(--hdr-umber, #7c392c) 60%,
      var(--hdr-rose, #edbfc8) 100%
    );
    opacity: .35;
  }

  .pad { padding: .75rem .85rem .85rem; }

  .kicker {
    display: inline-block;
    font-size: .72rem;
    letter-spacing: .3px;
    font-weight: 700;
    color: var(--hdr-rose, #edbfc8);
    background: color-mix(in oklab, var(--hdr-rose, #edbfc8) 18%, transparent);
    border: 1px solid color-mix(in oklab, var(--hdr-rose, #edbfc8) 30%, transparent);
    padding: .18rem .45rem;
    border-radius: .45rem;
    margin-bottom: .35rem;
  }

  .title {
    margin: 0 0 .35rem 0;
    line-height: 1.25;
    font-size: 1.02rem;
  }

  .excerpt {
    margin: .25rem 0 .45rem;
  }

  .meta {
    font-size: .86rem;
    color: var(--muted);
  }
</style>
