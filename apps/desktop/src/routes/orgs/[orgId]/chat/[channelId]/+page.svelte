<script lang="ts">
  import { type Id } from "@apps/convex";
  import ChatApp from "@/components/app/ChatApp.svelte";
  import { page } from "$app/state";

  const { orgId, channelId } = $derived(page.params);
</script>

<ChatApp
  organizationId={orgId as Id<"organizations">}
  screenMode={{ type: "chat", selectedChannelId: channelId as Id<"channels"> }}
/>
