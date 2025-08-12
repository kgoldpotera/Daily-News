<script lang="ts">
  import { onMount } from 'svelte';
  let mobileOpen = false;
  let scrolled = false;

  const sections = [
    { slug: '/', label: 'News' },
    { slug: '/business', label: 'Business' },
    { slug: '/sports', label: 'Sports' },
    { slug: '/tech', label: 'Tech' },
    { slug: '/entertainment', label: 'Entertainment' },
    { slug: '/health', label: 'Health' }
  ];

  function toggle() { mobileOpen = !mobileOpen; }

  onMount(() => {
    const onScroll = () => (scrolled = window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  });

  export let active: string | undefined;
</script>

<header class:shadowed={scrolled}>
  <div class="bar">
    <div class="inner">
      <a class="brand" href="/" aria-label="SPOTLIGHT KE — Home">
        <!-- SVG logo mark -->
        <img class="mark" src="/logo-spotlightke.svg" alt="" width="22" height="22" decoding="async" />
        <span class="brand-text">SPOTLIGHT KE</span>
      </a>

      <nav class="nav" aria-label="Primary">
        {#each sections as s (s.slug)}
          <a href={s.slug} class="nav__link">{s.label}</a>
        {/each}
      </nav>

      <form class="search" role="search" action="/search">
        <input name="q" placeholder="Search…" aria-label="Search news" />
      </form>

      <button class="hamburger" on:click={toggle} aria-expanded={mobileOpen} aria-controls="mobile-nav">
        ☰
        <span class="sr-only">Open menu</span>
      </button>
    </div>
  </div>

  <nav id="mobile-nav" class="drawer" aria-label="Mobile" hidden={!mobileOpen}>
    {#each sections as s (s.slug)}
      <a href={s.slug} class="drawer__link" on:click={() => (mobileOpen = false)}>{s.label}</a>
    {/each}
  </nav>
</header>

<style>
  header { position: sticky; top: 0; z-index: 50; transition: box-shadow .18s ease; }
  .shadowed { box-shadow: 0 4px 18px rgba(0,0,0,.16); }

  .bar {
    background: linear-gradient(100deg, var(--hdr-crow) 0%, var(--hdr-umber) 55%, var(--hdr-rose) 100%);
    color: #fff;
  }
  .inner {
    display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 1rem;
    width: min(1200px, 100%); margin-inline: auto; padding: .65rem 1rem;
  }

  .brand {
    display: inline-flex; align-items: center; gap: .55rem;
    font-weight: 900; font-size: 1.15rem; text-decoration: none; color: #fff; letter-spacing: .4px;
  }
  /* image mark */
  .mark {
    display: block;
    width: 22px; height: 22px;
  }
  .brand-text { text-transform: uppercase; }

  .nav { display: none; align-items: center; gap: 14px; }
  .nav__link { color: #fff; text-decoration: none; padding: .55rem .4rem; border-bottom: 3px solid transparent; white-space: nowrap; opacity: .95; }
  .nav__link:hover { border-bottom-color: var(--hdr-rose); opacity: 1; }

  .search { display: none; }
  .search input {
    width: 18rem; max-width: 42vw; padding: .55rem .75rem; border-radius: 10px;
    border: 1px solid #ffffff33; background: #ffffff1a; color: #fff; outline: none;
    transition: background .15s ease, border-color .15s ease;
  }
  .search input::placeholder { color: #ffffffbb; }
  .search input:focus { background: #ffffff22; border-color: #ffffff66; }

  .hamburger {
    display: inline-flex; align-items: center; justify-content: center; gap: .4rem;
    padding: .45rem .6rem; line-height: 1; border-radius: 10px; border: 1px solid #ffffff33;
    background: #ffffff1a; color: #fff; cursor: pointer;
  }

  .drawer[hidden] { display: none; }
  .drawer { background: var(--hdr-crow); color: #fff; display: grid; gap: .25rem; padding: .6rem 1rem 1rem; }
  .drawer__link { padding: .7rem .4rem; border-radius: .5rem; text-decoration: none; color: #fff; }
  .drawer__link:hover { background: #ffffff14; }

  @media (min-width: 980px) {
    .hamburger { display: none; }
    .nav { display: flex; }
    .search { display: block; }
  }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }
</style>
