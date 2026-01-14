import React, { useEffect, useRef, useState, memo } from "react";
import ImagePlay from "@/public/images/1766053669808.jpg";
import { Download, X, Maximize2, Play, Loader2 } from "lucide-react";
import { LikeFilled, LikeOutlined } from "@ant-design/icons";
import { StaticImageData } from "next/image";

interface VideoItemProps {
  videoData: {
    id?: string;
    imageUrl: string;
    thumbnailUrl: string | StaticImageData;
    status?: boolean;
  };
  onDownloadVideo: (url: string) => void;
  onShareVideo: (taskId: string, status: boolean) => void;
  shareStatus: boolean;
}

const VideoItem = memo(
  ({
    videoData,
    onDownloadVideo,
    onShareVideo,
    shareStatus,
  }: VideoItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fullScreenVideoRef = useRef<HTMLVideoElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Lazy load video only when in viewport
    useEffect(() => {
      if (!containerRef.current) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !videoLoaded) {
              setVideoLoaded(true);
            }
          });
        },
        { threshold: 0.1, rootMargin: "50px" }
      );

      observerRef.current.observe(containerRef.current);

      return () => {
        observerRef.current?.disconnect();
      };
    }, [videoLoaded]);

    // Handle video playback
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !videoLoaded) return;

      const handleLoadedData = () => {
        setVideoLoading(false);
      };

      const handleWaiting = () => {
        setVideoLoading(true);
      };

      const handleCanPlay = () => {
        setVideoLoading(false);
      };

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);

      const playVideo = async () => {
        if (isHovered) {
          try {
            setVideoLoading(true);
            await video.play();
            setVideoLoading(false);
          } catch (err) {
            console.warn("Autoplay prevented:", err);
            setVideoLoading(false);
          }
        } else {
          video.pause();
          video.currentTime = 0;
          setVideoLoading(false);
        }
      };

      playVideo();

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("canplay", handleCanPlay);
      };
    }, [isHovered, videoLoaded]);

    const handleDownload = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDownloading(true);
      try {
        await onDownloadVideo(videoData.imageUrl);
      } finally {
        setIsDownloading(false);
      }
    };

    const handleFullScreen = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsFullScreen(true);
    };

    const handleCloseFullScreen = () => {
      setIsFullScreen(false);
      if (fullScreenVideoRef.current) {
        fullScreenVideoRef.current.pause();
      }
    };

    useEffect(() => {
      if (isFullScreen && fullScreenVideoRef.current) {
        fullScreenVideoRef.current.play();
      }
    }, [isFullScreen]);

    // Fallback thumbnail if none provided
    const thumbnailSrc = videoData.thumbnailUrl
      ? videoData.thumbnailUrl
      : ImagePlay;

    return (
      <>
        <div
          ref={containerRef}
          className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video cursor-pointer hover:border-purple-500/50 transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleFullScreen}
        >
          {/* Thumbnail - always visible until video plays */}
          <img
            src={
              typeof thumbnailSrc === "string" ? thumbnailSrc : thumbnailSrc.src
            }
            loading="lazy"
            alt="Video thumbnail"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered && videoLoaded && !videoLoading
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          {/* Play icon overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered && videoLoaded && !videoLoading
                ? "opacity-0"
                : "opacity-100"
            }`}
          >
            <div className="p-4 bg-black/50 rounded-full backdrop-blur-sm">
              <Play size={32} className="text-white fill-white" />
            </div>
          </div>

          {/* Video - lazy loaded */}
          {videoLoaded && (
            <video
              ref={videoRef}
              src={videoData.imageUrl}
              muted
              loop
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered && !videoLoading ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              className="p-2 bg-black/60 text-white rounded-md backdrop-blur-sm hover:bg-black/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleFullScreen(e);
              }}
              aria-label="Full screen"
            >
              <Maximize2 size={14} />
            </button>
            <button
              className="p-2 bg-black/60 text-white rounded-md backdrop-blur-sm hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(e);
              }}
              disabled={isDownloading}
              aria-label="Download video"
            >
              {isDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
            </button>
            {shareStatus && (
              <button
                className="p-2 bg-black/60 text-white rounded-md backdrop-blur-sm hover:bg-black/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoData.id) {
                    onShareVideo(videoData.id, videoData.status || false);
                  }
                }}
              >
                {videoData.status ? (
                  <LikeFilled className="text-yellow-500 opacity-100" />
                ) : (
                  <LikeOutlined />
                )}
              </button>
            )}
          </div>

          {/* Loading indicator when hovering and video is loading */}
          {isHovered && (videoLoading || !videoLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-white text-sm font-medium">
                  กำลังโหลดวิดีโอ...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Full Screen Modal */}
        {isFullScreen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleCloseFullScreen}
          >
            <button
              className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
              onClick={handleCloseFullScreen}
              aria-label="Close full screen"
            >
              <X size={24} />
            </button>
            <button
              className="absolute top-4 right-20 p-3 bg-white/10 text-white rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async (e) => {
                e.stopPropagation();
                setIsDownloading(true);
                try {
                  await onDownloadVideo(videoData.imageUrl);
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
              aria-label="Download video"
            >
              {isDownloading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Download size={24} />
              )}
            </button>

            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={fullScreenVideoRef}
                src={videoData.imageUrl}
                controls
                autoPlay
                loop
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo
    return (
      prevProps.videoData.imageUrl === nextProps.videoData.imageUrl &&
      prevProps.videoData.thumbnailUrl === nextProps.videoData.thumbnailUrl &&
      prevProps.videoData.status === nextProps.videoData.status
    );
  }
);

VideoItem.displayName = "VideoItem";

export default VideoItem;
