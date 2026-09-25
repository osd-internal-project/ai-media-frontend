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
        <h1>{projectName || "AI Photo Booth"}</h1>
        <p>Choose your style</p>
      </div>
      {!loading && templates.length === 0 ? (
        <div className="kiosk-empty">
          <Sparkles size={48} />
          No templates yet — add them in Photo Event › Templates
        </div>
      ) : (
        <div className="kiosk-template-grid kiosk-scroll">
          {templates.map((template, index) => (
            <div
              key={template.promptGuideId}
              className="kiosk-template-card"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <div className="kiosk-frame">
                {template.imageUrls[0] && (
                  <LoadingImage className="kiosk-img" src={template.imageUrls[0]} alt={template.title} />
                )}
              </div>
              <div className="kiosk-template-body">
                <div className="kiosk-template-title">{template.title}</div>
                <button
                  type="button"
                  className="kiosk-btn is-primary"
                  onClick={() => onSelect(template)}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
