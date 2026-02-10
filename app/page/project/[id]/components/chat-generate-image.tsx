import React, { useEffect, useRef, useState, type FC } from "react";
import { PermissionGuard } from "../../../../components/PermissionGuard";
import { projectPermissions } from "../../../../utils/permissions";
import {
  Avatar,
  Button,
  Form,
  message,
  type UploadFile,
  type UploadProps,
  notification,
  Spin,
  Space,
  Progress,
  ProgressProps,
  Image,
  Tag,
} from "antd";
import { LikeOutlined, LoadingOutlined, LikeFilled } from "@ant-design/icons";
// import Image from "next/image";
import { Download } from "lucide-react";
import type { RcFile } from "antd/es/upload";

import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import Avatars from "@/public/images/Avatar.jpg";
import {
  TPromptGuideType,
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import { TAIModel } from "@/app/common/ai-model.type";
import ImageConfigurationCard from "./chat-components/image-smart-reference";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import PreviewImage from "./chat-components/preview-image";
import PromptStart from "./chat-components/prompt-start";
import ChatImageInput from "./chat-components/chat-image-input";
import UploadsServices from "@/app/services/uploads.service";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { useSession } from "next-auth/react";

interface ImageChatProps {
  projectId: string;
  userId?: string;
  activeKey: "image" | "video" | "library" | "activity";
  projectRole?: string | null;
  promptGuideOpenStatus?: boolean;
  username?: string;
  selectedAIModel: (TAIModel & { capabilities?: string[] }) | undefined;
  setDisableTab: (disable: boolean) => void;
  onSetPromptTextRef?: React.MutableRefObject<
    ((id: number) => Promise<void>) | null
  >;
}

export interface GenerateConfig {
  ratio: string;
  width: number;
  height: number;
  content: string;
  duration: string;
  modelName: string;
  imageCount: number;
  resolution: string;
}

const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#5B6BF9",
  "100%": "#9D5BF9",
};

interface UserMessage {
  id?: number;
  userId?: string;
  username: string;
  fullname: string;
  email?: string;
  tier?: string;
  description?: string;
  phoneNumber?: string;
  status?: string;
  lastOn?: string;
  maxToken?: number;
  maxImages?: number;
  apiKeys?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  agreement?: boolean;
  recentOrganizationId?: string;
}

interface ImageMessage {
  id: string;
  imageUrl: string;
  status: boolean;
  fileName?: string;
}

interface Message {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  prompt: string;
  typeGenerate: string;
  createdAt: string;
  status: boolean;
  genneratedStatus: string;
  generateConfig: {
    ratio: string;
    width: number;
    height: number;
    content: string;
    duration: string;
    modelName: string;
    imageCount: number;
    resolution: string;
  };
  percentage?: number;
  users: UserMessage;
  referenceImages: string[];
  resolution: string;
  ratio: string;
  imageUrls: ImageMessage[];
}

type NotificationType = "success" | "info" | "warning" | "error";

