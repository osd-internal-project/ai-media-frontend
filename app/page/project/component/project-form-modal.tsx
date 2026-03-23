import React, { useState, type CSSProperties } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  Button,
  Tooltip,
  Select,
  Space,
  Typography,
  Tag,
  FormInstance,
  Modal,
} from "antd";
import {
  CloseOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";

type ProjectMember = {
  userId: string;
  role: "ADMIN" | "USER" | "VIEWER";
  maxImages?: number;
  maxToken?: number;
};

type SearchTexts = { [key: number]: string };

interface ProjectFormProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  form: FormInstance;
  organization: any;
  selectedProject?: any;
  projectMembers: ProjectMember[];
  setProjectMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  searchTexts: SearchTexts;
  setSearchTexts: React.Dispatch<React.SetStateAction<SearchTexts>>;
  organizationMembers: any[];
  loading: boolean;
  onFinish: (values: any) => void;
  maxMembers: number;
  mode: "create" | "edit";
  formatNumber: (num: string | number | undefined) =>  React.ReactNode ;
}

const ProjectFormModal: React.FC<ProjectFormProps> = ({
  open,
  title,
  onCancel,
  form,
  organization,
  selectedProject,
  projectMembers,
  setProjectMembers,
  searchTexts,
  setSearchTexts,
  organizationMembers,
  loading,
  onFinish,
  maxMembers,
  mode,
  formatNumber,
}) => {
  const { mode: themeMode } = useThemeMode();
  const { isMobile } = useResponsive();
  const semantic = getThemeConfig(themeMode).token ?? {};
  const [activeEditTab, setActiveEditTab] = useState<"settings" | "members">(
    "settings",
  );
  const [hoveredEditTab, setHoveredEditTab] = useState<"settings" | "members" | null>(null);
  const [hoveredMemberIndex, setHoveredMemberIndex] = useState<number | null>(null);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");

  const maxImage =
    mode === "edit"
      ? (organization?.remainImageAmount || 0) +
        (selectedProject?.accessImageAmount || 0)
      : organization?.remainImageAmount || 0;

  const maxToken =
    mode === "edit"
      ? (organization?.remainTokenAmount || 0) +
        (selectedProject?.accessTokenAmount || 0)
      : organization?.remainTokenAmount || 0;

  const modalSubtitle =
    mode === "edit"
      ? "Manage project settings, limits, and team members"
      : "Set up a new project with custom generation limits";

  const memberCount = projectMembers.filter((m) => m.userId).length;

  const editTabContainerStyle: CSSProperties = {
    width: "100%",
    background: semantic.colorBgTextActive,
    border: `1px solid ${semantic.colorBorder}`,
    borderRadius: 999,
    padding: 3,
    display: "flex",
    gap: 4,
  };

  const getEditTabButtonStyle = (
    tab: "settings" | "members",
  ): CSSProperties => {
    const isActive = activeEditTab === tab;
    const isHovered = hoveredEditTab === tab;
    return {
      flex: 1,
      borderRadius: 999,
      border: "none",
      height: 36,
      background:
        themeMode === "light"
          ? isActive
            ? semantic.colorBgContainer
            : isHovered
              ? semantic.colorFillAlter
            : "transparent"
          : isActive
            ? semantic.colorBgTextActive
            : isHovered
              ? semantic.colorBgElevated
            : "transparent",
      color:
        themeMode === "light"
          ? isActive || isHovered
            ? semantic.colorTextBase
            : semantic.colorTextSecondary
          : isActive
            ? "#ffffff"
            : isHovered
              ? semantic.colorTextBase
            : semantic.colorTextSecondary,
      fontWeight: 500,
      boxShadow: "none",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      transition: "background-color 180ms ease, color 180ms ease, transform 140ms ease",
    };
  };

  const getMemberUser = (userId: string) => {
    return organizationMembers.find((u) => u.userId === userId);
  };

  const availableUsers = organizationMembers.filter(
    (u) => !projectMembers.some((m) => m.userId === u.userId),
  );

  const handleAddMemberFromSelect = () => {
    if (!selectedUserToAdd) return;
    if (projectMembers.find((m) => m.userId === selectedUserToAdd)) return;

    setProjectMembers([
      ...projectMembers,
      {
        userId: selectedUserToAdd,
        role: "USER",
        maxImages: 0,
        maxToken: 0,
      },
    ]);
    setSelectedUserToAdd("");
  };

  const renderSettings = () => (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>


      <Form.Item
        label="Project Name"
        name="name"
        style={{ marginBottom: 12 }}
        rules={[{ required: true, message: "Please enter project name" }]}
      >
        <Input placeholder="Enter project name" />
      </Form.Item>

      <Form.Item label="Description" name="description" style={{ marginBottom: 12 }}>
        <Input.TextArea rows={3} placeholder="Enter project description" />
      </Form.Item>

      <Card
        size="small"
        style={{
          borderColor: semantic.colorBorder,
          background: semantic.colorFillAlter,
          borderRadius: 12,
        }}
        styles={{ body: { padding: isMobile ? 12 : 16 } }}
      >
        <Typography.Text
          strong
          style={{
            display: "block",
            marginBottom: 10,
            color: semantic.colorTextBase,
          }}
        >
          Generation Limits
        </Typography.Text>

        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item
              label={
                <span>
                  Image Limit {" "}
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Max: {formatNumber(maxImage)}
                  </Typography.Text>
                </span>
              }
              name="accessImageAmount"
              style={{ marginBottom: 12 }}
              rules={[
                { required: true, message: "Please enter image amount" },
                {
                  type: "number",
                  max: maxImage,
                  message: `Cannot exceed available image (${formatNumber(maxImage)})`,
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder={
                  maxImage === 0 ? "No image available" : "Enter image amount"
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Video Limit"
              name="videoLimit"
              style={{ marginBottom: 12 }}
              tooltip="Video limit is UI-only currently. Backend does not persist this field yet."
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Video limit"
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label={
                <span>
                  Token Limit {" "}
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Max: {formatNumber(maxToken)}
                  </Typography.Text>
                </span>
              }
              name="accessTokenAmount"
              style={{ marginBottom: 12 }}
              rules={[
                { required: true, message: "Please enter token amount" },
                {
                  type: "number",
                  max: maxToken,
                  message: `Cannot exceed available token (${formatNumber(maxToken)})`,
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder={
                  maxToken === 0 ? "No token available" : "Enter token amount"
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {mode === "create" && (
        <Card
          size="small"
          style={{
            borderColor: semantic.colorBorder,
            background: semantic.colorBgContainer,
            borderRadius: 10,
          }}
          styles={{ body: { padding: "10px 12px" } }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Note: These limits can be adjusted later. Users will need approval from administrators to exceed these limits.
          </Typography.Text>
        </Card>
      )}
    </Space>
  );

  const renderMembers = () => (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {/* <Typography.Text strong style={{ color: semantic.colorTextBase }}>
          Team Members ({memberCount})
        </Typography.Text> */}
      </div>

      <div style={{ width: "100%", display: "flex", gap: 8, alignItems: "center" }}>
        <Select
          showSearch
          style={{
            flex: 1,
            minWidth: 0,
          }}
          placeholder="Select a user to add"
          value={selectedUserToAdd || undefined}
          optionFilterProp="label"
          onChange={(value) => setSelectedUserToAdd(value)}
          options={availableUsers.map((u) => ({
            value: u.userId,
            label: `${u.fullname}${u.email ? ` (${u.email})` : ""}`,
          }))}
        />
        <Tooltip
          title={
            projectMembers.length >= maxMembers
              ? `Maximum ${maxMembers} members allowed`
              : ""
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ flexShrink: 0 }}
            disabled={
              projectMembers.length >= maxMembers ||
              !selectedUserToAdd ||
              availableUsers.length === 0
            }
            onClick={handleAddMemberFromSelect}
          >
            Add
          </Button>
        </Tooltip>
      </div>

      <Card
        size="small"
        bodyStyle={{ padding: isMobile ? 8 : 10 }}
        style={{
          borderColor: semantic.colorBorder,
          borderRadius: 12,
          background: semantic.colorBgContainer,
           minHeight: 300,
        }}
      >
        {projectMembers.length === 0 ? (
          <div
            style={{
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <TeamOutlined style={{ fontSize: 22, color: semantic.colorTextSecondary }} />
            <Typography.Text type="secondary">No members yet</Typography.Text>
          </div>
        ) : (
          projectMembers.map((member, index) => (
            <Card
              key={index}
              size="small"
              onMouseEnter={() => setHoveredMemberIndex(index)}
              onMouseLeave={() => setHoveredMemberIndex(null)}
              style={{
                marginBottom: 8,
                borderColor:
                  hoveredMemberIndex === index
                    ? semantic.colorPrimaryBorder
                    : semantic.colorBorderSecondary,
                borderRadius: 10,
                background:
                  hoveredMemberIndex === index
                    ? semantic.colorBgContainer
                    : semantic.colorFillAlter,
                transition: "all 180ms ease",
               
              }}
              styles={{ body: { padding: isMobile ? 10 : 12 } }}
            >
              <Row gutter={8} align="middle" wrap={false}>
                <Col flex="none">
                  <UserOutlined style={{ color: semantic.colorTextSecondary, marginTop: 2 }} />
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <Typography.Text strong style={{ color: semantic.colorTextBase }}>
                    {getMemberUser(member.userId)?.fullname || "Unknown user"}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    {getMemberUser(member.userId)?.email || member.userId}
                  </Typography.Text>
                </Col>

                <Col flex="none">
                  <Tag
                    style={{
                      color: semantic.colorPrimary,
                      borderRadius: 999,
                      padding: "0 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                      marginInlineEnd: 0,
                    }}
                  >
                    {member.role.toLowerCase()}
                  </Tag>
                </Col>

                <Col flex="none">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setProjectMembers(projectMembers.filter((_, i) => i !== index));
                    }}
                  />
                </Col>
              </Row>
            </Card>
          ))
        )}
      </Card>

      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Team members will have access to this project and share generation limits.
      </Typography.Text>
    </Space>
  );

  return (
    <Modal
      title={
        <Space direction="vertical" size={0}>
          <Typography.Title level={3} style={{ display: "block", color: semantic.colorTextBase, marginBottom: 0 }}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {modalSubtitle}
          </Typography.Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? "90%" : 660}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="create_project_form"
        onFinish={onFinish}
        initialValues={{ videoLimit: 50 }}
      >
        {mode === "edit" && (
          <Form.Item label="ID" name="id" hidden rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        )}

        {mode === "edit" ? (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div style={editTabContainerStyle}>
              <Button
                type="text"
                icon={<SettingOutlined />}
                style={getEditTabButtonStyle("settings")}
                onMouseEnter={() => setHoveredEditTab("settings")}
                onMouseLeave={() => setHoveredEditTab(null)}
                onClick={() => setActiveEditTab("settings")}
              >
                Settings
              </Button>
              <Button
                type="text"
                icon={<TeamOutlined />}
                style={getEditTabButtonStyle("members")}
                onMouseEnter={() => setHoveredEditTab("members")}
                onMouseLeave={() => setHoveredEditTab(null)}
                onClick={() => setActiveEditTab("members")}
              >
                Members
              </Button>
            </div>

            {activeEditTab === "settings" ? renderSettings() : renderMembers()}
          </Space>
        ) : (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {renderSettings()}
          </Space>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button loading={loading} type="primary" htmlType="submit" size="large">
            {mode === "edit" ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectFormModal;