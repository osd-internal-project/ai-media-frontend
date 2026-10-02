"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Camera, FolderUp, ImageUp, RotateCw, Trash2, X } from "lucide-react";
import type {
  IPhotoEventGeneration,
  IPhotoEventPhoto,
} from "@/app/common/photo-event.type";
import PhotoEventService, {
  getPhotoEventErrorMessage,
} from "@/app/services/photo-event.service";
import { axiosCore } from "@/app/lib/axios/axios";
import GenerationResultModal from "./generation-result-modal";
import CameraCaptureModal, {
  canUseLiveCamera,
} from "@/app/components/photo-event/camera-capture-modal";
import { PHOTO_USAGE_META, TPhotoUsage, getPhotoUsage } from "./photo-status";

/** ต้องไม่เกิน PHOTO_EVENT_MAX_UPLOAD_FILES ของ backend */
const UPLOAD_BATCH_SIZE = 20;
/** ขนาดรวมต่อ request — ไฟล์ใหญ่หลายไฟล์รวมกันต้องไม่ชน proxy-body-size ของ ingress */
const UPLOAD_BATCH_BYTES = 80 * 1024 * 1024;
/** ต้องเท่ากับ PHOTO_EVENT_MAX_FILE_BYTES ของ backend */
const PHOTO_EVENT_MAX_FILE_BYTES = 50 * 1024 * 1024;

type TFilter = "all" | TPhotoUsage;

interface IPendingUpload {
  id: string;
  file: File;
  progress: number;
  error: string | null;
}

/** แบ่งไฟล์เป็นชุดไม่เกินทั้งจำนวนและขนาดรวมต่อ request */
const chunkFiles = (files: File[]): File[][] => {
  const batches: File[][] = [];
  let current: File[] = [];
  let currentBytes = 0;
  files.forEach((file) => {
    const full =
      current.length >= UPLOAD_BATCH_SIZE || currentBytes + file.size > UPLOAD_BATCH_BYTES;
    if (current.length > 0 && full) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(file);
    currentBytes += file.size;
  });
  if (current.length > 0) batches.push(current);
  return batches;
};

interface PhotosTabProps {
  projectId: string;
  userId: string;
  photos: IPhotoEventPhoto[];
  loading: boolean;
  semantic: Record<string, unknown>;
  onPhotosAdded: (photos: IPhotoEventPhoto[]) => void;
}