const ChatGenerateImage: FC<ImageChatProps> = ({
  projectId,
  userId,
  activeKey,
  projectRole,
  promptGuideOpenStatus,
  username,
  selectedAIModel,
  setDisableTab,
  onSetPromptTextRef,
}) => {
  const { data: session } = useSession();
  const [api, contextHolderNoti] = notification.useNotification();
  const promptGuideTypeService = PromptGuideTypeServices(axiosCore);
  const promptGuideService = PromptGuideServices(axiosCore);
  const galleryService = GalleryServices(axiosCore);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const shouldAutoScrollRef = useRef<boolean>(false);
  const isAtBottomRef = useRef<boolean>(true);
  const initialPageSize = 3;
  const historyPageSize = 1;
  const currentLimitRef = useRef<number>(initialPageSize);
  const { socket, isConnected } = useWebSocket();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [currentId, setCurrentId] = useState<string | undefined>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [groupMode, setGroupMode] = useState<string>("automatic");
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedMaximumImage, setSelectedMaximumImage] = useState<number>(1);
  const [selectedResolution, setSelectedResolution] = useState<string>("2k");
  const [selectedWidth, setSelectedWidth] = useState<number>(2048);
  const [selectedHeight, setSelectedHeight] = useState<number>(2048);
  const [promptGuideTemplates, setPromptGuideTemplates] = useState<
    TPromptGuideTemplate[]
  >([]);
  const [refImage, setRefImage] = useState<
    {
      name: string;
      status: string;
      uid: string;
      url: string;
      imagePath: string;
    }[]
  >([]);
  const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);

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
    if (activeKey === "image") {
      if (socket) {
        socket.emit("join-room", {
          projectId,
          type: "image",
          message: `Joined room ${projectId}`,
        });
      }
      setLoading(true);
      isFirstLoad.current = true;
      loadMoreMessages(0, false, currentId);
    }
  }, [socket, projectId, activeKey]);

  const loadMoreMessages = (
    page: number,
    isLoadMore: boolean,
    currentId?: string,
  ) => {
    if (socket) {
      setDisableTab(true);
      const skip =
        page === 0 ? 0 : initialPageSize + (page - 1) * historyPageSize;
      const take = page === 0 ? initialPageSize : historyPageSize;
      currentLimitRef.current = take;
      socket.emit("chat:get-history", {
        projectId,
        organizationId: session?.user?.organizationId,
        skip: skip,
        take: take,
        type: "image",
      });
    }
  };

  const openNotificationWithIcon = (
    type: NotificationType,
    message: string,
  ) => {
    api[type]({
      message: type,
      description: message,
    });
  };

  useEffect(() => {
    if (!socket || activeKey !== "image") return;

    // 1. Event เมื่อ task ถูกสร้างสำเร็จ
    const handleTaskCreated = (data: {
      taskId: string;
      jobId: string;
      estimatedImages: number;
      message: string;
    }) => {
      console.log("✅ Task created:", data);
      setSubmitting(false);
    };

    // 2. Event เมื่อ task เริ่มต้น processing
    const handleTaskStarted = (data: {
      taskId: string;
      status: string;
      data: Message;
    }) => {
      console.log("🚀 Task started:", data);
      // อัพเดท message ใน state
      // setMessages((prev) =>
      //   prev.map((msg) =>
      //     msg.taskId === data.taskId
      //       ? {
      //         ...msg,
      //         genneratedStatus: "PROCESSING",
      //         percentage: 10,
      //       }
      //       : msg,
      //   ),
      // );
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.taskId === data.data.taskId);
        if (exists) {
          return prev;
        }
        return [...prev, data.data];
      });
      shouldAutoScrollRef.current = true;
    };

    // 3. Event เมื่อมีความคืบหน้าในการสร้างภาพ
    const handleProgress = (data: {
      taskId: string;
      currentImage: number;
      totalImages: number;
      progress: number;
      percentage: number;
    }) => {
      console.log("📊 Progress:", data);

      // อัพเดท progress ใน UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId
            ? {
                ...msg,
                genneratedStatus: "PROCESSING",
                percentage: data.percentage,
              }
            : msg,
        ),
      );
    };

    const workerStarted = (data: { taskId: string; status: string }) => {
      console.log("🚀 Worker started:", data);
      // อัพเดท message ใน state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId
            ? {
                ...msg,
                genneratedStatus: "PROCESSING",
                percentage: 10,
              }
            : msg,
        ),
      );
    };

    // 4. Event เมื่อสร้างภาพแต่ละรูปเสร็จ
    const handleImageComplete = (data: {
      taskId: string;
      imageIndex: number;
      imageUrl: string;
      imageId: string;
    }) => {
      console.log("🖼️ Image complete:", data);

      // เพิ่มรูปภาพที่สร้างเสร็จแล้วเข้าไปใน message
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.taskId === data.taskId) {
            const newImageUrls = [...(msg.imageUrls || [])];
            newImageUrls.push({
              id: data.imageId,
              imageUrl: data.imageUrl,
              status: false,
            });

            return {
              ...msg,
              imageUrls: newImageUrls,
              genneratedStatus: "PROCESSING",
              percentage: 90,
            };
          }
          return msg;
        }),
      );
    };

    // 5. Event เมื่อ task เสร็จสมบูรณ์
    const handleTaskComplete = (data: {
      taskId: string;
      success: boolean;
      imageCount: number;
      images: string[];
      timestamp: string;
      data: {
        projectId: string;
        userId: string;
        prompt: string;
        imageUrl: string[];
        typeGenerate: string;
        genneratedStatus: string;
        status: boolean;
        generateConfig: {
          width: number;
          height: number;
          ratio: string;
          imageCount: number;
          resolution: string;
          modelName: string;
          content: string;
        };
      };
    }) => {
      console.log("✅ Task complete:", data);

      // อัพเดท message เป็น SUCCESS
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.taskId === data.taskId) {
            return {
              ...msg,
              genneratedStatus: "SUCCESS",
              imageUrls: data.data.imageUrl.map((img) => ({
                id: img,
                imageUrl: img,
                status: false,
              })),
            };
          }
          return msg;
        }),
      );
    };

    // 6. Event เมื่อเกิด error
    const handleError = (error: {
      taskId?: string;
      message: string;
      details?: any;
    }) => {
      console.error("❌ Error:", error);

      openNotificationWithIcon("error", error.message || "Generation failed");
      setSubmitting(false);

      if (error.taskId) {
        // อัพเดท message เป็น FAIL
        setMessages((prev) =>
          prev.filter((msg) => msg.taskId !== error.taskId),
        );
      }
    };

    const handleHistory = (data: {
      success: boolean;
      data: {
        messages: Message[];
      };
    }) => {
      setDisableTab(false);
      if (data.success) {
        const messageData = data.data.messages;
        if (isFetchingHistory) {
          isLoadingMoreRef.current = true;
        }
        if (messageData.length < currentLimitRef.current) {
          setHasMore(false);
        }
        if (messageData.length === 0) return [];
        const itemsToProcess = [...messageData].reverse();
        const topId = itemsToProcess[0].id;
        if (topId) {
          setCurrentId(String(topId));
        }

        if (isFetchingHistory) {
          setMessages((prev) => {
            const existingTaskIds = new Set(prev.map((m) => m.id));
            const uniqueNewMessages = itemsToProcess.filter(
              (m: Message) => !existingTaskIds.has(m.id),
            );

            if (uniqueNewMessages.length === 0) {
              setHasMore(false);
              return prev;
            }
            return [...uniqueNewMessages, ...prev];
          });
          isFirstLoad.current = false;
          setLoading(false);
          setIsFetchingHistory(false);
        } else {
          setMessages(itemsToProcess);
          const isFirstLoadNow = isFirstLoad.current;
          if (
            isFirstLoadNow ||
            isAtBottomRef.current ||
            shouldAutoScrollRef.current
          ) {
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({
                behavior: isFirstLoadNow ? "instant" : "smooth",
              });
            }, 100);
          }
          if (isFirstLoad.current) {
            shouldAutoScrollRef.current = true;
          }
          isFirstLoad.current = false;

          // if (isFirstLoadNow) {
          //   shouldAutoScrollRef.current = true;
          // }
          setLoading(false);
        }
      }
    };
    // const handleNewMessage = (data: { success: boolean; data: Message }) => {
    //   console.log("📩 New message:", data);
    //   if (data.success && data.data) {
    //     setMessages((prev) => {
    //       // Check if message already exists
    //       const exists = prev.some((msg) => msg.id === data.data.id || (msg.taskId && msg.taskId === data.data.taskId));
    //       if (exists) {
    //         return prev;
    //       }
    //       return [...prev, data.data];
    //     });
    //     shouldAutoScrollRef.current = true;
    //   }
    // };

    socket.on("task:started", handleTaskStarted);
    socket.on("task:created", handleTaskCreated);
    socket.on("worker:started", workerStarted);
    socket.on("worker:progress", handleProgress);
    socket.on("worker:image-complete", handleImageComplete);
    socket.on("worker:error", handleError);
    socket.on("worker:complete", handleTaskComplete);
    socket.on("generate:error", handleError);
    socket.on("chat:history", handleHistory);

    return () => {
      socket.off("task:started", handleTaskStarted);
      socket.off("task:created", handleTaskCreated);
      socket.off("worker:started", workerStarted);
      socket.off("worker:progress", handleProgress);
      socket.off("worker:image-complete", handleImageComplete);
      socket.off("worker:error", handleError);
      socket.off("worker:complete", handleTaskComplete);
      socket.off("generate:error", handleError);
      socket.off("chat:history", handleHistory);
      socket.off("chat:message-saved");
    };
  }, [socket, page, projectId, activeKey]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      50;
    isAtBottomRef.current = isAtBottom;
    if (target.scrollTop <= 50 && hasMore && !loading && !isFirstLoad.current) {
      setIsFetchingHistory(true);
      scrollHeightRef.current = target.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      loadMoreMessages(nextPage, true);
    }
  };

  async function fetchImagePromptGuides() {
    if (session?.user?.organizationId) {
      const types = await promptGuideTypeService.findAll(
        session?.user?.organizationId,
        "image",
      );

      const templates = await Promise.all(
        types.map(async (type) => {
          const response = await promptGuideService.findWithImageByTypes(
            session?.user?.organizationId || "",
            type.id,
          );
          return { ...type, promptGuides: response || [] };
        }),
      );
      setPromptGuideTemplates(templates);
    }
  }
  // useEffect(() => {
  //   console.log("aa")
  //   if (isLoadingMoreRef.current && chatContainerRef.current) {
  //     const newScrollHeight = chatContainerRef.current.scrollHeight;
  //     const scrollDiff = newScrollHeight - scrollHeightRef.current;

  //     chatContainerRef.current.style.scrollBehavior = "auto";
  //     chatContainerRef.current.scrollTop = scrollDiff;

  //     requestAnimationFrame(() => {
  //       if (chatContainerRef.current) {
  //         chatContainerRef.current.style.scrollBehavior = "smooth";
  //       }
  //     });

  //     isLoadingMoreRef.current = false;
  //   }
  // }, [messages]);

  useEffect(() => {
    if (shouldAutoScrollRef.current && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        shouldAutoScrollRef.current = false;
      }, 100);
    }
  }, [messages.length]);

  const handleUploadChange: UploadProps["onChange"] = async ({
    file,
    fileList: newFileList,
  }) => {
    if (newFileList.length >= 1 && file.status !== "removed") {
      const fileToUpload = file.originFileObj || file;
      if (fileToUpload instanceof Blob) {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.src = URL.createObjectURL(fileToUpload as Blob);
            img.onload = () => {
              const minSide = Math.min(img.width, img.height);
              URL.revokeObjectURL(img.src);
              if (minSide < 300) {
                reject(
                  "Image size is too small, minimum side length must not be less than 300 px",
                );
              } else {
                resolve();
              }
            };
            img.onerror = () => {
              URL.revokeObjectURL(img.src);
              resolve();
            };
          });
        } catch (error) {
          openNotificationWithIcon("error", String(error));
          return;
        }
      }
      setIsLoadingUpload(true);
      const formData = new FormData();
      formData.append("userId", userId ? userId : "");
      formData.append("index", newFileList.length.toString());
      formData.append("projectId", projectId);
      formData.append("name", file.name);
      formData.append("generateType", "image");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload as Blob);
      formData.append("organizationId", session?.user?.organizationId || "");
      try {
        const result = await UploadsServices(axiosWorker).upload(formData);
        setRefImage((prev) => [...prev, result]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    setIsLoadingUpload(false);
    setFiles(newFileList);
  };

  const onRemoveFile = (file: UploadFile) => {
    setRefImage((prev) => prev.filter((f) => f.uid !== file.uid));
    UploadsServices(axiosWorker).remove(file.uid);
  };

  const beforeUpload = (file: RcFile) => {
    if (files.find((f) => f.name === file.name)) {
      message.warning(`Duplicate file: ${file.name}`);
      return false;
    }

    if (files.length >= 15) {
      messageApi.warning(`Upload limit: 15 files max`);
      return false;
    }

    return false;
  };

  const onDownloadImage = async (fileName: string, imageId: string) => {
    try { 
      const response = await galleryService.downloadFile(
        imageId,
        session?.user?.organizationId || "",
      );
      if (!response) throw new Error("Download failed or response is empty");
      // console.log(response);
      // const filename = response.name || "image.jpg";
      const url = URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
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
    currentStatus: boolean,
  ) => {
    try {
      const nextStatus = currentStatus ? false : true;
      const success = await GalleryServices(axiosCore).updateStatus(
        id,
        nextStatus,
      );
      if (success.id) {
        message.success("Share status updated");
        setMessages((prev) =>
          prev.map((msg: Message) => {
            if (msg.taskId === taskId) {
              return {
                ...msg,
                imageUrls: msg.imageUrls?.map(
                  (image: {
                    id: string;
                    imageUrl: string;
                    status: boolean;
                    thumbnailUrl?: string;
                  }) =>
                    image.id === id ? { ...image, status: nextStatus } : image,
                ),
              };
            } else {
              return msg;
            }
          }),
        );
      }
    } catch (error) {
      console.error("Share update failed", error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    // สร้าง temporary message สำหรับแสดงใน UI ทันที
    if (!selectedAIModel) return "Plese select model";
    const message = {
      taskId: `temp-${Date.now()}`,
      model: selectedAIModel.name,
      prompt: values.prompt,
      image: refImage.map((image) => image.imagePath),
      sequentialImageGeneration: "auto",
      size: selectedResolution,
      maxImages: selectedMaximumImage,
      watermark: false,
      ratio: selectedRatio,
      projectId: projectId,
      userId: userId,
      width: selectedWidth,
      height: selectedHeight,
      imageGenerateType: groupMode,
      typeGenerate: "image",
      organizationId: session?.user?.organizationId,
    };
    const tempMessage = {
      id: `temp-${Date.now()}`,
      taskId: `temp-${Date.now()}`,
      projectId: projectId,
      userId: userId,
      prompt: values.prompt,
      typeGenerate: "image",
      createdAt: new Date().toISOString(),
      status: true,
      genneratedStatus: "PROCESSING",
      generateConfig: {
        ratio: selectedRatio,
        width: selectedWidth,
        height: selectedHeight,
        content: values.prompt,
        duration: "0s",
        modelName: selectedAIModel.name,
        imageCount: selectedMaximumImage,
        resolution: selectedResolution,
      },
      users: {
        fullname: username,
        userId: userId,
        username: username,
      },
      referenceImages: refImage.map((image) => image.url),
      resolution: selectedResolution,
      ratio: selectedRatio,
      imageUrls: [],
      organizationId: session?.user?.organizationId,
    } as Message;

    setMessages((prev) => [...prev, tempMessage]);
    shouldAutoScrollRef.current = true;
    if (!socket || !isConnected) {
      messageApi.error("WebSocket is not connected. Please refresh the page.");
      return;
    }

    try {
      setSubmitting(true);
      socket.emit("generate", message);
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      messageApi.error(error.message || "An unexpected error occurred");
      setSubmitting(false);
    }
  };

  async function onSetPromptText(id: number): Promise<void> {
    const prompt = await promptGuideService.findById(String(id));
    const text = form.getFieldValue("text");
    form.setFieldValue(
      "text",
      text ? text + "\n\n" + prompt.textPrompt : prompt.textPrompt,
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

  // const handleImageClick = (url: string) => {
  //   setPreviewImage(url);
  // };

  const closePreview = () => {
    setPreviewImage(null);
  };

  async function handleUsePromptGuide(prompt: TPromptGuide) {
    form.setFieldValue("prompt", prompt.textPrompt);
    setFiles([]);
    setRefImage([]);

    if (prompt.images && prompt.images.length > 0) {
      setIsLoadingUpload(true);
      try {
        const uploadPromises = prompt.images.map(async (img, index) => {
          try {
            const no = index + 1;
            const formData = new FormData();
            formData.append("userId", userId ? userId : "");
            formData.append("index", no.toString());
            formData.append("projectId", projectId);
            formData.append("generateType", "image");
            formData.append("uid", `rc-upload-${Date.now()}-${no}`);
            formData.append("refUid", img.uid);
            formData.append("file", img.url);
            formData.append(
              "organizationId",
              session?.user?.organizationId || "",
            );
            // formData.append("file", file);

            const result =
              await UploadsServices(axiosWorker).uploadFromPrompt(formData);
            return result;
          } catch (err) {
            console.error("Failed to process image:", img.name, err);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        const successfulResults = results.filter((res: any) => res !== null);

        setRefImage(successfulResults);

        const newFiles = successfulResults.map((res: any, index: number) => ({
          uid: res.uid || `rc-upload-${Date.now()}-${index}`,
          name: res.name,
          status: "done" as const,
          url: res.url,
          response: res, // Keep consistency with response mapping
        }));

        setFiles(newFiles);
      } catch (error) {
        console.error("Error in handleUsePromptGuide:", error);
      } finally {
        setIsLoadingUpload(false);
      }
    }
  }

  return (
    <div
      className={
        promptGuideOpenStatus ? "grid md:grid-cols-4 sm:grid-cols-1 gap-2" : ""
      }
    >
      <div className={`h-[calc(100vh-160px)] md:col-span-4 sm:col-span-1`}>
        {contextHolder}
        {contextHolderNoti}
        {previewImage && (
          <PreviewImage
            closePreview={closePreview}
            previewImage={previewImage}
          />
        )}
        <div className="flex flex-col h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 scroll-smooth space-y-6"
          >
            {(loading || isFetchingHistory) && hasMore && (
              <div className="flex justify-center py-2">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              </div>
            )}

            {messages.map((message: Message, index) => (
              <div key={`${message.id}-${index}`}>
                <div
                  key={`${message.id}-${index}`}
                  // className={`flex gap-4 ${message.type === "user" ? "justify-end border-t-2 pt-2 border-white/10 " : "justify-start"}`}
                  className={`flex gap-4 justify-start`}
                >
                  {/* <Avatar src={Avatars.src} size={40} /> */}
                  <div className={`flex flex-col items-start`}>
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                      <span>{message.users.username}</span>
                      <span>•</span>
                      <span>
                        {new Date(message.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {message.prompt && (
                      <div
                        className={`px-3 py-1 rounded-2xl text-sm leading-relaxed shadow-md whitespace-pre-wrap bg-[#27272a] text-gray-200 border border-white/5 rounded-tl-sm`}
                      >
                        {message.prompt}
                      </div>
                    )}
                    <ImageConfigurationCard
                      generateConfig={message.generateConfig}
                      referenceImages={message.referenceImages}
                    />
                    {(message.genneratedStatus === "PENDING" ||
                      message.genneratedStatus === "PROCESSING") && (
                      <div className="mt-1 p-2 bg-[#1e1e21] rounded-lg border border-white/5 flex items-center gap-3">
                        {/* <Progress
                          size={260}
                          type="circle"
                          percent={message.percentage}
                          strokeColor={conicColors}
                        /> */}
                        <AiImageLoader />
                      </div>
                    )}

                    {(message.genneratedStatus === "FAIL" ||
                      (message.genneratedStatus === "SUCCESS" &&
                        !message.imageUrls)) && (
                      <div className="mt-1 p-2 bg-red-900/20 rounded-lg border border-red-500/20 text-red-400">
                        Generate failed
                      </div>
                    )}
                    {message.genneratedStatus === "SUCCESS" &&
                      message.imageUrls &&
                      message.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2 overflow-hidden">
                          <Image.PreviewGroup>
                            {message.imageUrls.map(
                              (imgUrl: ImageMessage, i) => (
                                <div
                                  key={imgUrl.id}
                                  className="relative group w-full h-full overflow-hidden bg-black/40 rounded-lg"
                                  style={{
                                    aspectRatio: `${message.generateConfig.width} / ${message.generateConfig.height}`,
                                  }}
                                >
                                  <Image
                                    src={imgUrl.imageUrl}
                                    alt={`Generated ${i + 1}`}
                                    width="100%"
                                    height="100%"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                    <Button
                                      size="small"
                                      icon={<Download size={14} />}
                                      className="!bg-black/60 !text-white !border-none backdrop-blur-sm hover:!bg-black/80"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation(); 
                                        onDownloadImage(
                                          imgUrl.fileName || "image.jpg",
                                          imgUrl.id,
                                        );
                                      }}
                                    />
                                    <Button
                                      size="small"
                                      icon={
                                        imgUrl.status === true ? (
                                          <LikeFilled className=" !text-yellow-500 opacity-100 !text-yellow-500" />
                                        ) : (
                                          <LikeOutlined />
                                        )
                                      }
                                      className="!bg-black/60 !text-white !border-none  hover:!bg-black/80"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (imgUrl.id && message.taskId) {
                                          onShareImage(
                                            message.taskId,
                                            imgUrl.id,
                                            imgUrl.status,
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              ),
                            )}
                          </Image.PreviewGroup>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <PermissionGuard
            roles={projectPermissions.useChat}
            userRole={projectRole}
            fallback={
              <div className="p-4 text-center text-zinc-400 bg-[#18181b] rounded-3xl border border-white/10">
                <p className="text-lg font-medium mb-2">🚫 Access Restricted</p>
                <p className="text-sm">
                  You need USER or ADMIN role to use the chat feature.
                </p>
                <p className="text-xs mt-1 text-zinc-500">
                  Contact your project administrator for access.
                </p>
              </div>
            }
          >
            <ChatImageInput
              setGroupMode={setGroupMode}
              groupMode={groupMode}
              setSelectedRatio={setSelectedRatio}
              selectedRatio={selectedRatio}
              setSelectedResolution={setSelectedResolution}
              selectedResolution={selectedResolution}
              setSelectedMaximumImage={setSelectedMaximumImage}
              selectedMaximumImage={selectedMaximumImage}
              form={form}
              files={files}
              handleUploadChange={handleUploadChange}
              beforeUpload={beforeUpload}
              onRemoveFile={onRemoveFile}
              submitting={submitting}
              handleSendMessage={handleFormSubmit}
              isLoadingUpload={isLoadingUpload}
              setSelectedWidth={setSelectedWidth}
              setSelectedHeight={setSelectedHeight}
              promptGuideTemplates={promptGuideTemplates}
              fetchImagePromptGuides={fetchImagePromptGuides}
              handleUsePromptGuide={handleUsePromptGuide}
            />
          </PermissionGuard>
        </div>
      </div>
      {/* {!isMobile && (
        <div
          className={`${promptGuideOpenStatus ? " h-[calc(100vh-200px)]  block" : "hidden"}`}
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
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ChatGenerateImage;
