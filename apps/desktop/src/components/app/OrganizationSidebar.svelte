<script lang="ts">
  import type { Organization } from "@apps/api-client";
  import type { Snippet } from "svelte";

  interface Props {
    organization: Organization | undefined;
    organizationId: string;
    children: Snippet;
  }

  const { organization, organizationId, children }: Props = $props();
</script>

<div class="bg-base-200 border-base-300 flex h-full w-80 flex-col border-r">
  <div class="border-base-300 border-b p-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base-content text-lg font-bold">
          {organization?.name || "組織"}
        </h2>
        {#if organization?.description}
          <p class="text-base-content/70 text-sm">
            {organization.description}
          </p>
        {/if}
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-4 w-4 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
            ></path>
          </svg>
        </div>
        <ul
          role="menu"
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          <li role="menuitem">
            <a href="/orgs/{organizationId}/settings">組織設定</a>
          </li>
          <li role="menuitem">
            <a href="/">組織選択</a>
          </li>
        </ul>
      </div>
    </div>
    {#if organization?.permission}
      <div class="badge badge-outline mt-2 capitalize">
        {organization.permission}
      </div>
    {/if}
  </div>

  {@render children()}
</div>
