import * as v from "valibot";

const Env = v.object({
  PUBLIC_CONVEX_URL: v.string(),
  PUBLIC_LIVEKIT_WSURL: v.string(),
});

export const env = v.parse(Env, {
  PUBLIC_CONVEX_URL: import.meta.env.PUBLIC_CONVEX_URL,
  PUBLIC_LIVEKIT_WSURL: import.meta.env.PUBLIC_LIVEKIT_WSURL,
});
