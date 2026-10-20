"use client";

import type { CSSProperties, ReactNode } from "react";
import { useThemeMode } from "../ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import type { GuideMockupProps } from "./tour-steps";

const HEAD_IDS = ["tabs", "view-switch"];
const STICKY_IDS = ["quota", "generate", "result"];

function useBox() {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  return {
    semantic,
    box: (extra?: CSSProperties): CSSProperties => ({
      position: "relative",
      borderRadius: 6,
      border: `1px dashed ${semantic.colorBorder}`,
      background: semantic.colorBgContainer,
      ...extra,
    }),
  };
}

function Box({ style, children }: { style: CSSProperties; children?: ReactNode }) {
  return <div style={style}>{children}</div>;
}

function Marker({ children }: { children: ReactNode }) {
  return <div style={{ position: "absolute", top: -9, right: -9, zIndex: 1 }}>{children}</div>;
}

function WorkHead({ marker }: Pick<GuideMockupProps, "marker">) {
  const { box } = useBox();
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <Box style={box({ flex: 1, height: 24 })}>
        <Marker>{marker("tabs")}</Marker>
      </Box>
      <Box style={box({ width: 70, height: 24 })}>
        <Marker>{marker("view-switch")}</Marker>
      </Box>
    </div>
  );
}

export function ProjectListMockup({ marker }: GuideMockupProps) {
  const { semantic, box } = useBox();
  return (
    <div style={{ display: "flex", gap: 8, height: 190 }}>
      <Box style={box({ width: 38 })}>
        <Marker>{marker("sider-menu")}</Marker>
      </Box>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <Box style={box({ width: 120, height: 24 })}>
          <Marker>{marker("org-switcher")}</Marker>
        </Box>
        <div style={{ display: "flex", gap: 8 }}>
          <Box style={box({ flex: 1, height: 24 })}>
            <Marker>{marker("project-filter")}</Marker>
          </Box>
          <Box style={box({ width: 46, height: 24 })}>
            <Marker>{marker("project-view")}</Marker>
          </Box>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          <Box style={box({ borderStyle: "solid", borderColor: semantic.colorPrimary })}>
            <Marker>{marker("project-card")}</Marker>
          </Box>
          {[0, 1, 2].map((i) => (
            <Box key={i} style={box()} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function GenerateMockup({ stepIds, marker }: GuideMockupProps) {
  const { semantic, box } = useBox();
  const formIds = stepIds.filter((id) => !HEAD_IDS.includes(id) && !STICKY_IDS.includes(id));
  return (
    <div>
      <WorkHead marker={marker} />
      <div style={{ display: "flex", gap: 10, minHeight: 160 }}>
        <div style={{ width: "42%", display: "flex", flexDirection: "column", gap: 9 }}>
          {formIds.map((id) => (
            <Box key={id} style={box({ height: id === "prompt" ? 34 : 16 })}>
              <Marker>{marker(id)}</Marker>
            </Box>
          ))}
          <Box style={box({ height: 16, marginTop: "auto" })}>
            <Marker>{marker("quota")}</Marker>
          </Box>
          <Box
            style={box({
              height: 18,
              border: "none",
              background: `linear-gradient(135deg, ${semantic.colorPrimary} 0%, ${semantic.colorPrimary} 50%, ${semantic.colorInfo} 100%)`,
            })}
          >
            <Marker>{marker("generate")}</Marker>
          </Box>
        </div>
        <Box style={box({ flex: 1 })}>
          <Marker>{marker("result")}</Marker>
        </Box>
      </div>
    </div>
  );
}

export function LibraryMockup({ marker }: GuideMockupProps) {
  const { box } = useBox();
  return (
    <div>
      <WorkHead marker={marker} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, height: 150 }}>
        <Box style={box({ width: 90, height: 28 })}>
          <Marker>{marker("library-head")}</Marker>
        </Box>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          <Box style={box()}>
            <Marker>{marker("library-card")}</Marker>
          </Box>
          {[0, 1, 2].map((i) => (
            <Box key={i} style={box()} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivityMockup({ marker }: GuideMockupProps) {
  const { box } = useBox();
  return (
    <div>
      <WorkHead marker={marker} />
      <Box style={box({ height: 150, display: "flex", justifyContent: "flex-end" })}>
        <Marker>{marker("activity-table")}</Marker>
        <Box style={box({ width: 70, margin: 6 })}>
          <Marker>{marker("activity-actions")}</Marker>
        </Box>
      </Box>
    </div>
  );
}

export function VideoEditorMockup({ marker }: GuideMockupProps) {
  const { box } = useBox();
  return (
    <div>
      <WorkHead marker={marker} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <Box style={box({ width: 60, height: 20 })}>
          <Marker>{marker("ve-export")}</Marker>
        </Box>
      </div>
      <div style={{ display: "flex", gap: 8, height: 110 }}>
        <Box style={box({ width: "24%" })}>
          <Marker>{marker("ve-bin")}</Marker>
        </Box>
        <Box style={box({ flex: 1 })}>
          <Marker>{marker("ve-preview")}</Marker>
        </Box>
        <Box style={box({ width: "24%" })}>
          <Marker>{marker("ve-inspector")}</Marker>
        </Box>
      </div>
      <Box style={box({ height: 34, marginTop: 8 })}>
        <Marker>{marker("ve-timeline")}</Marker>
      </Box>
    </div>
  );
}
