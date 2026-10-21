"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ConfigProvider } from "antd";
import { getThemeConfig } from "@/app/theme/themeConfig";

export type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({
  children,
  initialMode = "dark",
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const themeConfig = getThemeConfig(mode);

  // ✅ KEY: set class ให้ global CSS รู้ mode
  useEffect(() => {
    const root = document.documentElement; // หรือ document.body

    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${mode}`);
    // Persist for the server-side read in app/layout.tsx.
    document.cookie = `theme=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}