<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import DMList from "$components/dms/DMList.svelte";
  import UserSearch from "$components/dms/UserSearch.svelte";

  interface Props {
    organizationId: string;
    selectedChannelId: string | undefined;
  }

  let { organizationId, selectedChannelId }: Props = $props();
  let showUserSearch = $state(false);
</script>

<section class="border-subtle border-t">
  <header class="flex items-center justify-between px-4 py-2">
    <span class="text-muted text-xs font-medium tracking-wider uppercase">
      Direct Messages
    </span>
    <button
      class="btn btn-ghost btn-xs btn-square"
      title="New DM"
      onclick={() => (showUserSearch = !showUserSearch)}
    >
      <Plus class="text-muted size-4" />
    </button>
  </header>

  {#if showUserSearch}
    <div class="px-2 pb-2">
      <UserSearch {organizationId} />
    </div>
  {/if}

  <div class="max-h-48 overflow-y-auto px-2 pb-2">
    <DMList {organizationId} {selectedChannelId} />
  </div>
</section>
