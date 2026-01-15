<script lang="ts">
  import type { Organization } from "@packages/api-client";

  interface Props {
    organization: Organization | undefined;
  }

  const { organization }: Props = $props();
</script>

<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Organization Info</h2>
    {#if organization}
      <div class="space-y-3">
        <div>
          <span class="font-semibold">Created:</span>
          {new Date(organization.createdAt).toLocaleDateString("en-US")}
        </div>
        <div>
          <span class="font-semibold">Your Role:</span>
          <div class="badge badge-outline ml-2 capitalize">
            {organization.permission}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
