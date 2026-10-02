"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Spin,
  Typography,
  message,
} from "antd";
import { Check, RotateCcw } from "lucide-react";
import type { TPromptGuide } from "@/app/common/prompt-guide.type";
import type { IPhotoEventTemplateInput } from "@/app/common/photo-event.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import PhotoEventService, {
  getPhotoEventErrorMessage,
} from "@/app/services/photo-event.service";
import { axiosCore } from "@/app/lib/axios/axios";
import useResponsive from "@/app/hooks/useResponsive";
import { PROMPT_MAX_LENGTH } from "@/app/config/prompt";

interface TemplatesTabProps {
  projectId: string;
  userId: string;
  organizationId: string;
  semantic: Record<string, unknown>;
}

const toKey = (items: IPhotoEventTemplateInput[]) => JSON.stringify(items);

/** prompt ที่ใช้จริงตอน generate — ต้องตรงกับ PhotoEventGenerationsService ฝั่ง backend */
const buildFinalPrompt = (textPrompt: string, tail: string) =>
  [textPrompt.trim(), tail.trim()].filter(Boolean).join("\n\n");

export default function TemplatesTab({
  projectId,
  userId,
  organizationId,
  semantic,
}: TemplatesTabProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const { isMobile } = useResponsive();
  const promptGuideService = useMemo(() => PromptGuideServices(axiosCore), []);
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const [guides, setGuides] = useState<TPromptGuide[]>([]);
  const [selected, setSelected] = useState<IPhotoEventTemplateInput[]>([]);
  const [savedKey, setSavedKey] = useState(toKey([]));
  const [defaultTail, setDefaultTail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    Promise.all([
      promptGuideService.findByOrganization(organizationId),
      photoEventService.findTemplates(projectId),
      photoEventService.findDefaultPromptTail(projectId),
    ])
      .then(([allGuides, templates, tail]) => {
        setGuides(
          (allGuides ?? []).filter(
            (guide) => guide.generateType === "image" && guide.status,
          ),
        );
        const initial = templates.map((t) => ({
          promptGuideId: t.promptGuideId,
          promptTail: t.promptTail,
        }));
        setSelected(initial);
        setSavedKey(toKey(initial));
        setDefaultTail(tail);
      })
      .finally(() => setLoading(false));
  }, [organizationId, projectId, promptGuideService, photoEventService]);

  const guideById = useMemo(
    () => new Map(guides.map((guide) => [guide.id ?? 0, guide])),
    [guides],
  );

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.some((t) => t.promptGuideId === id)
        ? prev.filter((t) => t.promptGuideId !== id)
        : [...prev, { promptGuideId: id, promptTail: null }],
    );

  const setTail = (id: number, promptTail: string | null) =>
    setSelected((prev) =>
      prev.map((t) => (t.promptGuideId === id ? { ...t, promptTail } : t)),
    );

  const isDirty = toKey(selected) !== savedKey;

  const save = async () => {
    setSaving(true);
    try {
      const templates = await photoEventService.setTemplates(
        projectId,
        userId,
        selected,
      );
      const saved = templates.map((t) => ({
        promptGuideId: t.promptGuideId,
        promptTail: t.promptTail,
      }));
      setSelected(saved);
      setSavedKey(toKey(saved));
      messageApi.success("Event templates saved");
    } catch (error) {
      messageApi.error(getPhotoEventErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  if (guides.length === 0) {
    return <Empty description="No image templates in Prompt Guide yet" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {contextHolder}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 2,
          padding: "8px 0",
          background: semantic.colorBgBase as string,
        }}
      >
        <Typography.Text type="secondary" style={{ flex: 1 }}>
          Pick Prompt Guide templates for this event. The order you pick is the
          order on the kiosk.
        </Typography.Text>
        <Button type="primary" disabled={!isDirty} loading={saving} onClick={save}>
          Save ({selected.length})
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 170}px, 1fr))`,
          gap: isMobile ? 10 : 16,
        }}
      >
        {guides.map((guide) => {
          const id = guide.id ?? 0;
          const order = selected.findIndex((t) => t.promptGuideId === id);
          const isSelected = order >= 0;
          return (
            <Badge.Ribbon
              key={id}
              text={isSelected ? `#${order + 1}` : ""}
              style={{ display: isSelected ? undefined : "none" }}
            >
              <button
                type="button"
                onClick={() => toggle(id)}
                style={{
                  width: "100%",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: semantic.colorBgContainer as string,
                  border: `2px solid ${
                    isSelected
                      ? (semantic.colorPrimary as string)
                      : (semantic.colorBorder as string)
                  }`,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "3 / 4",
                    background: "#0003",
                  }}
                >
                  {guide.images?.[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guide.images[0].url}
                      alt={guide.title ?? "template"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: semantic.colorPrimary as string,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={16} />
                    </div>
                  )}
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <Typography.Text strong ellipsis style={{ display: "block" }}>
                    {guide.title}
                  </Typography.Text>
                </div>
              </button>
            </Badge.Ribbon>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Event prompt
          </Typography.Title>
          <Typography.Text type="secondary">
            When a guest generates from the kiosk, the prompt is the template
            prompt followed by this event prompt. Guest photo = image 1,
            template images follow.
          </Typography.Text>
          {selected.map((item, index) => {
            const guide = guideById.get(item.promptGuideId);
            if (!guide) return null;
            const tail = item.promptTail ?? defaultTail;
            return (
              <Card
                key={item.promptGuideId}
                size="small"
                title={`#${index + 1} ${guide.title ?? ""}`}
                extra={
                  item.promptTail !== null && (
                    <Button
                      size="small"
                      type="text"
                      icon={<RotateCcw size={14} />}
                      onClick={() => setTail(item.promptGuideId, null)}
                    >
                      Reset to default
                    </Button>
                  )
                }
                style={{
                  background: semantic.colorBgContainer as string,
                  borderColor: semantic.colorBorder as string,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Template prompt (edit in Prompt Guide)
                    </Typography.Text>
                    <Typography.Paragraph
                      style={{ margin: 0, whiteSpace: "pre-wrap" }}
                    >
                      {guide.textPrompt || "—"}
                    </Typography.Paragraph>
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Event prompt (appended)
                      {item.promptTail === null ? " · default" : ""}
                    </Typography.Text>
                    <Input.TextArea
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      maxLength={PROMPT_MAX_LENGTH}
                      showCount
                      value={tail}
                      onChange={(e) =>
                        setTail(item.promptGuideId, e.target.value)
                      }
                    />
                  </div>
                  <details>
                    <summary style={{ cursor: "pointer", fontSize: 12 }}>
                      Final prompt preview
                    </summary>
                    <Typography.Paragraph
                      code
                      style={{ marginTop: 8, whiteSpace: "pre-wrap" }}
                    >
                      {buildFinalPrompt(guide.textPrompt ?? "", tail)}
                    </Typography.Paragraph>
                  </details>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
