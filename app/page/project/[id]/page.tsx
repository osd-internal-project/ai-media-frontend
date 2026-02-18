"use client";
import React, { useEffect, useState, useMemo, type FC } from "react";
import { Tabs, Drawer } from "antd";
import "./styles.css";
import UserServices from "../../../services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
import type { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Image,
  Video,
  Folders,
  Star,
  LightbulbIcon,
  Speech,
  Clapperboard,
} from "lucide-react";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import { TPromptGuideType } from "@/app/common/prompt-guide.type";
import PromptLibrary from "./components/prompt-library";
import PromptActivity from "./components/prompt-activity";
import AIModelServices from "@/app/services/ai-model.service";
import { TAIModel } from "@/app/common/ai-model.type";
import ChatGenerateImage from "./components/chat-generate-image";
import ChatGenerateVideo from "./components/chat-generate-video";
import ChatGenerateOmnihumen from "./components/chat-generate-omnihumen";
import ChatGenerateDreamactor from "./components/chat-generate-dreamactor";

const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  // const promptguideTypeService = PromptGuideTypeServices(axiosCore);
  const projectService = ProjectService(axiosCore);
  const aiModelService = AIModelServices(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<
    "image" | "video" | "omnihumen" | "dreamactor" | "library" | "activity"
  >("image");
  const [disableTab, setDisableTab] = useState<boolean>(false);
  const [promptGuideOpenStatus, setPromptGuideOpenStatus] =
    useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);

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
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
  return (
    <div
      className="h-full flex flex-col"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <div className="flex-shrink-0">
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
      </div>

      {/* Viewer Role Notification */}
      {/* {projectRole === "VIEWER" && (
        <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-lg">👀</span>
            <div>
              <div className="font-medium">Read-Only Access</div>
              <div className="text-sm">
                You have VIEWER permissions for this project. You can browse
                content but cannot use chat features.
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Prompt Guide Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <LightbulbIcon className="w-5 h-5" />
            <span>Prompt Guide</span>
          </div>
        }
        closable={{ "aria-label": "Close Button" }}
        onClose={() => setOpen(false)}
        open={open}
        width={600}
      >
        <div className="space-y-6">
          {/* Introduction */}
          <p className="text-gray-300 leading-relaxed">
            {`This article introduces prompt usage tips for Seedream 4.0's
            text-to-image generation, image editing, reference-based generation
            and multi-image creation, helping you quickly get started with video
            creation and turn ideas into image creations.`}
          </p>

          {/* General Guidelines Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">General Guidelines</h2>
            <p className="text-gray-300 leading-relaxed">
              {`Seedream 4.0 supports a wide range of tasks such as text-to-image
              generation, image editing, reference-based generation and
              multi-image creation. For optimal image creation results, consider
              the following best practices when crafting prompts:`}
            </p>
          </div>

          {/* Guidelines List */}
          <div className="space-y-6">
            {/* Guideline 1 */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                1. Clearly describe the scene using natural language
              </h3>
              <p className="text-gray-300 mb-3">
                Use coherent natural language to describe the subject + action +
                environment. If aesthetics matter, include descriptors of style,
                color, lighting, or composition.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-gray-300">
                  <span className="text-green-400">• Recommended:</span> A girl
                  in a lavish dress walking under a parasol along a tree-lined
                  path, in the style of a Monet oil painting.
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• Avoid:</span> Girl, umbrella,
                  tree-lined street, oil painting texture.
                </li>
              </ul>
            </div>

            {/* Guideline 2 */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                2. Specify application scenario
              </h3>
              <p className="text-gray-300 mb-3">
                If you have a specific use case, explicitly state the image
                purpose and type in your prompt.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-gray-300">
                  <span className="text-green-400">• Recommended:</span>{" "}
                  {`Design
                  a logo for a gaming company. The logo features a dog playing
                  with a game controller. The company name "PITBULL" is written
                  on it.`}
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• Avoid:</span>{" "}
                  {`An abstract
                  image of a dog holding a controller, and the word PITBULL on
                  it.`}
                </li>
              </ul>
            </div>

            {/* Guideline 3 */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                3. Enhance stylistic rendering
              </h3>
              <p className="text-gray-300">
                If a particular style is needed, use precise style keywords or
                reference images to achieve better results.
              </p>
            </div>

            {/* Guideline 4 */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                4. Improve text rendering accuracy
              </h3>
              <p className="text-gray-300 mb-3">
                Use double quotation marks for the text that needs to appear in
                the generated image.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-gray-300">
                  <span className="text-green-400">• Recommended:</span>
                  {`
                  Generate a poster with the title "Seedream 4.0".`}
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• Avoid:</span>
                  {` Generate a
                  poster titled Seedream 4.0.`}
                </li>
              </ul>
            </div>

            {/* Guideline 5 */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                5. Clearly define image editing goals and fixed elements
              </h3>
              <p className="text-gray-300 mb-3">
                Use concise, unambiguous instructions for modifications. Avoid
                vague pronouns. If other elements should remain unchanged,
                specify that explicitly.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-gray-300">
                  <span className="text-green-400">• Recommended:</span> Dress
                  the tallest panda in pink Peking Opera costume and headgear,
                  keeping its pose unchanged.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Drawer>

      <div className="flex-1 min-h-0">
        <Tabs
          tabPosition={isMobile ? "top" : "left"}
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
          }}
          className="custom-tabs"
          activeKey={activeKey}
          size={isMobile ? "small" : "large"}
          // tabBarExtraContent={
          //   activeKey === "image" || activeKey === "video" ? (
          //     <div className="flex gap-4 items-center relative">
          //       <div className="flex items-center gap-3">
          //         <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          //           AI Model:
          //         </span>
          //         <Select
          //           size="middle"
          //           style={{
          //             minWidth: 280,
          //           }}
          //           className="dark-select"
          //           placeholder="Choose an AI model"
          //           value={selectedAIModel?.id}
          //           onChange={(value) => {
          //             const model = filteredAIModels.find((m) => m.id === value);
          //             setSelectedAIModel(model || null);
          //             if (model) {
          //               localStorage.setItem(
          //                 `selectedAIModel_${activeKey}_${id}`,
          //                 model.id.toString()
          //               );
          //             }
          //           }}
          //           optionLabelProp="label"
          //         >
          //           {filteredAIModels
          //             .filter((model) => model && model.name)
          //             .map((model) => (
          //               <Select.Option
          //                 key={model.id}
          //                 value={model.id}
          //                 label={model.name}
          //               >
          //                 <Tooltip
          //                   title={
          //                     <div className="p-4 max-w-sm">
          //                       <div className="flex items-center justify-between mb-2">
          //                         <div className="font-medium text-white">
          //                           {model.name}
          //                         </div>
          //                         {selectedAIModel?.id === model.id && (
          //                           <div className="text-blue-400 text-xs">
          //                             ✓ Selected
          //                           </div>
          //                         )}
          //                       </div>

          //                       {model.modelDetails?.description && (
          //                         <div className="text-gray-300 text-sm leading-relaxed mb-3">
          //                           {model.modelDetails.description}
          //                         </div>
          //                       )}

          //                       {model.modelDetails?.modelId && (
          //                         <div className="mb-3">
          //                           <div className="text-gray-400 text-xs mb-1">
          //                             Model ID
          //                           </div>
          //                           <div className="text-gray-200 text-sm font-mono">
          //                             {model.modelDetails.modelId}
          //                           </div>
          //                         </div>
          //                       )}

          //                       {model.modelDetails?.pricing && (
          //                         <div className="mb-3">
          //                           <div className="text-gray-400 text-xs mb-1">
          //                             Pricing
          //                           </div>
          //                           <div className="flex gap-4">
          //                             {model.modelDetails.pricing
          //                               .imageToVideo && (
          //                               <div>
          //                                 <div className="text-gray-300 text-xs">
          //                                   Image-to-video
          //                                 </div>
          //                                 <div className="text-white font-medium">
          //                                   {
          //                                     model.modelDetails.pricing
          //                                       .imageToVideo
          //                                   }{" "}
          //                                   {model.modelDetails.pricing.unit ||
          //                                     "USD/M tokens"}
          //                                 </div>
          //                               </div>
          //                             )}
          //                             {model.modelDetails.pricing.textToVideo && (
          //                               <div>
          //                                 <div className="text-gray-300 text-xs">
          //                                   Text-to-video
          //                                 </div>
          //                                 <div className="text-white font-medium">
          //                                   {
          //                                     model.modelDetails.pricing
          //                                       .textToVideo
          //                                   }{" "}
          //                                   {model.modelDetails.pricing.unit ||
          //                                     "USD/M tokens"}
          //                                 </div>
          //                               </div>
          //                             )}
          //                             {model.modelDetails.pricing
          //                               .imageToImage && (
          //                               <div>
          //                                 <div className="text-gray-300 text-xs">
          //                                   Image-to-image
          //                                 </div>
          //                                 <div className="text-white font-medium">
          //                                   {
          //                                     model.modelDetails.pricing
          //                                       .imageToImage
          //                                   }{" "}
          //                                   {model.modelDetails.pricing.unit ||
          //                                     "USD/Piece"}
          //                                 </div>
          //                               </div>
          //                             )}
          //                             {model.modelDetails.pricing.textToImage && (
          //                               <div>
          //                                 <div className="text-gray-300 text-xs">
          //                                   Text-to-image
          //                                 </div>
          //                                 <div className="text-white font-medium">
          //                                   {
          //                                     model.modelDetails.pricing
          //                                       .textToImage
          //                                   }{" "}
          //                                   {model.modelDetails.pricing.unit ||
          //                                     "USD/Piece"}
          //                                 </div>
          //                               </div>
          //                             )}
          //                           </div>
          //                         </div>
          //                       )}

          //                       {(model.modelDetails?.limitations?.resolution ||
          //                         model.modelDetails?.limitations?.duration ||
          //                         model.modelDetails?.limitations?.frameRate ||
          //                         model.modelDetails?.limitations
          //                           ?.concurrentTasks ||
          //                         model.modelDetails?.limitations?.rpm) && (
          //                         <div className="mb-3">
          //                           <div className="text-gray-400 text-xs mb-1">
          //                             Limitations
          //                           </div>
          //                           <div className="space-y-1">
          //                             {model.modelDetails.limitations
          //                               ?.resolution && (
          //                               <div className="text-gray-300 text-sm">
          //                                 <span className="text-gray-400">
          //                                   Resolution:
          //                                 </span>{" "}
          //                                 {model.modelDetails.limitations.resolution.join(
          //                                   ", "
          //                                 )}
          //                               </div>
          //                             )}
          //                             {model.modelDetails.limitations
          //                               ?.duration && (
          //                               <div className="text-gray-300 text-sm">
          //                                 <span className="text-gray-400">
          //                                   Duration:
          //                                 </span>{" "}
          //                                 {
          //                                   model.modelDetails.limitations
          //                                     .duration
          //                                 }
          //                               </div>
          //                             )}
          //                             {model.modelDetails.limitations
          //                               ?.frameRate && (
          //                               <div className="text-gray-300 text-sm">
          //                                 <span className="text-gray-400">
          //                                   Frame rate:
          //                                 </span>{" "}
          //                                 {
          //                                   model.modelDetails.limitations
          //                                     .frameRate
          //                                 }
          //                               </div>
          //                             )}
          //                             {model.modelDetails.limitations
          //                               ?.concurrentTasks && (
          //                               <div className="text-gray-300 text-sm">
          //                                 <span className="text-gray-400">
          //                                   Concurrent tasks:
          //                                 </span>{" "}
          //                                 {
          //                                   model.modelDetails.limitations
          //                                     .concurrentTasks
          //                                 }
          //                               </div>
          //                             )}
          //                             {model.modelDetails.limitations?.rpm && (
          //                               <div className="text-gray-300 text-sm">
          //                                 <span className="text-gray-400">
          //                                   RPM:
          //                                 </span>{" "}
          //                                 {model.modelDetails.limitations.rpm}
          //                               </div>
          //                             )}
          //                           </div>
          //                         </div>
          //                       )}

          //                       {model.modelDetails?.status && (
          //                         <div className="mb-3">
          //                           <div className="text-gray-400 text-xs mb-1">
          //                             Status
          //                           </div>
          //                           <div
          //                             className={`inline-block px-2 py-1 text-xs rounded ${
          //                               model.modelDetails.status === "Activated"
          //                                 ? "bg-green-600 text-white"
          //                                 : "bg-gray-600 text-gray-200"
          //                             }`}
          //                           >
          //                             {model.modelDetails.status}
          //                           </div>
          //                         </div>
          //                       )}

          //                       <div className="flex flex-wrap gap-1 mt-2">
          //                         {model.capabilities?.map(
          //                           (capability: string) => (
          //                             <span
          //                               key={capability}
          //                               className="px-2 py-0.5 bg-gray-700 text-xs text-gray-200 rounded"
          //                             >
          //                               {capability.replace("-", " ")}
          //                             </span>
          //                           )
          //                         )}
          //                       </div>
          //                     </div>
          //                   }
          //                   placement="right"
          //                   overlayStyle={{ maxWidth: "none" }}
          //                 >
          //                   <div className="flex items-center justify-between">
          //                     <span>{model.name}</span>
          //                     {selectedAIModel?.id === model.id && (
          //                       <span className="text-blue-400 ml-2">✓</span>
          //                     )}
          //                   </div>
          //                 </Tooltip>
          //               </Select.Option>
          //             ))}
          //         </Select>
          //       </div>
          //       <Button
          //         type={promptGuideOpenStatus ? "primary" : "default"}
          //         ghost={promptGuideOpenStatus}
          //         onClick={() => setPromptGuideOpenStatus(!promptGuideOpenStatus)}
          //       >
          //         Prompt Guild
          //       </Button>
          //     </div>
          //   ) : (
          //     ""
          //   )
          // }
          onChange={(key) =>
            onChangeTab(key as "image" | "video" | "library" | "activity")
          }
          items={[
            {
              disabled: disableTab,
              key: "image",
              forceRender: true,
              label: (
                <div className="flex items-center gap-2 px-2 py-1 w-full">
                  <Image size={20} />
                  <span className="text-base font-medium">Image Gen</span>
                </div>
              ),
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
              label: (
                <div className="flex items-center gap-2 px-2 py-1 w-full">
                  <Video size={20} />
                  <span className="text-base font-medium">Video Gen</span>
                </div>
              ),
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
            //Dream Actor and Omnihumen Tabs
            // {
            //   disabled: disableTab,
            //   forceRender: true,
            //   key: "omnihumen",
            //   label: (
            //     <div className="flex items-center gap-2 px-2 py-1 w-full">
            //       <Speech size={20} />
            //       <span className="text-base font-medium">Omnihumen</span>
            //     </div>
            //   ),
            //   children: (
            //     <ChatGenerateOmnihumen
            //       key={"omnihumen"}
            //       activeKey={activeKey}
            //       projectId={id}
            //       userId={session?.user?.id}
            //       projectRole={projectRole}
            //       promptGuideOpenStatus={promptGuideOpenStatus}
            //       selectedAIModel={selectedAIModel}
            //       username={session?.user?.name || ""}
            //       setDisableTab={setDisableTab}
            //       onSetPromptTextRef={onSetPromptTextRef}
            //     />
            //   ),
            // },
            // {
            //   disabled: disableTab,
            //   forceRender: true,
            //   key: "dreamactor",
            //   label: (
            //     <div className="flex items-center gap-2 px-2 py-1 w-full">
            //       <Clapperboard size={20} />
            //       <span className="text-base font-medium">Dream Actor</span>
            //     </div>
            //   ),
            //   children: (
            //     <ChatGenerateDreamactor
            //       key={"dreamactor"}
            //       activeKey={activeKey}
            //       projectId={id}
            //       userId={session?.user?.id}
            //       projectRole={projectRole}
            //       promptGuideOpenStatus={promptGuideOpenStatus}
            //       selectedAIModel={selectedAIModel}
            //       username={session?.user?.name || ""}
            //       setDisableTab={setDisableTab}
            //       onSetPromptTextRef={onSetPromptTextRef}
            //     />
            //   ),
            // },
             
            {
              disabled: disableTab,
              forceRender: true,
              key: "library",
              label: (
                <div className="flex items-center gap-2 px-2 py-1 w-full">
                  <Star size={20} />
                  <span className="text-base font-medium">Library</span>
                </div>
              ),
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
              label: (
                <div className="flex items-center gap-2 px-2 py-1 w-full">
                  <Folders size={20} />
                  <span className="text-base font-medium">All Activity</span>
                </div>
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
          ]}
        />
      </div>
    </div>
  );
};

export default GenerateImagePage;
