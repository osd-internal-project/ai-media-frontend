import type {
  TGenerateType,
  TPromptGuide,
  TPromptGuideType
} from "@/app/common/prompt-guide.type";
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  FormInstance,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
  UploadFile,
} from "antd";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { FilePlusCorner, ImagePlus, Sparkles } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactElement,
} from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import CustomTab from "./customtab";

export interface props {
  promptGuideTypes: TPromptGuideType[];
  promptGuideForm: FormInstance;
  onSelectPromptGuide: (id: number) => void;
  selectedPromptGuide: TPromptGuide | null;
  onUpdatePromptGuide: (values: TPromptGuide) => void;
  onCreatePromptGuideType: (values: any) => void;
  onDeletePromptGuideType: (id: number) => void;
  onCreatePromptGuide: (values: any) => void;
  onDeletePromptGuide: (id: number) => void;
  canManage: boolean;
  generateType: TGenerateType | "all";
  handleSelectGenerateType: (value: TGenerateType | "all") => void;
  files: UploadFile[];
  isLoadingUpload: boolean;
  handleUploadChange: (info: UploadChangeParam) => void;
  beforeUpload: (file: RcFile) => boolean;
  onRemoveFile: (file: UploadFile) => void;
  firstFrame: UploadFile[];
  lastFrame: UploadFile[];
  isLoadingFirstFrame: boolean;
  isLoadingLastFrame: boolean;
  handleVideoImageUploadChange: (
    info: UploadChangeParam,
    index: string,
  ) => void;
}

type FlatTemplate = TPromptGuide & {
  typeTitle?: string;
};

