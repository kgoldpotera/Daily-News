<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Article } from '$lib/types';

  import Header from '$lib/ui/Header.svelte';
  import Footer from '$lib/ui/Footer.svelte';
  import Hero from '$lib/ui/Hero.svelte';
  import Card from '$lib/ui/ArticleCard.svelte';
  import { CAT_TO_SLUG } from '$lib/utils/cat-slug';

  // NEW: local cache helpers
  import { getRecent, upsertArticles } from '$lib/db/news-db';

  let kenya: Article[] = [];
  let globalBrief: Article[] = [];
  let errorMsg = '';

  // 1) Immediately paint from cache (if client)
  if (browser) {
    getRecent('kenya', 60).then(list => { if (list.length) kenya = list; });
    getRecent('global', 60).then(list => { if (list.length) globalBrief = list; });
  }

  // 2) Fetch fresh data (no-store) then update cache
  async function refresh() {
    const errs: string[] = [];

    try {
      const r = await fetch('/api/kenya', { cache: 'no-store' });
      const j = await r.json();
      if (r.ok) {
        kenya = (j.items ?? []) as Article[];
        if (browser && kenya.length) upsertArticles('kenya', kenya);
      } else errs.push(`Kenya ${r.status}${j?.error ? ' • ' + j.error : ''}`);
    } catch (e) {
      errs.push(`Kenya fetch error: ${String(e)}`);
    }

    try {
      const r = await fetch('/api/global', { cache: 'no-store' });
      const j = await r.json();
      if (r.ok) {
        globalBrief = (j.items ?? []) as Article[];
        if (browser && globalBrief.length) upsertArticles('global', globalBrief);
      } else errs.push(`Global ${r.status}${j?.error ? ' • ' + j.error : ''}`);
    } catch (e) {
      errs.push(`Global fetch error: ${String(e)}`);
    }

    errorMsg = errs.join(' | ');
  }

  onMount(refresh);

  // Derived lists
  $: kenyaTop = kenya;
  $: globalTop = globalBrief;

  // Pagination (home)
  let visibleKe = 12;
  let visibleGl = 8;

  $: kenyaShown = kenyaTop.slice(0, visibleKe);
  $: globalShown = globalTop.slice(0, visibleGl);

  // Category preview buckets from both feeds
  const orderedCats = ['Politics','Business','Sports','Tech','Health','Entertainment'] as const;
  type Cat = typeof orderedCats[number];

  $: merged = [...kenyaTop, ...globalTop];
  function topFor(cat: Cat, n = 6) {
    return merged
      .filter(a => a.category === cat)
      .sort((a,b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .slice(0, n);
  }
</script>


<div class="page">
  <Header active="News" />

  <main class="content">
    <Hero items={kenyaTop} />

    <section class="container section">
      <div class="section-header"><h3>Latest Kenya</h3></div>

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
      <div class="section-header"><h3>Global Brief</h3></div>

      <div class="grid">
        {#each globalShown as a (a.id || a.url)}
          <Card {a} />
        {/each}
      </div>

      {#if globalTop.length > visibleGl}
        <button class="btn loadmore" on:click={() => (visibleGl += 8)}>Load more</button>
      {/if}
    </section>

    <!-- Browse by category -->
    <section class="container section">
      <div class="section-header">
        <h3>Browse by category</h3>
      </div>

      {#each orderedCats as c (c)}
        {#if topFor(c).length}
          <div class="cat-block" id={CAT_TO_SLUG[c]}>
            <div class="cat-head">
              <h4>{c}</h4>
              <a class="seeall" href={'/' + CAT_TO_SLUG[c]}>See all →</a>
            </div>
            <div class="grid small">
              {#each topFor(c) as a (a.id || a.url)}
                <Card {a} />
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </section>
  </main>

  <Footer />
</div>

<style>
  .page { min-height: 100dvh; min-height: 100svh; display: flex; flex-direction: column; }
  .content { flex: 1 0 auto; }

  .muted { opacity: .7; }
  .cat-block { margin: 22px 0; }
  .cat-head {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom: 8px;
  }
  .cat-head h4 { margin:0; }
  .seeall {
    text-decoration: none;
    padding:.35rem .6rem; border:1px solid var(--border); border-radius:.6rem;
  }
  .grid.small { --card-min: 230px; }
</style>
