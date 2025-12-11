<script lang="ts">
  import { type Task } from "@apps/api-client";
  import {
    getApiClient,
    getTask,
    unwrapResponse,
    useQuery,
  } from "@/lib/api.svelte";
  import TaskListSkin from "./TaskListSkin.svelte";

  const api = getApiClient();

  const todosQuery = useQuery<Task[]>(async () => {
    const response = await api.tasks.get();
    return unwrapResponse(response);
  });

  async function updateTodo(id: string, data: Partial<Task>) {
    const response = await getTask(api, id).patch(data);
    return unwrapResponse(response);
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
