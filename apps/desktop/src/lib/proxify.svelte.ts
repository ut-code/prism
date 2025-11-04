// workaround of svelte's $derived not being reactive:
// see https://github.com/sveltejs/svelte/issues/16189#issuecomment-2979989750
export function proxify<T>(init: T) {
  const s = $state(init);
  return s;
}
