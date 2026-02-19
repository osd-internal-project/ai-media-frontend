import React, { useEffect, useRef, useState, type FC } from "react";
import { PermissionGuard } from "../../../../components/PermissionGuard";
import { projectPermissions } from "../../../../utils/permissions";
import { Form, message, type UploadFile, notification } from "antd";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import {
  TPromptGuideType,
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import GalleryServices from "@/app/services/gellory.service";
import VideoItem from "./video-player";
import { TAIModel } from "@/app/common/ai-model.type";
import DreamactorSmartReference from "./chat-components/dreamactor-smart-reference";
import UploadsServices from "@/app/services/uploads.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { useSession } from "next-auth/react";
import ChatDreamactorInput from "./chat-components/chat-dreamactor-input";

interface DreamactorChatProps {
  projectId: string;
  userId?: string;
  activeKey:
    | "image"
    | "video"
    | "omnihumen"
    | "dreamactor"
    | "library"
    | "activity";
  projectRole?: string | null;
  promptGuideOpenStatus: boolean;
  username?: string; // Added username
  selectedAIModel: (TAIModel & { capabilities?: string[] }) | undefined;
  setDisableTab: (disable: boolean) => void;
  onSetPromptTextRef?: React.MutableRefObject<
    ((id: number) => Promise<void>) | null
  >;
}

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

export interface VideoMessage {
  id?: string | undefined;
  imageUrl: string;
  thumbnailUrl?: string;
  status?: boolean;
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
    content: string;
    modelName: string;
    resolution?: string;
    fastMode: boolean;
    seed?: number;
  };
  percentage?: number;
  users: UserMessage;
  referenceImages: string[];
  resolution: string;
  ratio: string;
  imageUrls: VideoMessage[];
}

type NotificationType = "success" | "info" | "warning" | "error";

