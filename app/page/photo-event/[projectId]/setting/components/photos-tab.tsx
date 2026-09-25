"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Empty,
  Popconfirm,
  Progress,
  Segmented,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { RcFile } from "antd/es/upload";
import { Camera, FolderUp, ImageUp, Trash2 } from "lucide-react";
import type {
  IPhotoEventGeneration,
  IPhotoEventPhoto,
} from "@/app/common/photo-event.type";
import PhotoEventService, {
  getPhotoEventErrorMessage,
} from "@/app/services/photo-event.service";
import { axiosCore } from "@/app/lib/axios/axios";
import GenerationResultModal from "./generation-result-modal";
import CameraCaptureModal, { canUseLiveCamera } from "./camera-capture-modal";
import { PHOTO_USAGE_META, TPhotoUsage, getPhotoUsage } from "./photo-status";

/** ต้องไม่เกิน PHOTO_EVENT_MAX_UPLOAD_FILES ของ backend */
const UPLOAD_BATCH_SIZE = 20;

type TFilter = "all" | TPhotoUsage;

interface PhotosTabProps {
  projectId: string;
  userId: string;
  photos: IPhotoEventPhoto[];
  loading: boolean;
  semantic: Record<string, unknown>;
}

export default function PhotosTab({
  projectId,
  userId,
  photos,
  loading,
  semantic,
}: PhotosTabProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<TFilter>("all");
  const [openedGeneration, setOpenedGeneration] =
    useState<IPhotoEventGeneration | null>(null);
  const pendingFiles = useRef<RcFile[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [liveCamera, setLiveCamera] = useState(false);

  // ตรวจหลัง mount เพราะ window ไม่มีตอน render ฝั่ง server
  useEffect(() => setLiveCamera(canUseLiveCamera()), []);

  const counts = useMemo(() => {
    const result: Record<TFilter, number> = {
      all: photos.length,
      unused: 0,
      generating: 0,
      generated: 0,
      failed: 0,
    };
    photos.forEach((photo) => (result[getPhotoUsage(photo)] += 1));
    return result;
  }, [photos]);

  const visiblePhotos = useMemo(
    () =>
      filter === "all"
        ? photos
        : photos.filter((photo) => getPhotoUsage(photo) === filter),
    [photos, filter],
  );

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    let uploaded = 0;
    try {
      for (let i = 0; i < files.length; i += UPLOAD_BATCH_SIZE) {
        const batch = files.slice(i, i + UPLOAD_BATCH_SIZE);
        const result = await photoEventService.uploadPhotos(projectId, userId, batch);
        uploaded += result.length;
      }
      messageApi.success(`Imported ${uploaded} photo(s)`);
    } catch (error) {
      messageApi.error(
        `Imported ${uploaded}/${files.length}: ${getPhotoEventErrorMessage(error)}`,
      );
    } finally {
      setUploading(false);
    }
  };

  /** antd เรียก beforeUpload ทีละไฟล์ — รวบให้ครบทั้งชุดก่อนแล้วค่อยอัปโหลดครั้งเดียว */
  const handleBeforeUpload = (file: RcFile, fileList: RcFile[]) => {
    pendingFiles.current.push(file);
    if (file === fileList[fileList.length - 1]) {
      const files = pendingFiles.current;
      pendingFiles.current = [];
      uploadFiles(files);
    }
    return Upload.LIST_IGNORE;
  };

  const removePhoto = async (photoId: string) => {
    try {
      await photoEventService.removePhoto(projectId, photoId, userId);
    } catch (error) {
      messageApi.error(getPhotoEventErrorMessage(error));
    }
  };

  const filterOptions = (Object.keys(counts) as TFilter[]).map((key) => ({
    value: key,
    label: `${key === "all" ? "All" : PHOTO_USAGE_META[key].label} (${counts[key]})`,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {contextHolder}
      <Upload.Dragger
        multiple
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        disabled={uploading}
      >
        <div style={{ padding: 12 }}>
          {uploading ? (
            <Spin />
          ) : (
            <ImageUp size={36} style={{ color: semantic.colorPrimary as string }} />
          )}
          <Typography.Title level={5} style={{ margin: "8px 0 4px" }}>
            {uploading ? "Importing…" : "Drop photos here or tap to import"}
          </Typography.Title>
          <Typography.Text type="secondary">
            Photos appear on the kiosk screen right away
          </Typography.Text>
        </div>
      </Upload.Dragger>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Upload
          multiple
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
          disabled={uploading}
        >
          <Button icon={<FolderUp size={16} />} disabled={uploading}>
            Choose from device
          </Button>
        </Upload>
        {liveCamera ? (
          <Button
            icon={<Camera size={16} />}
            disabled={uploading}
            onClick={() => setCameraOpen(true)}
          >
            Take photo
          </Button>
        ) : (
          // http บน IP ใน LAN เปิด getUserMedia ไม่ได้ — ให้มือถือใช้แอปกล้องของระบบแทน
          <Upload
            accept="image/*"
            capture="environment"
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            disabled={uploading}
          >
            <Button icon={<Camera size={16} />} disabled={uploading}>
              Take photo
            </Button>
          </Upload>
        )}
      </div>

      <Segmented
        options={filterOptions}
        value={filter}
        onChange={(value) => setFilter(value as TFilter)}
        style={{ alignSelf: "flex-start", maxWidth: "100%", overflowX: "auto" }}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin />
        </div>
      ) : visiblePhotos.length === 0 ? (
        <Empty description="No photos yet" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {visiblePhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              semantic={semantic}
              onOpenGeneration={setOpenedGeneration}
              onRemove={() => removePhoto(photo.id)}
            />
          ))}
        </div>
      )}

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => uploadFiles([file])}
      />

      <GenerationResultModal
        generation={openedGeneration}
        onClose={() => setOpenedGeneration(null)}
      />
    </div>
  );
}

