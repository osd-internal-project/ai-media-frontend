"use client";

import React, { useRef, useState } from "react";
import { Popconfirm, Spin } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { BoardImage, BoardImageKind } from "./model";

/** how many style images a generation takes from the kit; mirrors MAX_KIT_REFS on the backend */
export const STYLE_IMAGES_SENT = 2;

type RowProps = {
  label: string;
  hint: string;
  addLabel: string;
  kind: BoardImageKind;
  images: BoardImage[];
  /** marks the images a generation will take */
  sentCount: number;
  onUpload: (file: File, kind: BoardImageKind) => Promise<boolean>;
  onDelete: (id: string) => void;
};

function ImageRow({
  label,
  hint,
  addLabel,
  kind,
  images,
  sentCount,
  onUpload,
  onDelete,
}: RowProps) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    await onUpload(file, kind);
    setUploading(false);
  };

  return (
    <div>
      <h3 className="bk-group-label">{label}</h3>
      <div className="bk-swatches">
        {images.map((image, index) => (
          <figure key={image.id} className="bk-thumb">
            {image.url ? (
              // a presigned storage URL: next/image cannot optimize it and would break when it expires
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt={image.name} loading="lazy" />
            ) : (
              <span className="bk-thumb-missing">File not found</span>
            )}
            {index < sentCount && (
              <figcaption className="bk-thumb-tag">Sent with images</figcaption>
            )}
            <span className="bk-swatch-actions">
              <Popconfirm
                title={`Delete ${image.name}?`}
                okText="Delete image"
                okButtonProps={{ danger: true }}
                cancelText="Keep image"
                onConfirm={() => onDelete(image.id)}
              >
                <button
                  type="button"
                  className="bk-icon-btn"
                  aria-label={`Delete ${image.name}`}
                >
                  <DeleteOutlined />
                </button>
              </Popconfirm>
            </span>
          </figure>
        ))}
        <button
          type="button"
          className="bk-thumb-add"
          disabled={uploading}
          aria-label={addLabel}
          onClick={() => input.current?.click()}
        >
          {uploading ? <Spin size="small" /> : <PlusOutlined />}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p className="bk-note" style={{ marginTop: 8 }}>
        {hint}
      </p>
    </div>
  );
}

type Props = {
  images: BoardImage[];
  onUpload: (file: File, kind: BoardImageKind) => Promise<boolean>;
  onDelete: (id: string) => void;
};

/** Pictures that show the brand: style images steer image generations, logos are kept to attach by hand. */
export default function ReferencesSection({ images, onUpload, onDelete }: Props) {
  return (
    <section aria-labelledby="bk-refs">
      <div className="bk-section-head">
        <h2 className="bk-h2" id="bk-refs">
          References
        </h2>
      </div>
      <div className="bk-groups">
        <ImageRow
          label="Style images"
          addLabel="Add a style image"
          hint={`The first ${STYLE_IMAGES_SENT} go with each image generation as style references, when the form has room. You can drop them per generation.`}
          kind="style_ref"
          images={images.filter((i) => i.kind === "style_ref")}
          sentCount={STYLE_IMAGES_SENT}
          onUpload={onUpload}
          onDelete={onDelete}
        />
        <ImageRow
          label="Logos"
          addLabel="Add a logo"
          hint="Kept with the kit. A logo is sent only when you add it in the generate form, because AI tends to redraw logos."
          kind="logo"
          images={images.filter((i) => i.kind === "logo")}
          sentCount={0}
          onUpload={onUpload}
          onDelete={onDelete}
        />
      </div>
    </section>
  );
}
