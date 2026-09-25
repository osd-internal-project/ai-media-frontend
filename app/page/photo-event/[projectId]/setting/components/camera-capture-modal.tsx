"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Result, Space, Spin } from "antd";
import { Camera, RefreshCw, RotateCcw, SwitchCamera } from "lucide-react";

type TFacingMode = "user" | "environment";

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
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

export default function CameraCaptureModal({
  open,
  onClose,
  onCapture,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<TFacingMode>("environment");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [snapshot, setSnapshot] = useState<{ file: File; previewUrl: string } | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearSnapshot = useCallback(() => {
    setSnapshot((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open || snapshot) return;
    let cancelled = false;
    setStarting(true);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1920 } },
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
  }, [open, facingMode, snapshot, stopStream, retryKey]);

  const handleClose = () => {
    stopStream();
    clearSnapshot();
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
      (blob) => {
        if (!blob) {
          setError("Cannot capture the photo. Please try again.");
          return;
        }
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopStream();
        setSnapshot({ file, previewUrl: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  };

  const usePhoto = () => {
    if (!snapshot) return;
    onCapture(snapshot.file);
    handleClose();
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
            <Button icon={<RotateCcw size={16} />} onClick={clearSnapshot}>
              Retake
            </Button>
            <Button type="primary" onClick={usePhoto}>
              Use photo
            </Button>
          </Space>
        ) : (
          <Space>
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
                clearSnapshot();
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
          {snapshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={snapshot.previewUrl}
              alt="Captured"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
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
