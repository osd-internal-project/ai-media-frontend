import React, { useEffect, useState } from "react";
import BrandKitServices from "@/app/services/brand-kit.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { Card, Flex, Typography, Switch } from "antd";
import { useSession } from "next-auth/react";
import {
  BgColorsOutlined,
  BulbOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Text } = Typography;

type Props = {
  semantic: Record<string, any>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onCiPromptChange?: (ciPrompt: string) => void;
  onActiveChange?: (active: boolean) => void;
};

export default function BrandKitSection({
  semantic,
  children,
  style,
  onCiPromptChange,
  onActiveChange,
}: Props) {
  const { data: session } = useSession();
  const [active, setActive] = React.useState(false);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [parsedColors, setParsedColors] = useState<string[]>([]);
  const [parsedFonts, setParsedFonts] = useState<{ name: string; weight: number; type: string }[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (!active) {
      setBrandKit(null);
      setParsedColors([]);
      setParsedFonts([]);
      if (typeof onCiPromptChange === 'function') onCiPromptChange("");
      return;
    }

    const brandKitService = BrandKitServices(axiosCore);
    const organizationId = session?.user?.organizationId;

    const loadBrandKit = async () => {
      try {
        let kit: any = null;

        if (organizationId) {
          kit = await brandKitService.getDefaultByOrganizationId(organizationId);
        }

        if (!kit) {
          const data = await brandKitService.findAll();
          if (Array.isArray(data) && data.length > 0) {
            kit = data[0];
          }
        }

        if (!kit) {
          if (!cancelled) {
            setBrandKit(null);
            setParsedColors([]);
            setParsedFonts([]);
            if (typeof onCiPromptChange === 'function') onCiPromptChange("");
          }
          return;
        }

        if (!cancelled) {
          setBrandKit(kit);
        }

        // Parse colors from brandCiPrompt
        let colors: string[] = [];
        let fonts: { name: string; weight: number; type: string }[] = [];
        let ciPrompt = "";
        if (typeof kit.brandCiPrompt === 'string') {
          ciPrompt = kit.brandCiPrompt;
          // Parse colors
          if (kit.brandCiPrompt.includes('Brand colors:')) {
            const colorSection = kit.brandCiPrompt.split('Brand colors:')[1]?.split('Fonts:')[0] || '';
            const hexMatches = [...colorSection.matchAll(/#([0-9a-fA-F]{3,8})/g)];
            colors = hexMatches.map(m => '#' + m[1]);
          }
          // Parse fonts
          if (kit.brandCiPrompt.includes('Fonts:')) {
            const fontSection = kit.brandCiPrompt.split('Fonts:')[1] || '';
            const fontMatches = [...fontSection.matchAll(/([^,\n]+)\s*\(([^)]*)\)/g)];
            fontMatches.forEach((m) => {
              let type = 'body', weight = 400;
              if (m[2]) {
                const typeMatch = m[2].match(/(heading\d?|body|caption|paragraph)/i);
                if (typeMatch) type = typeMatch[1].toLowerCase();
                const weightMatch = m[2].match(/weight\s*(\d+)/i);
                if (weightMatch) weight = Number(weightMatch[1]);
              }
              fonts.push({ name: m[1].trim(), type, weight });
            });
          }
        }

        if (!cancelled) {
          setParsedColors(colors);
          setParsedFonts(fonts);
          if (active && typeof onCiPromptChange === 'function') onCiPromptChange(ciPrompt);
        }
      } catch {
        if (!cancelled) {
          setBrandKit(null);
          setParsedColors([]);
          setParsedFonts([]);
          if (typeof onCiPromptChange === 'function') onCiPromptChange("");
        }
      }
    };

    loadBrandKit();

    return () => {
      cancelled = true;
    };
  }, [active, session?.user?.organizationId]);

  // Notify parent when active changes
  useEffect(() => {
    if (typeof onActiveChange === 'function') onActiveChange(active);
  }, [active]);

  const colorDotStyle = (color: string): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: color,
    border:
      color === "#F8FAFC"
        ? "1px solid rgba(255,255,255,0.14)"
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
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: "#8B93A7",
            textTransform: "uppercase",
          }}
        >
          BRAND KIT
        </Text>
        <Switch checked={active} onChange={setActive} size="small" />
      </Flex>

      <Card
        size="small"
        style={{
          width: "100%",
          borderRadius: 16,
          marginTop: 4,
        }}
        bodyStyle={{
          padding: 12,
        }}
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
                background: "rgba(111, 106, 222, 0.12)",
                border: "1px solid rgba(111, 106, 222, 0.24)",
                flexShrink: 0,
              }}
            >
              <BulbOutlined
                style={{
                  color: "#8B7CFF",
                  fontSize: 14,
                }}
              />
            </Flex>

            <Flex align="center" gap={6}>
              {parsedColors.slice(0, 3).map((color) => (
                <div key={color} style={colorDotStyle(color)} />
              ))}
            </Flex>

            <Text
              ellipsis
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                minWidth: 0,
              }}
            >
              {brandKit?.name || 'AI Cave — Main Brand'}
            </Text>
          </Flex>

          <StarFilled
            style={{
              color: "#8B7CFF",
              fontSize: 14,
              flexShrink: 0,
            }}
          />
        </Flex>

        {active ? (
          <Flex vertical gap={12} style={{ marginTop: 12 }}>
            <Flex vertical gap={8}>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Colors
              </Text>

              <Flex align="center" gap={8} wrap="wrap">
                {parsedColors.map((color) => (
                  <div key={color} style={colorDotStyle(color)} />
                ))}
              </Flex>
            </Flex>
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(111, 106, 222, 0.28)",
                background: "rgba(38, 45, 68, 0.72)",
                padding: "10px 12px",
              }}
            >
              <Flex vertical gap={6}>
                <Flex align="center" gap={6}>
                  <BgColorsOutlined
                    style={{
                      color: "#9CA3AF",
                      fontSize: 11,
                    }}
                  />
                  <Text
                    style={{
                      color: "#B6BED1",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    CI Prompt (injected)
                  </Text>
                </Flex>
                <Text
                  style={{
                    color: "#7E7BFF",
                    fontSize: 11,
                    lineHeight: 1.6,
                    fontFamily:
                      "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    whiteSpace: "pre-line",
                  }}
                >
                  {brandKit?.brandCiPrompt || ''}
                </Text>
              </Flex>
            </div>

            <Text
              ellipsis
              style={{
                color: "#A1A1AA",
                fontSize: 11,
              }}
            >
              × Avoid: {brandKit?.negativePrompt || 'cluttered, low quality, vintage, retro, oversaturated visuals'}
            </Text>
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
              background: 'rgba(38, 45, 68, 0.72)',
              borderRadius: 8,
              border: '1px solid rgba(111, 106, 222, 0.18)',
              padding: '0 12px',
              width: '100%',
            }}
          >
            <Text style={{ color: '#B6BED1', fontSize: 13, fontWeight: 500 }}>
              Enable to inject brand CI into every generation
            </Text>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}