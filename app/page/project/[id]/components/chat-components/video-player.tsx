import React, { useEffect, useRef, useState, memo } from "react";
import { Loader2, Play, X } from "lucide-react";
import VideoActionBar from "./action-bar";
interface VideoMessage {
  id?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status?: boolean;
  fileName?: string;
}

interface VideoItemProps {
  videoData: VideoMessage;

  onDownloadVideo: (fileName: string, id: string) => void;
  onShareVideo: (taskId: string, id: string, status: boolean) => void;

  taskId: string;
  messagePrompt?: string;
}

const VideoItem = memo(
  ({
    videoData,
    onDownloadVideo,
    onShareVideo,
    taskId,
    messagePrompt,
  }: VideoItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // lazy load
    useEffect(() => {
      if (!containerRef.current) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVideoLoaded(true);
            }
          });
        },
        { threshold: 0.1, rootMargin: "100px" },
      );

      observerRef.current.observe(containerRef.current);

      return () => observerRef.current?.disconnect();
    }, []);

    // hover autoplay
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !videoLoaded) return;

      if (isHovered) {
        setVideoLoading(true);
        video
          .play()
          .then(() => setVideoLoading(false))
          .catch(() => setVideoLoading(false));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }, [isHovered, videoLoaded]);

    const thumbnail = videoData.thumbnailUrl || videoData.imageUrl;
    const videoId = videoData.id || videoData.imageUrl;

    return (
      <>
        <div
          ref={containerRef}
          className="image-item relative group rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsFullScreen(true)}
        >
          {/* ✅ THUMBNAIL (always visible) */}
          <img
            src={thumbnail}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered && videoLoaded ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* VIDEO (overlay only on hover) */}
          {videoLoaded && (
            <video
              ref={videoRef}
              src={videoData.imageUrl}
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* PLAY ICON */}
          {!isHovered && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="p-4 bg-black/50 rounded-full">
                <Play size={32} className="text-white fill-white" />
              </div>
            </div>
          )}

          {/* LOADING */}
          {isHovered && videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <Loader2 className="animate-spin text-white" />
            </div>
          )}

          {/* ACTION BAR */}
          <div
            className="image-actions"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(6px)",
              transition: "all 0.2s ease",
              pointerEvents: isHovered ? "auto" : "none",
              zIndex: 30,
            }}
          >
            <VideoActionBar
              item={{
                id: videoId,
                status: videoData.status,
                fileName: videoData.fileName,
              }}
              message={{
                taskId,
                prompt: messagePrompt,
              }}
              onToggleFavorite={onShareVideo}
              onDownload={onDownloadVideo}
              onDelete={() => {}}
              messageApi={null}
            />
          </div>
        </div>

        {/* FULLSCREEN */}
        {isFullScreen && (
          <div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setIsFullScreen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setIsFullScreen(false)}
            >
              <X />
            </button>

            <video
              src={videoData.imageUrl}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          </div>
        )}
      </>
    );
  },
);

VideoItem.displayName = "VideoItem";

export default VideoItem;
