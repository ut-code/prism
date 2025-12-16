<script lang="ts">
  import MdiPin from "~icons/mdi/pin";

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();
</script>

<MdiPin class={className} />
