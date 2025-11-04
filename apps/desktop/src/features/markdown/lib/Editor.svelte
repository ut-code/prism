<script lang="ts">
  import EditorCore from "./EditorCore.svelte";

  interface Props {
    doc?: string;
    theme: "light" | "dark";
  }
  let { doc = $bindable(""), theme }: Props = $props();
</script>

<EditorCore bind:doc {theme} />
