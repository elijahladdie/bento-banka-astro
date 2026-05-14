import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme or default to system
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    let themeToApply: "light" | "dark";

    if (newTheme === "system") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      themeToApply = newTheme;
    }

    if (themeToApply === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(
      new CustomEvent("theme-change", {
        detail: { theme: newTheme },
      })
    );
  };

  if (!mounted) return null;

  return (
    <div className="relative hidden sm:inline-flex">
      <button
        onClick={() => {
          const themes: Theme[] = ["system", "dark", "light"];
          const currentIndex = themes.indexOf(theme);
          const nextTheme = themes[(currentIndex + 1) % themes.length];
          handleThemeChange(nextTheme);
        }}
        className="group h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white backdrop-blur-xl outline-none transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] focus:border-primary focus:ring-4 focus:ring-primary/20 flex items-center gap-2"
        aria-label="Toggle theme"
        title={`Theme: ${theme}`}
      >
        {theme === "system" && <Monitor className="h-4 w-4" />}
        {theme === "dark" && <Moon className="h-4 w-4" />}
        {theme === "light" && <Sun className="h-4 w-4" />}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-12 mt-1 hidden group-hover:block bg-[#0f172a] rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden min-w-max z-50">
        {(["system", "dark", "light"] as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => handleThemeChange(t)}
            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              theme === t
                ? "bg-primary/20 text-primary border-l-2 border-primary"
                : "text-white hover:bg-white/[0.08]"
            }`}
          >
            {t === "system" && <Monitor className="h-4 w-4" />}
            {t === "dark" && <Moon className="h-4 w-4" />}
            {t === "light" && <Sun className="h-4 w-4" />}
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
