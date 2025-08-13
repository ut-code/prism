<script lang="ts">
  import { api } from "@packages/convex";
  import { goto } from "$app/navigation";
  import { useMutation } from "~/lib/useMutation";

  const createOrganization = useMutation(api.organizations.create);

  let form = $state({
    name: "",
    description: "",
  });

  let isSubmitting = $state(false);

  async function handleSubmit() {
    if (!form.name.trim()) return;

    isSubmitting = true;
    try {
      const organizationId = await createOrganization({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });

      goto(`/${organizationId}/settings`);
    } catch (error) {
      console.error("Failed to create organization:", error);
      alert("組織の作成に失敗しました");
    } finally {
      isSubmitting = false;
    }
  }

  function goBack() {
    goto("/");
  }
</script>

<div class="container mx-auto max-w-md p-6">
  <div class="mb-6">
    <button class="btn btn-ghost btn-sm mb-4" onclick={goBack}>
      ← ホームに戻る
    </button>

    <h1 class="text-base-content mb-2 text-3xl font-bold">新しい組織を作成</h1>
    <p class="text-base-content/70">
      新しい組織を作成して、メンバーとコラボレーションを始めましょう
    </p>
  </div>

  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <form onsubmit={handleSubmit}>
        <div class="form-control mb-4">
          <label class="label" for="name">
            <span class="label-text font-medium">組織名</span>
            <span class="label-text-alt text-error">必須</span>
          </label>
          <input
            id="name"
            bind:value={form.name}
            type="text"
            class="input input-bordered w-full"
            placeholder="例: 株式会社サンプル"
            required
            disabled={isSubmitting}
          />
        </div>

        <div class="form-control mb-6">
          <label class="label" for="description">
            <span class="label-text font-medium">組織の説明</span>
            <span class="label-text-alt">任意</span>
          </label>
          <textarea
            id="description"
            bind:value={form.description}
            class="textarea textarea-bordered h-24 w-full"
            placeholder="この組織について簡単に説明してください"
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div class="card-actions justify-end">
          <button
            type="button"
            class="btn btn-ghost"
            onclick={goBack}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isSubmitting || !form.name.trim()}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner loading-sm"></span>
              作成中...
            {:else}
              組織を作成
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
