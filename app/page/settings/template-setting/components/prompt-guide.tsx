import type {
  TGenerateType,
  TPromptGuideType,
} from "@/app/common/prompt-guide.type";
import {
  ArrowRightOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LoadingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Modal,
  Popconfirm,
  Space,
  Segmented,
  Tooltip,
  Upload,
  UploadFile,
} from "antd";

import { RcFile, UploadChangeParam } from "antd/es/upload";
import { ImagePlus, FilePlusCorner } from "lucide-react";
import React, { useState, type FC, type ReactElement, useEffect } from "react";

export interface props {
  promptGuideTypes: TPromptGuideType[];
  promptGuideForm: FormInstance;
  onSelectPromptGuide: (id: number) => void;
  selectedPromptGuide: TPromptGuideType | null;
  onUpdatePromptGuide: (values: TPromptGuideType) => void;
  onCreatePromptGuideType: (values: any) => void;
  onDeletePromptGuideType: (id: number) => void;
  onCreatePromptGuide: (values: any) => void;
  onDeletePromptGuide: (id: number) => void;
  canManage: boolean;
  generateType: TGenerateType;
  handleSelectGenerateType: (value: TGenerateType) => void;
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
  // handleLastFrameUploadChange: (info: UploadChangeParam) => void;
}
const PromptGuideComponent: FC<props> = ({
  promptGuideTypes,
  promptGuideForm,
  onSelectPromptGuide,
  selectedPromptGuide,
  onUpdatePromptGuide,
  onCreatePromptGuideType,
  onDeletePromptGuideType,
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
  const hiddenTabs = ["omnihumen", "dreamactor"];

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [typeForm] = Form.useForm();
  const [guideForm] = Form.useForm();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleAddType = () => {
    typeForm.resetFields();
    setIsTypeModalOpen(true);
  };

  const handleCreateType = (values: any) => {
    onCreatePromptGuideType(values);
    setIsTypeModalOpen(false);
  };

  const handleAddGuide = (typeId: number) => {
    guideForm.resetFields();
    setSelectedTypeId(typeId);
    setIsGuideModalOpen(true);
  };

  const handleCreateGuide = (values: any) => {
    if (selectedTypeId) {
      onCreatePromptGuide({ ...values, promptGuideTypeId: selectedTypeId });
      setIsGuideModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 text-white font-sans">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8} lg={6}>
          <Segmented
            className=" mb-2"
            options={["image", "video", "omnihumen", "dreamactor"]}
            value={generateType}
            onChange={handleSelectGenerateType}
          />
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h1 className="text-lg font-bold">
              {generateType === "image" && "Image Prompt"}
              {generateType === "video" && "Video Prompt"}
              {generateType === "omnihumen" && "OmniHuman Prompt"}
              {generateType === "dreamactor" && "DreamActor Prompt"}
            </h1>
            {canManage && (
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddType}
                type="link"
                size="small"
              >
                Add Type
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {promptGuideTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileTextOutlined className="text-5xl text-[#555] mb-4" />
                <p className="text-[#888] mb-2">No prompt types found</p>
                {canManage && (
                  <p className="text-[#666] text-sm">
                    Click &quot;Add Type&quot; to create your first prompt
                    category
                  </p>
                )}
              </div>
            ) : (
              promptGuideTypes.map((group) => (
                <div key={group.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[#888] font-medium">{group.title}</h3>
                    {canManage && (
                      <Space>
                        <Button
                          icon={<PlusOutlined />}
                          size="small"
                          type="text"
                          className="text-[#888] hover:text-white"
                          onClick={() => handleAddGuide(group.id)}
                        />
                        <Popconfirm
                          title="Delete this type?"
                          onConfirm={() => onDeletePromptGuideType(group.id)}
                        >
                          <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            type="text"
                            danger
                          />
                        </Popconfirm>
                      </Space>
                    )}
                  </div>
                  <div className="space-y-2 pl-2">
                    {group.promptGuide?.map((item) => {
                      const isActive = selectedPromptGuide?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectPromptGuide(item.id!)}
                          className={`
                            group flex items-center justify-between px-2 md:px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 bg-[#1E1E1E]
                            ${isActive ? "" : " hover:bg-[#252525]"}
                          `}
                          style={
                            isActive
                              ? {
                                  background:
                                    "linear-gradient(#1E1E1E, #1E1E1E) padding-box, linear-gradient(90deg, #64E9FF, #9F55FF) border-box",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  borderColor: "transparent",
                                  boxShadow:
                                    "0 0 20px rgba(100, 233, 255, 0.1)",
                                }
                              : {
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  borderColor: "transparent",
                                }
                          }
                        >
                          <span
                            className={`text-sm md:text-base truncate ${
                              isActive ? "text-white" : "text-[#CCC]"
                            }`}
                          >
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1 md:gap-2">
                            {canManage && (
                              <Popconfirm
                                title="Delete this prompt?"
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  onDeletePromptGuide(item.id!);
                                }}
                                onCancel={(e) => e?.stopPropagation()}
                              >
                                <DeleteOutlined
                                  className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Popconfirm>
                            )}
                            <ArrowRightOutlined
                              className={`text-base transition-colors duration-300 ${
                                isActive
                                  ? "text-[#888]"
                                  : "text-[#555] group-hover:text-[#888]"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Col>
        <Col xs={24} md={16} lg={18}>
          {selectedPromptGuide ? (
            <Card>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <div className="font-bold text-lg">
                  {canManage ? "Edit Prompt" : "View Prompt"}
                </div>
                {canManage && (
                  <Popconfirm
                    title="Delete this prompt?"
                    description="Are you sure you want to delete this prompt guide? This action cannot be undone."
                    onConfirm={() =>
                      onDeletePromptGuide(selectedPromptGuide.id!)
                    }
                  >
                    <Button danger type="primary" size="small">
                      Delete
                    </Button>
                  </Popconfirm>
                )}
              </div>
              <Form
                layout="vertical"
                form={promptGuideForm}
                onFinish={onUpdatePromptGuide}
              >
                <Form.Item name={"id"} label="id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={"title"} label="Title">
                  <Input readOnly={!canManage} />
                </Form.Item>
                <Form.Item label={"Files"}>
                  {generateType === "image" && (
                    <Upload
                      style={{
                        // width: "40px",
                        // height: "40px",
                        border: "1px dashed #3f3f46",
                        borderRadius: "0.5rem",
                      }}
                      listType="picture-card"
                      fileList={files}
                      onChange={handleUploadChange}
                      beforeUpload={beforeUpload}
                      onRemove={onRemoveFile}
                      multiple={true}
                      maxCount={3}
                      showUploadList={true}
                      disabled={isLoadingUpload}

                      // style={{ width: '80px', height: "80px" }}
                    >
                      {files.length >= 3 ? null : (
                        <Tooltip
                          title={`Upload files (${files.length}/3)`}
                          placement="top"
                        >
                          <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                            {isLoadingUpload ? (
                              <LoadingOutlined />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-sm">
                                <ImagePlus />
                                <div>New Image</div>
                              </div>
                            )}
                            {files.length > 0 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                {files.length}
                              </div>
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </Upload>
                  )}
                  {generateType === "video" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Upload
                          listType="picture-card"
                          fileList={firstFrame}
                          onChange={(firstFrame) =>
                            handleVideoImageUploadChange(firstFrame, "1")
                          }
                          style={{
                            // width: "40px",
                            // height: "40px",
                            border: "1px dashed #3f3f46",
                            borderRadius: "0.5rem",
                          }}
                          beforeUpload={beforeUpload}
                          onRemove={onRemoveFile}
                          maxCount={1}
                          showUploadList={true}
                          disabled={isLoadingFirstFrame}
                        >
                          {firstFrame.length >= 1 ? null : (
                            <Tooltip
                              title={`Upload first frame (${firstFrame.length}/1)`}
                              placement="top"
                            >
                              <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                {isLoadingFirstFrame ? (
                                  <LoadingOutlined />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-sm">
                                    <ImagePlus />
                                    <div>{`Image`}</div>
                                  </div>
                                )}
                                {firstFrame.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {firstFrame.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Upload>
                        <SwapOutlined />
                        <Upload
                          style={{
                            // width: "100%",
                            // height: "100%",
                            border: "1px dashed #3f3f46",
                            borderRadius: "0.5rem",
                          }}
                          listType="picture-card"
                          fileList={lastFrame}
                          onChange={(lastFrame) =>
                            handleVideoImageUploadChange(lastFrame, "2")
                          }
                          beforeUpload={beforeUpload}
                          onRemove={onRemoveFile}
                          maxCount={1}
                          showUploadList={true}
                          disabled={isLoadingLastFrame}
                        >
                          {lastFrame.length >= 1 ? null : (
                            <Tooltip
                              title={`Upload last frame (${lastFrame.length}/1)`}
                              placement="top"
                            >
                              <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                {isLoadingLastFrame ? (
                                  <LoadingOutlined />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-sm">
                                    <ImagePlus />
                                    <div>{`Last Frame`}</div>
                                  </div>
                                )}
                                {lastFrame.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {lastFrame.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Upload>
                      </div>
                    </div>
                  )}
                  {generateType === "omnihumen" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Upload
                          accept="image/*"
                          listType="picture-card"
                          fileList={firstFrame}
                          onChange={(firstFrame) =>
                            handleVideoImageUploadChange(firstFrame, "1")
                          }
                          style={{
                            // width: "40px",
                            // height: "40px",
                            border: "1px dashed #3f3f46",
                            borderRadius: "0.5rem",
                          }}
                          beforeUpload={beforeUpload}
                          onRemove={onRemoveFile}
                          maxCount={1}
                          showUploadList={true}
                          disabled={isLoadingFirstFrame}
                        >
                          {firstFrame.length >= 1 ? null : (
                            <Tooltip
                              title={`Upload first frame (${firstFrame.length}/1)`}
                              placement="top"
                            >
                              <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                {isLoadingFirstFrame ? (
                                  <LoadingOutlined />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-sm">
                                    <ImagePlus />
                                    <div>{`Image`}</div>
                                  </div>
                                )}
                                {firstFrame.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {firstFrame.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Upload>
                        <SwapOutlined />
                        <Upload
                          accept="audio/*"
                          style={{
                            // width: "100%",
                            // height: "100%",
                            border: "1px dashed #3f3f46",
                            borderRadius: "0.5rem",
                          }}
                          listType="picture-card"
                          fileList={lastFrame}
                          onChange={(lastFrame) =>
                            handleVideoImageUploadChange(lastFrame, "2")
                          }
                          beforeUpload={beforeUpload}
                          onRemove={onRemoveFile}
                          maxCount={1}
                          showUploadList={true}
                          disabled={isLoadingLastFrame}
                        >
                          {lastFrame.length >= 1 ? null : (
                            <Tooltip
                              title={`Upload last frame (${lastFrame.length}/1)`}
                              placement="top"
                            >
                              <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                {isLoadingLastFrame ? (
                                  <LoadingOutlined />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-sm">
                                    <FilePlusCorner />
                                    <div>{`Audio`}</div>
                                  </div>
                                )}
                                {lastFrame.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {lastFrame.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Upload>
                      </div>
                    </div>
                  )}
                  {generateType === "dreamactor" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Upload
                          accept="jpeg, jpg, png"
                          listType="picture-card"
                          fileList={firstFrame}
                          onChange={(firstFrame) =>
                            handleVideoImageUploadChange(firstFrame, "1")
                          }
                          style={{
                            // width: "40px",
                            // height: "40px",
                            border: "1px dashed #3f3f46",
                            borderRadius: "0.5rem",
                          }}
                          beforeUpload={beforeUpload}
                          onRemove={onRemoveFile}
                          maxCount={1}
                          showUploadList={true}
                          disabled={isLoadingFirstFrame}
                        >
                          {firstFrame.length >= 1 ? null : (
                            <Tooltip
                              title={`Upload first frame (${firstFrame.length}/1)`}
                              placement="top"
                            >
                              <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                {isLoadingFirstFrame ? (
                                  <LoadingOutlined />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-sm">
                                    <ImagePlus />
                                    <div>{`Image`}</div>
                                  </div>
                                )}
                                {firstFrame.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {firstFrame.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Upload>
                        <SwapOutlined />
                        <Upload
                          accept="mp4, mov, webm"
                          style={{
                            // width: "100%",
                            // height: "100%",
                            border: "1px dashed #3f3f46",
                            borderRadius: "0.5rem",
                          }}
                          listType="picture-card"
                          fileList={lastFrame}
                          onChange={(lastFrame) =>
                            handleVideoImageUploadChange(lastFrame, "2")
                          }
                          beforeUpload={beforeUpload}
                          onRemove={onRemoveFile}
                          maxCount={1}
                          showUploadList={true}
                          disabled={isLoadingLastFrame}
                          itemRender={(originNode, file, fileList, actions) => {
                            return (
                              <div className="w-full h-full relative group rounded-lg overflow-hidden border border-zinc-700">
                                <video
                                  src={
                                    file.url ||
                                    (file.originFileObj
                                      ? URL.createObjectURL(file.originFileObj)
                                      : "")
                                  }
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  loop
                                  autoPlay
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <DeleteOutlined
                                    className="text-white text-lg cursor-pointer hover:text-red-500"
                                    onClick={actions.remove}
                                  />
                                </div>
                              </div>
                            );
                          }}
                        >
                          {lastFrame.length >= 1 ? null : (
                            <Tooltip
                              title={`Upload last frame (${lastFrame.length}/1)`}
                              placement="top"
                            >
                              <div className="w-full h-full rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                {isLoadingLastFrame ? (
                                  <LoadingOutlined />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-sm">
                                    <FilePlusCorner />
                                    <div>{`Video`}</div>
                                  </div>
                                )}
                                {lastFrame.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {lastFrame.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Upload>
                      </div>
                    </div>
                  )}
                </Form.Item>
                <Form.Item name={"textPrompt"} label="Text Prompt">
                  <Input.TextArea rows={5} readOnly={!canManage} />
                </Form.Item>
                {canManage && (
                  <Button type="primary" htmlType="submit">
                    Save Changes
                  </Button>
                )}
              </Form>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileTextOutlined className="text-6xl text-[#555] mb-4" />
                <h3 className="text-xl text-[#888] mb-2">No Prompt Selected</h3>
                <p className="text-[#666] text-sm">
                  {promptGuideTypes.length === 0
                    ? canManage
                      ? "Create a prompt type and add your first prompt template"
                      : "No prompts available yet"
                    : "Select a prompt from the list to view or edit"}
                </p>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Type Modal */}
      <Modal
        title="Create Prompt Type"
        open={isTypeModalOpen}
        onCancel={() => setIsTypeModalOpen(false)}
        onOk={() => typeForm.submit()}
        width={isMobile ? "75%" : 500}
      >
        <Form form={typeForm} onFinish={handleCreateType} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Guide Modal */}
      <Modal
        title="Create Prompt Guide"
        open={isGuideModalOpen}
        onCancel={() => setIsGuideModalOpen(false)}
        onOk={() => guideForm.submit()}
      >
        <Form form={guideForm} onFinish={handleCreateGuide} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {/* Default Status */}
          <Form.Item name="status" initialValue={true} hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromptGuideComponent;
