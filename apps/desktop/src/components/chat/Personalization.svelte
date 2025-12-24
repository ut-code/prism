<script lang="ts">
  import { usePersonalization } from "./Personalization.svelte.ts";

  const personalization = usePersonalization();
</script>

<h2 class="py-2 text-center text-lg font-semibold">Change Profile Picture</h2>
<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
  <div class="flex flex-col items-center">
    <p class="mb-2 text-center text-sm">Current</p>
    <img
      src={personalization.imageURL}
      alt="Current profile"
      class="size-32 rounded-lg object-cover"
    />
  </div>
  {#if personalization.changedImage}
    <div class="flex flex-col items-center">
      <p class="mb-2 text-center text-sm">New</p>
      <img
        src={personalization.changedImage}
        alt="New profile"
        class="size-32 rounded-lg object-cover"
      />
    </div>
  {/if}
</div>
<input
  type="file"
  class="file-input file-input-bordered file-input-primary mt-4 w-full"
  accept=".jpg, .png"
  onchange={personalization.handleFileChange}
/>
<h2 class="py-2 text-center text-lg font-semibold">Change Name</h2>
<div class="flex flex-col gap-4 sm:flex-row sm:justify-around">
  <div class="flex flex-col items-center">
    <h3 class="mb-2 text-center text-sm">Current</h3>
    <p class="text-base font-medium">{personalization.userName}</p>
  </div>
  <div class="flex flex-col items-center">
    <h3 class="mb-2 text-center text-sm">New</h3>
    <input
      type="text"
      placeholder="Username"
      class="input input-bordered input-primary w-full sm:w-48"
      bind:value={personalization.changedUserName}
    />
  </div>
</div>

<button
  class="btn btn-primary mt-4 ml-auto w-auto min-w-24"
  onclick={personalization.save}>Save</button
>
