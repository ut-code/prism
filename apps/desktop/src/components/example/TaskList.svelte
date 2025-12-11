<script lang="ts">
  import { type Task } from "@apps/api-client";
  import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";
  import TaskListSkin from "./TaskListSkin.svelte";

  const api = getApiClient();

  const todosQuery = useQuery<Task[]>(
    async () =>
      (await unwrapResponse(await api.tasks.get())) as unknown as Task[],
  );

  async function updateTodo(id: string, data: Partial<Task>) {
    unwrapResponse(await (api.tasks as any)[id].patch(data));
  }

  async function createTodo() {
    unwrapResponse(await api.tasks.post({ text: "", assigner: "" }));
  }
</script>

{#if todosQuery.data}
  <TaskListSkin {updateTodo} {createTodo} todos={todosQuery.data} />
{:else if todosQuery.isLoading}
  <div class="flex items-center justify-center p-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{/if}
