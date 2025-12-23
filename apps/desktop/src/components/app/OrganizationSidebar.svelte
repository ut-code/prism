<script lang="ts">
  import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
  import Settings from "@lucide/svelte/icons/settings";
  import type { Organization } from "@packages/api-client";
  import type { Snippet } from "svelte";

  interface Props {
    organization: Organization | undefined;
    organizationId: string;
    children: Snippet;
  }

  const { organization, organizationId, children }: Props = $props();
</script>

<aside class="border-subtle bg-base-200 flex h-full w-72 flex-col border-r">
  <!-- Organization header -->
  <header
    class="border-subtle flex items-center justify-between border-b px-4 py-3"
  >
    <div class="min-w-0 flex-1">
      <h1 class="truncate font-semibold tracking-tight">
        {organization?.name ?? "Loading..."}
      </h1>
    </div>
    <div class="flex items-center gap-1">
      <a
        href="/orgs/{organizationId}/settings"
        class="btn btn-ghost btn-sm btn-square hover-highlight"
        title="組織設定"
      >
        <Settings class="text-muted size-4" />
      </a>
      <a
        href="/"
        class="btn btn-ghost btn-sm btn-square hover-highlight"
        title="組織を切り替え"
      >
        <ArrowLeftRight class="text-muted size-4" />
      </a>
    </div>
  </header>

  <!-- Channel list (children) -->
  <div class="flex-1 overflow-hidden">
    {@render children()}
  </div>
</aside>
