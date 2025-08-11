<script lang="ts">
  import { onMount } from 'svelte';
  import type { Article } from '$lib/types';

  import Header from '$lib/ui/Header.svelte';
  import Footer from '$lib/ui/Footer.svelte';
  import Hero from '$lib/ui/Hero.svelte';
  import Card from '$lib/ui/ArticleCard.svelte';

  let kenya: Article[] = [];
  let globalBrief: Article[] = [];
  let errorMsg = '';

  async function refresh() {
    const errs: string[] = [];

    try {
      const r = await fetch('/api/kenya', { cache: 'no-store' });
      const j = await r.json();
      if (r.ok) kenya = (j.items ?? []) as Article[];
      else errs.push(`Kenya ${r.status}${j?.error ? ' • ' + j.error : ''}`);
    } catch (e) {
      errs.push(`Kenya fetch error: ${String(e)}`);
    }

    try {
      const r = await fetch('/api/global', { cache: 'no-store' });
      const j = await r.json();
      if (r.ok) globalBrief = (j.items ?? []) as Article[];
      else errs.push(`Global ${r.status}${j?.error ? ' • ' + j.error : ''}`);
    } catch (e) {
      errs.push(`Global fetch error: ${String(e)}`);
    }

    errorMsg = errs.join(' | ');
  }

  onMount(refresh);

  // Derived lists
  $: kenyaTop = kenya;
  $: globalTop = globalBrief;

  // Pagination
  let visibleKe = 12;
  let visibleGl = 8;

  $: kenyaShown = kenyaTop.slice(0, visibleKe);
  $: globalShown = globalTop.slice(0, visibleGl);
</script>

<!-- Page flex wrapper ensures footer sticks to bottom -->
<div class="page">
  <!-- Header / nav (sticky via component styles) -->
  <Header active="News" />

  <!-- Main grows to fill remaining height -->
  <main class="content">
    <!-- Lead hero using first few Kenya items -->
    <Hero items={kenyaTop} />

    <section class="container section">
      <div class="section-header">
        <h3>Latest Kenya</h3>
      </div>

      {#if errorMsg}
        <p class="muted" style="color:#b00020;">{errorMsg}</p>
      {/if}

      <div class="grid">
        {#each kenyaShown as a (a.id || a.url)}
          <Card {a} />
        {/each}
      </div>

      {#if kenyaTop.length > visibleKe}
        <button class="btn loadmore" on:click={() => (visibleKe += 12)}>Load more</button>
      {/if}
    </section>

    <section class="container section">
      <div class="section-header">
        <h3>Global Brief</h3>
      </div>

      <div class="grid">
        {#each globalShown as a (a.id || a.url)}
          <Card {a} />
        {/each}
      </div>

      {#if globalTop.length > visibleGl}
        <button class="btn loadmore" on:click={() => (visibleGl += 8)}>Load more</button>
      {/if}
    </section>
  </main>

  <Footer />
</div>

<style>
  /* Flex column page: header (auto), main (flex:1), footer (auto) */
  .page {
    min-height: 100dvh; /* modern viewport unit */
    min-height: 100svh; /* fallback on mobile Safari */
    display: flex;
    flex-direction: column;
  }
  .content {
    flex: 1 0 auto;
    display: block;
  }
</style>
