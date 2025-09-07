<script lang="ts">
  import { api, type Id } from "@packages/convex";
  import type { Doc } from "@packages/convex/src/convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import FilePreview from "$components/files/FilePreview.svelte";
  import FileUploader from "$components/files/FileUploader.svelte";
  import { useMutation } from "~/lib/useMutation.svelte.ts";

  interface Props {
    channelId: Id<"channels">;
    replyingTo: Doc<"messages"> | null;
  }

  interface UploadedFile {
    id: Id<"files">;
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    url?: string;
  }

  let { channelId, replyingTo = $bindable() }: Props = $props();

  const sendMessageMutation = useMutation(api.messages.send);
  const identity = useQuery(api.users.me, {});

  // Get channel info to determine organization
  const channelData = useQuery(api.channels.get, () => ({ channelId }));

  let messageContent = $state("");
  let authorName = $state("");
  let attachedFiles = $state<UploadedFile[]>([]);
  let showFileUploader = $state(false);

  $effect(() => {
    if (identity?.data && !authorName) {
      authorName = identity.data.name ?? identity.data.email ?? "匿名";
    }
  });

  async function sendMessage() {
    if (!messageContent.trim() && attachedFiles.length === 0) return;

    const attachments =
      attachedFiles.length > 0 ? attachedFiles.map((f) => f.id) : undefined;

    await sendMessageMutation.run({
      channelId,
      content: messageContent.trim() || "",
      author: authorName.trim() || "匿名",
      parentId: replyingTo?._id ?? undefined,
      attachments,
    });

    messageContent = "";
    attachedFiles = [];
    replyingTo = null;
    showFileUploader = false;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleFilesUploaded(files: UploadedFile[]) {
    attachedFiles = [...attachedFiles, ...files];
    showFileUploader = false;
  }

  function removeAttachedFile(index: number) {
    attachedFiles = attachedFiles.filter((_, i) => i !== index);
  }

  function toggleFileUploader() {
    showFileUploader = !showFileUploader;
  }
</script>

<div class="border-base-300 bg-base-100 space-y-4 border-t p-4">
  {#if replyingTo}
    <div class="text-base-content/70 text-sm">
      <span class="font-semibold">返信先:</span>
      <span class="text-primary font-semibold">{replyingTo.author}</span>
      <span>{replyingTo.content}</span>
    </div>
  {/if}

  <!-- Attached files preview -->
  {#if attachedFiles.length > 0}
    <div class="space-y-2">
      <h4 class="text-base-content/70 text-sm font-medium">添付ファイル:</h4>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {#each attachedFiles as file, index}
          <FilePreview
            {file}
            compact={true}
            removable={true}
            onRemove={() => removeAttachedFile(index)}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- File uploader -->
  {#if showFileUploader && channelData?.data?.organizationId}
    <FileUploader
      organizationId={channelData.data.organizationId}
      onUpload={handleFilesUploaded}
    />
  {/if}

  <div class="flex gap-2">
    <input
      type="text"
      placeholder="ユーザー名"
      class="input input-sm input-bordered w-32"
      bind:value={authorName}
    />
  </div>

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
          {showFileUploader ? "キャンセル" : "ファイル添付"}
        </button>
      </div>
    </div>

    <button
      class="btn btn-primary self-end"
      onclick={sendMessage}
      disabled={(!messageContent.trim() && attachedFiles.length === 0) ||
        sendMessageMutation.processing}
    >
      {#if sendMessageMutation.processing}
        <span class="loading loading-spinner loading-sm"></span>
      {:else}
        送信
      {/if}
    </button>
  </div>

  {#if sendMessageMutation.error}
    <div class="alert alert-error text-sm">
      {sendMessageMutation.error}
    </div>
  {/if}
</div>
