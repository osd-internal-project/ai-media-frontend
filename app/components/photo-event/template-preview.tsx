"use client";

import React from "react";
import type { IPhotoEventTemplate } from "@/app/common/photo-event.type";
import LoadingImage from "@/app/components/photo-event/loading-image";
import PreviewGrid from "@/app/components/preview-grid";

/** preview ของ template บน kiosk — ใช้รูป result ก่อน ไม่มีค่อยใช้ ref แรก */
export default function TemplatePreview({
  template,
}: {
  template: IPhotoEventTemplate;
}) {
  const urls = template.resultUrls?.length
    ? template.resultUrls
    : template.imageUrls.slice(0, 1);
  return (
    <PreviewGrid
      items={urls}
      getKey={(url) => url}
      renderItem={(url) => (
        <LoadingImage className="kiosk-img" src={url} alt={template.title} />
      )}
    />
  );
}
