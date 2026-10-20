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
import useResponsive from "@/app/hooks/useResponsive";
import CustomTab from "./customtab";
import TemplateFormModal from "./template-form-modal";
import TemplateItem from "./template-item";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { mentionLabels } from "@/app/utils/prompt-guide-media";

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
  onCreatePromptGuide: (values: any) => Promise<boolean>;
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
  resultFiles: UploadFile[];
  isLoadingResult: boolean;
  handleResultUploadChange: (info: UploadChangeParam) => void;
  onRemoveResult: (file: UploadFile) => void;
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
  resultFiles,
  isLoadingResult,
  handleResultUploadChange,
  onRemoveResult,
}): ReactElement => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [typeForm] = Form.useForm();

  const containerPadding = isMobile ? 12 : isTablet ? 16 : 24;
  const sectionGap = isMobile ? 12 : 16;
  const titleLevel = isMobile ? 5 : 4;

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

  const refLabels = mentionLabels(files);
  // ป้าย @image1/@video1 ตรงกับชื่อที่ใช้อ้างใน prompt หลังผู้ใช้กด Use
  const renderRefItem = (originNode: ReactElement, file: UploadFile) => {
    const label = refLabels[files.findIndex((f) => f.uid === file.uid)];
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {originNode}
        {label && (
          <Tag
            color="processing"
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              margin: 0,
              fontSize: 10,
              lineHeight: "16px",
              pointerEvents: "none",
            }}
          >
            @{label}
          </Tag>
        )}
      </div>
    );
  };

  const renderVideoUpload = () => (
    <Upload
      accept="image/*,video/*,audio/*"
      listType="picture-card"
      fileList={files}
      onChange={handleUploadChange}
      beforeUpload={beforeUpload}
      onRemove={onRemoveFile}
      itemRender={renderRefItem}
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
  const renderImageUpload = () => (
    <Upload
      accept="image/*"
      listType="picture-card"
      fileList={files}
      onChange={handleUploadChange}
      beforeUpload={beforeUpload}
      onRemove={onRemoveFile}
      itemRender={renderRefItem}
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

  const renderResultUpload = () => (
    <Form.Item
      label="Result (showcase)"
      extra="แสดงเป็นภาพหลักของ template ให้ผู้ใช้เห็น — ไม่ถูกแนบไปตอนผู้ใช้กด Use"
    >
      <Upload
        accept="image/*,video/*"
        listType="picture-card"
        fileList={resultFiles}
        onChange={handleResultUploadChange}
        beforeUpload={() => false}
        onRemove={onRemoveResult}
        maxCount={2}
        showUploadList
        disabled={isLoadingResult}
      >
        {resultFiles.length >= 2 ? null : (
          <div className="flex flex-col items-center text-sm">
            {isLoadingResult ? <LoadingOutlined /> : <Sparkles />}
            <div>Result</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  );

  const renderFileEditor = () => {
    const editingType = selectedPromptGuide?.generateType ?? generateType;
    if (editingType === "video") {
      return renderVideoUpload();
    }

    if (editingType === "omnihumen") {
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

    if (editingType === "dreamactor") {
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
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        overscrollBehavior: "contain",
        padding: containerPadding,
      }}
    >
      <div
        style={{
          marginBottom: sectionGap,
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography.Title
            level={titleLevel}
            style={{ marginBottom: 2, fontSize: isMobile ? 16 : 20 }}
          >
            Prompt Guide Templates
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ fontSize: isMobile ? 12 : 13 }}
          >
            Pre-configured prompts for common use cases
          </Typography.Text>
        </div>

        <Space wrap={false} style={{ width: "auto", flexShrink: 0 }}>
          {/* {canManage && (
            <Button onClick={handleAddType} block={isMobile}>Add Type</Button>
          )} */}
          {canManage && (
            <Button
              type="primary"
              size={isMobile ? "middle" : "large"}
              icon={<PlusOutlined />}
              onClick={openCreateTemplateModal}
              block={false}
            >
              {isMobile ? "New" : "New Template"}
            </Button>
          )}
        </Space>
      </div>

      <div
        style={{
          marginBottom: sectionGap,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: 12,
        }}
      >
        <Input
          size={isMobile ? "middle" : "large"}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search templates..."
          style={{ width: "100%", maxWidth: isMobile ? "100%" : 360 }}
        />

        <CustomTab value={generateType} onChange={handleTabChange} />
      </div>

      {promptGuilds.length > 0 ? (
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
          {promptGuilds.map((template) => (
            <Col key={template.id} xs={24} sm={12} md={12} lg={8}>
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
            padding: isMobile ? 20 : 40,
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
        onSubmit={async (values) => {
          setIsGuideModalOpen(false);
          // create modal ไม่มีช่องรูป — เปิด edit ของ template ใหม่ให้ upload ต่อ
          if (await onCreatePromptGuide(values)) setIsEditModalOpen(true);
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
            description: selectedPromptGuide.description || "",
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
            <>
              <Form.Item label="Reference files">{renderFileEditor()}</Form.Item>
              {renderResultUpload()}
            </>
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
