<script lang="ts">
  import Header from '$lib/ui/Header.svelte';
  import Footer from '$lib/ui/Footer.svelte';
  import Card from '$lib/ui/ArticleCard.svelte';
  import type { PageData } from './$types';
  import { browser } from '$app/environment';
  import { getRecent, upsertArticles } from '$lib/db/news-db';

  export let data: PageData;
  let { cat, items, total, page, pageSize, hasMore } = data;

  // Paint cached first (client)
  if (browser && cat) {
    Promise.all([getRecent('kenya', 80), getRecent('global', 80)]).then(([k, g]) => {
      const cached = [...k, ...g].filter(a => a.category === cat);
      if (cached.length && !items.length) {
        items = cached.slice(0, pageSize);
        total = cached.length;
        hasMore = cached.length > pageSize;
      }
    });
  }

  // If the loaded data has items, refresh the cache too
  $: if (browser && items?.length) {
    // No harm in updating both feeds—upsert handles IDs
    upsertArticles('kenya', items);
    upsertArticles('global', items);
  }
</script>


<div class="page">
  <Header active={cat ?? 'News'} />

  <main class="content container section">
    {#if !cat}
      <h2>Not found</h2>
      <p class="muted">That section doesn’t exist.</p>
    {:else}
      <h2 style="margin-bottom:12px;">{cat}</h2>
      <p class="muted" style="margin-top:-4px;margin-bottom:16px;">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>

      <div class="grid">
        {#each items as a (a.id || a.url)}
          <Card {a} />
        {/each}
      </div>

      {#if hasMore}
        <button class="btn loadmore" on:click={nextPage}>Load more</button>
      {/if}
    {/if}
  </main>

  <Footer />
</div>

<style>
  .page { min-height: 100dvh; min-height: 100svh; display: flex; flex-direction: column; }
  .content { flex: 1 0 auto; }
  .muted { opacity: .7; }
</style>
