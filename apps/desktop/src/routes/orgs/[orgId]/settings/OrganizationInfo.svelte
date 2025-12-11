<script lang="ts">
  import type { Organization } from "@apps/api-client";

  interface Props {
    organization: Organization | undefined;
  }

  const { organization }: Props = $props();
</script>

<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">組織情報</h2>
    {#if organization}
      <div class="space-y-3">
        <div>
          <span class="font-semibold">作成日:</span>
          {new Date(organization.createdAt).toLocaleDateString("ja-JP")}
        </div>
        <div>
          <span class="font-semibold">あなたの権限:</span>
          <div class="badge badge-outline ml-2 capitalize">
            {organization.permission}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
