import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type FC,
} from "react";
import { PermissionGuard } from "../../../../../../components/PermissionGuard";
import { projectPermissions } from "../../../../../../utils/permissions";
import {
  Button,
  Card,
  Flex,
  Form,
  message,
  type UploadFile,
  Typography,
  notification,
} from "antd";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import GalleryServices from "@/app/services/gellory.service";
import LogsServices from "@/app/services/logs.service";
import GenerateServices from "@/app/services/generate.service";
import VideoItem from "./video-player";
import VideoSmartReference from "./video-smart-reference";
import UploadsServices from "@/app/services/uploads.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { useSession } from "next-auth/react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import ChatVideoInput from "./chat-video-input";
import GenerateTwoPaneLayout from "../../tab-layout/generate-two-pane-layout";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import VideoMessageItem from "./result-item";
import VideoResultItem from "./result-item";
import ResultHeader from "./result-header";

interface VideoChatProps {
  teamView: boolean;
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
  id?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status?: boolean;
  fileName?: string;
}

export interface Message {
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
    generateAudio: boolean;
  };
  percentage?: number;
  users: UserMessage;
  referenceImages: string[];
  resolution: string;
  ratio: string;
  imageUrls: VideoMessage[];
  seq?: number;
}

type NotificationType = "success" | "info" | "warning" | "error";