const ChatGenerateDreamactor: FC<DreamactorChatProps> = ({
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
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const { socket, isConnected } = useWebSocket();
  const [api, contextHolderNoti] = notification.useNotification();
  const [messageApi, contextHolder] = message.useMessage();
  const promptGuideTypeService = PromptGuideTypeServices(axiosCore);
  // const promptguideService = PromptGuideServices(axiosCore);
  const promptGuideService = PromptGuideServices(axiosCore);
  const galleryService = GalleryServices(axiosCore);
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [filesFirst, setFilesFirst] = useState<UploadFile[]>([]);
  const [filesLast, setFilesLast] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [currentId, setCurrentId] = useState<string | undefined>("");
  // Removed unused currentPrompt and firstFrameImage

  // Refs
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
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedResolution, setSelectedResolution] = useState<string>("1080p");
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [selectedDurationType, setSelectedDurationType] = useState<{
    value: string;
    label: string;
  }>({ value: "Seconds", label: "Seconds" });
  const [selectedDuration, setSelectedDuration] = useState<number>(6);
  const [refImageFrist, setRefImageFrist] = useState<
    {
      name: string;
      status: string;
      uid: string;
      url: string;
      imagePath: string;
    }[]
  >([]);
  const [refImageLast, setRefImageLast] = useState<
    {
      name: string;
      status: string;
      uid: string;
      url: string;
      imagePath: string;
    }[]
  >([]);
  const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);
  const [draftMode, setDraftMode] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWidth, setSelectedWidth] = useState<number>(1920);
  const [selectedHeight, setSelectedHeight] = useState<number>(1080);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [promptGuideTemplates, setPromptGuideTemplates] = useState<
    TPromptGuideTemplate[]
  >([]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
    form.setFieldValue("duration", selectedDuration);
    form.setFieldValue("quantity", selectedQuantity);
  }, []);

  useEffect(() => {
    if (!socket || activeKey !== "dreamactor") return;
    const handleTaskCreated = (data: {
      taskId: string;
      message: string;
      timestamp: string;
      data: Message;
    }) => {
      console.log("✅ Task created:", data);
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.taskId === data.taskId);
        if (exists) {
          return prev;
        }
        return [...prev, data.data];
      });
      shouldAutoScrollRef.current = true;
      setSubmitting(false);
    };

    const handleTaskStarted = (data: {
      status: number;
      data: {
        taskId: string;
        projectId: string;
        userId: string;
        prompt: string;
        typeGenerate: string;
        genneratedStatus: string;
        status: boolean;
        dreamactorTaskId: string;
        message: string;
      };
      oldTaskId: string;
    }) => {
      console.log("🚀 Task started:", data.data.taskId);
      if (data.status === 200) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.taskId === data.oldTaskId
              ? {
                  ...msg,
                  genneratedStatus: "PROCESSING",
                  percentage: 10,
                  taskId: data.data.taskId,
                }
              : msg,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.taskId !== data.oldTaskId),
        );
      }
    };

    const workerTaskStarted = (data: { taskId: string; timestamp: string }) => {
      console.log("🚀 Worker started:", data.taskId);
    };

    const workerUrlSuccess = (data: {
      taskId: string;
      videoUrl: string;
      timestamp: string;
    }) => {
      console.log("🚓 Worker video url success:", data.taskId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId
            ? {
                ...msg,
                genneratedStatus: "SUCCESS",
                imageUrls: [
                  {
                    imageUrl: data.videoUrl,
                    thumbnailUrl:
                      "https://placehold.co/600x400/000000/FFFFFF/png",
                  },
                ],
              }
            : msg,
        ),
      );
    };

    const workerUploadSuccess = (data: {
      taskId: string;
      videoUrl: string;
      thumbnailUrl: string;
      timestamp: string;
    }) => {
      console.log("🚕 Worker video upload success:", data.taskId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId
            ? {
                ...msg,
                genneratedStatus: "SUCCESS",
                imageUrls: [
                  { imageUrl: data.videoUrl, thumbnailUrl: data.thumbnailUrl },
                ],
              }
            : msg,
        ),
      );
    };

    const workerComplete = (data: {
      taskId: string;
      success: boolean;
      timestamp: string;
    }) => {
      console.log("🚀 Task complete:", data.taskId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId
            ? {
                ...msg,
                genneratedStatus: "SUCCESS",
              }
            : msg,
        ),
      );
    };

    const workerError = (data: {
      taskId: string;
      success: boolean;
      timestamp: string;
    }) => {
      console.log("🚀 Task error:", data.taskId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId && msg.genneratedStatus !== "FAILED"
            ? {
                ...msg,
                genneratedStatus: "FAILED",
              }
            : msg,
        ),
      );
    };

    const handleProgress = (data: { taskId: string; timestamp: string }) => {
      console.log("📊 Progress:", data.taskId);

      // อัพเดท progress ใน UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg.taskId === data.taskId
            ? {
                ...msg,
                genneratedStatus: "PROCESSING",
              }
            : msg,
        ),
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
        if (messageData.length === 0) {
          setIsFetchingHistory(false);
          setLoading(false);
          isFirstLoad.current = false;
          return;
        }
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
          setIsFetchingHistory(false);
          setLoading(false);
        } else {
          setMessages(itemsToProcess);
          if (
            isFirstLoad.current ||
            isAtBottomRef.current ||
            shouldAutoScrollRef.current
          ) {
            const isFirst = isFirstLoad.current;
            setTimeout(() => {
              if (isFirst && chatContainerRef.current) {
                chatContainerRef.current.scrollTop =
                  chatContainerRef.current.scrollHeight;
              } else {
                bottomRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }, 100);
          }
          if (isFirstLoad.current) {
            shouldAutoScrollRef.current = true;
          }
          isFirstLoad.current = false;
          setLoading(false);
        }
      }
    };

    
    socket.on("dreamactor-task:created", handleTaskCreated);
    socket.on("task-dreamactor:started", handleTaskStarted);
    socket.on("dreamactor-generate:error", handleError);
    socket.on("worker:dreamactor-started", workerTaskStarted);
    socket.on("worker:dreamactor-url-success", workerUrlSuccess);
    socket.on("worker:dreamactor-upload-success", workerUploadSuccess);
    socket.on("worker:dreamactor-complete", workerComplete);
    socket.on("worker:dreamactor-error", workerError);
    socket.on("worker:dreamactor-progress", handleProgress);
    socket.on("chat:history", handleHistory);
    return () => {
      socket.off("dreamactor-task:created", handleTaskCreated);
      socket.off("task-dreamactor:started", handleTaskStarted);
      socket.off("dreamactor-generate:error", handleError);
      socket.off("worker:dreamactor-url-success", workerUrlSuccess);
      socket.off("worker:dreamactor-upload-success", workerUploadSuccess);
      socket.off("worker:dreamactor-complete", workerComplete);
      socket.off("worker:dreamactor-error", workerError);
      socket.off("worker:dreamactor-progress", handleProgress);
      socket.off("chat:history", handleHistory);
    };
  }, [socket, page, projectId, activeKey]);

  useEffect(() => {
    if (activeKey === "dreamactor") {
      if (socket) {
        socket.emit("join-room", {
          projectId,
          type: "dreamactor",
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
        type: "dreamactor",
      }); 
  
    }
  };

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

  async function fetchDreamactorPromptGuides() {
    if (session?.user?.organizationId) {
      const types = await promptGuideTypeService.findAll(
        session?.user?.organizationId,
        "dreamactor",
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

  const onDownloadVideo = async (fileName: string, videoId: string) => {
    try {
      const response = await galleryService.downloadFile(
        videoId,
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

  const onShareVideo = async (
    taskId: string,
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const nextStatus = currentStatus && currentStatus == true ? false : true;
      const success = await GalleryServices(axiosCore).updateStatus(
        id,
        nextStatus,
      );

      if (success) {
        message.success("Share status updated");
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.taskId === taskId) {
              return {
                ...msg,
                imageUrls: msg.imageUrls?.map((video) =>
                  video.id === id ? { ...video, status: nextStatus } : video,
                ),
              };
            }
            return msg;
          }),
        );
      }
    } catch (error) {
      console.error("Share update failed", error);
      message.error("Failed to update status");
    }
  };

  const handleUploadChange = async ({
    index,
    file,
    fileList: newFileList,
    status,
  }: {
    index: number;
    file: UploadFile;
    fileList: UploadFile[];
    status: "upload" | "remove";
  }) => {
    if (file && status === "upload") {
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
      formData.append("index", index.toString());
      formData.append("projectId", projectId);
      formData.append("generateType", "dreamactor");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload as Blob);
      formData.append("organizationId", session?.user?.organizationId || "");
      try {
        const result = await UploadsServices(axiosWorker).upload(formData);
        if (result) {
          if (index === 0) {
            setFilesFirst([file]);
            setRefImageFrist((prev) => [...prev, result]);
          } else {
            setFilesLast([file]);
            setRefImageLast((prev) => [...prev, result]);
          }
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    } else if (status === "remove") {
      setIsLoadingUpload(true);
      try {
        if (index === 0) {
          setRefImageFrist((prev) => prev.filter((f) => f.uid !== file.uid));
          setFilesFirst([]);
        } else {
          setRefImageLast((prev) => prev.filter((f) => f.uid !== file.uid));
          setFilesLast([]);
        }
        await UploadsServices(axiosWorker).remove(file.uid);
      } catch (error) {
        console.error("Remove failed:", error);
      }
    }
    setIsLoadingUpload(false);
  };

  async function handleUsePromptGuide(prompt: TPromptGuide) {
    form.setFieldValue("prompt", prompt.textPrompt);
    // Clear both First and Last inputs
    setFilesFirst([]);
    setRefImageFrist([]);
    setFilesLast([]);
    setRefImageLast([]);

    if (prompt.images && prompt.images.length > 0) {
      setIsLoadingUpload(true);
      try {
        const uploadPromises = prompt.images.map(async (img) => {
          const newIndex = img.index - 1;
          const formData = new FormData();
          formData.append("userId", userId ? userId : "");
          formData.append("index", newIndex.toString());
          formData.append("projectId", projectId);
          formData.append("generateType", "dreamactor");
          formData.append("refUid", img.uid);
          formData.append("uid", `rc-upload-${Date.now()}-${newIndex}`);
          formData.append("file", img.url);
          formData.append(
            "organizationId",
            session?.user?.organizationId || "",
          );

          try {
            const result =
              await UploadsServices(axiosWorker).uploadFromPrompt(formData);
            return { result, index: newIndex };
          } catch (error) {
            console.error("Upload failed:", error);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        const successfulResults = results.filter(
          (res): res is { result: any; index: number } =>
            res !== null && res.result !== null,
        );

        const firstImage = successfulResults.find((r) => r.index === 0);
        const lastImage = successfulResults.find((r) => r.index === 1);

        if (firstImage) {
          setRefImageFrist([firstImage.result]);
          const newFile = {
            uid: firstImage.result.uid || `rc-upload-${Date.now()}-0`,
            name: firstImage.result.name,
            status: "done" as const,
            url: firstImage.result.url,
            response: firstImage.result,
          };
          setFilesFirst([newFile]);
        }

        if (lastImage) {
          setRefImageLast([lastImage.result]);
          const newFile = {
            uid: lastImage.result.uid || `rc-upload-${Date.now()}-1`,
            name: lastImage.result.name,
            status: "done" as const,
            url: lastImage.result.url,
            response: lastImage.result,
          };
          setFilesLast([newFile]);
        }
      } catch (error) {
        console.error("Error in handleUsePromptGuide:", error);
      } finally {
        setIsLoadingUpload(false);
      }
    }
  }

  const onRemoveFile = (file: UploadFile) => {
    // setRefImageFrist((prev) => prev.filter((f) => f.uid !== file.uid));
    // UploadsServices(axiosWorker).remove(file.uid);
  };

  const handleFormSubmit = (values: any) => {
    if (!selectedAIModel)
      return openNotificationWithIcon("error", "Please select an AI model");
    const firstImage = refImageFrist.length > 0 ? refImageFrist[0] : null;
    const lastImage = refImageLast.length > 0 ? refImageLast[0] : null;
    if (!firstImage)
      return openNotificationWithIcon("error", "Please upload image");
    if (!lastImage)
      return openNotificationWithIcon("error", "Please upload audio");
    const tempTask = `temp-${Date.now()}`;
    const message = {
      taskId: tempTask,
      model: selectedAIModel.name,
      prompt: values.prompt,
      image: [
        firstImage?.imagePath ? firstImage.imagePath : null,
        lastImage?.imagePath ? lastImage.imagePath : null,
      ],
      fastMode: fastMode,
      seed: values.seed,
      resolution: selectedResolution,
      projectId: projectId,
      userId: userId,
      organizationId: session?.user?.organizationId,
    };
    const tempMessage = {
      id: tempTask,
      taskId: tempTask,
      projectId: projectId,
      userId: userId,
      prompt: values.prompt,
      typeGenerate: "dreamactor",
      createdAt: new Date().toISOString(),
      status: false,
      genneratedStatus: "PROCESSING",
      generateConfig: {
        content: values.prompt,
        modelName: selectedAIModel.name,
        resolution: selectedResolution,
        fastMode: fastMode,
        seed: values.seed,
      },
      users: {
        fullname: username,
        userId: userId,
        username: username,
      },
      referenceImages: [
        ...(refImageFrist[0] ? [refImageFrist[0].url] : []),
        ...(refImageLast[0] ? [refImageLast[0].url] : []),
      ],
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
    socket.emit("generate:dreamactor", message);
  };

  return (
    <div
      className={
        promptGuideOpenStatus ? "grid md:grid-cols-4 sm:grid-cols-1 gap-2" : ""
      }
    >
      <div
        className={`h-[calc(100vh-160px)] ${promptGuideOpenStatus ? "col-span-3" : ""}`}
      >
        {contextHolder}
        {contextHolderNoti}
        <div className="flex flex-col h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-6"
          >
            {(loading || isFetchingHistory) && !isFirstLoad.current && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}

            {/* {!loading && messages.length === 0 && (
                            <div className="text-white pt-10 px-5 flex-1 overflow-auto">
                                <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedance`}</h1>
                                <p className="text-gray-400 text-center mb-10">
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
                                                            // onClick={() =>
                                                            //     item.id && onSetPromptText(item.id)
                                                            // }
                                                            className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                                                        >
                                                            <span className="flex-1 text-left">
                                                                {item.title}
                                                            </span>
                                                            <span className="ml-auto">→</span>
                                                        </Button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

            {messages.map((massage: Message, index) => (
              <div
                key={`${massage.id}-${index}`}
                className={`flex gap-4 "justify-start"`}
              >
                <div className={`flex flex-col items-start`}>
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                    <span>{massage.users.username}</span>
                    <span>•</span>
                    <span>
                      {new Date(massage.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      {new Date(massage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {massage.prompt && (
                    <div
                      className={`px-3 py-1 rounded-2xl text-sm leading-relaxed shadow-md whitespace-pre-wrap bg-[#27272a] text-gray-200 border border-white/5 rounded-tl-sm`}
                    >
                      {massage.prompt}
                    </div>
                  )}

                  <>
                    <DreamactorSmartReference
                      selectedAIModel={selectedAIModel}
                      referenceImages={massage.referenceImages}
                      resolution={undefined}
                    />
                    {(massage.genneratedStatus === "PENDING" ||
                      massage.genneratedStatus === "PROCESSING") && (
                      <AiImageLoader />
                    )}
                    {massage.genneratedStatus === "FAILED" && (
                      <div className="mt-1 p-2 bg-red-900/20 rounded-lg border border-red-500/20 text-red-400">
                        Generate failed
                      </div>
                    )}
                    {massage.genneratedStatus === "SUCCESS" &&
                      massage.imageUrls &&
                      massage.imageUrls.length === 0 && (
                        <div className="mt-1 p-2 bg-red-900/20 rounded-lg border border-red-500/20 text-red-400">
                          Generate failed
                        </div>
                      )}
                    {massage.genneratedStatus === "SUCCESS" &&
                      massage.imageUrls &&
                      massage.imageUrls.length > 0 && (
                        <div
                          className={`grid gap-2 mt-2  w-full max-w-[200px]`}
                        >
                          {massage.imageUrls.map(
                            (videoData: VideoMessage, i) => (
                              <VideoItem
                                key={i}
                                videoData={videoData}
                                onDownloadVideo={onDownloadVideo}
                                onShareVideo={(id, status) => {
                                  if (massage.taskId) {
                                    onShareVideo(massage.taskId, id, status);
                                  }
                                }}
                                shareStatus={true}
                              />
                            ),
                          )}
                        </div>
                      )}
                  </>
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* <div className=" p-4 z-10 bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-2">
                        <div className="max-w-6xl mx-auto relative bg-[#27272a] rounded-3xl p-1 border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-2xl"> */}
          <PermissionGuard
            roles={projectPermissions.useChat}
            userRole={projectRole}
            fallback={
              <div className="p-4 text-center text-zinc-400 bg-[#18181b] rounded-3xl border border-white/10">
                <p className="text-lg font-medium mb-2">🚫 Access Restricted</p>
                <p className="text-sm">
                  You need USER or ADMIN role to use the dreamactor chat
                  feature.
                </p>
                <p className="text-xs mt-1 text-zinc-500">
                  Contact your project administrator for access.
                </p>
              </div>
            }
          >
            <ChatDreamactorInput
              setSelectedRatio={setSelectedRatio}
              selectedRatio={selectedRatio}
              setSelectedResolution={setSelectedResolution}
              selectedResolution={selectedResolution}
              form={form}
              filesFirst={filesFirst}
              filesLast={filesLast}
              handleUploadChange={handleUploadChange}
              handleSendMessage={handleFormSubmit}
              isLoadingUpload={isLoadingUpload}
              submitting={submitting}
              setSelectedDuration={setSelectedDuration}
              selectedDuration={selectedDuration}
              setDraftMode={setDraftMode}
              draftMode={draftMode}
              setFastMode={setFastMode}
              fastMode={fastMode}
              onRemoveFile={onRemoveFile}
              setSelectedWidth={setSelectedWidth}
              setSelectedHeight={setSelectedHeight}
              promptGuideTemplates={promptGuideTemplates}
              fetchVideoPromptGuides={fetchDreamactorPromptGuides}
              handleUsePromptGuide={handleUsePromptGuide}
            />
          </PermissionGuard>
        </div>
        {/* <div className="text-center mt-3 text-xs text-zinc-500 space-y-1">
                    <div>AI can make mistakes. Please check the generated Video.</div>
                    {username}
                    {files.length > 0 && (
                        <div className="text-blue-400">📎 {files.length}/2 files</div>
                    )}
                </div> */}
        {/* </div>
                </div> */}
      </div>
    </div>
  );
};

export default ChatGenerateDreamactor;
