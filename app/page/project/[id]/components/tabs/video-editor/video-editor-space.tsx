"use client";

import { useEffect, useState } from "react";
import { Drawer, Spin } from "antd";
import { ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import useResponsive from "@/app/hooks/useResponsive";
import { EditorProvider, useEditor } from "./editor-context";
import { useEditorColors } from "./editor-theme";
import { missingBrowserApis } from "./media/support";
import { STRINGS } from "./strings";
import EditorHeader from "./ui/editor-header";
import Inspector from "./ui/inspector";
import MediaBin from "./ui/media-bin";
import MobileToolbar from "./ui/mobile-toolbar";
import PreviewFrame from "./ui/preview-frame";
import Timeline from "./ui/timeline";
import Unsupported from "./ui/unsupported";

export default function VideoEditorSpace({ projectId }: { projectId: string }) {
  // Loaded with ssr:false, so `window` is available on first render.
  const [missing] = useState(missingBrowserApis);
  if (missing.length > 0) return <Unsupported missing={missing} />;

  return (
    <EditorProvider projectId={projectId}>
      <EditorLayout projectId={projectId} />
    </EditorProvider>
  );
}

/** Small round toggle that sits in a card corner to collapse or expand it. */
function CollapseToggle({
  collapsed,
  onToggle,
  direction,
  className,
}: {
  collapsed: boolean;
  onToggle: () => void;
  direction: "left" | "down";
  className?: string;
}) {
  const colors = useEditorColors();
  const Icon =
    direction === "left"
      ? collapsed
        ? PanelLeftOpen
        : PanelLeftClose
      : collapsed
        ? ChevronUp
        : ChevronDown;
  return (
    <button
      type="button"
      aria-label={collapsed ? STRINGS.expand : STRINGS.collapse}
      title={collapsed ? STRINGS.expand : STRINGS.collapse}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={`w-7 h-7 rounded-md grid place-items-center border-0 cursor-pointer transition-colors ${className ?? ""}`}
      style={{ background: colors.elevated, color: colors.textSecondary }}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}

function EditorLayout({ projectId }: { projectId: string }) {
  const { isDesktop } = useResponsive();
  const { ready } = useEditor();
  const colors = useEditorColors();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [binCollapsed, setBinCollapsed] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const panel = { background: colors.panel, border: `1px solid ${colors.border}` };

  // Esc leaves full screen (antd closes its own modals first, they stop propagation).
  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  if (!ready) {
    return (
      <div className="h-full w-full grid place-items-center">
        <Spin />
      </div>
    );
  }

  // A fixed overlay instead of the Fullscreen API: it works on iPhone and keeps antd modals visible.
  const shell = `${fullscreen ? "fixed inset-0 z-[999]" : "h-full"} min-h-0 flex flex-col transition-[padding] duration-200`;
  const header = (
    <EditorHeader fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((value) => !value)} />
  );
  const timeline = (onAddMedia: (() => void) | undefined, className: string) => (
    <section
      className={`relative shrink-0 overflow-hidden transition-[height] duration-200 ${className}`}
      style={{ ...panel, height: timelineCollapsed ? 40 : isDesktop ? 216 : 196 }}
    >
      {timelineCollapsed ? (
        <div className="h-full flex items-center gap-2 pl-12 text-xs" style={{ color: colors.textSecondary }}>
          {STRINGS.timeline}
        </div>
      ) : (
        <Timeline onAddMedia={onAddMedia} />
      )}
      <CollapseToggle
        collapsed={timelineCollapsed}
        onToggle={() => setTimelineCollapsed((value) => !value)}
        direction="down"
        className="absolute left-1.5 top-1.5 z-50"
      />
    </section>
  );

  if (isDesktop) {
    return (
      <div className={`${shell} gap-2 p-2`} style={{ background: colors.bg }}>
        {header}
        <div
          className="flex-1 min-h-0 grid gap-2 transition-[grid-template-columns] duration-200"
          style={{ gridTemplateColumns: `${binCollapsed ? 44 : 280}px minmax(0, 1fr) 260px` }}
        >
          <aside className="min-h-0 rounded-[14px] p-2 flex flex-col gap-2 overflow-hidden" style={panel}>
            <CollapseToggle
              collapsed={binCollapsed}
              onToggle={() => setBinCollapsed((value) => !value)}
              direction="left"
              className={binCollapsed ? "self-center" : "self-end"}
            />
            {!binCollapsed && (
              <div className="flex-1 min-h-0 px-1">
                <MediaBin projectId={projectId} />
              </div>
            )}
          </aside>
          <section className="min-h-0 rounded-[14px] overflow-hidden" style={panel}>
            <PreviewFrame />
          </section>
          <aside className="min-h-0 overflow-y-auto rounded-[14px] p-3" style={panel}>
            <Inspector />
          </aside>
        </div>
        {timeline(undefined, "rounded-[14px]")}
      </div>
    );
  }

  return (
    <div className={shell} style={{ background: colors.bg }}>
      {header}
      <div className="flex-1 min-h-50">
        <PreviewFrame />
      </div>
      {timeline(() => setMediaOpen(true), "")}
      <div className="shrink-0" style={{ background: colors.panel, borderTop: `1px solid ${colors.border}` }}>
        <MobileToolbar onOpenMedia={() => setMediaOpen(true)} />
      </div>
      <Drawer
        placement="bottom"
        height="70%"
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        title={STRINGS.addMedia}
        styles={{ body: { padding: 12 } }}
      >
        <MediaBin projectId={projectId} onAdded={() => setMediaOpen(false)} />
      </Drawer>
    </div>
  );
}
