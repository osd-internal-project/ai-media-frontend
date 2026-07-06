"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Form,
  InputNumber,
  Popover,
  Segmented,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  type UploadFile,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { Image as ImageIcon, SlidersHorizontal, Video } from "lucide-react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import UploadsServices from "@/app/services/uploads.service";
import GenerateServices from "@/app/services/generate.service";
import type { TMasterModelType } from "@/app/common/master-model-type.type";
import type {
  CreateBlockPayload,
  WorkflowBlockType,
} from "@/app/services/workflow.service";
import type {
  ImageFormState,
  RefImage,
  VideoFormState,
} from "../../tab-layout/types/generator-config.type";
import {
  getImageModelConfig,
  getVideoModelConfig,
} from "../../tab-layout/model-registry";
import { getTypeFile } from "../../tab-layout/utils/file-type.util";
import { fileToDataUrl } from "../../tab-layout/utils/file-preview.util";
import SettingSection from "../../tab-layout/generate-section/setting-section";
import DrawToImage from "../image-gen/shared/draw-to-image";
import WorkflowUpload from "./workflow-upload";
import WorkflowPrompt from "./workflow-prompt";

/** Image ratio → base size (2k); 4k applies a 1.414x scale. Matches Gen Image. */
const IMAGE_RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
  "1:1": { width: 2048, height: 2048 },
  "4:3": { width: 2304, height: 1728 },
  "3:4": { width: 1728, height: 2304 },
  "16:9": { width: 2560, height: 1440 },
  "9:16": { width: 1440, height: 2560 },
  "3:2": { width: 2496, height: 1664 },
  "2:3": { width: 1664, height: 2496 },
  "21:9": { width: 3024, height: 1296 },
};
const IMAGE_RESOLUTION_OPTIONS = ["2k", "4k"];

/** Video resolution → ratio → exact size. Matches Gen Video (seedance). */
const VIDEO_RATIO_SIZE_MAP: Record<
  string,
  Record<string, { width: number; height: number }>
