<script lang="ts">
  import Header from '$lib/ui/Header.svelte';
  import Footer from '$lib/ui/Footer.svelte';
  import Card from '$lib/ui/ArticleCard.svelte';
  import type { Article } from '$lib/types';
  import { loadCategoryCacheFirst } from '$lib/cache/news-cache';
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  const catSlug = derived(page, ($p) => $p.params.section);

  let items: Article[] = [];
  let total = 0;
  let pageNum = 1;
  let pageSize = 20;
  let hasMore = false;
  let loading = true;

  async function fetchCategory(slug: string) {
    loading = true;
    console.time(`cat:${slug}:cache-first`);
    const res = await loadCategoryCacheFirst(slug, pageNum, pageSize);
    items = res.rows;
    total = res.total;
    hasMore = pageNum * pageSize < total;
    loading = false;
    console.timeEnd(`cat:${slug}:cache-first`);
  }

  // Run when slug OR pageNum changes
  $: key = `${$catSlug ?? ''}:${pageNum}:${pageSize}`;
  $: if ($catSlug) {
    // fire & forget; Svelte won't loop because we don't change key here
    (async () => { await fetchCategory($catSlug!); })();
  }

  function nextPage() { pageNum += 1; }
</script>

<div class="page">
  <Header active="News" />
  <main class="content container section">
    <h2 style="margin-bottom:12px;">{$catSlug}</h2>
    <p class="muted" style="margin-top:-4px;margin-bottom:16px;">
      Showing {(pageNum - 1) * pageSize + 1}–{Math.min(pageNum * pageSize, total)} of {total}
    </p>

    {#if loading}
      <div class="skeleton row"></div>
      <div class="skeleton row"></div>
    {:else if items.length === 0}
      <p class="muted">No items (yet).</p>
    {:else}
      <div class="grid">
        {#each items as a (a.id || a.url)} <Card {a} /> {/each}
      </div>
    {/if}

    {#if hasMore && !loading}
      <button class="btn loadmore" on:click={nextPage}>Load more</button>
    {/if}
  </main>
  <Footer />
</div>

<style>
  .page { min-height: 100dvh; min-height: 100svh; display: flex; flex-direction: column; }
  .content { flex: 1 0 auto; }
  .muted { opacity: .7; }
  .skeleton { border-radius:12px; background: linear-gradient(90deg, #0001, #fff2, #0001);
    animation: sk 1.2s infinite; height: 120px; margin: 12px 0; }
  @keyframes sk { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
</style>
