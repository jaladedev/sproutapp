"use client";

import { useTheme } from "@/context/ThemeContext";

/**
 * ThemeToggle
 * Props:
 *   size: "sm" | "md"   (default "md")
 *   showLabel: boolean  (default false)
 */
export default function ThemeToggle({ size = "md", showLabel = false }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`rounded-full animate-pulse ${
          size === "sm" ? "w-8 h-4" : "w-12 h-6"
        }`}
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group inline-flex items-center gap-2.5 rounded-full transition-all duration-200"
      style={{
        padding: size === "sm" ? "4px" : "5px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Toggle track */}
      <div
        className="relative flex-shrink-0 rounded-full transition-all duration-300"
        style={{
          width: size === "sm" ? 36 : 44,
          height: size === "sm" ? 20 : 24,
          background: isDark
            ? "rgba(255,255,255,0.08)"
            : "var(--accent-gradient)",
        }}
      >
        {/* Thumb */}
        <div
          className="absolute top-0.5 flex items-center justify-center rounded-full shadow transition-all duration-300"
          style={{
            width: size === "sm" ? 16 : 20,
            height: size === "sm" ? 16 : 20,
            background: "#fff",
            left: isDark ? 2 : size === "sm" ? 18 : 22,
          }}
        >
          <span style={{ fontSize: size === "sm" ? 8 : 10, lineHeight: 1 }}>
            {isDark ? "🌙" : "☀️"}
          </span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className="font-medium select-none"
          style={{
            fontSize: size === "sm" ? 12 : 14,
            color: "var(--text-secondary)",
          }}
        >
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}