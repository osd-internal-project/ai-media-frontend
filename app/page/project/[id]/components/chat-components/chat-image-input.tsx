import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import {
  Check,
  ChevronDown,
  FileText,
  ImageIcon,
  ImagePlus,
  LinkIcon,
  Presentation,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Zap,
} from "lucide-react";
import {
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Popover,
  Slider,
  Tooltip,
  Upload,
  type UploadFile,
} from "antd";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptPopover from "./prompt-popover";
const { TextArea } = Input;
type Props = {
  setGroupMode: (groupMode: string) => void;
  groupMode: string;
  setSelectedRatio: (ratio: string) => void;
  selectedRatio: string;
  setSelectedResolution: (resolution: string) => void;
  selectedResolution: string;
  setSelectedMaximumImage: (selectedMaximumImage: number) => void;
  selectedMaximumImage: number;
  form: FormInstance;
  files: UploadFile[];
  handleUploadChange: (info: UploadChangeParam) => void;
  beforeUpload: (file: RcFile) => boolean;
  onRemoveFile: (file: UploadFile) => void;
  submitting: boolean;
  handleSendMessage: (values: any) => void;
  isLoadingUpload: boolean;
  setSelectedWidth: (width: number) => void;
  setSelectedHeight: (height: number) => void;
  promptGuideTemplates: TPromptGuideTemplate[];
  fetchImagePromptGuides: () => void;
  handleUsePromptGuide: (prompt: TPromptGuide) => void;
  usedCredit: { used?: number; total?: number };
};

