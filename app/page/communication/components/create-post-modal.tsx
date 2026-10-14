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
  Select,
  Spin,
  Steps,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import CommunityPostServices from "@/app/services/community-post.service";
import {
  CommunityPostDetail,
  MAX_COMMUNITY_CAPTION_LENGTH,
  MAX_COMMUNITY_TITLE_LENGTH,
  MAX_MEDIA_PER_COMMUNITY_POST,
  isVideoType,
} from "@/app/common/community-post.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

/** แถว gallery ที่ใช้ในตัวเลือกสื่อ — คงเป็น shape หลวม ๆ ตาม API เดิม */
interface GalleryItem {
  id: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  typeGenerate?: string | null;
  prompt?: string | null;
}

interface CreatePostModalProps {
  open: boolean;
  organizationId: string;
  userId: string;
  projects: { id: string; name: string }[];
  /** โพสต์ที่จะแก้ไข — null = สร้างใหม่ */
  editing: CommunityPostDetail | null;
  onClose: () => void;
  onSaved: () => void;
}

const GALLERY_PAGE_SIZE = 24;

/**
 * Wizard 4 ขั้นสำหรับสร้าง/แก้ไขโพสต์ community
 *
 * มีขั้น "เลือก project" เพิ่มจาก wizard ของ Public Social เพราะหน้านี้อยู่ระดับ
 * องค์กร ไม่ได้อยู่ใต้ route ของ project จึงไม่มี projectId มาให้เอง
 *
 * ขั้นสุดท้ายเป็นการยืนยันการเผยแพร่สู่สาธารณะโดยเฉพาะ — แยกออกมาเพราะผลของ
 * การกดปุ่มนี้ย้อนกลับได้ไม่หมด (คนอื่นเห็น แคชไว้ แชร์ต่อได้)
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  organizationId,
  userId,
  projects,
  editing,
  onClose,
  onSaved,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const galleryServices = useMemo(() => GalleryServices(axiosCore), []);
  const communityServices = useMemo(() => CommunityPostServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();

  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [projectId, setProjectId] = useState<string | undefined>();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);

  const [selectedGalleryIds, setSelectedGalleryIds] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [hashtagInput, setHashtagInput] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(false);

  // ── Reset / prefill เมื่อเปิด modal ───────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setConsentAcknowledged(false);
    if (editing) {
      setProjectId(editing.projectId);
      setSelectedGalleryIds(editing.media.map((item) => item.galleryId));
      setTitle(editing.title);
      setCaption(editing.caption);
      setHashtagInput(editing.hashtags.join(" "));
      setLinkUrl(editing.linkUrl ?? "");
      setShowPrompt(editing.showPrompt);
    } else {
      setProjectId(projects.length === 1 ? projects[0].id : undefined);
      setSelectedGalleryIds([]);
      setTitle("");
      setCaption("");
      setHashtagInput("");
      setLinkUrl("");
      setShowPrompt(false);
    }
  }, [open, editing, projects]);

  // ── โหลด gallery ของ project ที่เลือก ─────────────────────────────────────
  const fetchGallery = useCallback(async () => {
    if (!open || !projectId || !organizationId) {
      setGalleryItems([]);
      return;
    }
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

  /**
   * สื่อที่เลือกไว้ พร้อมรูปตัวอย่างสำหรับขั้น Review
   *
   * ตอนแก้ไขโพสต์เดิม สื่อที่เลือกไว้อาจไม่อยู่ใน gallery หน้าแรกที่โหลดมา —
   * จึง fallback ไปใช้ snapshot จาก editing.media ที่ backend presign มาให้แล้ว
   * ไม่งั้นขั้นสุดท้ายจะโชว์เป็นช่องว่างทั้งที่มีสื่อเลือกอยู่
   */
  const selectedItems = useMemo(
    () =>
      selectedGalleryIds.map((id) => {
        const fromGallery = galleryItems.find((item) => item.id === id);
        if (fromGallery) return fromGallery;

        const fromEditing = editing?.media.find(
          (item) => item.galleryId === id
        );
        return {
          id,
          thumbnailUrl: fromEditing?.thumbnailUrl ?? null,
          imageUrl: fromEditing?.url ?? null,
          typeGenerate: fromEditing?.typeGenerate ?? null,
          prompt: null,
        } satisfies GalleryItem;
      }),
    [selectedGalleryIds, galleryItems, editing]
  );

  /** สื่อที่เป็นวิดีโอคนจริง — ต้องเตือนเรื่องสิทธิ์ในภาพบุคคลชัดกว่าปกติ */
  const hasLikenessMedia = useMemo(
    () =>
      selectedItems.some((item) =>
        ["omnihumen", "omnihuman", "dreamactor"].includes(
          item.typeGenerate ?? ""
        )
      ),
    [selectedItems]
  );

  const captionTooLong = caption.length > MAX_COMMUNITY_CAPTION_LENGTH;
  const titleTooLong = title.length > MAX_COMMUNITY_TITLE_LENGTH;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleGalleryItem = useCallback((item: GalleryItem) => {
    setSelectedGalleryIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }
      if (prev.length >= MAX_MEDIA_PER_COMMUNITY_POST) return prev;
      return [...prev, item.id];
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!projectId) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        caption: caption.trim(),
        hashtags,
        ...(linkUrl.trim() && { linkUrl: linkUrl.trim() }),
        mediaItems: selectedGalleryIds.map((galleryId) => ({ galleryId })),
        showPrompt,
      };

      if (editing) {
        await communityServices.update(editing.id, { userId, ...payload });
        messageApi.success("Post updated and sent for approval");
      } else {
        await communityServices.create({
          organizationId,
          projectId,
          userId,
          ...payload,
        });
        messageApi.success("Post submitted for approval");
      }
      onSaved();
      onClose();
    } catch (error) {
      // backend ตรวจซ้ำและคืนเหตุผลที่อ่านรู้เรื่อง — แสดงตรง ๆ ให้ผู้ใช้แก้ได้
      const reason =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? "Could not save the post";
      messageApi.error(Array.isArray(reason) ? reason.join(", ") : reason);
    } finally {
      setSubmitting(false);
    }
  }, [
    projectId,
    title,
    caption,
    hashtags,
    linkUrl,
    selectedGalleryIds,
    showPrompt,
    editing,
    userId,
    organizationId,
    communityServices,
    messageApi,
    onSaved,
    onClose,
  ]);

  // ── Step gating ───────────────────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    if (step === 0) return Boolean(projectId);
    if (step === 1) return selectedGalleryIds.length > 0;
    if (step === 2) return Boolean(title.trim()) && !captionTooLong && !titleTooLong;
    return false;
  }, [
    step,
    projectId,
    selectedGalleryIds,
    title,
    captionTooLong,
    titleTooLong,
  ]);

  const canSubmit =
    Boolean(projectId) &&
    selectedGalleryIds.length > 0 &&
    Boolean(title.trim()) &&
    !captionTooLong &&
    !titleTooLong &&
    consentAcknowledged;

  // ── Render ────────────────────────────────────────────────────────────────

  const renderProjectStep = () => (
    <Flex vertical gap={12}>
      <Typography.Text type="secondary">
        Pick the project whose gallery you want to publish from.
      </Typography.Text>
      <Select
        value={projectId}
        onChange={(value) => {
          setProjectId(value);
          // สื่อที่เลือกไว้เป็นของ project เดิม — backend ปฏิเสธ gallery ข้าม project
          setSelectedGalleryIds([]);
        }}
        placeholder="Select a project"
        showSearch
        optionFilterProp="label"
        // แก้ไขโพสต์เดิมแล้วย้าย project ไม่ได้ — snapshot สื่อผูกกับ project เดิม
        disabled={Boolean(editing)}
        options={projects.map((project) => ({
          value: project.id,
          label: project.name,
        }))}
      />
      {editing && (
        <Alert
          type="info"
          showIcon
          message="The project cannot be changed"
          description="Create a new post if you want to publish media from a different project."
        />
      )}
    </Flex>
  );

  const renderMediaStep = () => (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary">
          Pick the images or videos to publish
        </Typography.Text>
        <Tag color={selectedGalleryIds.length > 0 ? "blue" : "default"}>
          {selectedGalleryIds.length} / {MAX_MEDIA_PER_COMMUNITY_POST} selected
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
              !selected &&
              selectedGalleryIds.length >= MAX_MEDIA_PER_COMMUNITY_POST;
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
    </div>
  );

  const renderComposeStep = () => (
    <Flex vertical gap={16}>
      <div>
        <Typography.Text strong>Title</Typography.Text>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What is this piece called?"
          status={titleTooLong ? "error" : undefined}
          style={{ marginTop: 6 }}
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Shown as the page heading and used to build the public link.
        </Typography.Text>
      </div>

      <div>
        <Typography.Text strong>Caption</Typography.Text>
        <Input.TextArea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={5}
          placeholder="Tell the story behind this work…"
          status={captionTooLong ? "error" : undefined}
          style={{ marginTop: 6 }}
        />
        <Flex justify="flex-end" style={{ marginTop: 4 }}>
          <Typography.Text
            type={captionTooLong ? "danger" : "secondary"}
            style={{ fontSize: 12 }}
          >
            {caption.length} / {MAX_COMMUNITY_CAPTION_LENGTH}
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
      </div>

      <Flex justify="space-between" align="center" gap={12}>
        <Flex vertical>
          <Typography.Text strong>Show the prompt publicly</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Off by default — prompts are often the part you do not want to give away.
          </Typography.Text>
        </Flex>
        <Switch checked={showPrompt} onChange={setShowPrompt} />
      </Flex>
    </Flex>
  );

  const renderReviewStep = () => (
    <Flex vertical gap={16}>
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
            <Typography.Text strong>{title || "Untitled"}</Typography.Text>
            <Typography.Paragraph
              ellipsis={{ rows: 3 }}
              type="secondary"
              style={{ marginBottom: 0, fontSize: 12 }}
            >
              {caption || "No caption"}
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
        type="warning"
        showIcon
        message="This will be visible to anyone on the internet"
        description="Once approved and published, the post gets a public link that needs no login. It can be shared, indexed by search engines and cached by other sites — taking it down later removes the page but not those copies."
      />

      {hasLikenessMedia && (
        <Alert
          type="warning"
          showIcon
          message="This post contains a generated person"
          description="Make sure you have the right to publish this likeness before sending it for approval."
        />
      )}

      <Checkbox
        checked={consentAcknowledged}
        onChange={(event) => setConsentAcknowledged(event.target.checked)}
      >
        <Typography.Text style={{ fontSize: 13 }}>
          I have the right to publish this media publicly.
        </Typography.Text>
      </Checkbox>

      <Alert
        type="info"
        showIcon
        message="An organization admin reviews this first"
        description="After approval they publish it, or set a time for it to go live."
      />
    </Flex>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={760}
      destroyOnHidden
      title={editing ? "Edit community post" : "New community post"}
      footer={
        <Flex justify="space-between">
          <Button onClick={onClose}>Cancel</Button>
          <Flex gap={8}>
            {step > 0 && (
              <Button onClick={() => setStep((prev) => prev - 1)}>Back</Button>
            )}
            {step < 3 ? (
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
          { title: "Project" },
          { title: "Select media" },
          { title: "Compose" },
          { title: "Review" },
        ]}
      />
      {step === 0 && renderProjectStep()}
      {step === 1 && renderMediaStep()}
      {step === 2 && renderComposeStep()}
      {step === 3 && renderReviewStep()}
    </Modal>
  );
};

export default CreatePostModal;
