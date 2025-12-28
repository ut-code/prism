<script lang="ts">
  import ChatApp from "@/components/app/ChatApp.svelte";
  import { page } from "$app/state";

  const orgId = $derived(page.params.orgId ?? "");
</script>

<svelte:head>
  <title>Chat - Prism</title>
</svelte:head>

<ChatApp organizationId={orgId} screenMode={{ type: "top" }} />
