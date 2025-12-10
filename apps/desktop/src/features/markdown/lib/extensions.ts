import { markdown } from "@codemirror/lang-markdown";
import { Strikethrough } from "@lezer/markdown";

import { baseSetup } from "./extensions/base.ts";
import { highlights } from "./extensions/highlights.ts";

export const extensions = [
  baseSetup,
  highlights,
  markdown({
    extensions: [Strikethrough],
  }),
];
