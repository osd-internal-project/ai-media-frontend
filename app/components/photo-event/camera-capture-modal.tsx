"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Result, Space, Spin, Typography } from "antd";
import { Camera, RefreshCw, RotateCcw, SwitchCamera } from "lucide-react";

type TFacingMode = "user" | "environment";

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  /** true = กด Use photo แล้วกลับไปหน้ากล้องทันทีเพื่อถ่ายใบต่อไป, false = ปิด modal */
  continuous?: boolean;
  defaultFacingMode?: TFacingMode;
}

/** เปิดกล้องได้ต้องเป็น https หรือ localhost และ browser รองรับ getUserMedia */
export const canUseLiveCamera = (): boolean =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  Boolean(navigator.mediaDevices?.getUserMedia);

const JPEG_QUALITY = 0.92;

const describeCameraError = (error: unknown): string => {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError") return "Camera permission was denied. Allow camera access in the browser settings and try again.";
  if (name === "NotFoundError") return "No camera was found on this device.";
  if (name === "NotReadableError") return "The camera is being used by another app.";
  return error instanceof Error ? error.message : "Cannot open the camera.";
};

const readAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Cannot read the photo."));
    reader.readAsDataURL(blob);
  });

export default function CameraCaptureModal({
  open,
  onClose,
  onCapture,
  continuous = false,
  defaultFacingMode = "environment",
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<TFacingMode>(defaultFacingMode);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [snapshot, setSnapshot] = useState<{ file: File; previewUrl: string } | null>(null);
  const [sentCount, setSentCount] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // stream เปิดค้างตลอดที่ modal เปิด — ถ่ายซ้ำ/Retake ไม่ต้องรอกล้อง warm-up ใหม่
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStarting(true);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 3840 }, height: { ideal: 3840 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => !cancelled && setError(describeCameraError(err)))
      .finally(() => !cancelled && setStarting(false));
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, facingMode, stopStream, retryKey]);

  const handleClose = () => {
    stopStream();
    setSnapshot(null);
    setSentCount(0);
    onClose();
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    // กล้องหน้าแสดงแบบกระจก — บันทึกให้ตรงกับที่ผู้ใช้เห็น
    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Cannot capture the photo. Please try again.");
          return;
        }
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        try {
          // data: URL แทน blob: — CSP ของ prod บล็อก blob: สำหรับรูป
          setSnapshot({ file, previewUrl: await readAsDataUrl(blob) });
        } catch (err) {
          setError(describeCameraError(err));
        }
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  };

  const usePhoto = () => {
    if (!snapshot) return;
    onCapture(snapshot.file);
    if (!continuous) {
      handleClose();
      return;
    }
    setSnapshot(null);
    setSentCount((count) => count + 1);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Take photo"
      width={720}
      centered
      destroyOnHidden
      footer={
        error ? null : snapshot ? (
          <Space>
            <Button icon={<RotateCcw size={16} />} onClick={() => setSnapshot(null)}>
              Retake
            </Button>
            <Button type="primary" onClick={usePhoto}>
              {continuous ? "Use & take next" : "Use photo"}
            </Button>
          </Space>
        ) : (
          <Space wrap>
            {continuous && sentCount > 0 && (
              <Typography.Text type="secondary">Sent {sentCount} photo(s)</Typography.Text>
            )}
            <Button
              icon={<SwitchCamera size={16} />}
              onClick={() =>
                setFacingMode((mode) => (mode === "user" ? "environment" : "user"))
              }
            >
              Switch camera
            </Button>
            <Button
              type="primary"
              icon={<Camera size={16} />}
              disabled={starting}
              onClick={takeSnapshot}
            >
              Capture
            </Button>
          </Space>
        )
      }
    >
      {error ? (
        <Result
          status="warning"
          title="Camera unavailable"
          subTitle={error}
          extra={
            <Button
              icon={<RefreshCw size={16} />}
              onClick={() => {
                setSnapshot(null);
                setRetryKey((key) => key + 1);
              }}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "3 / 4",
            maxHeight: "65vh",
            margin: "0 auto",
            background: "#000",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: facingMode === "user" ? "scaleX(-1)" : undefined,
              visibility: snapshot ? "hidden" : "visible",
            }}
          />
          {snapshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={snapshot.previewUrl}
              alt="Captured"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {starting && !snapshot && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
