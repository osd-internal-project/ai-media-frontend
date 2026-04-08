"use client";
import React from "react";
import { useThemeMode } from "./ThemeProvider";
import { Button } from "antd";
import {
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { getThemeConfig } from '../theme/themeConfig';


export default function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();
  const semantic = getThemeConfig(mode).token;
  return (
    <Button
      type="text"
      icon={
        mode === 'dark'
          ? <SunOutlined style={{ color: semantic?.colorTextBase }} />
          : <MoonOutlined style={{ color: semantic?.colorTextBase }} />
      }
      onClick={toggleMode}
    />
  );
}
