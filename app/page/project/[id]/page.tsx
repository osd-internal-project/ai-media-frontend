"use client";
import React, { useEffect, useState, useMemo, type FC } from "react";
import { Button, Tabs, Select, Tooltip, Tag } from "antd";
import { useProjectPermissions, ProjectPermissionGuard } from "../../../hooks/useProjectPermissions";
import PromptGenerateImage from "./components/prompt-generate-image";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
import type { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { useParams } from "next/navigation";
import PromptGenerateVdo from "./components/prompt-generate-vdo";
import { useSession } from "next-auth/react";
import { Image, Video, Folder, Folders, ContactRound } from "lucide-react";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import { TPromptGuideType } from "@/app/common/prompt-guide.type";
import ImageChat from "./components/image-chat";
import PromptOmnihuman from "./components/prompt-omnihuman";
import PromptLibrary from "./components/prompt-library";
import PromptActivity from "./components/prompt-activity";
import VideoChat from "./components/video-chat";
import AIModelServices from "@/app/services/ai-model.service";
import { TAIModel } from "@/app/common/ai-model.type";

const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const promptguideTypeService = PromptGuideTypeServices(axiosCore);
  const projectService = ProjectService(axiosCore);
  const aiModelService = AIModelServices(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<"image" | "vdo" | "omnihuman">(
    "image"
  );
  const [promptGuideOpenStatus, setPromptGuideOpenStatus] =
    useState<boolean>(false);

  const [promptGuideTypes, setPromptGuideTypes] = useState<TPromptGuideType[]>(
    []
  );
  const [aiModels, setAIModels] = useState<TAIModel[]>([]);
  const [selectedAIModel, setSelectedAIModel] = useState<
    (TAIModel & { capabilities?: string[] }) | null
  >(null);
  const { id } = params as { id: string };
  
  // Get project permissions for current user
  const permissions = useProjectPermissions(id);

  useEffect(() => {
    if (loadingData) {
      fecthdata();
      masterdata();
    }
  }, [loadingData]);

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
    const res = await promptguideTypeService.findAll();
    setPromptGuideTypes(res || []);

    const models = await aiModelService.findAll();

    setAIModels(models || []);
  };

  const onChangeTab = (key: "image" | "vdo") => {
    setActiveKey(key);

    if (processedModels.length > 0) {
      const savedModelId = localStorage.getItem(`selectedAIModel_${key}_${id}`);
      let modelToSelect = null;

      if (savedModelId) {
        modelToSelect = processedModels.find(m => 
          m.id === parseInt(savedModelId) && 
          (key === "image" ? m.type === "image" : m.type === "vdo")
        );
      }

      if (!modelToSelect) {
        // Try to find default model first
        modelToSelect = processedModels.find((m) =>
          m.isDefault && (key === "image" ? m.type === "image" : m.type === "vdo")
        );

        // Fallback to first available if no default found
        if (!modelToSelect) {
          modelToSelect = processedModels.find((m) =>
            key === "image" ? m.type === "image" : m.type === "vdo"
          );
        }
      }

      if (modelToSelect) {
        setSelectedAIModel(modelToSelect);
      }
    }
  };

  const processedModels = useMemo(() => {
    const grouped = aiModels.reduce((acc, model) => {
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
    }, {} as Record<string, TAIModel & { capabilities: string[] }>);

    return Object.values(grouped);
  }, [aiModels]);

  useEffect(() => {
    if (processedModels.length > 0 && !selectedAIModel) {
      const savedModelId = localStorage.getItem(`selectedAIModel_${activeKey}_${id}`);
      let modelToSelect = null;

      if (savedModelId) {
        modelToSelect = processedModels.find(m => 
          m.id === parseInt(savedModelId) && 
          (activeKey === "image" ? m.type === "image" : m.type === "vdo")
        );
      }

      if (!modelToSelect) {
        // Try to find default model first
        modelToSelect = processedModels.find((m) =>
          m.isDefault && (activeKey === "image" ? m.type === "image" : m.type === "vdo")
        );

        // Fallback to first available if no default found
        if (!modelToSelect) {
          modelToSelect = processedModels.find((m) =>
            activeKey === "image" ? m.type === "image" : m.type === "vdo"
          );
        }
      }

      if (modelToSelect) {
        setSelectedAIModel(modelToSelect);
      }
    }
  }, [processedModels, activeKey, selectedAIModel, id]);

  const filteredAIModels = processedModels.filter((model) =>
    activeKey === "image" ? model.type === "image" : model.type === "vdo"
  );

  return (
    <div>
      <div>
        <HeaderGenerateImagePage getProject={getProject} />
      </div>
      
      {/* Viewer Role Notification */}
      {permissions.canViewOnly && (
        <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-lg">👀</span>
            <div>
              <div className="font-medium">Read-Only Access</div>
              <div className="text-sm">You have VIEWER permissions for this project. You can browse content but cannot use chat features.</div>
            </div>
          </div>
        </div>
      )}
      
      <Tabs
        className="custom-tabs"
        type="card"
        activeKey={activeKey}
        tabBarExtraContent={
          activeKey === "image" || activeKey === "vdo" ? (
            <div className="flex gap-4 items-center relative">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  AI Model:
                </span>
                <Select
                  size="middle"
                  style={{ 
                    minWidth: 280,
                  }}
                  className="dark-select"
                  placeholder="Choose an AI model"
                  value={selectedAIModel?.id}
                  onChange={(value) => {
                    const model = filteredAIModels.find(m => m.id === value);
                    setSelectedAIModel(model || null);
                    if (model) {
                      localStorage.setItem(`selectedAIModel_${activeKey}_${id}`, model.id.toString());
                    }
                  }}
                  optionLabelProp="label"
                >
                  {filteredAIModels
                    .filter(model => model && model.name)
                    .map(model => (
                      <Select.Option 
                        key={model.id} 
                        value={model.id}
                        label={model.name}
                      >
                        <Tooltip 
                          title={
                            <div className="p-4 max-w-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-white">{model.name}</div>
                                {selectedAIModel?.id === model.id && (
                                  <div className="text-blue-400 text-xs">✓ Selected</div>
                                )}
                              </div>
                              
                              {model.modelDetails?.description && (
                                <div className="text-gray-300 text-sm leading-relaxed mb-3">
                                  {model.modelDetails.description}
                                </div>
                              )}

                              {model.modelDetails?.modelId && (
                                <div className="mb-3">
                                  <div className="text-gray-400 text-xs mb-1">Model ID</div>
                                  <div className="text-gray-200 text-sm font-mono">{model.modelDetails.modelId}</div>
                                </div>
                              )}

                              {model.modelDetails?.pricing && (
                                <div className="mb-3">
                                  <div className="text-gray-400 text-xs mb-1">Pricing</div>
                                  <div className="flex gap-4">
                                    {model.modelDetails.pricing.imageToVideo && (
                                      <div>
                                        <div className="text-gray-300 text-xs">Image-to-video</div>
                                        <div className="text-white font-medium">{model.modelDetails.pricing.imageToVideo} {model.modelDetails.pricing.unit || 'USD/M tokens'}</div>
                                      </div>
                                    )}
                                    {model.modelDetails.pricing.textToVideo && (
                                      <div>
                                        <div className="text-gray-300 text-xs">Text-to-video</div>
                                        <div className="text-white font-medium">{model.modelDetails.pricing.textToVideo} {model.modelDetails.pricing.unit || 'USD/M tokens'}</div>
                                      </div>
                                    )}
                                    {model.modelDetails.pricing.imageToImage && (
                                      <div>
                                        <div className="text-gray-300 text-xs">Image-to-image</div>
                                        <div className="text-white font-medium">{model.modelDetails.pricing.imageToImage} {model.modelDetails.pricing.unit || 'USD/Piece'}</div>
                                      </div>
                                    )}
                                    {model.modelDetails.pricing.textToImage && (
                                      <div>
                                        <div className="text-gray-300 text-xs">Text-to-image</div>
                                        <div className="text-white font-medium">{model.modelDetails.pricing.textToImage} {model.modelDetails.pricing.unit || 'USD/Piece'}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {(model.modelDetails?.limitations?.resolution || 
                                model.modelDetails?.limitations?.duration || 
                                model.modelDetails?.limitations?.frameRate || 
                                model.modelDetails?.limitations?.concurrentTasks || 
                                model.modelDetails?.limitations?.rpm) && (
                                <div className="mb-3">
                                  <div className="text-gray-400 text-xs mb-1">Limitations</div>
                                  <div className="space-y-1">
                                    {model.modelDetails.limitations?.resolution && (
                                      <div className="text-gray-300 text-sm">
                                        <span className="text-gray-400">Resolution:</span> {model.modelDetails.limitations.resolution.join(', ')}
                                      </div>
                                    )}
                                    {model.modelDetails.limitations?.duration && (
                                      <div className="text-gray-300 text-sm">
                                        <span className="text-gray-400">Duration:</span> {model.modelDetails.limitations.duration}
                                      </div>
                                    )}
                                    {model.modelDetails.limitations?.frameRate && (
                                      <div className="text-gray-300 text-sm">
                                        <span className="text-gray-400">Frame rate:</span> {model.modelDetails.limitations.frameRate}
                                      </div>
                                    )}
                                    {model.modelDetails.limitations?.concurrentTasks && (
                                      <div className="text-gray-300 text-sm">
                                        <span className="text-gray-400">Concurrent tasks:</span> {model.modelDetails.limitations.concurrentTasks}
                                      </div>
                                    )}
                                    {model.modelDetails.limitations?.rpm && (
                                      <div className="text-gray-300 text-sm">
                                        <span className="text-gray-400">RPM:</span> {model.modelDetails.limitations.rpm}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {model.modelDetails?.status && (
                                <div className="mb-3">
                                  <div className="text-gray-400 text-xs mb-1">Status</div>
                                  <div className={`inline-block px-2 py-1 text-xs rounded ${
                                    model.modelDetails.status === 'Activated' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
                                  }`}>
                                    {model.modelDetails.status}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1 mt-2">
                                {model.capabilities?.map((capability: string) => (
                                  <span key={capability} className="px-2 py-0.5 bg-gray-700 text-xs text-gray-200 rounded">
                                    {capability.replace('-', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          }
                          placement="right"
                          overlayStyle={{ maxWidth: 'none' }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{model.name}</span>
                            {selectedAIModel?.id === model.id && (
                              <span className="text-blue-400 ml-2">✓</span>
                            )}
                          </div>
                        </Tooltip>
                      </Select.Option>
                    ))}
                </Select>
              </div>
              <Button
                type={promptGuideOpenStatus ? "primary" : "default"}
                ghost={promptGuideOpenStatus}
                onClick={() => setPromptGuideOpenStatus(!promptGuideOpenStatus)}
              >
                Prompt Guild
              </Button>
            </div>
          ) : (
            ""
          )
        }
        onChange={(key) => onChangeTab(key as "image" | "vdo")}
        items={[
          {
            key: "image",
            forceRender: true,
            label: (
              <span className="flex justify-center gap-2">
                <Image />
                <div>{`Image Gen`}</div>
              </span>
            ),
            children: (
              <ImageChat
                promptGuideOpenStatus={promptGuideOpenStatus}
                key={`image`}
                activeKey={activeKey}
                projectId={id}
                userId={session?.user?.id}
                promptGuideTypes={promptGuideTypes}
                username={session?.user?.name || ""}
                selectedAIModel={selectedAIModel}
              />
            ),
          },
          {
            forceRender: true,
            key: "vdo",
            label: (
              <span className="flex justify-center gap-2">
                <Video />
                <div>{`VDO Gen`}</div>
              </span>
            ),
            children: (
              <VideoChat
                key={`vdo`}
                activeKey={activeKey}
                projectId={id}
                userId={session?.user?.id}
                promptGuideTypes={promptGuideTypes}
                promptGuideOpenStatus={promptGuideOpenStatus}
                selectedAIModel={selectedAIModel}
              />
            ),
          },
          // {
          //   forceRender: true,
          //   key: "omnihuman",
          //   label: (
          //     <span className="flex justify-center gap-2">
          //       <ContactRound />
          //       <div>{`Omni human`}</div>
          //     </span>
          //   ),
          //   children: (
          //     <PromptOmnihuman
          //       key={`avatar-${activeKey}`}
          //       projectId={id}
          //       token={session?.user?.id}
          //       isActive={activeKey === "omnihuman"}
          //     />
          //   ),
          // },
          // {
          //   forceRender: true,
          //   key: "omnihuman",
          //   label: (
          //     <span className="flex justify-center gap-2">
          //       <ContactRound />
          //       <div>{`Omni human`}</div>
          //     </span>
          //   ),
          //   children: (
          //     <PromptGenerateAvatar
          //       key={`avatar-${activeKey}`}
          //       projectId={id}
          //       userId={session?.user?.id}
          //     />
          //   ),
          // },
          {
            forceRender: true,
            key: "library",
            label: (
              <span className="flex justify-center gap-2">
                <Folder />
                <div>{`Library`}</div>
              </span>
            ),
            children: (
              <PromptLibrary
                key={`activity-${activeKey}`}
                activeKey={activeKey}
              />
            ),
          },
          {
            forceRender: true,
            key: "activity",
            label: (
              <span className="flex justify-center gap-2">
                <Folders />
                <div>{`All Activity`}</div>
              </span>
            ),
            children: (
              <PromptActivity
                activeKey={activeKey}
                key={`activity-${activeKey}`}
              />
            ),
          },
        ]}
      />
      <style>{`
        .custom-tabs .ant-tabs-nav {
          margin-bottom: 0;
        }
        .custom-tabs .ant-tabs-nav::before {
          border-bottom: none;
        }

        .custom-tabs .ant-tabs-nav-wrap {
          background: #000000;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          padding: 8px 12px;
          display: inline-block;
        }

        .custom-tabs .ant-tabs-tab {
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #9ca3af;
        }

        .custom-tabs .ant-tabs-tab-active {
          background: transparent;
        }

        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ffffff;
        }

        .custom-tabs .ant-tabs-ink-bar {
          background: #6366f1;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }

        .custom-tabs .ant-tabs-tab .anticon {
          margin-right: 8px;
        }

        /* Dark Select Styling */
        .dark-select .ant-select-selector {
          background-color: #27272a !important;
          border: 1px solid #3f3f46 !important;
          color: #d1d5db !important;
        }

        .dark-select .ant-select-selection-item {
          color: #d1d5db !important;
        }

        .dark-select .ant-select-selection-placeholder {
          color: #6b7280 !important;
        }

        .dark-select:hover .ant-select-selector {
          border-color: #52525b !important;
        }

        .dark-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .dark-select .ant-select-arrow {
          color: #9ca3af !important;
        }

      `}</style>
    </div>
  );
};

export default GenerateImagePage;