const ChatGenerateVideo: FC<VideoChatProps> = ({
  teamView,
  projectId,
  userId,
  activeKey,
  projectRole,
  promptGuideOpenStatus: _promptGuideOpenStatus,
  username,
  selectedAIModel,
  setDisableTab,
  onSetPromptTextRef: _onSetPromptTextRef,
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const { socket, isConnected } = useWebSocket();
  const [api, contextHolderNoti] = notification.useNotification();
  const [messageApi, contextHolder] = message.useMessage();
  const promptGuideTypeService = PromptGuideTypeServices(axiosCore);
  const promptGuideService = PromptGuideServices(axiosCore);
  const galleryService = GalleryServices(axiosCore);
  const logsService = LogsServices(axiosCore);
  const generateServices = GenerateServices(axiosCore);
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [filesFirst, setFilesFirst] = useState<UploadFile[]>([]);
  const [filesLast, setFilesLast] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cerrentUsedCredit, setCerrentUsedCredit] = useState<number>(0);

  // const [page, setPage] = useState<number>(0);
  // const [currentId, setCurrentId] = useState<string | undefined>("");
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
  // const historyPageSize = 1;
  const currentLimitRef = useRef<number>(initialPageSize);
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedResolution, setSelectedResolution] = useState<string>("1080p");
  const [selectedAudio, setSelectedAudio] = useState<boolean>(false);
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
  const isFetchingRef = useRef<boolean>(false);
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

  const [fristRowSeq, setFristRowSeq] = useState<number | undefined>(undefined);
  const [lastRowSeq, setLastRowSeq] = useState<number | undefined>(undefined);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setFristRowSeq(undefined);
    setLastRowSeq(undefined);
    isFirstLoad.current = true;
    fetchMessages();
  }, [projectId, activeKey, teamView]);
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const openNotificationWithIcon = useCallback(
    (type: NotificationType, message: string) => {
      api[type]({
        message: type,
        description: message,
      });
    },
    [api],
  );
  useEffect(() => {
    fetchCerrentUsedCredit();
  }, [
    projectId,
    activeKey,
    refImageFrist,
    refImageLast,
    selectedResolution,
    selectedRatio,
    selectedWidth,
    selectedHeight,
    selectedDuration,
    selectedAudio,
    draftMode,
  ]);
  const fetchCerrentUsedCredit = async () => {
    const values = form.getFieldsValue();
    if (!selectedAIModel) {
      setCerrentUsedCredit(0);
      return;
    }
    const firstImage = refImageFrist.length > 0 ? refImageFrist[0] : null;
    const lastImage = refImageLast.length > 0 ? refImageLast[0] : null;
    const tempTask = `temp-${Date.now()}`;
    const message = {
      taskId: tempTask,
      model: selectedAIModel.modelType,
      prompt: values.prompt,
      image: [
        firstImage?.imagePath ? firstImage.imagePath : null,
        lastImage?.imagePath ? lastImage.imagePath : null,
      ],
      sequentialImageGeneration: "auto",
      size: selectedResolution,
      maxImages: 0,
      watermark: false,
      ratio: selectedRatio,
      projectId: projectId,
      userId: userId,
      width: selectedWidth,
      height: selectedHeight,
      imageGenerateType: "",
      typeGenerate: "video",
      duration: selectedDuration,
      generateAudio: selectedAudio,
      draft: draftMode,
      organizationId: session?.user?.organizationId,
    };
    const credit = await generateServices.getCreditPreSend(message);
    if (credit) {
      setCerrentUsedCredit(credit);
    } else {
      setCerrentUsedCredit(0);
    }
  };
  const generateMessage = useCallback(
    (messageData: Message[], type: string) => {
      setDisableTab(false);
      if (isFetchingHistory || type === "loadmore") {
        isLoadingMoreRef.current = true;
      }
      if (messageData.length < currentLimitRef.current) {
        setHasMore(false);
      }
      if (messageData.length === 0) {
        if (isFetchingHistory) {
          setIsFetchingHistory(false);
          isFetchingRef.current = false;
        }
        setLoading(false);
        return;
      }
      const itemsToProcess = [...messageData].reverse();

      if (type === "loadmore") {
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
        isFetchingRef.current = false;
      } else if (type === "newmore") {
        setMessages((prev) => {
          const existingTaskIds = new Set(prev.map((m) => m.taskId));
          const uniqueNewMessages = itemsToProcess.filter(
            (m: Message) => !existingTaskIds.has(m.taskId),
          );

          if (uniqueNewMessages.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...uniqueNewMessages];
        });
        isFirstLoad.current = false;
        setLoading(false);
        setIsFetchingHistory(false);
        isFetchingRef.current = false;
      } else {
        setMessages((prev) => {
          const existingTaskIds = new Set(prev.map((m) => m.taskId));
          const uniqueNewMessages = itemsToProcess.filter(
            (m: Message) => !existingTaskIds.has(m.taskId),
          );
          return [...uniqueNewMessages];
        });
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
        setLoading(false);
      }
    },
    [isFetchingHistory, setDisableTab],
  );

  const fetchMessages = async () => {
    const data: Message[] = await logsService.findProjectTaskByPage(projectId, {
      organizationId: session?.user?.organizationId || "",
      type: "video",
      skip: 0,
      take: 3,
      ...(!teamView && { userId: userId }),
    });
    if (data) {
      if (data.length > 0) {
        const seqValues = data
          .map((p) => p.seq)
          .filter((s) => s !== undefined && s !== null);
        if (seqValues && seqValues.length > 0) {
          const minSeq = Math.min(...seqValues);
          const maxSeq = Math.max(...seqValues);
          setFristRowSeq(minSeq);
          setLastRowSeq(maxSeq);
        }
      }
      generateMessage(data, "reload");
    }
    fetchCredit();
  };

  const fetchCredit = async () => {
    if (socket) {
      socket.emit("chat:get-used-credit", {
        projectId,
        organizationId: session?.user?.organizationId,
        userId: userId,
        type: "image",
      });
    }
  };

  const fetchOldMessages = async () => {
    const data: Message[] = await logsService.findProjectTaskByPage(projectId, {
      organizationId: session?.user?.organizationId || "",
      type: "video",
      skip: 0,
      take: 1,
      fristsql: fristRowSeq,
      ...(!teamView && { userId: userId }),
    });
    if (data && data.length > 0) {
      const seqValues = data
        .map((p) => p.seq)
        .filter((s) => s !== undefined && s !== null);
      if (seqValues && seqValues.length > 0) {
        const minSeq = Math.min(...seqValues);
        setFristRowSeq(minSeq);
      }
      generateMessage(data, "loadmore");
    }
  };
  const fetchNewMessage = async () => {
    const data: Message[] = await logsService.findProjectTaskByPage(projectId, {
      organizationId: session?.user?.organizationId || "",
      type: "video",
      skip: 0,
      take: 1,
      lastsql: lastRowSeq,
      ...(!teamView && { userId: userId }),
    });
    if (data && data.length > 0) {
      const seqValues = data
        .map((p) => p.seq)
        .filter((s) => s !== undefined && s !== null);
      if (seqValues && seqValues.length > 0) {
        const maxSeq = Math.max(...seqValues);
        setLastRowSeq(maxSeq);
      }
      generateMessage(data, "newmore");
    }
  };
  useEffect(() => {
    if (!socket || activeKey !== "video") return;
    const handleTaskCreated = (data: {
      taskId: string;
      message: string;
      timestamp: string;
      data: Message;
    }) => {
      console.log("✅ Task created:", data);
      setSubmitting(false);
    };

    const handleTaskStarted = (data: {
      status: number;
      data: Message;
      oldTaskId: string;
    }) => {
      console.log("🚀 Task started:", data.data.taskId);
      if (data.status === 200) {
        setMessages((prev) => {
          const index = prev.findIndex(
            (msg) =>
              msg.taskId === data.oldTaskId || msg.taskId === data.data.taskId,
          );
          if (index !== -1) {
            return prev.map((msg, i) =>
              i === index ? { ...msg, ...data.data } : msg,
            );
          }
          return [...prev, data.data];
        });
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.taskId !== data.oldTaskId),
        );
      }
      shouldAutoScrollRef.current = true;
    };

    const workerTaskStarted = (data: { taskId: string; timestamp: string }) => {
      console.log("🚀 Worker started:", data.taskId);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    const workerUrlSuccess = (data: {
      taskId: string;
      videoUrl: string;
      timestamp: string;
    }) => {
      console.log("🚓 Worker video url success:", data.taskId);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    const workerUploadSuccess = (data: {
      taskId: string;
      videoUrl: string;
      thumbnailUrl: string;
      timestamp: string;
    }) => {
      console.log("🚕 Worker video upload success:", data.taskId);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.taskId === data.taskId
              ? {
                  ...msg,
                  genneratedStatus: "SUCCESS",
                  imageUrls: [
                    {
                      imageUrl: data.videoUrl,
                      thumbnailUrl: data.thumbnailUrl,
                    },
                  ],
                }
              : msg,
          ),
        );
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    const workerComplete = (data: {
      taskId: string;
      success: boolean;
      timestamp: string;
    }) => {
      console.log("🚀 Task complete:", data.taskId);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    const handleProgress = (data: { taskId: string; timestamp: string }) => {
      console.log("📊 Progress:", data.taskId);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    const handleError = (error: {
      taskId?: string;
      message: string;
      details?: any;
    }) => {
      console.error("❌ Error:", error);
      openNotificationWithIcon("error", error.message || "Generation failed");
      setSubmitting(false);

      if (error.taskId) {
        const msg = messagesRef.current.find((m) => m.taskId === error.taskId);
        if (msg) {
          setMessages((prev) =>
            prev.map((m) =>
              m.taskId === error.taskId
                ? {
                    ...m,
                    genneratedStatus: "FAIL",
                  }
                : m,
            ),
          );
        } else {
          fetchNewMessage();
        }
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

    socket.on("video-task:created", handleTaskCreated);
    socket.on("task-video:started", handleTaskStarted);
    socket.on("video-generate:error", handleError);
    socket.on("worker:video-started", workerTaskStarted);
    socket.on("worker:video-url-success", workerUrlSuccess);
    socket.on("worker:video-upload-success", workerUploadSuccess);
    socket.on("worker:video-complete", workerComplete);
    socket.on("worker:video-progress", handleProgress);
    socket.on("chat:used-credit", handleCreditChange);

    return () => {
      socket.off("video-task:created", handleTaskCreated);
      socket.off("task-video:started", handleTaskStarted);
      socket.off("video-generate:error", handleError);
      socket.off("worker:video-url-success", workerUrlSuccess);
      socket.off("worker:video-upload-success", workerUploadSuccess);
      socket.off("worker:video-complete", workerComplete);
      socket.off("worker:video-progress", handleProgress);
      socket.off("chat:used-credit", handleCreditChange);
    };
  }, [socket, projectId, activeKey]);

  useEffect(() => {
    if (activeKey === "video") {
      if (socket) {
        socket.emit("join-room", {
          projectId,
          type: "video",
          message: `Joined room ${projectId}`,
        });
      }
      setLoading(true);
      isFirstLoad.current = true;
    }
  }, [socket, projectId, activeKey]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      50;
    isAtBottomRef.current = isAtBottom;
    if (
      target.scrollTop === 0 &&
      !loading &&
      !isFirstLoad.current &&
      !isFetchingRef.current
    ) {
      isFetchingRef.current = true;
      setIsFetchingHistory(true);
      scrollHeightRef.current = target.scrollHeight;
      fetchOldMessages();
    }
  };

  async function fetchVideoPromptGuides() {
    if (session?.user?.organizationId) {
      const types = await promptGuideTypeService.findAll(
        session?.user?.organizationId,
        "video",
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

  // Restore scroll position after loading more
  // useEffect(() => {
  //     if (isLoadingMoreRef.current && chatContainerRef.current) {
  //         const newScrollHeight = chatContainerRef.current.scrollHeight;
  //         const scrollDiff = newScrollHeight - scrollHeightRef.current;

  //         chatContainerRef.current.style.scrollBehavior = "auto";
  //         chatContainerRef.current.scrollTop = scrollDiff;

  //         requestAnimationFrame(() => {
  //             if (chatContainerRef.current) {
  //                 chatContainerRef.current.style.scrollBehavior = "smooth";
  //             }
  //         });

  //         isLoadingMoreRef.current = false;
  //     }
  // }, [messages]);

  // useEffect(() => {
  //     if (shouldAutoScrollRef.current && messages.length > 0) {
  //         setTimeout(() => {
  //             bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  //             shouldAutoScrollRef.current = false;
  //         }, 100);
  //     }
  // }, [messages.length]);

  const onDownloadVideo = async (fileName: string, videoId: string) => {
    // try {
    // //   const urlWithoutParams = videoUrl.split("?")[0];
    // //   const filename = urlWithoutParams.split("/").pop() || "video.mp4";

    // //   const hide = message.loading("Downloading video...", 0);

    // //   const response = await fetch(videoUrl);
    // //   if (!response.ok) throw new Error("Download failed");

    // //   const blob = await response.blob();
    // //   const url = URL.createObjectURL(blob);
    // //   const link = document.createElement("a");
    // //   link.href = url;
    // //   link.download = filename;
    // //   link.click();
    // //   URL.revokeObjectURL(url);

    // //   hide();
    // //   message.success("Video downloaded successfully");
    // } catch (error) {
    //   console.error("Download error:", error);
    //   message.error("Download failed");
    // }
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
      if (index === 0) {
        setFilesFirst([file]);
      } else {
        setFilesLast([file]);
      }

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
      formData.append("generateType", "video");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload as Blob);
      formData.append("organizationId", session?.user?.organizationId || "");
      try {
        const result = await UploadsServices(axiosWorker).upload(formData);
        if (result) {
          const updatedFile = {
            ...file,
            status: "done" as const,
            url: result.url,
            response: result,
          };
          if (index === 0) {
            setFilesFirst([updatedFile]);
            setRefImageFrist((prev) => [...prev, result]);
          } else {
            setFilesLast([updatedFile]);
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
          formData.append("generateType", "video");
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

  const handleFormSubmit = (values: any) => {
    if (!selectedAIModel)
      return openNotificationWithIcon("error", "Please select an AI model");
    const firstImage = refImageFrist.length > 0 ? refImageFrist[0] : null;
    const lastImage = refImageLast.length > 0 ? refImageLast[0] : null;
    const tempTask = `temp-${Date.now()}`;
    const message = {
      taskId: tempTask,
      model: selectedAIModel.modelType,
      prompt: values.prompt,
      image: [
        firstImage?.imagePath ? firstImage.imagePath : null,
        lastImage?.imagePath ? lastImage.imagePath : null,
      ],
      sequentialImageGeneration: "auto",
      size: selectedResolution,
      maxImages: 0,
      watermark: false,
      ratio: selectedRatio,
      projectId: projectId,
      userId: userId,
      width: selectedWidth,
      height: selectedHeight,
      imageGenerateType: "",
      typeGenerate: "video",
      duration: selectedDuration,
      generateAudio: selectedAudio,
      draft: draftMode,
      organizationId: session?.user?.organizationId,
    };
    const tempMessage = {
      id: tempTask,
      taskId: tempTask,
      projectId: projectId,
      userId: userId,
      prompt: values.prompt,
      typeGenerate: "video",
      createdAt: new Date().toISOString(),
      status: false,
      genneratedStatus: "PROCESSING",
      generateConfig: {
        ratio: selectedRatio,
        width: selectedWidth,
        height: selectedHeight,
        content: values.prompt,
        duration: selectedDuration.toString(),
        modelName: selectedAIModel.name,
        imageCount: 0,
        resolution: selectedResolution,
        draft: draftMode,
        generateAudio: selectedAudio,
        watermark: false,
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
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    if (!socket || !isConnected) {
      messageApi.error("WebSocket is not connected. Please refresh the page.");
      return;
    }
    socket.emit("generate:video", message);
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
        fallbackDescription="You need USER or ADMIN role to use the video chat feature."
        tabKey="video"
        form={form}
        leftPanel={
          <ChatVideoInput
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
            setSelectedAudio={setSelectedAudio}
            selectedAudio={selectedAudio}
            setSelectedWidth={setSelectedWidth}
            setSelectedHeight={setSelectedHeight}
            promptGuideTemplates={promptGuideTemplates}
            fetchVideoPromptGuides={fetchVideoPromptGuides}
            handleUsePromptGuide={handleUsePromptGuide}
            usedCredit={usedCredit}
            cerrentUsedCredit={cerrentUsedCredit}
            selectedModel={selectedAIModel?.modelType || undefined}
            organizationId={session?.user?.organizationId || undefined}
          />
        }
        loading={loading}
        isFetchingHistory={isFetchingHistory}
        hasMore={hasMore}
        messagesLength={messages.length}
        emptyDescription="Enter a prompt and frame images from the left panel, then hit Generate."
        onScroll={handleScroll}
        chatContainerRef={chatContainerRef}
        bottomRef={bottomRef}
        rightContent={
          <>
            <ResultHeader messages={messages} onClear={() => setMessages([])} />
            {messages.map((item, index) => (
              <VideoResultItem
                key={item.id || item.taskId || index}
                message={item}
                index={index}
                semantic={semantic}
                aiCaveColors={{ dreamActor: "#8b5cf6" }} // หรือเอาจาก theme จริงก็ได้
                onShareVideo={onShareVideo}
                onDownloadVideo={onDownloadVideo}
                setMessages={setMessages}
                selectedAIModel={selectedAIModel}
              />
            ))}
          </>
        }
      />
    </Flex>
  );
};

export default ChatGenerateVideo;
