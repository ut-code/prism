<script lang="ts">
  import type { Task } from "@packages/api-client";
  import BufferedTextInput from "$components/atoms/BufferedTextInput.svelte";

  type Props = {
    updateTodo: (id: string, data: Partial<Task>) => void;
    createTodo: () => void;
    todos: Task[];
  };
  const { updateTodo, createTodo, todos }: Props = $props();
</script>

<div class="bg-base-200 m-4 rounded-xl p-4">
  <h1 class="p-5 text-center text-3xl">Task List</h1>
  <ul class="list">
    <li class="list-row">
      <span class="list-col-grow text-center text-xl"> Task </span>
      <span class="w-80 text-center text-xl"> Assigner </span>
    </li>
    {#each todos as todo}
      <li class="list-row">
        <input
          type="checkbox"
          class="checkbox checkbox-primary"
          bind:checked={
            () => todo.isCompleted,
            (val) => {
              updateTodo(todo.id, {
                isCompleted: val,
              });
            }
          }
        />
        <BufferedTextInput
          class="input w-full"
          bind:value={
            () => todo.text,
            (val) => {
              updateTodo(todo.id, {
                text: val,
              });
            }
          }
        />
        <BufferedTextInput
          class="input input-bordered"
          bind:value={
            () => todo.assigner,
            (val) => {
              updateTodo(todo.id, {
                assigner: val,
              });
            }
          }
        />
      </li>
    {/each}
  </ul>
  <button class="btn btn-primary" onclick={createTodo}> New </button>
</div>
