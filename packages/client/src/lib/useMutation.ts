import type { FunctionReference, OptionalRestArgs } from "convex/server";
import { useConvexClient } from "convex-svelte";

export function useMutation<T extends FunctionReference<"mutation">>(
  mutationFunction: T,
) {
  const convex = useConvexClient();

  return async (...args: OptionalRestArgs<T>) => {
    return await convex.mutation(mutationFunction, ...args);
  };
}
