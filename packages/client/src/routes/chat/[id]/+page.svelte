<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { type Id } from "@packages/convex";
  import OrganizationChatApp from "$components/organization/OrganizationChatApp.svelte";

  const organizationId = $derived($page.params.id as Id<"organizations">);

  function handleOrganizationChange() {
    goto("/");
  }
</script>

<OrganizationChatApp
  {organizationId}
  onOrganizationChange={handleOrganizationChange}
/>
