import React, { createContext, useContext, useState, type CSSProperties, type FC } from "react";
import { Card, Select, Tooltip, Typography } from "antd";
import { AudioLines, Drama, Image as ImageIcon, Sparkles, UserRound, Video, type LucideIcon } from "lucide-react";
import type { TMasterModelType } from "@/app/common/master-model-type.type";

type ModelSelectContextValue = {
  selectedAIModel?: TMasterModelType | null;
  filteredAIModels: TMasterModelType[];
  onAIModelChange: (value: string) => void;
};

export const ModelSelectContext = createContext<ModelSelectContextValue | null>(null);

const fallbackIconByType: Record<string, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  omnihumen: UserRound,
  dreamactor: Drama,
  audio: AudioLines,
};

const ModelIcon: FC<{ model: TMasterModelType; size?: number; color?: string }> = ({ model, size = 16, color }) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (model.iconUrl && failedUrl !== model.iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-entered URL from any host; next/image would need remotePatterns
      <img
        src={model.iconUrl}
        alt={model.provider || model.name}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, borderRadius: 4 }}
        onError={() => setFailedUrl(model.iconUrl ?? null)}
      />
    );
  }
  const Icon = fallbackIconByType[model.type ?? ""] ?? Sparkles;
  return <Icon size={size} color={color} style={{ flexShrink: 0 }} aria-hidden />;
};

const LIMITATION_FIELDS = [
  ["resolution", "Resolution"],
  ["duration", "Duration"],
  ["frameRate", "Frame rate"],
  ["concurrentTasks", "Concurrent tasks"],
  ["rpm", "RPM"],
] as const;

const ModelDetailTooltip: FC<{ model: TMasterModelType; selected: boolean }> = ({ model, selected }) => (
  <div className="p-4 max-w-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="font-medium text-white">{model.name}</div>
      {selected && <div className="text-blue-400 text-xs">✓ Selected</div>}
    </div>

    {model.provider && <div className="text-gray-400 text-xs mb-2">by {model.provider}</div>}

    {model.modelDetails?.description && (
      <div className="text-gray-300 text-sm leading-relaxed mb-3">{model.modelDetails.description}</div>
    )}

    {model.modelDetails?.modelId && (
      <div className="mb-3">
        <div className="text-gray-400 text-xs mb-1">Model ID</div>
        <div className="text-gray-200 text-sm font-mono">{model.modelDetails.modelId}</div>
      </div>
    )}

    {model.modelDetails?.pricing && (
      <div className="mb-3">
        <div className="text-gray-400 text-xs mb-1">Pricing</div>
        <div className="flex gap-4">
          {(
            [
              ["imageToVideo", "Image-to-video", "USD/M tokens"],
              ["textToVideo", "Text-to-video", "USD/M tokens"],
              ["imageToImage", "Image-to-image", "USD/Piece"],
              ["textToImage", "Text-to-image", "USD/Piece"],
            ] as const
          ).map(([key, label, defaultUnit]) =>
            model.modelDetails.pricing[key] ? (
              <div key={key}>
                <div className="text-gray-300 text-xs">{label}</div>
                <div className="text-white font-medium">
                  {model.modelDetails.pricing[key]} {model.modelDetails.pricing.unit || defaultUnit}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>
    )}

    {model.modelDetails?.limitations &&
      LIMITATION_FIELDS.some(([key]) => model.modelDetails.limitations[key]) && (
        <div className="mb-3">
          <div className="text-gray-400 text-xs mb-1">Limitations</div>
          <div className="space-y-1">
            {LIMITATION_FIELDS.map(([key, label]) => {
              const value = model.modelDetails.limitations[key];
              if (!value) return null;
              return (
                <div key={key} className="text-gray-300 text-sm">
                  <span className="text-gray-400">{label}:</span> {Array.isArray(value) ? value.join(", ") : value}
                </div>
              );
            })}
          </div>
        </div>
      )}

    {model.modelDetails?.status && (
      <div className="mb-3">
        <div className="text-gray-400 text-xs mb-1">Status</div>
        <div
          className={`inline-block px-2 py-1 text-xs rounded ${
            model.modelDetails.status === "Activated" ? "bg-green-600 text-white" : "bg-gray-600 text-gray-200"
          }`}
        >
          {model.modelDetails.status}
        </div>
      </div>
    )}
  </div>
);

type Props = {
  semantic: Record<string, any>;
  isMobile: boolean;
};

/** AI model picker shown as its own card above the option panel; reads models from ModelSelectContext. */
export default function ModelSelectCard({ semantic, isMobile }: Props) {
  const ctx = useContext(ModelSelectContext);
  if (!ctx || ctx.filteredAIModels.length === 0) return null;
  const { selectedAIModel, filteredAIModels, onAIModelChange } = ctx;
  const description: string | undefined = selectedAIModel?.modelDetails?.description;

  return (
    <Card
      size="small"
      style={{ background: semantic.colorBgContainer, borderColor: semantic.colorBorder, flexShrink: 0 }}
      styles={{ body: { padding: 12 } }}
    >
      <Typography.Text style={{ display: "block", fontSize: 12, fontWeight: 500, color: semantic.colorTextSecondary, marginBottom: 6 }}>
        AI Model
      </Typography.Text>
      <Select
        style={
          {
            width: "100%",
            fontSize: 13,
            ["--model-select-bg" as string]: semantic.colorBgContainer,
            ["--model-select-border" as string]: semantic.colorBorder,
            ["--model-select-text" as string]: semantic.colorTextBase,
            ["--model-select-placeholder" as string]: semantic.colorTextSecondary,
            ["--model-select-hover" as string]: semantic.colorBorderSecondary,
            ["--model-select-focus" as string]: semantic.colorPrimary,
            ["--model-select-arrow" as string]: semantic.colorTextSecondary,
          } as CSSProperties
        }
        className="dark-select"
        placeholder="Choose an AI model"
        value={selectedAIModel?.id?.toString()}
        onChange={onAIModelChange}
        labelRender={({ value }) => {
          const model = filteredAIModels.find((m) => m.id.toString() === value);
          if (!model) return null;
          return (
            <span className="flex items-center gap-2 min-w-0">
              <ModelIcon model={model} color={semantic.colorPrimary} />
              <span className="truncate">{model.name}</span>
            </span>
          );
        }}
        options={filteredAIModels.map((model) => {
          const row = (
            <div className="flex items-center gap-2 min-w-0">
              <ModelIcon model={model} color={semantic.colorTextSecondary} />
              <span className="text-xs truncate flex-1">{model.name}</span>
              {selectedAIModel?.id === model.id && <span className="text-blue-400 ml-2">✓</span>}
            </div>
          );
          return {
            value: model.id.toString(),
            // Hover-only details overflow small screens, so mobile shows the description line instead.
            label: isMobile ? (
              row
            ) : (
              <Tooltip
                title={<ModelDetailTooltip model={model} selected={selectedAIModel?.id === model.id} />}
                placement="right"
                overlayStyle={{ maxWidth: "none" }}
              >
                {row}
              </Tooltip>
            ),
          };
        })}
      />
      {description && (
        <Typography.Paragraph
          ellipsis={{ rows: 2, tooltip: description }}
          style={{ margin: "6px 0 0", fontSize: 12, color: semantic.colorTextSecondary }}
        >
          {description}
        </Typography.Paragraph>
      )}
    </Card>
  );
}
