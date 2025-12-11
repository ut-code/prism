<script lang="ts">
  import ChatApp from "@/components/app/ChatApp.svelte";
  import { page } from "$app/state";

  const { orgId, channelId } = $derived(page.params);
</script>

<ChatApp
  organizationId={orgId as string}
  screenMode={{ type: "chat", selectedChannelId: channelId as string }}
/>
