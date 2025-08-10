<script lang="ts">
  type AdminSource = {
    id: string; label: string; url: string; ttlMs?: number; active?: boolean;
  };

  let items: AdminSource[] = [];
  let saving: Record<string, boolean> = {};
  let msg = '';

  async function load() {
    msg = '';
    try {
      const r = await fetch('/api/admin/sources');
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      items = (j.items ?? []) as AdminSource[];
    } catch (e) {
      msg = String(e);
    }
  }

  async function patch(id: string, patch: Partial<AdminSource>) {
    saving[id] = true;
    msg = '';
    try {
      const r = await fetch('/api/admin/sources', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, ...patch })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      // replace row in-place
      items = items.map((s) => (s.id === id ? j.item as AdminSource : s));
      msg = `Saved: ${j.item.label}`;
    } catch (e) {
      msg = `Error: ${String(e)}`;
    } finally {
      saving[id] = false;
    }
  }

  function onToggle(s: AdminSource) {
    patch(s.id, { active: !s.active });
  }
  function onTtlBlur(s: AdminSource, e: Event) {
    const v = Number((e.target as HTMLInputElement).value);
    if (!Number.isFinite(v)) return;
    patch(s.id, { ttlMs: v });
  }

  async function testKenya() {
    msg = 'Fetching /api/kenya…';
    try {
      const r = await fetch('/api/kenya');
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      msg = `Kenya feed OK: ${j.items?.length ?? 0} items`;
    } catch (e) {
      msg = `Kenya feed error: ${String(e)}`;
    }
  }

  load();
</script>

<main class="container">
  <section class="hero">
    <h1>Admin • Sources</h1>
    <p>Toggle Kenyan RSS feeds and adjust per‑source cache TTL. Changes take effect immediately (memory‑only, reset on server restart).</p>
  </section>

  {#if msg}
    <p class="muted" style="margin-bottom:10px;">{msg}</p>
  {/if}

  <div class="card" style="margin-bottom:14px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
    <button class="card" style="padding:6px 10px" on:click={load} aria-label="Reload">↻ Reload</button>
    <button class="card" style="padding:6px 10px" on:click={testKenya} aria-label="Test">🧪 Test /api/kenya</button>
    <span class="muted">Refresh interval on homepage is set by <code>VITE_REFRESH_MINUTES</code> in <code>.env</code>.</span>
  </div>

  <div class="card" style="padding:0;">
    <div style="display:grid; grid-template-columns: 1fr 2fr 160px 120px 100px; gap:10px; padding:10px; border-bottom:1px solid var(--border); font-weight:600;">
      <div>Label</div>
      <div>URL</div>
      <div>TTL (ms)</div>
      <div>Status</div>
      <div>Action</div>
    </div>

    {#each items as s (s.id)}
      <div style="display:grid; grid-template-columns: 1fr 2fr 160px 120px 100px; gap:10px; padding:10px; border-bottom:1px solid var(--border); align-items:center;">
        <div>{s.label}</div>
        <div class="muted" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{s.url}</div>

        <div>
          <input
            type="number"
            min="10000"
            step="1000"
            value={s.ttlMs ?? 300000}
            on:blur={(e) => onTtlBlur(s, e)}
            style="width:150px; padding:6px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--text);"
          />
        </div>

        <div>
          <span class="card" style="padding:4px 8px; background: {s.active !== false ? 'rgba(46,204,113,.15)' : 'rgba(231,76,60,.15)'};">
            {s.active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div>
          <button class="card" style="padding:6px 10px" disabled={saving[s.id]} on:click={() => onToggle(s)}>
            {saving[s.id] ? 'Saving…' : (s.active !== false ? 'Disable' : 'Enable')}
          </button>
        </div>
      </div>
    {/each}
  </div>
</main>
