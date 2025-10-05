<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import type { Doc } from "@packages/convex/src/convex/_generated/dataModel";
  import { useConvexClient, useQuery } from "convex-svelte";
  import FilePreview from "~/features/files/upload/FilePreview.svelte";
  import FileSelector from "~/features/files/upload/Selector.svelte";
  import { FileUploader } from "~/features/files/upload/uploader.svelte";
  import MdiClose from "~/icons/mdi-close.svelte";
  import { useMutation } from "~/lib/useMutation.svelte.ts";
  import EmojiPalette from "./EmojiPalette.svelte";
  import VoteMaker from "./VoteMaker.svelte";

  interface Props {
    organizationId: Id<"organizations">;
    channelId: Id<"channels">;
    replyingTo: Doc<"messages"> | null;
  }

  let { channelId, organizationId, replyingTo = $bindable() }: Props = $props();

  type Vote = {
    title: string;
    maxVotes: number;
    voteOptions: Array<string>;
    voters: Array<{
      userId: Id<"users">;
      votedOptions: Array<number>;
    }>;
  };

  const sendMessageMutation = useMutation(api.messages.send);
  const identity = useQuery(api.users.me, {});
  const convex = useConvexClient();

  let messageContent = $state("");
  let showEmojiPalette = $state(false);
  let showFileSelector = $state(false);
  let attachedFiles = $state<File[]>([]);

  const clickable = $derived.by<boolean>(() => {
    // empty content
    if (!messageContent.trim() && attachedFiles.length === 0) return false;
    // post ongoing
    if (sendMessageMutation.processing) return false;
    // identity not loaded yet
    if (!identity.data) return false;
    return true;
  });

  let showVoteMaker = $state(false);
  let vote = $state<Vote>({
    title: "",
    maxVotes: 1,
    voteOptions: [],
    voters: [],
  });

  const personalization = useQuery(api.personalization.getPersonalization, {
    organizationId: organizationId,
  });
  const uploader = new FileUploader(() => ({
    organizationId,
  }));

  async function sendMessage() {
    if (!messageContent.trim() && attachedFiles.length === 0) return;
    if (!identity.data) return;

    const attachments = (await uploader.uploadAll(attachedFiles)).map(
      (it) => it.id,
    );

    let voteId: Id<"votes"> | undefined;
    if (vote.title.trim() && vote.voteOptions.length !== 0) {
      voteId = await convex.mutation(api.vote.addVote, {
        title: vote.title,
        maxVotes: vote.maxVotes,
        voteOptions: vote.voteOptions,
      });
    }

    await sendMessageMutation.run({
      channelId,
      content: messageContent.trim() || "",
      author: identity.data.name,
      parentId: replyingTo?._id ?? undefined,
      attachments,
      vote: voteId,
    });

    messageContent = "";
    attachedFiles = [];
    replyingTo = null;
    showFileSelector = false;
    vote = {
      title: "",
      maxVotes: 1,
      voteOptions: [],
      voters: [],
    };
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function toggleFileUploader() {
    showFileSelector = !showFileSelector;
  }

  function toggleVoteMaker() {
    showVoteMaker = !showVoteMaker;
  }
</script>

<div class="border-base-300 bg-base-100 space-y-4 border-t p-4">
  {#if replyingTo}
    <div
      class="bg-base-200 mb-2 flex items-center justify-between rounded-md p-2 text-sm"
    >
      <div class="text-base-content/70 truncate">
        <span class="font-semibold">返信先:</span>
        <span class="text-primary font-semibold">{replyingTo.author}</span>
        <span class="truncate">: {replyingTo.content}</span>
      </div>
      <button
        class="btn btn-ghost btn-circle btn-sm"
        onclick={() => (replyingTo = null)}
      >
        <MdiClose />
      </button>
    </div>
  {/if}

  <!-- Attached files preview -->
  {#if attachedFiles.length > 0}
    <div class="space-y-2">
      <h4 class="text-base-content/70 text-sm font-medium">添付ファイル:</h4>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {#each attachedFiles as file, index (file.name)}
          <FilePreview
            {file}
            compact={true}
            removable={true}
            onRemove={() => attachedFiles.splice(index, 1)}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- File uploader -->
  {#if showFileSelector}
    <FileSelector
      {organizationId}
      bind:files={attachedFiles}
      onselect={() => {
        showFileSelector = false;
      }}
    />
  {/if}

  {#if showVoteMaker}
    <VoteMaker bind:vote />
  {/if}
  <div class="flex gap-2"></div>

  <div class="flex gap-2">
    <div class="flex-1 space-y-2">
      <textarea
        placeholder="メッセージを入力... (Ctrl+Enterで送信、Enterで改行)"
        class="textarea textarea-bordered w-full resize-none"
        rows="2"
        bind:value={messageContent}
        onkeydown={handleKeyPress}
      ></textarea>

      <!-- Action buttons -->
      <div class="flex gap-2">
        <button
          class="btn btn-ghost btn-sm"
          onclick={toggleFileUploader}
          title="ファイルを添付"
          type="button"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            ></path>
          </svg>
          {showFileSelector ? "キャンセル" : "ファイル添付"}
        </button>
        <button
          class="btn btn-ghost btn-sm"
          onclick={toggleVoteMaker}
          title="投票を作成"
          type="button"
        >
          {showVoteMaker ? "キャンセル" : "投票を作成"}
        </button>
      </div>
    </div>

    <button
      class="btn btn-primary self-end"
      onclick={sendMessage}
      disabled={clickable}
    >
      {#if sendMessageMutation.processing}
        <span class="loading loading-spinner loading-sm"></span>
      {:else}
        送信
      {/if}
    </button>
    <button
      class="btn btn-secondary self-end"
      onclick={(e) => {
        e.stopPropagation();
        showEmojiPalette = !showEmojiPalette;
      }}
    >
      😀
    </button>
  </div>
  {#if showEmojiPalette}
    <EmojiPalette
      onClose={() => (showEmojiPalette = false)}
      onEmojiSelected={(emoji) => {
        messageContent += emoji;
      }}
    />
  {/if}

  {#if sendMessageMutation.error}
    <div class="alert alert-error text-sm">
      {sendMessageMutation.error}
    </div>
  {/if}
</div>
