import React from "react";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Segmented,
  Select,
  Slider,
  Switch,
  Typography,
  Upload,
} from "antd";
import { AudioLines, ImagePlus, Plus, Sparkles, X } from "lucide-react";
import Quata from "@/app/page/project/component/quata";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import PromptSection from "../../../video-gen/version/seedance2/prompt-section";
import type { AudioInputProps } from "../../chat-generate-audio";
import type {
  AudioFormat,
  AudioReferenceSlot,
} from "../../../../tab-layout/types/generator-config.type";

const FORMAT_OPTIONS: { label: string; value: AudioFormat }[] = [
  { label: "MP3", value: "mp3" },
  { label: "WAV", value: "wav" },
  { label: "OGG", value: "ogg_opus" },
];

const MODE_OPTIONS: { label: string; value: AudioReferenceSlot["mode"] }[] = [
  { label: "Upload", value: "upload" },
  { label: "URL", value: "url" },
  { label: "Speaker ID", value: "speaker" },
];

// shortcut: ช่วงค่าอิงสเปก Seed Speech TTS — ยังไม่ยืนยันกับ Seed Audio, ปรับเมื่อได้ doc ทางการ
const RATE_CONTROLS = [
  { key: "speechRate", label: "Speech rate", min: -50, max: 100 },
  { key: "loudnessRate", label: "Loudness", min: -50, max: 100 },
  { key: "pitchRate", label: "Pitch", min: -12, max: 12 },
] as const;