export default function PhotosTab({
  projectId,
  userId,
  photos,
  loading,
  semantic,
  onPhotosAdded,
}: PhotosTabProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const [pendingUploads, setPendingUploads] = useState<IPendingUpload[]>([]);
  // ส่งทีละ batch ต่อคิว — กดถ่าย/เลือกไฟล์ต่อได้ระหว่างที่ชุดก่อนยังส่งอยู่
  const uploadQueue = useRef<Promise<void>>(Promise.resolve());
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

  const patchPending = useCallback(
    (ids: string[], patch: Partial<IPendingUpload>) =>
      setPendingUploads((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, ...patch } : item)),
      ),
    [],
  );

  const sendBatch = useCallback(
    async (batch: IPendingUpload[]) => {
      const ids = batch.map((item) => item.id);
      patchPending(ids, { progress: 0, error: null });
      try {
        const created = await photoEventService.uploadPhotos(
          projectId,
          userId,
          batch.map((item) => item.file),
          (progress) => patchPending(ids, { progress }),
        );
        onPhotosAdded(created);
        setPendingUploads((prev) => prev.filter((item) => !ids.includes(item.id)));
      } catch (error) {
        patchPending(ids, { error: getPhotoEventErrorMessage(error) });
        messageApi.error(`Import failed: ${getPhotoEventErrorMessage(error)}`);
      }
    },
    [photoEventService, projectId, userId, onPhotosAdded, patchPending, messageApi],
  );

  const enqueue = useCallback(
    (batch: IPendingUpload[]) => {
      uploadQueue.current = uploadQueue.current.then(() => sendBatch(batch));
    },
    [sendBatch],
  );

  const uploadFiles = (files: File[]) => {
    const tooLarge = files.filter((file) => file.size > PHOTO_EVENT_MAX_FILE_BYTES);
    if (tooLarge.length > 0) {
      messageApi.error(
        `Over ${PHOTO_EVENT_MAX_FILE_BYTES / 1024 / 1024}MB, skipped: ${tooLarge
          .map((file) => file.name)
          .join(", ")}`,
      );
    }
    const accepted = files.filter((file) => file.size <= PHOTO_EVENT_MAX_FILE_BYTES);
    chunkFiles(accepted).forEach((batchFiles) => {
      const batch = batchFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        error: null,
      }));
      setPendingUploads((prev) => [...batch, ...prev]);
      enqueue(batch);
    });
  };

  const retryUpload = (item: IPendingUpload) => enqueue([item]);

  const dismissUpload = (id: string) =>
    setPendingUploads((prev) => prev.filter((item) => item.id !== id));

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

  const removePhoto = useCallback(
    async (photoId: string) => {
      try {
        await photoEventService.removePhoto(projectId, photoId, userId);
      } catch (error) {
        messageApi.error(getPhotoEventErrorMessage(error));
      }
    },
    [photoEventService, projectId, userId, messageApi],
  );

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
      >
        <div style={{ padding: 12 }}>
          <ImageUp size={36} style={{ color: semantic.colorPrimary as string }} />
          <Typography.Title level={5} style={{ margin: "8px 0 4px" }}>
            Drop photos here or tap to import
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
        >
          <Button icon={<FolderUp size={16} />}>
            Choose from device
          </Button>
        </Upload>
        {liveCamera ? (
          <Button
            icon={<Camera size={16} />}
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
          >
            <Button icon={<Camera size={16} />}>
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
      ) : visiblePhotos.length === 0 && pendingUploads.length === 0 ? (
        <Empty description="No photos yet" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {pendingUploads.map((item) => (
            <PendingCard
              key={item.id}
              item={item}
              semantic={semantic}
              onRetry={() => retryUpload(item)}
              onDismiss={() => dismissUpload(item.id)}
            />
          ))}
          {visiblePhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              semantic={semantic}
              onOpenGeneration={setOpenedGeneration}
              onRemove={removePhoto}
            />
          ))}
        </div>
      )}

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => uploadFiles([file])}
        continuous
      />

      <GenerationResultModal
        generation={openedGeneration}
        onClose={() => setOpenedGeneration(null)}
      />
    </div>
  );
}

interface PendingCardProps {
  item: IPendingUpload;
  semantic: Record<string, unknown>;
  onRetry: () => void;
  onDismiss: () => void;
}

function PendingCard({ item, semantic, onRetry, onDismiss }: PendingCardProps) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px dashed ${(item.error ? semantic.colorError : semantic.colorBorder) as string}`,
        background: semantic.colorBgContainer as string,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          aspectRatio: "3 / 4",
          background: "#0003",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 16,
        }}
      >
        {item.error ? (
          <>
            <Typography.Text type="danger" style={{ textAlign: "center", fontSize: 12 }}>
              {item.error}
            </Typography.Text>
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="small" icon={<RotateCw size={14} />} onClick={onRetry}>
                Retry
              </Button>
              <Button size="small" icon={<X size={14} />} onClick={onDismiss} />
            </div>
          </>
        ) : (
          <>
            <Spin />
            <Progress percent={item.progress} size="small" style={{ width: "100%" }} />
          </>
        )}
      </div>
      <div style={{ padding: 10 }}>
        <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
          {item.error ? "Failed" : "Uploading"} · {item.file.name}
        </Typography.Text>
      </div>
    </div>
  );
}

interface PhotoCardProps {
  photo: IPhotoEventPhoto;
  semantic: Record<string, unknown>;
  onOpenGeneration: (generation: IPhotoEventGeneration) => void;
  onRemove: (photoId: string) => void;
}

const PhotoCard = memo(function PhotoCard({
  photo,
  semantic,
  onOpenGeneration,
  onRemove,
}: PhotoCardProps) {
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
            src={photo.thumbUrl || photo.url}
            alt={photo.imageName}
            loading="lazy"
            onError={(event) => {
              // bucket ไม่เปิด image processing → กลับไปใช้รูปเต็ม
              if (photo.url && event.currentTarget.src !== photo.url) {
                event.currentTarget.src = photo.url;
              }
            }}
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
        <Popconfirm title="Remove this photo?" onConfirm={() => onRemove(photo.id)}>
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
});
