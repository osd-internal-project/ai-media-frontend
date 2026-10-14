"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Empty,
  Flex,
  Image,
  Input,
  Modal,
  Spin,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import ActivityShareServices from "@/app/services/activity-share.service";
import {
  ActivityShareDetail,
  MAX_MEDIA_PER_SHARE,
  PLATFORM_CAPABILITIES,
  PLATFORM_LABELS,
  SocialAccount,
  SocialPlatform,
  isVideoType,
} from "@/app/common/activity-share.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PlatformIcon from "./platform-icon";

/** แถว gallery ที่ใช้ในตัวเลือกสื่อ — คงเป็น shape หลวม ๆ ตาม API เดิม */
interface GalleryItem {
  id: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  typeGenerate?: string | null;
  prompt?: string | null;
}

interface CreateShareModalProps {
  open: boolean;
  organizationId: string;
  projectId: string;
  userId: string;
  accounts: SocialAccount[];
  /** งานที่จะแก้ไข — null = สร้างใหม่ */
  editing: ActivityShareDetail | null;
  /** gallery id ที่ preselect ไว้ (เข้ามาจากปุ่ม Share ในแท็บ All Activity) */
  presetGalleryIds?: string[];
  onClose: () => void;
  onSaved: () => void;
}

const GALLERY_PAGE_SIZE = 24;

/**
 * Wizard 3 ขั้นสำหรับสร้าง/แก้ไขงาน share
 *
 * ตรวจข้อจำกัดของ platform แบบสด ๆ ตั้งแต่ในฟอร์ม (backend ตรวจซ้ำอีกชั้น)
 * เพื่อให้ผู้ใช้รู้ตั้งแต่ตอนเลือกว่า TikTok รับเฉพาะวิดีโอ ฯลฯ แทนที่จะไปเจอ
 * ตอนกด submit แล้วต้องย้อนกลับมาแก้
 */
