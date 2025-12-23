<script lang="ts">
  import type { Organization, OrganizationMember } from "@packages/api-client";

  interface Props {
    organization: Organization | undefined;
    members: OrganizationMember[] | undefined;
    onAddMember: () => void;
    onRemoveMember: (userId: string) => void;
  }

  const { organization, members, onAddMember, onRemoveMember }: Props =
    $props();
</script>

<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="card-title">メンバー</h2>
      {#if organization?.permission === "admin"}
        <button class="btn btn-primary btn-sm" onclick={onAddMember}>
          メンバーを追加
        </button>
      {/if}
    </div>

    {#if members}
      <div class="space-y-2">
        {#each members as member}
          <div
            class="bg-base-300 flex items-center justify-between rounded-lg p-3"
          >
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-10 rounded-full">
                  <span class="text-sm">{member.user?.name?.[0] || "?"}</span>
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
            <div class="flex items-center gap-2">
              <div class="badge badge-outline capitalize">
                {member.permission}
              </div>
              {#if organization?.permission === "admin" && member.userId !== organization?.ownerId}
                <button
                  class="btn btn-ghost btn-sm text-error"
                  onclick={() => onRemoveMember(member.userId)}
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
