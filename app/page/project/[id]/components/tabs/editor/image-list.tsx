import React from "react";
import { Button } from "antd";
import { X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

export interface ImportedImage {
  id: string;
  name: string;
  url: string;
}

interface ImageListProps {
  images: ImportedImage[];
  showImageList: boolean;
  setShowImageList: (show: boolean) => void;
  deleteImageFromList: (id: string) => void;
}

const ImageList: React.FC<ImageListProps> = ({
  images,
  showImageList,
  setShowImageList,
  deleteImageFromList,
}) =>
{
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  return (
  <div
  className="px-4 py-2 transition-all"
  style={{
    backgroundColor: semantic.colorBgContainer,
    borderTop: `1px solid ${semantic.colorBorder}`,
  }}
>
         <div className="flex justify-between items-center mb-2">
           <span className="text-sm text-slate-300 font-semibold flex items-center gap-2">
             <ImageIcon size={16} /> Imported Images
           </span>
           <Button
             size="small"
             type="text"
             icon={showImageList ? <EyeOff size={14} /> : <Eye size={14} />}
             onClick={() => setShowImageList(!showImageList)}
             className="text-slate-400 hover:text-white"
           >
             {showImageList ? "Hide" : "Show"}
           </Button>
         </div>
         {showImageList && (
        <div
      className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
      style={{
        scrollbarColor: `${semantic.colorBorder} transparent`,
      }}
    >
             {images.map((img) => (
              <div
          key={img.id}
          className="relative group w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
          style={{
            backgroundColor: semantic.colorBgElevated,
            border: `1px solid ${semantic.colorBorder}`,
          }}
        >
                 <img
                   src={img.url}
                   alt={img.name}
                   className="max-w-full max-h-full object-contain"
                 />
                 <button
                   onClick={() => deleteImageFromList(img.id)}
                   className="absolute top-1 right-1 bg-red-500/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                   title="Remove image"
                 >
                   <X size={12} />
                 </button>
               </div>
             ))}
             {images.length === 0 && (
               <div className="text-slate-500 text-xs py-4 flex items-center justify-center w-full bg-white/5 rounded border border-dashed border-[#3c444d]">
                 No images imported yet. Click the &quot;Import&quot; button above to add images.
               </div>
             )}
           </div>
         )}
       </div>
);}
export default ImageList;