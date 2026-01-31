import { Button, Drawer, Select, Tooltip, Space } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import React, { useState, useEffect, type FC } from "react";
import { LightbulbIcon } from "lucide-react";
import type { IProject } from "@/app/common/project.type";
import type { TAIModel } from "@/app/common/ai-model.type";

export interface props {
  getProject?: IProject;
  activeKey?: string;
  selectedAIModel?: (TAIModel & { capabilities?: string[] }) | null;
  filteredAIModels?: TAIModel[];
  onAIModelChange?: (value: string) => void;
  promptGuideOpenStatus?: boolean;
  onPromptGuideToggle?: () => void;
  promptGuideTypes?: any[];
  onSetPromptText?: (id: number) => void;
}

const HeaderGenerateImagePage: FC<props> = ({
  getProject,
  activeKey,
  selectedAIModel,
  filteredAIModels,
  onAIModelChange,
  promptGuideOpenStatus,
  onPromptGuideToggle,
  promptGuideTypes = [],
  onSetPromptText,
}) => {
  const [open, setOpen] = useState(false);
  const [promptBuilderOpen, setPromptBuilderOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1400 && window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // const showPromptBuilderDrawer = () => {
  //   setPromptBuilderOpen(true);
  // };

  // const onPromptBuilderClose = () => {
  //   setPromptBuilderOpen(false);
  // };

  const TitleSection = () => (
    <div className="flex flex-col">
      <span
        className={`font-bold ${isMobile || isTablet ? "text-xl" : "text-2xl"}`}
      >
        {`${getProject?.name}`}
      </span>
      <span
        className={`text-[#9B9C9E] ${
          isMobile || isTablet ? "text-sm" : "text-md"
        }`}
      >
        {`Shake up your creativity with image generation`}
      </span>
    </div>
  );

  return (
    <div className="bg-black w-full p-4 pt-0 rounded-t-2xl">
      {/* Mobile: Title at top */}
      {isMobile && (
        <div className="mb-4">
          <TitleSection />
        </div>
      )}

      {/* Controls section */}
      <div
        className={`flex ${
          isMobile
            ? "flex-col space-y-4"
            : isTablet
              ? "flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0"
              : "justify-between items-center"
        }`}
      >
        {/* Desktop/Tablet: Title on left */}
        {!isMobile && (
          <div className="flex-shrink-0">
            <TitleSection />
          </div>
        )}

        {/* Controls wrapper */}
        <div
          className={`flex ${
            isMobile
              ? "items-center gap-1 justify-end flex-nowrap"
              : isTablet
                ? "flex-wrap gap-3 justify-end"
                : "items-center gap-4"
          }`}
        >
          {(activeKey === "image" || activeKey === "vdo") && (
            <>
              {/* AI Model Selection */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-600">
                  AI Model:
                </span>
                <Select
                  size="middle"
                  style={{
                    minWidth: isMobile ? 160 : isTablet ? 250 : 280,
                    width: "auto",
                  }}
                  className="dark-select"
                  placeholder="Choose an AI model"
                  value={selectedAIModel?.id?.toString()}
                  onChange={onAIModelChange}
                  optionLabelProp="label"
                >
                  {filteredAIModels
                    ? filteredAIModels.map((model) => (
                        <Select.Option
                          key={model.id}
                          value={model.id.toString()}
                          label={model.name}
                        >
                          <Tooltip
                            title={
                              <div className="p-4 max-w-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium text-white">
                                    {model.name}
                                  </div>
                                  {selectedAIModel?.id === model.id && (
                                    <div className="text-blue-400 text-xs">
                                      ✓ Selected
                                    </div>
                                  )}
                                </div>

                                {model.modelDetails?.description && (
                                  <div className="text-gray-300 text-sm leading-relaxed mb-3">
                                    {model.modelDetails.description}
                                  </div>
                                )}

                                {model.modelDetails?.modelId && (
                                  <div className="mb-3">
                                    <div className="text-gray-400 text-xs mb-1">
                                      Model ID
                                    </div>
                                    <div className="text-gray-200 text-sm font-mono">
                                      {model.modelDetails.modelId}
                                    </div>
                                  </div>
                                )}

                                {model.modelDetails?.pricing && (
                                  <div className="mb-3">
                                    <div className="text-gray-400 text-xs mb-1">
                                      Pricing
                                    </div>
                                    <div className="flex gap-4">
                                      {model.modelDetails.pricing
                                        .imageToVideo && (
                                        <div>
                                          <div className="text-gray-300 text-xs">
                                            Image-to-video
                                          </div>
                                          <div className="text-white font-medium">
                                            {
                                              model.modelDetails.pricing
                                                .imageToVideo
                                            }{" "}
                                            {model.modelDetails.pricing.unit ||
                                              "USD/M tokens"}
                                          </div>
                                        </div>
                                      )}
                                      {model.modelDetails.pricing
                                        .textToVideo && (
                                        <div>
                                          <div className="text-gray-300 text-xs">
                                            Text-to-video
                                          </div>
                                          <div className="text-white font-medium">
                                            {
                                              model.modelDetails.pricing
                                                .textToVideo
                                            }{" "}
                                            {model.modelDetails.pricing.unit ||
                                              "USD/M tokens"}
                                          </div>
                                        </div>
                                      )}
                                      {model.modelDetails.pricing
                                        .imageToImage && (
                                        <div>
                                          <div className="text-gray-300 text-xs">
                                            Image-to-image
                                          </div>
                                          <div className="text-white font-medium">
                                            {
                                              model.modelDetails.pricing
                                                .imageToImage
                                            }{" "}
                                            {model.modelDetails.pricing.unit ||
                                              "USD/Piece"}
                                          </div>
                                        </div>
                                      )}
                                      {model.modelDetails.pricing
                                        .textToImage && (
                                        <div>
                                          <div className="text-gray-300 text-xs">
                                            Text-to-image
                                          </div>
                                          <div className="text-white font-medium">
                                            {
                                              model.modelDetails.pricing
                                                .textToImage
                                            }{" "}
                                            {model.modelDetails.pricing.unit ||
                                              "USD/Piece"}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {(model.modelDetails?.limitations?.resolution ||
                                  model.modelDetails?.limitations?.duration ||
                                  model.modelDetails?.limitations?.frameRate ||
                                  model.modelDetails?.limitations
                                    ?.concurrentTasks ||
                                  model.modelDetails?.limitations?.rpm) && (
                                  <div className="mb-3">
                                    <div className="text-gray-400 text-xs mb-1">
                                      Limitations
                                    </div>
                                    <div className="space-y-1">
                                      {model.modelDetails.limitations
                                        ?.resolution && (
                                        <div className="text-gray-300 text-sm">
                                          <span className="text-gray-400">
                                            Resolution:
                                          </span>{" "}
                                          {model.modelDetails.limitations.resolution.join(
                                            ", ",
                                          )}
                                        </div>
                                      )}
                                      {model.modelDetails.limitations
                                        ?.duration && (
                                        <div className="text-gray-300 text-sm">
                                          <span className="text-gray-400">
                                            Duration:
                                          </span>{" "}
                                          {
                                            model.modelDetails.limitations
                                              .duration
                                          }
                                        </div>
                                      )}
                                      {model.modelDetails.limitations
                                        ?.frameRate && (
                                        <div className="text-gray-300 text-sm">
                                          <span className="text-gray-400">
                                            Frame rate:
                                          </span>{" "}
                                          {
                                            model.modelDetails.limitations
                                              .frameRate
                                          }
                                        </div>
                                      )}
                                      {model.modelDetails.limitations
                                        ?.concurrentTasks && (
                                        <div className="text-gray-300 text-sm">
                                          <span className="text-gray-400">
                                            Concurrent tasks:
                                          </span>{" "}
                                          {
                                            model.modelDetails.limitations
                                              .concurrentTasks
                                          }
                                        </div>
                                      )}
                                      {model.modelDetails.limitations?.rpm && (
                                        <div className="text-gray-300 text-sm">
                                          <span className="text-gray-400">
                                            RPM:
                                          </span>{" "}
                                          {model.modelDetails.limitations.rpm}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {model.modelDetails?.status && (
                                  <div className="mb-3">
                                    <div className="text-gray-400 text-xs mb-1">
                                      Status
                                    </div>
                                    <div
                                      className={`inline-block px-2 py-1 text-xs rounded ${
                                        model.modelDetails.status ===
                                        "Activated"
                                          ? "bg-green-600 text-white"
                                          : "bg-gray-600 text-gray-200"
                                      }`}
                                    >
                                      {model.modelDetails.status}
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1 mt-2">
                                  {model.capabilities?.map(
                                    (capability: string) => (
                                      <span
                                        key={capability}
                                        className="px-2 py-0.5 bg-gray-700 text-xs text-gray-200 rounded"
                                      >
                                        {capability.replace("-", " ")}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            }
                            placement="right"
                            overlayStyle={{ maxWidth: "none" }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{model.name}</span>
                              {selectedAIModel?.id === model.id && (
                                <span className="text-blue-400 ml-2">✓</span>
                              )}
                            </div>
                          </Tooltip>
                        </Select.Option>
                      ))
                    : []}
                </Select>
              </div>

              {/* Action Buttons - Inline with AI Model */}
              {/* <Button
                type={promptGuideOpenStatus ? "primary" : "default"}
                ghost={promptGuideOpenStatus}
                onClick={
                  isMobile ? showPromptBuilderDrawer : onPromptGuideToggle
                }
                size="middle"
              >
                {isMobile ? "Builder" : isTablet ? "Builder" : "Prompt Builder"}
              </Button> */}
              <Tooltip
                title={isMobile ? "Prompt Guide" : undefined}
                placement="top"
              >
                <Button
                  size={isMobile ? "small" : "middle"}
                  type="link"
                  className="!text-[#686B6E]"
                  icon={<LightbulbIcon className="w-4 h-4" />}
                  onClick={showDrawer}
                >
                  {isMobile ? "" : isTablet ? "Guide" : "Prompt Guide"}
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Prompt Builder Drawer - Mobile Only */}
      {/* <Drawer
        title="Prompt Builder"
        closable={{ "aria-label": "Close Builder" }}
        onClose={onPromptBuilderClose}
        open={promptBuilderOpen}
        width={isMobile ? "90%" : "80%"}
        placement={isMobile ? "bottom" : "right"}
        height={isMobile ? "80%" : undefined}
        styles={{
          body: { backgroundColor: "#18181b", color: "white", padding: 0 },
          header: {
            backgroundColor: "#18181b",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          },
          mask: { backgroundColor: "rgba(0,0,0,0.8)" },
        }}
      >
        <div className="h-full bg-[#18181b] text-white overflow-hidden relative">
          <div className="p-4">
            <div className="text-sm h-full">
              <div className="flex-1 h-[calc(100vh-270px)] overflow-y-auto">
                {promptGuideTypes.map((type: any) => (
                  <div key={type.id}>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 mt-2">
                      {type.title}
                    </h3>
                    <div className="space-y-3 w-full">
                      {type.promptGuide?.map((item: any, index: number) => (
                        <Button
                          htmlType="button"
                          key={item.id || index}
                          size="large"
                          onClick={() => {
                            if (item.id && onSetPromptText) {
                              onSetPromptText(item.id);
                              onPromptBuilderClose(); // Close drawer after selection
                            }
                          }}
                          className="w-full !whitespace-normal !break-words !h-auto !p-2 !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center transition-all duration-300 !border-none"
                        >
                          <Space className="">{item.title}</Space>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Drawer> */}

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <LightbulbIcon className="w-5 h-5" />
            <span>Prompt Guide</span>
          </div>
        }
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
        width={isMobile ? "90%" : isTablet ? "80%" : 600}
        placement={isMobile ? "bottom" : "right"}
        height={isMobile ? "80%" : undefined}
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
                  <span className="text-green-400">• Recommended:</span>
                  {` Design
                  a logo for a gaming company. The logo features a dog playing
                  with a game controller. The company name "PITBULL" is written
                  on it.`}
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• Avoid:</span> An abstract
                  image of a dog holding a controller, and the word PITBULL on
                  it.
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
                  <span className="text-green-400">• Recommended:</span>{" "}
                  {`Generate a poster with the title "Seedream 4.0".`}
                </li>
                <li className="text-gray-300">
                  <span className="text-red-400">• Avoid:</span> Generate a
                  poster titled Seedream 4.0.
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
    </div>
  );
};

export default HeaderGenerateImagePage;
