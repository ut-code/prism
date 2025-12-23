<script lang="ts">
  import type { Organization } from "@apps/api-client";

  interface Props {
    organization: Organization | undefined;
    organizationId: string;
    isEditing: boolean;
    editForm: { name: string; description: string };
    onUpdate: () => void;
    onCancel: () => void;
    onEdit: () => void;
  }

  const {
    organization,
    organizationId,
    isEditing,
    editForm,
    onUpdate,
    onCancel,
    onEdit,
  }: Props = $props();
</script>

<div class="mb-6">
  <a href={`/orgs/${organizationId}`} class="btn btn-ghost btn-sm mb-4">
    ← 戻る
  </a>

  {#if organization}
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
            {organization.name}
          </h1>
          {#if organization.description}
            <p class="text-base-content/70 mt-2">
              {organization.description}
            </p>
          {/if}
        {/if}
      </div>

      {#if organization.permission === "admin"}
        <div class="flex gap-2">
          {#if isEditing}
            <button class="btn btn-primary" onclick={onUpdate}>保存</button>
            <button class="btn btn-ghost" onclick={onCancel}>キャンセル</button>
          {:else}
            <button class="btn btn-outline" onclick={onEdit}>編集</button>
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
