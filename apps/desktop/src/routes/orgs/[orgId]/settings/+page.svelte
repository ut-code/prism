<script lang="ts">
  import { page } from "$app/stores";
  import MemberList from "./MemberList.svelte";
  import OrganizationHeader from "./OrganizationHeader.svelte";
  import OrganizationInfo from "./OrganizationInfo.svelte";
  import { SettingsController } from "./settings-controller.svelte.ts";

  const controller = new SettingsController(() => $page.params.orgId ?? "");
  const organizationId = $derived($page.params.orgId ?? "");
</script>

<svelte:head>
  <title>Organization Settings - Prism</title>
</svelte:head>

<div class="container mx-auto p-6">
  <OrganizationHeader
    organization={controller.organization.data}
    {organizationId}
    isEditing={controller.isEditing}
    editForm={controller.editForm}
    onUpdate={() => controller.handleUpdate()}
    onCancel={() => (controller.isEditing = false)}
    onEdit={() => (controller.isEditing = true)}
  />

  <div class="grid gap-6 lg:grid-cols-2">
    <OrganizationInfo organization={controller.organization.data} />
    <MemberList
      organization={controller.organization.data}
      members={controller.members.data}
      onAddMember={(email) => controller.addMember(email)}
      onRemoveMember={(userId) => controller.handleRemoveMember(userId)}
    />
  </div>
</div>
