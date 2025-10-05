export { api } from "./src/convex/_generated/api";
export type { Doc, Id } from "./src/convex/_generated/dataModel";

import type { DataModel } from "./src/convex/_generated/dataModel";
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
