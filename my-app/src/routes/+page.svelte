<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/ui/Header.svelte';
  import Footer from '$lib/ui/Footer.svelte';
  import Hero from '$lib/ui/Hero.svelte';
  import Card from '$lib/ui/ArticleCard.svelte';
  import type { Article } from '$lib/types';
  import { loadHomeCacheFirst } from '$lib/cache/news-cache';
  import { CAT_TO_SLUG } from '$lib/utils/cat-slug';

  let kenya: Article[] = [];
  let globalBrief: Article[] = [];
  let loading = true;

  function splitHome(items: Article[]) {
    const kenyaLike = items.filter(a => /standard|capital|kbc|nation|citizen|ntv|k24/i.test(a.source));
    const globalLike = items.filter(a => !kenyaLike.includes(a));
    return { kenyaLike, globalLike };
  }

  onMount(() => {
    (async () => {
      console.time('home:cache-first');
      const cached = await loadHomeCacheFirst();
      const { kenyaLike, globalLike } = splitHome(cached);
      kenya = kenyaLike;
      globalBrief = globalLike;
      loading = false;
      console.timeEnd('home:cache-first');
    })();

    const onRefresh = (e: Event) => {
      const ce = e as CustomEvent<{ scope: string }>;
      if (ce.detail?.scope === 'home') {
        console.time('home:refresh-apply');
        loadHomeCacheFirst().then((fresh: Article[]) => {
          const s = splitHome(fresh);
          kenya = s.kenyaLike;
          globalBrief = s.globalLike;
          console.timeEnd('home:refresh-apply');
        });
      }
    };
    window.addEventListener('news-refresh', onRefresh as EventListener);
    return () => window.removeEventListener('news-refresh', onRefresh as EventListener);
  });

  let visibleKe = 12, visibleGl = 8;
  $: kenyaShown = (kenya ?? []).slice(0, visibleKe);
  $: globalShown = (globalBrief ?? []).slice(0, visibleGl);

  const orderedCats = ['Business','Sports','Tech','Health','Entertainment'] as const;
  type Cat = typeof orderedCats[number];
  $: merged = [...(kenya ?? []), ...(globalBrief ?? [])];
  function topFor(cat: Cat, n=6) {
    return merged.filter(a => a.category === cat)
      .sort((a,b)=>+new Date(b.publishedAt)-+new Date(a.publishedAt))
      .slice(0,n);
  }
</script>

<div class="page">
  <Header active="News" />
  <main class="content">
    {#if loading}
      <div class="skeleton hero"></div>
      <div class="container section">
        <div class="skeleton row"></div>
        <div class="skeleton row"></div>
      </div>
    {:else}
      <Hero items={kenya} />

      <section class="container section">
        <div class="section-header"><h3>Latest Kenya</h3></div>
        <div class="grid">
          {#each kenyaShown as a (a.id || a.url)} <Card {a} /> {/each}
        </div>
        {#if kenya.length > visibleKe}
          <button class="btn loadmore" on:click={() => (visibleKe += 12)}>Load more</button>
        {/if}
      </section>

      <section class="container section">
        <div class="section-header"><h3>Global Brief</h3></div>
        <div class="grid">
          {#each globalShown as a (a.id || a.url)} <Card {a} /> {/each}
        </div>
        {#if globalBrief.length > visibleGl}
          <button class="btn loadmore" on:click={() => (visibleGl += 8)}>Load more</button>
        {/if}
      </section>

      <section class="container section">
        <div class="section-header"><h3>Browse by category</h3></div>
        {#each orderedCats as c (c)}
          {#if topFor(c).length}
            <div class="cat-block" id={CAT_TO_SLUG[c]}>
              <div class="cat-head">
                <h4>{c}</h4>
                <a class="seeall" href={'/' + CAT_TO_SLUG[c]}>See all →</a>
              </div>
              <div class="grid small">
                {#each topFor(c) as a (a.id || a.url)} <Card {a} /> {/each}
              </div>
            </div>
          {/if}
        {/each}
      </section>
    {/if}
  </main>
  <Footer />
</div>

<style>
  .page { min-height:100dvh; min-height:100svh; display:flex; flex-direction:column; }
  .content { flex:1 0 auto; }
  .grid.small { --card-min:230px; }
  .skeleton { border-radius:12px; background: linear-gradient(90deg, #0001, #fff2, #0001);
    animation: sk 1.2s infinite; }
  .skeleton.hero { height: 180px; margin: 14px 12px; }
  .skeleton.row { height: 120px; margin: 12px 0; }
  @keyframes sk { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
</style>
