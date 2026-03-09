import React from "react";
import {
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  Button,
  Tooltip,
  Select,
  FormInstance,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

type ProjectMember = {
  userId: string;
  role: "ADMIN" | "USER" | "VIEWER";
  maxImages?: number;
  maxToken?: number;
};

type SearchTexts = { [key: number]: string };

interface ProjectFormProps {
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
  formatNumber: (num: string | number | undefined) => string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
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

  return (
    <Form
      form={form}
      layout="vertical"
      name="create_project_form"
      onFinish={onFinish}
    >
      {mode === "edit" && (
        <Form.Item
          label="ID"
          name="id"
          hidden
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      )}

      <Form.Item
        label={mode === "edit" ? "Team Name" : "Project Name"}
        name="name"
        rules={[{ required: true, message: "Please enter team name" }]}
      >
        <Input placeholder="Enter team name" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label={
              <span>
                จำนวน Image{" "}
                <span style={{ color: "#888", fontSize: "12px" }}>
                  (Max: {formatNumber(maxImage)})
                </span>
              </span>
            }
            name="accessImageAmount"
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
                maxImage === 0
                  ? "No image available"
                  : "Enter image amount"
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label={
              <span>
                จำนวน Token{" "}
                <span style={{ color: "#888", fontSize: "12px" }}>
                  (Max: {formatNumber(maxToken)})
                </span>
              </span>
            }
            name="accessTokenAmount"
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
                maxToken === 0
                  ? "No token available"
                  : "Enter token amount"
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} placeholder="Optional description" />
      </Form.Item>

      {/* Team Members Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span>Team Members</span>

        <Tooltip
          title={
            projectMembers.length >= maxMembers
              ? `Maximum ${maxMembers} members allowed`
              : ""
          }
        >
          <Button
            type="primary"
            size="small"
            icon={<PlusCircleOutlined />}
            disabled={projectMembers.length >= maxMembers}
            onClick={() =>
              setProjectMembers([
                ...projectMembers,
                { userId: "", role: "USER" },
              ])
            }
          >
            Add Member
          </Button>
        </Tooltip>
      </div>

      <Form.Item>
        {projectMembers.length > 0 && (
          <>
            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 8,
              }}
            >
              Team Members (
              {projectMembers.filter((m) => m.userId).length})
            </div>

            {projectMembers.map((member, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Select
                    showSearch
                    placeholder="Type to search users..."
                    value={member.userId || undefined}
                    filterOption={false}
                    onSearch={(text) =>
                      setSearchTexts((prev) => ({
                        ...prev,
                        [index]: text,
                      }))
                    }
                    onChange={(userId: string) => {
                      if (
                        userId &&
                        !projectMembers.find(
                          (m, i) =>
                            m.userId === userId && i !== index,
                        )
                      ) {
                        const newMembers = [...projectMembers];
                        newMembers[index].userId = userId;
                        setProjectMembers(newMembers);
                      }
                    }}
                    options={
                      searchTexts[index]
                        ? organizationMembers
                            .filter(
                              (u) =>
                                !projectMembers.find(
                                  (m, i) =>
                                    m.userId === u.userId &&
                                    i !== index,
                                ) &&
                                u.fullname
                                  .toLowerCase()
                                  .includes(
                                    searchTexts[index].toLowerCase(),
                                  ),
                            )
                            .map((e) => ({
                              value: e.userId,
                              label: e.fullname,
                            }))
                        : []
                    }
                  />
                </Col>

                <Col span={4}>
                  <Select
                    value={member.role}
                    onChange={(role) => {
                      const newMembers = [...projectMembers];
                      newMembers[index].role = role;
                      setProjectMembers(newMembers);
                    }}
                    options={[
                      { value: "ADMIN", label: "Admin" },
                      { value: "USER", label: "User" },
                      { value: "VIEWER", label: "Viewer" },
                    ]}
                  />
                </Col>

                <Col span={4}>
                  <InputNumber
                    min={0}
                    value={member.maxImages}
                    placeholder="Image"
                    style={{ width: "100%" }}
                    onChange={(val) => {
                      const newMembers = [...projectMembers];
                      newMembers[index].maxImages = val || 0;
                      setProjectMembers(newMembers);
                    }}
                  />
                </Col>

                <Col span={4}>
                  <InputNumber
                    min={0}
                    value={member.maxToken}
                    placeholder="Token"
                    style={{ width: "100%" }}
                    onChange={(val) => {
                      const newMembers = [...projectMembers];
                      newMembers[index].maxToken = val || 0;
                      setProjectMembers(newMembers);
                    }}
                  />
                </Col>

                <Col span={4}>
                  <Button
                    danger
                    type="text"
                    onClick={() => {
                      setProjectMembers(
                        projectMembers.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
          </>
        )}
      </Form.Item>

      <Button loading={loading} type="primary" htmlType="submit">
        {mode === "edit" ? "Edit Team" : "Create Team"}
      </Button>
    </Form>
  );
};

export default ProjectForm;