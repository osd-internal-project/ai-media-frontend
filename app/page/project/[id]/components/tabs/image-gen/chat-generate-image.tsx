import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type FC,
} from "react";

import {
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  message,
  type UploadFile,
  type UploadProps,
  notification,
  Row,
  Col,
  Space,
  Progress,
  ProgressProps,
  Image,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  LoadingOutlined,
  LikeFilled,
  PictureOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";

// import Image from "next/image";
import { Download, ImageOff, StarIcon } from "lucide-react";
import type { RcFile } from "antd/es/upload";

import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import GenerateServices from "@/app/services/generate.service";
import Avatars from "@/public/images/Avatar.jpg";
import LogsServices from "@/app/services/logs.service";

import ImageConfigurationCard from "./image-smart-reference";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import PreviewImage from "../../chat-components/preview-image";
import PromptStart from "../../chat-components/prompt-start";
import ChatImageInput from "./chat-image-input";
import UploadsServices from "@/app/services/uploads.service";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { useSession } from "next-auth/react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig, aiCaveColors } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";
import GenerateTwoPaneLayout from "../../tab-layout/generate-two-pane-layout";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import ActionBar from "./action-bar";
import ResultHeader from "./result-header";
import ResultItem from "./image-result-item";
import { TPromptGuide } from "@/app/common/prompt-guide.type";
import AssistantModal from "../../assistant/assistant-modal";

export interface ImageChatProps {
  teamView: boolean;
  projectId: string;
  userId?: string;
  activeKey:
    | "image"
    | "video"
    | "omnihumen"
    | "dreamactor"
    | "library"
    | "activity"
    | "editor";
  projectRole?: string | null;
  promptGuideOpenStatus?: boolean;
  username?: string;
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
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

export interface UserMessage {
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

export interface ImageMessage {
  id: string;
  imageUrl: string;
  status: boolean;
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
  };
  percentage?: number;
  users: UserMessage;
  referenceImages: string[];
  resolution: string;
  ratio: string;
  imageUrls: ImageMessage[];
  seq?: number;
}

type NotificationType = "success" | "info" | "warning" | "error";

const ChatGenerateImage: FC<ImageChatProps> = ({
  teamView,
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
  const { mode } = useThemeMode();
  const { isMobile } = useResponsive();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const [api, contextHolderNoti] = notification.useNotification();
  const galleryService = useMemo(() => GalleryServices(axiosCore), []);
  const logsService = useMemo(() => LogsServices(axiosCore), []);
  const generateServices = useMemo(() => GenerateServices(axiosCore), []);
  const promptGuideService = useMemo(
    () => PromptGuideTypeServices(axiosCore),
    [],
  );
  const uploadsServices = useMemo(() => UploadsServices(axiosWorker), []);
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
  // const [page, setPage] = useState<number>(0);
  // const [currentId, setCurrentId] = useState<string | undefined>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [groupMode, setGroupMode] = useState<string | undefined>(undefined);
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [selectedMaximumImage, setSelectedMaximumImage] = useState<number>(1);
  const [selectedResolution, setSelectedResolution] = useState<string>("2k");
  const [selectedWidth, setSelectedWidth] = useState<number>(2048);
  const [selectedHeight, setSelectedHeight] = useState<number>(2048);
  const [fristRowSeq, setFristRowSeq] = useState<number | undefined>(undefined);
  const [lastRowSeq, setLastRowSeq] = useState<number | undefined>(undefined);
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
  const isFetchingRef = useRef<boolean>(false);
  const [usedCredit, setUsedCredit] = useState<{
    total?: number;
    used?: number;
  }>({
    total: undefined,
    used: undefined,
  });
  const [cerrentUsedCredit, setCerrentUsedCredit] = useState<number>(0);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  //fetch messages when load tab
  useEffect(() => {
    setMessages([]);
    setFristRowSeq(undefined);
    setLastRowSeq(undefined);
    isFirstLoad.current = true;
    fetchMessages();
  }, [projectId, activeKey, teamView]);

  //join room and fetch credit when load tab
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
      // loadMoreMessages(0, false, currentId);
    }
    fetchCredit();
  }, [socket, projectId, activeKey]);

  //fetch credit when change parameter
  useEffect(() => {
    fetchCerrentUsedCredit();
  }, [
    projectId,
    activeKey,
    selectedAIModel,
    refImage,
    selectedResolution,
    selectedMaximumImage,
    selectedRatio,
    selectedWidth,
    selectedHeight,
  ]);

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
      status: number;
      data: Message;
    }) => {
      console.log("🚀 Task started:", data);

      if (data.status === 200) {
        setMessages((prev) => {
          const index = prev.findIndex(
            (msg) => msg.taskId === data.data.taskId,
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
          prev.filter((msg) => msg.taskId !== data.data.taskId),
        );
      }
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
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };
    const workerStarted = (data: { taskId: string; status: string }) => {
      console.log("🚀 Worker started:", data);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
    };

    // 4. Event เมื่อสร้างภาพแต่ละรูปเสร็จ
    const handleImageComplete = (data: {
      taskId: string;
      imageIndex: number;
      imageUrl: string;
      imageId: string;
    }) => {
      console.log("🖼️ Image complete:", data);
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
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
      const processMessage = messagesRef.current.find(
        (msg) => msg.taskId === data.taskId,
      );
      if (processMessage) {
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
      } else {
        fetchNewMessage();
      }
      fetchCredit();
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
      const message = messagesRef.current.find(
        (msg) => msg.taskId === error.taskId,
      );
      if (message) {
        // อัพเดท message เป็น FAIL
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.taskId === error.taskId) {
              return {
                ...msg,
                genneratedStatus: "FAIL",
              };
            }
            return msg;
          }),
        );
      } else {
        fetchNewMessage();
      }
    };

    // 6. Event เมื่อเกิด Credit Change
    const handleCreditChange = (res: {
      success: boolean;
      data: {
        usedCredit: number;
        totalCredit?: number;
      };
    }) => {
      if (res.success) {
        setUsedCredit({
          used: res.data.usedCredit,
          total: res?.data?.totalCredit,
        });
      }
    };

    socket.on("task:started", handleTaskStarted);
    socket.on("task:created", handleTaskCreated);
    socket.on("worker:started", workerStarted);
    socket.on("worker:progress", handleProgress);
    socket.on("worker:image-complete", handleImageComplete);
    socket.on("worker:error", handleError);
    socket.on("worker:complete", handleTaskComplete);
    socket.on("generate:error", handleError);
    // socket.on("chat:history", handleHistory);
    socket.on("chat:used-credit", handleCreditChange);

    return () => {
      socket.off("task:started", handleTaskStarted);
      socket.off("task:created", handleTaskCreated);
      socket.off("worker:started", workerStarted);
      socket.off("worker:progress", handleProgress);
      socket.off("worker:image-complete", handleImageComplete);
      socket.off("worker:error", handleError);
      socket.off("worker:complete", handleTaskComplete);
      socket.off("generate:error", handleError);
      // socket.off("chat:history", handleHistory);
      socket.off("chat:message-saved");
      socket.off("chat:used-credit", handleCreditChange);
    };
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
      // const nextPage = page + 1;
      // setPage(nextPage);
      // loadMoreMessages(nextPage, true);
      fetchOldMessages();
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

  const fetchMessages = async () => {
    const data: Message[] = await logsService.findProjectTaskByPage(projectId, {
      organizationId: session?.user?.organizationId || "",
      type: "image",
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
      type: "image",
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
      type: "image",
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
  const generateMessage = (messageData: Message[], type: string) => {
    setDisableTab(false);
    // const messageData = messages.messages;
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
    // const topId = itemsToProcess[0].id;
    // if (topId) {
    //   setCurrentId(String(topId));
    // }

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
      setMessages([...itemsToProcess]);
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
  };

  const handleUploadChange: UploadProps["onChange"] = async ({
    file,
    fileList: newFileList,
  }) => {
    if (newFileList.length >= 1 && file.status !== "removed") {
      setFiles(newFileList);
      const fileToUpload = file.originFileObj || file;

      if (fileToUpload instanceof Blob) {
        setIsLoadingUpload(true);
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
          setIsLoadingUpload(false);
          return;
        }
      }

      setIsLoadingUpload(true);
      const formData = new FormData();
      formData.append("userId", userId ? userId : "");
      formData.append("index", newFileList.length.toString());
      formData.append("projectId", projectId);
      formData.append("generateType", "image");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload as Blob);
      formData.append("organizationId", session?.user?.organizationId || "");

      try {
        const result = await uploadsServices.upload(formData);
        console.log("Upload result:", result);
        setRefImage((prev) => [...prev, result]);

        // Update the file in the list with result URL for preview
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
      } catch (error) {
        console.error("Upload failed:", error);
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
      onRemoveFile(file);
    } else {
      setIsLoadingUpload(false);
      setFiles(newFileList);
    }
  };

  const onRemoveFile = (file: UploadFile) => {
    setRefImage((prev) => prev.filter((f) => f.uid !== file.uid));
    setFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    uploadsServices.remove(file.uid);
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
    const hide = messageApi.loading("Downloading image...", 0);
    try {
      const response = await galleryService.downloadFile(
        imageId,
        session?.user?.organizationId || "",
      );
      if (!response) throw new Error("Download failed or response is empty");
      const url = URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      hide();
      messageApi.success("Image downloaded successfully");
    } catch (error) {
      hide();
      console.error("Download error:", error);
      messageApi.error("Download failed");
    }
  };

  const onShareImage = async (
    taskId: string,
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const nextStatus = !currentStatus;
      const success = await galleryService.updateStatus(id, nextStatus);
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
    const currentTaskId = `temp-${Date.now()}`;
    const message = {
      taskId: currentTaskId,
      model: selectedAIModel.modelType,
      prompt: values.prompt,
      image: refImage.map((image) => image.imagePath),
      sequentialImageGeneration: "auto",
      resolution: selectedResolution,
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
      id: currentTaskId,
      taskId: currentTaskId,
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
    // console.log(message);
    setMessages((prev) => [...prev, tempMessage]);
    shouldAutoScrollRef.current = true;

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

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
    const current = form.getFieldValue("prompt");
    form.setFieldValue(
      "prompt",
      current ? current + "\n\n" + prompt.textPrompt : prompt.textPrompt,
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

            const result = await uploadsServices.uploadFromPrompt(formData);
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
  const fetchCerrentUsedCredit = async () => {
    const values = form.getFieldsValue();
    if (!selectedAIModel) {
      setCerrentUsedCredit(0);
      return;
    }

    const message = {
      model: selectedAIModel.modelType,
      prompt: values.prompt,
      image: refImage.map((image) => image.imagePath),
      sequentialImageGeneration: "auto",
      resolution: selectedResolution,
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
    const credit = await generateServices.getCreditPreSend(message);

    if (credit) {
      setCerrentUsedCredit(credit);
    } else {
      setCerrentUsedCredit(0);
    }
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
      {previewImage && (
        <PreviewImage closePreview={closePreview} previewImage={previewImage} />
      )}
      <GenerateTwoPaneLayout
        semantic={semantic}
        isMobile={isMobile}
        projectRole={projectRole}
        fallbackDescription="You need USER or ADMIN role to use the chat feature."
        tabKey="image"
        form={form}
        leftPanel={
          <ChatImageInput
            setGroupMode={setGroupMode}
            groupMode={groupMode || ""}
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
            handleUsePromptGuide={handleUsePromptGuide}
            usedCredit={usedCredit}
            cerrentUsedCredit={cerrentUsedCredit}
            fetchCerrentUsedCredit={fetchCerrentUsedCredit}
            organizationId={session?.user?.organizationId || undefined}
            selectedModel={selectedAIModel?.modelType || undefined}
            projectId={projectId}
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
            {/* Chat Header  */}
            <ResultHeader messages={messages} onClear={() => setMessages([])} />
            {/* item */}
            {messages.map((message: Message, index) => (
              <ResultItem
                key={message.id}
                message={message}
                index={index}
                semantic={semantic}
                aiCaveColors={aiCaveColors}
                onShareImage={onShareImage}
                onDownloadImage={onDownloadImage}
                setMessages={setMessages}
                messageApi={messageApi}
              />
            ))}
          </>
        }
      />
    </Flex>
  );
};

export default ChatGenerateImage;
