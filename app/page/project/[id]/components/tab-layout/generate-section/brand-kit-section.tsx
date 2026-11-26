import React, { useEffect, useState } from "react";
import Link from "next/link";
import BrandKitServices, {
  type TBrandPromptPreview,
} from "@/app/services/brand-kit.service";
import type { TBrandKit } from "@/app/common/brand-kit";
import ProjectServices from "@/app/services/project.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { Card, Flex, Select, Typography, Switch } from "antd";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { useSession } from "next-auth/react";
import "./brand-kit-section.css";
import {
  BgColorsOutlined,
  BulbOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Text } = Typography;

/** The kit a generation will use, and how many prompt characters it takes (separator included). */
export type AppliedBrandKit = {
  id: string;
  usedChars: number;
  /** the kit's images to send as style references, already limited to the room the form has */
  refKeys: string[];
};

type Props = {
  semantic: Record<string, any>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  /** backend model type of this form: image | video | omnihumen | dreamactor */
  generateType: string;
  /** the project being generated in; its own kit comes before the organization default */
  projectId?: string;
  /** free reference-image places in this form; leave out on forms where an image is not a style reference */
  imageSlots?: number;
  /** null when the switch is off or the organization has no default kit */
  onKitChange?: (kit: AppliedBrandKit | null) => void;
};

// "\n\n" the backend puts between the user's prompt and the kit's text
const SEPARATOR_CHARS = 2;
// mirrors MAX_KIT_REFS in the backend's brand-kit-prompt.service.ts
const MAX_KIT_REFS = 2;

