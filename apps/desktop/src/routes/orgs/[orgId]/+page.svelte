<script lang="ts">
  import ChatApp from "@/components/app/ChatApp.svelte";
  import { page } from "$app/state";

  const orgId = $derived(page.params.orgId as string);
</script>

<ChatApp organizationId={orgId} screenMode={{ type: "top" }} />
