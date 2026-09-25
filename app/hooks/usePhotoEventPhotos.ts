import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { axiosCore } from "@/app/lib/axios/axios";
import PhotoEventService from "@/app/services/photo-event.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import {
  PHOTO_EVENT_ROOM_TYPE,
  PHOTO_EVENT_SOCKET_EVENTS,
  type IPhotoEventGeneration,
  type IPhotoEventPhoto,
} from "@/app/common/photo-event.type";

/** presigned URL หมดอายุใน 30 นาที — จอที่เปิดค้างต้องโหลดใหม่ก่อนนั้น */
export const PHOTO_EVENT_PRESIGN_REFRESH_MS = 20 * 60 * 1000;

interface UsePhotoEventPhotosOptions {
  onGenerationUpdated?: (generation: IPhotoEventGeneration) => void;
}

const upsertGeneration = (
  photos: IPhotoEventPhoto[],
  generation: IPhotoEventGeneration,
): IPhotoEventPhoto[] =>
  photos.map((photo) => {
    if (photo.id !== generation.photoId) return photo;
    const exists = photo.generations.some((g) => g.id === generation.id);
    const generations = exists
      ? photo.generations.map((g) => (g.id === generation.id ? generation : g))
      : [generation, ...photo.generations];
    return { ...photo, generations };
  });

/** รายการรูปที่นำเข้าของ project พร้อมอัปเดต realtime ผ่าน room `${projectId}:photo-event` */
export const usePhotoEventPhotos = (
  projectId: string | undefined,
  options: UsePhotoEventPhotosOptions = {},
) => {
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const { socket, isConnected } = useWebSocket();
  const [photos, setPhotos] = useState<IPhotoEventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const onGenerationUpdatedRef = useRef(options.onGenerationUpdated);
  onGenerationUpdatedRef.current = options.onGenerationUpdated;

  const refresh = useCallback(async () => {
    if (!projectId) return;
    const result = await photoEventService.findPhotos(projectId);
    setPhotos(result);
    setLoading(false);
  }, [photoEventService, projectId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, PHOTO_EVENT_PRESIGN_REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!socket || !isConnected || !projectId) return;
    const room = { projectId, type: PHOTO_EVENT_ROOM_TYPE };
    socket.emit("join-room", room);
    // โหลดใหม่ทุกครั้งที่ต่อติด เพื่อเก็บ event ที่หลุดไประหว่างขาดการเชื่อมต่อ
    refresh();

    const handlePhotoCreated = (photo: IPhotoEventPhoto) =>
      setPhotos((prev) =>
        prev.some((p) => p.id === photo.id) ? prev : [photo, ...prev],
      );
    const handlePhotoDeleted = ({ photoId }: { photoId: string }) =>
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    const handleGenerationUpdated = (generation: IPhotoEventGeneration) => {
      setPhotos((prev) => upsertGeneration(prev, generation));
      onGenerationUpdatedRef.current?.(generation);
    };

    socket.on(PHOTO_EVENT_SOCKET_EVENTS.photoCreated, handlePhotoCreated);
    socket.on(PHOTO_EVENT_SOCKET_EVENTS.photoDeleted, handlePhotoDeleted);
    socket.on(PHOTO_EVENT_SOCKET_EVENTS.generationUpdated, handleGenerationUpdated);
    return () => {
      socket.off(PHOTO_EVENT_SOCKET_EVENTS.photoCreated, handlePhotoCreated);
      socket.off(PHOTO_EVENT_SOCKET_EVENTS.photoDeleted, handlePhotoDeleted);
      socket.off(PHOTO_EVENT_SOCKET_EVENTS.generationUpdated, handleGenerationUpdated);
      socket.emit("leave-room", room);
    };
  }, [socket, isConnected, projectId, refresh]);

  const applyGeneration = useCallback(
    (generation: IPhotoEventGeneration) =>
      setPhotos((prev) => upsertGeneration(prev, generation)),
    [],
  );

  return { photos, loading, refresh, applyGeneration, isConnected };
};
