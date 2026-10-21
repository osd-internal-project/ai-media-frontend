"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import { Skeleton, Spin, Tabs, Typography } from "antd";
import "./styles/styles.css";
import UserServices from "../../../services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
import { ModelSelectContext } from "./components/tab-layout/model-select-card";
import type { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  PictureOutlined,
  VideoCameraOutlined,
  FolderOpenOutlined,
  StarOutlined,
  MessageOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import ImageFormRenderer from "./components/tabs/image-gen/image-form-renderer";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { AudioLines, Clapperboard, Edit2, Image, Paintbrush, Share2, Workflow } from "lucide-react";
import VideoEditorTab from "./components/tabs/video-editor/video-editor-tab";
import { STRINGS as VIDEO_EDITOR_STRINGS } from "./components/tabs/video-editor/strings";
import { FEATURES } from "@/app/config/features";
import { useOrganization } from "@/app/context/OrganizationContext";
import VideoFormRenderer from "./components/tabs/video-gen/video-form-renderer";
import OmnihumenFormRenderer from "./components/tabs/omni-human/omnihumen-form-renderer";
import DreamactorFormRenderer from "./components/tabs/dream-actor/dreamactor-form-renderer";
import AudioFormRenderer from "./components/tabs/audio-gen/audio-form-renderer";
import PromptLibrary from "./components/tabs/library/prompt-library";
import PromptActivity from "./components/tabs/all-activity/prompt-activity";
import PublicSocial from "./components/tabs/public-social/public-social";

// Only fabric (Editor) and xyflow (Workflow) load on first open. v1.6.0 lazy-loaded all 9 tabs
// and `next build --turbopack` stopped finishing on CI, so the light tabs are static again.
const tabLoading = () => (
  <div className="h-full w-full grid place-items-center">
    <Spin />
  </div>
);
const WorkflowFormRenderer = dynamic(() => import("./components/tabs/workflow/workflow-form-renderer"), { ssr: false, loading: tabLoading });
const EditorSpace = dynamic(() => import("./components/tabs/editor/editor-space"), { ssr: false, loading: tabLoading });

type GenerateTabKey =
  | "image"
  | "video"
  | "omnihumen"
  | "dreamactor"
  | "audio"
  | "workflow"
  | "library"
  | "activity"
  | "editor"
  | "video-editor"
  | "social";

// Resolves saved → default → first available model for a given tab key
function resolveModel(
  aiModels: TMasterModelType[],
  key: GenerateTabKey,
  projectId: string,
): TMasterModelType | undefined {
  const savedId = localStorage.getItem(`selectedAIModel_${key}_${projectId}`);
  if (savedId) {
    const saved = aiModels.find(
      (m) => m.id === parseInt(savedId) && m.type === key,
    );
    if (saved) return saved;
  }
  return (
    aiModels.find((m) => m.isDefault && m.type === key) ??
    aiModels.find((m) => m.type === key)
  );
}

const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const { id } = params as { id: string };

  const { isMobile, isTablet } = useResponsive();
  const { mode } = useThemeMode();

  // Service instances — created once per mount
  const projectService = useMemo(() => ProjectService(axiosCore), []);
  const masterModelTypeServices = useMemo(
    () => MasterModelTypeServices(axiosCore),
    [],
  );
  const userService = useMemo(() => UserServices(axiosUser), []);

  // Memoized semantic tokens — recomputed only when theme changes
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);

  const [getProject, setProject] = useState<IProject>();
  const [, setLoadingData] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<GenerateTabKey>("image");
  const [teamView, setTeamView] = useState<boolean>(true);
  // Loaded once by PrivateLayout; undefined while loading, [] means "no restriction".
  const { accessCodes } = useOrganization();
  const [disableTab, setDisableTab] = useState<boolean>(false);
  const [promptGuideOpenStatus, setPromptGuideOpenStatus] =
    useState<boolean>(false);
  const [aiModels, setAIModels] = useState<TMasterModelType[]>([]);
  const [filteredAIModels, setFilteredAIModels] = useState<TMasterModelType[]>(
    [],
  );
  const [selectedAIModel, setSelectedAIModel] = useState<
    (TMasterModelType & { capabilities?: string[] }) | undefined
  >(undefined);
  const [projectRole, setProjectRole] = useState<string | null>(null);
  // gallery item ที่ผู้ใช้กด "Share to social" จากแท็บ All Activity —
  // เก็บไว้ที่ระดับ page เพราะต้องข้ามแท็บไปเปิด wizard ในแท็บ Public Social
  const [socialPresetGalleryIds, setSocialPresetGalleryIds] = useState<
    string[] | undefined
  >(undefined);

  const onSetPromptTextRef = React.useRef<
    ((id: number) => Promise<void>) | null
  >(null);

  const handleSetPromptText = useCallback(async (promptId: number) => {
    await onSetPromptTextRef.current?.(promptId);
  }, []);

  // Memoized access code checks — only recomputed when accessCode changes
  const normalizedAccessCodes = useMemo(
    () => (accessCodes ?? []).map((c) => c.toLowerCase().trim()),
    [accessCodes],
  );
  const {
    canAccessImage,
    canAccessVideo,
    canAccessOmni,
    canAccessDream,
    canAccessAudio,
    canAccessEditor,
    canAccessVideoEditor,
    canAccessWorkflow,
    canAccessSocial,
  } = useMemo(() => {
    if (accessCodes === undefined) {
      return {
        canAccessImage: false,
        canAccessVideo: false,
        canAccessOmni: false,
        canAccessDream: false,
        canAccessAudio: false,
        canAccessWorkflow: false,
        canAccessEditor: false,
        canAccessVideoEditor: false,
        canAccessSocial: false,
      };
    }
    const has = normalizedAccessCodes.length > 0;
    return {
      canAccessImage:
        !has || normalizedAccessCodes.some((c) => c.includes("image")),
      canAccessVideo:
        !has || normalizedAccessCodes.some((c) => c.includes("video")),
      canAccessOmni:
        !has || normalizedAccessCodes.some((c) => c.includes("omni")),
      canAccessDream:
        !has || normalizedAccessCodes.some((c) => c.includes("dream")),
      canAccessAudio:
        !has || normalizedAccessCodes.some((c) => c.includes("audio")),
      canAccessWorkflow:
        !has || normalizedAccessCodes.some((c) => c.includes("workflow")),
      canAccessEditor:
        !has || normalizedAccessCodes.some((c) => c.includes("editor")),
      // Editing video is part of the video plan; the flag hides it while unfinished.
      canAccessVideoEditor:
        FEATURES.videoEditor &&
        (!has || normalizedAccessCodes.some((c) => c.includes("video"))),
      // Gated by the feature flag on top of the plan's access code, so the Public
      // Social tab and the "share to social" action disappear together.
      canAccessSocial:
        FEATURES.social &&
        (!has || normalizedAccessCodes.some((c) => c.includes("social"))),
    };
  }, [normalizedAccessCodes, accessCodes]);

  // Memoized tab icon colours — only changes with theme
  const tabIconColorByType = useMemo<Record<GenerateTabKey, string>>(
    () => ({
      image: "#1890ff",
      video: semantic.colorPrimary || "#1677ff",
      omnihumen: semantic.colorSuccess || "#52c41a",
      dreamactor: semantic.colorWarning || "#faad14",
      audio: semantic.colorSuccess || "#13c2c2",
      workflow: semantic.colorPrimary || "#7c3aed",
      library: "#1890ff",
      activity: semantic.colorTextSecondary || "#8c8c8c",
      editor: semantic.colorInfo || "#1890ff",
      "video-editor": semantic.colorInfo || "#1890ff",
      social: semantic.colorPrimary || "#6F6ADE",
    }),
    [semantic],
  );

  // ── Data fetching ──────────────────────────────────────────────────────────

  // Fetch project data and all AI models in parallel
  const fetchInitialData = useCallback(async () => {
    const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!projectId) {
      setLoadingData(false);
      return;
    }
    try {
      const [project, models] = await Promise.all([
        projectService.findById(projectId),
        masterModelTypeServices.findAll(),
      ]);
      setProject(project);
      setAIModels(models || []);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [params.id, projectService, masterModelTypeServices]);

  // Project role only — tab access comes from OrganizationContext and does not wait on this.
  const fetchRole = useCallback(async () => {
    if (!session?.user?.id || !id) return;
    try {
      const userDetails = await userService.findDetailByToken(session.user.id);
      const actualUserId = userDetails?.userId || session.user.id;
      const userRole = await projectService.checkUserRole(id, actualUserId);
      setProjectRole(userRole);
    } catch (error) {
      console.error("Failed to fetch project role:", error);
    }
  }, [session?.user?.id, id, userService, projectService]);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRole();
  }, [session?.user?.id, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync filteredAIModels and selectedAIModel whenever aiModels or tab changes
  useEffect(() => {
    if (aiModels.length === 0) return;
    const models = aiModels.filter((m) => m.type === activeKey);
    setFilteredAIModels(models);
    if (!selectedAIModel) {
      const model = resolveModel(aiModels, activeKey, id);
      if (model) setSelectedAIModel(model);
    }
  }, [aiModels, activeKey, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────

  const onChangeTab = useCallback((key: GenerateTabKey) => {
    setActiveKey(key);
    setSelectedAIModel(undefined); // let the effect above pick the right model
  }, []);

  /**
   * เปิดแท็บ Public Social พร้อม preselect สื่อที่กดมาจากแท็บ All Activity
   *
   * @param galleryId gallery item ที่ผู้ใช้กดปุ่ม Share
   */
  const onShareToSocial = useCallback((galleryId: string) => {
    setSocialPresetGalleryIds([galleryId]);
    setActiveKey("social");
  }, []);

  const onAIModelChange = useCallback(
    (value: string) => {
      const model = filteredAIModels.find((m) => m.id === parseInt(value));
      if (model) {
        setSelectedAIModel(model);
        localStorage.setItem(
          `selectedAIModel_${activeKey}_${id}`,
          model.id.toString(),
        );
      }
    },
    [filteredAIModels, activeKey, id],
  );

  const modelSelectValue = useMemo(
    () => ({ selectedAIModel, filteredAIModels, onAIModelChange }),
    [selectedAIModel, filteredAIModels, onAIModelChange],
  );

  const onPromptGuideToggle = useCallback(
    () => setPromptGuideOpenStatus((prev) => !prev),
    [],
  );

  // ── Tab label renderer ─────────────────────────────────────────────────────

  const renderTabLabel = useCallback(
    (key: GenerateTabKey, text: string, icon: React.ReactNode) => {
      const isDarkMode = mode === "dark";
      const isActive = activeKey === key;
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: isMobile ? 6 : 8,
            padding: isMobile ? "4px 8px" : isTablet ? "5px 10px" : "6px 12px",
            borderRadius: 8,
            border:
              isDarkMode && isActive
                ? `1px solid ${semantic.colorBorderSecondary || semantic.colorPrimary}`
                : "1px solid transparent",
            background:
              isDarkMode && isActive ? semantic.colorBgElevated : "transparent",
            color:
              isDarkMode && isActive ? "#ffffff" : semantic.colorTextSecondary,
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              color: isActive
                ? tabIconColorByType[key]
                : semantic.colorTextSecondary,
            }}
          >
            {icon}
          </span>
          <Typography.Text
            style={{
              color:
                isDarkMode && isActive
                  ? "#ffffff"
                  : semantic.colorTextSecondary,
              marginBottom: 0,
              fontSize: isMobile ? 12 : isTablet ? 13 : 14,
            }}
          >
            {text}
          </Typography.Text>
        </div>
      );
    },
    [mode, activeKey, isMobile, isTablet, semantic, tabIconColorByType],
  );

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: semantic.colorBgBase }}
    >
      <HeaderGenerateImagePage
        teamView={teamView}
        setTeamView={setTeamView}
        getProject={getProject}
        activeKey={activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">}
        promptGuideOpenStatus={promptGuideOpenStatus}
        onPromptGuideToggle={onPromptGuideToggle}
        onSetPromptText={handleSetPromptText}
        // keys come from the rendered tab nodes, which are GenerateTabKey values
        onChangeTab={(key) => onChangeTab(key as GenerateTabKey)}
      />

      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {accessCodes === undefined ? (
          <div
            style={{
              display: "flex",
              gap: isMobile ? 6 : isTablet ? 8 : 12,
              paddingInline: isMobile ? 8 : isTablet ? 10 : 14,
              paddingBlock: isMobile ? 8 : 12,
              overflow: "hidden",
              height: "100%",
              background: semantic.colorBgContainer,
              borderTop: `1px solid ${semantic.colorBorder}`,
            }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton.Button key={i} active size="small" />
            ))}
          </div>
        ) : (
        <ModelSelectContext.Provider value={modelSelectValue}>
        <Tabs
          tabPosition="top"
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
            background: semantic.colorBgContainer,
            borderTop: `1px solid ${semantic.colorBorder}`,
            minHeight: 0,
            overflow: "hidden",
          }}
          className="ant-tabs-full generate-tabs"
          activeKey={activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">}
          size={isMobile ? "small" : "large"}
          tabBarGutter={isMobile ? 6 : isTablet ? 8 : 12}
          tabBarStyle={{
            margin: 0,
            paddingInline: isMobile ? 8 : isTablet ? 10 : 14,
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            scrollbarWidth: "thin",
            scrollBehavior: "smooth",
          }}
          onChange={(key) => onChangeTab(key as GenerateTabKey)}
          items={[
            ...(canAccessImage
              ? [
                  {
                    disabled: disableTab,
                    key: "image",
                    label: renderTabLabel(
                      "image",
                      "Image Gen",
                      <PictureOutlined />,
                    ),
                    children: (
                      <ImageFormRenderer
                        teamView={teamView}
                        promptGuideOpenStatus={promptGuideOpenStatus}
                        activeKey={
                          activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">
                        }
                        projectId={id}
                        userId={session?.user?.id}
                        projectRole={projectRole}
                        username={session?.user?.name || ""}
                        selectedAIModel={selectedAIModel}
                        setDisableTab={setDisableTab}
                        onSetPromptTextRef={onSetPromptTextRef}
                      />
                    ),
                  },
                ]
              : []),
            ...(canAccessVideo
              ? [
                  {
                    disabled: disableTab,
                    key: "video",
                    label: renderTabLabel(
                      "video",
                      "Video Gen",
                      <VideoCameraOutlined />,
                    ),
                    children: (
                      <VideoFormRenderer
                        teamView={teamView}
                        activeKey={
                          activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">
                        }
                        projectId={id}
                        userId={session?.user?.id}
                        projectRole={projectRole}
                        promptGuideOpenStatus={promptGuideOpenStatus}
                        selectedAIModel={selectedAIModel}
                        username={session?.user?.name || ""}
                        setDisableTab={setDisableTab}
                        onSetPromptTextRef={onSetPromptTextRef}
                      />
                    ),
                  },
                ]
              : []),
            ...(canAccessOmni
              ? [
                  {
                    disabled: disableTab,
                    key: "omnihumen",
                    label: renderTabLabel(
                      "omnihumen",
                      "OmniHuman",
                      <MessageOutlined />,
                    ),
                    children: (
                      <OmnihumenFormRenderer
                        teamView={teamView}
                        activeKey={
                          activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">
                        }
                        projectId={id}
                        userId={session?.user?.id}
                        projectRole={projectRole}
                        promptGuideOpenStatus={promptGuideOpenStatus}
                        selectedAIModel={selectedAIModel}
                        username={session?.user?.name || ""}
                        setDisableTab={setDisableTab}
                        onSetPromptTextRef={onSetPromptTextRef}
                      />
                    ),
                  },
                ]
              : []),
            ...(canAccessDream
              ? [
                  {
                    disabled: disableTab,
                    key: "dreamactor",
                    label: renderTabLabel(
                      "dreamactor",
                      "DreamActor",
                      <PlaySquareOutlined />,
                    ),
                    children: (
                      <DreamactorFormRenderer
                        teamView={teamView}
                        activeKey={
                          activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">
                        }
                        projectId={id}
                        userId={session?.user?.id}
                        projectRole={projectRole}
                        promptGuideOpenStatus={promptGuideOpenStatus}
                        selectedAIModel={selectedAIModel}
                        username={session?.user?.name || ""}
                        setDisableTab={setDisableTab}
                        onSetPromptTextRef={onSetPromptTextRef}
                      />
                    ),
                  },
                ]
              : []),
            ...(canAccessAudio
              ? [
                  {
                    disabled: disableTab,
                    key: "audio",
                    label: renderTabLabel(
                      "audio",
                      "Audio Gen",
                      <AudioLines size={16} />,
                    ),
                    children: (
                      <AudioFormRenderer
                        teamView={teamView}
                        activeKey={activeKey}
                        projectId={id}
                        userId={session?.user?.id}
                        projectRole={projectRole}
                        selectedAIModel={selectedAIModel}
                        username={session?.user?.name || ""}
                        setDisableTab={setDisableTab}
                      />
                    ),
                  },
                ]
              : []),
            ...(canAccessWorkflow
              ? [
                  {
                    disabled: disableTab,
                    key: "workflow",
                    label: renderTabLabel(
                      "workflow",
                      "Workflow",
                      <Workflow size={16} />,
                    ),
                    children: (
                      <WorkflowFormRenderer
                        activeKey={
                          activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">
                        }
                        projectId={id}
                      />
                    ),
                  },
                ]
              : []),

            {
              disabled: disableTab,
              key: "library",
              destroyOnHidden: true,
              label: renderTabLabel("library", "Library", <StarOutlined />),
              children: (
                <div className="h-full">
                  <PromptLibrary
                    activeKey={activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">}
                  />
                </div>
              ),
            },
            {
              disabled: disableTab,
              key: "activity",
              destroyOnHidden: true,
              label: renderTabLabel(
                "activity",
                "All Activity",
                <FolderOpenOutlined />,
              ),
              children: (
                <PromptActivity
                  activeKey={activeKey as Exclude<GenerateTabKey, "workflow" | "social" | "video-editor">}
                  onShareToSocial={canAccessSocial ? onShareToSocial : undefined}
                />
              ),
            },
            ...(canAccessEditor
              ? [
                  {
                    disabled: disableTab,
                    key: "editor",
                    label: renderTabLabel(
                      "editor",
                      "Editor",
                      <Paintbrush size={16} />,
                    ),
                    children: (
                      <div className="h-full w-full">
                        <EditorSpace />
                      </div>
                    ),
                  },
                ]
              : []),
            ...(canAccessVideoEditor
              ? [
                  {
                    disabled: disableTab,
                    key: "video-editor",
                    label: renderTabLabel(
                      "video-editor",
                      VIDEO_EDITOR_STRINGS.tabLabel,
                      <Clapperboard size={16} />,
                    ),
                    children: (
                      <div className="h-full w-full">
                        <VideoEditorTab projectId={id} />
                      </div>
                    ),
                  },
                ]
              : []),
            ...(canAccessSocial
              ? [
                  {
                    disabled: disableTab,
                    key: "social",
                    destroyOnHidden: true,
                    label: renderTabLabel(
                      "social",
                      "Public Social",
                      <Share2 size={16} />,
                    ),
                    children: (
                      <PublicSocial
                        activeKey={activeKey}
                        presetGalleryIds={socialPresetGalleryIds}
                        onPresetConsumed={() =>
                          setSocialPresetGalleryIds(undefined)
                        }
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
        </ModelSelectContext.Provider>
        )}
      </div>
    </div>
  );
};

export default GenerateImagePage;
