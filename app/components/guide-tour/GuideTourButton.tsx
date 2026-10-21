"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Button, Tooltip, Tour } from "antd";
import type { TourProps } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Lightbulb } from "lucide-react";
import { useThemeMode } from "../ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import GuideModal from "./GuideModal";
import type { GuideTab } from "./GuideModal";
import { TAB_DESC } from "./tour-steps";
import type { GuideContent, GuideStep } from "./tour-steps";

type ResolvedStep = { step: GuideStep; el: HTMLElement };

// Steps whose element is not on screen drop out, so tabs without permission and hidden panes never appear.
function resolveSteps(steps: GuideStep[]): ResolvedStep[] {
  return steps.flatMap((step) => {
    const el = Array.from(document.querySelectorAll<HTMLElement>(step.selector)).find(
      (node) => node.getClientRects().length > 0,
    );
    return el ? [{ step, el }] : [];
  });
}

// Reads the work page tabs as rendered, so the list always matches what this user can open.
function readTabs(): GuideTab[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".generate-tabs > .ant-tabs-nav [data-node-key]"),
  ).map((node) => ({
    key: node.dataset.nodeKey ?? "",
    label: node.textContent?.trim() ?? "",
    disabled: node.classList.contains("ant-tabs-tab-disabled"),
  }));
}

type GuideTourButtonProps = {
  guide: GuideContent;
  activeTab?: string;
  onSelectTab?: (key: string) => void;
};

export default function GuideTourButton({ guide, activeTab, onSelectTab }: GuideTourButtonProps) {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const [resolved, setResolved] = useState<ResolvedStep[]>([]);
  const [tabs, setTabs] = useState<GuideTab[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const refresh = () => {
    setResolved(resolveSteps(guide.steps));
    setTabs(onSelectTab ? readTabs() : []);
  };

  // After a tab switch from the modal, wait one frame so the new pane is in the DOM.
  useEffect(() => {
    if (!modalOpen) return;
    const frame = requestAnimationFrame(refresh);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh only when the guide itself changes
  }, [guide]);

  const openGuide = () => {
    refresh();
    setModalOpen(true);
  };

  const startTour = (index: number) => {
    setModalOpen(false);
    setCurrent(index);
    setTourOpen(true);
  };

  const tabList = (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
      {tabs.map((tab) => (
        <div key={tab.key} style={{ display: "flex", gap: 8 }}>
          <span style={{ minWidth: 92, fontWeight: 500 }}>{tab.label}</span>
          <span style={{ color: semantic.colorTextSecondary }}>{TAB_DESC[tab.key] ?? ""}</span>
        </div>
      ))}
    </div>
  );

  const tourSteps: TourProps["steps"] = resolved.map(({ step, el }, i) => {
    const Icon = step.icon;
    return {
      target: el,
      title: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon size={18} color={semantic.colorPrimary} />
          {step.title}
        </span>
      ),
      description: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <span>{step.description}</span>
          {step.tabList && tabList}
          {step.example && (
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 12,
                background: semantic.colorBgTextActive,
                color: semantic.colorTextBase,
              }}
            >
              ตัวอย่าง: {step.example}
            </div>
          )}
          {step.tip && (
            <span style={{ display: "flex", gap: 6, fontSize: 12, color: semantic.colorTextSecondary }}>
              <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} color={semantic.colorWarning} />
              {step.tip}
            </span>
          )}
        </div>
      ),
      prevButtonProps: { children: "ย้อนกลับ" },
      nextButtonProps: { children: i === resolved.length - 1 ? "เสร็จสิ้น" : "ถัดไป" },
    };
  });

  return (
    <>
      <Tooltip title="วิธีใช้งาน">
        <Button
          className="guide-tour-help"
          type="text"
          size="small"
          icon={<QuestionCircleOutlined />}
          aria-label="วิธีใช้งาน"
          onClick={openGuide}
          // CSSProperties has no custom-property keys; the ring colour reaches the static style block below via this var.
          style={{ "--guide-tour-ping": semantic.colorPrimary } as CSSProperties}
        />
      </Tooltip>
      <GuideModal
        open={modalOpen}
        guide={guide}
        available={resolved.map((r) => r.step)}
        tabs={onSelectTab && activeTab ? { items: tabs, active: activeTab, onSelect: onSelectTab } : undefined}
        onStart={startTour}
        onClose={() => setModalOpen(false)}
      />
      <Tour
        open={tourOpen}
        current={current}
        onChange={setCurrent}
        onClose={() => setTourOpen(false)}
        onFinish={() => setTourOpen(false)}
        steps={tourSteps}
        indicatorsRender={(cur, total) => (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ color: semantic.colorTextSecondary }}>
              ขั้น {cur + 1}/{total}
            </span>
            <span style={{ display: "inline-flex", gap: 3 }}>
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === cur ? 14 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i <= cur ? semantic.colorPrimary : semantic.colorBorder,
                    transition: "width 0.2s",
                  }}
                />
              ))}
            </span>
          </span>
        )}
      />
      {/* Keep this block static: a ${} interpolation here hangs Next 15.5's SWC styled-jsx transform (build never ends). */}
      <style jsx global>{`
        .guide-tour-help {
          position: relative;
        }
        .guide-tour-help::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 2px solid var(--guide-tour-ping);
          animation: guideTourPing 1.8s ease-out infinite;
          pointer-events: none;
        }
        @keyframes guideTourPing {
          from {
            opacity: 0.85;
            transform: scale(0.85);
          }
          to {
            opacity: 0;
            transform: scale(1.4);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .guide-tour-help::after {
            animation: none;
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
