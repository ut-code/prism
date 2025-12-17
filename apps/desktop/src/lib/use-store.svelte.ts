import type { Readable } from "svelte/store";

export function useStore<T>(store: Readable<T>): { readonly value: T } {
  let state = $state<T>(undefined as T);

  store.subscribe((v) => {
    state = v;
  });

  return {
    get value() {
      return state;
    },
  };
}
