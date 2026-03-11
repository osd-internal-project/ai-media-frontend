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
    bgElevated: isDark ? brand.neutral700 : brand.neutral200,
    fieldBg: isDark ? brand.neutral700 : brand.neutral150,
    primaryLight: isDark ? brand.primaryDark : brand.primaryLight,
    colorBgTextActive: isDark ? brand.neutral700 : brand.neutral300,
    textBase: isDark ? brand.neutral200 : brand.neutral900,
    textSecondary: brand.neutral500,

    border: isDark ? brand.neutral600 : brand.neutral350,

    primary: brand.primary,
    secondary: brand.secondary,
    success: brand.success,
    warning: brand.warning,
    error: brand.error,
    dreamActor: brand.dreamActor,
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
        bodyBg: semantic.bgBase,
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
    },
    
  };
};