export default function ChatImageInput({
  setGroupMode,
  groupMode,
  selectedRatio,
  setSelectedRatio,
  selectedResolution,
  setSelectedResolution,
  selectedMaximumImage,
  setSelectedMaximumImage,
  form,
  files,
  handleUploadChange,
  beforeUpload,
  onRemoveFile,
  submitting,
  handleSendMessage,
  isLoadingUpload,
  setSelectedWidth,
  setSelectedHeight,
  promptGuideTemplates,
  fetchImagePromptGuides,
  handleUsePromptGuide,
  usedCredit,
}: Props) {
  const RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
    "1:1": { width: 2048, height: 2048 },
    "4:3": { width: 2304, height: 1728 },
    "3:4": { width: 1728, height: 2304 },
    "16:9": { width: 2560, height: 1440 },
    "9:16": { width: 1440, height: 2560 },
    "3:2": { width: 2496, height: 1664 },
    "2:3": { width: 1664, height: 2496 },
    "21:9": { width: 3024, height: 1296 },
  };

  const groupModes = [
    {
      id: "auto",
      label: "Automatic",
      description: "Automatic trigger group diagram capability",
    },
    {
      id: "story",
      label: "Storybook",
      description: "Create an exclusive picture book",
    },
    {
      id: "comics",
      label: "Comics",
      description: "Generate anime and comic strips in one sentence",
    },
    {
      id: "disabled",
      label: "None",
      description: "No group generation mode",
    },
  ];

  const getRatioIcon = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return <Square size={14} />;
      case "9:16":
      case "3:4":
      case "2:3":
        return <RectangleVertical size={14} />;
      case "16:9":
      case "4:3":
      case "3:2":
      case "21:9":
        return <RectangleHorizontal size={14} />;
      default:
        return <Square size={14} />;
    }
  };

  const handleRatioChange = (ratio: string) => {
    setSelectedRatio(ratio);
    const size = RATIO_SIZE_MAP[ratio];
    if (size) {
      const scaleFactor = selectedResolution === "4k" ? 1.414 : 1;
      const newWidth = Math.round(size.width * scaleFactor);
      const newHeight = Math.round(size.height * scaleFactor);
      setSelectedWidth(newWidth);
      setSelectedHeight(newHeight);
      form.setFieldsValue({
        width: newWidth,
        height: newHeight,
        ratio: ratio,
      });
    }
  };

  const ratioOptions = Object.keys(RATIO_SIZE_MAP).map((ratio) => ({
    label: ratio,
    key: ratio,
    icon: getRatioIcon(ratio),
    onClick: () => handleRatioChange(ratio),
  }));

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    form.setFieldValue("resolution", resolution);

    const currentRatio = selectedRatio;
    const baseSize = RATIO_SIZE_MAP[currentRatio];

    if (baseSize) {
      const scaleFactor = resolution === "4k" ? 1.414 : 1;
      const newWidth = Math.round(baseSize.width * scaleFactor);
      const newHeight = Math.round(baseSize.height * scaleFactor);
      setSelectedWidth(newWidth);
      setSelectedHeight(newHeight);
      form.setFieldsValue({
        width: newWidth,
        height: newHeight,
      });
    }
  };

  return (
    <div className=" bottom-6 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none pb-4">
      <div className="w-full  pointer-events-auto">
        <div className="bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">
          <Form
            name="basic"
            form={form}
            onFinish={handleSendMessage}
            autoComplete="off"
          >
            {/* Top: Image & Input */}
            <div
              className={`flex gap-3 p-2 ${files.length > 3 ? "flex-col" : "items-start"}`}
            >
              <div className={files.length > 3 ? "w-full" : ""}>
                <Upload
                  listType="picture-card"
                  fileList={files}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  onRemove={onRemoveFile}
                  multiple={true}
                  maxCount={15}
                  showUploadList={true}
                  disabled={isLoadingUpload}
                  // style={{ width: '80px', height: "80px" }}
                >
                  {files.length >= 15 ? null : (
                    <Tooltip
                      title={`Upload files (${files.length}/15)`}
                      placement="top"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                        {isLoadingUpload ? <LoadingOutlined /> : <ImagePlus />}
                        {files.length > 0 && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                            {files.length}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  )}
                </Upload>
              </div>

              <div className="flex flex-1 gap-3 w-full">
                {/* Text Input */}
                <div className="flex-1 min-h-[64px]">
                  <Form.Item
                    name="prompt"
                    style={{ margin: 0, padding: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Please enter your prompt",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      // value={inputText}
                      // onChange={(e) => setInputText(e.target.value)}
                      // onKeyDown={(e) => {
                      //   if (e.key === 'Enter' && !e.shiftKey) {
                      //     e.preventDefault();
                      //     handleSendMessage();
                      //   }
                      // }}
                      placeholder="Enter your prompt according to the uploaded image."
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "transparent",
                        // border: 'none',
                        color: "#e5e7eb", // text-gray-200
                        // resize: 'none',
                        padding: "8px",
                        borderRadius: "0.5rem",
                      }}
                      className="focus:ring-0 placeholder-gray-500 text-sm"
                      // disabled={isLoading || !isConnected}
                      // style={{ fieldSizing: "content" } as any}
                    />
                  </Form.Item>
                </div>

                <div className="flex-shrink-0">
                  <Popover
                    trigger="click"
                    placement="topLeft"
                    onOpenChange={(open) => open && fetchImagePromptGuides()}
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
                {/* Group Image */}
                <Popover
                  trigger="click"
                  placement="topLeft"
                  content={
                    <div className="w-[320px] bg-[#1a1b1e] text-gray-200">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <span className="font-medium">
                          Group generation mode
                        </span>
                        <a
                          href="#"
                          className="text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300"
                        >
                          <FileText size={12} />
                          Tutorial
                        </a>
                      </div>
                      <div className="p-2 space-y-1">
                        {groupModes.map((mode) => (
                          <Button
                            key={mode.id}
                            onClick={() => setGroupMode(mode.id)}
                            style={{
                              width: "100%",
                              height: "auto", // Allow expanding for content
                              display: "block", // Use block to fill width and allow inner alignment
                              textAlign: "left",
                              whiteSpace: "normal", // Allow text wrapping
                              padding: "10px 12px",
                              borderRadius: "0.5rem",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor:
                                groupMode === mode.id
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "transparent",
                              backgroundColor:
                                groupMode === mode.id
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "transparent",
                            }}
                            className={`transition-all ${groupMode === mode.id ? "" : "hover:!bg-white/5"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div
                                  className={`text-sm font-medium mb-0.5 ${
                                    groupMode === mode.id
                                      ? "text-blue-400"
                                      : "text-gray-200"
                                  }`}
                                >
                                  {mode.label}
                                </div>
                                <div className="text-xs text-gray-500 leading-relaxed text-left">
                                  {mode.description}
                                </div>
                              </div>
                              {groupMode === mode.id && (
                                <Check
                                  size={14}
                                  className="text-blue-400 mt-1 flex-shrink-0"
                                />
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
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
                      whiteSpace: "nowrap",
                    }}
                    className="hover:!bg-white/10 transition-colors"
                  >
                    <ImageIcon size={12} />
                    <span>{groupMode}</span>
                    <ChevronDown size={10} className="text-gray-500" />
                  </Button>
                </Popover>

                {/* Settings Popover Content */}
                <Popover
                  trigger="click"
                  placement="topLeft"
                  content={
                    <div className="w-[320px] bg-[#1a1b1e] text-gray-200 p-4 space-y-4">
                      {/* Resolution */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400">
                          Resolution
                        </div>
                        <div className="grid grid-cols-2 p-1 bg-black/20 rounded-lg border border-white/5">
                          {["2k", "4k"].map((res) => (
                            <Button
                              key={res}
                              onClick={() => handleResolutionChange(res)}
                              style={{
                                padding: "6px 0",
                                fontSize: "12px",
                                fontWeight: 500,
                                borderRadius: "0.375rem",
                                backgroundColor:
                                  selectedResolution === res
                                    ? "white"
                                    : "transparent",
                                color:
                                  selectedResolution === res
                                    ? "black"
                                    : "#9ca3af",
                                boxShadow:
                                  selectedResolution === res
                                    ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                                    : "none",
                                border: "none",
                              }}
                              className={`transition-all ${selectedResolution === res ? "" : "hover:!text-gray-200"}`}
                            >
                              {res.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Ratio */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400">
                          Ratio
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {ratioOptions.map((option) => (
                            <Button
                              key={option.key}
                              onClick={option.onClick}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                padding: "8px",
                                borderRadius: "0.5rem",
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor:
                                  selectedRatio === option.key
                                    ? "rgba(59, 130, 246, 0.5)"
                                    : "transparent",
                                backgroundColor:
                                  selectedRatio === option.key
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(255, 255, 255, 0.05)",
                                color:
                                  selectedRatio === option.key
                                    ? "#60a5fa"
                                    : "#9ca3af",
                              }}
                              className={`transition-all ${selectedRatio === option.key ? "" : "hover:!bg-white/10 hover:!text-gray-200"}`}
                            >
                              {option.icon}
                              <span className="text-[10px]">
                                {option.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Image Size */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400">
                          Image size
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                              W
                            </span>
                            <Input
                              type="text"
                              readOnly
                              value={Math.round(
                                (RATIO_SIZE_MAP[selectedRatio]?.width || 0) *
                                  (selectedResolution === "4k" ? 1.414 : 1),
                              )}
                              style={{
                                width: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "0.5rem",
                                paddingTop: "0.375rem",
                                paddingBottom: "0.375rem",
                                paddingLeft: "2rem",
                                paddingRight: "0.75rem",
                                fontSize: "0.75rem",
                                textAlign: "right",
                                color: "#d1d5db", // text-gray-300
                                outline: "none",
                              }}
                            />
                          </div>
                          <LinkIcon size={14} className="text-gray-500" />
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                              H
                            </span>
                            <Input
                              type="text"
                              readOnly
                              value={Math.round(
                                (RATIO_SIZE_MAP[selectedRatio]?.height || 0) *
                                  (selectedResolution === "4k" ? 1.414 : 1),
                              )}
                              style={{
                                width: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "0.5rem",
                                paddingTop: "0.375rem",
                                paddingBottom: "0.375rem",
                                paddingLeft: "2rem",
                                paddingRight: "0.75rem",
                                fontSize: "0.75rem",
                                textAlign: "right",
                                color: "#d1d5db", // text-gray-300
                                outline: "none",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="flex gap-2">
                    {/* Resolution Button Trigger */}
                    <Button
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        color: "#d1d5db",
                        minWidth: "3rem",
                      }}
                      className="hover:!bg-white/10 transition-colors"
                    >
                      {selectedResolution.toUpperCase()}
                    </Button>

                    {/* Ratio Button Trigger */}
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        color: "#d1d5db",
                      }}
                      className="hover:!bg-white/10 transition-colors"
                    >
                      {getRatioIcon(selectedRatio)}
                      <span>{selectedRatio}</span>
                    </Button>
                  </div>
                </Popover>

                {/* Count */}
                <Popover
                  trigger="click"
                  placement="topLeft"
                  content={
                    <div className="w-[300px] bg-[#1a1b1e] text-gray-200 p-4 space-y-4">
                      <div className="text-gray-400 text-sm">
                        maximum number of generated sheets
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Slider
                            min={1}
                            max={15}
                            value={selectedMaximumImage}
                            onChange={(value) => {
                              setSelectedMaximumImage(value);
                            }}
                            tooltip={{ open: false }}
                            styles={{
                              track: { background: "white" },
                              handle: {
                                borderColor: "white",
                                background: "white",
                              },
                              rail: { background: "rgba(255,255,255,0.1)" },
                            }}
                          />
                        </div>
                        <InputNumber
                          min={1}
                          max={15}
                          value={selectedMaximumImage}
                          onChange={(value) => {
                            if (value) {
                              setSelectedMaximumImage(value);
                            }
                          }}
                          className="!bg-white !border-white/10 !text-black rounded-lg w-16 !shadow-none [&_.ant-input-number-input]:!text-center [&_.ant-input-number-input]:!text-black"
                        />
                      </div>
                    </div>
                  }
                >
                  <Button
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "12px",
                      color: "#d1d5db",
                      minWidth: "3rem",
                    }}
                    className="hover:!bg-white/10 transition-colors"
                  >
                    {selectedMaximumImage}pcs
                  </Button>
                </Popover>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-white/5 ">
                <span className="text-sm text-gray-500 italic">{`${usedCredit?.used ? usedCredit?.used?.toFixed(2) : 0} / ${usedCredit?.total || "-"}`}</span>
                <Button
                  htmlType="submit"
                  // onClick={handleSendMessage}
                  disabled={submitting}
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2563eb", // bg-blue-600
                    color: "white",
                    borderRadius: "0.5rem",
                    boxShadow:
                      "0 10px 15px -3px rgba(30, 58, 138, 0.2), 0 4px 6px -2px rgba(30, 58, 138, 0.2)", // shadow-lg shadow-blue-900/20
                    border: "none",
                  }}
                  className="hover:!bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  icon={<Zap size={18} fill="currentColor" />}
                  loading={submitting}
                >
                  {/* {isLoading ? (
                        <span className="animate-spin text-lg">⟳</span>
                      ) : (
                        <Zap size={18} fill="currentColor" />
                      )} */}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
