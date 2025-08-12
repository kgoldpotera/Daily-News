<script lang="ts">
  import Header from '$lib/ui/Header.svelte';
  import Footer from '$lib/ui/Footer.svelte';
  import Card from '$lib/ui/ArticleCard.svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;
  const { cat, items, total, page, pageSize, hasMore } = data;

  function nextPage() {
    const p = page + 1;
    goto(`?page=${p}&size=${pageSize}`, { keepFocus: true, noScroll: true });
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
