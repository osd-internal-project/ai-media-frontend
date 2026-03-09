"use client";

import { Grid } from "antd";

const { useBreakpoint } = Grid;

export default function useResponsive() {
  const screens = useBreakpoint();

  const isXs = !!screens.xs && !screens.sm;
  const isSm = !!screens.sm && !screens.md;
  const isMd = !!screens.md && !screens.lg;
  const isLg = !!screens.lg && !screens.xl;
  const isXl = !!screens.xl && !screens.xxl;
  const isXxl = !!screens.xxl;

  return {
    screens,
    isMobile: isXs || isSm,
    isTablet: isMd,
    isDesktop: !!screens.lg,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
  };
}
