import { oneDarkTheme } from "@codemirror/theme-one-dark";
import { EditorView } from "codemirror";

export const lightTheme = EditorView.theme({});
export const darkTheme = oneDarkTheme;

export function getTheme(theme: "light" | "dark") {
  return theme === "dark" ? darkTheme : lightTheme;
}
