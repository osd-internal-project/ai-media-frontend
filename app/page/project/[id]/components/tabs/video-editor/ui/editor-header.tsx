"use client";

import { useCallback, useState } from "react";
import { Button, Drawer, Modal, Popconfirm } from "antd";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import useResponsive from "@/app/hooks/useResponsive";
import { useEditor } from "../editor-context";
import { useEditorColors } from "../editor-theme";
import { STRINGS } from "../strings";
import ExportPanel from "./export-panel";

/** Save status, start over, full screen and Export (mockup top bar). */
export default function EditorHeader({
  fullscreen,
  onToggleFullscreen,
}: {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const { saveStatus, resetProject, state } = useEditor();
  const { isDesktop } = useResponsive();
  const colors = useEditorColors();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const onBusyChange = useCallback((busy: boolean) => setExportBusy(busy), []);
  const isEmpty = state.present.layers.every((layer) => layer.items.length === 0);

  const status =
    saveStatus === "saving"
      ? STRINGS.saving
      : saveStatus === "error"
        ? STRINGS.saveFailed
        : saveStatus === "saved"
          ? STRINGS.savedLocal
          : "";
  // Closing mid-export would unmount the panel and abort the export.
  const close = () => {
    if (!exportBusy) setExportOpen(false);
  };
  const panel = <ExportPanel onBusyChange={onBusyChange} />;

  return (
    <div className="h-12 shrink-0 flex items-center gap-2 px-3" style={{ color: colors.text }}>
      <span
        className="flex-1 min-w-0 truncate text-xs"
        style={{ color: saveStatus === "error" ? colors.error : colors.textSecondary }}
        aria-live="polite"
      >
        {status}
      </span>
      <Popconfirm title={STRINGS.startOverConfirm} onConfirm={() => void resetProject()} disabled={isEmpty}>
        <Button type="text" disabled={isEmpty} icon={<RotateCcw size={16} aria-hidden="true" />}>
          {isDesktop && STRINGS.startOver}
        </Button>
      </Popconfirm>
      <Button
        type="text"
        aria-label={fullscreen ? STRINGS.exitFullscreen : STRINGS.fullscreen}
        title={fullscreen ? STRINGS.exitFullscreen : STRINGS.fullscreen}
        onClick={onToggleFullscreen}
        icon={fullscreen ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
      />
      <Button type="primary" shape="round" disabled={isEmpty} onClick={() => setExportOpen(true)}>
        {STRINGS.export}
      </Button>
      {isDesktop ? (
        <Modal
          open={exportOpen}
          title={STRINGS.exportTitle}
          onCancel={close}
          closable={!exportBusy}
          maskClosable={!exportBusy}
          footer={null}
          destroyOnHidden
        >
          {panel}
        </Modal>
      ) : (
        <Drawer
          placement="bottom"
          height="auto"
          open={exportOpen}
          title={STRINGS.exportTitle}
          onClose={close}
          closable={!exportBusy}
          maskClosable={!exportBusy}
          destroyOnHidden
          styles={{ body: { paddingBottom: 28 } }}
        >
          {panel}
        </Drawer>
      )}
    </div>
  );
}
