export type ThemeMode = "system" | "dark" | "light";

export const THEME_KEY = "fitmez_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem("dripcheck_theme");
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
  } catch {}
  return "system";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {}

  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const root = document.documentElement;
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";

  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement("meta");
    metaTheme.setAttribute("name", "theme-color");
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute("content", isDark ? "#161811" : "#F1E8C7");
}

export function initThemeListener(onChange?: (isDark: boolean) => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    const current = getStoredTheme();
    if (current === "system") {
      applyTheme("system");
      onChange?.(mediaQuery.matches);
    }
  };

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}
