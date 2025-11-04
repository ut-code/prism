<script lang="ts">
  import { EditorState, StateEffect } from "@codemirror/state";
  import { EditorView } from "codemirror";
  import { Watcher } from "$lib/watcher.svelte.ts";
  import { getTheme } from "./extensions/themes.ts";
  import { extensions } from "./extensions.ts";

  interface Props {
    doc?: string;
    theme: "light" | "dark";
  }
  let { doc = $bindable(""), theme = $bindable("light") }: Props = $props();
  let view = $state<EditorView>();
  let el = $state<HTMLDivElement>();

  // document state control
  const docWatcher = new Watcher(
    () => doc,
    (v) => {
      doc = v;
    },
  );
  docWatcher.onupdate = (doc) => {
    const changes = {
      from: 0,
      to: view?.state.doc.length,
      insert: doc,
    };
    view?.dispatch({ changes });
  };
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      docWatcher.set(update.state.doc.toString());
    }
  });

  // theme control
  $effect(() => {
    if (!view) return;
    view.dispatch({
      effects: StateEffect.reconfigure.of(getConfig(theme)),
    });
  });

  /**
   * Get CodeMirror configuration with appropriate theme
   * Uses built-in oneDark theme for dark mode, no theme extension for light mode
   */
  function getConfig(theme: "light" | "dark") {
    const config = [extensions, updateListener];
    const themeConfig = getTheme(theme);
    if (themeConfig) {
      config.push(themeConfig);
    }
    return config;
  }

  /**
   * Initialize editor with basic extensions
   * Footgun: Start with light theme by default to avoid reactive loops
   */
  const initialState = EditorState.create({
    doc: doc,
    extensions: getConfig(theme),
  });

  /**
   * Effect to create and manage CodeMirror editor instance
   * Recreates editor when theme changes to apply new styling
   * Footgun: Must destroy previous view to prevent memory leaks
   */
  $effect(() => {
    if (!el) return;

    // Create initial view
    view = new EditorView({
      state: initialState,
      parent: el,
    });

    return () => view?.destroy();
  });
</script>

<div class="contents" bind:this={el}></div>
