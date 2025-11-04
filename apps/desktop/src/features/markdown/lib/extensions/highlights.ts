import {
  defaultHighlightStyle,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";

const markdownHighlightStyle = HighlightStyle.define([
  // Keep all default styles
  ...defaultHighlightStyle.specs,
  // Add custom heading styles with increasing sizes
  { tag: tags.heading1, fontWeight: "800", fontSize: "150%" },
  { tag: tags.heading2, fontWeight: "800", fontSize: "130%" },
  { tag: tags.heading3, fontWeight: "700", fontSize: "120%" },
  { tag: tags.heading4, fontWeight: "600", fontSize: "110%" },
  { tag: tags.heading5, fontWeight: "600", fontSize: "105%" },
  { tag: tags.heading6, fontWeight: "600", fontSize: "100%" },
  // Add strikethrough style
  { tag: tags.strikethrough, textDecoration: "line-through" },
]);

export const highlights = [syntaxHighlighting(markdownHighlightStyle)];
