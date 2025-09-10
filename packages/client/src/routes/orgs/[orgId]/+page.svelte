<script lang="ts">
  import type { Id } from "@packages/convex";
  import { page } from "$app/state";
  import ChatApp from "~/components/app/ChatApp.svelte";

  const orgId = $derived(page.params.orgId as Id<"organizations">);
</script>

<ChatApp
  organizationId={orgId}
  screenMode={{ type: "chat", selectedChannelId: undefined }}
/>
