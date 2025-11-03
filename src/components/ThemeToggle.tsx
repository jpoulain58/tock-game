"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-8"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-8 w-14 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center text-sm ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

