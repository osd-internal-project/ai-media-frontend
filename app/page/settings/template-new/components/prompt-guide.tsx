import type {
  TGenerateType,
  TPromptGuide,
  TPromptGuideType,
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
  Col,
  Empty,
  Form,
  FormInstance,
  Input,
  Modal,
  Row,
  Space,
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
import TemplateFormModal from "./template-form-modal";
import TemplateItem from "./template-item";
import { TMasterModelType } from "@/app/common/master-model-type.type";

export interface props {
  searchQuery: string;
  allModel: TMasterModelType[];
  setSearchQuery: (value: string) => void;
  promptGuilds: TPromptGuide[];
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
  searchQuery,
  allModel,
  setSearchQuery,
  promptGuilds,
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

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [typeForm] = Form.useForm();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const selectedPromptGuideTypeId = useMemo(() => {
    if (!selectedPromptGuide?.id) return undefined;
    const group = promptGuideTypes.find((type) =>
      (type.promptGuide || []).some(
        (item) => item.id === selectedPromptGuide.id,
      ),
    );
    return group?.id;
  }, [promptGuideTypes, selectedPromptGuide]);

  // const handleAddType = () => {
  //   typeForm.resetFields();
  //   setIsTypeModalOpen(true);
  // };

  const handleCreateType = (values: any) => {
    onCreatePromptGuideType(values);
    setIsTypeModalOpen(false);
  };

  const openCreateTemplateModal = () => {
    setIsGuideModalOpen(true);
  };

  const handleTabChange = (value: TGenerateType | "all") => {
    // if (value === "all") {
    //   setSearchQuery("");
    // }
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
          accept: "image/*",
          fileList: firstFrame,
          loading: isLoadingFirstFrame,
          label: "Image",
          icon: <ImagePlus />,
          onChange: (info) => handleVideoImageUploadChange(info, "1"),
        },
        {
          accept: "image/*",
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
          {/* {canManage && (
            <Button onClick={handleAddType} block={isMobile}>Add Type</Button>
          )} */}
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

      {promptGuilds.length > 0 ? (
        <Row gutter={[16, 16]}>
          {promptGuilds.map((template) => (
            <Col key={template.id} xs={24} md={12} lg={8}>
              <TemplateItem
                title={template.title}
                textPrompt={template.textPrompt}
                generateType={template.generateType || ""}
                categoryLabel={template?.promptGuideType?.title || "General"}
                canManage={canManage}
                model={template.model || ""}
                onEdit={() => handleEditTemplate(template)}
                onUse={() => handleEditTemplate(template)}
              />
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

      <TemplateFormModal
        allModel={allModel}
        formMode="create"
        open={isGuideModalOpen}
        isMobile={isMobile}
        promptGuideTypes={promptGuideTypes}
        onCancel={() => setIsGuideModalOpen(false)}
        onSubmit={(values) => {
          onCreatePromptGuide(values);
          setIsGuideModalOpen(false);
        }}
      />

      {selectedPromptGuide ? (
        <TemplateFormModal
          allModel={allModel}
          formMode="edit"
          open={isEditModalOpen}
          isMobile={isMobile}
          promptGuideTypes={promptGuideTypes}
          initialValues={{
            id: selectedPromptGuide.id,
            title: selectedPromptGuide.title || "",
            textPrompt: selectedPromptGuide.textPrompt || "",
            status: selectedPromptGuide.status,
            generateType: selectedPromptGuide.generateType,
            promptGuideTypeId: selectedPromptGuideTypeId,
            model: selectedPromptGuide?.model || "",
          }}
          onCancel={() => setIsEditModalOpen(false)}
          onSubmit={(values) => {
            onUpdatePromptGuide(values);
            setIsEditModalOpen(false);
          }}
          onDelete={
            canManage
              ? () => {
                  onDeletePromptGuide(selectedPromptGuide.id!);
                  setIsEditModalOpen(false);
                }
              : undefined
          }
          extraContent={
            <Form.Item label="Files">{renderFileEditor()}</Form.Item>
          }
        />
      ) : (
        <Modal
          title="Edit Prompt Template"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
        >
          <Empty description="No template selected" />
        </Modal>
      )}
    </div>
  );
};

export default PromptGuideComponent;
