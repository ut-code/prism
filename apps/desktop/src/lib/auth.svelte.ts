import { getApiClient } from "./api.svelte.ts";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const authState = $state<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function useAuth() {
  async function fetchUser() {
    authState.isLoading = true;
    try {
      const api = getApiClient();
      const response = await api.auth.me.get();
      if (response.data?.user) {
        authState.user = response.data.user as AuthUser;
        authState.isAuthenticated = true;
      } else {
        authState.user = null;
        authState.isAuthenticated = false;
      }
    } catch {
      authState.user = null;
      authState.isAuthenticated = false;
    } finally {
      authState.isLoading = false;
    }
  }

  async function signIn(email: string) {
    const api = getApiClient();
    const response = await api.auth.signin.post({ email });
    if (response.data?.user) {
      authState.user = response.data.user as AuthUser;
      authState.isAuthenticated = true;
    }
    return response;
  }

  async function signOut() {
    const api = getApiClient();
    await api.auth.signout.post({});
    authState.user = null;
    authState.isAuthenticated = false;
  }

  // Fetch user on first call
  if (authState.isLoading && !authState.user) {
    fetchUser();
  }

  return {
    get user() {
      return authState.user;
    },
    get isLoading() {
      return authState.isLoading;
    },
    get isAuthenticated() {
      return authState.isAuthenticated;
    },
    signIn,
    signOut,
    refetch: fetchUser,
  };
}