export default function ChatAudioInput(props: AudioInputProps) {
  const {
    form,
    features,
    references,
    addReference,
    removeReference,
    setReferenceMode,
    setReferenceValue,
    uploadReference,
    refImage,
    uploadRefImage,
    removeRefImage,
    format,
    setFormat,
    sampleRate,
    setSampleRate,
    enableSubtitle,
    setEnableSubtitle,
    handleSendMessage,
    isLoadingUpload,
    submitting,
    usedCredit,
    cerrentUsedCredit,
    projectId,
  } = props;
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  const rateValue = {
    speechRate: props.speechRate,
    loudnessRate: props.loudnessRate,
    pitchRate: props.pitchRate,
  };
  const setRate = {
    speechRate: props.setSpeechRate,
    loudnessRate: props.setLoudnessRate,
    pitchRate: props.setPitchRate,
  };

  const labelStyle = { fontSize: 12, color: semantic.colorTextSecondary };
  const cardStyle = {
    borderRadius: 12,
    borderColor: semantic.colorBorder,
    background: semantic.colorBgContainer,
  };

  const mentionOptions = references.map((_, i) => ({
    value: `Audio${i + 1}`,
    label: (
      <Flex gap={8} align="center">
        <AudioLines size={14} style={{ color: semantic.colorTextSecondary }} />
        <Typography.Text style={{ fontSize: 12 }}>{`Audio${i + 1}`}</Typography.Text>
      </Flex>
    ),
  }));

  const renderReferenceInput = (index: number) => {
    const ref = references[index];
    if (ref.mode === "upload") {
      return ref.fileName ? (
        <Flex align="center" gap={8} style={{ minWidth: 0 }}>
          <AudioLines size={14} style={{ flexShrink: 0 }} />
          <Typography.Text ellipsis style={{ fontSize: 12, flex: 1 }}>
            {ref.uploading ? `Uploading ${ref.fileName}…` : ref.fileName}
          </Typography.Text>
        </Flex>
      ) : (
        <Upload
          accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/ogg"
          showUploadList={false}
          maxCount={1}
          beforeUpload={(file) => {
            uploadReference(index, file);
            return false;
          }}
          disabled={isLoadingUpload}
        >
          <Button size="small" icon={<Plus size={14} />}>
            {`Audio file (≤ ${features.maxReferenceSeconds} s)`}
          </Button>
        </Upload>
      );
    }
    return (
      <Input
        size="small"
        value={ref.value}
        aria-label={`Audio${index + 1} ${ref.mode === "url" ? "URL" : "speaker ID"}`}
        placeholder={
          ref.mode === "url" ? "https://…/voice.mp3" : "Voice / speaker ID"
        }
        onChange={(e) => setReferenceValue(index, e.target.value)}
      />
    );
  };

  return (
    <Flex vertical style={{ height: "100%", minHeight: 0 }}>
      <Form
        name="audio-gen"
        form={form}
        onFinish={handleSendMessage}
        autoComplete="off"
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex
          vertical
          gap={12}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingInline: 12,
            paddingBlock: 12,
          }}
        >
          <Card size="small" style={cardStyle} styles={{ body: { padding: 12 } }}>
            <Flex vertical gap={10}>
              <Flex justify="space-between" align="center">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  Voice references
                </Typography.Text>
                <Typography.Text style={labelStyle}>
                  {`${references.length}/${features.maxReferences}`}
                </Typography.Text>
              </Flex>
              <Typography.Text style={labelStyle}>
                Optional. Mention each one in the prompt as @Audio1, @Audio2…
              </Typography.Text>
              {references.map((ref, index) => (
                <Flex
                  key={index}
                  vertical
                  gap={6}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    border: `1px solid ${semantic.colorBorderSecondary}`,
                  }}
                >
                  <Flex justify="space-between" align="center" gap={8}>
                    <Typography.Text style={{ fontSize: 12, fontWeight: 600 }}>
                      {`@Audio${index + 1}`}
                    </Typography.Text>
                    <Segmented
                      size="small"
                      options={MODE_OPTIONS}
                      value={ref.mode}
                      onChange={(value) =>
                        setReferenceMode(index, value as AudioReferenceSlot["mode"])
                      }
                    />
                    <Button
                      size="small"
                      type="text"
                      aria-label={`Remove @Audio${index + 1}`}
                      icon={<X size={14} />}
                      disabled={ref.uploading}
                      onClick={() => removeReference(index)}
                    />
                  </Flex>
                  {renderReferenceInput(index)}
                </Flex>
              ))}
              <Button
                block
                type="dashed"
                icon={<Plus size={14} />}
                disabled={
                  references.length >= features.maxReferences || !!refImage
                }
                onClick={addReference}
              >
                Add voice reference
              </Button>
            </Flex>
          </Card>

          <Card size="small" style={cardStyle} styles={{ body: { padding: 12 } }}>
            <Flex vertical gap={8}>
              <Typography.Text strong style={{ fontSize: 13 }}>
                Reference image
              </Typography.Text>
              <Typography.Text style={labelStyle}>
                Optional. Generate sound that matches a scene — use either an image or voice references.
              </Typography.Text>
              {refImage ? (
                <Flex align="center" gap={8}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={refImage.url}
                    alt="Reference"
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                  />
                  <Typography.Text ellipsis style={{ flex: 1, fontSize: 12 }}>
                    {refImage.name}
                  </Typography.Text>
                  <Button
                    size="small"
                    type="text"
                    aria-label="Remove reference image"
                    icon={<X size={14} />}
                    onClick={removeRefImage}
                  />
                </Flex>
              ) : (
                <Upload
                  accept="image/jpeg,image/png,image/webp"
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={(file) => {
                    uploadRefImage(file);
                    return false;
                  }}
                  disabled={isLoadingUpload || references.length > 0}
                >
                  <Button
                    size="small"
                    icon={<ImagePlus size={14} />}
                    disabled={isLoadingUpload || references.length > 0}
                  >
                    Upload image
                  </Button>
                </Upload>
              )}
            </Flex>
          </Card>

          <PromptSection
            semantic={semantic}
            placeholder="Describe the speech, music or sound… e.g. A warm female voice like @Audio1 says: “Welcome back!” over soft piano."
            rows={5}
            maxLength={3000}
            required={true}
            showAiAssist={false}
            showRegenerateButton={false}
            mentionOptions={mentionOptions}
            projectId={projectId}
          />

          <Card size="small" style={cardStyle} styles={{ body: { padding: 12 } }}>
            <Flex vertical gap={12}>
              <Typography.Text strong style={{ fontSize: 13 }}>
                Output
              </Typography.Text>
              <Flex vertical gap={6}>
                <Typography.Text style={labelStyle}>Format</Typography.Text>
                <Segmented
                  block
                  options={FORMAT_OPTIONS}
                  value={format}
                  onChange={(value) => setFormat(value as AudioFormat)}
                />
              </Flex>
              <Flex vertical gap={6}>
                <Typography.Text style={labelStyle}>Sample rate</Typography.Text>
                <Select
                  aria-label="Sample rate"
                  value={sampleRate ?? "default"}
                  onChange={(value) =>
                    setSampleRate(value === "default" ? undefined : Number(value))
                  }
                  options={[
                    { label: "Default", value: "default" },
                    ...features.sampleRates.map((rate) => ({
                      label: `${(rate / 1000).toLocaleString()} kHz`,
                      value: rate,
                    })),
                  ]}
                />
              </Flex>
              {RATE_CONTROLS.map(({ key, label, min, max }) => (
                <Flex vertical gap={2} key={key}>
                  <Flex justify="space-between" align="center">
                    <Typography.Text style={labelStyle}>{label}</Typography.Text>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, fontSize: 12 }}
                      disabled={rateValue[key] === 0}
                      onClick={() => setRate[key](0)}
                    >
                      {rateValue[key] === 0 ? "Default" : `${rateValue[key]} · Reset`}
                    </Button>
                  </Flex>
                  <Slider
                    aria-label={label}
                    min={min}
                    max={max}
                    value={rateValue[key]}
                    onChange={(value) => setRate[key](value)}
                  />
                </Flex>
              ))}
              <Flex justify="space-between" align="center">
                <Typography.Text style={labelStyle}>Subtitles</Typography.Text>
                <Switch
                  aria-label="Subtitles"
                  checked={enableSubtitle}
                  onChange={setEnableSubtitle}
                />
              </Flex>
            </Flex>
          </Card>
        </Flex>

        <Flex
          vertical
          gap={8}
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: `1px solid ${semantic.colorBorder}`,
            background: semantic.colorBgContainer,
            paddingInline: 12,
            paddingBlock: 12,
          }}
        >
          <Card
            size="small"
            style={{
              borderRadius: 12,
              borderColor: semantic.colorBorder,
              background: semantic.colorBgElevated,
              width: "100%",
              minWidth: 0,
            }}
            styles={{ body: { padding: "8px 12px" } }}
          >
            <Quata
              title="Quota"
              creditUsed={usedCredit.used || 0}
              creditTotal={usedCredit.total || 0}
              size="small"
              cerrentUsedCredit={cerrentUsedCredit}
            />
          </Card>
          <Button
            block
            type="primary"
            htmlType="submit"
            disabled={submitting || isLoadingUpload}
            style={{
              color: "white",
              border: "none",
              height: 40,
              borderRadius: 10,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${semantic.colorPrimary} 0%, ${semantic.colorPrimary} 50%, ${aiCaveColors.secondary} 100%)`,
            }}
            icon={<Sparkles size={16} />}
            loading={submitting}
          >
            Generate Audio
          </Button>
        </Flex>
      </Form>
    </Flex>
  );
}
