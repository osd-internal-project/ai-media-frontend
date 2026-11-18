import { Drawer, Space, Typography, Switch } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState, type FC } from "react";
import { usePageHeader } from "@/app/context/PageHeaderContext";
import type { IProject } from "@/app/common/project.type";
import useResponsive from "@/app/hooks/useResponsive";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import GuideTourButton from "@/app/components/guide-tour/GuideTourButton";
import { workPageGuide } from "@/app/components/guide-tour/tour-steps";

export interface props {
  teamView?: boolean;
  setTeamView?: (value: boolean) => void;
  getProject?: IProject;
  activeKey?: string;
  promptGuideOpenStatus?: boolean;
  onPromptGuideToggle?: () => void;
  onSetPromptText?: (id: number) => void;
  onChangeTab?: (key: string) => void;
}

const subtitleByTab: Record<string, string> = {
  image: "Shake up your creativity with image generation",
  video: "Bring your ideas to life with video generation",
  omnihumen: "Turn a photo and voice into a talking human",
  dreamactor: "Animate a character from a reference video",
  audio: "Create voice and sound from text",
};

const HeaderGenerateImagePage: FC<props> = ({
  teamView,
  setTeamView,
  getProject,
  activeKey,
  promptGuideOpenStatus,
  onPromptGuideToggle,
  onSetPromptText,
  onChangeTab,
}) => {
  const [open, setOpen] = useState(false);
  const [promptBuilderOpen, setPromptBuilderOpen] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const { setPageHeader } = usePageHeader();
  const projectName = getProject?.name || "Project";
  const projectStatus = (getProject?.status || "active").toLowerCase() === "deleted" ? "Deleted" : "Active";
  const subtitle = subtitleByTab[activeKey ?? ""] ?? "Create, organize, and share your project media";

  useEffect(() => {
    setPageHeader(isMobile ? null : { name: projectName, status: projectStatus, subtitle });
    return () => setPageHeader(null);
  }, [isMobile, projectName, projectStatus, subtitle, setPageHeader]);

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

  const titleSection = useMemo(() => (
    <div className="flex flex-col gap-0">
      <Space size={8} align="center" wrap>
        <Typography.Title
          level={isMobile ? 5 : isTablet ? 4 : 3}
          style={{ margin: 0, color: semantic.colorTextBase, fontSize: isMobile ? 15 : isTablet ? 16 : 18, lineHeight: 1.25 }}
        >
          {getProject?.name || "Project"}
        </Typography.Title>
        {/* Same status mark as the desktop breadcrumb: a dot and a word, not a pill. */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: semantic.colorTextSecondary }}>
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: projectStatus === "Deleted" ? semantic.colorError : semantic.colorSuccess,
            }}
          />
          {projectStatus}
        </span>
      </Space>
      <Typography.Text
        style={{
          color: semantic.colorTextSecondary,
          fontSize: isMobile ? 11 : 12,
          lineHeight: 1.2,
        }}
      >
        {subtitleByTab[activeKey ?? ""] ?? "Create, organize, and share your project media"}
      </Typography.Text>
    </div>
  ), [isMobile, isTablet, semantic, getProject?.name, getProject?.status, activeKey]);

  return (
    <>
      {/* Desktop/tablet show the project in the app header and the controls in the tab bar. */}
      {isMobile && (
        <div
          className="w-full"
          style={{
            padding: "6px 8px",
            backgroundColor: semantic.colorBgContainer,
            borderBottom: `1px solid ${semantic.colorBorder}`,
          }}
        >
          {titleSection}
          <div style={{ marginTop: 6 }}>
            <ProjectViewControls
              teamView={teamView}
              setTeamView={setTeamView}
              activeKey={activeKey}
              onChangeTab={onChangeTab}
            />
          </div>
        </div>
      )}

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <BulbOutlined />
            <span>Prompt Guide</span>
          </div>
        }
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
        width={isMobile ? "92%" : isTablet ? "78%" : 600}
        placement={isMobile ? "bottom" : "right"}
        height={isMobile ? "78%" : undefined}
        // Dark keeps gray-300; light uses the secondary text token. Cast: CSSProperties has no custom properties.
        styles={{
          body: {
            "--guide-text":
              mode === "dark" ? "#D1D5DB" : semantic.colorTextSecondary,
          } as React.CSSProperties,
        }}
      >
        <div className="space-y-6">
          {/* Introduction */}
          <p className="text-[var(--guide-text)] leading-relaxed">
            {`This article introduces prompt usage tips for Seedream 4.0's
            text-to-image generation, image editing, reference-based generation
            and multi-image creation, helping you quickly get started with video
            creation and turn ideas into image creations.`}
          </p>

          {/* General Guidelines Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">General Guidelines</h2>
            <p className="text-[var(--guide-text)] leading-relaxed">
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
              <p className="text-[var(--guide-text)] mb-3">
                Use coherent natural language to describe the subject + action +
                environment. If aesthetics matter, include descriptors of style,
                color, lighting, or composition.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-[var(--guide-text)]">
                  <span className="text-green-400">• Recommended:</span> A girl
                  in a lavish dress walking under a parasol along a tree-lined
                  path, in the style of a Monet oil painting.
                </li>
                <li className="text-[var(--guide-text)]">
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
              <p className="text-[var(--guide-text)] mb-3">
                If you have a specific use case, explicitly state the image
                purpose and type in your prompt.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-[var(--guide-text)]">
                  <span className="text-green-400">• Recommended:</span>
                  {` Design
                  a logo for a gaming company. The logo features a dog playing
                  with a game controller. The company name "PITBULL" is written
                  on it.`}
                </li>
                <li className="text-[var(--guide-text)]">
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
              <p className="text-[var(--guide-text)]">
                If a particular style is needed, use precise style keywords or
                reference images to achieve better results.
              </p>
            </div>

            {/* Guideline 4 */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                4. Improve text rendering accuracy
              </h3>
              <p className="text-[var(--guide-text)] mb-3">
                Use double quotation marks for the text that needs to appear in
                the generated image.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-[var(--guide-text)]">
                  <span className="text-green-400">• Recommended:</span>{" "}
                  {`Generate a poster with the title "Seedream 4.0".`}
                </li>
                <li className="text-[var(--guide-text)]">
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
              <p className="text-[var(--guide-text)] mb-3">
                Use concise, unambiguous instructions for modifications. Avoid
                vague pronouns. If other elements should remain unchanged,
                specify that explicitly.
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-[var(--guide-text)]">
                  <span className="text-green-400">• Recommended:</span> Dress
                  the tallest panda in pink Peking Opera costume and headgear,
                  keeping its pose unchanged.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

type ViewControlsProps = Pick<props, "teamView" | "setTeamView" | "activeKey" | "onChangeTab">;

/** Team/Personal switch and the guide-tour button; tab bar on desktop, project row on mobile. */
export const ProjectViewControls: FC<ViewControlsProps> = ({ teamView, setTeamView, activeKey, onChangeTab }) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const guide = useMemo(() => workPageGuide(activeKey ?? "image"), [activeKey]);
  return (
    <div className="flex items-center gap-3">
      <div data-tour="view-switch" className="flex items-center gap-2">
        <span style={{ color: semantic.colorTextSecondary, fontSize: 13 }}>View</span>
        <Switch
          checkedChildren="Team"
          unCheckedChildren="Personal"
          defaultChecked
          value={teamView}
          onChange={setTeamView}
        />
      </div>
      <GuideTourButton guide={guide} activeTab={activeKey} onSelectTab={onChangeTab} />
    </div>
  );
};

export default HeaderGenerateImagePage;
