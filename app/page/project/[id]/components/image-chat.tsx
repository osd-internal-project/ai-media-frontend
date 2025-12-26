import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
  type ReactElement,
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
  Popover,
  Spin,
  Select,
  Row,
  Space,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  PaperClipOutlined,
  SendOutlined,
  LikeOutlined,
  LoadingOutlined,
  DownOutlined,
  UploadOutlined,
  CloseOutlined,
  LikeFilled,
} from "@ant-design/icons";
import Image from "next/image";
import { Download, Share2, Sparkles, Trash } from "lucide-react";
import type { RcFile } from "antd/es/upload";
import type { StaticImageData } from "next/image";

import { axiosCore } from "@/app/lib/axios/axios";
import LogsServices from "@/app/services/logs.service";
import GenerateImageServices from "@/app/services/generate-image.service";
import GalleryServices from "@/app/services/gellory.service";
import Avatars from "@/public/images/Avatar.jpg";
import type { ITFromGenerate } from "@/app/common";
import { TPromptGuideType, TPromptGuide } from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import { TAIModel } from "@/app/common/ai-model.type";

interface ImageChatProps {
  projectId: string;
  userId?: string;
  activeKey: "image" | "vdo" | "omnihuman";
  promptGuideTypes?: TPromptGuideType[];
  promptGuideOpenStatus?: boolean;
  username?: string;
  selectedAIModel?: TAIModel | null;
}

interface ChatMessage {
  id?: string;
  type: "user" | "ai";
  content?: string;
  images?: { imageUrl: string }[];
  username?: string;
  time: string;
  taskId?: string;
  status?: boolean;
  prompt?: string;
  resolution?: string;
  ratio?: string;
  imageCount?: number;
  firstFrameImage?: string;
  referenceImages?: string[];
}

interface ImageConfigurationCardProps {
  selectedAIModel?: TAIModel | null;
  firstFrameImage?: string;
  referenceImages?: string[];
  resolution: string;
  ratio: string;
  imageCount: number;
  prompt?: string;
}

