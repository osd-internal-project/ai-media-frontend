import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import {
  ArrowRightLeft,
  AudioLines,
  ChevronDown,
  Eye,
  ImagePlus,
  Presentation,
  RefreshCcw,
  SlidersHorizontal,
  X,
  Zap,
  ZapIcon,
  ZapOff,
} from "lucide-react";
import {
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Popover,
  Tooltip,
  Upload,
  type UploadFile,
  Image,
} from "antd";
import { RcFile } from "antd/es/upload";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptPopover from "./prompt-popover";

const { TextArea } = Input;
type Props = {
  setSelectedRatio: (ratio: string) => void;
  selectedRatio: string;
  setSelectedResolution: (resolution: string) => void;
  selectedResolution: string;
  form: FormInstance;
  filesFirst: UploadFile[];
  filesLast: UploadFile[];
  handleUploadChange: ({
    index,
    file,
    fileList,
    status,
  }: {
    index: number;
    file: UploadFile;
    fileList: UploadFile[];
    status: "upload" | "remove";
  }) => void;
  handleSendMessage: (values: any) => void;
  isLoadingUpload: boolean;
  submitting: boolean;
  setSelectedDuration: (duration: number) => void;
  selectedDuration: number;
  setDraftMode: (draftMode: boolean) => void;
  draftMode: boolean;
  setFastMode: (fastMode: boolean) => void;
  fastMode: boolean;
  onRemoveFile: (file: UploadFile) => void;
  setSelectedWidth: (width: number) => void;
  setSelectedHeight: (height: number) => void;
  promptGuideTemplates: TPromptGuideTemplate[];
  fetchVideoPromptGuides: () => Promise<void>;
  handleUsePromptGuide: (template: TPromptGuide) => void;
};