const CreateShareModal: React.FC<CreateShareModalProps> = ({
  open,
  organizationId,
  projectId,
  userId,
  accounts,
  editing,
  presetGalleryIds,
  onClose,
  onSaved,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const galleryServices = useMemo(() => GalleryServices(axiosCore), []);
  const activityShareServices = useMemo(
    () => ActivityShareServices(axiosCore),
    []
  );
  const [messageApi, contextHolder] = message.useMessage();

  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);

  const [selectedGalleryIds, setSelectedGalleryIds] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>("");
  const [hashtagInput, setHashtagInput] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // ── Reset / prefill เมื่อเปิด modal ───────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (editing) {
      setSelectedGalleryIds(editing.media.map((item) => item.galleryId));
      setCaption(editing.caption);
      setHashtagInput(editing.hashtags.join(" "));
      setLinkUrl(editing.linkUrl ?? "");
      setSelectedAccountIds(
        editing.targets.map((target) => target.socialAccountId)
      );
    } else {
      setSelectedGalleryIds(presetGalleryIds ?? []);
      setCaption("");
      setHashtagInput("");
      setLinkUrl("");
      setSelectedAccountIds([]);
    }
  }, [open, editing, presetGalleryIds]);

  // ── โหลด gallery ของ project ──────────────────────────────────────────────
  const fetchGallery = useCallback(async () => {
    if (!open || !projectId || !organizationId) return;
    setGalleryLoading(true);
    try {
      const res = await galleryServices.findById(
        projectId,
        organizationId,
        1,
        GALLERY_PAGE_SIZE
      );
      setGalleryItems(res?.data ?? []);
    } catch (error) {
      console.error("Failed to load gallery:", error);
      messageApi.error("Could not load gallery items");
    } finally {
      setGalleryLoading(false);
    }
  }, [open, projectId, organizationId, galleryServices, messageApi]);

  useEffect(() => {
    fetchGallery();
  }, [open, projectId, organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ─────────────────────────────────────────────────────────

  const hashtags = useMemo(
    () =>
      hashtagInput
        .split(/[\s,]+/)
        .map((tag) => tag.replace(/^#/, "").trim())
        .filter(Boolean),
    [hashtagInput]
  );

  const selectedItems = useMemo(
    () =>
      selectedGalleryIds
        .map((id) => galleryItems.find((item) => item.id === id))
        .filter((item): item is GalleryItem => Boolean(item)),
    [selectedGalleryIds, galleryItems]
  );

  const mediaShape = useMemo(() => {
    const hasVideo = selectedItems.some((item) =>
      isVideoType(item.typeGenerate)
    );
    const hasImage = selectedItems.some(
      (item) => !isVideoType(item.typeGenerate)
    );
    return { hasVideo, hasImage, count: selectedItems.length };
  }, [selectedItems]);

  /**
   * ตรวจว่าบัญชีนี้รับสื่อชุดที่เลือกได้หรือไม่
   *
   * @param account บัญชีที่จะตรวจ
   * @returns เหตุผลที่เลือกไม่ได้ หรือ null เมื่อเลือกได้
   */
  const accountBlockedReason = useCallback(
    (account: SocialAccount): string | null => {
      if (account.status === "EXPIRED") return "Reconnect this account first";

      const capability = PLATFORM_CAPABILITIES[account.platform];
      const { hasVideo, hasImage, count } = mediaShape;
      if (count === 0) return null;
      if (hasVideo && !capability.allowsVideo) return "Does not accept video";
      if (hasImage && !capability.allowsImage) return "Accepts video only";
      if (hasVideo && hasImage && !capability.allowsMixedMedia)
        return "Cannot mix images and video";
      if (count > capability.maxMediaCount)
        return `Max ${capability.maxMediaCount} item(s)`;
      return null;
    },
    [mediaShape]
  );

  /** เพดาน caption = platform ที่เข้มที่สุดในบรรดาที่เลือกไว้ */
  const captionLimit = useMemo(() => {
    const platforms = accounts
      .filter((account) => selectedAccountIds.includes(account.id))
      .map((account) => account.platform);
    if (platforms.length === 0) return 5000;
    return Math.min(
      ...platforms.map(
        (platform: SocialPlatform) =>
          PLATFORM_CAPABILITIES[platform].maxCaptionLength
      )
    );
  }, [accounts, selectedAccountIds]);

  const captionTooLong = caption.length > captionLimit;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleGalleryItem = useCallback((item: GalleryItem) => {
    setSelectedGalleryIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }
      if (prev.length >= MAX_MEDIA_PER_SHARE) return prev;
      return [...prev, item.id];
    });
  }, []);

  const toggleAccount = useCallback((accountId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = {
        caption: caption.trim(),
        hashtags,
        ...(linkUrl.trim() && { linkUrl: linkUrl.trim() }),
        mediaItems: selectedGalleryIds.map((galleryId) => ({ galleryId })),
        socialAccountIds: selectedAccountIds,
      };

      if (editing) {
        await activityShareServices.update(editing.id, { userId, ...payload });
        messageApi.success("Share task updated and sent for approval");
      } else {
        await activityShareServices.create({
          organizationId,
          projectId,
          userId,
          ...payload,
        });
        messageApi.success("Share task submitted for approval");
      }
      onSaved();
      onClose();
    } catch (error) {
      // backend ตรวจซ้ำและคืนเหตุผลที่อ่านรู้เรื่อง — แสดงตรง ๆ ให้ผู้ใช้แก้ได้
      const reason =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? "Could not save the share task";
      messageApi.error(Array.isArray(reason) ? reason.join(", ") : reason);
    } finally {
      setSubmitting(false);
    }
  }, [
    caption,
    hashtags,
    linkUrl,
    selectedGalleryIds,
    selectedAccountIds,
    editing,
    userId,
    organizationId,
    projectId,
    activityShareServices,
    messageApi,
    onSaved,
    onClose,
  ]);

  // ── Step gating ───────────────────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    if (step === 0) return selectedGalleryIds.length > 0;
    if (step === 1) return !captionTooLong;
    return false;
  }, [step, selectedGalleryIds, captionTooLong]);

  const canSubmit =
    selectedGalleryIds.length > 0 &&
    selectedAccountIds.length > 0 &&
    !captionTooLong &&
    accounts
      .filter((account) => selectedAccountIds.includes(account.id))
      .every((account) => accountBlockedReason(account) === null);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderMediaStep = () => (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary">
          Pick the images or videos to publish
        </Typography.Text>
        <Tag color={selectedGalleryIds.length > 0 ? "blue" : "default"}>
          {selectedGalleryIds.length} / {MAX_MEDIA_PER_SHARE} selected
        </Tag>
      </Flex>

      {galleryLoading ? (
        <Flex justify="center" style={{ padding: 48 }}>
          <Spin />
        </Flex>
      ) : galleryItems.length === 0 ? (
        <Empty description="This project has no generated items yet" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 12,
            maxHeight: 380,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {galleryItems.map((item) => {
            const selected = selectedGalleryIds.includes(item.id);
            const isVideo = isVideoType(item.typeGenerate);
            const atLimit =
              !selected && selectedGalleryIds.length >= MAX_MEDIA_PER_SHARE;
            return (
              <div
                key={item.id}
                onClick={() => !atLimit && toggleGalleryItem(item)}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: atLimit ? "not-allowed" : "pointer",
                  opacity: atLimit ? 0.4 : 1,
                  border: `2px solid ${
                    selected ? semantic.colorPrimary : semantic.colorBorder
                  }`,
                  background: semantic.colorBgElevated,
                }}
              >
                <Image
                  src={item.thumbnailUrl || item.imageUrl || ""}
                  alt={item.prompt ?? "gallery item"}
                  preview={false}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "cover" }}
                />
                {isVideo && (
                  <span
                    style={{
                      position: "absolute",
                      left: 6,
                      bottom: 6,
                      color: "#fff",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))",
                    }}
                  >
                    <PlayCircle size={18} />
                  </span>
                )}
                {selected && (
                  <span
                    style={{
                      position: "absolute",
                      right: 6,
                      top: 6,
                      color: semantic.colorPrimary,
                      background: "#fff",
                      borderRadius: "50%",
                      display: "inline-flex",
                    }}
                  >
                    <CheckCircle2 size={20} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mediaShape.hasVideo && mediaShape.hasImage && (
        <Alert
          type="info"
          showIcon
          style={{ marginTop: 12 }}
          message="Mixed images and video"
          description="Only Instagram accepts a mixed carousel. Facebook, TikTok and YouTube will be unavailable in the next step."
        />
      )}
    </div>
  );

  const renderComposeStep = () => (
    <Flex vertical gap={16}>
      <div>
        <Typography.Text strong>Caption</Typography.Text>
        <Input.TextArea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={6}
          placeholder="Write the text that will appear with the post…"
          status={captionTooLong ? "error" : undefined}
          style={{ marginTop: 6 }}
        />
        <Flex justify="space-between" style={{ marginTop: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Limit follows the strictest selected platform
          </Typography.Text>
          <Typography.Text
            type={captionTooLong ? "danger" : "secondary"}
            style={{ fontSize: 12 }}
          >
            {caption.length} / {captionLimit}
          </Typography.Text>
        </Flex>
      </div>

      <div>
        <Typography.Text strong>Hashtags</Typography.Text>
        <Input
          value={hashtagInput}
          onChange={(event) => setHashtagInput(event.target.value)}
          placeholder="summer launch product  (space separated, # optional)"
          style={{ marginTop: 6 }}
        />
        {hashtags.length > 0 && (
          <Flex wrap gap={4} style={{ marginTop: 8 }}>
            {hashtags.map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </Flex>
        )}
      </div>

      <div>
        <Typography.Text strong>Link (optional)</Typography.Text>
        <Input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="https://example.com/campaign"
          style={{ marginTop: 6 }}
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Appended to the caption. Instagram does not render links in captions.
        </Typography.Text>
      </div>
    </Flex>
  );

  const renderTargetStep = () => (
    <Flex vertical gap={16}>
      {accounts.length === 0 ? (
        <Empty description="No social account is connected for this organization yet" />
      ) : (
        <Flex vertical gap={8}>
          {accounts.map((account) => {
            const blocked = accountBlockedReason(account);
            const checked = selectedAccountIds.includes(account.id);
            return (
              <Flex
                key={account.id}
                align="center"
                justify="space-between"
                gap={12}
                onClick={() => !blocked && toggleAccount(account.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: blocked ? "not-allowed" : "pointer",
                  opacity: blocked ? 0.55 : 1,
                  border: `1px solid ${
                    checked ? semantic.colorPrimary : semantic.colorBorder
                  }`,
                  background: semantic.colorBgContainer,
                }}
              >
                <Flex align="center" gap={10}>
                  <Checkbox checked={checked} disabled={Boolean(blocked)} />
                  <PlatformIcon platform={account.platform} size={28} />
                  <div>
                    <Typography.Text>{account.displayName}</Typography.Text>
                    <div>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {PLATFORM_LABELS[account.platform]}
                      </Typography.Text>
                    </div>
                  </div>
                </Flex>
                {blocked && <Tag color="warning">{blocked}</Tag>}
              </Flex>
            );
          })}
        </Flex>
      )}

      <div>
        <Typography.Text strong>Review</Typography.Text>
        <Flex
          gap={12}
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${semantic.colorBorderSecondary}`,
          }}
        >
          <Flex gap={6} wrap style={{ maxWidth: 200 }}>
            {selectedItems.slice(0, 4).map((item) => (
              <Avatar
                key={item.id}
                shape="square"
                size={48}
                src={item.thumbnailUrl || item.imageUrl || undefined}
              />
            ))}
            {selectedItems.length > 4 && (
              <Avatar shape="square" size={48}>
                +{selectedItems.length - 4}
              </Avatar>
            )}
          </Flex>
          <Flex vertical flex={1} gap={4}>
            <Typography.Paragraph
              ellipsis={{ rows: 3 }}
              style={{ marginBottom: 0 }}
            >
              {caption || (
                <Typography.Text type="secondary">No caption</Typography.Text>
              )}
            </Typography.Paragraph>
            {hashtags.length > 0 && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {hashtags.map((tag) => `#${tag}`).join(" ")}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
      </div>

      <Alert
        type="info"
        showIcon
        message="This task goes to an organization admin for approval"
        description="After it is approved you still need to press Send to publish it."
      />
    </Flex>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={760}
      destroyOnHidden
      title={editing ? "Edit share task" : "New share task"}
      footer={
        <Flex justify="space-between">
          <Button onClick={onClose}>Cancel</Button>
          <Flex gap={8}>
            {step > 0 && (
              <Button onClick={() => setStep((prev) => prev - 1)}>Back</Button>
            )}
            {step < 2 ? (
              <Button
                type="primary"
                disabled={!canGoNext}
                onClick={() => setStep((prev) => prev + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                loading={submitting}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {editing ? "Save & resubmit" : "Submit for approval"}
              </Button>
            )}
          </Flex>
        </Flex>
      }
    >
      {contextHolder}
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 20 }}
        items={[
          { title: "Select media" },
          { title: "Compose" },
          { title: "Targets & review" },
        ]}
      />
      {step === 0 && renderMediaStep()}
      {step === 1 && renderComposeStep()}
      {step === 2 && renderTargetStep()}
    </Modal>
  );
};

export default CreateShareModal;
