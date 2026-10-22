"use client";

import React from "react";
import {
  Button,
  ColorPicker,
  Input,
  InputNumber,
  Segmented,
  Select,
  Slider,
  Typography,
  Upload,
} from "antd";
import { ImagePlus, Trash2 } from "lucide-react";
import type {
  IPrintBox,
  IPrintLayout,
  TPrintElement,
  TPrintFit,
} from "@/app/common/photo-event.type";
import {
  PAPER_PRESETS,
  PRINT_MIN_ELEMENT_MM,
  PRINT_PAPER_LIMIT_MM,
  findPaperPresetKey,
} from "@/app/utils/photo-event-print";

type TElementPatch = Partial<Omit<Extract<TPrintElement, { type: "text" }>, "type" | "id">> &
  Partial<Omit<Extract<TPrintElement, { type: "photo" }>, "type" | "id">> &
  Partial<Omit<Extract<TPrintElement, { type: "qr" }>, "type" | "id">>;

interface PrintInspectorProps {
  layout: IPrintLayout;
  selected: TPrintElement | null;
  uploading: boolean;
  onChangeLayout: (update: (layout: IPrintLayout) => IPrintLayout) => void;
  onChangeElement: (id: string, patch: TElementPatch) => void;
  onUploadBackground: (file: File) => void;
  semantic: Record<string, unknown>;
}

const ACCEPT_IMAGES = "image/png,image/jpeg,image/webp";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {label}
    </Typography.Text>
    {children}
  </label>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
    <Typography.Text strong>{title}</Typography.Text>
    {children}
  </section>
);

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{children}</div>
);

