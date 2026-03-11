import React, { useEffect, useRef, useState, type FC } from "react";
import {
  Card,
  Flex,
  Form,
  message,
  type UploadFile,
  notification,
  Typography,
} from "antd";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import {
  TPromptGuideType,
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import GalleryServices from "@/app/services/gellory.service";
import VideoItem from "../video-gen/video-player";
import OmnihumenSmartReference from "./omnihumen-smart-reference";
import UploadsServices from "@/app/services/uploads.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { useSession } from "next-auth/react";
import ChatOmnihumenInput from "./chat-omnihumen-input";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import GenerateTwoPaneLayout from "../../tab-layout/generate-two-pane-layout";
import { TMasterModelType } from "@/app/common/master-model-type.type";

interface OmniHumanChatProps {
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
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
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

const ChatGenerateOmnihumen: FC<OmniHumanChatProps> = ({
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
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
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
  const [usedCredit, setUsedCredit] = useState<{
    total?: number;
    used?: number;
  }>({
    total: undefined,
    used: undefined,
  });

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
    if (!socket || activeKey !== "omnihumen") return;
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
        omnihumenTaskId: string;
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
          msg.taskId === data.taskId
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

    // 7. Event เมื่อเกิด Credit Change
    const handleCreditChange = (res: {
      success: boolean;
      data: {
        usedCredit: number;
        totalCredit?: number;
      };
    }) => {
      if (res.success) {
        console.log("🚀 Credit change:", res.data);
        setUsedCredit({
          used: res.data.usedCredit,
          total: res?.data?.totalCredit,
        });
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
    socket.on("omnihumen-task:created", handleTaskCreated);
    socket.on("task-omnihumen:started", handleTaskStarted);
    socket.on("omnihumen-generate:error", handleError);
    socket.on("worker:omnihumen-started", workerTaskStarted);
    socket.on("worker:omnihumen-url-success", workerUrlSuccess);
    socket.on("worker:omnihumen-upload-success", workerUploadSuccess);
    socket.on("worker:omnihumen-complete", workerComplete);
    socket.on("worker:omnihumen-error", workerError);
    socket.on("worker:omnihumen-progress", handleProgress);
    socket.on("chat:history", handleHistory);
    socket.on("chat:used-credit", handleCreditChange);

    return () => {
      socket.off("omnihumen-task:created", handleTaskCreated);
      socket.off("task-omnihumen:started", handleTaskStarted);
      socket.off("omnihumen-generate:error", handleError);
      socket.off("worker:omnihumen-url-success", workerUrlSuccess);
      socket.off("worker:omnihumen-upload-success", workerUploadSuccess);
      socket.off("worker:omnihumen-complete", workerComplete);
      socket.off("worker:omnihumen-error", workerError);
      socket.off("worker:omnihumen-progress", handleProgress);
      socket.off("chat:history", handleHistory);
      socket.off("chat:used-credit", handleCreditChange);
    };
  }, [socket, page, projectId, activeKey]);

  useEffect(() => {
    if (activeKey === "omnihumen") {
      if (socket) {
        socket.emit("join-room", {
          projectId,
          type: "omnihumen",
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
        type: "omnihumen",
      });
      socket.emit("chat:get-used-credit", {
        projectId,
        organizationId: session?.user?.organizationId,
        userId: userId,
        type: "omnihumen",
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

  async function fetchOmnihumenPromptGuides() {
    if (session?.user?.organizationId) {
      const types = await promptGuideTypeService.findAll(
        session?.user?.organizationId,
        "omnihumen",
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
      formData.append("generateType", "omnihumen");
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
          formData.append("generateType", "omnihumen");
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
      model: selectedAIModel.modelType,
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
      typeGenerate: "omnihumen",
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
    socket.emit("generate:omnihumen", message);
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        minHeight: 0,
        background: semantic.colorBgBase,
      }}
    >
      {contextHolder}
      {contextHolderNoti}

      <GenerateTwoPaneLayout
        semantic={semantic}
        isMobile={isMobile}
        projectRole={projectRole}
        fallbackDescription="You need USER or ADMIN role to use the omnihumen chat feature."
        leftPanel={
          <ChatOmnihumenInput
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
            fetchVideoPromptGuides={fetchOmnihumenPromptGuides}
            handleUsePromptGuide={handleUsePromptGuide}
            usedCredit={usedCredit}
          />
        }
        loading={loading}
        isFetchingHistory={isFetchingHistory}
        hasMore={hasMore}
        messagesLength={messages.length}
        emptyDescription="Enter a prompt or pick a template from the left panel, then hit Generate."
        onScroll={handleScroll}
        chatContainerRef={chatContainerRef}
        bottomRef={bottomRef}
        rightContent={
          <>
            {messages.map((item: Message, index) => (
              <Flex
                key={`${item.id}-${index}`}
                vertical
                style={{ marginBottom: 8 }}
              >
                <Flex gap={8} align="flex-start">
                  <Flex
                    vertical
                    style={{ width: "100%", alignItems: "flex-start" }}
                  >
                    <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {item.users.username}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        •
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography.Text>
                    </Flex>

                    {item.prompt && (
                      <Card
                        size="small"
                        style={{
                          marginTop: 2,
                          borderRadius: 14,
                          borderTopLeftRadius: 6,
                          borderColor: semantic.colorBorder,
                          background: semantic.colorBgContainer,
                        }}
                        styles={{ body: { padding: "8px 12px" } }}
                      >
                        <Typography.Text
                          style={{
                            whiteSpace: "pre-wrap",
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.prompt}
                        </Typography.Text>
                      </Card>
                    )}

                    <OmnihumenSmartReference
                      selectedAIModel={selectedAIModel}
                      referenceImages={item.referenceImages}
                      resolution={item.generateConfig?.resolution}
                      fastMode={item.generateConfig?.fastMode}
                      seed={item.generateConfig?.seed}
                    />

                    {(item.genneratedStatus === "PENDING" ||
                      item.genneratedStatus === "PROCESSING") && (
                      <Card
                        size="small"
                        style={{
                          marginTop: 4,
                          borderRadius: 8,
                          borderColor: semantic.colorBorder,
                          background: semantic.colorBgElevated,
                        }}
                        styles={{ body: { padding: 8 } }}
                      >
                        <AiImageLoader />
                      </Card>
                    )}

                    {(item.genneratedStatus === "FAILED" ||
                      (item.genneratedStatus === "SUCCESS" &&
                        item.imageUrls?.length === 0)) && (
                      <Card
                        size="small"
                        style={{
                          marginTop: 4,
                          borderRadius: 8,
                          borderColor: semantic.colorErrorBorder,
                          background: semantic.colorErrorBg,
                        }}
                        styles={{ body: { padding: 8 } }}
                      >
                        <Typography.Text style={{ color: semantic.colorError }}>
                          Generate failed
                        </Typography.Text>
                      </Card>
                    )}

                    {item.genneratedStatus === "SUCCESS" &&
                      item.imageUrls &&
                      item.imageUrls.length > 0 && (
                        <Flex
                          vertical
                          gap={8}
                          style={{ marginTop: 8, width: "100%", maxWidth: 260 }}
                        >
                          {item.imageUrls.map(
                            (videoData: VideoMessage, videoIndex) => (
                              <VideoItem
                                key={`${videoData.id || videoData.imageUrl}-${videoIndex}`}
                                videoData={videoData}
                                onDownloadVideo={onDownloadVideo}
                                onShareVideo={(id, status) => {
                                  if (item.taskId) {
                                    onShareVideo(item.taskId, id, status);
                                  }
                                }}
                                shareStatus
                              />
                            ),
                          )}
                        </Flex>
                      )}
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </>
        }
      />
    </Flex>
  );
};

export default ChatGenerateOmnihumen;
