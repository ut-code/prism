import { authClient } from "./auth-client.ts";
import { useStore } from "./use-store.svelte.ts";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

const session = useStore(authClient.useSession());

export function useAuth() {
  function signInWithGoogle() {
    return authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    });
  }

  async function signOut() {
    await authClient.signOut();
  }

  return {
    get user() {
      const data = session.value?.data;
      if (!data?.user) return null;
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? undefined,
      } as AuthUser;
    },
    get isLoading() {
      return session.value?.isPending ?? true;
    },
    get isAuthenticated() {
      return !!session.value?.data?.user;
    },
    signInWithGoogle,
    signOut,
    refetch: () => authClient.getSession(),
  };
}
