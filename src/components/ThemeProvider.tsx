"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('tock-theme-storage');
    if (savedTheme) {
      try {
        const { state } = JSON.parse(savedTheme);
        setTheme(state.theme);
      } catch (e) {
        console.error('Error loading theme:', e);
      }
    }
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}

