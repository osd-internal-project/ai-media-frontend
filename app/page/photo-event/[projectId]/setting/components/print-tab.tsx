"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  ArrowDown,
  ArrowUp,
  Frame,
  ImagePlus,
  Plus,
  Printer,
  Trash2,
  Type,
} from "lucide-react";
import type {
  IPhotoEventGeneration,
  IPhotoEventPhoto,
  IPhotoEventPrintTemplate,
  IPrintBox,
  IPrintLayout,
  TPrintElement,
} from "@/app/common/photo-event.type";
import PhotoEventService, {
  getPhotoEventErrorMessage,
} from "@/app/services/photo-event.service";
import { axiosCore } from "@/app/lib/axios/axios";
import useResponsive from "@/app/hooks/useResponsive";
import { usePrintGeneration } from "@/app/components/photo-event/print-sheet";
import { buildPhotoShareUrl } from "@/app/utils/photo-event";
import { DEFAULT_PRINT_LAYOUT, newPrintElementId } from "@/app/utils/photo-event-print";
import PrintCanvas from "./print-canvas";
import PrintInspector from "./print-inspector";

interface PrintTabProps {
  projectId: string;
  userId: string;
  photos: IPhotoEventPhoto[];
  semantic: Record<string, unknown>;
}

interface IDraft {
  name: string;
  layout: IPrintLayout;
}

/** ต้องเท่ากับ PHOTO_EVENT_MAX_FILE_BYTES ของ backend */
const PRINT_ASSET_MAX_BYTES = 50 * 1024 * 1024;
const ACCEPT_IMAGES = "image/png,image/jpeg,image/webp";
const SAMPLE_GENERATION_ID = "print-preview";

