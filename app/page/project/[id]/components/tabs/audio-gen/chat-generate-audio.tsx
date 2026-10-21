import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
} from "react";
import { Flex, Form, message, notification } from "antd";
import type { RcFile } from "antd/es/upload";
import { useSession } from "next-auth/react";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import LogsServices from "@/app/services/logs.service";
import GenerateServices from "@/app/services/generate.service";
import UploadsServices from "@/app/services/uploads.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getCanvasBg, getThemeConfig } from "@/app/theme/themeConfig";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import GenerateTwoPaneLayout from "../../tab-layout/generate-two-pane-layout";
import ResultHeader from "../video-gen/shared/result-header";
import type {
  AudioFormat,
  AudioFormState,
  AudioModelConfig,
  AudioReferenceSlot,
  RefImage,
} from "../../tab-layout/types/generator-config.type";
import {
  readAudioDuration,
  readImageSize,
} from "../../tab-layout/utils/file-preview.util";
import {
  fetchOlderTasks,
  HISTORY_LOAD_THRESHOLD_PX,
  HISTORY_PAGE_SIZE,
} from "../fetch-older-tasks";
import AudioResultItem from "./shared/audio-result-item";
import { Message, isAudioLoading } from "./shared/audio.types";
import type { AudioFormRendererProps } from "./audio-form-renderer";

/** ช่อง ref ในฟอร์ม — เก็บชื่อ/uid ของไฟล์ที่อัปโหลดไว้แสดงผลและลบ */
export interface AudioReferenceInput extends AudioReferenceSlot {
  fileName?: string;
  uid?: string;
  uploading?: boolean;
}

/** Props for each version's form input component */
export interface AudioInputProps {
  form: ReturnType<typeof Form.useForm>[0];
  features: AudioModelConfig["features"];
  references: AudioReferenceInput[];
  addReference: () => void;
  removeReference: (index: number) => void;
  setReferenceMode: (index: number, mode: AudioReferenceSlot["mode"]) => void;
  setReferenceValue: (index: number, value: string) => void;
  uploadReference: (index: number, file: RcFile) => void;
  refImage: RefImage | null;
  uploadRefImage: (file: RcFile) => void;
  removeRefImage: () => void;
  format: AudioFormat;
  setFormat: (format: AudioFormat) => void;
  sampleRate: number | undefined;
  setSampleRate: (rate: number | undefined) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  loudnessRate: number;
  setLoudnessRate: (rate: number) => void;
  pitchRate: number;
  setPitchRate: (rate: number) => void;
  enableSubtitle: boolean;
  setEnableSubtitle: (enabled: boolean) => void;
  handleSendMessage: (values: unknown) => void;
  isLoadingUpload: boolean;
  submitting: boolean;
  usedCredit: { used?: number; total?: number };
  cerrentUsedCredit: number;
  selectedModel?: TMasterModelType & { capabilities?: string[] };
  projectId: string;
}

interface Props extends AudioFormRendererProps {
  modelConfig: AudioModelConfig;
  FormComponent: FC<AudioInputProps>;
}

const HISTORY_TYPE = "audio";

