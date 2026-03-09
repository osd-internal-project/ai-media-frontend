"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { ConfigProvider } from "antd";
import { getThemeConfig } from "@/app/theme/themeConfig";

// Theme mode type
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));


  // ดึง theme config ตาม mode
  const themeConfig = getThemeConfig(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
