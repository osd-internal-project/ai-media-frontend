import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Space,
  Card,
  Modal,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import useResponsive from "@/app/hooks/useResponsive";
import LogoModal, { type LogoModalValues } from "./logo-modal";

const { Title, Text } = Typography;

interface LogoItem {
  id: string;
  name: string;
  type: string;
  image: string;
}

interface LogoTabProps {
  logos: LogoItem[];
  onAddLogo?: () => void;
  onEditLogo?: (logo: LogoItem) => void;
  onDeleteLogo?: (id: string) => void;
  logoModalOpen?: boolean;
  logoModalMode?: "create" | "edit";
  logoModalLoading?: boolean;
  logoModalInitialValues?: Partial<LogoModalValues>;
  onCloseLogoModal?: () => void;
  onSubmitLogoModal?: (values: LogoModalValues) => Promise<void> | void;
  emptyState?: boolean;
}

const LogoTab: React.FC<LogoTabProps> = ({
  logos,
  onAddLogo,
  onEditLogo,
  onDeleteLogo,
  logoModalOpen,
  logoModalMode,
  logoModalLoading,
  logoModalInitialValues,
  onCloseLogoModal,
  onSubmitLogoModal,
  emptyState,
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDeleteLogo = (id: string) => {
    setDeleteTarget(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget && onDeleteLogo) {
      onDeleteLogo(deleteTarget);
    }

    setDeleteTarget(null);
    setDeleteModalVisible(false);
  };

  const logoModalNode = (
    <LogoModal
      open={Boolean(logoModalOpen)}
      mode={logoModalMode || "create"}
      confirmLoading={logoModalLoading}
      initialValues={logoModalInitialValues}
      onSubmit={async (values) => {
        await onSubmitLogoModal?.(values);
      }}
      onCancel={() => {
        onCloseLogoModal?.();
      }}
    />
  );

  if (emptyState) {
    return (
      <div className="logo-tab-shell">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <span />
          <Button
            className="logo-tab-action"
            type="default"
            size={isMobile ? "small" : "middle"}
            icon={<PlusOutlined />}
            onClick={onAddLogo}
          >
            {isMobile ? "Add" : "Add Logo"}
          </Button>
        </Row>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 240,
            color: semantic.colorTextSecondary,
            gap: 12,
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.25 }}>🖼️</div>
          <div style={{ fontSize: isMobile ? 16 : 18 }}>
            No logos uploaded yet
          </div>
          <div
            style={{
              fontSize: isMobile ? 13 : 14,
              color: semantic.colorTextSecondary,
            }}
          >
            Add your first brand logo to get started.
          </div>
        </div>
        {logoModalNode}
      </div>
    );
  }

  return (
    <div className="logo-tab-shell">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Text style={{ color: mode === "dark" ? "#94a3b8" : semantic.colorTextSecondary, fontSize: isMobile ? 12 : 13 }}>
          {logos.length} logo assets configured
        </Text>

        <Button
          className="logo-tab-action"
          type="default"
          size={isMobile ? "small" : "middle"}
          icon={<PlusOutlined />}
          onClick={onAddLogo}
        >
          {isMobile ? "Add" : "Add Logo"}
        </Button>
      </Row>

      <div
        className="logo-list-scroll"
        style={{
          maxHeight: isMobile ? "unset" : 720,
          overflowX: "hidden",
          overflowY: isMobile ? "visible" : "auto",
          paddingRight: isMobile ? 0 : 4,
        }}
      >
        <Row
          gutter={[16, 16]}
          style={{ marginLeft: 0, marginRight: 0 }}
        >
          {logos.map((logo) => (
            <Col
              key={logo.id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
            >
              <Card
                className="logo-card-anim logo-card-hover-group"
                styles={{
                  body: {
                    padding: 0,
                    overflow: "hidden",
                  },
                }}
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  background: semantic.colorBgContainer,
                  border: `1px solid ${semantic.colorBorder}`,
                  position: "relative",
                }}
                onMouseEnter={() => setHoveredId(logo.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image Area */}
                <div
                  style={{
                    position: "relative",
                    height: isMobile ? 220 : isTablet ? 280 : 320,
                    overflow: "hidden",
                    background: "#111827",
                  }}
                >
                  <img
                    src={logo.image}
                    alt={logo.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* Dark Gradient */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.45) 35%, rgba(3,7,18,0.1) 100%)",
                    }}
                  />

                  {/* Floating Actions */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      opacity:
                        isMobile || isTablet || hoveredId === logo.id ? 1 : 0,
                      pointerEvents:
                        isMobile || isTablet || hoveredId === logo.id
                          ? "auto"
                          : "none",
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <Button
                      className="logo-tab-action"
                      type="text"
                      icon={
                        <EditOutlined
                          style={{ fontSize: isMobile ? 14 : 16 }}
                        />
                      }
                      style={{
                        width: isMobile ? 34 : 38,
                        height: isMobile ? 34 : 38,
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.65)",
                        backdropFilter: "blur(10px)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onClick={() => onEditLogo?.(logo)}
                    />

                    <Button
                      className="logo-tab-action"
                      type="text"
                      danger
                      icon={
                        <DeleteOutlined
                          style={{ fontSize: isMobile ? 14 : 16 }}
                        />
                      }
                      style={{
                        width: isMobile ? 34 : 38,
                        height: isMobile ? 34 : 38,
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.65)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onClick={() => handleDeleteLogo(logo.id)}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: isMobile ? 12 : 16,
                    background:
                      mode === "dark"
                        ? "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,1) 100%)"
                        : semantic.colorBgContainer,
                  }}
                >
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      color: semantic.colorTextBase,
                      fontSize: isMobile ? 14 : 16,
                    }}
                  >
                    {logo.name}
                  </Title>

                  <Tag
                    style={{
                      margin: 0,
                      borderRadius: 999,
                      fontSize: 11,
                      padding: "2px 10px",
                      background:
                        mode === "dark"
                          ? "rgba(99,102,241,0.12)"
                          : "rgba(79,70,229,0.08)",
                      border: `1px solid ${
                        mode === "dark"
                          ? "rgba(99,102,241,0.25)"
                          : "rgba(79,70,229,0.18)"
                      }`,
                      color:
                        mode === "dark"
                          ? "#c4b5fd"
                          : semantic.colorPrimary,
                    }}
                  >
                    {logo.type}
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal
        open={deleteModalVisible}
        title={
          deleteTarget
            ? `Delete logo "${
                logos.find((l) => l.id === deleteTarget)?.name || ""
              }"?`
            : ""
        }
        onOk={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteTarget(null);
        }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        destroyOnHidden
      >
        Are you sure you want to delete this logo? This action cannot be undone.
      </Modal>

      {logoModalNode}
    </div>
  );
};

export default LogoTab;