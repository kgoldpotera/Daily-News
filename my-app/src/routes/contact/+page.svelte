<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  // If you put your files in /static, use absolute paths from the site root:
  // e.g. static/bg.jpg  ->  /bg.jpg
  //      static/logo.png -> /logo.png
  const BG_URL = "/bg.jpg";
  const LOGO_URL = "/logo.png";

  // Form state
  let name = "";
  let email = "";
  let phone = "";
  let subject: "News tip" | "Correction" | "General inquiry" | "Partnership" = "News tip";
  let message = "";
  let agree = false;
  let file: File | null = null;

  let sending = false;
  let sent = false;
  let error = "";

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function reset() {
    name = "";
    email = "";
    phone = "";
    subject = "News tip";
    message = "";
    agree = false;
    file = null;
  }

  async function handleSubmit() {
    error = "";

    if (!name || !email || !message) {
      error = "Please fill in your name, email, and message.";
      return;
    }
    if (!emailRe.test(email)) {
      error = "Please enter a valid email address.";
      return;
    }
    if (!agree) {
      error = "Please confirm you agree to our terms before sending.";
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("subject", subject);
    formData.append("message", message);
    if (file) formData.append("attachment", file);

    try {
      sending = true;
      const res = await fetch("/api/contact", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to send");
      sent = true;
      reset();
    } catch (e) {
      error = (e as Error)?.message ?? "Something went wrong. Please try again.";
    } finally {
      sending = false;
    }
  }
</script>

<section class="page">
  <div class="hero" style={`--bg: url('${BG_URL}')`} aria-hidden="true"></div>
  <div class="overlay" aria-hidden="true"></div>

  <header class="topbar">
    <div class="brand">
      <img src={LOGO_URL} alt="SpotlightKE logo" class="logo" />
      <span class="wordmark" aria-label="SpotlightKE">Spotlight<span>KE</span></span>
    </div>
    <nav class="meta">
      <a href="/" class="link">Home</a>
      <a href="/about" class="link">About</a>
      <a href="/contact" aria-current="page" class="link active">Contact</a>
    </nav>
  </header>

  <main class="content" role="main">
    <div class="intro">
      <h1>Contact Us</h1>
      <p>
        We welcome story tips, corrections, and feedback. Use the form to reach
        the SpotlightKE team. For urgent newsroom matters, choose <strong>News tip</strong>
        and include as much detail as possible.
      </p>
    </div>

    <form class="card" on:submit|preventDefault={handleSubmit} novalidate>
      {#if error}
        <div class="alert error" role="alert">{error}</div>
      {/if}
      {#if sent}
        <div class="alert success" role="status">
          Thanks for contacting us — your message has been sent. We'll be in touch.
        </div>
      {/if}

      <div class="grid">
        <div class="field">
          <label for="name">Full name</label>
          <input id="name" name="name" type="text" bind:value={name} autocomplete="name" required />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" bind:value={email} autocomplete="email" required />
        </div>

        <div class="field">
          <label for="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" bind:value={phone} autocomplete="tel" />
        </div>

        <div class="field">
          <label for="subject">Subject</label>
          <select id="subject" name="subject" bind:value={subject}>
            <option>News tip</option>
            <option>Correction</option>
            <option>General inquiry</option>
            <option>Partnership</option>
          </select>
        </div>

        <div class="field field--full">
          <label for="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="8"
            bind:value={message}
            placeholder="Write your message here…"
            required
          />
        </div>

        <div class="field">
          <label for="file">Attachment (optional)</label>
          <input
            id="file"
            name="file"
            type="file"
            on:change={(e) => {
              const input = e.currentTarget as HTMLInputElement;
              file = input.files?.[0] ?? null;
            }}
          />
        </div>

        <div class="field checkbox">
          <input id="agree" name="agree" type="checkbox" bind:checked={agree} />
          <label for="agree">I agree to SpotlightKE's terms and privacy policy.</label>
        </div>
      </div>

      <button class="btn" type="submit" disabled={sending}>
        {#if sending}Sending…{/if}
        {#if !sending}Send message{/if}
      </button>

      <p class="help">
        Prefer email? Reach us at <a href="mailto:hello@spotlightke.co">hello@spotlightke.co</a>
      </p>
    </form>
  </main>

  <footer class="footer" role="contentinfo">
    <p>© {new Date().getFullYear()} SpotlightKE • Independent Kenyan journalism in focus.</p>
  </footer>
</section>

<style>
  :global(html), :global(body) { height: 100%; }
  .page { position: relative; min-height: 100vh; color: #0b0b0b; --surface: rgba(255,255,255,0.9); }
  .hero { position: fixed; inset: 0; background-image: var(--bg); background-size: cover; background-position: center; filter: saturate(1.05); z-index: -2; }
  .overlay { position: fixed; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.55)); z-index: -1; }

  .topbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.25rem; backdrop-filter: blur(6px); background: linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25)); color:#fff; }
  .brand { display:flex; align-items:center; gap:.75rem; }
  .logo { width:44px; height:44px; object-fit:contain; border-radius:8px; background:#fff; padding:4px; }
  .wordmark { font-weight:800; font-size:1.25rem; letter-spacing:.2px; }
  .wordmark span { color:#ffcc00; }
  .meta { display:flex; gap:1rem; }
  .link { color:#f0f0f0; text-decoration:none; opacity:.9; }
  .link:hover, .link.active { opacity:1; text-decoration:underline; }

  .content { display:grid; grid-template-columns:1.2fr 1fr; gap:2rem; width:min(1200px,94%); margin:2rem auto 3rem; color:#fff; }
  @media (max-width: 980px) { .content { grid-template-columns:1fr; } }

  .intro h1 { font-size: clamp(2rem, 2.6vw, 3rem); margin-bottom:.5rem; }
  .intro p { max-width:58ch; line-height:1.55; opacity:.95; }

  .card { background: var(--surface); backdrop-filter: blur(6px); border-radius:16px; padding:1.25rem; color:#111; box-shadow:0 10px 30px rgba(0,0,0,0.25); }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .field { display:grid; gap:.35rem; }
  .field--full { grid-column:1 / -1; }
  .field label { font-weight:600; font-size:.95rem; }

  input[type="text"], input[type="email"], input[type="tel"], input[type="file"], select, textarea {
    border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:.75rem .85rem; font-size:1rem; background:#fff; color:#111;
  }
  textarea { resize:vertical; }
  .checkbox { grid-column:1 / -1; display:grid; grid-template-columns:auto 1fr; align-items:start; gap:.6rem; }
  .checkbox input { margin-top:.25rem; }

  .btn { margin-top:.5rem; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; padding:.8rem 1rem; border-radius:12px; background:#ffcc00; color:#111; font-weight:700; border:none; cursor:pointer; transition:transform .05s ease, filter .2s ease; }
  .btn:hover { filter:brightness(.95); }
  .btn:active { transform: translateY(1px); }
  .btn:disabled { opacity:.6; cursor:not-allowed; }

  .alert { padding:.75rem .9rem; border-radius:10px; margin-bottom:.75rem; font-weight:600; }
  .alert.error { background:#ffe4e4; color:#7a0000; border:1px solid #f2b3b3; }
  .alert.success { background:#e8ffe8; color:#0a6812; border:1px solid #bde7bd; }

  .help { margin-top:1rem; font-size:.95rem; color:#333; }
  .help a { color:#0a4a8a; }

  .footer { width:min(1200px,94%); margin:0 auto 2rem; color:#f0f0f0; text-align:center; opacity:.9; }
</style>
