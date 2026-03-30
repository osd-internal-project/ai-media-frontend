import React from "react";
import { Card, Flex, Typography, Switch } from "antd";
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
};

export default function BrandKitSection({
  semantic,
  children,
  style,
}: Props) {
  const [active, setActive] = React.useState(true);
  const colors = ["#6F6ADE", "#26D9B8", "#0F172A", "#B7B6F8", "#F8FAFC", "#8D93A6"];

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
              <div style={colorDotStyle("#6F6ADE")} />
              <div style={colorDotStyle("#26D9B8")} />
              <div style={colorDotStyle("#0F172A")} />
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
              AI Cave — Main Brand
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
                {colors.map((color) => (
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
                  {`Brand colors: deep purple (#6F6ADE)
and teal (#0FEAB6) gradient
accents, sleek dark background.`}
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
              × Avoid: cluttered, low quality, vintage, retro, oversaturated
              visuals
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