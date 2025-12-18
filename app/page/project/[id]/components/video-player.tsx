import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface VideoPlayerProps {
    src: string;
    className?: string; // Allow passing className
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className }) => {
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
                threshold: 0.1, // Trigger when 10% of the video is visible
                rootMargin: '50px', // Start loading slightly before it comes into view
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

    return (
        <div ref={containerRef} className={`relative bg-black/20 ${className}`} style={{ minHeight: '200px' }}>
            {isVisible ? (
                <>
                    <video
                        ref={videoRef}
                        src={src}
                        controls
                        preload="metadata" // Only load metadata initially
                        className={`w-full h-auto object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        onLoadStart={handleLoadStart}
                        onCanPlay={handleCanPlay}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} />
                        </div>
                    )}
                </>
            ) : (
                // Placeholder or skeleton
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'gray' }} spin />} />
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
