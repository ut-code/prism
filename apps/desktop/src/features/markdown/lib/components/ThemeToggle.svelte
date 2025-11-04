<script lang="ts">
  import { ThemeStore } from "$lib/stores/theme.svelte.ts";

  interface Props {
    themeStore: ThemeStore;
  }
  const { themeStore }: Props = $props();
  function handleToggle() {
    themeStore.toggle();
  }
</script>

<!-- 
  DaisyUI theme controller with toggle styling
  Uses checkbox input for accessibility and semantic meaning
  Footgun: Must sync checked state with theme store to avoid desync
-->
<label class="flex cursor-pointer items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-sun"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41-1.41" />
    <path d="m19.07 4.93-1.41-1.41" />
  </svg>

  <input
    type="checkbox"
    class="toggle theme-controller"
    checked={themeStore.current === "dark"}
    onchange={handleToggle}
    aria-label="Toggle theme"
  />

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-moon"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
</label>
