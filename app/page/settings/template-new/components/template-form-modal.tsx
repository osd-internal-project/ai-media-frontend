import type {
  TGenerateType,
  TPromptGuideType,
} from "@/app/common/prompt-guide.type";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tabs,
  Typography,
  message,
  Flex,
} from "antd";
import React, {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";
import TemplateItem from "./template-item";
import { Image } from "lucide-react";
import { TMasterModelType } from "@/app/common/master-model-type.type";
type TemplateFormModalProps = {
  formMode: "create" | "edit";
  allModel: TMasterModelType[];
  open: boolean;
  isMobile: boolean;
  promptGuideTypes: TPromptGuideType[];
  initialValues?: Partial<
    FormValues & { id: number; status: boolean; generateType: string }
  >;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onDelete?: () => void;
  extraContent?: ReactNode;
};

type FormValues = {
  id?: number;
  title: string;
  description?: string;
  textPrompt: string;
  generateType?: TGenerateType;
  promptGuideTypeId?: number;
  model?: string;
  status?: boolean;
};

const VARIABLE_REGEX = /\[([^\]\r\n]+)\]/g;
const SUGGESTED_VARIABLES = [
  "product",
  "style",
  "background",
  "color",
  "brand",
  "mood",
];

const extractPromptVariables = (prompt: string) => {
  if (!prompt) return [];
  const matches = Array.from(prompt.matchAll(VARIABLE_REGEX));
  const unique = new Set<string>();

  for (const match of matches) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;
    if (raw.length > 40) continue;
    if (/^[\[\]]+$/.test(raw)) continue;
    unique.add(raw);
  }

  return Array.from(unique);
};

const normalizeGenerateType = (
  value?: string,
): TGenerateType => {
  if (value === "dream-actor") return "dreamactor";
  if (value === "image" || value === "video" || value === "omnihumen" || value === "dreamactor") {
    return value;
  }
  return "image";
};

const TYPE_META: Record<
  TGenerateType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  image: { label: "Image Gen", icon: <PictureOutlined />, color: "#1677ff" },
  video: {
    label: "Video Gen",
    icon: <VideoCameraOutlined />,
    color: "#722ed1",
  },
  omnihumen: { label: "OmniHuman", icon: <UserOutlined />, color: "#389e0d" },
  dreamactor: { label: "DreamActor", icon: <TeamOutlined />, color: "#d46b08" },
};

