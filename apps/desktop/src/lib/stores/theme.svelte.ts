import { browser } from "$app/environment";

/**
 * Theme store for managing light/dark mode switching
 * Persists theme preference in localStorage for user convenience
 */

type Theme = "light" | "dark";

/**
 * Get initial theme from localStorage or default to 'light'
 * Footgun: Only access localStorage in browser environment to avoid SSR issues
 */
function getInitialTheme(): Theme {
  if (!browser) return "light";

  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference as fallback
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export class ThemeStore {
  #current: Theme;
  constructor() {
    this.#current = $state(getInitialTheme());
  }

  get current() {
    return this.#current;
  }

  set(theme: Theme) {
    this.#current = theme;
    if (browser) {
      localStorage.setItem("theme", theme);
    }
  }

  toggle() {
    this.set(this.current === "light" ? "dark" : "light");
  }
}
