import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
} from "react";
import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Upload,
  type UploadFile,
  type UploadProps,
  notification,
  Spin,
  Select,
  Space,
} from "antd";
import {
  UserOutlined,
  PaperClipOutlined,
  SendOutlined,
  LikeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { axiosCore } from "@/app/lib/axios/axios";
import LogsServices from "@/app/services/logs.service";
import GenerateImageServices from "@/app/services/generate-image.service";
import GalleryServices from "@/app/services/gellory.service";
import Avatars from "@/public/images/Avatar.jpg";
import VideoPlayer from "./video-player"; // Import the optimized player
import type { ITFromGenerate } from "@/app/common";
import { TPromptGuideType, TPromptGuide } from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import type { RcFile } from "antd/es/upload";
import { Download, Trash } from "lucide-react";

interface VideoChatProps {
  projectId: string;
  userId?: string;
  activeKey: "image" | "vdo" | "omnihuman";
  promptGuideTypes?: TPromptGuideType[];
  promptGuideOpenStatus: boolean;
}

interface ChatMessage {
  id?: string;
  type: "user" | "ai";
  content?: string;
  images?: string[]; // We'll store video URLs here for consistency
  username?: string;
  time: string;
  taskId?: string;
  status?: boolean;
}

const VideoChat: FC<VideoChatProps> = ({
  projectId,
  userId,
  activeKey,
  promptGuideTypes = [],
  promptGuideOpenStatus,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const promptguideService = PromptGuideServices(axiosCore);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const pageSize = 3;

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);

  // Fetch Data (Pagination)
  const fetchMessages = useCallback(
    async (currentPage: number, isLoadMore = false) => {
      if (!projectId || (isLoadMore && !hasMore) || loading) return;

      setLoading(true);
      if (isLoadMore) {
        isLoadingMoreRef.current = true;
      }

      try {
        // Use findVdo for video chat
        const skip = currentPage * pageSize;
        const response = await LogsServices(axiosCore).findVdo(
          projectId,
          skip,
          pageSize
        );

        if (Array.isArray(response)) {
          // Note: findVdo currently returns all (see logs.service.ts), so manual pagination might be needed
          // or if backend doesn't support skip/take for findVdo yet, we handle what we get.
          // Based on LogsService code, findVdo ignores pagination params and returns last 3 days.

          if (response.length < pageSize) {
            setHasMore(false);
          }

          // Process response into ChatMessage format
          const formattedMessages: ChatMessage[] = [];
          const itemsToProcess = [...response].reverse();

          itemsToProcess.forEach((item: any) => {
            // User Message
            formattedMessages.push({
              type: "user",
              content: item.prompt,
              username: item.users.fullname,
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status,
            });
            // AI Message
            formattedMessages.push({
              type: "ai",
              content: "AICave Generated Video",
              images: item.imageUrls, // reusing property for video URLs
              username: "AI Generator",
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status,
            });
          });

          if (isLoadMore) {
            setMessages((prev) => {
              const existingTaskIds = new Set(prev.map((m) => m.taskId));
              const uniqueNewMessages = formattedMessages.filter(
                (m) => !existingTaskIds.has(m.taskId)
              );

              if (uniqueNewMessages.length === 0) {
                setHasMore(false);
                return prev;
              }
              return [...uniqueNewMessages, ...prev];
            });
          } else {
            setMessages(formattedMessages);
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: "instant" });
            }, 100);
          }
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
        if (!isLoadMore) {
          isFirstLoad.current = false;
        }
      }
    },
    [projectId, hasMore, loading]
  );

  // Initial Load
  useEffect(() => {
    if (activeKey === "vdo" && projectId) {
      setMessages([]);
      setPage(0);
      setHasMore(true);
      isFirstLoad.current = true;
      isLoadingMoreRef.current = false;
      fetchMessages(0);
    }
  }, [projectId, activeKey]);

  // Scroll Handling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !loading && !isFirstLoad.current) {
      scrollHeightRef.current = target.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  useEffect(() => {
    if (isLoadingMoreRef.current && chatContainerRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - scrollHeightRef.current;
      chatContainerRef.current.scrollTop = scrollDiff;
      isLoadingMoreRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (
      !isFirstLoad.current &&
      page === 0 &&
      bottomRef.current &&
      !isLoadingMoreRef.current
    ) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [submitting]);

  // Handlers
  const onDownloadVideo = async (videoName: string) => {
    try {
      // Assuming downloadImage works for files generally or we need a similar one for video
      const res = await GenerateImageServices(axiosCore).downloadImage(
        videoName
      );
      const blob = new Blob([res], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = videoName.split("/").pop() || "video.mp4";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Download failed");
    }
  };

  const onFinish = async (values: ITFromGenerate) => {
    setSubmitting(true);
    try {
      let payload: ITFromGenerate = {
        ...values,
        projectId,
        userId,
        type: "vdo",
      };

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("type", "create-attend");
        files.forEach((file) =>
          formData.append("files", file.originFileObj as Blob)
        );
        const uploadedImages = await GenerateImageServices(axiosCore).upload(
          formData
        );
        payload.image = uploadedImages;
      }

      const response = await GenerateImageServices(axiosCore).create(payload);

      if (response.status === 400) {
        messageApi.error(`${response.data}`);
      } else {
        form.resetFields();
        setFiles([]);
        setPage(0);
        setTimeout(() => fetchMessages(0), 2000); // Small delay to allow backend processing if needed
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "An error occurred";
      messageApi.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  async function onSetPromptText(id: number): Promise<void> {
    const prompt = await promptguideService.findById(String(id));
    const text = form.getFieldValue("text");
    form.setFieldValue(
      "text",
      text ? text + "\n\n" + prompt.textPrompt : prompt.textPrompt
    );
  }

  // Common Ratios for Keyframe/Image-to-Video might be same
  const RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "1:1": { width: 1024, height: 1024 },
  };

  const handleRatioChange = (ratio: string) => {
    const size = RATIO_SIZE_MAP[ratio];
    if (size) {
      form.setFieldsValue({
        width: size.width,
        height: size.height,
        ratio: ratio,
      });
    }
  };

  return (
    <div
      className={
        promptGuideOpenStatus ? "grid md:grid-cols-4 sm:grid-cols-1 gap-2" : ""
      }
    >
      <div
        className={`h-[calc(100vh-200px)] ${
          promptGuideOpenStatus ? "col-span-3" : ""
        }`}
      >
        {contextHolder}
        <div className="flex flex-col h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10">
          {/* Chat Area */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-6 pb-40"
          >
            {/* Empty State / Prompt Guides */}
            {!loading && messages.length === 0 && (
              <div className="text-white pt-10 px-5 flex-1 overflow-auto">
                <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedance`}</h1>
                <p className="text-gray-400 text-center mb-10">
                  {`Kickstart your innovation process with our comprehensive selection of predefined prompts.`}
                </p>
                <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                  {promptGuideTypes.map((type) => (
                    <div key={type.id}>
                      <div className="flex items-center justify-center mb-3">
                        {/* <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                                      <span className="text-2xl">💬</span>
                                                    </div> */}
                      </div>
                      <h3 className="text-xl font-semibold text-center mb-3">
                        {type.title}
                      </h3>
                      <div className="space-y-3 w-full">
                        {type.promptGuide?.map(
                          (item: TPromptGuide, index: number) => (
                            <Button
                              htmlType="button" // Prevent form submission
                              key={item.id || index}
                              size="large"
                              onClick={() =>
                                item.id && onSetPromptText(item.id)
                              } // Assuming 'title' is the prompt text, or adjust if there's a specific 'prompt' field
                              className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                            >
                              <span className="flex-1 text-left">
                                {item.title}
                              </span>
                              <span className="ml-auto">→</span>
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
                                <div>
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                            <span className="text-2xl">✏️</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-center mb-3">{`Product Showcase`}</h3>
                                    <div className="space-y-3 w-full">
                                        {["Credit Card Close-up Shots", "Animated Card Reveal", "Transaction Flow Visuals", "Luxury & Premium Experience"].map((item) => (
                                            <Button
                                                htmlType="button"
                                                key={item}
                                                className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                                            >
                                                <span className="flex-1 text-left">{item}</span>
                                                <span className="ml-auto">→</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                            <span className="text-2xl">💡</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-center mb-3">{`Branding & Visuals`}</h3>
                                    <div className="space-y-3">
                                        {["Customer Journey Scenes", "Travel & Freedom", "Future Tech & Innovation", "Everyday Convenience"].map((item) => (
                                            <Button
                                                htmlType="button"
                                                key={item}
                                                className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                                            >
                                                <span className="flex-1 text-left">{item}</span>
                                                <span className="ml-auto">→</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div> */}
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={`${msg.taskId}-${index}`}
                className={`flex gap-4 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "ai" && (
                  <Avatar
                    src={Avatars.src}
                    size={40}
                    className="border border-white/10"
                  />
                )}
                <div
                  className={`flex flex-col max-w-[80%] ${
                    msg.type === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                    <span>{msg.username}</span>
                    <span>•</span>
                    <span>
                      {new Date(msg.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {msg.content && (
                    <div
                      className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md
                                        ${
                                          msg.type === "user"
                                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                                            : "bg-[#27272a] text-gray-200 border border-white/5 rounded-tl-sm"
                                        }`}
                    >
                      {msg.content}
                    </div>
                  )}

                  {/* Video Grid */}
                  {msg.type === "ai" && msg.images && msg.images.length > 0 && (
                    <div
                      className={`grid gap-3 mt-3 w-full ${
                        msg.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {msg.images.map((videoUrl, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/50"
                        >
                          {/* <VideoPlayer
                                                    src={`/api/vdo/${encodeURIComponent(videoUrl)}`}
                                                    className="w-full h-auto object-cover"
                                                /> */}
                          <video
                            src={`http://192.168.31.181:9100/ai-media-image-vdo/cgt-20251216170127-j7557/f03d97d2-7936-4102-bb91-625fc1ecf21c.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=LB7kAwp1rgI1g4d3h0Wa%2F20251218%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251218T032340Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=48373c8ff696c7a600cee2fae426ca67d4a25777ebd6d988e7c1dd82ba2f6320`}
                          />
                          {/* <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        size="small"
                                                        icon={<Download size={14} />}
                                                        className="!bg-black/60 !text-white !border-none backdrop-blur-sm hover:!bg-black/80"
                                                        onClick={() => onDownloadVideo(videoUrl)}
                                                    />
                                                </div> */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="small"
                              icon={<Download size={14} />}
                              className="!bg-black/60 !text-white !border-none backdrop-blur-sm hover:!bg-black/80"
                              onClick={() => onDownloadVideo(videoUrl)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.type === "user" && (
                  <Avatar
                    icon={<UserOutlined />}
                    size={40}
                    className="bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10"
                  />
                )}
              </div>
            ))}

            {submitting && (
              <div className="flex gap-4 justify-start">
                <Avatar
                  src={Avatars.src}
                  size={40}
                  className="border border-white/10"
                />
                <div className="bg-[#27272a] px-5 py-4 rounded-2xl rounded-tl-sm border border-white/5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-10">
            <div className="max-w-6xl mx-auto relative bg-[#27272a] rounded-3xl p-1 border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-2xl">
              <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                  type: "vdo",
                  width: 1280,
                  height: 720,
                  images: 1,
                  ratio: "16:9",
                  resolution: "2k",
                  duration: "10",
                }}
              >
                <Form.Item name="type" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="width" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="height" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="ratio" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="images" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="resolution" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="duration" hidden>
                  <Input />
                </Form.Item>

                <div className="flex flex-col gap-2">
                  <Form.Item
                    name="text"
                    rules={[{ required: true, message: "" }]}
                    style={{ margin: 0 }}
                  >
                    <Input.TextArea
                      placeholder="Describe the video you want to create"
                      autoSize={{ minRows: 2, maxRows: 5 }}
                      className="!bg-transparent !border-none !text-white !placeholder-gray-500 !shadow-none !px-0 !text-base !resize-none !focus:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!submitting) {
                            form.submit();
                          }
                        }
                      }}
                    />
                  </Form.Item>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {/* File Upload (for Image-to-Video if supported) */}
                      <Form.Item
                        name="image"
                        className="mb-0"
                        style={{ marginBottom: 0, lineHeight: 1 }}
                      >
                        <Upload
                          listType="picture"
                          fileList={files}
                          multiple={false} // Maybe single image for video init?
                          maxCount={1}
                          showUploadList={true}
                          disabled={submitting}
                          itemRender={(originNode, file, fileList, actions) => (
                            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-2">
                              <img
                                src={file.thumbUrl}
                                alt=""
                                className="w-12 h-12 object-cover rounded"
                              />
                              <Button
                                size="small"
                                htmlType="button"
                                onClick={actions.remove}
                                type="link"
                                danger
                              >
                                <Trash width={15} />
                              </Button>
                            </div>
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                            <PaperClipOutlined className="text-lg" />
                          </div>
                        </Upload>
                      </Form.Item>

                      {/* Ratio Selector */}
                      <Select
                        defaultValue="16:9"
                        onChange={handleRatioChange}
                        variant="borderless"
                        popupMatchSelectWidth={false}
                        className="!bg-[#3f3f46] !h-8 !rounded-lg hover:!bg-[#52525b] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-3 [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[70px]"
                        styles={{
                          popup: {
                            root: {
                              backgroundColor: "#3f3f46",
                              border: "1px solid #52525b",
                              borderRadius: "8px",
                              padding: "4px",
                            },
                          },
                        }}
                        options={Object.keys(RATIO_SIZE_MAP).map((r) => ({
                          value: r,
                          label: r,
                        }))}
                      />
                    </div>
                    <Button
                      htmlType="submit"
                      size="large"
                      disabled={submitting}
                      className="w-10 h-10 rounded-lg !bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center !border-none !text-zinc-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
                    >
                      <SendOutlined className="text-lg" />
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${
          promptGuideOpenStatus ? " h-[calc(100vh-200px)]  block" : "hidden"
        }`}
      >
        <div className=" h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10">
          <div className="p-4 ">
            <h2 className="text-lg font-semibold mb-2">Prompt Guide</h2>
            <div className="text-sm h-full ">
              <div className="flex-1 h-[calc(100vh-270px)] overflow-y-auto">
                {promptGuideTypes.map((type) => (
                  <div key={type.id}>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 mt-2">
                      {type.title}
                    </h3>
                    <div className="space-y-3 w-full">
                      {type.promptGuide?.map(
                        (item: TPromptGuide, index: number) => (
                          <Button
                            htmlType="button" // Prevent form submission
                            key={item.id || index}
                            size="large"
                            onClick={() => item.id && onSetPromptText(item.id)} // Assuming 'title' is the prompt text, or adjust if there's a specific 'prompt' field
                            className="w-full  !whitespace-normal !break-words !h-auto !p-2 !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center  transition-all duration-300 !border-none"
                          >
                            <Space className=" ">{item.title}</Space>
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
