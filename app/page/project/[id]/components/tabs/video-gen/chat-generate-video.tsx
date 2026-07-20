import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
} from "react";
import {
  Flex,
  Form,
  message,
  type UploadFile,
  notification,
  UploadProps,
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
import UploadsServices from "@/app/services/uploads.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import { useSession } from "next-auth/react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import VideoResultItem from "./shared/result-item";
import ResultHeader from "./shared/result-header";
import { Message } from "./shared/video.types";
import GenerateTwoPaneLayout from "../../tab-layout/generate-two-pane-layout";
import { VideoFormManagerProps } from "./video-form-renderer";
import type {
  VideoModelConfig,
  VideoFormState,
  RefImage,
} from "../../tab-layout/types/generator-config.type";
import { TMasterModelType } from "@/app/common/master-model-type.type";

/** Props for each version's form input component */
export interface VideoInputProps {
  setSelectedRatio: (ratio: string) => void;
  selectedRatio: string;
  setSelectedResolution: (resolution: string) => void;
  selectedResolution: string;
  form: ReturnType<typeof Form.useForm>[0];
  filesFirst: UploadFile[];
  filesLast: UploadFile[];
  handleUploadChange: (args: {
    index: number;
    file: UploadFile;
    fileList: UploadFile[];
    status: "upload" | "remove";
  }) => void;
  handleSendMessage: (values: unknown) => void;
  isLoadingUpload: boolean;
  submitting: boolean;
  setSelectedDuration: (duration: number) => void;
  selectedDuration: number;
  setDraftMode: (draftMode: boolean) => void;
  draftMode: boolean;
  setSelectedAudio: (audio: boolean) => void;
  selectedAudio: boolean;
  setSelectedWidth: (width: number) => void;
  setSelectedHeight: (height: number) => void;
  promptGuideTemplates: TPromptGuideTemplate[];
  fetchVideoPromptGuides: () => Promise<void>;
  handleUsePromptGuide: (template: TPromptGuide) => void;
  usedCredit: { used?: number; total?: number };
  cerrentUsedCredit: number;
  selectedModel?: TMasterModelType & { capabilities?: string[] };
  organizationId?: string;
  files: UploadFile[];
  handleUploadChangeMuti: (info: UploadChangeParam) => void;
  beforeUploadMuti: (file: RcFile) => boolean;
  onRemoveFileMuti: (file: UploadFile) => Promise<void>;
  projectId: string;
}

interface Props extends VideoFormManagerProps {
  modelConfig: VideoModelConfig;
  FormComponent: FC<VideoInputProps>;
}

type NotificationType = "success" | "info" | "warning" | "error";

const ChatGenerateVideo: FC<Props> = ({
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
  modelConfig,
  FormComponent,
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
  // first-last upload mode state
  const [filesFirst, setFilesFirst] = useState<UploadFile[]>([]);
  const [filesLast, setFilesLast] = useState<UploadFile[]>([]);
  const [refImageFrist, setRefImageFrist] = useState<RefImage[]>([]);
  const [refImageLast, setRefImageLast] = useState<RefImage[]>([]);
  // multi-file upload mode state
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [refImage, setRefImage] = useState<RefImage[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cerrentUsedCredit, setCerrentUsedCredit] = useState<number>(0);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const shouldAutoScrollRef = useRef<boolean>(false);
  const isAtBottomRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);
  const currentLimitRef = useRef<number>(3);

  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedResolution, setSelectedResolution] = useState<string>("1080p");
  const [selectedAudio, setSelectedAudio] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(6);
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
  }>({ total: undefined, used: undefined });

  const [fristRowSeq, setFristRowSeq] = useState<number | undefined>(undefined);
  const [lastRowSeq, setLastRowSeq] = useState<number | undefined>(undefined);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (shouldAutoScrollRef.current && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        shouldAutoScrollRef.current = false;
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    setMessages([]);
    setFristRowSeq(undefined);
    setLastRowSeq(undefined);
    isFirstLoad.current = true;
    fetchMessages();
  }, [projectId, activeKey, teamView]);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const openNotificationWithIcon = useCallback(
    (type: NotificationType, msg: string) => {
      api[type]({ message: type, description: msg });
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
    refImage,
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
    const tempTask = `temp-${Date.now()}`;
    const computedFiles = await Promise.all(
      refImage.map(async (img) => ({
        type: await getTypeFile(img.imagePath),
        url: img.imagePath,
      })),
    );
    const state: VideoFormState = buildCurrentState(computedFiles);
    const payload = modelConfig.buildSubmitPayload(values, state, tempTask);
    const credit = await generateServices.getCreditPreSend(payload);
    setCerrentUsedCredit(credit ?? 0);
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
          const existingIds = new Set(prev.map((m) => m.id));
          const newItems = itemsToProcess.filter(
            (m: Message) => !existingIds.has(m.id),
          );
          if (newItems.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...newItems, ...prev];
        });
        isFirstLoad.current = false;
        setLoading(false);
        setIsFetchingHistory(false);
        isFetchingRef.current = false;
      } else if (type === "newmore") {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.taskId));
          const newItems = itemsToProcess.filter(
            (m: Message) => !existingIds.has(m.taskId),
          );
          if (newItems.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...newItems];
        });
        isFirstLoad.current = false;
        setLoading(false);
        setIsFetchingHistory(false);
        isFetchingRef.current = false;
      } else {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.taskId));
          return itemsToProcess.filter(
            (m: Message) => !existingIds.has(m.taskId),
          );
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
        if (isFirstLoad.current) shouldAutoScrollRef.current = true;
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
          .filter((s): s is number => s !== undefined && s !== null);
        if (seqValues.length > 0) {
          setFristRowSeq(Math.min(...seqValues));
          setLastRowSeq(Math.max(...seqValues));
        }
      }
      generateMessage(data, "reload");
    }
    fetchCredit();
  };

  const fetchCredit = () => {
    if (socket) {
      socket.emit("chat:get-used-credit", {
        projectId,
        organizationId: session?.user?.organizationId,
        userId: userId,
        type: "video",
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
        .filter((s): s is number => s !== undefined && s !== null);
      if (seqValues.length > 0) setFristRowSeq(Math.min(...seqValues));
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
        .filter((s): s is number => s !== undefined && s !== null);
      if (seqValues.length > 0) setLastRowSeq(Math.max(...seqValues));
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
      setSubmitting(false);
    };

    const handleTaskStarted = (data: {
      status: number;
      data: Message;
      oldTaskId: string;
    }) => {
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
      const found = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (found) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.taskId === data.taskId
              ? { ...msg, genneratedStatus: "PROCESSING", percentage: 10 }
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
      const found = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (found) {
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
      const found = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (found) {
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
      const found = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (found) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.taskId === data.taskId
              ? { ...msg, genneratedStatus: "SUCCESS" }
              : msg,
          ),
        );
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    const handleProgress = (data: { taskId: string; timestamp: string }) => {
      const found = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (found) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.taskId === data.taskId
              ? { ...msg, genneratedStatus: "PROCESSING" }
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
      details?: unknown;
    }) => {
      openNotificationWithIcon("error", error.message || "Generation failed");
      setSubmitting(false);
      if (error.taskId) {
        const found = messagesRef.current.find(
          (m) => m.taskId === error.taskId,
        );
        if (found) {
          setMessages((prev) =>
            prev.map((m) =>
              m.taskId === error.taskId
                ? { ...m, genneratedStatus: "FAILED" }
                : m,
            ),
          );
        } else {
          fetchNewMessage();
        }
      }
    };

    const handleCreditChange = (res: {
      success: boolean;
      data: { usedCredit: number; totalCredit?: number };
    }) => {
      console.log("Credit change received:", res);
      if (res.success) {
        setUsedCredit({
          used: res.data.usedCredit,
          total: res?.data?.totalCredit,
        });
      }
    };

    socket.on("video-task:created", handleTaskCreated);
    socket.on("task-video:started", handleTaskStarted);
    // socket.on("video-generate:error", handleError);
    socket.on("worker:video-error", handleError);
    socket.on("worker:video-started", workerTaskStarted);
    socket.on("worker:video-url-success", workerUrlSuccess);
    socket.on("worker:video-upload-success", workerUploadSuccess);
    socket.on("worker:video-complete", workerComplete);
    socket.on("worker:video-progress", handleProgress);
    socket.on("chat:used-credit", handleCreditChange);

    return () => {
      socket.off("video-task:created", handleTaskCreated);
      socket.off("task-video:started", handleTaskStarted);
      // socket.off("video-generate:error", handleError);
      socket.off("worker:video-error", handleError);
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

  const onDownloadVideo = async (fileName: string, videoId: string) => {
    const hide = messageApi.loading("Downloading video...", 0);
    try {
      galleryService.downloadFile(
        videoId,
        session?.user?.organizationId || "",
        fileName,
      );
      hide();
      messageApi.success("Video downloaded successfully");
    } catch (error) {
      hide();
      messageApi.error("Download failed");
    }
  };

  const onShareVideo = async (
    taskId: string,
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const nextStatus = currentStatus === true ? false : true;
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
    } catch {
      message.error("Failed to update status");
    }
  };

  /** first-last upload handler (used by seeda1-style form) */
  const handleUploadChange = async ({
    index,
    file,
    status,
  }: {
    index: number;
    file: UploadFile;
    fileList: UploadFile[];
    status: "upload" | "remove";
  }) => {
    if (file && status === "upload") {
      const newName = `image${index + 1}`;
      const renamedFile = { ...file, name: newName };
      if (index === 0) setFilesFirst([renamedFile]);
      else setFilesLast([renamedFile]);

      const fileToUpload = file.originFileObj || file;
      if (fileToUpload instanceof Blob) {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.src = URL.createObjectURL(fileToUpload as Blob);
            img.onload = () => {
              const minSide = Math.min(img.width, img.height);
              URL.revokeObjectURL(img.src);
              if (minSide < 300)
                reject(
                  "Image size is too small, minimum side length must not be less than 300 px",
                );
              else resolve();
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
      formData.append("userId", userId ?? "");
      formData.append("index", index.toString());
      formData.append("projectId", projectId);
      formData.append("generateType", "video");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload as Blob);
      formData.append("organizationId", session?.user?.organizationId || "");
      try {
        const result = await UploadsServices(axiosWorker).upload(formData);
        if (result) {
          const updateFile = (prev: UploadFile[]) =>
            prev.map((f) =>
              f.uid === file.uid
                ? {
                    ...f,
                    status: "done" as const,
                    url: result.url,
                    response: result,
                  }
                : f,
            );
          if (index === 0) {
            setFilesFirst(updateFile);
            setRefImageFrist([result]);
          } else {
            setFilesLast(updateFile);
            setRefImageLast([result]);
          }
        }
      } catch {
        const markError = (prev: UploadFile[]) =>
          prev.map((f) =>
            f.uid === file.uid ? { ...f, status: "error" as const } : f,
          );
        if (index === 0) setFilesFirst(markError);
        else setFilesLast(markError);
      }
    } else if (status === "remove") {
      setIsLoadingUpload(true);
      try {
        if (index === 0) {
          setRefImageFrist([]);
          setFilesFirst([]);
        } else {
          setRefImageLast([]);
          setFilesLast([]);
        }
        await UploadsServices(axiosWorker).remove(file.uid);
      } catch {
        // ignore
      }
    }
    setIsLoadingUpload(false);
  };

  /** multi-file upload handler (used by seeda2-style form) */
  const handleUploadChangeMuti: UploadProps["onChange"] = async ({
    file,
    fileList: newFileList,
  }) => {
    if (newFileList.length >= 1 && file.status !== "removed") {
      let imageCount = 1,
        videoCount = 1,
        audioCount = 1;
      const renamedFileList = newFileList.map((f) => {
        const t = f.type || "";
        const isImg =
          t.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name);
        const isVid =
          t.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name);
        const isAud =
          t.startsWith("audio/") || /\.(mp3|wav|aac|ogg)$/i.test(f.name);
        const fClone = { ...f };
        if (isImg) fClone.name = `image${imageCount++}`;
        else if (isVid) fClone.name = `video${videoCount++}`;
        else if (isAud) fClone.name = `audio${audioCount++}`;
        return fClone;
      });
      setFiles(renamedFileList);

      const renamedFile =
        renamedFileList.find((f) => f.uid === file.uid) || file;
      const fileToUpload = renamedFile.originFileObj || renamedFile;
      if (
        fileToUpload instanceof Blob &&
        fileToUpload.type.startsWith("image/")
      ) {
        setIsLoadingUpload(true);
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.src = URL.createObjectURL(fileToUpload as Blob);
            img.onload = () => {
              const minSide = Math.min(img.width, img.height);
              URL.revokeObjectURL(img.src);
              if (minSide < 300)
                reject(
                  "Image size is too small, minimum side length must not be less than 300 px",
                );
              else resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(img.src);
              resolve();
            };
          });
        } catch (error) {
          openNotificationWithIcon("error", String(error));
          setIsLoadingUpload(false);
          return;
        }
      }

      setIsLoadingUpload(true);
      const formData = new FormData();
      formData.append("userId", userId ?? "");
      formData.append("index", newFileList.length.toString());
      formData.append("projectId", projectId);
      formData.append("generateType", "video");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload as Blob);
      formData.append("organizationId", session?.user?.organizationId || "");
      try {
        const result = await UploadsServices(axiosWorker).upload(formData);
        setRefImage((prev) => [...prev, result]);
        setFiles((prev) =>
          prev.map((f) =>
            f.uid === file.uid
              ? {
                  ...f,
                  status: "done" as const,
                  url: result.url,
                  response: result,
                }
              : f,
          ),
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.uid === file.uid ? { ...f, status: "error" as const } : f,
          ),
        );
      } finally {
        setIsLoadingUpload(false);
      }
    } else if (file.status === "removed") {
      setIsLoadingUpload(false);
      onRemoveFileMuti(file);
    } else {
      setIsLoadingUpload(false);
      setFiles(newFileList);
    }
  };

  const onRemoveFileMuti = async (file: UploadFile) => {
    setRefImage((prev) => prev.filter((f) => f.uid !== file.uid));
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.uid !== file.uid);
      let imageCount = 1,
        videoCount = 1,
        audioCount = 1;
      const nameMap = new Map<string, string>();
      const renamedList = filtered.map((f) => {
        const t = f.type || "";
        const isImg =
          t.startsWith("image/") ||
          /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name) ||
          f.name.startsWith("image");
        const isVid =
          t.startsWith("video/") ||
          /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name) ||
          f.name.startsWith("video");
        const isAud =
          t.startsWith("audio/") ||
          /\.(mp3|wav|aac|ogg)$/i.test(f.name) ||
          f.name.startsWith("audio");
        let newName = f.name;
        if (isImg) newName = `image${imageCount++}`;
        else if (isVid) newName = `video${videoCount++}`;
        else if (isAud) newName = `audio${audioCount++}`;
        if (newName !== f.name) nameMap.set(f.name, newName);
        return { ...f, name: newName };
      });
      const currentPrompt = form.getFieldValue("prompt") || "";
      if (typeof currentPrompt === "string") {
        let newPrompt = currentPrompt;
        if (file.name)
          newPrompt = newPrompt.replace(
            new RegExp(`@${file.name}\\b`, "g"),
            "",
          );
        nameMap.forEach((newN, oldN) => {
          newPrompt = newPrompt.replace(
            new RegExp(`@${oldN}\\b`, "g"),
            `@${newN}`,
          );
        });
        if (currentPrompt !== newPrompt)
          setTimeout(() => form.setFieldValue("prompt", newPrompt), 0);
      }
      return renamedList;
    });
    await UploadsServices(axiosWorker).remove(file.uid);
  };

  const beforeUploadMuti = (file: RcFile): boolean => {
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

  const getTypeFile = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext!)) return "image";
    if (["mp3", "wav", "aac", "ogg"].includes(ext!)) return "audio";
    if (["mp4", "mov", "avi", "mkv"].includes(ext!)) return "video";
    return "unknown";
  };

  /** Helper to build the current VideoFormState snapshot */
  const buildCurrentState = useCallback(
    (computedFiles: { type: string; url: string }[]): VideoFormState => ({
      selectedAIModel,
      refImageFirst: refImageFrist,
      refImageLast: refImageLast,
      refImages: refImage,
      computedFiles,
      selectedResolution,
      selectedRatio,
      selectedWidth,
      selectedHeight,
      selectedDuration,
      selectedAudio,
      draftMode,
      projectId,
      userId: userId ?? "",
      organizationId: session?.user?.organizationId ?? undefined,
      username: username ?? "",
    }),
    [
      selectedAIModel,
      refImageFrist,
      refImageLast,
      refImage,
      selectedResolution,
      selectedRatio,
      selectedWidth,
      selectedHeight,
      selectedDuration,
      selectedAudio,
      draftMode,
      projectId,
      userId,
      session?.user?.organizationId,
      username,
    ],
  );

  async function handleUsePromptGuide(prompt: TPromptGuide) {
    form.setFieldValue("prompt", prompt.textPrompt);
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
          formData.append("userId", userId ?? "");
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
          } catch {
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);

        if (modelConfig.features?.uploadMode === "first-last") {
          const valid = results.filter(
            (r): r is { result: RefImage; index: number } =>
              r !== null && r.result !== null,
          );
          const first = valid.find((r) => r.index === 0);
          const last = valid.find((r) => r.index === 1);
          if (first) {
            setRefImageFrist([first.result]);
            setFilesFirst([
              {
                uid: first.result.uid || `rc-upload-${Date.now()}-0`,
                name: first.result.name,
                status: "done",
                url: first.result.url,
                response: first.result,
              },
            ]);
          }
          if (last) {
            setRefImageLast([last.result]);
            setFilesLast([
              {
                uid: last.result.uid || `rc-upload-${Date.now()}-1`,
                name: last.result.name,
                status: "done",
                url: last.result.url,
                response: last.result,
              },
            ]);
          }
        } else {
          const validResults = await Promise.all(
            results
              .filter(
                (r): r is { result: RefImage; index: number } => r !== null,
              )
              .map((r) => r.result),
          );
          setRefImage(validResults);
          setFiles(
            validResults.map((res: RefImage, i: number) => ({
              uid: res.uid || `rc-upload-${Date.now()}-${i}`,
              name: res.name,
              status: "done" as const,
              url: res.url,
              response: res,
            })),
          );
        }
      } catch (error) {
        console.error("Error in handleUsePromptGuide:", error);
      } finally {
        setIsLoadingUpload(false);
      }
    }
  }

  const handleFormSubmit = async (values: unknown) => {
    if (!selectedAIModel)
      return openNotificationWithIcon("error", "Please select an AI model");

    const tempTask = `temp-${Date.now()}`;
    const computedFiles = await Promise.all(
      refImage.map(async (img) => ({
        type: await getTypeFile(img.imagePath),
        url: img.imagePath,
      })),
    );

    const state = buildCurrentState(computedFiles);
    const socketPayload = modelConfig.buildSubmitPayload(
      values as Record<string, unknown>,
      state,
      tempTask,
    );

    const valuesTyped = values as Record<string, unknown>;
    const tempMessage: Message = {
      id: tempTask,
      taskId: tempTask,
      projectId,
      userId: userId ?? "",
      prompt: valuesTyped.prompt as string,
      typeGenerate: "video",
      createdAt: new Date().toISOString(),
      status: false,
      genneratedStatus: "PROCESSING",
      generateConfig: {
        ratio: selectedRatio,
        width: selectedWidth,
        height: selectedHeight,
        content: valuesTyped.prompt as string,
        duration: selectedDuration.toString(),
        modelName: selectedAIModel.name,
        imageCount: 0,
        resolution: selectedResolution,
        generateAudio: selectedAudio,
      },
      users: {
        fullname: username ?? "",
        userId: userId ?? "",
        username: username ?? "",
      },
      referenceImages: [
        ...(refImageFrist[0] ? [refImageFrist[0].url] : []),
        ...(refImageLast[0] ? [refImageLast[0].url] : []),
      ],
      resolution: selectedResolution,
      ratio: selectedRatio,
      imageUrls: [],
      organizationId: session?.user?.organizationId ?? undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);
    shouldAutoScrollRef.current = true;
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    if (!socket || !isConnected) {
      messageApi.error("WebSocket is not connected. Please refresh the page.");
      return;
    }
    socket.emit("generate:video", socketPayload);
  };

  return (
    <Flex
      vertical
      style={{ height: "100%", minHeight: 0, background: semantic.colorBgBase }}
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
          <FormComponent
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
            selectedModel={selectedAIModel}
            organizationId={session?.user?.organizationId ?? undefined}
            files={files}
            handleUploadChangeMuti={handleUploadChangeMuti}
            beforeUploadMuti={beforeUploadMuti}
            onRemoveFileMuti={onRemoveFileMuti}
            projectId={projectId}
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
                aiCaveColors={{ dreamActor: "#8b5cf6" }}
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
