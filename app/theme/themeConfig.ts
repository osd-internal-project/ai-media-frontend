import type { ThemeConfig } from "antd";
import { theme } from "antd";

/**
 * ============================================================
 *  AI CAVE DESIGN SYSTEM (Single File Version)
 * ============================================================
 */

/* ================================
   1. BRAND TOKENS (Single Source)
================================ */
export const aiCaveColors = {
  primary: "#6F6ADE",
  primaryLight: "#E3E2FA", // สีจางของ primary
  primaryDark: "#4B49A1", // สีเข้มของ primary
  secondary: "#0FEAB6",
  dreamActor: "#0D4DE5",
  accent: "#FF8F00",
  success: "#22C55E",
  warning: "#FF8F00",
  error: "#FF3C38",
  darkCard: "#21262B",
  darkBg: "#191C20",
  neutral900: "#191C20",
  neutral800: "#21262B",
  neutral700: "#2A3038",
  neutral600: "#3A434F",
  neutral500: "#8C99A9",
  neutral350: "#D3DAE3",
  neutral300: "#DADEE2",
  neutral200: "#F2F4F5",
  neutral150: "#FAFBFD",
  neutral100: "#FFFFFF",
  // Light theme: cool primary-tinted canvas so white surfaces stand off it without borders.
  lightCanvas: "#F4F4F9",
  lightRaised: "#ECECF5",
  lightBorder: "#E3E3EE",
  lightInk: "#1C1D2B",
  lightInkSecondary: "#5E6275",
  lightInkTertiary: "#8A8EA3",
};

const brand = aiCaveColors;

/* ================================
   2. SEMANTIC TOKENS
================================ */
const getSemantic = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  return {
    bgBase: isDark ? brand.neutral900 : brand.neutral100,
    bgContainer: isDark ? brand.neutral800 : brand.neutral100,
    bgElevated: isDark ? brand.neutral700 : brand.lightRaised,
    fieldBg: isDark ? brand.neutral700 : brand.neutral100,
    primaryLight: isDark ? brand.primaryDark : brand.primaryLight,
    colorBgTextActive: isDark ? brand.neutral700 : brand.neutral300,
    textBase: isDark ? brand.neutral200 : brand.lightInk,
    textSecondary: isDark ? brand.neutral500 : brand.lightInkSecondary,

    border: isDark ? brand.neutral600 : brand.lightBorder,

    primary: brand.primary,
    secondary: brand.secondary,
    success: brand.success,
    warning: brand.warning,
    error: brand.error,
    colorDreamActor: brand.dreamActor,
  };
};

/* ================================
   3. ANTD THEME CONFIG
================================ */
export const getThemeConfig = (mode: "light" | "dark"): ThemeConfig => {
  const isDark = mode === "dark";
  const semantic = getSemantic(mode);

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,

    token: {
      /* ===== Seed Tokens ===== */
      colorPrimary: semantic.primary,
      colorInfo: semantic.secondary,
      colorSuccess: semantic.success,
      colorWarning: semantic.warning,
      colorError: semantic.error,
      colorBgTextActive: semantic.colorBgTextActive,
      colorBgBase: semantic.bgBase,
      colorPrimaryBg: semantic.primaryLight,
      colorBgContainer: semantic.bgContainer,
      colorBorder: semantic.border,

      colorTextBase: semantic.textBase,
      colorTextSecondary: semantic.textSecondary,

      // Light-only: dark keeps antd's derived values.
      ...(isDark
        ? {}
        : {
            colorBgLayout: brand.lightCanvas,
            colorTextTertiary: brand.lightInkTertiary,
            colorTextPlaceholder: brand.lightInkTertiary,
            colorBorderSecondary: brand.lightBorder,
            // Neutral meter track: a primary-tinted track read as "full" at 0%.
            colorFillSecondary: brand.lightRaised,
            boxShadowTertiary: "0 1px 2px rgba(28, 29, 43, 0.06)",
          }),

      borderRadius: 10,
      fontFamily:
        "'Eudoxus Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    components: {
      Button: {
        borderRadius: 10,
        controlHeight: 40,
        colorText: semantic.textBase,
        colorBgTextHover: semantic.bgElevated,
      },

      Card: {
        colorBgContainer: semantic.bgContainer,
        borderRadiusLG: 14,
      },

      Input: {
        colorBgContainer: semantic.fieldBg,
        colorBorder: semantic.border,
        activeBorderColor: semantic.primary,
        hoverBorderColor: semantic.primary,
      },

      InputNumber: {
        colorBgContainer: semantic.fieldBg,
        colorBorder: semantic.border,
        activeBorderColor: semantic.primary,
        hoverBorderColor: semantic.primary,
      },

      Select: {
        colorBgContainer: semantic.fieldBg,
        colorBorder: semantic.border,
        activeBorderColor: semantic.primary,
        hoverBorderColor: semantic.primary,
      },

      Table: {
        headerBg: semantic.bgElevated,
        borderColor: semantic.border,
      },

      Layout: {
        bodyBg: isDark ? semantic.bgBase : brand.lightCanvas,
        headerBg: semantic.bgContainer,
        siderBg: semantic.bgContainer,
      },

      Menu: {
        itemBg: semantic.bgContainer,
        itemSelectedBg: semantic.primary,
        itemSelectedColor: brand.neutral100,
      },

      Modal: {
        contentBg: semantic.bgContainer,
        headerBg: "transparent",
      },

      Drawer: {
        colorBgElevated: semantic.bgContainer,
      },

      Tabs: {
        itemSelectedColor: semantic.primary,
        inkBarColor: semantic.primary,
      },

      Slider: {
        railBg: semantic.border,
        railHoverBg: semantic.border,
        trackBg: semantic.primary,
        trackHoverBg: semantic.primary,
        handleColor: semantic.primary,
        handleActiveColor: semantic.primary,
        dotBorderColor: semantic.border,
        dotActiveBorderColor: semantic.primary,
      },

      ...(isDark ? {} : { Progress: { remainingColor: brand.lightRaised } }),

      Segmented: {
        trackBg: semantic.fieldBg,
        itemSelectedBg: semantic.primary,
        itemSelectedColor: brand.neutral100,
      },
    },
    
  };
};