const MmInput = ({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <InputNumber
    value={value}
    min={min}
    max={max}
    step={1}
    suffix="mm"
    style={{ width: "100%" }}
    onChange={(next) => {
      if (typeof next === "number") onChange(next);
    }}
  />
);

const ELEMENT_TITLES: Record<TPrintElement["type"], string> = {
  photo: "Photo",
  qr: "QR code",
  icon: "Icon",
  text: "Text",
  overlay: "Frame",
};

/** แผงขวา: ตั้งค่ากระดาษ/พื้นหลัง และค่าละเอียดของ element ที่เลือก */
export default function PrintInspector({
  layout,
  selected,
  uploading,
  onChangeLayout,
  onChangeElement,
  onUploadBackground,
  semantic,
}: PrintInspectorProps) {
  const { paper, background } = layout;
  const presetKey = findPaperPresetKey(paper.widthMm, paper.heightMm);
  const landscape = paper.widthMm > paper.heightMm;

  const setPaper = (patch: Partial<IPrintLayout["paper"]>) =>
    onChangeLayout((prev) => ({ ...prev, paper: { ...prev.paper, ...patch } }));
  const setBackground = (patch: Partial<IPrintLayout["background"]>) =>
    onChangeLayout((prev) => ({ ...prev, background: { ...prev.background, ...patch } }));

  const choosePreset = (key: string) => {
    const preset = PAPER_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setPaper(
      landscape
        ? { widthMm: preset.heightMm, heightMm: preset.widthMm }
        : { widthMm: preset.widthMm, heightMm: preset.heightMm },
    );
  };

  const setOrientation = (next: "portrait" | "landscape") => {
    if ((next === "landscape") !== landscape) {
      setPaper({ widthMm: paper.heightMm, heightMm: paper.widthMm });
    }
  };

  const colorField = (label: string, value: string, onChange: (hex: string) => void) => (
    <Field label={label}>
      <ColorPicker
        value={value}
        disabledAlpha
        showText
        onChangeComplete={(color) => onChange(color.toHexString())}
      />
    </Field>
  );

  const renderSelected = (el: TPrintElement) => {
    if (el.type === "overlay") {
      return (
        <Typography.Text type="secondary">
          The frame covers the whole card and sits on top of everything else. Remove it from the
          layers list.
        </Typography.Text>
      );
    }
    const setBox = (patch: Partial<IPrintBox>) => onChangeElement(el.id, patch);
    return (
      <>
        <Pair>
          <Field label="X">
            <MmInput value={el.xMm} min={-paper.widthMm} max={paper.widthMm * 2} onChange={(xMm) => setBox({ xMm })} />
          </Field>
          <Field label="Y">
            <MmInput value={el.yMm} min={-paper.heightMm} max={paper.heightMm * 2} onChange={(yMm) => setBox({ yMm })} />
          </Field>
          <Field label="Width">
            <MmInput value={el.wMm} min={PRINT_MIN_ELEMENT_MM} max={paper.widthMm * 2} onChange={(wMm) => setBox({ wMm })} />
          </Field>
          <Field label="Height">
            <MmInput value={el.hMm} min={PRINT_MIN_ELEMENT_MM} max={paper.heightMm * 2} onChange={(hMm) => setBox({ hMm })} />
          </Field>
        </Pair>

        {el.type === "photo" && (
          <>
            <Field label="Fit">
              <Segmented<TPrintFit>
                block
                value={el.fit}
                options={[
                  { label: "Fill frame", value: "cover" },
                  { label: "Whole photo", value: "contain" },
                ]}
                onChange={(fit) => onChangeElement(el.id, { fit })}
              />
            </Field>
            {el.fit === "cover" && (
              <>
                <Field label="Crop left ↔ right">
                  <Slider min={0} max={100} value={el.focusX} onChange={(focusX) => onChangeElement(el.id, { focusX })} />
                </Field>
                <Field label="Crop top ↕ bottom">
                  <Slider min={0} max={100} value={el.focusY} onChange={(focusY) => onChangeElement(el.id, { focusY })} />
                </Field>
              </>
            )}
          </>
        )}

        {el.type === "qr" && (
          <Pair>
            {colorField("Code color", el.color, (color) => onChangeElement(el.id, { color }))}
            {colorField("Code background", el.bgColor, (bgColor) => onChangeElement(el.id, { bgColor }))}
          </Pair>
        )}

        {el.type === "text" && (
          <>
            <Field label="Text">
              <Input.TextArea
                value={el.content}
                maxLength={500}
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(event) => onChangeElement(el.id, { content: event.target.value })}
              />
            </Field>
            <Pair>
              <Field label="Size">
                <InputNumber
                  value={el.fontSizePt}
                  min={4}
                  max={200}
                  suffix="pt"
                  style={{ width: "100%" }}
                  onChange={(next) => {
                    if (typeof next === "number") onChangeElement(el.id, { fontSizePt: next });
                  }}
                />
              </Field>
              <Field label="Weight">
                <Select
                  value={el.weight}
                  options={[
                    { label: "Regular", value: 400 },
                    { label: "Medium", value: 500 },
                    { label: "Bold", value: 700 },
                  ]}
                  onChange={(weight) => onChangeElement(el.id, { weight })}
                />
              </Field>
            </Pair>
            <Field label="Align">
              <Segmented
                block
                value={el.align}
                options={[
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" },
                ]}
                onChange={(align) => onChangeElement(el.id, { align: align as "left" | "center" | "right" })}
              />
            </Field>
            {colorField("Color", el.color, (color) => onChangeElement(el.id, { color }))}
          </>
        )}
      </>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {selected && (
        <div style={{ borderBottom: `1px solid ${semantic.colorBorderSecondary as string}` }}>
          <Section title={ELEMENT_TITLES[selected.type]}>{renderSelected(selected)}</Section>
        </div>
      )}

      <Section title="Paper">
        <Field label="Size">
          <Select
            value={presetKey}
            options={[
              ...PAPER_PRESETS.map((p) => ({ label: p.label, value: p.key })),
              { label: "Custom", value: "custom", disabled: true },
            ]}
            onChange={choosePreset}
          />
        </Field>
        <Segmented
          block
          value={landscape ? "landscape" : "portrait"}
          options={[
            { label: "Portrait", value: "portrait" },
            { label: "Landscape", value: "landscape" },
          ]}
          onChange={(value) => setOrientation(value as "portrait" | "landscape")}
        />
        <Pair>
          <Field label="Width">
            <MmInput
              value={paper.widthMm}
              min={PRINT_PAPER_LIMIT_MM.min}
              max={PRINT_PAPER_LIMIT_MM.max}
              onChange={(widthMm) => setPaper({ widthMm })}
            />
          </Field>
          <Field label="Height">
            <MmInput
              value={paper.heightMm}
              min={PRINT_PAPER_LIMIT_MM.min}
              max={PRINT_PAPER_LIMIT_MM.max}
              onChange={(heightMm) => setPaper({ heightMm })}
            />
          </Field>
          <Field label="Safe margin">
            <MmInput value={paper.marginMm} min={0} max={50} onChange={(marginMm) => setPaper({ marginMm })} />
          </Field>
          <Field label="Bleed">
            <MmInput value={paper.bleedMm} min={0} max={10} onChange={(bleedMm) => setPaper({ bleedMm })} />
          </Field>
        </Pair>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Set the same paper size in the printer settings. For borderless cards, add 2–3 mm bleed
          and turn on borderless printing in the printer driver.
        </Typography.Text>
      </Section>

      <Section title="Background">
        {colorField("Color", background.color, (color) => setBackground({ color }))}
        <Field label="Image">
          <div style={{ display: "flex", gap: 8 }}>
            <Upload
              accept={ACCEPT_IMAGES}
              showUploadList={false}
              beforeUpload={(file) => {
                onUploadBackground(file);
                return false;
              }}
            >
              <Button icon={<ImagePlus size={14} />} loading={uploading}>
                {background.imageKey ? "Replace image" : "Upload image"}
              </Button>
            </Upload>
            {background.imageKey && (
              <Button
                icon={<Trash2 size={14} />}
                aria-label="Remove background image"
                onClick={() => setBackground({ imageKey: undefined })}
              />
            )}
          </div>
        </Field>
        {background.imageKey && (
          <Field label="Image fit">
            <Segmented<TPrintFit>
              block
              value={background.fit}
              options={[
                { label: "Fill card", value: "cover" },
                { label: "Whole image", value: "contain" },
              ]}
              onChange={(fit) => setBackground({ fit })}
            />
          </Field>
        )}
      </Section>
    </div>
  );
}
