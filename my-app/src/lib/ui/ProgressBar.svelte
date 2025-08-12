<script lang="ts">
  import { navigating } from '$app/stores';
  $: active = $navigating !== null;
</script>

<div class="progress" hidden={!active}>
  <div class="bar" />
</div>

<style>
  .progress[hidden] { display: none; }
  .progress {
    position: fixed;
    inset: 0 0 auto 0;
    height: 3px;
    z-index: 999;
  }
  .bar {
    height: 100%;
    width: 30%;
    background: linear-gradient(90deg, var(--hdr-rose), #fff);
    border-radius: 0 6px 6px 0;
    animation: load 1.1s ease-in-out infinite;
    opacity: .9;
  }
  @keyframes load {
    0%   { transform: translateX(-120%); }
    60%  { transform: translateX(160%); }
    100% { transform: translateX(180%); }
  }
</style>
