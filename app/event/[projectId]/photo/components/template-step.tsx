"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { IPhotoEventTemplate } from "@/app/common/photo-event.type";
import TemplatePreview from "@/app/components/photo-event/template-preview";
import { KIOSK_ATTRACT_STEP_MS } from "../kiosk.types";

interface TemplateStepProps {
  projectName: string;
  templates: IPhotoEventTemplate[];
  loading: boolean;
  /** null = จำนวนคอลัมน์ตาม breakpoint */
  columns: number | null;
  /** จอว่างนาน — เน้นการ์ดวนทีละใบ */
  attract: boolean;
  onSelect: (template: IPhotoEventTemplate) => void;
}

export default function TemplateStep({
  projectName,
  templates,
  loading,
  columns,
  attract,
  onSelect,
}: TemplateStepProps) {
  const [highlight, setHighlight] = useState(0);
  const cycling = attract && templates.length > 1;

  useEffect(() => {
    if (!cycling) return;
    setHighlight(0);
    const timer = setInterval(
      () => setHighlight((index) => (index + 1) % templates.length),
      KIOSK_ATTRACT_STEP_MS,
    );
    return () => clearInterval(timer);
  }, [cycling, templates.length]);

  // React ไม่มี type ให้ CSS custom property
  const gridStyle = columns ? ({ "--k-cols": columns } as CSSProperties) : undefined;

  return (
    <div className="kiosk-content">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">{projectName || "AI Photo Booth"}</span>
        <h1>เลือกสไตล์ของคุณ</h1>
        <span className="kiosk-sub kiosk-serif">Choose your style</span>
      </div>
      {!loading && templates.length === 0 ? (
        <div className="kiosk-empty">
          <Sparkles size={44} color="var(--k-accent)" />
          ยังไม่มีสไตล์ให้เลือก — เพิ่มได้ที่ Photo Event › Setting
          <span className="kiosk-serif">No styles yet</span>
        </div>
      ) : (
        <div
          className={`kiosk-template-grid kiosk-scroll ${columns ? "has-cols" : ""}`}
          style={gridStyle}
        >
          {templates.map((template, index) => (
            <button
              type="button"
              key={template.promptGuideId}
              className={`kiosk-card ${cycling && index === highlight ? "is-attract" : ""}`}
              onClick={() => onSelect(template)}
            >
              <TemplatePreview template={template} />
              <div className="kiosk-card-meta">
                <div className="kiosk-card-title">{template.title}</div>
                <span className="kiosk-pill">เลือก · Select</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
