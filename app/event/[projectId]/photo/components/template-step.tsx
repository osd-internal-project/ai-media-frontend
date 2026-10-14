"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import type { IPhotoEventTemplate } from "@/app/common/photo-event.type";
import LoadingImage from "@/app/components/photo-event/loading-image";

interface TemplateStepProps {
  projectName: string;
  templates: IPhotoEventTemplate[];
  loading: boolean;
  onSelect: (template: IPhotoEventTemplate) => void;
}

export default function TemplateStep({
  projectName,
  templates,
  loading,
  onSelect,
}: TemplateStepProps) {
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
        <div className="kiosk-template-grid kiosk-scroll">
          {templates.map((template, index) => (
            <button
              type="button"
              key={template.promptGuideId}
              className="kiosk-card"
              style={{ animationDelay: `${Math.min(index * 50, 450)}ms` }}
              onClick={() => onSelect(template)}
            >
              {template.imageUrls[0] && (
                <LoadingImage
                  className="kiosk-img"
                  src={template.imageUrls[0]}
                  alt={template.title}
                />
              )}
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
