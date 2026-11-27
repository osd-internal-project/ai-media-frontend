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
  // White text on it reaches 4.61:1 (the reference's #6C63F0 is 4.49).
  primary: "#6A61EE",
  primaryLight: "#E3E2FA", // สีจางของ primary
  primaryDark: "#4B49A1", // สีเข้มของ primary
  secondary: "#0FEAB6",
  dreamActor: "#0D4DE5",
  accent: "#FF8F00",
  success: "#22C55E",
  warning: "#FF8F00",
  error: "#FF3C38",
  // Dark theme "Night Indigo" (DESIGN.md): navy levels measured from the reference screenshot.
  darkCard: "#15163A",
  darkBg: "#0C0D24",
  neutral900: "#0C0D24",
  neutral800: "#15163A",
  neutral700: "#1D1F4E",
  neutral600: "#27295E",
  neutral500: "#A9ACD6",
  neutral350: "#D3DAE3",
  neutral300: "#DADEE2",
  neutral200: "#EEEFFB",
  darkHeader: "#0A0B1E",
  darkHeaderLine: "#1D1F4E",
  darkSider: "#111230",
  darkSiderLine: "#212357",
  darkControlBorder: "#34377A",
  darkMuted: "#7D7FA4",
  darkRail: "#23255C",
  // Readable dark text tones: the seeds read 3.48:1 (indigo) and 4.33:1 (red) on the card.
  darkPrimaryText: "#A29EF2",
  darkErrorText: "#F2848E",
  darkMintText: "#4FD6C8",
  darkWarningText: "#F5A524",
  // Selected sider tile, org initial and user avatar; light uses lightPrimary solid.
  tileGradient: "linear-gradient(135deg, #867DFF 0%, #6086FF 100%)",
  // The reference's #4F7BF5 / #E8559B read 3.83 / 3.38:1 under white initials; one step deeper passes.
  avatarBlue: "#3F6DEB",
  avatarPink: "#C93A80",
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
    controlBorder: isDark ? brand.darkControlBorder : brand.lightControlBorder,
    primaryText: isDark ? brand.darkPrimaryText : brand.lightPrimaryText,
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

      // Dark text tones replace seeds that read under 4.5:1 on Night Wall.
      ...(isDark
        ? {
            colorTextPlaceholder: brand.darkMuted,
            colorLink: brand.darkPrimaryText,
            colorPrimaryText: brand.darkPrimaryText,
            colorErrorText: brand.darkErrorText,
            colorWarningText: brand.darkWarningText,
            colorFillSecondary: brand.darkRail,
          }
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
        borderRadiusLG: 16,
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
        headerBg: isDark ? brand.darkHeader : semantic.bgContainer,
        siderBg: isDark ? brand.darkSider : brand.lightSider,
      },

      Menu: {
        itemBg: isDark ? brand.darkSider : brand.lightSider,
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

      Progress: { remainingColor: isDark ? brand.darkRail : brand.lightField },

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
