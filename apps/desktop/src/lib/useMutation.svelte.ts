import type { FunctionReference, OptionalRestArgs } from "convex/server";
import { useConvexClient } from "convex-svelte";

export function useMutation<T extends FunctionReference<"mutation">>(
  mutationFunction: T,
) {
  const convex = useConvexClient();

  let processing = $state(false);
  let error = $state<string | null>(null);

  return {
    run: async (args: OptionalRestArgs<T>[0]) => {
      if (processing) return; // Prevent multiple runs at the same time
      processing = true;
      error = null;
      try {
        console.log("running mutation...");
        return await convex.mutation(mutationFunction, args);
      } catch (e) {
        console.log("mutation failed:", e);
        error = e instanceof Error ? e.message : String(e);
      } finally {
        console.log("mutation finished");
        processing = false;
      }
    },
    get processing() {
      return processing;
    },
    get error() {
      return error;
    },
  };
}