const PromptGuideComponent: FC<props> = ({
  promptGuideTypes,
  promptGuideForm,
  onSelectPromptGuide,
  selectedPromptGuide,
  onUpdatePromptGuide,
  onCreatePromptGuideType,
  onCreatePromptGuide,
  onDeletePromptGuide,
  canManage,
  generateType,
  handleSelectGenerateType,
  files,
  isLoadingUpload,
  handleUploadChange,
  beforeUpload,
  onRemoveFile,
  firstFrame,
  lastFrame,
  isLoadingFirstFrame,
  isLoadingLastFrame,
  handleVideoImageUploadChange,
}): ReactElement => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  const [searchQuery, setSearchQuery] = useState("");
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [typeForm] = Form.useForm();
  const [guideForm] = Form.useForm();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const templates = useMemo<FlatTemplate[]>(
    () =>
      promptGuideTypes.flatMap((group) =>
        (group.promptGuide || []).map((item) => ({
          ...item,
          typeTitle: group.title,
        })),
      ),
    [promptGuideTypes],
  );

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        template.title?.toLowerCase().includes(q) ||
        template.textPrompt?.toLowerCase().includes(q) ||
        template.typeTitle?.toLowerCase().includes(q);

      const matchesType =
        generateType === "all" || template.generateType === generateType;

      return matchesSearch && matchesType;
    });
  }, [templates, searchQuery, generateType]);

  const getTypeBadgeStyle = (type: TGenerateType | undefined) => {
    if (type === "video") {
      return {
        color: semantic.colorPrimary,
        background: `${semantic.colorPrimary}1A`,
        borderColor: `${semantic.colorPrimary}33`,
      };
    }

    if (type === "omnihumen") {
      return {
        color: semantic.colorSuccess,
        background: `${semantic.colorSuccess}1A`,
        borderColor: `${semantic.colorSuccess}33`,
      };
    }

    if (type === "dreamactor") {
      return {
        color: semantic.colorWarning,
        background: `${semantic.colorWarning}1A`,
        borderColor: `${semantic.colorWarning}33`,
      };
    }

    return {
      color: "#1890ff",
      background: "#e6f7ff",
      borderColor: "#91d5ff",
    };
  };

  const handleAddType = () => {
    typeForm.resetFields();
    setIsTypeModalOpen(true);
  };

  const handleCreateType = (values: any) => {
    onCreatePromptGuideType(values);
    setIsTypeModalOpen(false);
  };

  const handleCreateGuide = (values: any) => {
    if (!selectedTypeId) return;

    const selectedType = promptGuideTypes.find((type) => type.id === selectedTypeId);

    onCreatePromptGuide({
      ...values,
      promptGuideTypeId: selectedTypeId,
      generateType: selectedType?.generateType,
    });
    setIsGuideModalOpen(false);
  };

  const openCreateTemplateModal = () => {
    guideForm.resetFields();

    const firstTypeId = promptGuideTypes[0]?.id;
    if (firstTypeId) {
      setSelectedTypeId(firstTypeId);
      guideForm.setFieldValue("promptGuideTypeId", firstTypeId);
    } else {
      setSelectedTypeId(null);
    }

    setIsGuideModalOpen(true);
  };

  const handleTabChange = (value: TGenerateType | "all") => {
    if (value === "all") {
      setSearchQuery("");
    }
    handleSelectGenerateType(value);
  };

  const handleEditTemplate = async (template: FlatTemplate) => {
    if (!template.id) return;
    onSelectPromptGuide(template.id);
    setIsEditModalOpen(true);
  };


  const renderImageUpload = () => (
    <Upload
      listType="picture-card"
      fileList={files}
      onChange={handleUploadChange}
      beforeUpload={beforeUpload}
      onRemove={onRemoveFile}
      multiple
      maxCount={3}
      showUploadList
      disabled={isLoadingUpload}
    >
      {files.length >= 3 ? null : (
        <div className="flex flex-col items-center text-sm">
          {isLoadingUpload ? <LoadingOutlined /> : <ImagePlus />}
          <div>New Image</div>
        </div>
      )}
    </Upload>
  );

  const renderDualUpload = (
    leftProps: {
      accept?: string;
      fileList: UploadFile[];
      loading: boolean;
      label: string;
      icon: ReactElement;
      onChange: (info: UploadChangeParam<UploadFile>) => void;
    },
    rightProps: {
      accept?: string;
      fileList: UploadFile[];
      loading: boolean;
      label: string;
      icon: ReactElement;
      onChange: (info: UploadChangeParam<UploadFile>) => void;
    },
  ) => (
    <div className="flex items-center gap-2">
      <Upload
        accept={leftProps.accept}
        listType="picture-card"
        fileList={leftProps.fileList}
        onChange={leftProps.onChange}
        beforeUpload={beforeUpload}
        onRemove={onRemoveFile}
        maxCount={1}
        showUploadList
        disabled={leftProps.loading}
      >
        {leftProps.fileList.length >= 1 ? null : (
          <div className="flex flex-col items-center text-sm">
            {leftProps.loading ? <LoadingOutlined /> : leftProps.icon}
            <div>{leftProps.label}</div>
          </div>
        )}
      </Upload>

      <SwapOutlined />

      <Upload
        accept={rightProps.accept}
        listType="picture-card"
        fileList={rightProps.fileList}
        onChange={rightProps.onChange}
        beforeUpload={beforeUpload}
        onRemove={onRemoveFile}
        maxCount={1}
        showUploadList
        disabled={rightProps.loading}
      >
        {rightProps.fileList.length >= 1 ? null : (
          <div className="flex flex-col items-center text-sm">
            {rightProps.loading ? <LoadingOutlined /> : rightProps.icon}
            <div>{rightProps.label}</div>
          </div>
        )}
      </Upload>
    </div>
  );

  const renderFileEditor = () => {
    if (generateType === "video") {
      return renderDualUpload(
        {
          fileList: firstFrame,
          loading: isLoadingFirstFrame,
          label: "Image",
          icon: <ImagePlus />,
          onChange: (info) => handleVideoImageUploadChange(info, "1"),
        },
        {
          fileList: lastFrame,
          loading: isLoadingLastFrame,
          label: "Last Frame",
          icon: <ImagePlus />,
          onChange: (info) => handleVideoImageUploadChange(info, "2"),
        },
      );
    }

    if (generateType === "omnihumen") {
      return renderDualUpload(
        {
          accept: "image/*",
          fileList: firstFrame,
          loading: isLoadingFirstFrame,
          label: "Image",
          icon: <ImagePlus />,
          onChange: (info) => handleVideoImageUploadChange(info, "1"),
        },
        {
          accept: "audio/*",
          fileList: lastFrame,
          loading: isLoadingLastFrame,
          label: "Audio",
          icon: <FilePlusCorner />,
          onChange: (info) => handleVideoImageUploadChange(info, "2"),
        },
      );
    }

    if (generateType === "dreamactor") {
      return renderDualUpload(
        {
          accept: "image/*",
          fileList: firstFrame,
          loading: isLoadingFirstFrame,
          label: "Image",
          icon: <ImagePlus />,
          onChange: (info) => handleVideoImageUploadChange(info, "1"),
        },
        {
          accept: "video/*",
          fileList: lastFrame,
          loading: isLoadingLastFrame,
          label: "Video",
          icon: <FilePlusCorner />,
          onChange: (info) => handleVideoImageUploadChange(info, "2"),
        },
      );
    }

    return renderImageUpload();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 md:items-center">
        <div>
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            Prompt Guide Templates
          </Typography.Title>
          <Typography.Text type="secondary">
            Pre-configured prompts for common use cases
          </Typography.Text>
        </div>

        <Space wrap style={{ width: isMobile ? "100%" : "auto" }}>
          {canManage && (
            <Button onClick={handleAddType} block={isMobile}>Add Type</Button>
          )}
          {canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateTemplateModal}
              block={isMobile}
            >
              New Template
            </Button>
          )}
        </Space>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search templates..."
          style={{ width: "100%", maxWidth: isMobile ? "100%" : 360 }}
        />

        <CustomTab value={generateType} onChange={handleTabChange} />
      </div>

      {filteredTemplates.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredTemplates.map((template) => (
            <Col key={template.id} xs={24} md={12} lg={8}>
              <Card
                style={{
                  borderColor: semantic.colorBorder,
                  background: semantic.colorBgContainer,
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <Typography.Title level={5} style={{ marginBottom: 4 }}>
                      {template.title}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {template.typeTitle || "Prompt Template"}
                    </Typography.Text>
                  </div>
                  <Tag style={{ textTransform: "capitalize", ...getTypeBadgeStyle(template.generateType) }}>
                    {template.generateType}
                  </Tag>
                </div>

                <div
                  style={{
                    background: semantic.colorBgTextActive,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                    minHeight: 88,
                  }}
                >
                  <Typography.Paragraph
                    style={{ margin: 0, fontFamily: "monospace" }}
                    ellipsis={{ rows: 4 }}
                  >
                    {template.textPrompt || "-"}
                  </Typography.Paragraph>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Space size={6} wrap>
                    <Tag>{template.typeTitle || "General"}</Tag>
                  </Space>

                  <Space wrap>
                    {canManage && (
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      type="primary"
                      icon={<Sparkles size={14} />}
                      onClick={() => handleEditTemplate(template)}
                    >
                      Use
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div
          style={{
            border: `1px dashed ${semantic.colorBorder}`,
            borderRadius: 12,
            padding: 40,
          }}
        >
          <Empty description="No templates found" />
        </div>
      )}

      <Modal
        title="Create Prompt Type"
        open={isTypeModalOpen}
        onCancel={() => setIsTypeModalOpen(false)}
        onOk={() => typeForm.submit()}
        width={isMobile ? "92%" : 520}
      >
        <Form form={typeForm} onFinish={handleCreateType} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Prompt Template"
        open={isGuideModalOpen}
        onCancel={() => setIsGuideModalOpen(false)}
        onOk={() => guideForm.submit()}
        width={isMobile ? "92%" : 620}
      >
        <Form form={guideForm} onFinish={handleCreateGuide} layout="vertical">
          <Form.Item
            name="promptGuideTypeId"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select
              options={promptGuideTypes.map((type) => ({
                label: type.title,
                value: type.id,
              }))}
              onChange={(value) => setSelectedTypeId(value)}
            />
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="textPrompt"
            label="Text Prompt"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="status" initialValue={true} hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={canManage ? "Edit Prompt Template" : "View Prompt Template"}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => promptGuideForm.submit()}
        okButtonProps={{ hidden: !canManage }}
        width={isMobile ? "95%" : 900}
      >
        {!selectedPromptGuide ? (
          <Empty description="No template selected" />
        ) : (
          <Form layout="vertical" form={promptGuideForm} onFinish={onUpdatePromptGuide}>
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input readOnly={!canManage} />
            </Form.Item>

            <Form.Item label="Files">{renderFileEditor()}</Form.Item>

            <Form.Item
              name="textPrompt"
              label="Text Prompt"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={6} readOnly={!canManage} />
            </Form.Item>

            {canManage && (
              <Space>
                <Popconfirm
                  title="Delete this prompt template?"
                  onConfirm={() => {
                    onDeletePromptGuide(selectedPromptGuide.id!);
                    setIsEditModalOpen(false);
                  }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>

                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Space>
            )}
          </Form>
        )}
      </Modal>

    </div>
  );
};

export default PromptGuideComponent;
