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
  // Light theme "Lavender haze": white cards on a lavender canvas.
  lightCanvas: "#F6F5FC",
  lightSurface: "#FFFFFF",
  lightSider: "#FBFAFF",
  lightField: "#EFEDFA",
  lightRaised: "#F3F1FD",
  lightBorder: "#E6E3F5",
  lightControlBorder: "#D6D1EE",
  lightInk: "#1E1B3A",
  lightInkSecondary: "#5B5876",
  // Muted #A19EBB fails AA as text, so it is placeholder-only; tertiary text reuses secondary.
  lightInkTertiary: "#5B5876",
  lightMuted: "#A19EBB",
  lightPrimary: "#6D5DF5",
  lightPrimaryBg: "#EFEBFF",
  lightPrimaryText: "#5B4BE0",
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
    bgOverlay: isDark ? brand.neutral800 : brand.lightSurface,
    controlBorder: isDark ? brand.neutral600 : brand.lightControlBorder,
    primaryText: isDark ? brand.primary : brand.lightPrimaryText,
    primaryLight: isDark ? brand.primaryDark : brand.lightPrimaryBg,
    colorBgTextActive: isDark ? brand.neutral700 : brand.lightBorder,
    textBase: isDark ? brand.neutral200 : brand.lightInk,
    textSecondary: isDark ? brand.neutral500 : brand.lightInkSecondary,

    border: isDark ? brand.neutral600 : brand.lightBorder,

    primary: isDark ? brand.primary : brand.lightPrimary,
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
            colorBgElevated: brand.lightSurface,
            colorTextTertiary: brand.lightInkTertiary,
            colorTextPlaceholder: brand.lightMuted,
            colorBorderSecondary: brand.lightBorder,
            colorFillSecondary: brand.lightField,
            boxShadowTertiary:
              "0 1px 2px rgba(30, 27, 58, 0.04), 0 2px 8px rgba(109, 93, 245, 0.06)",
            // Links/active text need ≥4.5:1 on white; the primary seed is lighter.
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
        siderBg: isDark ? semantic.bgContainer : brand.lightSider,
      },

      Menu: {
        itemBg: isDark ? semantic.bgContainer : brand.lightSider,
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

      ...(isDark ? {} : { Progress: { remainingColor: brand.lightField } }),

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
