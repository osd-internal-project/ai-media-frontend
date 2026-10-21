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
  // Light theme mirrors dark's slate ramp (hue ~212°); no #FFFFFF surface, to cut glare.
  lightCanvas: "#E4E7EB",
  lightSurface: "#F0F2F4",
  lightField: "#F8F9FA",
  lightRaised: "#E4E7EB",
  lightBorder: "#C2C9D2",
  lightControlBorder: "#7D8A9B",
  lightInk: "#191C20",
  lightInkSecondary: "#55606E",
  lightInkTertiary: "#626D7D",
  lightPrimaryText: "#544FC0",
};

const brand = aiCaveColors;

/* ================================
   2. SEMANTIC TOKENS
================================ */
const getSemantic = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  return {
    bgBase: isDark ? brand.neutral900 : brand.lightSurface,
    bgContainer: isDark ? brand.neutral800 : brand.lightSurface,
    bgElevated: isDark ? brand.neutral700 : brand.lightRaised,
    fieldBg: isDark ? brand.neutral700 : brand.lightField,
    // Popovers/modals sit above cards, so light lifts them to the field tone.
    bgOverlay: isDark ? brand.neutral800 : brand.lightField,
    controlBorder: isDark ? brand.neutral600 : brand.lightControlBorder,
    primaryText: isDark ? brand.primary : brand.lightPrimaryText,
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
            colorBgElevated: brand.lightField,
            colorTextTertiary: brand.lightInkTertiary,
            colorTextPlaceholder: brand.lightInkTertiary,
            colorBorderSecondary: brand.lightBorder,
            // Neutral meter track: a primary-tinted track read as "full" at 0%.
            colorFillSecondary: brand.neutral350,
            boxShadowTertiary: "0 1px 2px rgba(25, 28, 32, 0.06)",
            // #6F6ADE is 4.1:1 on the slate surface; links/active text need ≥4.5.
            colorLink: brand.lightPrimaryText,
            colorPrimaryText: brand.lightPrimaryText,
            // Seed status colours read under 4.5:1 as small text.
            colorSuccessText: "#15703A",
            colorErrorText: "#B42318",
            colorWarningText: "#9A4A0B",
            // Derived info text is the mint seed (#0FEAB6), unreadable on slate.
            colorInfoText: "#08705C",
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
        colorBorder: semantic.controlBorder,
        activeBorderColor: semantic.primary,
        hoverBorderColor: semantic.primary,
      },

      InputNumber: {
        colorBgContainer: semantic.fieldBg,
        colorBorder: semantic.controlBorder,
        activeBorderColor: semantic.primary,
        hoverBorderColor: semantic.primary,
      },

      Select: {
        colorBgContainer: semantic.fieldBg,
        colorBorder: semantic.controlBorder,
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
        contentBg: semantic.bgOverlay,
        headerBg: "transparent",
      },

      Drawer: {
        colorBgElevated: semantic.bgOverlay,
      },

      Tabs: {
        itemSelectedColor: semantic.primaryText,
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

      ...(isDark ? {} : { Progress: { remainingColor: brand.neutral350 } }),

      Segmented: {
        trackBg: semantic.fieldBg,
        itemSelectedBg: semantic.primary,
        itemSelectedColor: brand.neutral100,
      },
    },
    
  };
};

/** Page canvas behind white panels; dark keeps its previous `colorBgBase`. */
export const getCanvasBg = (mode: "light" | "dark") =>
  mode === "dark" ? brand.neutral900 : brand.lightCanvas;
