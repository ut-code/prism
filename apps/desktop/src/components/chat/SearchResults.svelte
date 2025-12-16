<script lang="ts">
  import { formatDistanceToNow } from "date-fns";
  import type { SearchResult } from "./messageSearch.svelte.ts";

  interface Props {
    results: SearchResult[];
    onResultClick: (messageId: string) => void;
  }

  let { results, onResultClick }: Props = $props();
</script>

<div
  class="bg-base-100 border-base-300 max-h-96 overflow-y-auto rounded-lg border"
>
  {#if results.length === 0}
    <div class="text-base-content/60 p-4 text-center text-sm">
      検索結果がありません
    </div>
  {:else}
    {#each results as result}
      <button
        type="button"
        class="hover:bg-base-200 border-base-300 w-full border-b p-3 text-left transition-colors last:border-0"
        onclick={() => onResultClick(result.message.id)}
      >
        <div class="mb-1 flex items-baseline gap-2">
          <span class="text-sm font-medium">
            {result.user?.name ?? "Unknown"}
          </span>
          <span class="text-base-content/50 text-xs">
            {formatDistanceToNow(new Date(result.message.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p class="text-base-content/80 line-clamp-2 text-sm">
          {result.message.content}
        </p>
      </button>
    {/each}
  {/if}
</div>