interface PhotoCardProps {
  photo: IPhotoEventPhoto;
  semantic: Record<string, unknown>;
  onOpenGeneration: (generation: IPhotoEventGeneration) => void;
  onRemove: () => void;
}

function PhotoCard({ photo, semantic, onOpenGeneration, onRemove }: PhotoCardProps) {
  const usage = getPhotoUsage(photo);
  const running = photo.generations.find(
    (g) => g.status === "pending" || g.status === "processing",
  );
  const results = photo.generations.filter((g) => g.status === "success" && g.resultUrl);

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${semantic.colorBorder as string}`,
        background: semantic.colorBgContainer as string,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "3 / 4", background: "#0003" }}>
        {photo.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.imageName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <Tag
          color={PHOTO_USAGE_META[usage].color}
          style={{ position: "absolute", top: 8, left: 8, margin: 0 }}
        >
          {PHOTO_USAGE_META[usage].label}
          {usage === "generated" ? ` · ${results.length}` : ""}
        </Tag>
        <Popconfirm title="Remove this photo?" onConfirm={onRemove}>
          <Button
            size="small"
            danger
            icon={<Trash2 size={14} />}
            style={{ position: "absolute", top: 8, right: 8 }}
          />
        </Popconfirm>
        {running && (
          <Progress
            percent={running.progress ?? 0}
            size="small"
            showInfo={false}
            style={{ position: "absolute", bottom: 0, left: 8, right: 8, width: "auto" }}
          />
        )}
      </div>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
          {new Date(photo.createdAt).toLocaleTimeString()} · {photo.imageName}
        </Typography.Text>
        {results.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {results.map((generation) => (
              <Tooltip key={generation.id} title={generation.templateTitle}>
                <button
                  type="button"
                  onClick={() => onOpenGeneration(generation)}
                  style={{
                    width: 42,
                    aspectRatio: "3 / 4",
                    padding: 0,
                    border: `2px solid ${semantic.colorPrimary as string}`,
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generation.resultUrl ?? ""}
                    alt={generation.templateTitle ?? "result"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
