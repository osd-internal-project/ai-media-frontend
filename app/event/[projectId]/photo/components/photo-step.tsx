"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronUp, ImagePlus, Images, RefreshCw, Wand2 } from "lucide-react";
import type {
  IPhotoEventPhoto,
  IPhotoEventTemplate,
} from "@/app/common/photo-event.type";
import LoadingImage from "@/app/components/photo-event/loading-image";
import { KIOSK_NEW_PHOTO_MS } from "../kiosk.types";

interface PhotoStepProps {
  template: IPhotoEventTemplate;
  photos: IPhotoEventPhoto[];
  selectedPhoto: IPhotoEventPhoto | null;
  submitting: boolean;
  onSelectPhoto: (photo: IPhotoEventPhoto) => void;
  onChangeTemplate: () => void;
  onGenerate: () => void;
}

export default function PhotoStep({
  template,
  photos,
  selectedPhoto,
  submitting,
  onSelectPhoto,
  onChangeTemplate,
  onGenerate,
}: PhotoStepProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // จำนวนรูปที่แขกเห็นแล้ว — รูปที่เพิ่มหลังจากนั้นขึ้นเป็น "+n" บนปุ่มเปิดแผง
  const [seenCount, setSeenCount] = useState(photos.length);
  const stripRef = useRef<HTMLDivElement>(null);
  const now = Date.now();
  const newCount = sheetOpen ? 0 : Math.max(0, photos.length - seenCount);

  const openSheet = () => {
    setSeenCount(photos.length);
    setSheetOpen(true);
  };

  const toggleSheet = () => (sheetOpen ? setSheetOpen(false) : openSheet());

  const selectPhoto = (photo: IPhotoEventPhoto) => {
    onSelectPhoto(photo);
    setSeenCount(photos.length);
    setSheetOpen(false);
  };

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
  }, [sheetOpen, photos.length]);

  return (
    <div className="kiosk-content">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Step 02 · Your photo</span>
        <h1>{selectedPhoto ? "พร้อมสร้างภาพแล้ว" : "เลือกรูปของคุณ"}</h1>
        <span className="kiosk-sub kiosk-serif">
          {selectedPhoto ? "Ready when you are" : "Find your photo below"}
        </span>
      </div>

      <div className="kiosk-photo-stage">
        <div className="kiosk-chip">
          <div className="kiosk-chip-thumb">
            {template.imageUrls[0] && (
              <LoadingImage className="kiosk-img" src={template.imageUrls[0]} alt={template.title} />
            )}
          </div>
          <div className="kiosk-chip-text">
            <span>Style</span>
            <strong>{template.title}</strong>
          </div>
          <button type="button" className="kiosk-btn" onClick={onChangeTemplate}>
            เปลี่ยน <small>Change</small>
          </button>
        </div>

        {selectedPhoto?.url ? (
          <div className="kiosk-hero is-selected" key={selectedPhoto.id}>
            <LoadingImage className="kiosk-img" src={selectedPhoto.url} alt={selectedPhoto.imageName} />
          </div>
        ) : (
          <div className="kiosk-hero">
            <div className="kiosk-hero-empty">
              <ImagePlus size={52} strokeWidth={1.2} />
              <div>
                แตะเพื่อเลือกรูปของคุณ
                <div className="kiosk-serif" style={{ marginTop: 4 }}>
                  Tap to choose your photo
                </div>
              </div>
              <button type="button" className="kiosk-btn is-primary" onClick={openSheet}>
                <Images size={22} />
                เลือกรูป <small>Choose photo</small>
              </button>
            </div>
          </div>
        )}

        {selectedPhoto && (
          <div className="kiosk-actions">
            <button type="button" className="kiosk-btn" onClick={openSheet}>
              <RefreshCw size={20} />
              เปลี่ยนรูป <small>Change</small>
            </button>
            <button
              type="button"
              className="kiosk-btn is-primary"
              disabled={submitting}
              onClick={onGenerate}
            >
              <Wand2 size={22} />
              {submitting ? "กำลังเริ่ม…" : "สร้างภาพ"} <small>Generate</small>
            </button>
          </div>
        )}
      </div>

      <div className={`kiosk-sheet ${sheetOpen ? "is-open" : ""}`}>
        <button type="button" className="kiosk-sheet-toggle" onClick={toggleSheet}>
          <Images size={22} color="var(--k-accent)" />
          รูปทั้งหมด
          <span className="kiosk-sheet-count">All photos · {photos.length}</span>
          {newCount > 0 && <span className="kiosk-sheet-new">+{newCount} NEW</span>}
          <ChevronUp className="kiosk-sheet-chevron" size={24} />
        </button>
        <div className="kiosk-sheet-body">
          <div className="kiosk-sheet-inner">
            {photos.length === 0 ? (
              <div className="kiosk-strip">
                <div className="kiosk-empty">
                  รอทีมงานนำเข้ารูป… <span className="kiosk-serif">Waiting for photos</span>
                </div>
              </div>
            ) : (
              <div
                ref={stripRef}
                className={`kiosk-strip ${selectedPhoto ? "has-selection" : ""}`}
              >
                {photos.map((photo) => {
                  const isNew = now - new Date(photo.createdAt).getTime() < KIOSK_NEW_PHOTO_MS;
                  const isSelected = selectedPhoto?.id === photo.id;
                  return (
                    <button
                      type="button"
                      key={photo.id}
                      className={`kiosk-thumb ${isSelected ? "is-selected" : ""} ${isNew ? "is-new" : ""}`}
                      onClick={() => selectPhoto(photo)}
                      aria-pressed={isSelected}
                    >
                      {photo.url && (
                        <LoadingImage className="kiosk-img" src={photo.url} alt={photo.imageName} />
                      )}
                      {isNew && <span className="kiosk-thumb-badge">NEW</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