const ImageConfigurationCard: React.FC<ImageConfigurationCardProps> = ({
  selectedAIModel,
  firstFrameImage,
  referenceImages,
  resolution,
  ratio,
  imageCount,
}) => {
  
  const getResolutionLabel = (res: string) => {
    switch (res) {
      case "2k": return "2K";
      case "4k": return "4K";
      case "Unknown": return "?";
      default: return "?";
    }
  };

  return (
    <>
      <div className="mt-3 p-3 bg-[#1e1e21] rounded-lg border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar
              src={Avatars.src}
              size={32}
              className="border border-white/10"
            />
          </div>
          
          <div className="flex items-center gap-3 flex-1 text-sm">
            <span className="text-white font-medium">Smart Reference</span>
            <span className="text-purple-400 font-medium">{getResolutionLabel(resolution)}</span>
            <span className="text-gray-400">{ratio}</span>
            {imageCount > 1 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-xs text-white">📷</span>
                </div>
                <span className="text-blue-400 text-xs">{imageCount} images</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-blue-400 text-xs">
                {selectedAIModel?.name || 'Seedream-4.5'}
              </span>
            </div>
          </div>
          
          {/* Multiple Reference Images Preview */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {referenceImages && referenceImages.length > 0 ? (
              referenceImages.slice(0, 3).map((imageUrl, index) => (
                <Tooltip
                  key={index}
                  title={
                    <div className="p-2">
                      <Image
                        src={imageUrl}
                        alt={`Reference ${index + 1}`}
                        width={200}
                        height={200}
                        className="max-w-[200px] max-h-[200px] object-contain rounded"
                        unoptimized
                      />
                    </div>
                  }
                  placement="bottom"
                  mouseEnterDelay={0.3}
                  mouseLeaveDelay={0.1}
                  arrow={false}
                >
                  <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
                    <Image
                      src={imageUrl}
                      alt={`Reference ${index + 1}`}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error(`Reference image ${index + 1} failed to load:`, imageUrl);
                      }}
                    />
                  </div>
                </Tooltip>
              ))
            ) : (
              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" 
                    stroke="#9CA3AF" 
                    strokeWidth="1.5" 
                    fill="none"
                  />
                  <path 
                    d="M4 15L8 11L12 15L16 11L20 15" 
                    stroke="#9CA3AF" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle 
                    cx="8.5" 
                    cy="8.5" 
                    r="1.5" 
                    stroke="#9CA3AF" 
                    strokeWidth="1.5" 
                    fill="none"
                  />
                </svg>
              </div>
            )}
            {referenceImages && referenceImages.length > 3 && (
              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-400">+{referenceImages.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

const ImageChat: FC<ImageChatProps> = ({
  projectId,
  userId,
  activeKey,
  promptGuideTypes = [],
  promptGuideOpenStatus,
  username,
  selectedAIModel,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const notificationApi = notification.useNotification()[0];
  const promptguideService = PromptGuideServices(axiosCore);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const pageSize = 3;

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const shouldAutoScrollRef = useRef<boolean>(false);

  const fetchMessages = useCallback(
    async (currentPage: number, isLoadMore = false) => {
      if (!projectId || (isLoadMore && !hasMore) || loading) return;

      setLoading(true);
      if (isLoadMore) {
        isLoadingMoreRef.current = true;
      }

      try {
        const skip = currentPage * pageSize;
        const response = await LogsServices(axiosCore).findById(
          projectId,
          skip,
          pageSize
        );
        
        if (Array.isArray(response)) {
          if (response.length < pageSize) {
            setHasMore(false);
          }

          const formattedMessages: ChatMessage[] = [];
          const itemsToProcess = [...response].reverse();
          
          itemsToProcess.forEach((item: any) => {
            formattedMessages.push({
              type: "user",
              content: item.prompt,
              username: item.users.fullname,
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status,
            });
            formattedMessages.push({
              type: "ai",
              content: "AICave Generated Images",
              images: item.imageUrls,
              username: "AI Generator",
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status,
              prompt: item.prompt,
              resolution: item.resolution || 'Unknown',
              ratio: item.ratio || 'Unknown',
              imageCount: item.imageUrls?.length || 1,
              firstFrameImage: item.referenceImages?.[0] || undefined,
              referenceImages: item.referenceImages || [],
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
    if (activeKey === "image" && projectId) {
      // Reset state on project change or explicit reload
      setMessages([]);
      setPage(0);
      setHasMore(true);
      isFirstLoad.current = true;
      isLoadingMoreRef.current = false;
      fetchMessages(0);
    }
  }, [projectId, activeKey]);

  // Reference images are now stored in database - no localStorage cleanup needed

  // Scroll Handling for Pagination
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !loading && !isFirstLoad.current) {
      // Save scroll height before loading more
      scrollHeightRef.current = target.scrollHeight;

      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  // Restore scroll position after loading previous messages
  useEffect(() => {
    if (isLoadingMoreRef.current && chatContainerRef.current) {
      // Calculate duplicate shift if any, but simply maintaining position relative to bottom is usually enough
      // New height - Old height = amount of content added to top
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - scrollHeightRef.current;

      chatContainerRef.current.scrollTop = scrollDiff;
      isLoadingMoreRef.current = false;
    }
  }, [messages]);

  // Scroll to bottom on new message send (not on load more)
  useEffect(() => {
    if (shouldAutoScrollRef.current && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        shouldAutoScrollRef.current = false;
      }, 100);
    }
  }, [messages.length]);

  // Handlers
  const handleUploadChange: UploadProps["onChange"] = ({ fileList }) =>
    setFiles(fileList);

  const beforeUpload = (file: RcFile) => {
    if (files.find((f) => f.name === file.name)) {
      message.warning(`Duplicate file: ${file.name}`);
      return false;
    }
    return false;
  };

  const onDownloadImage = async (imageUrl: string) => {
    try {
      // Extract filename from URL (before query parameters)
      const urlWithoutParams = imageUrl.split("?")[0];
      const filename = urlWithoutParams.split("/").pop() || "image.jpg";

      // Fetch the image directly from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      message.success("Image downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      message.error("Download failed");
    }
  };

  const onShareImage = async (
    taskId: string,
    imageUrl: string,
    currentStatus: boolean
  ) => {
    try {
      const success = await GalleryServices(axiosCore).updateShareOptions(
        taskId,
        imageUrl,
        currentStatus
      );
      if (success) {
        message.success("Share status updated");
        // Update local state to reflect change without full reload
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.taskId === taskId)
              return { ...msg, status: !currentStatus }; // Toggle status logic might need refinement based on exact API behavior
            return msg;
          })
        );
        // Or simply refetch current view
        // fetchMessages(0);
      }
    } catch (error) {
      console.error("Share update failed", error);
    }
  };

  const onFinish = async (values: ITFromGenerate) => {
    setSubmitting(true);
    shouldAutoScrollRef.current = true; // Set flag to enable auto-scroll

    // Create user message immediately for optimistic UI
    const userMessage: ChatMessage = {
      type: "user",
      content: values.text,
      username: username, // Use username from props or fallback to "User"
      time: new Date().toISOString(),
    };

    // Add user message to chat immediately
    setMessages((prev) => [...prev, userMessage]);

    // Clear the form immediately
    form.resetFields();
    setFiles([]);

    // Scroll to bottom immediately after adding user message
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const payload = { 
        ...values, 
        projectId, 
        userId,
        modelName: selectedAIModel?.name  // Add selected model name
      };
      
      // Handle File Upload
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
        // Remove the optimistic user message on error
        setMessages((prev) => prev.slice(0, -1));
        shouldAutoScrollRef.current = false; // Cancel auto-scroll on error
      } else {
        // Reference image is now stored automatically in database via backend
        
        // Refetch latest messages to get AI response
        setPage(0);
        await fetchMessages(0);

        // Scroll to bottom after AI response - will be handled by useEffect
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "An error occurred";
      messageApi.error(msg);
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
      shouldAutoScrollRef.current = false; // Cancel auto-scroll on error
    } finally {
      setSubmitting(false);
    }
  };

  // Options
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedImageCount, setSelectedImageCount] = useState<number>(1);

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

  const handleRatioChange = (ratio: string) => {
    setSelectedRatio(ratio);
    const size = RATIO_SIZE_MAP[ratio];
    if (size) {
      form.setFieldsValue({
        width: size.width,
        height: size.height,
        ratio: ratio,
      });
    }
  };

  const ratioOptions = Object.keys(RATIO_SIZE_MAP).map((ratio) => ({
    label: ratio,
    key: ratio,
    onClick: () => handleRatioChange(ratio),
  }));

  const imageCountOptions = Array.from({ length: 10 }, (_, i) => i + 1).map(
    (count) => ({
      label: `${count} image${count > 1 ? "s" : ""}`,
      key: String(count),
      onClick: () => {
        setSelectedImageCount(count);
        form.setFieldValue("images", count);
      },
    })
  );

  async function onSetPromptText(id: number): Promise<void> {
    const prompt = await promptguideService.findById(String(id));
    const text = form.getFieldValue("text");
    form.setFieldValue(
      "text",
      text ? text + "\n\n" + prompt.textPrompt : prompt.textPrompt
    );
  }

  // Initial Form Values - Moved to Form initialValues

  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div
      className={
        promptGuideOpenStatus ? "grid md:grid-cols-4 sm:grid-cols-1 gap-2" : ""
      }
    >
      <div
        className={`h-[calc(100vh-160px)] ${
          promptGuideOpenStatus ? "col-span-3" : ""
        }`}
      >
        {contextHolder}
        {/* Custom Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closePreview}
          >
            <button
              className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={closePreview}
            >
              <CloseOutlined style={{ fontSize: "24px" }} />
            </button>
            <Image
              src={previewImage}
              alt="Preview"
              width={1200}
              height={800}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-50 duration-300"
              onClick={(e) => e.stopPropagation()}
              unoptimized
            />
          </div>
        )}
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
                <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedream 4.5`}</h1>
                <p className="text-gray-400 text-center mb-13">
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
              </div>
            )}

            {/* Loading Spinner for Load More */}
            {loading && hasMore && (
              <div className="flex justify-center py-2">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={`${msg.taskId}-${index}`}
                className={`flex gap-4 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI Avatar */}
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
                  {/* Header Info */}
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

                  {/* Content Bubble */}
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
                  {/* Images Grid (AI Only) */}
                  {msg.type === "ai" && msg.images && msg.images.length > 0 && (
                    <>
                      <ImageConfigurationCard
                        selectedAIModel={selectedAIModel}
                        firstFrameImage={msg.firstFrameImage}
                        resolution={msg.resolution || '4k'}
                        ratio={msg.ratio || '1:1'}
                        imageCount={msg.imageCount || msg.images.length}
                        referenceImages={msg.referenceImages}
                      />
                      
                      <div
                        className={`grid gap-3 mt-3 w-full ${
                          msg.images.length > 1 ? "grid-cols-3" : "grid-cols-3"
                        }`}
                      >
                        {msg.images.map((img, i) => (
                          <div
                            key={i}
                            className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/50 cursor-pointer"
                            onClick={() => handleImageClick(img.imageUrl)}
                          >
                            <Image
                              src={img.imageUrl}
                              alt="Generated image"
                              width={500}
                              height={500}
                              className="w-full h-auto object-cover"
                              unoptimized
                            />
                            {/* Actions Overlay */}
                            <div
                              className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-200 `}
                            >
                              <Button
                                size="small"
                                icon={<Download size={14} />}
                                className="!bg-black/60 !text-white !border-none backdrop-blur-sm hover:!bg-black/80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDownloadImage(img.imageUrl);
                                }}
                              />
                              <Button
                                size="small"
                                icon={
                                  msg.status ? (
                                    <LikeFilled className=" !text-yellow-500 opacity-100 !text-yellow-500" />
                                  ) : (
                                    <LikeOutlined />
                                  )
                                }
                                className="!bg-black/60 !text-white !border-none  hover:!bg-black/80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onShareImage(
                                    msg.taskId!,
                                    img.imageUrl,
                                    msg.status || false
                                  );
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* User Avatar */}
                {msg.type === "user" && (
                  <Avatar
                    icon={<UserOutlined />}
                    size={40}
                    className="bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10"
                  />
                )}
              </div>
            ))}

            {/* Submitting State (Mock AI Typing) */}
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
            {/* Top Tabs */}
            {/* <div className="max-w-8xl mx-auto flex gap-6 mb-2 text-sm font-medium text-gray-400">
                    <button className="text-white border-b-2 border-white pb-1">Text to Image</button>
                    <button className="hover:text-white transition-colors pb-1">Image to Image</button>
                    <div className="ml-auto">
                        <Button
                            size="small"
                            type="text"
                            icon={<Sparkles size={14} />}
                            className="!text-gray-400 hover:!text-white !bg-[#27272a]"
                        >
                            Enhance
                        </Button>
                    </div>
                </div> */}

            <div className="max-w-6xl mx-auto relative bg-[#27272a] rounded-3xl p-1 border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-2xl">
              <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                  type: "image",
                  width: 2048,
                  height: 2048,
                  images: 1,
                  ratio: "1:1",
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
                  {/* Text Area */}
                  <Form.Item
                    name="text"
                    rules={[{ required: true, message: "" }]}
                    style={{ margin: 0 }}
                  >
                    <Input.TextArea
                      placeholder="Describe the image you want to create, in any language"
                      autoSize={{ minRows: 2, maxRows: 5 }}
                      className="!bg-transparent !border-none !text-white !placeholder-gray-500 !shadow-none !p-2 !text-base !resize-none !focus:ring-0"
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
                  {/* Upload List Preview (Custom) */}
                  {files.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {files.map((file: UploadFile) => (
                        <div
                          key={file.uid}
                          className="relative w-12 h-12 rounded overflow-hidden border border-white/20"
                        >
                          <Image
                            src={
                              file.thumbUrl ||
                              (file.originFileObj
                                ? URL.createObjectURL(file.originFileObj)
                                : "")
                            }
                            alt="preview"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                          <div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => {
                              setFiles(files.filter((f) => f.uid !== file.uid));
                            }}
                          >
                            <Trash size={12} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Toolbar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {/* Left Side: Layout matches screenshot with Upload Icon first */}
                      {/* Upload Button */}
                      <Form.Item
                        name="image"
                        className="mb-0"
                        style={{ marginBottom: 0, lineHeight: 1 }}
                      >
                        <Upload
                          listType="picture"
                          // onChange={handleUploadChange}
                          // beforeUpload={beforeUploadFiles}

                          fileList={files}
                          onChange={handleUploadChange}
                          beforeUpload={beforeUpload}
                          multiple={true}
                          maxCount={10}
                          showUploadList={false}
                          disabled={submitting}
                          itemRender={(
                            _originNode,
                            file,
                            _fileList,
                            actions
                          ) => {
                            return (
                              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-2">
                                <Image
                                  src={file.thumbUrl || ''}
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded"
                                  unoptimized
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
                            );
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                            <PaperClipOutlined className="text-lg" />
                          </div>
                        </Upload>
                      </Form.Item>

                      {/* Model Selector */}
                      {/* <Select
                                            value={selectedModel}
                                            onChange={setSelectedModel}
                                            variant="borderless"
                                            popupMatchSelectWidth={false}
                                            suffixIcon={<DownOutlined className="text-[10px] text-zinc-400" />}
                                            className="!bg-[#E6E6FA] !text-[#4F46E5] !h-8 !rounded-lg hover:!bg-[#e0e0ff] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-8 [&_.ant-select-selection-item]:!text-[#4F46E5] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[180px]"
                                            styles={{
                                                popup: {
                                                    root: {
                                                        backgroundColor: '#18181b',
                                                        border: '1px solid #27272a',
                                                        borderRadius: '8px',
                                                        padding: '4px'
                                                    }
                                                }
                                            }}
                                            options={[
                                                {
                                                    value: "Seedream 4.5 Model",
                                                    label: (
                                                        <span className="flex items-center gap-2">
                                                            Seedream 4.5 Model
                                                        </span>
                                                    )
                                                },
                                                {
                                                    value: "Seedream 4.0 Turbo",
                                                    label: (
                                                        <span className="flex items-center gap-2">
                                                            Seedream 4.0 Turbo
                                                        </span>
                                                    )
                                                }
                                            ]}
                                        /> */}

                      {/* Resolution Selector */}
                      <Select
                        value={form.getFieldValue("resolution") || "2k"}
                        onChange={(val) => {
                          form.setFieldValue("resolution", val);
                          // Trigger re-render if needed or just handle form value
                        }}
                        variant="borderless"
                        popupMatchSelectWidth={false}
                        className="!bg-[#3f3f46] !h-8 !rounded-lg hover:!bg-[#52525b] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-3 [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[60px] text-center"
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
                        options={[
                          { value: "2k", label: "2K" },
                          { value: "4k", label: "4K" },
                        ]}
                      />

                      {/* Ratio Selector */}
                      <Select
                        value={selectedRatio}
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
                        options={ratioOptions.map((opt) => ({
                          value: opt.key,
                          label: (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 border border-white rounded-[1px]" />
                              {opt.label}
                            </span>
                          ),
                        }))}
                      />

                      {/* Image Count Selector */}
                      <Select
                        value={String(selectedImageCount)}
                        onChange={(val) => {
                          const count = Number(val);
                          setSelectedImageCount(count);
                          form.setFieldValue("images", count);
                        }}
                        variant="borderless"
                        popupMatchSelectWidth={false}
                        className="!bg-[#3f3f46] !h-8 !rounded-lg hover:!bg-[#52525b] transition-colors [&_.ant-select-selector]:!pl-3 [&_.ant-select-selector]:!pr-3 [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!leading-8 min-w-[80px]"
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
                        options={imageCountOptions.map((opt) => ({
                          value: opt.key,
                          label: opt.label,
                        }))}
                      />
                    </div>

                    {/* Right Side: Generate Button */}
                    {/* <Button
                                    htmlType="submit"
                                    type="primary"
                                    className="!bg-[#eab308] !text-black hover:!bg-[#facc15] !border-none !font-semibold !h-9 !px-6 !rounded-lg flex items-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? <LoadingOutlined /> : <>Generate for Free <Sparkles size={14} /></>}
                                </Button> */}
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
            <div className="text-center mt-3 text-xs text-zinc-500">
              AI can make mistakes. Please check the generated images.{" "}
            </div>
          </div>
        </div>
      </div>{" "}
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

export default ImageChat;
