import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface VideoPlayerProps {
    src: string;
    poster?: string; // Add poster prop
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, className }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.warn("Hover autoplay blocked:", error);
            });
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset to start
        }
    };

    return (
        <div ref={containerRef} className={`relative bg-black/20 rounded-xl overflow-hidden ${className}`} style={{ minHeight: '200px' }}>
            {isVisible ? (
                <>
                    <video
                        ref={videoRef}
                        src={src}
                        poster={poster} // Use poster prop
                        controls
                        preload="metadata"
                        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        onLoadStart={handleLoadStart}
                        onCanPlay={handleCanPlay}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {poster && (
                                <img
                                    src={poster}
                                    alt="Video Thumbnail"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    {poster && (
                        <img
                            src={poster}
                            alt="Video Thumbnail"
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'gray' }} spin />} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
