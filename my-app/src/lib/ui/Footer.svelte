<!-- src/lib/ui/Footer.svelte -->
<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="site-footer" role="contentinfo">
  <div class="wrap">
    <p class="tagline">
      Fast, clean headlines from Kenya + concise world summaries. No noise — just news.
    </p>

    <nav class="actions" aria-label="Follow">
      <a class="chip" href="/contact">Contact Us</a>
      <a class="chip" href="mailto:news@yourdomain.tld">Email</a>
      <span class="copy">© {year} Kenya Now</span>
    </nav>
  </div>
</footer>

<style>
  /* Make it “sticky” when the page wrapper is a flex column */
  .site-footer {
    margin-top: auto; /* key line for sticky-in-flex */
    color: #fff;
    border-top: 1px solid #ffffff26;
    padding: .65rem 1rem;

    /* Same theme direction as header (palette already defined in app.css) */
    background: linear-gradient(
      100deg,
      var(--hdr-crow) 0%,
      var(--hdr-umber) 55%,
      var(--hdr-rose) 100%
    );
  }

  .wrap {
    width: min(1200px, 100%);
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
  }

  .tagline {
    margin: 0;
    font-size: .95rem;
    line-height: 1.2;
    text-wrap: balance;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: .5rem;
    flex-wrap: wrap;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .35rem .6rem;
    border-radius: 999px;
    border: 1px solid #ffffff33;
    background: #ffffff1a;
    color: #fff;
    text-decoration: none;
    font-size: .9rem;
    white-space: nowrap;
  }
  .chip:hover {
    background: #ffffff26;
  }

  .copy {
    opacity: .95;
    font-size: .9rem;
    margin-left: .25rem;
  }

  @media (max-width: 720px) {
    .wrap {
      flex-direction: column;
      align-items: stretch;
      gap: .6rem;
    }
    .actions {
      justify-content: space-between;
    }
    .copy {
      margin-left: 0;
      order: 2;
      width: 100%;
      text-align: right;
    }
  }
</style>
