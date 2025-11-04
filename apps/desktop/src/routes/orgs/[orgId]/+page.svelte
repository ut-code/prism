<script lang="ts">
  import type { Id } from "@apps/convex";
  import ChatApp from "@/components/app/ChatApp.svelte";
  import { page } from "$app/state";

  const orgId = $derived(page.params.orgId as Id<"organizations">);
</script>

<ChatApp organizationId={orgId} screenMode={{ type: "top" }} />
