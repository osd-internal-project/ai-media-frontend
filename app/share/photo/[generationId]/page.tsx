"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Result, Spin } from "antd";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import type { IPublicPhotoEvent } from "@/app/common/photo-event.type";
import PhotoEventService from "@/app/services/photo-event.service";
import { axiosCore } from "@/app/lib/axios/axios";
import LoadingImage from "@/app/components/photo-event/loading-image";

/** หน้าสาธารณะจาก QR code — ไม่ต้อง login (อยู่นอก matcher ของ middleware) */
const SharePhotoPage = () => {
  const { generationId } = useParams<{ generationId: string }>();
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const [photo, setPhoto] = useState<IPublicPhotoEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    photoEventService
      .findPublic(generationId)
      .then((result) => setPhoto(result ?? null))
      .finally(() => setLoading(false));
  }, [generationId, photoEventService]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0d0f14",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px 32px",
        gap: 20,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>
        AI CAVE · Photo Event
      </div>
      {loading ? (
        <Spin size="large" style={{ marginTop: 80 }} />
      ) : !photo ? (
        <Result
          status="404"
          title={<span style={{ color: "#fff" }}>Photo not found</span>}
          subTitle={<span style={{ color: "#aaa" }}>This link may be invalid.</span>}
        />
      ) : (
        <>
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              aspectRatio: "3 / 4",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <LoadingImage
              src={photo.imageUrl}
              alt="Your AI photo"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={<Download size={18} />}
            href={photoEventService.publicDownloadUrl(photo.id)}
            style={{ width: "100%", maxWidth: 480, height: 52, fontWeight: 700 }}
          >
            Download photo
          </Button>
          <div style={{ color: "#9aa0aa", fontSize: 14, textAlign: "center", maxWidth: 480 }}>
            On iPhone, you can also press and hold the photo, then tap “Save to Photos”.
          </div>
        </>
      )}
    </div>
  );
};

export default SharePhotoPage;
