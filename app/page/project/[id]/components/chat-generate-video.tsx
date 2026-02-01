import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    type FC,
} from "react";
import { PermissionGuard } from "../../../../components/PermissionGuard";
import { projectPermissions } from "../../../../utils/permissions";
import Image from "next/image";
import {
    Avatar,
    Button,
    Form,
    Input,
    message,
    Upload,
    type UploadFile,
    type UploadProps,
    Spin,
    Select,
    Tooltip,
    Space,
    Switch,
    notification,
} from "antd";
import {
    UserOutlined,
    PaperClipOutlined,
    SendOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import LogsServices from "@/app/services/logs.service";
import GenerateImageServices from "@/app/services/generate-image.service";
import Avatars from "@/public/images/Avatar.jpg";
import type { ITFromGenerate } from "@/app/common";
import { TPromptGuideType, TPromptGuide } from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import type { RcFile } from "antd/es/upload";
import { Trash, Volume2, VolumeX } from "lucide-react";
import GalleryServices from "@/app/services/gellory.service";
import VideoItem from "./video-player";
import { TAIModel } from "@/app/common/ai-model.type";
import config from "@/app/config";
import VideoSmartReference from "./chat-components/video-smart-reference";
import ChatVideoInput from "./chat-components/chat-video-input";
import UploadsServices from "@/app/services/uploads.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";

interface VideoChatProps {
    projectId: string;
    userId?: string;
    activeKey: "image" | "vdo" | "library" | "activity";
    projectRole?: string | null;
    promptGuideTypes?: TPromptGuideType[];
    promptGuideOpenStatus: boolean;
    username?: string; // Added username
    selectedAIModel: TAIModel & { capabilities?: string[] } | undefined;
    setDisableTab: (disable: boolean) => void;
    onSetPromptTextRef?: React.MutableRefObject<
        ((id: number) => Promise<void>) | null
    >;
}



interface UserMessage {
    id?: number,
    userId?: string,
    username: string,
    fullname: string,
    email?: string,
    tier?: string,
    description?: string,
    phoneNumber?: string,
    status?: string,
    lastOn?: string,
    maxToken?: number,
    maxImages?: number,
    apiKeys?: string,
    token?: string,
    createdAt?: string,
    updatedAt?: string,
    agreement?: boolean,
    recentOrganizationId?: string
}

export interface VideoMessage {
    id?: string | undefined;
    imageUrl: string;
    thumbnailUrl?: string;
    status?: boolean;
}

interface Message {
    id: string,
    taskId: string,
    projectId: string,
    userId: string,
    prompt: string,
    typeGenerate: string,
    createdAt: string,
    status: boolean,
    genneratedStatus: string,
    generateConfig: {
        ratio: string,
        width: number,
        height: number,
        content: string,
        duration: string,
        modelName: string,
        imageCount: number,
        resolution: string
        generateAudio: boolean
    },
    percentage?: number,
    users: UserMessage
    referenceImages: string[],
    resolution: string,
    ratio: string,
    imageUrls: VideoMessage[]
}

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const ChatGenerateVideo: FC<VideoChatProps> = ({
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
    const { socket, isConnected } = useWebSocket();
    const [api, contextHolderNoti] = notification.useNotification();
    const [messageApi, contextHolder] = message.useMessage();
    const promptguideService = PromptGuideServices(axiosCore);
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
    const pageSize = 3;

    // Refs
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef<boolean>(true);
    const scrollHeightRef = useRef<number>(0);
    const isLoadingMoreRef = useRef<boolean>(false);
    const shouldAutoScrollRef = useRef<boolean>(false);
    const isAtBottomRef = useRef<boolean>(true);
    const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [selectedResolution, setSelectedResolution] = useState<string>("1080p");
    const [selectedAudio, setSelectedAudio] = useState<boolean>(false);
    const [selectedDurationType, setSelectedDurationType] = useState<{ value: string, label: string }>({ value: "Seconds", label: "Seconds" });
    const [selectedDuration, setSelectedDuration] = useState<number>(6);
    const [refImageFrist, setRefImageFrist] = useState<{ name: string; status: string; uid: string; url: string; imagePath: string }[]>([]);
    const [refImageLast, setRefImageLast] = useState<{ name: string; status: string; uid: string; url: string; imagePath: string }[]>([]);
    const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);
    const [draftMode, setDraftMode] = useState<boolean>(false)
    const [isMobile, setIsMobile] = useState(false);
    const [selectedWidth, setSelectedWidth] = useState<number>(1920);
    const [selectedHeight, setSelectedHeight] = useState<number>(1080);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    const openNotificationWithIcon = (type: NotificationType, message: string) => {
        api[type]({
            message: type,
            description: message,
        });
    };

    useEffect(() => {
        form.setFieldValue('duration', selectedDuration)
        form.setFieldValue('quantity', selectedQuantity)
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleTaskCreated = (data: {
            taskId: string,
            message: string,
            timestamp: string,
        }) => {
            console.log('✅ Task created:', data.taskId);
            setSubmitting(false);
        };

        const handleTaskStarted = (data: {
            status: number,
            data: {
                taskId: string,
                projectId: string,
                userId: string,
                prompt: string,
                typeGenerate: string,
                genneratedStatus: string,
                status: boolean,
                videoTaskId: string,
                message: string
            },
            oldTaskId: string
        }) => {
            console.log('🚀 Task started:', data.data.taskId);
            setMessages(prev => prev.map(msg =>
                msg.taskId === data.oldTaskId
                    ? {
                        ...msg, genneratedStatus: 'PROCESSING',
                        percentage: 10,
                        taskId: data.data.taskId,
                    }
                    : msg
            ));
        };

        const workerTaskStarted = (data: { taskId: string, timestamp: string }) => {
            console.log('🚀 Worker started:', data.taskId);
        };

        const workerUrlSuccess = (data: {
            taskId: string,
            videoUrl: string,
            timestamp: string
        }) => {
            console.log('🚓 Worker video url success:', data.taskId);
            setMessages(prev => prev.map(msg =>
                msg.taskId === data.taskId
                    ? {
                        ...msg,
                        genneratedStatus: 'SUCCESS',
                        imageUrls: [{ imageUrl: data.videoUrl, thumbnailUrl: "https://placehold.co/600x400/000000/FFFFFF/png" }],
                    }
                    : msg
            ));
        }

        const workerUploadSuccess = (data: {
            taskId: string,
            videoUrl: string,
            thumbnailUrl: string,
            timestamp: string
        }) => {
            console.log('🚕 Worker video upload success:', data.taskId);
            setMessages(prev => prev.map(msg =>
                msg.taskId === data.taskId
                    ? {
                        ...msg,
                        genneratedStatus: 'SUCCESS',
                        imageUrls: [{ imageUrl: data.videoUrl, thumbnailUrl: data.thumbnailUrl }],
                    }
                    : msg
            ));
        }

        const workerComplete = (data: {
            taskId: string,
            success: boolean,
            timestamp: string
        }) => {
            console.log('🚀 Task complete:', data.taskId);
            setMessages(prev => prev.map(msg =>
                msg.taskId === data.taskId
                    ? {
                        ...msg,
                        genneratedStatus: 'SUCCESS',
                    }
                    : msg
            ));
        }

        const handleProgress = (data: {
            taskId: string,
            timestamp: string
        }) => {
            console.log('📊 Progress:', data.taskId);

            // อัพเดท progress ใน UI
            setMessages(prev => prev.map(msg =>
                msg.taskId === data.taskId
                    ? {
                        ...msg,
                        genneratedStatus: 'PROCESSING',
                    }
                    : msg
            ));
        };

        // 6. Event เมื่อเกิด error
        const handleError = (error: {
            taskId?: string;
            message: string;
            details?: any;
        }) => {
            console.error('❌ Error:', error);

            openNotificationWithIcon('error', error.message || 'Generation failed');
            setSubmitting(false);

            if (error.taskId) {
                // อัพเดท message เป็น FAIL
                setMessages(prev => prev.filter(msg => msg.taskId !== error.taskId));
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
                if (messageData.length < pageSize) {
                    setHasMore(false);
                }
                if (messageData.length === 0) return []
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
                } else {
                    setMessages(itemsToProcess);
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
                    if (isFirstLoad.current) {
                        shouldAutoScrollRef.current = true;
                    }
                    isFirstLoad.current = false;
                    setLoading(false);
                }
            }

        }
        socket.on('video-task:created', handleTaskCreated);
        socket.on('task-video:started', handleTaskStarted);
        socket.on('video-generate:error', handleError);
        socket.on('worker:video-started', workerTaskStarted);
        socket.on('worker:video-url-success', workerUrlSuccess);
        socket.on('worker:video-upload-success', workerUploadSuccess);
        socket.on('worker:video-complete', workerComplete);
        socket.on('worker:video-progress', handleProgress);
        socket.on('chat:history', handleHistory);
        return () => {
            socket.off('video-task:created');
            socket.off('task-video:started');
            socket.off('video-generate:error');
            socket.off('worker:video-url-success');
            socket.off('worker:video-upload-success');
            socket.off('worker:video-complete');
            socket.off('worker:video-progress');
            socket.off('chat:history');
        };
    }, [socket, page, projectId]);


    useEffect(() => {
        setLoading(true);
        isFirstLoad.current = true;
        loadMoreMessages(0, false, currentId)
    }, [socket, projectId])

    const loadMoreMessages = (page: number, isLoadMore: boolean, currentId?: string) => {
        if (socket) {
            setDisableTab(true);
            const skip = page * pageSize;
            socket.emit('chat:get-history', {
                projectId,
                skip: skip,
                take: pageSize,
                type: 'video'
            });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom =
            Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
            50;
        isAtBottomRef.current = isAtBottom;

        if (target.scrollTop === 0 && hasMore && !loading && !isFirstLoad.current) {
            setIsFetchingHistory(true)
            scrollHeightRef.current = target.scrollHeight;
            const nextPage = page + 1;
            setPage(nextPage);
            loadMoreMessages(nextPage, true);
            // fetchMessages(nextPage, true);
        }
    };

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

    const onDownloadVideo = async (videoUrl: string) => {
        try {
            const urlWithoutParams = videoUrl.split("?")[0];
            const filename = urlWithoutParams.split("/").pop() || "video.mp4";

            const hide = message.loading("Downloading video...", 0);

            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);

            hide();
            message.success("Video downloaded successfully");
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

    const handleUploadChange = async ({ index, file, fileList: newFileList, status }: { index: number, file: UploadFile, fileList: UploadFile[], status: 'upload' | 'remove' }) => {
        if (file && status === 'upload') {
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
                                reject("Image size is too small, minimum side length must not be less than 300 px");
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
                    openNotificationWithIcon('error', String(error));
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
        } else if (status === 'remove') {
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

    const onRemoveFile = (file: UploadFile) => {
        // setRefImageFrist((prev) => prev.filter((f) => f.uid !== file.uid));
        // UploadsServices(axiosWorker).remove(file.uid);
    }

    const handleFormSubmit = (values: any) => {
        if (!selectedAIModel) return openNotificationWithIcon("error", "Please select an AI model");
        const tempTask = `temp-${Date.now()}`
        const message = {
            taskId: tempTask,
            model: selectedAIModel.name,
            prompt: values.prompt,
            image: [refImageFrist[0].imagePath ? refImageFrist[0].imagePath : null, refImageLast[0].imagePath ? refImageLast[0].imagePath : null],
            sequentialImageGeneration: 'auto',
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
        }
        const tempMessage = {
            id: tempTask,
            taskId: tempTask,
            projectId: projectId,
            userId: userId,
            prompt: values.prompt,
            typeGenerate: "video",
            createdAt: new Date().toISOString(),
            status: true,
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
                username: username
            },
            referenceImages: [
                ...(refImageFrist[0] ? [refImageFrist[0].url] : []),
                ...(refImageLast[0] ? [refImageLast[0].url] : [])
            ],
            resolution: selectedResolution,
            ratio: selectedRatio,
            imageUrls: []
        } as Message;
        setMessages(prev => [...prev, tempMessage]);
        shouldAutoScrollRef.current = true;
        if (!socket || !isConnected) {
            messageApi.error('WebSocket is not connected. Please refresh the page.');
            return;
        }
        socket.emit('generate:video', message);
    }


    return (
        <div className={promptGuideOpenStatus ? "grid md:grid-cols-4 sm:grid-cols-1 gap-2" : ""}>
            <div className={`h-[calc(100vh-160px)] ${promptGuideOpenStatus ? "col-span-3" : ""}`}>
                {contextHolder}
                {contextHolderNoti}
                <div className="flex flex-col h-full bg-[#18181b] text-white overflow-hidden relative rounded-xl border border-white/10">
                    <div
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-6"
                    >
                        {loading && !isFirstLoad.current && (
                            <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                            </div>
                        )}

                        {!loading && messages.length === 0 && (
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
                        )}

                        {messages.map((massage: Message, index) => (
                            <div
                                key={`${massage.id}-${index}`}
                                className={`flex gap-4 "justify-start"`}>
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
                                            className={`px-3 py-1 rounded-2xl text-sm leading-relaxed shadow-md whitespace-pre-wrap bg-[#27272a] text-gray-200 border border-white/5 rounded-tl-sm`}>
                                            {massage.prompt}
                                        </div>
                                    )}

                                    <>
                                        <VideoSmartReference
                                            selectedAIModel={selectedAIModel}
                                            referenceImages={massage.referenceImages}
                                            resolution={massage.generateConfig?.resolution}
                                            ratio={massage.generateConfig?.ratio}
                                            duration={massage.generateConfig?.duration}
                                            isMultiImage={
                                                massage.imageUrls ? massage.imageUrls.length > 1 : false
                                            }
                                            generateAudio={massage.generateConfig?.generateAudio}
                                        />
                                        {(massage.genneratedStatus === "PENDING" ||
                                            massage.genneratedStatus === "PROCESSING") && (
                                                <div className="mt-1 p-2 bg-[#1e1e21] rounded-lg border border-white/5 flex items-center gap-3">
                                                    <Spin
                                                        indicator={
                                                            <LoadingOutlined style={{ fontSize: 24 }} spin />
                                                        }
                                                    />
                                                    <span className="text-gray-300">
                                                        Generating video... ({massage.genneratedStatus})
                                                    </span>
                                                </div>
                                            )}
                                        {massage.genneratedStatus === "FAIL" && (
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
                                                    {massage.imageUrls.map((videoData: VideoMessage, i) => (
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
                                                    ))}
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
                                <p className="text-lg font-medium mb-2">
                                    🚫 Access Restricted
                                </p>
                                <p className="text-sm">
                                    You need USER or ADMIN role to use the video chat feature.
                                </p>
                                <p className="text-xs mt-1 text-zinc-500">
                                    Contact your project administrator for access.
                                </p>
                            </div>
                        }
                    >
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
                            onRemoveFile={onRemoveFile}
                            setSelectedWidth={setSelectedWidth}
                            setSelectedHeight={setSelectedHeight}
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
            {!isMobile && (
                <div
                    className={`${promptGuideOpenStatus ? " h-[calc(100vh-200px)]  block" : "hidden"
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
                                                            // onClick={() =>
                                                            //     item.id && onSetPromptText(item.id)
                                                            // }
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
            )}
        </div>
    );
};

export default ChatGenerateVideo;
