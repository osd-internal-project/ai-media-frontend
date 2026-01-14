import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
  type ReactElement,
} from "react";
import { PermissionGuard } from "../../../../components/PermissionGuard";
import { projectPermissions } from "../../../../utils/permissions";
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
  Divider,
  Drawer,
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
import config from "@/app/config";

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
  activeKey: "image" | "vdo" | "library" | "activity";
  projectRole?: string | null;
  promptGuideTypes?: TPromptGuideType[];
  promptGuideOpenStatus?: boolean;
  username?: string;
  selectedAIModel?: TAIModel | null;
  setDisableTab: (disable: boolean) => void;
  onSetPromptTextRef?: React.MutableRefObject<
    ((id: number) => Promise<void>) | null
  >;
}

interface ChatMessage {
  id?: string;
  galleryId?: string;
  type: "user" | "ai";
  content?: string;
  images?: { id?: string; imageUrl: string; status?: boolean }[];
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
  genneratedStatus: string;
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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getResolutionLabel = (res: string) => {
    switch (res) {
      case "2k":
        return "2K";
      case "4k":
        return "4K";
      case "Unknown":
        return "?";
      default:
        return "?";
    }
  };

  return (
    <>
      <div className="my-1 px-3 p-1 bg-[#1e1e21] rounded-lg border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1 text-sm">
            {isMobile ? null : (
              <span className="text-white font-medium">Smart Reference</span>
            )}
            <span className="text-purple-400 font-medium">
              {getResolutionLabel(resolution)}
            </span>
            <span className="text-gray-400">{ratio}</span>
            {imageCount > 1 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-xs text-white">📷</span>
                </div>
                <span className="text-blue-400 text-xs">
                  {imageCount} images
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-blue-400 text-xs">
                {selectedAIModel?.name || "Unknown Model"}
              </span>
            </div>
          </div>

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
                        console.error(
                          `Reference image ${index + 1} failed to load:`,
                          imageUrl
                        );
                      }}
                    />
                  </div>
                </Tooltip>
              ))
            ) : (
              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                <span className="text-xs text-gray-400">
                  +{referenceImages.length - 3}
                </span>
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
  projectRole,
  promptGuideTypes = [],
  promptGuideOpenStatus,
  username,
  selectedAIModel,
  setDisableTab,
  onSetPromptTextRef,
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
  const [currentId, setCurrentId] = useState<string | undefined>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const pageSize = 3;

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const shouldAutoScrollRef = useRef<boolean>(false);
  const isAtBottomRef = useRef<boolean>(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!projectId) return; // Changed from userId to projectId
    const url = `${config.backendCoreUrl}/generate-image/sse/project/${projectId}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.galleryId) {
          fetchMessages(page, false, currentId);
          // const messageDetail = messages;
          // console.log("data", data);
          // const messageIndex = messageDetail.findIndex(
          //   (msg) => msg.taskId === data.galleryId
          // );
          // messageDetail[messageIndex] = {
          //   ...messages[messageIndex],
          //   status: data.status,
          //   images: data.url ? [{ imageUrl: data.url }] : [],
          // };
          // console.log("messageDetail", messageDetail);
          // setMessages(messageDetail);
          // setMessages((prev) =>
          //   prev.map((msg) => {
          //     if (
          //       msg.galleryId === data.galleryId ||
          //       (data.taskId && msg.taskId === data.taskId)
          //     ) {
          //       return {
          //         ...msg,
          //         status: data.status,
          //         images: data.url ? [{ imageUrl: data.url }] : msg.images,
          //         taskId: data.taskId || msg.taskId, // update taskId if needed
          //       };
          //     }
          //     return msg;
          //   })
          // );
        }
      } catch (e) {
        console.error("SSE Error", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]); // Changed dependency to projectId

  const fetchMessages = useCallback(
    async (currentPage: number, isLoadMore = false, currentId?: string) => {
      if (!projectId || (isLoadMore && !hasMore) || loading) return;

      setLoading(true);
      setDisableTab(true);
      if (isLoadMore) {
        isLoadingMoreRef.current = true;
      }

      try {
        const skip = currentPage * pageSize;
        const response = currentId
          ? await LogsServices(axiosCore).findImageByFristId(
              projectId,
              currentId
            )
          : await LogsServices(axiosCore).findImageByPage(
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
          const topId = itemsToProcess?.[0]?.id;
          if (topId) {
            setCurrentId(String(topId));
          }
          itemsToProcess.forEach((item: any) => {
            formattedMessages.push({
              type: "user",
              id: item.id,
              content: item.prompt,
              username: item.users.fullname,
              time: item.createdAt,
              taskId: item.taskId,
              status: false,
              genneratedStatus: item.genneratedStatus,
            });
            formattedMessages.push({
              id: item.id,
              type: "ai",
              content: "",
              images: item.imageUrls,
              username: "AI Generator",
              time: item.createdAt,
              taskId: item.taskId,
              status: item.status, // Database status
              genneratedStatus: item.genneratedStatus,
              prompt: item.prompt,
              resolution: item.resolution || "Unknown",
              ratio: item.ratio || "Unknown",
              imageCount: item.imageUrls?.length || 1,
              firstFrameImage: item.referenceImages?.[0] || undefined,
              referenceImages: item.referenceImages || [],
            });
          });

          if (isLoadMore) {
            setMessages((prev) => {
              const existingTaskIds = new Set(prev.map((m) => m.id));
              const uniqueNewMessages = formattedMessages.filter(
                (m) => !existingTaskIds.has(m.id)
              );

              if (uniqueNewMessages.length === 0) {
                setHasMore(false);
                return prev;
              }
              return [...uniqueNewMessages, ...prev];
            });
          } else {
            setMessages(formattedMessages);
            if (
              isFirstLoad.current ||
              isAtBottomRef.current ||
              shouldAutoScrollRef.current
            ) {
              setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                  behavior: isFirstLoad.current ? "instant" : "smooth",
                });
              }, 100);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
        setDisableTab(false);
        if (!isLoadMore) {
          isFirstLoad.current = false;
        }
      }
    },
    [projectId, hasMore, loading]
  );

  useEffect(() => {
    if (activeKey === "image" && projectId) {
      setMessages([]);
      setPage(0);
      setHasMore(true);
      isFirstLoad.current = true;
      isLoadingMoreRef.current = false;
      fetchMessages(0);
    }
  }, [projectId, activeKey]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      50;
    isAtBottomRef.current = isAtBottom;

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

      chatContainerRef.current.style.scrollBehavior = "auto";
      chatContainerRef.current.scrollTop = scrollDiff;

      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.style.scrollBehavior = "smooth";
        }
      });

      isLoadingMoreRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (shouldAutoScrollRef.current && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        shouldAutoScrollRef.current = false;
      }, 100);
    }
  }, [messages.length]);

  const handleUploadChange: UploadProps["onChange"] = ({ fileList }) => {
    setFiles(fileList);
  };

  const beforeUpload = (file: RcFile) => {
    if (files.find((f) => f.name === file.name)) {
      message.warning(`Duplicate file: ${file.name}`);
      return false;
    }

    if (files.length >= 10) {
      messageApi.warning(`Upload limit: 10 files max`);
      return false;
    }

    return false;
  };

  const onDownloadImage = async (imageUrl: string) => {
    try {
      const urlWithoutParams = imageUrl.split("?")[0];
      const filename = urlWithoutParams.split("/").pop() || "image.jpg";

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
    id: string,
    currentStatus?: boolean
  ) => {
    try {
      const nextStatus = currentStatus && currentStatus == true ? false : true;
      const success = await GalleryServices(axiosCore).updateStatus(
        id,
        nextStatus
      );
      console.log("status", nextStatus);
      console.log("success", success);
      // fetchMessages(page, false, currentId);

      if (success) {
        message.success("Share status updated");
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.taskId === taskId)
              return {
                ...msg,
                images: msg.images?.map((image) =>
                  image.id === id ? { ...image, status: nextStatus } : image
                ),
              };
            return msg;
          })
        );
      }
    } catch (error) {
      console.error("Share update failed", error);
    }
  };

  const onFinish = async (values: ITFromGenerate) => {
    setSubmitting(true);
    shouldAutoScrollRef.current = true;

    const userMessage: ChatMessage = {
      type: "user",
      content: values.text,
      username: username,
      time: new Date().toISOString(),
      genneratedStatus: "PENDING",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      text: undefined,
    });
    setFiles([]);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const payload = {
        ...values,
        projectId,
        userId,
        modelName: selectedAIModel?.name,
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

      if (response && response.status === 200 && response.data) {
        // Optimistic AI Message
        const galleryItem = response.data;
        const aiMessage: ChatMessage = {
          type: "ai",
          galleryId: galleryItem.id,
          content: "",
          username: "AI Generator",
          time: new Date().toISOString(),
          genneratedStatus: galleryItem.genneratedStatus || "PENDING",
          prompt: values.text,
          resolution: values.resolution || "Unknown",
          ratio: values.ratio || "Unknown",
          imageCount: values.images || 1,
          images: [], // initially empty or until success
          referenceImages: [],
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        messageApi.error(
          `${
            typeof response.data === "string"
              ? response.data
              : "Error creation failed"
          }`
        );
        setMessages((prev) => prev.slice(0, -1));
        shouldAutoScrollRef.current = false;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "An error occurred";
      messageApi.error(msg);
      setMessages((prev) => prev.slice(0, -1));
      shouldAutoScrollRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedImageCount, setSelectedImageCount] = useState<number>(1);
  const [selectedResolution, setSelectedResolution] = useState<string>("2k");

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

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    form.setFieldValue("resolution", resolution);

    const currentRatio = selectedRatio;
    const baseSize = RATIO_SIZE_MAP[currentRatio];

    if (baseSize) {
      const scaleFactor = resolution === "4k" ? 1.414 : 1;
      const newWidth = Math.round(baseSize.width * scaleFactor);
      const newHeight = Math.round(baseSize.height * scaleFactor);

      form.setFieldsValue({
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const ratioOptions = Object.keys(RATIO_SIZE_MAP).map((ratio) => ({
    label: ratio,
    key: ratio,
    onClick: () => handleRatioChange(ratio),
  }));

  const imageCountOptions = Array.from({ length: 2 }, (_, i) => i + 1).map(
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

  useEffect(() => {
    if (activeKey === "image" && onSetPromptTextRef) {
      onSetPromptTextRef.current = onSetPromptText;
    }
    return () => {
      if (onSetPromptTextRef && activeKey === "image") {
        onSetPromptTextRef.current = null;
      }
    };
  }, [activeKey, onSetPromptTextRef]);

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
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 scroll-smooth space-y-6"
          >
            {!loading && messages.length === 0 && (
              <div className="text-white pt-10 px-5 flex-1 overflow-auto">
                <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedream 4.5`}</h1>
                <p className="text-gray-400 text-center mb-13">
                  {`Kickstart your innovation process with our comprehensive selection of predefined prompts.`}
                </p>
                <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                  {promptGuideTypes.map((type) => (
                    <div key={type.id}>
                      <div className="flex items-center justify-center mb-3"></div>
                      <h3 className="text-xl font-semibold text-center mb-3">
                        {type.title}
                      </h3>
                      <div className="space-y-3 w-full">
                        {type.promptGuide?.map(
                          (item: TPromptGuide, index: number) => (
                            <Button
                              htmlType="button"
                              key={item.id || index}
                              size="large"
                              onClick={() =>
                                item.id && onSetPromptText(item.id)
                              }
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

            {loading && hasMore && (
              <div className="flex justify-center py-2">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={`${msg.id}-${index}`}>
                <div
                  key={`${msg.id}-${index}`}
                  className={`flex gap-4 ${
                    msg.type === "user"
                      ? "justify-end border-t-2 pt-2 border-white/10 "
                      : "justify-start"
                  }`}
                >
                  {msg.type === "ai" && <Avatar src={Avatars.src} size={40} />}
                  <div
                    className={`flex flex-col  ${
                      msg.type === "user" ? "flex-1 items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                      <span>{msg.username}</span>
                      <span>•</span>
                      <span>
                        {new Date(msg.time).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(msg.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {msg.content && (
                      <div
                        className={`px-3 py-1 rounded-2xl text-sm leading-relaxed shadow-md
                        ${
                          msg.type === "user"
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                            : "bg-[#27272a] text-gray-200 border border-white/5 rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                    {msg.type === "ai" && (
                      <>
                        <ImageConfigurationCard
                          selectedAIModel={selectedAIModel}
                          firstFrameImage={msg.firstFrameImage}
                          resolution={msg.resolution || "4k"}
                          ratio={msg.ratio || "1:1"}
                          imageCount={
                            msg.imageCount ||
                            (msg.images ? msg.images.length : 1)
                          }
                          referenceImages={msg.referenceImages}
                        />
                        {(msg.genneratedStatus === "PENDING" ||
                          msg.genneratedStatus === "PROCESSING") && (
                          <div className="mt-1 p-2 bg-[#1e1e21] rounded-lg border border-white/5 flex items-center gap-3">
                            <Spin
                              indicator={
                                <LoadingOutlined
                                  style={{ fontSize: 24 }}
                                  spin
                                />
                              }
                            />
                            <span className="text-gray-300">
                              Generating images... ({msg.genneratedStatus})
                            </span>
                          </div>
                        )}

                        {(msg.genneratedStatus === "FAIL" ||
                          (msg.genneratedStatus === "SUCCESS" &&
                            !msg.images)) && (
                          <div className="mt-1 p-2 bg-red-900/20 rounded-lg border border-red-500/20 text-red-400">
                            Generate failed
                          </div>
                        )}
                        {msg.genneratedStatus === "SUCCESS" &&
                          msg.images &&
                          msg.images.length > 0 && (
                            <div
                              // className={`grid gap-3 mt-3 w-full ${
                              //   msg.images.length > 1
                              //     ? "grid-cols-3"
                              //     : "grid-cols-3"
                              // }`}
                              className=" w-full flex gap-2"
                            >
                              {msg.images.map((img, i) => (
                                <div
                                  key={i}
                                  className=" min-w-[100px] w-1/6 max-w-[200px] relative group rounded-xl overflow-hidden border border-white/10 bg-black/50 cursor-pointer"
                                  onClick={() => handleImageClick(img.imageUrl)}
                                >
                                  <Image
                                    src={img.imageUrl}
                                    alt="Generated image"
                                    width={50}
                                    height={50}
                                    className="w-full h-auto object-cover"
                                    unoptimized
                                  />
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
                                        img.status === true ? ( // status is flexible
                                          <LikeFilled className=" !text-yellow-500 opacity-100 !text-yellow-500" />
                                        ) : (
                                          <LikeOutlined />
                                        )
                                      }
                                      className="!bg-black/60 !text-white !border-none  hover:!bg-black/80"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (img.id && msg.taskId) {
                                          onShareImage(
                                            msg.taskId,
                                            img.id,
                                            msg?.status
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </>
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
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
          <div className=" p-4 z-10 bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-2">
            <div className="max-w-6xl mx-auto relative bg-[#27272a] rounded-3xl p-1 border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-2xl">
              <PermissionGuard
                roles={projectPermissions.useChat}
                userRole={projectRole}
                fallback={
                  <div className="p-4 text-center text-zinc-400 bg-[#18181b] rounded-3xl border border-white/10">
                    <p className="text-lg font-medium mb-2">
                      🚫 Access Restricted
                    </p>
                    <p className="text-sm">
                      You need USER or ADMIN role to use the chat feature.
                    </p>
                    <p className="text-xs mt-1 text-zinc-500">
                      Contact your project administrator for access.
                    </p>
                  </div>
                }
              >
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
                                setFiles(
                                  files.filter((f) => f.uid !== file.uid)
                                );
                              }}
                            >
                              <Trash size={12} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Form.Item
                          name="image"
                          className="mb-0"
                          style={{ marginBottom: 0, lineHeight: 1 }}
                        >
                          <Upload
                            listType="picture"
                            fileList={files}
                            onChange={handleUploadChange}
                            beforeUpload={beforeUpload}
                            multiple={true}
                            maxCount={10}
                            showUploadList={false}
                            disabled={submitting}
                          >
                            <Tooltip
                              title={`Upload files (${files.length}/10)`}
                              placement="top"
                            >
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer relative">
                                <PaperClipOutlined className="text-lg" />
                                {files.length > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {files.length}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          </Upload>
                        </Form.Item>

                        <Select
                          value={selectedResolution}
                          onChange={handleResolutionChange}
                          variant="borderless"
                          popupMatchSelectWidth={false}
                          disabled={submitting}
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
              </PermissionGuard>
            </div>
            <div className="text-center mt-3 text-xs text-zinc-500 space-y-1">
              <div>
                AI can make mistakes. Please check the generated images.
              </div>
              {files.length > 0 && (
                <div className="text-blue-400">📎 {files.length}/10 files</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isMobile && (
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
                              htmlType="button"
                              key={item.id || index}
                              size="large"
                              onClick={() =>
                                item.id && onSetPromptText(item.id)
                              }
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
      )}
    </div>
  );
};

export default ImageChat;