const TemplateFormModal: FC<TemplateFormModalProps> = ({
  formMode,
  allModel,
  open,
  isMobile,
  promptGuideTypes,
  initialValues,
  onCancel,
  onSubmit,
  onDelete,
  extraContent,
}) => {
  const { mode: themeMode } = useThemeMode();
  const semantic = getThemeConfig(themeMode).token ?? {};
  const { isTablet } = useResponsive();
  const [form] = Form.useForm<FormValues>();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const isCompact = isMobile || isTablet;
  const headerPadding = isMobile ? "12px 14px" : isTablet ? "14px 16px" : "16px 20px";
  const sectionPadding = isMobile ? 12 : isTablet ? 14 : 16;

  const selectedTypeId = Form.useWatch("promptGuideTypeId", form);
  const selectedGenerateType = Form.useWatch("generateType", form);
  const promptText = Form.useWatch("textPrompt", form) || "";
  const templateName = Form.useWatch("title", form) || "";
  const description = Form.useWatch("description", form) || "";
  const selectedModel = Form.useWatch("model", form) || "";

  const selectedType = useMemo(
    () => promptGuideTypes.find((type) => type.id === selectedTypeId),
    [promptGuideTypes, selectedTypeId],
  );

  const modelOptions = useMemo(() => {
    return allModel
      .filter(
        (item: TMasterModelType) => item.type === selectedType?.generateType,
      )
      .map((item: TMasterModelType) => ({
        label: item.modelType,
        value: item.modelType,
      }));
  }, [selectedType?.generateType]); 

  const categoryOptions = useMemo(() => {
    return promptGuideTypes.map((type) => ({
      label: type.title,
      value: type.id,
    }));
  }, [promptGuideTypes]);

  const variables = useMemo(() => {
    return extractPromptVariables(promptText);
  }, [promptText]);

  const initialSnapshot = useMemo(() => {
    return JSON.stringify({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      textPrompt: initialValues?.textPrompt || "",
      promptGuideTypeId: initialValues?.promptGuideTypeId,
      model: initialValues?.model || "",
    });
  }, [initialValues]);

  const currentSnapshot = JSON.stringify({
    title: templateName,
    description,
    textPrompt: promptText,
    promptGuideTypeId: selectedTypeId,
    model: selectedModel,
  });

  const isDirty = formMode === "edit" && initialSnapshot !== currentSnapshot;

  const isReady = Boolean(
    templateName.trim() && promptText.trim() && selectedType,
  );
  const currentGenerateType: TGenerateType =
    normalizeGenerateType(selectedGenerateType ?? selectedType?.generateType);
  const currentTypeMeta = TYPE_META[currentGenerateType] ?? TYPE_META.image;

  const handleReset = () => {
    const fallbackTypeId =
      initialValues?.promptGuideTypeId ??
      promptGuideTypes.find(
        (item) => item.generateType === initialValues?.generateType,
      )?.id ??
      promptGuideTypes[0]?.id;
    const fallbackType = promptGuideTypes.find(
      (item) => item.id === fallbackTypeId,
    ); 
    form.setFieldsValue({
      id: initialValues?.id,
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      textPrompt: initialValues?.textPrompt || "",
      status: initialValues?.status ?? true,
      generateType: normalizeGenerateType(
        fallbackType?.generateType || initialValues?.generateType,
      ),
      promptGuideTypeId: fallbackTypeId,
      model: initialValues?.model || "",
    });
    setActiveTab("edit");
  };

  useEffect(() => {
    if (open) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues, promptGuideTypes]);

  const handleGenerateTypeChange = (value: TGenerateType) => {
    // const firstType = promptGuideTypes.find(
    //   (item) => item.generateType === value,
    // );
    form.setFieldValue("generateType", value);
    // form.setFieldValue("promptGuideTypeId", firstType?.id);
    // form.setFieldValue("model", getModelsByType(value)[0]);
  };
  const handleTypeChange = (value: number) => {
    const type = promptGuideTypes.find((item) => item.id === value);
    if (type?.generateType) {
      form.setFieldValue("generateType", normalizeGenerateType(type.generateType));
    }
    form.setFieldValue("promptGuideTypeId", value);
    // form.setFieldValue("model", getModelsByType(type?.generateType)[0]);
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const type = promptGuideTypes.find(
        (item) => item.id === values.promptGuideTypeId,
      );
      if (!type) {
        message.error("Please select category");
        return;
      }
      onSubmit({
        ...(values.id ? { id: values.id } : {}),
        title: values.title?.trim(),
        textPrompt: values.textPrompt?.trim(),
        promptGuideTypeId: type.id,
        generateType: type.generateType,
        description: values.description,
        model: values.model,
        status: values.status ?? true,
      });

      if (formMode === "create") {
        handleReset();
        onCancel();
      }
    } catch {
      // Validation errors are already displayed by antd form.
    }
  };

  const appendVariableToken = (name: string) => {
    const token = `[${name}]`;
    const current = form.getFieldValue("textPrompt") || "";
    const needsSpace = current.length > 0 && !/\s$/.test(current);
    form.setFieldValue(
      "textPrompt",
      `${current}${needsSpace ? " " : ""}${token}`,
    );
  };

  const removeVariableToken = (name: string) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\[\\s*${escaped}\\s*\\]`, "g");
    const current = form.getFieldValue("textPrompt") || "";
    const cleaned = current
      .replace(pattern, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    form.setFieldValue("textPrompt", cleaned);
  };

  return (
    <Modal
      title={null}
      open={open}
      footer={null}
      onCancel={onCancel}
      forceRender
      width={isMobile ? "96%" : isTablet ? 760 : 900}
      styles={{
        body: {
          padding: 0,
          maxHeight: isMobile ? "86svh" : "80svh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        },
      }}
      afterOpenChange={(nextOpen) => {
        if (nextOpen) {
          handleReset();
        }
      }}
    >
      <Space
        align="start"
        size={12}
        style={{
          borderBottom: `1px solid ${semantic.colorBorder}`,
          padding: headerPadding,
          width: "100%",
        }}
      >
        <div
          style={{
            width: isCompact ? 32 : 36,
            height: isCompact ? 32 : 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: semantic.colorPrimaryBg,
            color: semantic.colorPrimary,
          }}
        >
          <PlusOutlined />
        </div>
        <Space direction="vertical" size={0}>
          <Typography.Title
            level={isMobile ? 5 : 4}
            style={{ margin: 0, fontSize: isMobile ? 18 : undefined }}
          >
            {formMode === "create" ? "Create New Template" : "Edit Template"}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
            {formMode === "create"
              ? "Build a reusable prompt template using system categories and services"
              : "Update template details and prompt content using system categories and services"}
          </Typography.Text>
        </Space>
      </Space>

      <Form form={form} layout="vertical" style={{ minHeight: "auto" }}>
        <Row gutter={0}>
          <Col xs={24} md={12}>
            <Space
              direction="vertical"
              size={12}
              style={{
                borderRight: isMobile
                  ? "none"
                  : `1px solid ${semantic.colorBorder}`,
                borderBottom: isMobile
                  ? `1px solid ${semantic.colorBorder}`
                  : "none",
                padding: sectionPadding,
                width: "100%",
              }}
            >
              <Form.Item
                name="id"
                label="id"
                style={{ marginBottom: 0 }}
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="title"
                label="Template Name"
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: "Template name is required" },
                ]}
              >
                <Input size={isMobile ? "middle" : "large"} placeholder="Product Photography" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea rows={isMobile ? 2 : 3} placeholder="Short description" />
              </Form.Item>

              <Form.Item
                name="generateType"
                label="Generation Type"
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: "Generation type is required" },
                ]}
              >
                <Select
                  size={isMobile ? "middle" : "large"}
                  placeholder="Select generation type"
                  options={[
                    {
                      value: "image",
                      label: (
                        <Flex align="center" gap={8}>
                          <Image size={16} />
                          Image
                        </Flex>
                      ),
                    },
                    {
                      value: "video",
                      label: (
                        <Flex align="center" gap={8}>
                          <VideoCameraOutlined size={16} />
                          Video
                        </Flex>
                      ),
                    },
                    {
                      value: "omnihumen",
                      label: (
                        <Flex align="center" gap={8}>
                          <UserOutlined size={16} />
                          OmniHuman
                        </Flex>
                      ),
                    },
                    {
                      value: "dreamactor",
                      label: (
                        <Flex align="center" gap={8}>
                          <TeamOutlined size={16} />
                          DreamActor
                        </Flex>
                      ),
                    },
                  ]}
                  onChange={handleGenerateTypeChange}
                />
              </Form.Item>

              <Form.Item
                name="promptGuideTypeId"
                label="Category"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "Category is required" }]}
              >
                <Select
                  size={isMobile ? "middle" : "large"}
                  placeholder="Select category"
                  options={categoryOptions}
                  onChange={handleTypeChange}
                />
              </Form.Item>

              <Form.Item
                name="model"
                label="AI Model"
                style={{ marginBottom: 0 }}
              >
                <Select
                  size={isMobile ? "middle" : "large"}
                  placeholder="Select model"
                  options={modelOptions}
                  disabled={modelOptions.length === 0}
                />
              </Form.Item>

              <Card
                size="small"
                style={{
                  borderColor: semantic.colorBorder,
                  background: semantic.colorBgTextActive,
                }}
              >
                <Typography.Text
                  type="secondary"
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Summary
                </Typography.Text>
                <Space
                  direction="vertical"
                  size={6}
                  style={{ marginTop: 6, width: "100%" }}
                >
                  <Space size={8} style={{ width: "100%" }}>
                    <Typography.Text
                      style={{ color: currentTypeMeta.color, fontSize: 13 }}
                    >
                      {currentTypeMeta.icon}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12 }} ellipsis>
                      {currentTypeMeta.label}
                    </Typography.Text>
                  </Space>

                  {selectedType?.title && (
                    <Space size={8} style={{ width: "100%" }}>
                      <TagOutlined
                        style={{
                          color: semantic.colorTextSecondary,
                          fontSize: 13,
                        }}
                      />
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                        ellipsis
                      >
                        {selectedType.title}
                      </Typography.Text>
                    </Space>
                  )}

                  {variables.length > 0 && (
                    <Space size={8} align="start" style={{ width: "100%" }}>
                      <InfoCircleOutlined
                        style={{
                          color: semantic.colorTextSecondary,
                          fontSize: 13,
                          marginTop: 2,
                        }}
                      />
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {variables.length} variable
                        {variables.length > 1 ? "s" : ""}
                      </Typography.Text>
                    </Space>
                  )}

                  <Tag color={isReady ? "success" : "default"}>
                    {isReady
                      ? formMode === "create"
                        ? "Ready to create"
                        : "Ready to save"
                      : "Fill required fields"}
                  </Tag>
                </Space>
                {formMode === "edit" && isDirty && (
                  <Tag color="warning">Unsaved changes</Tag>
                )}
              </Card>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space
              direction="vertical"
              size={12}
              style={{ padding: sectionPadding, width: "100%" }}
            >
              <Tabs
                size={isMobile ? "small" : "middle"}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as "edit" | "preview")}
                items={[
                  {
                    key: "edit",
                    label: "Write Prompt",
                    children: (
                      <>
                        <Form.Item
                          name="textPrompt"
                          label="Prompt Template"
                          style={{ marginBottom: 10 }}
                          rules={[
                            {
                              required: true,
                              message: "Prompt template is required",
                            },
                          ]}
                        >
                          <Input.TextArea
                            rows={isMobile ? 8 : 12}
                            placeholder="Write your prompt template"
                          />
                        </Form.Item>

                        <Card
                          size="small"
                          style={{
                            borderColor: semantic.colorInfoBorder,
                            background: semantic.colorInfoBg,
                          }}
                        >
                          <Space
                            direction="vertical"
                            size={8}
                            style={{ width: "100%" }}
                          >
                            <Typography.Text
                              style={{
                                color: semantic.colorInfo,
                                fontSize: isMobile ? 11 : 12,
                              }}
                            >
                              <InfoCircleOutlined /> Variable Syntax Guide: use{" "}
                              <Typography.Text code>[name]</Typography.Text>
                            </Typography.Text>
                            <Space size={[6, 6]} wrap>
                              {SUGGESTED_VARIABLES.map((item) => (
                                <Tag
                                  key={item}
                                  color="processing"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => appendVariableToken(item)}
                                >
                                  [{item}]
                                </Tag>
                              ))}
                            </Space>
                          </Space>
                        </Card>

                        <Space
                          direction="vertical"
                          size={6}
                          style={{ width: "100%" }}
                        >
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            Detected Variables ({variables.length})
                          </Typography.Text>
                          {variables.length > 0 ? (
                            <Space size={[6, 6]} wrap>
                              {variables.map((item) => (
                                <Tag
                                  key={item}
                                  closable
                                  onClose={(event) => {
                                    event.preventDefault();
                                    removeVariableToken(item);
                                  }}
                                >
                                  [{item}]
                                </Tag>
                              ))}
                            </Space>
                          ) : (
                            <Typography.Text type="secondary" italic>
                              No variables detected yet. Use syntax like
                              [product], [style], [background].
                            </Typography.Text>
                          )}
                        </Space>
                        {extraContent}
                      </>
                    ),
                  },
                  {
                    key: "preview",
                    label: "Preview",
                    children: (
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size={12}
                      >
                        <Space
                          direction="vertical"
                          size={6}
                          style={{ width: "100%" }}
                        >
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            Template Preview
                          </Typography.Text>
                          <div
                            style={{
                              borderRadius: 10,
                              padding: 12,
                              background: semantic.colorBgTextActive,
                              border: `1px solid ${semantic.colorBorder}`,
                              minHeight: 180,
                              maxHeight: isMobile ? 220 : undefined,
                              overflowY: isMobile ? "auto" : "visible",
                            }}
                          >
                            <Typography.Paragraph
                              style={{ margin: 0, fontFamily: "monospace" }}
                            >
                              {promptText || "No prompt entered yet..."}
                            </Typography.Paragraph>
                          </div>
                        </Space>

                        <Space
                          direction="vertical"
                          size={6}
                          style={{ width: "100%" }}
                        >
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            Template Info Card Preview
                          </Typography.Text>
                          <TemplateItem
                            title={templateName}
                            description={description}
                            textPrompt={promptText}
                            generateType={selectedType?.generateType || "image"}
                            categoryLabel={selectedType?.title}
                            model={selectedModel}
                            showActions={false}
                            showUseBadge
                          />
                        </Space>
                      </Space>
                    ),
                  },
                ]}
              />
            </Space>
          </Col>
        </Row>
      </Form>

      <div
        style={{
          borderTop: `1px solid ${semantic.colorBorder}`,
          padding: isMobile ? "10px 12px" : "12px 20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? 10 : 0,
        }}
      >
        <Button size={isMobile ? "middle" : "large"} icon={<ReloadOutlined />} onClick={handleReset} block={isMobile}>
          Reset
        </Button>
        <Space style={{ width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "flex-end" : undefined }}>
          {formMode === "edit" && onDelete && (
            <Button size={isMobile ? "middle" : "large"} danger icon={<DeleteOutlined />} onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button size={isMobile ? "middle" : "large"} onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            size={isMobile ? "middle" : "large"}
            icon={<SaveOutlined />}
            disabled={!isReady}
            onClick={handleSubmit}
          >
            {formMode === "create" ? "Create Template" : "Save Changes"}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default TemplateFormModal;
