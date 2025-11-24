import React, { type FC, type ReactElement } from "react";
import { Button, Select, Space, Image, Popover } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { fallbackImage } from "@/app/utils/fallback";
import { Download, Share2 } from "lucide-react";

const { Option } = Select;

interface props {
  activities: any[];
}

const PromptActivity: FC<props> = ({ activities }): ReactElement => {
  return (
    <div className=" p-4 rounded-lg mb-4">
      <div className=" grid grid-cols-4 gap-4">
        {activities.map((image, imgIndex) => (
          <div
            key={imgIndex}
            className="relative group w-full h-[200px] text-center "
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300  h-[200px] ">
              <Image
                height={"100%"}
                fallback={fallbackImage}
                src={image.url}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                alt={`AI Generated Image ${imgIndex + 1}`}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Popover placement="topRight" content={image.prompt}>
                  <button className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer">
                    <Share2 className="w-4 h-4 text-gray-800" />
                  </button>
                </Popover>

                <button
                  className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer"
                  onClick={() => window.open(image, "_blank")}
                >
                  <Download className="w-4 h-4 text-gray-800" />
                </button>
              </div>

              {/* Image Number Badge */}
              {/* {message.images && message.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    {imgIndex + 1} / {message.images.length}
                  </div>
                )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptActivity;
