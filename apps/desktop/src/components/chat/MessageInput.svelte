<script lang="ts">
  import type { Message, User } from "@apps/api-client";
  import FilePreview from "@/features/files/upload/FilePreview.svelte";
  import FileSelector from "@/features/files/upload/Selector.svelte";
  import { FileUploader } from "@/features/files/upload/uploader.svelte";
  import Attachment from "@/icons/attachment.svelte";
  import MdiClose from "@/icons/mdi-close.svelte";
  import { getApiClient, useMutation, useQuery } from "@/lib/api.svelte";

  import EmojiPalette from "./EmojiPalette.svelte";
  import VoteMaker from "./VoteMaker.svelte";

  interface Props {
    organizationId: string;
    channelId: string;
    replyingTo: Message | null;
  }

  let { channelId, organizationId, replyingTo = $bindable() }: Props = $props();

  type Vote = {
    title: string;
    maxVotes: number;
    voteOptions: Array<string>;
    voters: Array<{
      userId: string;
      votedOptions: Array<number>;
    }>;
  };

  const api = getApiClient();
  const sendMessageMutation = useMutation(
    async (args: {
      channelId: string;
      content: string;
      author: string;
      parentId?: string;
      attachments?: string[];
      voteId?: string;
    }) => {
      const response = await api.messages.post(args);
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value),
        );
      }
      return response.data;
    },
  );
  const identity = useQuery<User>(async () => {
    const response = await api.users.me.get();
    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : JSON.stringify(response.error.value),
      );
    }
    if (!response.data) {
      throw new Error("No user data returned");
    }
    return response.data;
  });

  let messageContent = $state("");
  let showEmojiPalette = $state(false);
  let showFileSelector = $state(false);
  let attachedFiles = $state<File[]>([]);

  const clickable = $derived.by<boolean>(() => {
    // post ongoing
    if (sendMessageMutation.processing) return false;
    // identity not loaded yet
    if (!identity.data) return false;
    // empty content
    if (!messageContent.trim() && attachedFiles.length === 0 && !voteIsValid())
      return false;
    return true;
  });

  let showVoteMaker = $state(false);
  let vote = $state<Vote>({
    title: "",
    maxVotes: 1,
    voteOptions: [],
    voters: [],
  });
  function voteIsValid() {
    if (!vote.title.trim()) return false;
    if (vote.voteOptions.length === 0) return false;
    if (vote.maxVotes === 0) return false;
    return true;
  }

  const uploader = new FileUploader(() => ({
    organizationId,
  }));

  async function sendMessage() {
    if (!clickable) return;
    if (!identity.data) return;

    const attachments = (await uploader.uploadAll(attachedFiles)).map(
      (it) => it.id,
    );

    let voteId: string | undefined;
    if (voteIsValid()) {
      const voteResponse = await api.votes.post({
        title: vote.title,
        maxVotes: vote.maxVotes,
        voteOptions: vote.voteOptions,
      });
      if (!voteResponse.error && voteResponse.data) {
        voteId = voteResponse.data.id;
      }
    }

    await sendMessageMutation.run({
      channelId,
      content: messageContent.trim() || "",
      author: identity.data?.name || "unregistered",
      parentId: replyingTo?.id ?? undefined,
      attachments,
      voteId,
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
          <Attachment />
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
      disabled={!clickable}
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
