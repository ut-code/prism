export { api } from "./src/convex/_generated/api.ts";
export type { Doc, Id } from "./src/convex/_generated/dataModel.ts";

import type { DataModel } from "./src/convex/_generated/dataModel.ts";
export type Task = DataModel["tasks"]["document"];

export type Query<T> =
  | {
      isLoading: true;
      error: undefined;
      data: undefined;
    }
  | {
      isLoading: false;
      error: Error;
      data: undefined;
    }
  | {
      isLoading: false;
      error: undefined;
      data: T;
    };
