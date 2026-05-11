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
import {
  ICreditBalance,
  IOrganizationSubscription,
} from "@/app/common/organization.type";
import { IProject } from "@/app/common/project.type";

type ProjectMember = {
  userId: string;
  role: "ADMIN" | "USER" | "VIEWER";
  limitCreditAllowance?: number;
};

interface ProjectFormProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  form: FormInstance;
  organization: any;
  selectedProject?: IProject | undefined;
  projectMembers: ProjectMember[];
  setProjectMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  organizationMembers: any[];
  loading: boolean;
  onFinish: (values: any) => void;
  maxMembers: number;
  mode: "create" | "edit";
  formatNumber: (num: string | number | undefined) => React.ReactNode;
  organizationSubscription: IOrganizationSubscription | undefined;
  creditBalance: ICreditBalance | undefined;
  assignedCredit: number;
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
  organizationMembers,
  loading,
  onFinish,
  maxMembers,
  mode,
  formatNumber,
  organizationSubscription,
  creditBalance,
  assignedCredit,
}) => {
  const { mode: themeMode } = useThemeMode();
  const { isMobile } = useResponsive();
  const semantic = getThemeConfig(themeMode).token ?? {};
  const [activeEditTab, setActiveEditTab] = useState<"settings" | "members">(
    "settings",
  );
  const [hoveredEditTab, setHoveredEditTab] = useState<
    "settings" | "members" | null
  >(null);
  const [hoveredMemberIndex, setHoveredMemberIndex] = useState<number | null>(
    null,
  );
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");
  const [creditAllowance, setCreditAllowance] = useState<number>(0);
  const maxCredit =
    mode === "edit"
      ? (organizationSubscription?.creditAllowance || 0) +
        (selectedProject?.limitCreditAllowance || 0) +
        (creditBalance?.onTopBalance || 0) -
        assignedCredit
      : (organizationSubscription?.creditAllowance || 0) +
        (creditBalance?.onTopBalance || 0);
  // const maxImage =
  //   mode === "edit"
  //     ? (organization?.remainImageAmount || 0) +
  //       (selectedProject?.accessImageAmount || 0)
  //     : organization?.remainImageAmount || 0;

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
      transition:
        "background-color 180ms ease, color 180ms ease, transform 140ms ease",
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
        limitCreditAllowance: 0,
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

      <Form.Item
        label="Description"
        name="description"
        style={{ marginBottom: 12 }}
      >
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
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Credit Generataions{" "}
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Max: {formatNumber(maxCredit)}
                  </Typography.Text>
                </span>
              }
              name="limitCreditAllowance"
              style={{ marginBottom: 12 }}
              rules={[
                { required: true, message: "Please enter image amount" },
                {
                  type: "number",
                  max: maxCredit,
                  message: `Cannot exceed available credit (${formatNumber(maxCredit)})`,
                },
              ]}
            >
              <InputNumber
                // onChange={(value) => {
                //   setCreditAllowance(value || 0);
                // }}
                min={0}
                style={{ width: "100%" }}
                placeholder={
                  maxCredit === 0
                    ? "No credit available"
                    : "Enter credit amount"
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
            Note: These limits can be adjusted later. Users will need approval
            from administrators to exceed these limits.
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

      <div
        style={{ width: "100%", display: "flex", gap: 8, alignItems: "center" }}
      >
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
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12 }}
            ></Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Max Credit : {creditAllowance}
            </Typography.Text>
          </div>
        }
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
            <TeamOutlined
              style={{ fontSize: 22, color: semantic.colorTextSecondary }}
            />
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
                  <UserOutlined
                    style={{ color: semantic.colorTextSecondary, marginTop: 2 }}
                  />
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <Typography.Text
                    strong
                    style={{ color: semantic.colorTextBase }}
                  >
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
                  <Typography.Text
                    type="secondary"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    Credit
                  </Typography.Text>
                  <InputNumber
                    min={0}
                    defaultValue={0}
                    size="small"
                    placeholder="user credit"
                    value={member?.limitCreditAllowance}
                    onChange={(value) => {
                      const newCredit = Number(value) || 0;
                      if (!isNaN(newCredit) && newCredit >= 0) {
                        setProjectMembers(
                          projectMembers.map((m, i) =>
                            i === index
                              ? { ...m, limitCreditAllowance: newCredit }
                              : m,
                          ),
                        );
                      }
                    }}
                  />
                </Col>
                <Col flex="none">
                  <Typography.Text
                    type="secondary"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    Role
                  </Typography.Text>
                  <div></div>
                  <Select
                    // styles={{ width: "100%" }}
                    size="small"
                    value={member.role}
                    style={{ width: "100px" }}
                    options={[
                      { value: "OWNER", label: "Owner" },
                      { value: "ADMIN", label: "Admin" },
                      { value: "USER", label: "User" },
                    ]}
                    onChange={(e) => {
                      setProjectMembers(
                        projectMembers.map((m, i) =>
                          i === index ? { ...m, role: e } : m,
                        ),
                      );
                    }}
                  />
                </Col>

                <Col flex="none">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setProjectMembers(
                        projectMembers.filter((_, i) => i !== index),
                      );
                    }}
                  />
                </Col>
              </Row>
            </Card>
          ))
        )}
      </Card>

      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Team members will have access to this project and share generation
        limits.
      </Typography.Text>
    </Space>
  );

  return (
    <Modal
      title={
        <Space direction="vertical" size={0}>
          <Typography.Title
            level={3}
            style={{
              display: "block",
              color: semantic.colorTextBase,
              marginBottom: 0,
            }}
          >
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
      destroyOnHidden
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
                onClick={() => {
                  setCreditAllowance(
                    form.getFieldValue("limitCreditAllowance") || 0,
                  );
                  setActiveEditTab("members");
                }}
              >
                Members
              </Button>
            </div>
            <div hidden={activeEditTab === "members"}>
              {renderSettings()}
            </div>
            <div hidden={activeEditTab === "settings"}>
              {renderMembers()}
            </div>
          </Space>
        ) : (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {renderSettings()}
          </Space>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            size="large"
          >
            {mode === "edit" ? "Save Change" : "Create Project"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectFormModal;
