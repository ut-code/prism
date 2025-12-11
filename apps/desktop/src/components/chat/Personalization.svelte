<script lang="ts">
  import type { User } from "@apps/api-client";
  import { getApiClient, useQuery } from "@/lib/api.svelte";

  // organizationId not used in this component currently
  // const { organizationId }: { organizationId: string } = $props();

  const api = getApiClient();

  const identity = useQuery<User>(() =>
    api.users.me.get().then((res) => res.data as User),
  );
  const personalization = useQuery<User>(() =>
    api.users.me.get().then((res) => res.data as User),
  ); // TODO: Replace with actual personalization endpoint
  let iconURL = $state<string | null>("");
  let imageURL = $derived(iconURL || identity.data?.image);
  let userName = $derived(
    // personalization.data?.nickname ||
    identity.data?.name,
  );
  let changedImage = $state<string>("");
  let changedImageFile = $state<File | undefined>();
  let changedUserName = $state<string>("");

  $effect(() => {
    if (userName) {
      changedUserName = userName;
    }
    if (personalization.data) {
      new Promise((resolve) => {
        // resolve(personalization.data?.icon);  // icon property doesn't exist on User
        resolve(null);
      })
        .then((value) => {
          return new Promise((resolve, reject) => {
            const storageId = value as string;
            if (storageId) {
              // TODO: Implement getImageUrl endpoint in REST API
              // Currently using placeholder - personalization.getImageUrl not available
              resolve(null);
            } else {
              reject();
            }
          });
        })
        .then((value) => {
          if (value) {
            const url = value as string;
            iconURL = url;
          }
        });
    }
  });

  async function save() {
    const image = changedImageFile;
    changedImage = "";
    changedImageFile = undefined;

    try {
      if (changedUserName?.trim() && !(userName === changedUserName)) {
        // TODO: Implement save endpoint in REST API for personalization nickname
        // await api.personalization.save({
        //   nickname: changedUserName,
        //   organizationId: organizationId,
        // });
        console.warn("Personalization save not implemented in REST API yet");
      }

      if (image) {
        // TODO: Implement generateUploadUrl endpoint in REST API
        // const postUrl = await api.personalization.generateUploadUrl();
        // const result = await fetch(postUrl, {
        //   method: "POST",
        //   headers: { "Content-Type": image.type },
        //   body: image,
        // });
        // const { storageId } = await result.json();
        // TODO: Implement saveImage endpoint in REST API
        // await api.personalization.saveImage({
        //   icon: storageId,
        //   organizationId: organizationId,
        // });
        console.warn("Image upload not implemented in REST API yet");
      }
    } catch (error) {
      console.error("Error saving personalization:", error);
    }
  }
</script>

<h2 class="py-2 text-center text-lg font-semibold">アイコンの変更</h2>
<div class="flex justify-around">
  <div class="w-32 flex-col">
    <p class="mb-2 text-center">変更前</p>
    <img src={imageURL} alt="googleアイコン" class="w-32" />
  </div>
  {#if changedImage}
    <div class="w-32 flex-col">
      <p class="mb-2 text-center">変更後</p>
      <img src={changedImage} alt="変更後" class="w-32" />
    </div>
  {/if}
</div>
<input
  type="file"
  class="file:bg-primary file:text-primary-content
        text-sm
        text-gray-500 file:mr-4 file:ml-2
        file:rounded file:border-0
        file:px-4
        file:py-2 file:font-semibold"
  accept=".jpg, .png"
  onchange={(event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      changedImage = URL.createObjectURL(file);
      changedImageFile = file;
    }
  }}
/>
<h2 class="py-2 text-center text-lg font-semibold">名前の変更</h2>
<div class="flex justify-around">
  <div>
    <h3 class="text-center text-base">変更前</h3>
    <h4 class="text-lg">{userName}</h4>
  </div>
  <div>
    <h3 class="text-center text-base">変更後</h3>
    <input
      type="text"
      placeholder="ユーザー名"
      class="input input-primary w-full"
      bind:value={changedUserName}
    />
  </div>
</div>

<button class="btn btn-primary mt-auto mr-2 mb-2 ml-auto w-16" onclick={save}
  >保存</button
>