export default function ChatDreamactorInput({
  selectedResolution,
  setSelectedResolution,
  form,
  filesFirst,
  filesLast,
  handleUploadChange,
  handleSendMessage,
  isLoadingUpload,
  submitting,
  setFastMode,
  fastMode,
  onRemoveFile,
  promptGuideTemplates,
  fetchVideoPromptGuides,
  handleUsePromptGuide,
}: Props) {
  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    form.setFieldValue("resolution", resolution);

    // const currentRatio = selectedRatio;
    // const baseSize = RATIO_SIZE_MAP[currentRatio];

    // if (baseSize) {
    //   const scaleFactor = resolution === "4k" ? 1.414 : 1;
    //   const newWidth = Math.round(baseSize.width * scaleFactor);
    //   const newHeight = Math.round(baseSize.height * scaleFactor);
    //   setSelectedWidth(newWidth);
    //   setSelectedHeight(newHeight);
    //   form.setFieldsValue({
    //     width: newWidth,
    //     height: newHeight,
    //   });
    // }
  };

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState("");
  const lastProcessedUid = React.useRef<string>("");

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className=" bottom-6 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none pb-4">
      <div className="w-full max-w-4xl pointer-events-auto">
        <div className="bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">
          <Form
            name="video"
            form={form}
            onFinish={handleSendMessage}
            autoComplete="off"
          >
            {/* Top: Image & Input */}
            <div className="flex items-start p-2 gap-3">
              {/* Upload Group */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* First Frame */}
                <div className="w-[70px] h-[70px]">
                  <Upload
                    accept="jpeg, jpg, png"
                    listType="picture-card"
                    fileList={filesFirst[0] ? [filesFirst[0]] : []}
                    onChange={({ fileList }) => {
                      const newFile = fileList[fileList.length - 1]; // Get latest
                      if (!newFile) return;

                      // Deduplicate calls
                      if (newFile.uid === lastProcessedUid.current) return;
                      lastProcessedUid.current = newFile.uid;

                      const newFiles = [...filesFirst];
                      if (fileList.length === 0) {
                        // Removed
                        newFiles.shift(); // Remove first
                      } else {
                        // Added/Updated
                        newFiles[0] = newFile;
                      }
                      handleUploadChange({
                        index: 0,
                        file: newFile,
                        fileList: newFiles,
                        status: "upload",
                      } as any);
                    }}
                    onRemove={onRemoveFile}
                    maxCount={1}
                    showUploadList={false}
                    disabled={isLoadingUpload}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px dashed #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                    className="w-full h-full [&>.ant-upload]:!w-full [&>.ant-upload]:!h-full [&>.ant-upload]:!border-none hover:[&>.ant-upload]:none transition-all"
                  >
                    {filesFirst[0] ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          borderRadius: "0.5rem",
                        }}
                        className="group"
                      >
                        <Image
                          src={
                            filesFirst[0].url ||
                            filesFirst[0].thumbUrl ||
                            (filesFirst[0].originFileObj
                              ? URL.createObjectURL(filesFirst[0].originFileObj)
                              : "")
                          }
                          alt="Avatar"
                          style={{ objectFit: "cover" }}
                        />
                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                          style={{ transition: "opacity 0.2s ease-in-out" }}
                        >
                          <div
                            className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(filesFirst[0]);
                            }}
                          >
                            <Eye size={14} className="text-white" />
                          </div>
                          <div className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur-sm cursor-pointer transition-colors">
                            <RefreshCcw size={14} className="text-white" />
                          </div>
                          <div
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 p-1 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFiles = [...filesFirst];
                              newFiles.shift();
                              lastProcessedUid.current = "";
                              handleUploadChange({
                                index: 0,
                                file: filesFirst[0],
                                fileList: newFiles,
                                status: "remove",
                              } as any);
                            }}
                          >
                            <X size={10} className="text-white" />
                          </div>
                        </div>
                      </div>
                    ) : isLoadingUpload ? (
                      <LoadingOutlined />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          color: "#71717a",
                        }}
                      >
                        <ImagePlus size={16} />
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            lineHeight: 1,
                            textAlign: "center",
                          }}
                        >
                          Avatar{" "}
                        </span>
                      </div>
                    )}
                  </Upload>
                </div>

                {/* Arrow Separator */}
                <div className="text-zinc-600">
                  <ArrowRightLeft size={14} />
                </div>

                {/* Last Frame */}
                <div className="w-[70px] h-[70px]">
                  <Upload
                    accept="mp4, mov, webm"
                    listType="picture-card"
                    fileList={filesLast[0] ? [filesLast[0]] : []}
                    onChange={({ fileList }) => {
                      const newFile = fileList[fileList.length - 1];
                      if (!newFile) return;

                      // Deduplicate calls
                      if (newFile.uid === lastProcessedUid.current) return;
                      lastProcessedUid.current = newFile.uid;

                      const newFiles = [...filesLast];
                      if (fileList.length === 0) {
                        // Removed
                        newFiles.pop(); // Remove last (index 1)
                      } else {
                        // Added/Updated
                        newFiles[1] = newFile;
                      }
                      const cleaned = newFiles.filter(Boolean);
                      handleUploadChange({
                        index: 1,
                        file: newFile,
                        fileList: cleaned,
                        status: "upload",
                      } as any);
                    }}
                    onRemove={() => {}}
                    maxCount={1}
                    showUploadList={false}
                    disabled={isLoadingUpload}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px dashed #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                    className="w-full h-full [&>.ant-upload]:!w-full [&>.ant-upload]:!h-full [&>.ant-upload]:!border-none hover:[&>.ant-upload]:none transition-all"
                  >
                    {filesLast[0] ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          borderRadius: "0.5rem",
                        }}
                        className="group"
                      >
                        <div className="flex flex-col items-center justify-center gap-1 w-full h-full bg-[#1e1e21]">
                          <AudioLines size={24} className="text-blue-400" />
                          <span className="text-[10px] text-gray-400 truncate max-w-[60px] px-1">
                            {filesLast[0].name}
                          </span>
                        </div>
                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                          style={{ transition: "opacity 0.2s ease-in-out" }}
                        >
                          <div
                            className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(filesLast[0]);
                            }}
                          >
                            <Eye size={14} className="text-white" />
                          </div>
                          <div className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur-sm cursor-pointer transition-colors">
                            <RefreshCcw size={14} className="text-white" />
                          </div>
                          <div
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 p-1 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFiles = [...filesLast];
                              newFiles.pop();
                              lastProcessedUid.current = "";
                              handleUploadChange({
                                index: 1,
                                file: filesLast[0],
                                fileList: newFiles,
                                status: "remove",
                              } as any);
                            }}
                          >
                            <X size={10} className="text-white" />
                          </div>
                        </div>
                      </div>
                    ) : isLoadingUpload ? (
                      <LoadingOutlined />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          color: "#71717a",
                        }}
                      >
                        <AudioLines size={16} />
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            lineHeight: 1,
                            textAlign: "center",
                          }}
                        >
                          Audio
                        </span>
                      </div>
                    )}
                  </Upload>
                </div>
              </div>

              {/* Text Input Area */}
              <div className="flex flex-1 gap-3 w-full">
                <div className="flex-1 relative h-[70px]">
                  <Form.Item
                    name="prompt"
                    style={{ margin: 0, padding: 0, height: "100%" }}
                  >
                    <TextArea
                      placeholder="(Optional) Enter the description based ."
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "transparent",
                        // border: 'none',
                        color: "#e5e7eb", // text-gray-200
                        // resize: 'none',
                        padding: "8px",
                        paddingRight: "40px", // Space for Tpl button
                        boxShadow: "none",
                      }}
                      className="focus:ring-0 placeholder-gray-500 text-sm !min-h-full"
                    />
                  </Form.Item>
                </div>
                {/* Tpl Button (Absolute Top Right) */}
                <div className="flex-shrink-0">
                  <Popover
                    trigger="click"
                    placement="topLeft"
                    onOpenChange={(open) => open && fetchVideoPromptGuides()}
                    content={
                      <PromptPopover
                        promptGuideTemplates={promptGuideTemplates}
                        handleUsePromptGuide={handleUsePromptGuide}
                      />
                    }
                  >
                    <Tooltip title="Prompt Template" placement="top">
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 8px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: "0.5rem",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: "10px",
                          color: "#9ca3af",
                          fontWeight: 500,
                        }}
                        className="hover:!bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Presentation size={16} />
                          {/* <div className="text-xs">Template</div> */}
                        </div>
                      </Button>
                    </Tooltip>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Bottom: Settings & Actions */}
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {/* Settings Popover */}
                <Popover
                  trigger="click"
                  placement="topLeft"
                  content={
                    <div
                      style={{
                        width: "440px",
                        backgroundColor: "#1a1b1e",
                        color: "#e5e7eb", // text-gray-200
                        padding: "16px", // p-4
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px", // space-y-4
                      }}
                    >
                      {/* <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-400">
                            Ratio
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                          {[
                            {
                              key: "21:9",
                              value: "21:9",
                              icon: <RectangleHorizontal size={12} />,
                              label: "21:9",
                            },
                            {
                              key: "16:9",
                              value: "16:9",
                              icon: <RectangleHorizontal size={12} />,
                              label: "16:9",
                            },
                            {
                              key: "4:3",
                              value: "4:3",
                              icon: <RectangleHorizontal size={12} />,
                              label: "4:3",
                            },
                            {
                              key: "1:1",
                              value: "1:1",
                              icon: <Square size={12} />,
                              label: "1:1",
                            },
                            {
                              key: "3:4",
                              value: "3:4",
                              icon: <RectangleVertical size={12} />,
                              label: "3:4",
                            },
                            {
                              key: "9:16",
                              value: "9:16",
                              icon: <RectangleVertical size={12} />,
                              label: "9:16",
                            },
                            {
                              key: "Auto",
                              value: "adaptive",
                              icon: <Expand size={12} />,
                              label: "Smart",
                            },
                          ].map((option) => (
                            <Button
                              key={option.key}
                              onClick={() =>
                                handleRatioChange({
                                  key: option.key,
                                  value: option.value,
                                })
                              }
                              className={`!flex !flex-col !items-center !justify-center !h-auto !py-2 !px-0 !border-none !shadow-none hover:!bg-white/10 transition-colors 
                                                                ${selectedRatio === option.key ? "!bg-white/10 !text-blue-400" : "!bg-transparent !text-gray-500"}`}
                            >
                              {option.icon}
                              <span className="text-[10px] mt-1">
                                {option.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>  */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400">
                          Resolution
                        </div>
                        <div className="grid grid-cols-3 p-1 bg-black/20 rounded-lg border border-white/5">
                          {["720p", "1080p"].map((res) => (
                            <Button
                              key={res}
                              onClick={() => handleResolutionChange(res)}
                              className={`!h-8 !border-none !shadow-none !text-xs font-medium transition-colors 
                                                                ${selectedResolution === res ? "!bg-white/10 !text-blue-400" : "!bg-transparent !text-gray-500"}`}
                            >
                              {res}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {/* <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400">
                          Duration
                        </div> 
                        <div className="flex items-center gap-4">
                          <Form.Item name="duration" noStyle>
                            <Slider
                              min={1}
                              max={12}
                              onChange={setSelectedDuration}
                              className="flex-1 [&_.ant-slider-track]:!bg-[#3f3f46] [&_.ant-slider-rail] [&_.ant-slider-handle]:!border-white [&_.ant-slider-handle]"
                              tooltip={{ open: false }}
                            />
                          </Form.Item>
                          <Form.Item name="duration" noStyle>
                            <InputNumber
                              min={1}
                              max={12}
                              onChange={(value) =>
                                value && setSelectedDuration(value)
                              }
                              className="!w-16 !border-none !rounded-lg [&_.ant-input-number-input]:!text-center [&_.ant-input-number-input]:!text-sm"
                              controls={false}
                            />
                          </Form.Item>
                        </div>
                      </div> */}

                      {/* Quantity */}
                      {/* <div className="space-y-2">
                                                <div className="text-xs font-medium text-gray-400">Quantity</div>
                                                <div className="flex items-center gap-4">
                                                    <Form.Item name="quantity" noStyle>
                                                        <Slider
                                                            min={1}
                                                            max={8}
                                                            value={selectedQuantity}
                                                            onChange={setSelectedQuantity}
                                                            className="flex-1 [&_.ant-slider-track]:!bg-[#3f3f46] [&_.ant-slider-rail]:!bg-white/10 [&_.ant-slider-handle]:!border-white [&_.ant-slider-handle]:!bg-white"
                                                            tooltip={{ open: false }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item name="quantity" noStyle>
                                                        <InputNumber
                                                            min={1}
                                                            max={8}
                                                            value={selectedQuantity}
                                                            onChange={(val) => val && setSelectedQuantity(val)}
                                                            className="!w-16 !border-none !rounded-lg [&_.ant-input-number-input]:!text-center [&_.ant-input-number-input]:!text-sm"
                                                            controls={false}
                                                        />
                                                    </Form.Item>
                                                    <span className="text-xs text-gray-500 ml-1">videos</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 text-right">
                                                    Generated based on the image.
                                                </div>
                                            </div> */}
                    </div>
                  }
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "12px",
                      color: "#d1d5db",
                    }}
                    className="hover:!bg-white/10 transition-colors"
                  >
                    <SlidersHorizontal size={14} className="text-gray-400" />
                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                    <div className="flex items-center gap-3">
                      {/* <div className="flex items-center gap-1.5">
                        {getRatioIcon(selectedRatio)}
                        <span>{selectedRatio}</span>
                      </div> */}
                      <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                      <span>{selectedResolution}</span>
                      {/* <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                      <span> 
                        {selectedDuration} s
                      </span> */}
                      {/* <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                            <span>{selectedQuantity} videos</span> */}
                    </div>
                    <ChevronDown size={12} className="text-gray-500 ml-1" />
                  </Button>
                </Popover>
                <Form.Item name="fastMode" noStyle>
                  <div
                    className={` w-[200px] cursor-pointer py-1.5 rounded-lg ${fastMode && "bg-blue-500/10 text-blue-400"} hover:bg-blue-500/20  flex items-center gap-2 transition-colors border border-blue-500/20`}
                    onClick={() => {
                      setFastMode(!fastMode);
                    }}
                  >
                    {fastMode ? <ZapIcon size={16} /> : <ZapOff size={16} />}
                    <span className="text-xs font-medium">Fast Mode</span>
                  </div>
                </Form.Item>
                <Form.Item name="seed" noStyle>
                  <InputNumber
                    placeholder="(Optional) Seed."
                    style={{
                      backgroundColor: "transparent",
                      // border: 'none',
                      width: "100%",
                      color: "#e5e7eb", // text-gray-200
                      // resize: 'none',

                      paddingRight: "40px", // Space for Tpl button
                      boxShadow: "none",
                    }}
                    className="focus:ring-0 placeholder-gray-500 "
                  />
                </Form.Item>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                <Button
                  htmlType="submit"
                  // onClick={handleSendMessage}
                  disabled={submitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2563eb",
                    color: "white",
                    borderRadius: "0.5rem",
                    boxShadow:
                      "0 10px 15px -3px rgba(30, 58, 138, 0.2), 0 4px 6px -2px rgba(30, 58, 138, 0.2)",
                    border: "none",
                  }}
                  className="hover:!bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  icon={<Zap size={18} fill="currentColor" />}
                  loading={submitting}
                ></Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
      <Modal
        open={previewOpen}
        title={null}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        className="[&_.ant-modal-content]:!bg-transparent [&_.ant-modal-content]:!shadow-none [&_.ant-modal-content]:!p-0"
        width="auto"
        closeIcon={
          <span className="bg-black/50 hover:bg-black/80 text-white rounded-full p-1">
            <X size={16} />
          </span>
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="example"
          style={{
            width: "auto",
            maxHeight: "80vh",
            maxWidth: "90vw",
            borderRadius: "8px",
          }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
}
