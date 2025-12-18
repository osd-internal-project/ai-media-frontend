import React, { useEffect, useRef, useState, memo } from 'react';
import { Download } from 'lucide-react';

interface VideoItemProps {
    videoData: {
        imageUrl: string;
        thumbnailUrl: string;
    };
    onDownloadVideo: (url: string) => void;
}

const VideoItem = memo(({ videoData, onDownloadVideo }: VideoItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
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
            { threshold: 0.1, rootMargin: '50px' }
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

        const playVideo = async () => {
            if (isHovered) {
                try {
                    await video.play();
                } catch (err) {
                    console.warn('Autoplay prevented:', err);
                }
            } else {
                video.pause();
                video.currentTime = 0;
            }
        };

        playVideo();
    }, [isHovered, videoLoaded]);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDownloadVideo(videoData.imageUrl);
    };

    // Fallback thumbnail if none provided
    const thumbnailSrc = videoData.thumbnailUrl || videoData.imageUrl;

    return (
        <div
            ref={containerRef}
            className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail - always visible until video plays */}
            <img
                src={thumbnailSrc}
                loading="lazy"
                alt="Video thumbnail"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered && videoLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
            />

            {/* Video - lazy loaded */}
            {videoLoaded && (
                <video
                    ref={videoRef}
                    src={videoData.imageUrl}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}

            {/* Download button */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                    className="p-2 bg-black/60 text-white rounded-md backdrop-blur-sm hover:bg-black/80 transition-colors"
                    onClick={handleDownload}
                    aria-label="Download video"
                >
                    <Download size={14} />
                </button>
            </div>

            {/* Loading indicator (optional) */}
            {isHovered && !videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for memo
    return (
        prevProps.videoData.imageUrl === nextProps.videoData.imageUrl &&
        prevProps.videoData.thumbnailUrl === nextProps.videoData.thumbnailUrl
    );
});

VideoItem.displayName = 'VideoItem';

export default VideoItem;