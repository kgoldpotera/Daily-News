<script lang="ts">
  import { onMount } from 'svelte';
  import type { Article } from '$lib/types';

  let kenya: Article[] = [];
  let globalBrief: Article[] = [];
  let errorMsg = '';
  let lastUpdated = '';

  // Filters
  let sourceFilter = 'All';
  let categoryFilter = 'All';

  const TIME_OPTS = ['1h', '3h', '24h'] as const;
  type TimeOpt = typeof TIME_OPTS[number];
  let timeFilter: TimeOpt = '24h';

  function withinRange(iso: string) {
    const hours: number = timeFilter === '1h' ? 1 : timeFilter === '3h' ? 3 : 24;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return true;
    return Date.now() - t <= hours * 3600_000;
  }
  function applyFilters(items: Article[]) {
    return items
      .filter((a) => (sourceFilter === 'All' || a.source.includes(sourceFilter)))
      .filter((a) => (categoryFilter === 'All' || a.category === categoryFilter))
      .filter((a) => withinRange(a.publishedAt));
  }

  // Visible counts + reset on filter change
  let visibleKe = 18;
  let visibleGl = 18;
  function resetVisible() { visibleKe = 18; visibleGl = 18; }
  $: (sourceFilter, categoryFilter, timeFilter, resetVisible());

  async function refresh() {
    const errs: string[] = [];
    try {
      const keR = await fetch('/api/kenya'); const keJ = await keR.json();
      if (keR.ok) kenya = (keJ.items ?? []) as Article[];
      else errs.push(`Kenya HTTP ${keR.status}${keJ?.error ? ' • ' + keJ.error : ''}`);
    } catch (e) { errs.push(`Kenya fetch error: ${String(e)}`); }

    try {
      const glR = await fetch('/api/global'); const glJ = await glR.json();
      if (glR.ok) globalBrief = (glJ.items ?? []) as Article[];
      else errs.push(`Global HTTP ${glR.status}${glJ?.error ? ' • ' + glJ.error : ''}`);
    } catch (e) { errs.push(`Global fetch error: ${String(e)}`); }

    lastUpdated = new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    errorMsg = errs.join(' | ');
  }

  const REFRESH_MIN = Number(import.meta.env.VITE_REFRESH_MINUTES ?? 5);
  onMount(() => {
    (async () => { await refresh(); })();
    const iv = setInterval(refresh, REFRESH_MIN * 60_000);
    return () => clearInterval(iv);
  });
</script>

<main class="container">
  <!-- HERO -->
  <section class="hero">
    <h1>Kenya Now • Global Brief</h1>
    <p>Fast, clean headlines from Kenya • concise world summaries. No noise—just news.</p>
  </section>

  <header style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px;">
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <select bind:value={sourceFilter}>
        <option>All</option>
        {#each Array.from(new Set(kenya.map((k) => k.source))) as s (s)}
          <option>{s}</option>
        {/each}
      </select>

      {#each ['All','Politics','Business','Sports','Tech','Health','Entertainment'] as c (c)}
        <button class="card" style="padding:6px 10px" on:click={() => (categoryFilter = c)} aria-pressed={categoryFilter===c}>{c}</button>
      {/each}

      {#each TIME_OPTS as t (t)}
        <button class="card" style="padding:6px 10px" on:click={() => (timeFilter = t)} aria-pressed={timeFilter===t}>{t}</button>
      {/each}
    </div>

    <div style="display:flex;align-items:center;gap:8px;">
      <small class="muted">Updated {lastUpdated} EAT</small>
      <button class="card" style="padding:6px 10px" on:click={refresh} aria-label="Refresh">↻ Refresh</button>
    </div>
  </header>

  {#if errorMsg}
    <p class="muted" style="color:#ff6b6b;">{errorMsg}</p>
  {/if}

  <!-- Kenya -->
  <h2>Latest Kenya</h2>
  <ul class="grid">
    {#each applyFilters(kenya).slice(0, visibleKe) as a (a.id || a.url)}
      <li class="card">
        <a href={a.url} target="_blank" rel="noopener noreferrer">
          {#if a.image}
            <div class="imgwrap">
              <img src={a.image} alt={a.title} loading="lazy" referrerpolicy="no-referrer" />
            </div>
          {/if}
          <h3 style="margin:0 0 6px;">{a.title}</h3>
          {#if a.excerpt}<p class="muted" style="margin:6px 0 10px;">{a.excerpt}</p>{/if}
          <footer class="muted" style="font-size:.85rem;">
            <span>{a.source}</span> · <time>{new Date(a.publishedAt).toLocaleTimeString()}</time> · {a.category || '—'}
          </footer>
        </a>
      </li>
    {/each}
  </ul>
  {#if applyFilters(kenya).length > visibleKe}
    <button class="card" style="padding:10px" on:click={() => (visibleKe += 18)}>Load more</button>
  {/if}

  <!-- Global -->
  <h2 style="margin-top:22px;">Global Brief</h2>
  <ul class="grid">
    {#each applyFilters(globalBrief).slice(0, visibleGl) as a (a.id || a.url)}
      <li class="card">
        <a href={a.url} target="_blank" rel="noopener noreferrer">
          {#if a.image}
            <div class="imgwrap">
              <img src={a.image} alt={a.title} loading="lazy" referrerpolicy="no-referrer" />
            </div>
          {/if}
          <h3 style="margin:0 0 6px;">{a.title}</h3>
          {#if a.summary}<p class="muted" style="margin:6px 0 10px;">{a.summary}</p>{/if}
          <footer class="muted" style="font-size:.85rem;">
            <span>{a.source}</span> · <time>{new Date(a.publishedAt).toLocaleTimeString()}</time> · {a.category || '—'}
          </footer>
        </a>
      </li>
    {/each}
  </ul>
  {#if applyFilters(globalBrief).length > visibleGl}
    <button class="card" style="padding:10px" on:click={() => (visibleGl += 18)}>Load more</button>
  {/if}
</main>
