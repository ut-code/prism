<script lang="ts">
  import Hash from "@lucide/svelte/icons/hash";
  import type { Channel } from "@packages/api-client";

  interface Props {
    channel: Channel;
    organizationId: string;
    active: boolean;
    unreadCount: number;
    indent?: string;
  }

  let { channel, organizationId, active, unreadCount, indent }: Props =
    $props();
</script>

<a
  href={`/orgs/${organizationId}/chat/${channel.id}`}
  class={[
    "group flex items-center gap-2 rounded px-2 py-2 text-sm transition-colors",
    active
      ? "bg-primary/15 text-primary"
      : "text-base-content/80 hover:bg-base-300 hover:text-base-content",
  ]}
  style:padding-left={indent}
>
  <Hash
    class={["size-4 flex-shrink-0", active ? "text-primary" : "text-muted"]}
  />
  <span class={["flex-1 truncate", unreadCount > 0 && "font-medium"]}>
    {channel.name}
  </span>
  {#if unreadCount > 0}
    <span class="badge-unread flex items-center justify-center rounded-full">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  {/if}
</a>
