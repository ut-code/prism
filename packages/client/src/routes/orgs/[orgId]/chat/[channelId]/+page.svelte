<script lang="ts">
  import { type Id } from "@packages/convex";
  import { page } from "$app/state";
  import ChatApp from "~/components/app/ChatApp.svelte";

  const { orgId, channelId } = $derived(page.params);
</script>

<ChatApp
  organizationId={orgId as Id<"organizations">}
  channelId={channelId as Id<"channels">}
/>