> = {
  "480p": {
    "1:1": { width: 640, height: 640 },
    "4:3": { width: 752, height: 564 },
    "3:4": { width: 564, height: 752 },
    "16:9": { width: 864, height: 496 },
    "9:16": { width: 496, height: 864 },
    "21:9": { width: 992, height: 432 },
    "9:21": { width: 432, height: 992 },
  },
  "720p": {
    "1:1": { width: 960, height: 960 },
    "4:3": { width: 1112, height: 834 },
    "3:4": { width: 834, height: 1112 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "21:9": { width: 1470, height: 630 },
    "9:21": { width: 630, height: 1470 },
  },
  "1080p": {
    "1:1": { width: 1440, height: 1440 },
    "4:3": { width: 1664, height: 1248 },
    "3:4": { width: 1248, height: 1664 },
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "21:9": { width: 2205, height: 945 },
    "9:21": { width: 945, height: 2205 },
  },
};
const VIDEO_RESOLUTION_OPTIONS = ["480p", "720p", "1080p"];

/** Minimum side length (px) enforced for uploaded reference images. */
const MIN_IMAGE_SIDE = 300;

interface WorkflowEditFormProps {
  type: WorkflowBlockType;
  /** Whether the block may switch its generate type (image⇄video) before generating. */
  canSwitchType?: boolean;
  /** Switch the block's generate type. When omitted, the switch is hidden. */
  onChangeType?: (type: WorkflowBlockType) => void;
  projectId: string;
  userId: string;
  organizationId?: string;
  /** Models pre-filtered by type */
  models: TMasterModelType[];
  submitting?: boolean;
  onSubmit: (
    payload: Pick<
      CreateBlockPayload,
      "prompt" | "model" | "resolution" | "generateConfig"
    > & { estimatedCredit?: number },
  ) => void;
  onCancel: () => void;
  /** Reports the live per-block credit estimate so the canvas can total it. */
  onEstimate?: (credit: number) => void;
}

/**
 * Inline generate-config form for a workflow block, at feature parity with the
 * Gen Image / Gen Video tabs: real reference upload + draw, model-registry
 * payload building, and a live credit estimate.
 */
const WorkflowEditForm: React.FC<WorkflowEditFormProps> = ({
  type,
  canSwitchType = false,
  onChangeType,
  projectId,
  userId,
  organizationId,
  models,
  submitting,
  onSubmit,
  onCancel,
  onEstimate,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const [form] = Form.useForm<{ prompt: string }>();

  const uploadsServices = useMemo(() => UploadsServices(axiosWorker), []);
  const generateServices = useMemo(() => GenerateServices(axiosCore), []);

  const [modelId, setModelId] = useState<number | undefined>(
    models.find((m) => m.isDefault)?.id ?? models[0]?.id,
  );
  const model = useMemo(
    () => models.find((m) => m.id === modelId),
    [models, modelId],
  );

  const videoConfig = useMemo(
    () => (type === "video" ? getVideoModelConfig(model) : undefined),
    [type, model],
  );
  const imageConfig = useMemo(
    () => (type === "image" ? getImageModelConfig(model) : undefined),
    [type, model],
  );
  /** Video upload mode from the model config; "multi-file" by default. */
  const uploadMode = videoConfig?.features?.uploadMode ?? "multi-file";
  const isFirstLast = type === "video" && uploadMode === "first-last";
  const maxDuration = videoConfig?.features?.maxDuration ?? 12;
  const supportAudio = videoConfig?.features?.supportAudio ?? true;
  const showDraftMode = videoConfig?.features?.showDraftMode ?? false;
  const showDraw = !isFirstLast; // image + multi-file video

  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [selectedResolution, setSelectedResolution] = useState(
    type === "image" ? "2k" : "720p",
  );
  const [selectedMaximumImage, setSelectedMaximumImage] = useState(1);
  const [duration, setDuration] = useState(6);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [draftMode, setDraftMode] = useState(false);

  // Reference uploads — multi (image / seedance2) and first/last (seedance1)
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [refImages, setRefImages] = useState<RefImage[]>([]);
  const [filesFirst, setFilesFirst] = useState<UploadFile[]>([]);
  const [refImageFirst, setRefImageFirst] = useState<RefImage[]>([]);
  const [filesLast, setFilesLast] = useState<UploadFile[]>([]);
  const [refImageLast, setRefImageLast] = useState<RefImage[]>([]);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);

  const [estimate, setEstimate] = useState(0);

  // ── size derivation ─────────────────────────────────────────────────────────

  /** Compute output width/height from the current ratio + resolution. */
  const computeSize = useCallback((): { width: number; height: number } => {
    if (type === "image") {
      const base = IMAGE_RATIO_SIZE_MAP[selectedRatio] ?? IMAGE_RATIO_SIZE_MAP["1:1"];
      const scale = selectedResolution === "4k" ? 1.414 : 1;
      return {
        width: Math.round(base.width * scale),
        height: Math.round(base.height * scale),
      };
    }
    const byRatio = VIDEO_RATIO_SIZE_MAP[selectedResolution] ?? VIDEO_RATIO_SIZE_MAP["720p"];
    const base = byRatio[selectedRatio] ?? byRatio["1:1"];
    return { width: base.width, height: base.height };
  }, [type, selectedRatio, selectedResolution]);

  const ratioOptions = useMemo(() => {
    const keys =
      type === "image"
        ? Object.keys(IMAGE_RATIO_SIZE_MAP)
        : Object.keys(
            VIDEO_RATIO_SIZE_MAP[selectedResolution] ?? VIDEO_RATIO_SIZE_MAP["720p"],
          );
    return keys.map((ratio) => ({
      label: ratio,
      key: ratio,
      icon: null as React.ReactNode,
      onClick: () => setSelectedRatio(ratio),
    }));
  }, [type, selectedResolution]);

  /** Keep the selected ratio valid when the video resolution map changes. */
  const handleResolutionChange = useCallback(
    (resolution: string) => {
      setSelectedResolution(resolution);
      if (type === "video") {
        const byRatio = VIDEO_RATIO_SIZE_MAP[resolution];
        if (byRatio && !byRatio[selectedRatio]) setSelectedRatio("1:1");
      }
    },
    [type, selectedRatio],
  );

  // ── uploads ──────────────────────────────────────────────────────────────────

  /**
   * Validate (image min side) then upload one file to the server.
   * @returns The stored RefImage, or null on validation/upload failure.
   */
  const uploadOne = useCallback(
    async (file: UploadFile, index: number): Promise<RefImage | null> => {
      const blob = (file.originFileObj as Blob) ?? null;
      if (!blob) return null;

      // Image min-size validation (non-images load-error → allowed through).
      // Probe via a `data:` URL (not `blob:`) so the image isn't CSP-blocked,
      // which would otherwise force `onerror` and silently skip the check.
      const probeSrc = await fileToDataUrl(blob);
      const valid = await new Promise<boolean>((resolve) => {
        const img = new window.Image();
        img.src = probeSrc;
        img.onload = () => {
          const minSide = Math.min(img.width, img.height);
          resolve(minSide >= MIN_IMAGE_SIDE);
        };
        img.onerror = () => {
          resolve(true);
        };
      });
      if (!valid) return null;

      const formData = new FormData();
      formData.append("userId", userId ?? "");
      formData.append("index", index.toString());
      formData.append("projectId", projectId);
      formData.append("generateType", type);
      formData.append("uid", file.uid);
      formData.append("file", blob);
      formData.append("organizationId", organizationId ?? "");

      const result = (await uploadsServices.upload(formData)) as RefImage | undefined;
      return result?.imagePath ? result : null;
    },
    [organizationId, projectId, type, uploadsServices, userId],
  );

  /** Build an onChange handler for a single upload target (multi or a slot). */
  const makeUploadHandler = useCallback(
    (
      setLocalFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>,
      setLocalRefs: React.Dispatch<React.SetStateAction<RefImage[]>>,
      single: boolean,
    ) =>
      async (info: UploadChangeParam) => {
        const { file, fileList } = info;
        if (file.status === "removed") return;

        const nextList = single ? [file] : fileList;
        setLocalFiles(nextList);

        // Show an instant, CSP-safe local preview: encode image files as a `data:`
        // URL and store it as `thumbUrl` (the tile prefers `thumbUrl`), avoiding the
        // blocked `blob:` object URL. Skip non-images — a video/audio `data:` URL is
        // huge and can't render as an image, so those keep the placeholder icon.
        const previewBlob = file.originFileObj as Blob | undefined;
        if (previewBlob && previewBlob.type.startsWith("image/")) {
          const thumbUrl = await fileToDataUrl(previewBlob);
          setLocalFiles((prev) =>
            prev.map((f) => (f.uid === file.uid ? { ...f, thumbUrl } : f)),
          );
        }

        setIsLoadingUpload(true);
        try {
          const result = await uploadOne(file, nextList.length);
          if (result) {
            setLocalRefs((prev) => (single ? [result] : [...prev, result]));
            setLocalFiles((prev) =>
              prev.map((f) =>
                f.uid === file.uid
                  ? { ...f, status: "done", url: result.url }
                  : f,
              ),
            );
          } else {
            setLocalFiles((prev) =>
              prev.map((f) =>
                f.uid === file.uid ? { ...f, status: "error" } : f,
              ),
            );
          }
        } finally {
          setIsLoadingUpload(false);
        }
      },
    [uploadOne],
  );

  /** Build a remove handler that drops the file locally and on the server. */
  const makeRemoveHandler = useCallback(
    (
      setLocalFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>,
      setLocalRefs: React.Dispatch<React.SetStateAction<RefImage[]>>,
    ) =>
      (file: UploadFile) => {
        setLocalFiles((prev) => prev.filter((f) => f.uid !== file.uid));
        setLocalRefs((prev) => prev.filter((r) => r.uid !== file.uid));
        void uploadsServices.remove(file.uid);
      },
    [uploadsServices],
  );

  const handleMultiChange = useMemo(
    () => makeUploadHandler(setFiles, setRefImages, false),
    [makeUploadHandler],
  );
  const removeMulti = useMemo(
    () => makeRemoveHandler(setFiles, setRefImages),
    [makeRemoveHandler],
  );
  const handleFirstChange = useMemo(
    () => makeUploadHandler(setFilesFirst, setRefImageFirst, true),
    [makeUploadHandler],
  );
  const removeFirst = useMemo(
    () => makeRemoveHandler(setFilesFirst, setRefImageFirst),
    [makeRemoveHandler],
  );
  const handleLastChange = useMemo(
    () => makeUploadHandler(setFilesLast, setRefImageLast, true),
    [makeUploadHandler],
  );
  const removeLast = useMemo(
    () => makeRemoveHandler(setFilesLast, setRefImageLast),
    [makeRemoveHandler],
  );

  /** Block duplicate auto-upload; uploads are driven manually in onChange. */
  const beforeUpload = useCallback(() => false, []);

  // ── payload ────────────────────────────────────────────────────────────────

  /**
   * Build the generateConfig via the selected model's buildSubmitPayload,
   * so workflow payloads match the Gen tabs exactly.
   * @returns The payload object, or null if no model/config is resolved.
   */
  const buildGenerateConfig = useCallback(
    (promptValue: string): Record<string, unknown> | null => {
      if (!model?.modelType) return null;
      const { width, height } = computeSize();
      const tempTaskId = `temp-${Date.now()}`;
      const values = { prompt: promptValue };

      if (type === "image") {
        if (!imageConfig) return null;
        const state: ImageFormState = {
          selectedAIModel: model,
          refImages,
          selectedResolution,
          selectedRatio,
          selectedWidth: width,
          selectedHeight: height,
          selectedMaximumImage,
          groupMode: "",
          projectId,
          userId,
          organizationId,
          username: "",
        };
        return imageConfig.buildSubmitPayload(
          values,
          state,
          tempTaskId,
        ) as unknown as Record<string, unknown>;
      }

      if (!videoConfig) return null;
      const computedFiles = refImages.map((img) => ({
        type: getTypeFile(img.imagePath),
        url: img.imagePath,
      }));
      const state: VideoFormState = {
        selectedAIModel: model,
        refImageFirst,
        refImageLast,
        refImages,
        computedFiles,
        selectedResolution,
        selectedRatio,
        selectedWidth: width,
        selectedHeight: height,
        selectedDuration: duration,
        selectedAudio: generateAudio,
        draftMode,
        projectId,
        userId,
        organizationId,
        username: "",
      };
      return videoConfig.buildSubmitPayload(
        values,
        state,
        tempTaskId,
      ) as unknown as Record<string, unknown>;
    },
    [
      computeSize,
      draftMode,
      duration,
      generateAudio,
      imageConfig,
      model,
      organizationId,
      projectId,
      refImageFirst,
      refImageLast,
      refImages,
      selectedMaximumImage,
      selectedRatio,
      selectedResolution,
      type,
      userId,
      videoConfig,
    ],
  );

  // ── live credit estimate ─────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;
    // Credit doesn't depend on prompt text, so estimate with an empty prompt
    // (matches the Gen tabs, which exclude prompt from their estimate deps).
    const config = buildGenerateConfig("");
    if (!config) {
      setEstimate(0);
      onEstimate?.(0);
      return;
    }
    (async () => {
      const credit = await generateServices.getCreditPreSend(config);
      if (!active) return;
      const value = typeof credit === "number" ? credit : 0;
      setEstimate(value);
      onEstimate?.(value);
    })();
    return () => {
      active = false;
    };
    // onEstimate is intentionally excluded to avoid re-fetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildGenerateConfig, generateServices]);

  // ── submit ───────────────────────────────────────────────────────────────────

  /** Validate, build the payload and hand it to the canvas. */
  const handleFinish = async () => {
    const values = await form.validateFields();
    const config = buildGenerateConfig(values.prompt);
    if (!model?.modelType || !config) return;

    onSubmit({
      prompt: values.prompt,
      model: model.modelType,
      resolution: selectedResolution,
      generateConfig: config,
      estimatedCredit: estimate,
    });
  };

  // ── render ─────────────────────────────────────────────────────────────────

  const settingsPopoverContent = (
    <div style={{ width: 280 }}>
      <SettingSection
        semantic={semantic}
        showModeSection={false}
        selectedResolution={selectedResolution}
        handleResolutionChange={handleResolutionChange}
        resolutionOptions={
          type === "image" ? IMAGE_RESOLUTION_OPTIONS : VIDEO_RESOLUTION_OPTIONS
        }
        selectedRatio={selectedRatio}
        ratioOptions={ratioOptions}
        showCountSection={type === "image"}
        selectedMaximumImage={selectedMaximumImage}
        setSelectedMaximumImage={setSelectedMaximumImage}
      />

      {type === "video" && (
        <Space style={{ marginTop: 8 }} size="large">
          <Form.Item label={`Duration (s)`} style={{ marginBottom: 0 }}>
            <InputNumber
              size="small"
              min={1}
              max={maxDuration}
              value={duration}
              onChange={(v) => setDuration(v ?? 6)}
            />
          </Form.Item>
          {supportAudio && (
            <Form.Item label="Audio" style={{ marginBottom: 0 }}>
              <Switch checked={generateAudio} onChange={setGenerateAudio} />
            </Form.Item>
          )}
          {showDraftMode && (
            <Form.Item label="Draft" style={{ marginBottom: 0 }}>
              <Switch checked={draftMode} onChange={setDraftMode} />
            </Form.Item>
          )}
        </Space>
      )}
    </div>
  );

  return (
    <Form form={form} layout="vertical" className="workflow-edit-form">
      <div>
        {/* สลับชนิด generate (image/video) ก่อน generate — ล็อกเมื่อ ref ไม่ใช่รูปภาพ */}
        {onChangeType && (
          <Form.Item label="Generate type" style={{ marginBottom: 8 }}>
            <Tooltip
              title={
                canSwitchType
                  ? undefined
                  : "บล็อกอ้างอิงไม่ใช่รูปภาพ จึงสลับชนิดไม่ได้ — ล็อกเป็นวิดีโอ"
              }
            >
              <Segmented
                size="small"
                block
                value={type}
                disabled={!canSwitchType}
                onChange={(value) => onChangeType(value as WorkflowBlockType)}
                options={[
                  {
                    label: "Image",
                    value: "image",
                    icon: <ImageIcon size={13} />,
                  },
                  {
                    label: "Video",
                    value: "video",
                    icon: <Video size={13} />,
                  },
                ]}
              />
            </Tooltip>
          </Form.Item>
        )}

        <Form.Item label="Model" required style={{ marginBottom: 8 }}>
          <Select
            size="small"
            value={modelId}
            onChange={setModelId}
            placeholder="Select model"
            options={models.map((m) => ({ label: m.name, value: m.id }))}
          />
        </Form.Item>

        <Form.Item label="Upload" style={{ marginBottom: 8 }}>
          {isFirstLast ? (
            <Flex gap={12} wrap>
              <WorkflowUpload
                semantic={semantic}
                files={filesFirst}
                handleUploadChange={handleFirstChange}
                beforeUpload={beforeUpload}
                onRemoveFile={removeFirst}
                maxUploadFiles={1}
                multiple={false}
                label="First frame"
                accept="image/*"
                isLoadingUpload={isLoadingUpload}
              />
              <WorkflowUpload
                semantic={semantic}
                files={filesLast}
                handleUploadChange={handleLastChange}
                beforeUpload={beforeUpload}
                onRemoveFile={removeLast}
                maxUploadFiles={1}
                multiple={false}
                label="Last frame"
                accept="image/*"
                isLoadingUpload={isLoadingUpload}
              />
            </Flex>
          ) : (
            <WorkflowUpload
              semantic={semantic}
              files={files}
              handleUploadChange={handleMultiChange}
              beforeUpload={beforeUpload}
              onRemoveFile={removeMulti}
              maxUploadFiles={8}
              isLoadingUpload={isLoadingUpload}
              accept={type === "video" ? "image/*,video/*,audio/*" : "image/*"}
              extraActions={
                showDraw ? (
                  <DrawToImage
                    files={files}
                    handleUploadChange={handleMultiChange}
                    semantic={semantic}
                    disabled={isLoadingUpload || files.length >= 8}
                  />
                ) : undefined
              }
            />
          )}
        </Form.Item>

        <Form.Item label="Prompt" required style={{ marginBottom: 8 }}>
          <WorkflowPrompt semantic={semantic} fieldName="prompt" rows={3} />
        </Form.Item>

        {/* Settings trigger + selected-value tags + credit estimate */}
        <Flex align="center" gap={6} wrap style={{ marginTop: 8 }}>
          <Popover
            content={settingsPopoverContent}
            trigger="click"
            placement="topLeft"
          >
            <Button size="small" icon={<SlidersHorizontal size={12} />}>
              Settings
            </Button>
          </Popover>

          <Tag color="blue" style={{ margin: 0 }}>
            {selectedRatio}
          </Tag>
          <Tag style={{ margin: 0 }}>{selectedResolution.toUpperCase()}</Tag>
          {type === "image" && (
            <Tag style={{ margin: 0 }}>{selectedMaximumImage}x</Tag>
          )}
          {type === "video" && <Tag style={{ margin: 0 }}>{duration}s</Tag>}
          {type === "video" && generateAudio && (
            <Tag color="green" style={{ margin: 0 }}>
              Audio
            </Tag>
          )}
          <Typography.Text
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: semantic.colorPrimary,
            }}
          >
            ~{estimate} credits
          </Typography.Text>
        </Flex>

        <div className="flex justify-end gap-2 mt-3">
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="small"
            type="primary"
            loading={submitting}
            onClick={handleFinish}
            disabled={!modelId || isLoadingUpload}
          >
            Generate
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default WorkflowEditForm;
