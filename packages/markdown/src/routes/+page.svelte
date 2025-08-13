<script lang="ts">
  import { Debounced } from "runed";
  import ThemeToggle from "~/lib/components/ThemeToggle.svelte";
  import Editor from "~/lib/Editor.svelte";
  import { ThemeStore } from "~/lib/stores/theme.svelte";

  /**
   * Document state for the markdown editor
   * Intention: Provide sample content to demonstrate editor features
   */
  let doc = $state(`
# This is h1
## This is h2
### This is h3
#### This is h4
##### This is h5
###### This is h6
*This is italic*
**This is bold**
***This is bold italic***
~~This is strikethrough~~
`);

  /**
   * Debounced document saving example
   * Intention: Demonstrate how to handle document persistence
   * Footgun: Debouncing prevents excessive API calls during rapid typing
   */
  const lazyDoc = new Debounced(() => doc, 500);
  $effect(() => {
    console.log("saving document", lazyDoc.current);
  });

  const themeStore = new ThemeStore();
  $effect(() => {
    document.documentElement.setAttribute("data-theme", themeStore.current);
  });
</script>

<div>
  <div class="container mx-auto p-4">
    <!-- Header with theme toggle -->
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-base-content text-2xl font-bold">Markdown Editor</h1>
      <ThemeToggle {themeStore} />
    </div>
    <Editor bind:doc theme={themeStore.current} />
  </div>
</div>
