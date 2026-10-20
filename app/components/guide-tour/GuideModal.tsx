"use client";

import { Fragment } from "react";
import { Button, Modal, Typography } from "antd";
import { ChevronRight, PlayCircle } from "lucide-react";
import { useThemeMode } from "../ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import type { GuideContent, GuideStep } from "./tour-steps";

export type GuideTab = { key: string; label: string; disabled: boolean };

type GuideModalProps = {
  open: boolean;
  guide: GuideContent;
  available: GuideStep[];
  tabs?: { items: GuideTab[]; active: string; onSelect: (key: string) => void };
  onStart: (index: number) => void;
  onClose: () => void;
};

const capStyle = { fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" as const };

export default function GuideModal({ open, guide, available, tabs, onStart, onClose }: GuideModalProps) {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const Mockup = guide.mockup;

  const marker = (stepId: string) => {
    const index = available.findIndex((s) => s.id === stepId);
    if (index < 0) return null;
    return (
      <button
        type="button"
        aria-label={`เริ่มที่ขั้น ${index + 1}: ${available[index].title}`}
        onClick={() => onStart(index)}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          color: "#fff",
          background: semantic.colorPrimary,
          boxShadow: `0 0 0 3px ${semantic.colorPrimaryBg}`,
        }}
      >
        {index + 1}
      </button>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={guide.title}
      width={600}
      footer={[
        <Button key="close" onClick={onClose}>
          ปิด
        </Button>,
        <Button
          key="start"
          type="primary"
          icon={<PlayCircle size={16} />}
          disabled={available.length === 0}
          onClick={() => onStart(0)}
        >
          เริ่มสอนทีละขั้น
        </Button>,
      ]}
    >
      <Typography.Paragraph style={{ color: semantic.colorTextSecondary, marginBottom: 14 }}>
        {guide.intro}
      </Typography.Paragraph>

      {tabs && tabs.items.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <Typography.Text style={{ ...capStyle, color: semantic.colorTextSecondary }}>Tab ที่คุณใช้ได้</Typography.Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {tabs.items.map((tab) => {
              const active = tab.key === tabs.active;
              return (
                <Button
                  key={tab.key}
                  size="small"
                  disabled={tab.disabled && !active}
                  onClick={() => tabs.onSelect(tab.key)}
                  style={{
                    borderRadius: 8,
                    borderColor: active ? semantic.colorPrimary : semantic.colorBorder,
                    color: active ? semantic.colorPrimary : semantic.colorTextSecondary,
                    background: active ? `${semantic.colorPrimary}1A` : "transparent",
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Typography.Text style={{ ...capStyle, color: semantic.colorTextSecondary }}>ขั้นตอน</Typography.Text>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, margin: "6px 0 14px" }}>
        {available.map((step, i) => (
          <Fragment key={step.id}>
            {i > 0 && <ChevronRight size={14} color={semantic.colorTextSecondary} />}
            <Button size="small" type="text" onClick={() => onStart(i)} style={{ paddingInline: 6 }}>
              <span style={{ color: semantic.colorPrimary, fontWeight: 600 }}>{i + 1}</span>
              {step.title}
            </Button>
          </Fragment>
        ))}
      </div>

      <div style={{ padding: 14, borderRadius: 10, background: semantic.colorBgTextActive }}>
        <Mockup stepIds={available.map((s) => s.id)} marker={marker} />
      </div>
      <Typography.Text style={{ display: "block", marginTop: 8, fontSize: 12, color: semantic.colorTextSecondary }}>
        กดตัวเลขบนภาพเพื่อไปที่ขั้นนั้นบนหน้าจอจริง
      </Typography.Text>
    </Modal>
  );
}
