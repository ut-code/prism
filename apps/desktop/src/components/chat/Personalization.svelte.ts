import type { User } from "@packages/api-client";
import { getApiClient, unwrapResponse, useQuery } from "@/lib/api.svelte";

/**
 * Hook for user personalization (profile editing).
 */
export function usePersonalization() {
  const api = getApiClient();

  const identity = useQuery<User>(async () => {
    const res = await api.users.me.get();
    return unwrapResponse<User>(res);
  });

  let changedImage = $state<string>("");
  let changedUserName = $state<string>("");
  let isSaving = $state(false);

  const imageURL = $derived(identity.data?.image ?? null);
  const userName = $derived(identity.data?.name);

  $effect(() => {
    if (userName) {
      changedUserName = userName;
    }
  });

  function handleFileChange(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      changedImage = URL.createObjectURL(file);
    }
  }

  async function save() {
    if (isSaving) return;

    isSaving = true;
    try {
      const updates: { name?: string } = {};

      if (changedUserName?.trim() && changedUserName !== userName) {
        updates.name = changedUserName.trim();
      }

      if (Object.keys(updates).length > 0) {
        await api.users.me.patch(updates);
        await identity.refetch();
      }

      changedImage = "";
    } finally {
      isSaving = false;
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
    get isSaving() {
      return isSaving;
    },
    handleFileChange,
    save,
  };
}
