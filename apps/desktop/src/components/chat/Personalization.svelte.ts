import type { User } from "@apps/api-client";
import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";

export function usePersonalization() {
  const api = getApiClient();

  const identity = useQuery<User>(async () => {
    const res = await api.users.me.get();
    return unwrapResponse<User>(res);
  });

  const personalization = useQuery<User>(async () => {
    const res = await api.users.me.get();
    return unwrapResponse<User>(res);
  }); // TODO: Replace with actual personalization endpoint

  let iconURL = $state<string | null>("");
  let changedImage = $state<string>("");
  let changedImageFile = $state<File | undefined>();
  let changedUserName = $state<string>("");

  const imageURL = $derived(iconURL || identity.data?.image);
  const userName = $derived(identity.data?.name);

  $effect(() => {
    if (userName) {
      changedUserName = userName;
    }
    if (personalization.data) {
      new Promise((resolve) => {
        resolve(null);
      })
        .then((value) => {
          return new Promise((resolve, reject) => {
            if (typeof value === "string" && value) {
              // TODO: Implement getImageUrl endpoint in REST API
              resolve(null);
            } else {
              reject();
            }
          });
        })
        .then((value) => {
          if (value && typeof value === "string") {
            iconURL = value;
          }
        });
    }
  });

  function handleFileChange(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      changedImage = URL.createObjectURL(file);
      changedImageFile = file;
    }
  }

  async function save() {
    const image = changedImageFile;
    changedImage = "";
    changedImageFile = undefined;

    try {
      if (changedUserName?.trim() && !(userName === changedUserName)) {
        // TODO: Implement save endpoint in REST API for personalization nickname
        console.warn("Personalization save not implemented in REST API yet");
      }

      if (image) {
        // TODO: Implement generateUploadUrl endpoint in REST API
        console.warn("Image upload not implemented in REST API yet");
      }
    } catch (error) {
      console.error("Error saving personalization:", error);
    }
  }

  return {
    get imageURL() {
      return imageURL;
    },
    get userName() {
      return userName;
    },
    get changedImage() {
      return changedImage;
    },
    get changedUserName() {
      return changedUserName;
    },
    set changedUserName(value: string) {
      changedUserName = value;
    },
    handleFileChange,
    save,
  };
}
