<footer role="contentinfo">
  <div class="grid">
    <section>
      <h3>About</h3>
      <p>Fast, clean headlines from Kenya + concise world summaries. No noise — just news.</p>
    </section>
    <section>
      <h3>Sections</h3>
      <ul>
        <li><a href="/business">Business</a></li>
        <li><a href="/sports">Sports</a></li>
        <li><a href="/tech">Tech</a></li>
        <li><a href="/entertainment">Entertainment</a></li>
        <li><a href="/health">Health</a></li>
      </ul>
    </section>
    <section>
      <h3>Follow</h3>
      <ul>
        <li><a href="https://x.com" rel="noopener">X</a></li>
        <li><a href="https://youtube.com" rel="noopener">YouTube</a></li>
        <li><a href="mailto:news@yourdomain.tld">Email</a></li>
      </ul>
    </section>
  </div>
  <div class="legal">© {new Date().getFullYear()} Kenya Now • All rights reserved.</div>

  <style>
    footer {
      border-top: 1px solid var(--border);
      background: var(--background);
      padding: 2rem 1rem;
      color: var(--text-color);
    }
    .grid {
      width: min(1200px, 100%);
      margin-inline: auto;
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 2fr 1fr 1fr;
    }
    h3 { margin: 0 0 .5rem; font-size: 1rem; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .35rem; }
    a { color: var(--text-color); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .legal {
      width: min(1200px, 100%);
      margin: 1.25rem auto 0;
      font-size: .9rem;
      opacity: .75;
    }
    @media (max-width: 780px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</footer>
