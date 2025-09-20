<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import type { Doc } from "@packages/convex/src/convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { page } from "$app/state";
  import Modal, { ModalManager } from "~/lib/modal/modal.svelte";
  import { useMutation } from "~/lib/useMutation.svelte.ts";

  const roleModalManager = new ModalManager();

  const organizationId = $derived(page.params.orgId as Id<"organizations">);

  const organization = useQuery(api.organizations.get, () => ({
    id: organizationId,
  }));
  const members = useQuery(api.organizations.getMembers, () => ({
    organizationId,
  }));
  const roles = useQuery(api.roles.get, () => ({ organizationId }));
  const updateOrganization = useMutation(api.organizations.update);
  const removeMember = useMutation(api.organizations.removeMember);
  const updateMemberRole = useMutation(api.roles.updateMemberRole);
  const createRole = useMutation(api.roles.createRole);
  const updateRole = useMutation(api.roles.updateRole);
  const deleteRole = useMutation(api.roles.deleteRole);

  let selectedMemberId: Id<"users"> | null = $state(null);
  let selectedRoleIds: Id<"roles">[] = $state([]);

  let newRoleName = $state("");
  let editingRole: Doc<"roles"> | null = $state(null);
  let editingRoleName = $state("");

  let isEditing = $state(false);
  let editForm = $state({
    name: "",
    description: "",
  });

  $effect(() => {
    if (organization.data) {
      editForm.name = organization.data.name;
      editForm.description = organization.data.description || "";
    }
  });

  function openRoleEditor(userId: Id<"users">) {
    selectedMemberId = userId;
    selectedRoleIds =
      members.data?.find((m) => m.userId === userId)?.roleIds || [];
    roleModalManager.dispatch(roleEditorSnippet);
  }

  async function handleUpdateMemberRoles() {
    if (!selectedMemberId) return;

    try {
      await updateMemberRole.run({
        organizationId,
        userId: selectedMemberId,
        roleIds: selectedRoleIds,
      });
      roleModalManager.close();
    } catch (error) {
      console.error("Failed to update member roles:", error);
    }
  }

  async function handleCreateRole() {
    if (!newRoleName.trim()) return;
    try {
      await createRole.run({ organizationId, roleName: newRoleName });
      newRoleName = "";
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  }

  async function handleDeleteRole(roleId: Id<"roles">) {
    try {
      await deleteRole.run({ roleId });
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  }

  function startEditingRole(role: Doc<"roles">) {
    editingRole = role;
    editingRoleName = role.roleName;
  }

  async function handleUpdateRole() {
    if (!editingRole || !editingRoleName.trim()) return;
    try {
      await updateRole.run({
        roleId: editingRole._id,
        roleName: editingRoleName,
      });
      editingRole = null;
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  }

  async function handleUpdate() {
    if (!organizationId) return;

    try {
      console.log("Updating organization...", $state.snapshot(editForm));
      await updateOrganization.run({
        id: organizationId,
        name: editForm.name,
        description: editForm.description,
      });
      isEditing = false;
    } catch (error) {
      console.error("Failed to update organization:", error);
    }
  }

  async function handleRemoveMember(userId: Id<"users">) {
    if (!organizationId) return;

    if (confirm("このメンバーを削除しますか？")) {
      try {
        await removeMember.run({ organizationId, userId });
      } catch (error) {
        console.error("Failed to remove member:", error);
      }
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="mb-6">
    <a href={`/orgs/${organizationId}`} class="btn btn-ghost btn-sm mb-4">
      ← 戻る
    </a>

    {#if organization.data}
      <div class="flex items-center justify-between">
        <div>
          {#if isEditing}
            <input
              bind:value={editForm.name}
              class="input input-bordered input-lg w-full max-w-md"
              placeholder="組織名"
            />
            <textarea
              bind:value={editForm.description}
              class="textarea textarea-bordered mt-2 w-full max-w-md"
              placeholder="組織の説明"
            ></textarea>
          {:else}
            <h1 class="text-base-content text-3xl font-bold">
              {organization.data.name}
            </h1>
            {#if organization.data.description}
              <p class="text-base-content/70 mt-2">
                {organization.data.description}
              </p>
            {/if}
          {/if}
        </div>

        {#if organization.data.permission === "admin"}
          <div class="flex gap-2">
            {#if isEditing}
              <button class="btn btn-primary" onclick={handleUpdate}
                >保存</button
              >
              <button class="btn btn-ghost" onclick={() => (isEditing = false)}
                >キャンセル</button
              >
            {:else}
              <button class="btn btn-outline" onclick={() => (isEditing = true)}
                >編集</button
              >
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex justify-center">
        <span class="loading loading-dots loading-lg"></span>
      </div>
    {/if}
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Organization Info -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">組織情報</h2>
        {#if organization.data}
          <div class="space-y-3">
            <div>
              <span class="font-semibold">作成日:</span>
              {new Date(organization.data.createdAt).toLocaleDateString(
                "ja-JP",
              )}
            </div>
            <div>
              <span class="font-semibold">あなたの権限:</span>
              <div class="badge badge-outline ml-2 capitalize">
                {organization.data.permission}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Members -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="card-title">メンバー</h2>
          {#if organization.data?.permission === "admin"}
            <button class="btn btn-primary btn-sm"> メンバーを追加 </button>
          {/if}
        </div>

        {#if members.data}
          <div class="space-y-2">
            {#each members.data as member}
              <div
                class="bg-base-300 flex items-center justify-between rounded-lg p-3"
              >
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div
                      class="bg-neutral text-neutral-content w-10 rounded-full"
                    >
                      <span class="text-sm"
                        >{member.user?.name?.[0] || "?"}</span
                      >
                    </div>
                  </div>
                  <div>
                    <div class="font-medium">
                      {member.user?.name || "Unknown User"}
                    </div>
                    <div class="text-base-content/70 text-sm">
                      {member.user?.email}
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <div class="badge badge-outline capitalize">
                    {member.permission}
                  </div>
                  {#if roles.data && member.roleIds}
                    {#each member.roleIds as roleId}
                      {@const role = roles.data.find((r) => r._id === roleId)}
                      {#if role}
                        <div class="badge badge-neutral">{role.roleName}</div>
                      {/if}
                    {/each}
                  {/if}
                </div>
                <div class="flex items-center gap-2">
                  {#if organization.data?.permission === "admin"}
                    <button
                      class="btn btn-ghost btn-sm"
                      onclick={() => openRoleEditor(member.userId)}
                    >
                      ロール管理
                    </button>
                  {/if}
                  {#if organization.data?.permission === "admin" && member.userId !== organization.data?.ownerId}
                    <button
                      class="btn btn-ghost btn-sm text-error"
                      onclick={() => handleRemoveMember(member.userId)}
                    >
                      削除
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex justify-center">
            <span class="loading loading-dots loading-md"></span>
          </div>
        {/if}
      </div>
    </div>

    {#if organization.data?.permission === "admin"}
      <!-- Role Management -->
      <div class="card bg-base-200 shadow-xl lg:col-span-2">
        <div class="card-body">
          <h2 class="card-title mb-4">ロール管理</h2>

          <!-- Create Role -->
          <div class="join mb-4">
            <input
              class="input join-item input-bordered w-full"
              placeholder="新しいロール名"
              bind:value={newRoleName}
              onkeydown={(e) => e.key === "Enter" && handleCreateRole()}
            />
            <button
              class="btn btn-primary join-item"
              onclick={handleCreateRole}
            >
              作成
            </button>
          </div>

          <!-- Roles List -->
          <div class="space-y-2">
            {#if roles.data}
              {#each roles.data as role}
                <div
                  class="bg-base-300 flex items-center justify-between rounded-lg p-3"
                >
                  {#if editingRole?._id === role._id}
                    <input
                      class="input input-bordered input-sm w-full"
                      bind:value={editingRoleName}
                      onkeydown={(e) => e.key === "Enter" && handleUpdateRole()}
                    />
                    <div class="flex items-center gap-2">
                      <button
                        class="btn btn-primary btn-sm"
                        onclick={handleUpdateRole}>保存</button
                      >
                      <button
                        class="btn btn-ghost btn-sm"
                        onclick={() => (editingRole = null)}>キャンセル</button
                      >
                    </div>
                  {:else}
                    <div class="font-medium">{role.roleName}</div>
                    <div class="flex items-center gap-2">
                      <button
                        class="btn btn-ghost btn-sm"
                        onclick={() => startEditingRole(role)}>名前変更</button
                      >
                      <button
                        class="btn btn-ghost btn-sm text-error"
                        onclick={() => handleDeleteRole(role._id)}>削除</button
                      >
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

{#snippet roleEditorSnippet()}
  {#if selectedMemberId}
    <h3 class="text-lg font-bold">
      {members.data?.find((m) => m.userId === selectedMemberId)?.user?.name} のロールを編集
    </h3>
    {#if roles.data && roles.data.length > 0}
      <div class="py-4">
        <div class="form-control space-y-2">
          {#each roles.data as role}
            <label class="label cursor-pointer">
              <span class="label-text">{role.roleName}</span>
              <input
                type="checkbox"
                class="checkbox"
                value={role._id}
                bind:group={selectedRoleIds}
              />
            </label>
          {/each}
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" onclick={() => roleModalManager.close()}
          >キャンセル</button
        >
        <button class="btn btn-primary" onclick={handleUpdateMemberRoles}
          >保存</button
        >
      </div>
    {:else}
      <div class="py-4">
        <p>利用可能なロールがありません。</p>
      </div>
    {/if}
  {/if}
{/snippet}

<Modal manager={roleModalManager} />