const PLACEHOLDER_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect width="900" height="1200" fill="#d9dde3"/><text x="450" y="610" font-family="sans-serif" font-size="48" text-anchor="middle" fill="#6b7280">Guest photo</text></svg>',
)}`;

const toKey = (draft: IDraft | null) => JSON.stringify(draft);

const layerTitle = (el: TPrintElement): string => {
  if (el.type === "text") return el.content.trim().split("\n")[0] || "Empty text";
  return { photo: "Photo", qr: "QR code", icon: "Icon", overlay: "Frame" }[el.type];
};

/** สัดส่วนจริงของรูปที่อัปโหลด — icon ใหม่จะได้ไม่ถูกบีบ */
const readAspect = (url: string): Promise<number> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 1);
    img.onerror = () => resolve(1);
    img.src = url;
  });

export default function PrintTab({ projectId, userId, photos, semantic }: PrintTabProps) {
  const [messageApi, messageHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const { isMobile } = useResponsive();
  const service = useMemo(() => PhotoEventService(axiosCore), []);
  const [templates, setTemplates] = useState<IPhotoEventPrintTemplate[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [draft, setDraft] = useState<IDraft | null>(null);
  const [savedKey, setSavedKey] = useState(toKey(null));
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { print, printing, sheet } = usePrintGeneration(() =>
    messageApi.error("Test print failed — an image on the card could not load"),
  );

  const current = templates.find((t) => t.id === currentId) ?? null;
  const isDirty = toKey(draft) !== savedKey;

  const samplePhotoUrl = useMemo(() => {
    for (const photo of photos) {
      const done = photo.generations.find((g) => g.status === "success" && g.resultUrl);
      if (done?.resultUrl) return done.resultUrl;
    }
    return photos.find((p) => p.url)?.url ?? PLACEHOLDER_PHOTO;
  }, [photos]);

  const open = useCallback((template: IPhotoEventPrintTemplate | null) => {
    const next = template ? { name: template.name, layout: template.layout } : null;
    setCurrentId(template?.id ?? null);
    setDraft(next);
    setSavedKey(toKey(next));
    setAssetUrls((prev) => ({ ...prev, ...template?.assetUrls }));
    setSelectedId(null);
  }, []);

  useEffect(() => {
    setLoading(true);
    service
      .findPrintTemplates(projectId)
      .then((list) => {
        setTemplates(list);
        open(list.find((t) => t.isActive) ?? list[0] ?? null);
        setLoadError(null);
      })
      .catch((error) => setLoadError(getPhotoEventErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [projectId, service, open]);

  const replaceTemplate = (saved: IPhotoEventPrintTemplate) =>
    setTemplates((prev) => {
      const others = saved.isActive
        ? prev.map((t) => ({ ...t, isActive: false }))
        : prev;
      return others.some((t) => t.id === saved.id)
        ? others.map((t) => (t.id === saved.id ? saved : t))
        : [...others, saved];
    });

  /** ถามก่อนทิ้งงานที่ยังไม่บันทึก */
  const confirmDiscard = (action: () => void) => {
    if (!isDirty) return action();
    modal.confirm({
      title: "Discard unsaved changes?",
      content: "Changes to this template since the last save will be lost.",
      okText: "Discard",
      okButtonProps: { danger: true },
      onOk: action,
    });
  };

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      messageApi.error(getPhotoEventErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const createTemplate = () =>
    confirmDiscard(() =>
      run(async () => {
        const created = await service.createPrintTemplate(projectId, {
          userId,
          name: `Template ${templates.length + 1}`,
          layout: DEFAULT_PRINT_LAYOUT,
        });
        replaceTemplate(created);
        open(created);
        messageApi.success(
          created.isActive ? "Template created and used for printing" : "Template created",
        );
      }),
    );

  const save = () =>
    run(async () => {
      if (!draft || !currentId) return;
      const saved = await service.updatePrintTemplate(projectId, currentId, {
        userId,
        name: draft.name,
        layout: draft.layout,
      });
      replaceTemplate(saved);
      setAssetUrls((prev) => ({ ...prev, ...saved.assetUrls }));
      setSavedKey(toKey(draft));
      messageApi.success("Template saved");
    });

  const activate = () =>
    run(async () => {
      if (!currentId) return;
      const saved = await service.activatePrintTemplate(projectId, currentId, userId);
      replaceTemplate(saved);
      messageApi.success("The kiosk now prints with this template");
    });

  const remove = () =>
    run(async () => {
      if (!current) return;
      await service.removePrintTemplate(projectId, current.id, userId);
      const rest = templates.filter((t) => t.id !== current.id);
      setTemplates(rest);
      open(rest[0] ?? null);
      messageApi.success(
        current.isActive
          ? "Template deleted — the kiosk prints with the default layout"
          : "Template deleted",
      );
    });

  const updateLayout = (update: (layout: IPrintLayout) => IPrintLayout) =>
    setDraft((prev) => (prev ? { ...prev, layout: update(prev.layout) } : prev));

  const updateElement = (id: string, patch: Partial<IPrintBox> | Record<string, unknown>) =>
    updateLayout((layout) => ({
      ...layout,
      elements: layout.elements.map((el) =>
        // patch มาจากฟิลด์ของ element ชนิดนั้นใน inspector จึงไม่เปลี่ยน type ของ element
        el.id === id ? ({ ...el, ...patch } as TPrintElement) : el,
      ),
    }));

  const addElement = (el: TPrintElement) => {
    updateLayout((layout) => ({ ...layout, elements: [...layout.elements, el] }));
    setSelectedId(el.id);
  };

  const removeElement = (id: string) => {
    updateLayout((layout) => ({ ...layout, elements: layout.elements.filter((el) => el.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  /** ลำดับใน array = z-order; ปุ่ม "ขึ้น" = ไปท้าย array (ทับตัวอื่น) */
  const moveLayer = (id: string, direction: 1 | -1) =>
    updateLayout((layout) => {
      const elements = [...layout.elements];
      const index = elements.findIndex((el) => el.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= elements.length) return layout;
      [elements[index], elements[target]] = [elements[target], elements[index]];
      return { ...layout, elements };
    });

  const uploadAsset = async (file: File): Promise<{ key: string; url: string } | null> => {
    if (file.size > PRINT_ASSET_MAX_BYTES) {
      messageApi.error(`${file.name} is larger than 50 MB`);
      return null;
    }
    setUploading(true);
    try {
      const asset = await service.uploadPrintAsset(projectId, userId, file);
      const { key, url } = asset;
      if (!url) throw new Error("Uploaded, but the image link could not be created");
      setAssetUrls((prev) => ({ ...prev, [key]: url }));
      return { key, url };
    } catch (error) {
      messageApi.error(getPhotoEventErrorMessage(error));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addIcon = async (file: File) => {
    const asset = await uploadAsset(file);
    if (!asset || !draft) return;
    const aspect = await readAspect(asset.url);
    const wMm = 20;
    const hMm = Math.max(2, Math.round(wMm * aspect));
    const { widthMm, heightMm } = draft.layout.paper;
    addElement({
      id: newPrintElementId(),
      type: "icon",
      assetKey: asset.key,
      wMm,
      hMm,
      xMm: Math.round((widthMm - wMm) / 2),
      yMm: Math.round((heightMm - hMm) / 2),
    });
  };

  const setFrame = async (file: File) => {
    const asset = await uploadAsset(file);
    if (!asset) return;
    // กรอบมีได้ชิ้นเดียว — อัปโหลดใหม่แทนที่ของเดิม
    updateLayout((layout) => ({
      ...layout,
      elements: [
        ...layout.elements.filter((el) => el.type !== "overlay"),
        { id: newPrintElementId(), type: "overlay", assetKey: asset.key },
      ],
    }));
  };

  const setBackgroundImage = async (file: File) => {
    const asset = await uploadAsset(file);
    if (asset) updateLayout((layout) => ({ ...layout, background: { ...layout.background, imageKey: asset.key } }));
  };

  const addText = () => {
    if (!draft) return;
    addElement({
      id: newPrintElementId(),
      type: "text",
      content: "Your text",
      xMm: draft.layout.paper.marginMm,
      yMm: draft.layout.paper.marginMm,
      wMm: 50,
      hMm: 10,
      fontSizePt: 14,
      color: "#191c20",
      weight: 500,
      align: "left",
    });
  };

  const testPrint = () => {
    if (!draft) return;
    const sample: IPhotoEventGeneration = {
      id: SAMPLE_GENERATION_ID,
      photoId: "",
      promptGuideId: 0,
      templateTitle: null,
      status: "success",
      progress: null,
      resultUrl: samplePhotoUrl,
      errorMessage: null,
      createdAt: new Date().toISOString(),
    };
    print(sample, { layout: draft.layout, assetUrls });
  };

  const uploadButton = (label: string, icon: React.ReactNode, onFile: (file: File) => void) => (
    <Upload
      accept={ACCEPT_IMAGES}
      showUploadList={false}
      beforeUpload={(file) => {
        onFile(file);
        return false;
      }}
    >
      <Button block icon={icon} loading={uploading} style={{ justifyContent: "flex-start" }}>
        {label}
      </Button>
    </Upload>
  );

  const border = `1px solid ${semantic.colorBorderSecondary as string}`;
  const selected = draft?.layout.elements.find((el) => el.id === selectedId) ?? null;
  const hasFrame = draft?.layout.elements.some((el) => el.type === "overlay") ?? false;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  if (loadError) {
    return (
      <Empty description={`Print templates could not load: ${loadError}`}>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </Empty>
    );
  }

  if (!draft || !current) {
    return (
      <>
        {messageHolder}
        <Empty
          style={{ padding: 48 }}
          description="Cards print with the default 4×6 layout. Create a template to change the background, add a logo or move the QR code."
        >
          <Button type="primary" icon={<Plus size={14} />} loading={busy} onClick={createTemplate}>
            Create template
          </Button>
        </Empty>
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {messageHolder}
      {modalHolder}
      {sheet}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Select
          value={currentId}
          style={{ minWidth: 200 }}
          options={templates.map((t) => ({
            value: t.id,
            label: t.isActive ? `${t.name} (printing)` : t.name,
          }))}
          onChange={(id) =>
            confirmDiscard(() => open(templates.find((t) => t.id === id) ?? null))
          }
        />
        <Input
          aria-label="Template name"
          value={draft.name}
          maxLength={100}
          style={{ width: 200 }}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
        <Button icon={<Plus size={14} />} disabled={busy} onClick={createTemplate}>
          New template
        </Button>
        <Popconfirm
          title="Delete this template?"
          description={
            current.isActive ? "The kiosk will print with the default layout." : undefined
          }
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={remove}
        >
          <Button icon={<Trash2 size={14} />} disabled={busy} aria-label="Delete template" />
        </Popconfirm>

        <span style={{ flex: 1 }} />

        {current.isActive ? (
          <Tag color="success">Used for printing</Tag>
        ) : (
          <Button disabled={busy || isDirty} onClick={activate}>
            Use for printing
          </Button>
        )}
        <Button icon={<Printer size={14} />} loading={printing} onClick={testPrint}>
          Test print
        </Button>
        <Button type="primary" disabled={!isDirty || !draft.name.trim()} loading={busy} onClick={save}>
          Save template
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "200px minmax(0, 1fr) 280px",
          border,
          borderRadius: 8,
          overflow: "hidden",
          background: semantic.colorBgContainer as string,
        }}
      >
        <div
          style={{
            order: isMobile ? 2 : 0,
            padding: 12,
            borderRight: isMobile ? undefined : border,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Typography.Text strong>Layers</Typography.Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...draft.layout.elements].reverse().map((el) => {
              const active = el.id === selectedId;
              const removable = el.type !== "photo" && el.type !== "qr";
              return (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 6px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: active ? (semantic.colorPrimaryBg as string) : undefined,
                  }}
                >
                  <Typography.Text ellipsis style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                    {layerTitle(el)}
                  </Typography.Text>
                  <Button type="text" size="small" aria-label="Bring forward" icon={<ArrowUp size={12} />} onClick={(e) => { e.stopPropagation(); moveLayer(el.id, 1); }} />
                  <Button type="text" size="small" aria-label="Send backward" icon={<ArrowDown size={12} />} onClick={(e) => { e.stopPropagation(); moveLayer(el.id, -1); }} />
                  {removable && (
                    <Button type="text" size="small" danger aria-label="Remove layer" icon={<Trash2 size={12} />} onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <Button block icon={<Type size={14} />} onClick={addText} style={{ justifyContent: "flex-start" }}>
              Add text
            </Button>
            {uploadButton("Add icon", <ImagePlus size={14} />, addIcon)}
            {uploadButton(hasFrame ? "Replace frame" : "Add frame", <Frame size={14} />, setFrame)}
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Frames are transparent PNGs that cover the whole card.
          </Typography.Text>
        </div>

        <div style={{ order: isMobile ? 0 : 1, height: isMobile ? 460 : "calc(100vh - 300px)", minHeight: 460 }}>
          <PrintCanvas
            layout={draft.layout}
            photoUrl={samplePhotoUrl}
            shareUrl={buildPhotoShareUrl(SAMPLE_GENERATION_ID)}
            assetUrls={assetUrls}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChangeBox={updateElement}
            semantic={semantic}
          />
        </div>

        <div
          style={{
            order: isMobile ? 1 : 2,
            padding: "0 16px",
            borderLeft: isMobile ? undefined : border,
            overflowY: "auto",
            maxHeight: isMobile ? undefined : "calc(100vh - 300px)",
          }}
        >
          <PrintInspector
            layout={draft.layout}
            selected={selected}
            uploading={uploading}
            onChangeLayout={updateLayout}
            onChangeElement={updateElement}
            onUploadBackground={setBackgroundImage}
            semantic={semantic}
          />
        </div>
      </div>
    </div>
  );
}
