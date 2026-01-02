"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/hooks/themeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, _hasHydrated } = useThemeStore();

  useEffect(() => {
    if (_hasHydrated) {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
      
      if (theme === 'dark') {
        document.body.style.setProperty('background-color', '#0a0a0a', 'important');
        document.body.style.setProperty('color', '#ededed', 'important');
      } else {
        document.body.style.setProperty('background-color', '#ffffff', 'important');
        document.body.style.setProperty('color', '#171717', 'important');
      }
    }
  }, [theme, _hasHydrated]);

  return <>{children}</>;
}

