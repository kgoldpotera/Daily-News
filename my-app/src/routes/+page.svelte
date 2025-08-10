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
  let lastUpdated = '';

  // Simple category filter chips for the new UI
  const chips = ['All', 'Politics', 'Business', 'Sports', 'Tech', 'Health', 'Entertainment'] as const;
  type Chip = typeof chips[number];
  let categoryFilter: Chip = 'All';

  function applyFilter(items: Article[]) {
    if (categoryFilter === 'All') return items;
    return items.filter((a) => a.category === categoryFilter);
  }

  async function refresh() {
    const errs: string[] = [];
    try {
      const r = await fetch('/api/kenya');
      const j = await r.json();
      if (r.ok) kenya = (j.items ?? []) as Article[];
      else errs.push(`Kenya ${r.status}${j?.error ? ' • ' + j.error : ''}`);
    } catch (e) {
      errs.push(`Kenya fetch error: ${String(e)}`);
    }

    try {
      const r = await fetch('/api/global');
      const j = await r.json();
      if (r.ok) globalBrief = (j.items ?? []) as Article[];
      else errs.push(`Global ${r.status}${j?.error ? ' • ' + j.error : ''}`);
    } catch (e) {
      errs.push(`Global fetch error: ${String(e)}`);
    }

    lastUpdated = new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    errorMsg = errs.join(' | ');
  }

  onMount(refresh);

  // Derived lists for the UI
  $: kenyaTop = applyFilter(kenya);
  $: globalTop = applyFilter(globalBrief);

  // Pagination control (avoids reassigning reactive var)
  let visibleKe = 12;
  $: kenyaShown = kenyaTop.slice(0, visibleKe);
</script>

<!-- Header / nav (sticky) -->
<Header active="News" />

<!-- Lead hero using first few Kenya items -->
<Hero items={kenyaTop} />

<section class="container section">
  <div class="section-header">
    <h3>Latest Kenya</h3>
    <div class="chips">
      {#each chips as c (c)}
        <button
          class="chip"
          on:click={() => (categoryFilter = c)}
          aria-pressed={categoryFilter === c}
        >
          {c}
        </button>
      {/each}
      <small class="muted">Updated {lastUpdated} EAT</small>
      <button class="btn" on:click={refresh} aria-label="Refresh">↻ Refresh</button>
    </div>
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
    {#each globalTop.slice(0, 8) as a (a.id || a.url)}
      <Card {a} />
    {/each}
  </div>
</section>

<Footer />
