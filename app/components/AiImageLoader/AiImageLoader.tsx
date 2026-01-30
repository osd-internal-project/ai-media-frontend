import React from "react";
import "./AiImageLoader.css";

interface AiImageLoaderProps {
  size?: number; // scale เช่น 0.8, 1, 1.2
}

const AiImageLoader: React.FC<AiImageLoaderProps> = ({ size = 1 }) => {
  return (
    <div style={{ ["--size" as any]: size }} className=" p-4">
      <div className="loader-wrapper">
        <span className="loader-letter">G</span>
        <span className="loader-letter">e</span>
        <span className="loader-letter">n</span>
        <span className="loader-letter">e</span>
        <span className="loader-letter">r</span>
        <span className="loader-letter">a</span>
        <span className="loader-letter">t</span>
        <span className="loader-letter">i</span>
        <span className="loader-letter">n</span>
        <span className="loader-letter">g</span>
        <span className="loader-letter">.</span>
        <span className="loader-letter">.</span>
        <span className="loader-letter">.</span>
        <div className="loader"></div>
      </div>
    </div>
  );
};

export default AiImageLoader;
