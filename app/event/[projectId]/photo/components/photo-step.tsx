"use client";

import React, { useEffect, useRef } from "react";
import { Check, ImagePlus, Wand2 } from "lucide-react";
import type {
  IPhotoEventPhoto,
  IPhotoEventTemplate,
} from "@/app/common/photo-event.type";
import { KIOSK_NEW_PHOTO_MS } from "../kiosk.types";
import LoadingImage from "@/app/components/photo-event/loading-image";

interface PhotoStepProps {
  template: IPhotoEventTemplate;
  photos: IPhotoEventPhoto[];
  selectedPhoto: IPhotoEventPhoto | null;
  submitting: boolean;
  onSelectPhoto: (photo: IPhotoEventPhoto) => void;
  onGenerate: () => void;
}

export default function PhotoStep({
  template,
  photos,
  selectedPhoto,
  submitting,
  onSelectPhoto,
  onGenerate,
}: PhotoStepProps) {
  const now = Date.now();
  const stripRef = useRef<HTMLDivElement>(null);

  // ล้อเมาส์แนวตั้งเลื่อนแถบแนวนอนได้บน desktop — ต้องเป็น non-passive จึง preventDefault ได้
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      strip.scrollLeft += event.deltaY;
    };
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, [photos.length]);

  return (
    <div className="kiosk-content">
      <div className="kiosk-heading">
        <h1>Pick your photo</h1>
        <p>Find your photo below, then tap Generate</p>
      </div>
      <div className="kiosk-photo-layout">
        <div className="kiosk-panel kiosk-template-panel">
          <div className="kiosk-panel-title">Style</div>
          <div className="kiosk-frame">
            {template.imageUrls[0] && (
              <LoadingImage className="kiosk-img" src={template.imageUrls[0]} alt={template.title} />
            )}
          </div>
          <h2>{template.title}</h2>
          {template.description && <p>{template.description}</p>}
        </div>

        <div className="kiosk-panel kiosk-preview-panel">
          <div className="kiosk-frame">
            {selectedPhoto?.url ? (
              <LoadingImage className="kiosk-img" src={selectedPhoto.url} alt={selectedPhoto.imageName} />
            ) : (
              <div className="kiosk-preview-placeholder">
                <ImagePlus size={44} />
                Select your photo
              </div>
            )}
          </div>
          <button
            type="button"
            className="kiosk-btn is-primary"
            disabled={!selectedPhoto || submitting}
            onClick={onGenerate}
          >
            <Wand2 size={24} />
            {submitting ? "Starting…" : "Generate"}
          </button>
        </div>

        <div className="kiosk-panel kiosk-strip-panel">
          <div className="kiosk-panel-title">
            <span>Photos</span>
            <span>{photos.length}</span>
          </div>
          {photos.length === 0 ? (
            <div className="kiosk-empty">
              <ImagePlus size={40} />
              Waiting for photos from our staff…
            </div>
          ) : (
            <div className="kiosk-strip-grid" ref={stripRef}>
              {photos.map((photo) => {
                const isNew = now - new Date(photo.createdAt).getTime() < KIOSK_NEW_PHOTO_MS;
                const isSelected = selectedPhoto?.id === photo.id;
                return (
                  <button
                    type="button"
                    key={photo.id}
                    className={`kiosk-thumb ${isSelected ? "is-selected" : ""} ${
                      isNew ? "is-new" : ""
                    }`}
                    onClick={() => onSelectPhoto(photo)}
                  >
                    {photo.url && (
                      <LoadingImage className="kiosk-img" src={photo.url} alt={photo.imageName} />
                    )}
                    {isNew && <span className="kiosk-thumb-badge">NEW</span>}
                    {isSelected && (
                      <span className="kiosk-thumb-check">
                        <Check size={16} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
