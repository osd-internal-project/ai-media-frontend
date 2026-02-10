import React from "react";
import Image from "next/image";
import { CloseOutlined } from "@ant-design/icons";

type Props = {
    closePreview: () => void
    previewImage: string
}

export default function PreviewImage({
    closePreview,
    previewImage
}: Props) {

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closePreview}
        >
            <button
                className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                onClick={closePreview}
            >
                <CloseOutlined style={{ fontSize: "24px" }} />
            </button>
            <Image
                src={previewImage}
                alt="Preview"
                width={1200}
                height={800}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-50 duration-300"
                onClick={(e) => e.stopPropagation()}
                unoptimized
            />
        </div>
    );
};