export default function BrandKitSection({
  semantic,
  generateType,
  projectId,
  imageSlots,
  onKitChange,
}: Props) {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const [active, setActive] = useState(false);
  const [kits, setKits] = useState<TBrandKit[]>([]);
  const [projectKitId, setProjectKitId] = useState<string | null>(null);
  // a kit chosen for this generation only; null follows the project, then the organization default
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<TBrandPromptPreview | null>(null);

  // Loaded whether or not the switch is on, so the row never shows a made-up name
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!organizationId) return;
      const [loadedKits, project] = await Promise.all([
        BrandKitServices(axiosCore).findByOrganizationId(organizationId),
        projectId ? ProjectServices(axiosCore).findById(projectId) : undefined,
      ]);
      if (cancelled) return;
      setKits(loadedKits ?? []);
      setProjectKitId(project?.brandKitId ?? null);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [organizationId, projectId]);

  const brandKit =
    kits.find((k) => k.id === pickedId) ??
    kits.find((k) => k.id === projectKitId) ??
    kits.find((k) => k.isDefault ?? k.default) ??
    null;

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    if (!brandKit?.id) return;
    BrandKitServices(axiosCore)
      .promptPreview(brandKit.id)
      .then((rows) => {
        if (cancelled) return;
        // shortcut: the longest text among this tab's models, so the counter never under-reports; pass the selected model when forms expose it
        setPreview(
          (rows ?? [])
            .filter((row) => row.type === generateType)
            .sort((a, b) => b.usedChars - a.usedChars)[0] ?? null,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [brandKit?.id, generateType]);

  // Kit images this form can send: style images are on from the start, logos only when the user adds them
  const kitImages = (brandKit?.brandKitDetails ?? []).flatMap((d) => {
    const detail = d.detail;
    if (d.type !== "logo" && d.type !== "style_ref") return [];
    const key = detail && "key" in detail ? detail.key : undefined;
    const url = detail && "url" in detail ? detail.url : undefined;
    return key && url ? [{ key, url, name: d.name, isLogo: d.type === "logo" }] : [];
  });
  const styleKeys = kitImages.filter((i) => !i.isLogo).map((i) => i.key);
  const defaultRefs = styleKeys.slice(0, MAX_KIT_REFS).join("|");
  const [chosenRefs, setChosenRefs] = useState<string[]>([]);
  useEffect(() => {
    setChosenRefs(defaultRefs ? defaultRefs.split("|") : []);
  }, [defaultRefs, brandKit?.id]);
  const room = Math.min(MAX_KIT_REFS, imageSlots ?? 0);
  const refKeys = kitImages
    .map((i) => i.key)
    .filter((key) => chosenRefs.includes(key))
    .slice(0, room);
  const refsKey = refKeys.join("|");

  const kitId = brandKit?.id;
  const usedChars = preview?.usedChars ?? 0;
  useEffect(() => {
    onKitChange?.(
      active && kitId
        ? {
            id: kitId,
            usedChars: usedChars ? usedChars + SEPARATOR_CHARS : 0,
            refKeys: refsKey ? refsKey.split("|") : [],
          }
        : null,
    );
    // onKitChange is a state setter in every form; listing it would re-fire on each parent render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, kitId, usedChars, refsKey]);

  const parsedColors = (brandKit?.brandKitDetails ?? [])
    .filter((d) => d.type === "colors")
    .map((d) => (d.detail && "hex" in d.detail ? d.detail.hex : ""))
    .filter(Boolean);

  const { mode } = useThemeMode();
  // Dark keeps the original hand-tuned values; light reads theme tokens.
  const c =
    mode === "dark"
      ? {
          dotRing: "rgba(255,255,255,0.14)",
          label: "#8B93A7",
          accentBg: "rgba(111, 106, 222, 0.12)",
          accentBorder: "rgba(111, 106, 222, 0.24)",
          accent: "#8B7CFF",
          title: "#FFFFFF",
          text2: "#9CA3AF",
          boxBorder: "rgba(111, 106, 222, 0.28)",
          boxBorderIdle: "rgba(111, 106, 222, 0.18)",
          boxBg: "rgba(38, 45, 68, 0.72)",
          boxText: "#B6BED1",
          avoid: "#A1A1AA",
        }
      : {
          dotRing: semantic.colorBorder,
          label: semantic.colorTextSecondary,
          accentBg: semantic.colorPrimaryBg,
          accentBorder: semantic.colorPrimaryBg,
          accent: semantic.colorPrimary,
          title: semantic.colorTextBase,
          text2: semantic.colorTextSecondary,
          boxBorder: semantic.colorPrimaryBg,
          boxBorderIdle: semantic.colorBorder,
          boxBg: semantic.colorBgLayout,
          boxText: semantic.colorTextSecondary,
          avoid: semantic.colorTextSecondary,
        };

  const colorDotStyle = (color: string): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: color,
    border:
      color === "#F8FAFC" || mode !== "dark"
        ? `1px solid ${c.dotRing}`
        : "none",
    boxShadow: "0 0 0 2px rgba(255,255,255,0.02)",
    flexShrink: 0,
  });

  return (
    <Flex
      vertical
      gap={8}
      data-tour="brand"
      style={{ width: "100%" }}
    >
      <Flex align="center" justify="space-between">
        <Text
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: c.label,
          }}
        >
          Brand kit
        </Text>
        <Switch
          checked={active && Boolean(brandKit)}
          disabled={!brandKit}
          onChange={setActive}
          size="small"
          aria-label="Use brand kit"
        />
      </Flex>

      <Card
        size="small"
        variant="borderless"
        style={{ width: "100%", background: "transparent", boxShadow: "none" }}
        styles={{ body: { padding: 0 } }}
      >
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={10} style={{ minWidth: 0, flex: 1 }}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: c.accentBg,
                border: `1px solid ${c.accentBorder}`,
                flexShrink: 0,
              }}
            >
              <BulbOutlined
                style={{
                  color: c.accent,
                  fontSize: 14,
                }}
              />
            </Flex>

            <Flex align="center" gap={6}>
              {parsedColors.slice(0, 3).map((color, index) => (
                <div key={`${color}-${index}`} style={colorDotStyle(color)} />
              ))}
            </Flex>

            {kits.length > 1 ? (
              <Select
                size="small"
                variant="borderless"
                value={brandKit?.id}
                options={kits.map((k) => ({ value: k.id, label: k.name }))}
                popupMatchSelectWidth={false}
                aria-label="Brand kit for this generation"
                style={{ minWidth: 0, flex: 1, fontWeight: 600 }}
                onChange={setPickedId}
              />
            ) : (
              <Text
                ellipsis
                style={{
                  color: c.title,
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 0,
                }}
              >
                {brandKit?.name ?? "No brand kit"}
              </Text>
            )}
          </Flex>

          {brandKit ? (
            // the star marks the organization's default, not whichever kit is selected
            (brandKit.isDefault ?? brandKit.default) && (
              <StarFilled
                aria-label="Organization default"
                style={{
                  color: c.accent,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              />
            )
          ) : (
            <Link href="/page/brand-kit" style={{ fontSize: 12, flexShrink: 0 }}>
              Set one up
            </Link>
          )}
        </Flex>

        {!brandKit ? null : active ? (
          <Flex vertical gap={12} style={{ marginTop: 12 }}>
            <Flex vertical gap={8}>
              <Text
                style={{
                  color: c.text2,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Colors
              </Text>

              <Flex align="center" gap={8} wrap="wrap">
                {parsedColors.map((color, index) => (
                  <div
                    key={`${color}-${index}`}
                    className="bk-form-dot"
                    style={{
                      ...colorDotStyle(color),
                      // the kit's colours unfold one by one when the switch turns on, within 260ms in total
                      animationDelay: `${Math.min(index * 30, 230)}ms`,
                    }}
                  />
                ))}
              </Flex>
            </Flex>
            {imageSlots !== undefined && kitImages.length > 0 && (
              <Flex vertical gap={8}>
                <Text style={{ color: c.text2, fontSize: 12, fontWeight: 500 }}>
                  Kit images sent as style references
                </Text>
                <Flex align="center" gap={8} wrap="wrap">
                  {kitImages.map((image) => {
                    const sent = refKeys.includes(image.key);
                    return (
                      <button
                        key={image.key}
                        type="button"
                        className="bk-form-ref"
                        aria-pressed={sent}
                        aria-label={`${sent ? "Stop sending" : "Send"} ${image.name}`}
                        title={image.isLogo ? `Logo: ${image.name}` : image.name}
                        disabled={!sent && refKeys.length >= room}
                        style={
                          // the theme's primary colour for the pressed and focus rings
                          { "--bk-form-primary": semantic.colorPrimary } as React.CSSProperties
                        }
                        onClick={() =>
                          setChosenRefs((keys) =>
                            keys.includes(image.key)
                              ? keys.filter((key) => key !== image.key)
                              : [...keys, image.key],
                          )
                        }
                      >
                        {/* a presigned storage URL: next/image cannot optimize it */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt="" />
                      </button>
                    );
                  })}
                </Flex>
                {room === 0 && (
                  <Text style={{ color: c.text2, fontSize: 12 }}>
                    No room left: remove one of your own reference images to
                    send kit images.
                  </Text>
                )}
              </Flex>
            )}
            <div
              style={{
                borderRadius: 12,
                border: `1px solid ${c.boxBorder}`,
                background: c.boxBg,
                padding: "10px 12px",
              }}
            >
              <Flex vertical gap={6}>
                <Flex align="center" gap={6}>
                  <BgColorsOutlined
                    style={{
                      color: c.text2,
                      fontSize: 12,
                    }}
                  />
                  <Text
                    style={{
                      color: c.boxText,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Brand Prompt
                  </Text>
                  {preview && (
                    <Text
                      className="bk-form-budget"
                      style={{
                        color: c.boxText,
                        fontSize: 12,
                        marginInlineStart: "auto",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {preview.usedChars} of {preview.brandKitBudget} characters
                    </Text>
                  )}
                </Flex>
                <Text
                  style={{
                    color: c.boxText,
                    fontSize: 12,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {preview?.text || "This kit has nothing to add yet."}
                </Text>
              </Flex>
            </div>

            {preview && preview.dropped.length > 0 && (
              <Text style={{ color: c.avoid, fontSize: 12 }}>
                Left out to fit this model: {preview.dropped.join(", ")}
              </Text>
            )}
          </Flex>
        ) : (
          <Flex
            align="center"
            justify="space-between"
            style={{
              marginTop: 12,
              minHeight: 40,
              maxHeight: 40,
              opacity: 0.7,
              overflow: 'hidden',
              background: c.boxBg,
              borderRadius: 8,
              border: `1px solid ${c.boxBorderIdle}`,
              padding: '0 12px',
              width: '100%',
            }}
          >
            <Text style={{ color: c.boxText, fontSize: 13, fontWeight: 500 }}>
              Turn on to keep this generation on brand
            </Text>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}