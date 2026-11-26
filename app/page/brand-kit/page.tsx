"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Form, Modal, Spin, Tag, message, theme } from "antd";
import { PlusOutlined, StarFilled, StarOutlined } from "@ant-design/icons";

import BrandKitServices, {
  type TBrandPromptPreview,
} from "@/app/services/brand-kit.service";
import BrandKitDetailServices from "@/app/services/brand-kit-detail.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { overlayShadow } from "@/app/theme/surface";
import type { TBrandKit } from "@/app/common/brand-kit";

import BrandKitForm from "./components/brand-kit-form";
import KitList from "./board/kit-list";
import PaletteStrip from "./board/palette-strip";
import ColorSection, {
  type ColorDraft,
  type SaveColor,
} from "./board/color-section";
import TypeSection, { type FontDraft } from "./board/type-section";
import StyleSection from "./board/style-section";
import PromptCard from "./board/prompt-card";
import { BoardColor, colorsOf, fontsOf } from "./board/model";
import { flyColor } from "./board/motion";
import "./board/board.css";

const brandKitService = BrandKitServices(axiosCore);
const detailService = BrandKitDetailServices(axiosCore);

const formatUpdated = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export default function BrandKitPage() {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const { token } = theme.useToken();
  const { mode } = useThemeMode();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [kits, setKits] = useState<TBrandKit[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rows, setRows] = useState<TBrandPromptPreview[]>([]);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [defaulting, setDefaulting] = useState(false);
  const [kitForm, setKitForm] = useState<
    { mode: "create" } | { mode: "edit"; kit: TBrandKit } | null
  >(null);
  const [kitFormSaving, setKitFormSaving] = useState(false);
  const timers = useRef<{ fresh?: number; copied?: number }>({});

  const kit = kits?.find((k) => k.id === selectedId) ?? null;
  const colors = colorsOf(kit);
  const fonts = fontsOf(kit);
  const isDefault = Boolean(kit?.isDefault ?? kit?.default);

  /** Reloads the organization's kits; keeps the current selection when it still exists. */
  const loadKits = useCallback(async () => {
    if (!organizationId) return null;
    const loaded = await brandKitService.findByOrganizationId(organizationId);
    if (!loaded) {
      messageApi.error("Couldn't load brand kits. Check your connection and reload.");
      return null;
    }
    const sorted = [...loaded].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setKits(sorted);
    setSelectedId((current) =>
      sorted.some((k) => k.id === current)
        ? current
        : (sorted.find((k) => k.isDefault ?? k.default)?.id ?? sorted[0]?.id ?? null),
    );
    return sorted;
  }, [organizationId, messageApi]);

  const loadPreview = useCallback(async (kitId: string | null) => {
    setRows(kitId ? ((await brandKitService.promptPreview(kitId)) ?? []) : []);
  }, []);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  useEffect(() => {
    loadPreview(selectedId);
  }, [selectedId, loadPreview]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      window.clearTimeout(pending.fresh);
      window.clearTimeout(pending.copied);
    };
  }, []);

  /** After a change to the selected kit: reload it and what it sends. */
  const refresh = async () => {
    await loadKits();
    await loadPreview(selectedId);
  };

  const markFresh = (id: string) => {
    setFreshId(id);
    window.clearTimeout(timers.current.fresh);
    timers.current.fresh = window.setTimeout(() => setFreshId(null), 900);
  };

  const copyHex = async (color: BoardColor) => {
    try {
      await navigator.clipboard.writeText(color.hex.toUpperCase());
    } catch {
      messageApi.error("Couldn't copy. Select the code and copy it yourself.");
      return;
    }
    setCopiedId(color.id);
    window.clearTimeout(timers.current.copied);
    timers.current.copied = window.setTimeout(() => setCopiedId(null), 1200);
  };

  const saveColor: SaveColor = async (draft, id, origin) => {
    if (!kit) return false;
    const payload = {
      name: draft.name,
      type: "colors" as const,
      detail: { hex: draft.hex, type: draft.role },
    };
    const saved = id
      ? await detailService.update(id, payload)
      : await detailService.create({
          ...payload,
          brandKitId: kit.id,
          sortOrder: colors.filter((c) => c.role === draft.role).length,
        });
    if (!saved?.id) {
      messageApi.error("Couldn't save this color. Check the code and try again.");
      return false;
    }
    await refresh();
    markFresh(saved.id);
    // the strip has re-rendered with the new segment by the next frame
    requestAnimationFrame(() =>
      flyColor(
        origin,
        document.querySelector(`[data-strip-id="${saved.id}"]`),
        draft.hex,
      ),
    );
    return true;
  };

  const importColors = async (drafts: ColorDraft[], origin: DOMRect) => {
    if (!kit) return false;
    const counts = new Map<string, number>();
    let lastId: string | undefined;
    let failed = 0;
    // one at a time, so each colour takes the next place in its role
    for (const draft of drafts) {
      const offset = counts.get(draft.role) ?? 0;
      counts.set(draft.role, offset + 1);
      const saved = await detailService.create({
        name: draft.name,
        type: "colors",
        detail: { hex: draft.hex, type: draft.role },
        brandKitId: kit.id,
        sortOrder: colors.filter((c) => c.role === draft.role).length + offset,
      });
      if (saved?.id) lastId = saved.id;
      else failed += 1;
    }
    await refresh();
    if (failed > 0) {
      messageApi.error(
        `${failed} of ${drafts.length} colors couldn't be saved. Add them again.`,
      );
    }
    if (!lastId) return false;
    const arrived = lastId;
    markFresh(arrived);
    requestAnimationFrame(() =>
      flyColor(
        origin,
        document.querySelector(`[data-strip-id="${arrived}"]`),
        drafts[drafts.length - 1].hex,
      ),
    );
    return failed === 0;
  };

  const deleteDetail = async (id: string, what: "color" | "font") => {
    const deleted = await detailService.del(id);
    if (!deleted) {
      messageApi.error(`Couldn't delete this ${what}. Try again.`);
      return;
    }
    await refresh();
  };

  const reorderColors = async (orderedIds: string[]) => {
    if (!kit) return;
    const position = new Map(orderedIds.map((id, index) => [id, index]));
    // show the new order at once; the saved order follows
    setKits(
      (current) =>
        current?.map((k) =>
          k.id !== kit.id
            ? k
            : {
                ...k,
                brandKitDetails: [...(k.brandKitDetails ?? [])]
                  .map((d) => ({
                    ...d,
                    sortOrder: position.get(d.id) ?? d.sortOrder ?? 0,
                  }))
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
              },
        ) ?? null,
    );
    const results = await Promise.all(
      orderedIds.map((id, index) => detailService.update(id, { sortOrder: index })),
    );
    if (results.some((result) => !result)) {
      messageApi.error("Couldn't save the new order. It has been reset.");
    }
    await refresh();
  };

  const saveFont = async (draft: FontDraft, id?: string) => {
    if (!kit) return false;
    const payload = {
      name: draft.name,
      type: "typography" as const,
      detail: { weight: draft.weight, type: draft.role, preview: "" },
    };
    const saved = id
      ? await detailService.update(id, payload)
      : await detailService.create({
          ...payload,
          brandKitId: kit.id,
          // a new font is a record first; the owner switches it on when lettering matters
          includeInPrompt: false,
        });
    if (!saved) {
      messageApi.error("Couldn't save this font. Try again.");
      return false;
    }
    await refresh();
    return true;
  };

  const toggleFontSend = async (id: string, send: boolean) => {
    const saved = await detailService.update(id, { includeInPrompt: send });
    if (!saved) messageApi.error("Couldn't change this font. Try again.");
    await refresh();
  };

  const updateKit = async (data: Partial<TBrandKit>, failure: string) => {
    if (!kit) return false;
    const saved = await brandKitService.update(kit.id, data);
    if (!saved) {
      messageApi.error(failure);
      return false;
    }
    await refresh();
    return true;
  };

  const setDefault = async () => {
    if (!kit) return;
    setDefaulting(true);
    const saved = await brandKitService.setDefault(kit.id);
    setDefaulting(false);
    if (!saved) {
      messageApi.error("Couldn't set this kit as default. Try again.");
      return;
    }
    await loadKits();
  };

  const deleteKit = async (target: TBrandKit) => {
    const deleted = await brandKitService.del(target.id);
    if (!deleted) {
      messageApi.error(`Couldn't delete ${target.name}. Try again.`);
      return;
    }
    await loadKits();
  };

  const openKitForm = (target?: TBrandKit) => {
    form.resetFields();
    if (target) {
      form.setFieldsValue({
        name: target.name,
        description: target.description,
        industry: target.industryType,
      });
    }
    setKitForm(target ? { mode: "edit", kit: target } : { mode: "create" });
  };

  const submitKitForm = async () => {
    if (!kitForm || !organizationId) return;
    let values: { name: string; description?: string; industry: string };
    try {
      values = await form.validateFields();
    } catch {
      return; // the form shows which field is missing
    }
    const data = {
      name: values.name,
      description: values.description,
      industryType: values.industry,
    };
    setKitFormSaving(true);
    const saved =
      kitForm.mode === "edit"
        ? await brandKitService.update(kitForm.kit.id, data)
        : await brandKitService.create({ ...data, organizationId });
    setKitFormSaving(false);
    if (!saved) {
      messageApi.error("Couldn't save this brand kit. Try again.");
      return;
    }
    setKitForm(null);
    await loadKits();
    if (kitForm.mode === "create" && saved.id) setSelectedId(saved.id);
  };

  // CSS custom properties are not part of CSSProperties
  const vars = {
    "--bk-text": token.colorText,
    "--bk-text-2": token.colorTextSecondary,
    "--bk-border": token.colorBorder,
    "--bk-surface": token.colorBgContainer,
    "--bk-elevated": token.colorBgElevated,
    "--bk-fill": token.colorFillTertiary,
    "--bk-primary": token.colorPrimary,
    "--bk-primary-bg": token.colorPrimaryBg,
    "--bk-warning": token.colorWarning,
    "--bk-error": token.colorError,
    "--bk-star": token.colorWarning,
    "--bk-radius": `${token.borderRadius}px`,
    "--bk-radius-lg": `${token.borderRadiusLG}px`,
    "--bk-shadow": overlayShadow(mode),
  } as React.CSSProperties;

  const kitFormModal = (
    <Modal
      open={kitForm !== null}
      title={kitForm?.mode === "edit" ? "Rename brand kit" : "New brand kit"}
      okText={kitForm?.mode === "edit" ? "Save kit" : "Create kit"}
      confirmLoading={kitFormSaving}
      onOk={submitKitForm}
      onCancel={() => setKitForm(null)}
      destroyOnHidden
    >
      <BrandKitForm form={form} mode={kitForm?.mode ?? "create"} />
    </Modal>
  );

  if (kits === null) {
    return (
      <div className="bk-blank">
        {contextHolder}
        <Spin size="large" />
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="bk-blank" style={vars}>
        {contextHolder}
        <h1 className="bk-title">Create your first brand kit</h1>
        <p className="bk-note">
          A kit holds your colors and style. Turn it on while generating and
          every result is steered toward your brand.
        </p>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openKitForm()}>
          New brand kit
        </Button>
        {kitFormModal}
      </div>
    );
  }

  return (
    <div className="bk-page" style={vars}>
      {contextHolder}
      <KitList
        kits={kits}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={() => openKitForm()}
        onEdit={openKitForm}
        onDelete={deleteKit}
      />

      {kit && (
        <div className="bk-board">
          <header className="bk-head">
            <div>
              <h2 className="bk-title">{kit.name}</h2>
              <p className="bk-sub">
                {[kit.industryType, kit.updatedAt && `Updated ${formatUpdated(kit.updatedAt)}`]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            {isDefault ? (
              <Tag color="warning" icon={<StarFilled />} style={{ marginInlineEnd: 0 }}>
                Default
              </Tag>
            ) : (
              <Button icon={<StarOutlined />} loading={defaulting} onClick={setDefault}>
                Set as default
              </Button>
            )}
          </header>

          <div className="bk-strip-wrap">
            <PaletteStrip
              kitId={kit.id}
              colors={colors}
              freshId={freshId}
              copiedId={copiedId}
              onCopy={copyHex}
            />
          </div>

          <div className="bk-main">
            <ColorSection
              colors={colors}
              freshId={freshId}
              copiedId={copiedId}
              onCopy={copyHex}
              onSave={saveColor}
              onDelete={(id) => deleteDetail(id, "color")}
              onReorder={reorderColors}
              onImport={importColors}
            />
            <TypeSection
              fonts={fonts}
              onSave={saveFont}
              onToggleSend={toggleFontSend}
              onDelete={(id) => deleteDetail(id, "font")}
            />
            <StyleSection
              style={kit.style}
              notSentYet={kit.promptVersion !== 2}
              onSave={(style) =>
                updateKit({ style }, "Couldn't save the style. Try again.")
              }
            />
          </div>

          <PromptCard
            kit={kit}
            rows={rows}
            colors={colors}
            freshId={freshId}
            onSaveNegative={(negativePrompt) =>
              updateKit({ negativePrompt }, "Couldn't save the Negative Prompt. Try again.")
            }
            onSaveCustom={(customPrompt) =>
              updateKit({ customPrompt }, "Couldn't save the instructions. Try again.")
            }
            onLegacyChoice={(keep) =>
              updateKit(
                { promptVersion: 2, customPrompt: keep ? (kit.brandCiPrompt ?? "") : "" },
                "Couldn't switch this kit. Try again.",
              )
            }
          />
        </div>
      )}

      <span className="bk-sr" role="status" aria-live="polite">
        {copiedId ? "Color code copied" : ""}
      </span>
      {kitFormModal}
    </div>
  );
}