const ChatGenerateAudio: FC<Props> = ({
  teamView,
  projectId,
  userId,
  activeKey,
  projectRole,
  username,
  selectedAIModel,
  setDisableTab,
  modelConfig,
  FormComponent,
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId ?? undefined;
  const { socket, isConnected } = useWebSocket();
  const [api, contextHolderNoti] = notification.useNotification();
  const [messageApi, contextHolder] = message.useMessage();
  const logsService = LogsServices(axiosCore);
  const generateServices = GenerateServices(axiosCore);
  const galleryService = GalleryServices(axiosCore);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cerrentUsedCredit, setCerrentUsedCredit] = useState<number>(0);
  const [usedCredit, setUsedCredit] = useState<{ total?: number; used?: number }>(
    {},
  );
  const [fristRowSeq, setFristRowSeq] = useState<number | undefined>();
  const [lastRowSeq, setLastRowSeq] = useState<number | undefined>();

  // form state
  const [references, setReferences] = useState<AudioReferenceInput[]>([]);
  const [refImage, setRefImage] = useState<RefImage | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [sampleRate, setSampleRate] = useState<number | undefined>();
  const [speechRate, setSpeechRate] = useState<number>(0);
  const [loudnessRate, setLoudnessRate] = useState<number>(0);
  const [pitchRate, setPitchRate] = useState<number>(0);
  const [enableSubtitle, setEnableSubtitle] = useState<boolean>(false);
  const isLoadingUpload =
    isUploadingImage || references.some((ref) => ref.uploading);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollBottomRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const isAtBottomRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);
  const messagesRef = useRef<Message[]>([]);
  // error ที่มาถึงก่อน card ของ taskId นั้นจะอยู่ใน list — ใช้ปิด card ตอนมันเข้ามา ไม่ให้ค้าง loading
  const failedTasksRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const notifyError = useCallback(
    (msg: string) => api.error({ message: "error", description: msg }),
    [api],
  );

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior }), 100);

  const historyQuery = (query: {
    skip: number;
    take: number;
    fristsql?: number;
    lastsql?: number;
  }) =>
    logsService.findProjectTaskByPage(projectId, {
      organizationId: organizationId || "",
      type: HISTORY_TYPE,
      ...query,
      ...(!teamView && { userId }),
    }) as Promise<Message[] | undefined>;

  const seqRange = (rows: Message[]) =>
    rows
      .map((row) => row.seq)
      .filter((s): s is number => s !== undefined && s !== null);

  const fetchCredit = () => {
    socket?.emit("chat:get-used-credit", {
      projectId,
      organizationId,
      userId,
      type: HISTORY_TYPE,
    });
  };

  const fetchMessages = async () => {
    const data = await historyQuery({ skip: 0, take: 3 });
    if (data && data.length > 0) {
      const seqs = seqRange(data);
      if (seqs.length > 0) {
        setFristRowSeq(Math.min(...seqs));
        setLastRowSeq(Math.max(...seqs));
      }
      if (data.length < 3) setHasMore(false);
      setMessages([...data].reverse());
      scrollToBottom("instant");
    } else if (data) {
      setHasMore(false);
    }
    isFirstLoad.current = false;
    setLoading(false);
    setDisableTab(false);
    fetchCredit();
  };

  useEffect(() => {
    setMessages([]);
    setFristRowSeq(undefined);
    setLastRowSeq(undefined);
    setHasMore(true);
    setLoading(true);
    isFirstLoad.current = true;
    fetchMessages();
  }, [projectId, activeKey, teamView]);

  const fetchOldMessages = async () => {
    try {
      const result = await fetchOlderTasks<Message>(
        fristRowSeq,
        new Set(messagesRef.current.map((m) => m.id)),
        (fristsql) =>
          historyQuery({ skip: 0, take: HISTORY_PAGE_SIZE, fristsql }),
      );
      if (result.status === "end") setHasMore(false);
      if (result.status !== "found") return;
      setFristRowSeq(result.cursor);
      if (result.items.length > 0) {
        isLoadingMoreRef.current = true;
        setMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          return [
            ...[...result.items].reverse().filter((m) => !known.has(m.id)),
            ...prev,
          ];
        });
      }
    } finally {
      // reset ทุกกรณี — ได้ [] หรือ request พังต้องไม่ทิ้ง spinner ค้าง
      isFetchingRef.current = false;
      setIsFetchingHistory(false);
    }
  };

  /**
   * ดึง row ล่าสุดจาก DB มาแทน card ที่ยัง loading (ได้ gallery id สำหรับดาวน์โหลด/กดดาว)
   * history กรอง FAILED ออก: card ที่ loading แต่ไม่มีในผลลัพธ์ = fail ไปแล้ว
   */
  const resyncLoadingTasks = async (onlyTaskId?: string) => {
    const targets = messagesRef.current.filter((m) =>
      onlyTaskId ? m.taskId === onlyTaskId : isAudioLoading(m.genneratedStatus),
    );
    if (targets.length === 0) return;
    const seqs = seqRange(targets);
    const sinceSeq = seqs.length > 0 ? Math.min(...seqs) - 1 : lastRowSeq;
    const data = await historyQuery({
      skip: 0,
      take: 50,
      ...(sinceSeq !== undefined && { lastsql: sinceSeq }),
    });
    // request ล้ม — ไม่เดาสถานะ ปล่อย card ไว้ให้ event ปิด
    if (!data) return;

    const byTaskId = new Map(data.map((row) => [row.taskId, row]));
    const knownIds = new Set(messagesRef.current.map((m) => m.taskId));
    const newRows = [...data].reverse().filter((row) => !knownIds.has(row.taskId));
    // ได้เต็ม page อาจมีแถวเก่ากว่าที่ไม่ได้ดึงมา — ไม่ตัดสินว่า fail
    const isComplete = data.length < 50;
    const lostText = "Generation failed";

    setMessages((prev) => {
      const merged = prev.flatMap((m): Message[] => {
        const isTarget = onlyTaskId
          ? m.taskId === onlyTaskId
          : isAudioLoading(m.genneratedStatus);
        if (!isTarget) return [m];
        const row = byTaskId.get(m.taskId);
        if (row) return [{ ...m, ...row }];
        if (onlyTaskId || !isComplete) return [m];
        if (m.taskId.startsWith("temp-") && newRows.length > 0) return [];
        return [{ ...m, genneratedStatus: "FAILED", errorMessage: lostText }];
      });
      return [...merged, ...newRows];
    });
    const rowSeqs = seqRange(data);
    if (rowSeqs.length > 0) {
      setLastRowSeq((prev) => Math.max(prev ?? 0, ...rowSeqs));
    }
    fetchCredit();
  };

  // handler ใน socket effect ผูกครั้งเดียว — เรียกผ่าน ref ให้ได้ state ล่าสุด
  const resyncRef = useRef(resyncLoadingTasks);
  resyncRef.current = resyncLoadingTasks;

  /** ปิด card เป็น FAILED พร้อมเหตุผล — ถ้า card ยังไม่อยู่ใน list จำไว้ใส่ตอนมันเข้ามา */
  const markTaskFailed = (taskId: string, errorText: string) => {
    failedTasksRef.current.set(taskId, errorText);
    setMessages((prev) =>
      prev.map((m) =>
        m.taskId === taskId
          ? { ...m, genneratedStatus: "FAILED", errorMessage: errorText }
          : m,
      ),
    );
  };

  const updateTask = (taskId: string, patch: Partial<Message>) =>
    setMessages((prev) =>
      prev.map((m) => (m.taskId === taskId ? { ...m, ...patch } : m)),
    );

  useEffect(() => {
    if (!socket || activeKey !== "audio") return;

    socket.emit("join-room", {
      projectId,
      type: HISTORY_TYPE,
      message: `Joined room ${projectId}`,
    });

    const handleTaskCreated = () => setSubmitting(false);

    const handleTaskStarted = (data: {
      status: number;
      data: Message;
      oldTaskId: string;
    }) => {
      if (data.status !== 200) {
        setMessages((prev) => prev.filter((m) => m.taskId !== data.oldTaskId));
        return;
      }
      const knownError = failedTasksRef.current.get(data.data.taskId);
      const incoming: Message = knownError
        ? { ...data.data, genneratedStatus: "FAILED", errorMessage: knownError }
        : data.data;
      setMessages((prev) => {
        const index = prev.findIndex(
          (m) => m.taskId === data.oldTaskId || m.taskId === data.data.taskId,
        );
        return index === -1
          ? [...prev, incoming]
          : prev.map((m, i) => (i === index ? { ...m, ...incoming } : m));
      });
    };

    const handleWorkerStarted = (data: { taskId: string }) => {
      updateTask(data.taskId, { genneratedStatus: "PROCESSING" });
      fetchCredit();
    };

    const handleWorkerComplete = (data: {
      taskId: string;
      data?: { audioUrl?: string | null };
    }) => {
      const audioUrl = data.data?.audioUrl;
      updateTask(data.taskId, {
        genneratedStatus: "SUCCESS",
        ...(audioUrl && { imageUrls: [{ imageUrl: audioUrl }] }),
      });
      // event ไม่มี gallery id — ดึง row จริงมาแทนให้ปุ่มดาวน์โหลด/กดดาวใช้ได้
      resyncRef.current(data.taskId).catch((err: unknown) =>
        console.error("Refresh audio task failed:", err),
      );
    };

    // ใช้ทั้ง worker:audio-error (หลังเข้าคิว) และ audio-generate:error (core ปฏิเสธ, taskId = temp id)
    const handleError = (error: { taskId?: string; message?: unknown }) => {
      const errorText =
        typeof error.message === "string" && error.message
          ? error.message
          : "Generation failed";
      notifyError(errorText);
      setSubmitting(false);
      if (error.taskId) markTaskFailed(error.taskId, errorText);
      fetchCredit();
    };

    const handleCreditChange = (res: {
      success: boolean;
      data: { usedCredit: number; totalCredit?: number };
    }) => {
      if (res.success) {
        setUsedCredit({ used: res.data.usedCredit, total: res.data.totalCredit });
      }
    };

    // reconnect ได้ socket id ใหม่และหลุดจากห้อง — join ใหม่ก่อน ไม่งั้น event ของงานถัดไปไม่มาเลย
    const handleReconnect = () => {
      socket.emit("join-room", {
        projectId,
        type: HISTORY_TYPE,
        message: `Joined room ${projectId}`,
      });
      resyncRef.current().catch((err: unknown) =>
        console.error("Resync audio tasks failed:", err),
      );
    };

    socket.on("connect", handleReconnect);
    socket.on("audio-task:created", handleTaskCreated);
    socket.on("task-audio:started", handleTaskStarted);
    socket.on("audio-generate:error", handleError);
    socket.on("worker:audio-error", handleError);
    socket.on("worker:audio-started", handleWorkerStarted);
    socket.on("worker:audio-complete", handleWorkerComplete);
    socket.on("chat:used-credit", handleCreditChange);
    return () => {
      socket.off("connect", handleReconnect);
      socket.off("audio-task:created", handleTaskCreated);
      socket.off("task-audio:started", handleTaskStarted);
      socket.off("audio-generate:error", handleError);
      socket.off("worker:audio-error", handleError);
      socket.off("worker:audio-started", handleWorkerStarted);
      socket.off("worker:audio-complete", handleWorkerComplete);
      socket.off("chat:used-credit", handleCreditChange);
    };
  }, [socket, projectId, activeKey]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    isAtBottomRef.current =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50;
    if (isFetchingRef.current) {
      scrollBottomRef.current = target.scrollHeight - target.scrollTop;
    }
    if (
      target.scrollTop < HISTORY_LOAD_THRESHOLD_PX &&
      hasMore &&
      !loading &&
      !isFirstLoad.current &&
      !isFetchingRef.current
    ) {
      isFetchingRef.current = true;
      setIsFetchingHistory(true);
      scrollBottomRef.current = target.scrollHeight - target.scrollTop;
      fetchOldMessages();
    }
  };

  // layout effect = คืนตำแหน่งก่อน paint ไม่เห็นภาพกระโดด 1 frame
  useLayoutEffect(() => {
    if (isLoadingMoreRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight - scrollBottomRef.current;
      isLoadingMoreRef.current = false;
    }
  }, [messages]);

  // ── uploads ────────────────────────────────────────────────────────────────

  const uploadFile = async (file: RcFile, index: number): Promise<RefImage> => {
    const formData = new FormData();
    formData.append("userId", userId ?? "");
    formData.append("index", index.toString());
    formData.append("projectId", projectId);
    formData.append("generateType", "audio");
    formData.append("uid", file.uid);
    formData.append("file", file);
    formData.append("organizationId", organizationId || "");
    return UploadsServices(axiosWorker).upload(formData);
  };

  const removeUpload = (uid?: string) => {
    if (!uid) return;
    UploadsServices(axiosWorker)
      .remove(uid)
      .catch((err: unknown) => console.error("Remove upload failed:", err));
  };

  const patchReference = (index: number, patch: Partial<AudioReferenceInput>) =>
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, ...patch } : ref)),
    );

  const addReference = () =>
    setReferences((prev) =>
      prev.length >= modelConfig.features.maxReferences
        ? prev
        : [...prev, { mode: "upload", value: "" }],
    );

  const removeReference = (index: number) => {
    removeUpload(references[index]?.uid);
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const setReferenceMode = (index: number, mode: AudioReferenceSlot["mode"]) => {
    removeUpload(references[index]?.uid);
    patchReference(index, { mode, value: "", fileName: undefined, uid: undefined });
  };

  const setReferenceValue = (index: number, value: string) =>
    patchReference(index, { value });

  const uploadReference = async (index: number, file: RcFile) => {
    const duration = await readAudioDuration(file);
    const maxSeconds = modelConfig.features.maxReferenceSeconds;
    if (duration === null) {
      notifyError("Cannot read this audio file. Use MP3, WAV, M4A, AAC or OGG.");
      return;
    }
    if (duration > maxSeconds) {
      notifyError(
        `Reference audio must be ${maxSeconds} seconds or shorter (this one is ${Math.ceil(duration)} s).`,
      );
      return;
    }
    removeUpload(references[index]?.uid);
    patchReference(index, { uploading: true, fileName: file.name });
    try {
      const result = await uploadFile(file, index);
      patchReference(index, {
        uploading: false,
        value: result.imagePath,
        uid: result.uid,
      });
    } catch (error) {
      patchReference(index, { uploading: false, fileName: undefined });
      notifyError(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const uploadRefImage = async (file: RcFile) => {
    const size = await readImageSize(file);
    if (!size) {
      notifyError("Cannot read this image file.");
      return;
    }
    setIsUploadingImage(true);
    try {
      removeUpload(refImage?.uid);
      setRefImage(await uploadFile(file, 0));
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeRefImage = () => {
    removeUpload(refImage?.uid);
    setRefImage(null);
  };

  // ── payload / credit ───────────────────────────────────────────────────────

  const buildCurrentState = (): AudioFormState => ({
    selectedAIModel,
    references,
    refImage,
    format,
    sampleRate,
    speechRate,
    loudnessRate,
    pitchRate,
    enableSubtitle,
    projectId,
    userId: userId ?? "",
    organizationId,
    username: username ?? "",
  });

  useEffect(() => {
    if (!selectedAIModel) {
      setCerrentUsedCredit(0);
      return;
    }
    const payload = modelConfig.buildSubmitPayload(
      form.getFieldsValue(),
      buildCurrentState(),
      `temp-${Date.now()}`,
    );
    generateServices
      .getCreditPreSend(payload)
      .then((credit: number | undefined) => setCerrentUsedCredit(credit ?? 0));
  }, [
    projectId,
    activeKey,
    selectedAIModel,
    references,
    refImage,
    format,
    sampleRate,
    speechRate,
    loudnessRate,
    pitchRate,
    enableSubtitle,
  ]);

  const handleFormSubmit = (values: unknown) => {
    if (!selectedAIModel) return notifyError("Please select an AI model");
    if (references.some((ref) => !ref.value.trim())) {
      return notifyError(
        "Fill or remove empty references — each @AudioN needs a file, URL or speaker ID.",
      );
    }
    if (
      references.some(
        (ref) => ref.mode === "url" && !/^https?:\/\//i.test(ref.value.trim()),
      )
    ) {
      return notifyError("Reference URLs must start with http:// or https://");
    }

    const tempTask = `temp-${Date.now()}`;
    const valuesTyped = values as Record<string, unknown>;
    const socketPayload = modelConfig.buildSubmitPayload(
      valuesTyped,
      buildCurrentState(),
      tempTask,
    );
    const tempMessage: Message = {
      id: tempTask,
      taskId: tempTask,
      projectId,
      userId: userId ?? "",
      prompt: valuesTyped.prompt as string,
      typeGenerate: "audio",
      createdAt: new Date().toISOString(),
      status: false,
      genneratedStatus: "PROCESSING",
      generateConfig: {
        content: valuesTyped.prompt as string,
        modelName: selectedAIModel.name ?? "",
        format,
      },
      users: {
        fullname: username ?? "",
        userId: userId ?? "",
        username: username ?? "",
      },
      referenceImages: refImage ? [refImage.url] : [],
      resolution: "",
      ratio: "",
      imageUrls: [],
      organizationId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    if (!socket || !isConnected) {
      const errorText = "WebSocket is not connected. Please refresh the page.";
      messageApi.error(errorText);
      markTaskFailed(tempTask, errorText);
      return;
    }
    setSubmitting(true);
    socket.emit("generate:audio", socketPayload);
  };

  const onDownloadAudio = (fileName: string, id: string) => {
    try {
      galleryService.downloadFile(id, organizationId || "", fileName);
    } catch {
      messageApi.error("Download failed");
    }
  };

  const onShareAudio = async (taskId: string, id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      const success = await galleryService.updateStatus(id, nextStatus);
      if (!success) return;
      messageApi.success("Share status updated");
      setMessages((prev) =>
        prev.map((m) =>
          m.taskId === taskId
            ? {
                ...m,
                imageUrls: m.imageUrls?.map((item) =>
                  item.id === id ? { ...item, status: nextStatus } : item,
                ),
              }
            : m,
        ),
      );
    } catch {
      messageApi.error("Failed to update status");
    }
  };

  return (
    <Flex
      vertical
      style={{ height: "100%", minHeight: 0, background: getCanvasBg(mode) }}
    >
      {contextHolder}
      {contextHolderNoti}
      <GenerateTwoPaneLayout
        semantic={semantic}
        isMobile={isMobile}
        projectRole={projectRole}
        fallbackDescription="You need USER or ADMIN role to use the audio feature."
        tabKey="audio"
        form={form}
        leftPanel={
          <FormComponent
            form={form}
            features={modelConfig.features}
            references={references}
            addReference={addReference}
            removeReference={removeReference}
            setReferenceMode={setReferenceMode}
            setReferenceValue={setReferenceValue}
            uploadReference={uploadReference}
            refImage={refImage}
            uploadRefImage={uploadRefImage}
            removeRefImage={removeRefImage}
            format={format}
            setFormat={setFormat}
            sampleRate={sampleRate}
            setSampleRate={setSampleRate}
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            loudnessRate={loudnessRate}
            setLoudnessRate={setLoudnessRate}
            pitchRate={pitchRate}
            setPitchRate={setPitchRate}
            enableSubtitle={enableSubtitle}
            setEnableSubtitle={setEnableSubtitle}
            handleSendMessage={handleFormSubmit}
            isLoadingUpload={isLoadingUpload}
            submitting={submitting}
            usedCredit={usedCredit}
            cerrentUsedCredit={cerrentUsedCredit}
            selectedModel={selectedAIModel}
            projectId={projectId}
          />
        }
        loading={loading}
        isFetchingHistory={isFetchingHistory}
        hasMore={hasMore}
        messagesLength={messages.length}
        emptyDescription="Describe the voice, music or sound you want, add optional references, then hit Generate."
        onScroll={handleScroll}
        chatContainerRef={chatContainerRef}
        bottomRef={bottomRef}
        rightContent={
          <>
            <ResultHeader messages={messages} onClear={() => setMessages([])} />
            {messages.map((item, index) => (
              <AudioResultItem
                key={item.id || item.taskId || index}
                message={item}
                semantic={semantic}
                onShareAudio={onShareAudio}
                onDownloadAudio={onDownloadAudio}
              />
            ))}
          </>
        }
      />
    </Flex>
  );
};

export default ChatGenerateAudio;
