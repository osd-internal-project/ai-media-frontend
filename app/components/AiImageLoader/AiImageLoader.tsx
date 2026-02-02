import React from "react";
import "./AiImageLoader.css";

interface AiImageLoaderProps {
  size?: number; // scale เช่น 0.8, 1, 1.2
}

const AiImageLoader: React.FC<AiImageLoaderProps> = ({ size = 1 }) => {
  return (
    <div className="ai-robot-loader" style={{ ["--scale" as any]: size }}>
      <div className="robot-container">
        <div className="robot-head">
          <div className="robot-antenna">
            <div className="antenna-ball"></div>
          </div>
          <div className="robot-eyes">
            <span className="eye left"></span>
            <span className="eye right"></span>
          </div>
          <div className="robot-mouth"></div>
        </div>
        <div className="message-bubble">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
      {/* <div className="loading-text">Generating...</div> */}
    </div>
  );
};

export default AiImageLoader;
