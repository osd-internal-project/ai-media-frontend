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
        background:
          "radial-gradient(600px 480px at 0% -10%, rgba(111,106,222,0.3), transparent 60%), radial-gradient(640px 520px at 110% 110%, rgba(94,207,216,0.16), transparent 60%), #191c20",
        color: "#f2f4f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px 32px",
        gap: 20,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/Logo.png" alt="AI CAVE" style={{ height: 36, width: "auto" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 300 }}>ภาพของคุณ</div>
        <div style={{ fontSize: 14, fontWeight: 200, color: "rgba(242,244,245,0.62)", letterSpacing: "0.04em" }}>
          Your AI photo
        </div>
      </div>
      {loading ? (
        <Spin size="large" style={{ marginTop: 80 }} />
      ) : !photo ? (
        <Result
          status="404"
          title={<span style={{ color: "#f2f4f5" }}>ไม่พบรูปภาพ · Photo not found</span>}
          subTitle={<span style={{ color: "#8c99a9" }}>ลิงก์อาจไม่ถูกต้อง · This link may be invalid.</span>}
        />
      ) : (
        <>
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              aspectRatio: "3 / 4",
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(111,106,222,0.6)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.55), 0 0 60px rgba(111,106,222,0.18)",
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
            style={{
              width: "100%",
              maxWidth: 480,
              height: 56,
              fontWeight: 500,
              fontSize: 17,
              border: "none",
              background: "linear-gradient(120deg, #7b78f2 0%, #6f6ade 45%, #5ecfd8 100%)",
              boxShadow: "0 12px 34px rgba(111,106,222,0.42)",
            }}
          >
            ดาวน์โหลดรูป · Download
          </Button>
          <div style={{ color: "#8c99a9", fontSize: 13, textAlign: "center", maxWidth: 480, lineHeight: 1.6 }}>
            iPhone: กดค้างที่รูปแล้วเลือก “บันทึกลงรูปภาพ”
            <br />
            On iPhone, press and hold the photo, then tap “Save to Photos”.
          </div>
        </>
      )}
    </div>
  );
};

export default SharePhotoPage;
