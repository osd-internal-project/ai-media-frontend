"use client";
import React, { useEffect, useState, useMemo, type FC } from "react";
import { Tabs, Drawer, Space, Tag, Typography } from "antd";
import "./styles/styles.css";
import UserServices from "../../../services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
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
  BulbOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import { TPromptGuideType } from "@/app/common/prompt-guide.type";
import PromptLibrary from "./components/tabs/library/prompt-library";
import PromptActivity from "./components/tabs/all-activity/prompt-activity";
import AIModelServices from "@/app/services/ai-model.service";
import { TAIModel } from "@/app/common/ai-model.type";
import ChatGenerateImage from "./components/tabs/image-gen/chat-generate-image";
import ChatGenerateVideo from "./components/tabs/video-gen/chat-generate-video";
import ChatGenerateOmnihumen from "./components/tabs/omni-human/chat-generate-omnihumen";
import ChatGenerateDreamactor from "./components/tabs/dream-actor/chat-generate-dreamactor";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";

type GenerateTabKey =
  | "image"
  | "video"
  | "omnihumen"
  | "dreamactor"
  | "library"
  | "activity";

const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  // const hiddenTabs = ["omnihumen", "dreamactor"];
  // const promptguideTypeService = PromptGuideTypeServices(axiosCore);
  const projectService = ProjectService(axiosCore);
  const aiModelService = AIModelServices(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<
    GenerateTabKey
  >("image");
  const [disableTab, setDisableTab] = useState<boolean>(false);
  const [promptGuideOpenStatus, setPromptGuideOpenStatus] =
    useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { isMobile } = useResponsive();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  const [aiModels, setAIModels] = useState<TAIModel[]>([]);
  const [selectedAIModel, setSelectedAIModel] = useState<
    (TAIModel & { capabilities?: string[] }) | undefined
  >(undefined);
  const { id } = params as { id: string };
  const organizationId = session?.user?.organizationId;
  const [projectRole, setProjectRole] = useState<string | null>(null);

  const onSetPromptTextRef = React.useRef<
    ((id: number) => Promise<void>) | null
  >(null);

  const handleSetPromptText = async (id: number) => {
    if (onSetPromptTextRef.current) {
      await onSetPromptTextRef.current(id);
    }
  };

  useEffect(() => {
    const fetchProjectRole = async () => {
      if (session?.user?.id && id) {
        try {
          const userService = UserServices(axiosUser);
          const userDetails = await userService.findDetailByToken(
            session.user.id,
          );
          const actualUserId = userDetails?.userId || session.user.id;

          const userRole = await projectService.checkUserRole(id, actualUserId);
          setProjectRole(userRole);
        } catch (error) {
          console.error("Failed to fetch project role:", error);
        }
      }
    };

    fetchProjectRole();
  }, [session?.user?.id, id]);

  useEffect(() => {
    if (loadingData) {
      fecthdata();
      masterdata();
    }
  }, [loadingData]);

  useEffect(() => {
    if (organizationId) {
      masterdata();
    }
  }, [organizationId]);

  const fecthdata = async () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) {
      setLoadingData(false);
      return;
    }
    try {
      const response = await projectService.findById(id);
      setProject(response);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const masterdata = async () => {
    const models = await aiModelService.findAll();
    setAIModels(models || []);
  };

  const onChangeTab = (
    key:
      | "image"
      | "video"
      | "omnihumen"
      | "dreamactor"
      | "library"
      | "activity",
  ) => {
    setActiveKey(key);

    if (processedModels.length > 0) {
      const savedModelId = localStorage.getItem(`selectedAIModel_${key}_${id}`);
      let modelToSelect = null;

      if (savedModelId) {
        modelToSelect = processedModels.find(
          (m) =>
            m.id === parseInt(savedModelId) &&
            (key === "image"
              ? m.type === "image"
              : key === "video"
                ? m.type === "video"
                : key === "omnihumen"
                  ? m.type === "omnihumen"
                  : m.type === "dreamactor"),
        );
      }

      if (!modelToSelect) {
        // Try to find default model first
        modelToSelect = processedModels.find(
          (m) =>
            m.isDefault &&
            (key === "image"
              ? m.type === "image"
              : key === "video"
                ? m.type === "video"
                : key === "omnihumen"
                  ? m.type === "omnihumen"
                  : m.type === "dreamactor"),
        );

        // Fallback to first available if no default found
        if (!modelToSelect) {
          modelToSelect = processedModels.find((m) =>
            key === "image"
              ? m.type === "image"
              : key === "video"
                ? m.type === "video"
                : key === "omnihumen"
                  ? m.type === "omnihumen"
                  : m.type === "dreamactor",
          );
        }
      }

      if (modelToSelect) {
        setSelectedAIModel(modelToSelect);
      }
    }
  };

  const processedModels = useMemo(() => {
    const grouped = aiModels.reduce(
      (acc, model) => {
        const key = `${model.name}-${model.type}`;

        if (!acc[key]) {
          acc[key] = {
            ...model,
            capabilities: [model.mode],
          };
        } else {
          acc[key].capabilities.push(model.mode);
        }

        return acc;
      },
      {} as Record<string, TAIModel & { capabilities: string[] }>,
    );
    return Object.values(grouped);
  }, [aiModels]);

  useEffect(() => {
    if (processedModels.length > 0 && !selectedAIModel) {
      const savedModelId = localStorage.getItem(
        `selectedAIModel_${activeKey}_${id}`,
      );
      let modelToSelect = null;

      if (savedModelId) {
        modelToSelect = processedModels.find(
          (m) => m.id === parseInt(savedModelId) && activeKey === m.type,
        );
      }

      if (!modelToSelect) {
        // Try to find default model first
        modelToSelect = processedModels.find(
          (m) => m.isDefault && activeKey === m.type,
        );

        // Fallback to first available if no default found
        if (!modelToSelect) {
          modelToSelect = processedModels.find((m) => m.type === activeKey);
        }
      }

      if (modelToSelect) {
        setSelectedAIModel(modelToSelect);
      }
    }
  }, [processedModels, activeKey, selectedAIModel, id]);

  const filteredAIModels = processedModels.filter(
    (model) => activeKey === model.type,
  );

  const tabIconColorByType: Record<GenerateTabKey, string> = {
    image: "#1890ff",
    video: semantic.colorPrimary || "#1677ff",
    omnihumen: semantic.colorSuccess || "#52c41a",
    dreamactor: semantic.colorWarning || "#faad14",
    library: "#1890ff",
    activity: semantic.colorTextSecondary || "#8c8c8c",
  };

  const renderTabLabel = (
    key: GenerateTabKey,
    text: string,
    icon: React.ReactNode,
  ) => {
    const isDarkMode = mode === "dark";
    const isActive = activeKey === key;

    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "5px 9px" : "6px 12px",
          borderRadius: 8,
          border:
            isDarkMode && isActive
              ? `1px solid ${semantic.colorBorderSecondary || semantic.colorPrimary}`
              : "1px solid transparent",
          background: isDarkMode && isActive ? semantic.colorBgElevated : "transparent",
          color:
            isDarkMode && isActive
              ? "#ffffff"
              : semantic.colorTextSecondary,
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
          }}
        >
          {text}
        </Typography.Text>
      </div>
    );
  };

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-hidden"
      style={{
        backgroundColor: semantic.colorBgBase,
      }}
    >
        <HeaderGenerateImagePage
          getProject={getProject}
          activeKey={activeKey}
          selectedAIModel={selectedAIModel}
          filteredAIModels={filteredAIModels}
          onAIModelChange={(value) => {
            const model = filteredAIModels.find(
              (m) => m.id === parseInt(value),
            );
            setSelectedAIModel(model);
            if (model) {
              localStorage.setItem(
                `selectedAIModel_${activeKey}_${id}`,
                model.id.toString(),
              );
            }
          }}
          promptGuideOpenStatus={promptGuideOpenStatus}
          onPromptGuideToggle={() =>
            setPromptGuideOpenStatus(!promptGuideOpenStatus)
          }
          onSetPromptText={handleSetPromptText}
        />


     

 

      <div className="flex-1 min-h-0 w-full overflow-hidden">
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
          activeKey={activeKey}
          size={isMobile ? "small" : "large"}
         
          onChange={(key) =>
            onChangeTab(key as "image" | "video" | "library" | "activity")
          }
          items={[
            {
              disabled: disableTab,
              key: "image",
              forceRender: true,
              label: renderTabLabel("image", "Image Gen", <PictureOutlined />),
              children: (
                <ChatGenerateImage
                  promptGuideOpenStatus={promptGuideOpenStatus}
                  key={`image`}
                  activeKey={activeKey}
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
            {
              disabled: disableTab,
              forceRender: true,
              key: "video",
              label: renderTabLabel("video", "Video Gen", <VideoCameraOutlined />),
              children: (
                <ChatGenerateVideo
                  key={"video"}
                  activeKey={activeKey}
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
            {
              disabled: disableTab,
              forceRender: true,
              key: "omnihumen",
              label: renderTabLabel("omnihumen", "OmniHuman", <MessageOutlined />),
              children: (
                <ChatGenerateOmnihumen
                  key={"omnihumen"}
                  activeKey={activeKey}
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
            {
              disabled: disableTab,
              forceRender: true,
              key: "dreamactor",
              label: renderTabLabel(
                "dreamactor",
                "DreamActor",
                <PlaySquareOutlined />,
              ),
              children: (
                <ChatGenerateDreamactor
                  key={"dreamactor"}
                  activeKey={activeKey}
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
     
            {
              disabled: disableTab,
              forceRender: true,
              key: "library",
              label: renderTabLabel("library", "Library", <StarOutlined />),
              children: (
                <div className="h-full">
                  <PromptLibrary
                    key={`activity-${activeKey}`}
                    activeKey={activeKey}
                  />
                </div>
              ),
            },
            {
              disabled: disableTab,
              forceRender: true,
              key: "activity",
              label: renderTabLabel(
                "activity",
                "All Activity",
                <FolderOpenOutlined />,
              ),
              children: (
                <div className="h-full">
                  <PromptActivity
                    activeKey={activeKey}
                    key={`activity-${activeKey}`}
                  />
                </div>
              ),
            },
          ]
          // .filter((item) => !hiddenTabs.includes(item.key))
        }
        />
      </div>
    </div>
  );
};

export default GenerateImagePage;
