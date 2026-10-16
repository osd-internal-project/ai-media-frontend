import { useMemo } from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";

export interface EditorColors {
  bg: string;
  panel: string;
  elevated: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  /** Trim handles and the playhead accent. */
  handle: string;
  error: string;
}

/** Maps the mockup's palette onto the app's antd tokens so dark/light both work. */
export function useEditorColors(): EditorColors {
  const { mode } = useThemeMode();
  return useMemo(() => {
    const token = getThemeConfig(mode).token ?? {};
    return {
      bg: token.colorBgBase ?? aiCaveColors.darkBg,
      panel: token.colorBgContainer ?? aiCaveColors.darkCard,
      elevated: token.colorBgTextHover ?? aiCaveColors.neutral700,
      border: token.colorBorder ?? aiCaveColors.neutral600,
      text: token.colorTextBase ?? aiCaveColors.neutral200,
      textSecondary: token.colorTextSecondary ?? aiCaveColors.neutral500,
      primary: token.colorPrimary ?? aiCaveColors.primary,
      handle: aiCaveColors.secondary,
      error: token.colorError ?? aiCaveColors.error,
    };
  }, [mode]);
}
