import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tooltip,
  Dropdown,
  Button,
  Avatar,
} from "antd";
import { CalendarOutlined, MoreOutlined } from "@ant-design/icons";
import { AudioLines } from "lucide-react";
import { IProject } from "@/app/common/project.type";
import { formatNumber } from "@/app/utils/format";
import useResponsive from "@/app/hooks/useResponsive";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { aiCaveColors } from "@/app/theme/themeConfig";
import { pickByName, projectInitials } from "./project-card-marks";

export type ProjectPreview = { id: string; url: string; isVideo: boolean; isAudio: boolean; poster?: string };

const PREVIEW_HEIGHT = 104;
const AVATAR_COLORS = [aiCaveColors.primary, aiCaveColors.avatarBlue, aiCaveColors.avatarPink] as const;

/** Status as a tinted pill (DESIGN.md Project card): mint for Active, red for Deleted, readable tone per mode. */
export const ProjectStatusPill: React.FC<{ deleted: boolean; semantic: any }> = ({ deleted, semantic }) => {
  const { mode } = useThemeMode();
  const mintText = mode === "dark" ? aiCaveColors.darkMintText : semantic.colorInfoText;
  const tone = deleted ? semantic.colorErrorText : mintText;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 24,
        padding: "0 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        color: tone,
        background: `color-mix(in srgb, ${tone} ${deleted ? 12 : 14}%, ${semantic.colorBgContainer})`,
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />
      {deleted ? "Deleted" : "Active"}
    </span>
  );
};

/** A project with no work yet: its initials on the brand gradient with faint rings (grey once deleted). */
const ProjectInitialsPlate: React.FC<{ name: string; deleted: boolean; semantic: any }> = ({ name, deleted, semantic }) => {
  const { mode } = useThemeMode();
  const ink = deleted ? semantic.colorTextSecondary : aiCaveColors.neutral100;
  const plate = deleted
    ? mode === "dark"
      ? aiCaveColors.neutral700
      : aiCaveColors.lightRaised
    : `linear-gradient(135deg, ${semantic.colorPrimary} 0%, ${aiCaveColors.primaryDark} 100%)`;
  return (
    <div
      aria-hidden
      style={{ position: "relative", height: PREVIEW_HEIGHT, overflow: "hidden", background: plate, color: ink }}
    >
      <span
        style={{
          position: "absolute",
          left: 24,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 56,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {projectInitials(name)}
      </span>
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        style={{ position: "absolute", right: -40, top: "50%", transform: "translateY(-50%)", opacity: 0.22 }}
      >
        {[18, 46, 74, 102].map((r) => (
          <circle key={r} cx="110" cy="110" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
        ))}
        <circle cx="110" cy="110" r="3" fill="currentColor" />
      </svg>
    </div>
  );
};

interface ProjectGridViewProps {
  projects: IProject[];
  /** Latest finished works per project id; missing = not loaded or none. */
  previews?: Record<string, ProjectPreview[]>;
  semantic: any;
  onClickProject: (projectId: string) => void;
  formatDate: (dateString: string) => string;
  showActionMenu?: boolean;
  projectActionItems?: any[];
  onClickProjectAction?: (action: string, project: IProject) => void;
}

/** The card's colour comes from the project's own work: one large tile plus two, or a quiet placeholder. */
const ProjectPreviewStrip: React.FC<{ items?: ProjectPreview[]; semantic: any; name: string; deleted: boolean }> = ({
  items,
  semantic,
  name,
  deleted,
}) => {
  const shown = (items ?? []).slice(0, 3);
  // Tiles that finished (loaded or failed); the strip reveals once every tile has, so they appear together.
  const [settled, setSettled] = useState(0);
  const settle = () => setSettled((n) => n + 1);
  // Audio tiles draw an icon, so only image/video tiles are waited on.
  const ready = !!items && settled >= shown.filter((p) => !p.isAudio).length;
  // Loaded and empty: the project's initials, so the card reads as new, not broken.
  if (items && shown.length === 0) {
    return <ProjectInitialsPlate name={name} deleted={deleted} semantic={semantic} />;
  }
  const media = (p: ProjectPreview) =>
    p.isAudio ? (
      <div style={{ ...tileMediaStyle, display: "grid", placeItems: "center", color: semantic.colorTextSecondary }}>
        <AudioLines size={24} aria-hidden />
      </div>
    ) : p.isVideo && !p.poster ? (
      // Older videos have no thumbnail; #t=0.1 makes the browser fetch and paint a frame.
      // loadedmetadata, not loadeddata: Safari never fires loadeddata under preload="metadata".
      <video
        src={`${p.url}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        style={tileMediaStyle}
        onLoadedMetadata={settle}
        onError={settle}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.poster ?? p.url}
        alt=""
        loading="lazy"
        decoding="async"
        style={tileMediaStyle}
        onLoad={settle}
        // An expired link leaves the grey tile instead of a broken-image icon.
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
          settle();
        }}
      />
    );
  return (
    <div
      aria-hidden
      className={`project-preview-strip${ready ? " is-ready" : ""}`}
      style={{
        height: PREVIEW_HEIGHT,
        display: "grid",
        gap: 2,
        gridTemplateColumns: shown.length > 1 ? "2fr 1fr" : "1fr",
        gridTemplateRows: shown.length > 2 ? "1fr 1fr" : "1fr",
        background: semantic.colorFillSecondary,
      }}
    >
      {shown.length === 0 ? null : (
        shown.map((p, i) => (
          <div key={p.id} style={{ overflow: "hidden", gridRow: i === 0 && shown.length > 2 ? "1 / 3" : undefined }}>
            {media(p)}
          </div>
        ))
      )}
    </div>
  );
};

const tileMediaStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

const ProjectGridView: React.FC<ProjectGridViewProps> = ({
  projects,
  previews = {},
  semantic,
  onClickProject,
  formatDate,
  showActionMenu = false,
  projectActionItems = [],
  onClickProjectAction,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { mode } = useThemeMode();
  const mintText = mode === "dark" ? aiCaveColors.darkMintText : semantic.colorInfoText;
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  return (
    <>
      <Row
        className="project-grid-shell"
        gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}
        style={{
          padding: isMobile ? "12px" : isTablet ? "16px" : "16px 24px 24px",
          margin: 0,
          width: "100%",
        }}
      >
        {projects.map((project, index) => {
          const creditUsed = project.usedCreditAllowance
          const creditTotal = project.limitCreditAllowance ?? 0;
          const creditLeft = Math.max(0, creditTotal - (creditUsed ?? 0));
          // Below 10% left the line turns warning and says so in words, not colour alone.
          const lowCredit = creditTotal > 0 && creditLeft / creditTotal < 0.1;
          return (
            <Col xs={24} sm={12} md={12} lg={8} xl={6} key={project.id}>
              <Card
                className="project-grid-card"
                role="link"
                tabIndex={0}
                aria-label={`Open project ${project.name}`}
                style={{
                  // `as string`: CSSProperties has no type for custom properties.
                  ["--project-focus" as string]: semantic.colorPrimary,
                  backgroundColor: semantic.colorBgContainer,
                  // Elevation is the border alone; hover only changes its colour.
                  border: `1px solid ${hoveredCardId === project.id ? semantic.colorPrimaryBorder : semantic.colorBorder}`,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 160ms ease",
                  animation: `projectCardIn 320ms ease ${Math.min(index * 35, 220)}ms both`,
                }}
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                styles={{ body: { padding: 0 } }}
                onClick={() => onClickProject(project.id)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClickProject(project.id);
                  }
                }}
              >
                <ProjectPreviewStrip
                  // New works remount the strip so the settled count starts over.
                  key={(previews[project.id] ?? []).map((p) => p.id).join() || "none"}
                  items={previews[project.id]}
                  semantic={semantic}
                  name={project.name}
                  deleted={project.status === "deleted"}
                />
                <div style={{ padding: isMobile ? 14 : 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Tooltip title={project.name} placement="top" mouseEnterDelay={0.5}>
                        <Typography.Title
                          level={2}
                          ellipsis
                          style={{
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 600,
                            lineHeight: 1.35,
                            color: semantic.colorTextBase,
                          }}
                        >
                          {project.name}
                        </Typography.Title>
                      </Tooltip>
                    </div>
                    <ProjectStatusPill deleted={project.status === "deleted"} semantic={semantic} />
                    {showActionMenu && projectActionItems.length > 0 && onClickProjectAction ? (
                      <Dropdown
                        disabled={project.status === "deleted"}
                        menu={{
                          items: projectActionItems,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            onClickProjectAction(e.key, project);
                          },
                        }}
                        placement="bottomRight"
                      >
                        <Button
                          className="project-grid-action-btn"
                          type="text"
                          aria-label={`Actions for ${project.name}`}
                          icon={<MoreOutlined style={{ fontSize: 18 }} />}
                          onClick={(e) => e.stopPropagation()}
                          // Narrow and pulled to the edge so the status pill sits near the right edge, as in the reference.
                          style={{ color: semantic.colorTextSecondary, borderRadius: 8, width: 28, minWidth: 28, height: 28, marginRight: -6 }}
                        />
                      </Dropdown>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontVariantNumeric: "tabular-nums" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      {creditTotal > 0 ? (
                        <>
                          {/* Left label sits over the grey (used) part, right label over the coloured (left) part. */}
                          <span style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.1, color: semantic.colorTextBase, whiteSpace: "nowrap" }}>
                            {formatNumber(creditUsed ?? 0)}
                            <span style={{ fontSize: 14, fontWeight: 400, color: semantic.colorTextSecondary }}>
                              {" "}/ {formatNumber(creditTotal)} used
                            </span>
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              fontWeight: 600,
                              // Untouched credit reads mint, as in the reference; low keeps the warning rule.
                              color: lowCredit
                                ? semantic.colorWarningText
                                : (creditUsed ?? 0) === 0
                                  ? mintText
                                  : semantic.colorTextBase,
                            }}
                          >
                            {lowCredit ? "Low · " : ""}
                            {formatNumber(creditLeft)} left
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 15, color: semantic.colorTextSecondary, lineHeight: "29px" }}>No credit assigned</span>
                      )}
                    </div>
                    {/* Same order as the generate-panel quota: used is grey on the left, what is left is coloured on the right (gold when low). */}
                    <div
                      className="project-credit-bar"
                      role="img"
                      aria-label={
                        creditTotal > 0
                          ? `${formatNumber(creditLeft)} of ${formatNumber(creditTotal)} credits left`
                          : "No credit assigned"
                      }
                      style={{ display: "flex", gap: 1, height: 6, borderRadius: 999, overflow: "hidden", background: semantic.colorFillSecondary }}
                    >
                      {creditTotal > 0 && (creditUsed ?? 0) > 0 ? (
                        <span
                          style={{
                            width: `${Math.max(2, Math.min(100, ((creditUsed ?? 0) / creditTotal) * 100))}%`,
                            background: semantic.colorTextSecondary,
                            opacity: 0.55,
                          }}
                        />
                      ) : null}
                      {creditTotal > 0 && creditLeft > 0 ? (
                        <span style={{ flex: 1, background: lowCredit ? semantic.gold : semantic.colorInfoText, opacity: 0.85 }} />
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Real people instead of a generic person icon. */}
                    <Avatar.Group
                      size={26}
                      max={{
                        count: 3,
                        style: { background: semantic.colorFillSecondary, color: semantic.colorTextBase, fontSize: 11 },
                      }}
                    >
                      {(project.members ?? []).map((m) => {
                        const name = m.users?.fullname || m.users?.username || "Member";
                        return (
                          <Tooltip key={m.id} title={name}>
                            <Avatar
                              style={{
                                // One colour per person across cards (white initials ≥4.5:1 on each).
                                background: pickByName(name, AVATAR_COLORS),
                                color: aiCaveColors.neutral100,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {name.slice(0, 2).toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        );
                      })}
                    </Avatar.Group>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: semantic.colorTextSecondary }}>
                      <CalendarOutlined />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <style jsx global>{`
        .project-grid-card:focus-visible {
          outline: 2px solid var(--project-focus);
          outline-offset: 2px;
        }

        /* Actions stay reachable on touch screens and by keyboard, not only on hover. */
        .project-grid-action-btn {
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .project-grid-card:hover .project-grid-action-btn,
        .project-grid-card:focus-within .project-grid-action-btn {
          opacity: 1;
        }
        @media (hover: none) {
          .project-grid-action-btn {
            opacity: 1;
            min-width: 44px;
            min-height: 44px;
          }
        }
        /* One authored moment: the credit bar fills once as the list loads. */
        .project-grid-card .project-credit-bar {
          animation: projectCreditReveal 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes projectCreditReveal {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        /* Cover tiles wait under one shimmer, then fade in together. */
        .project-preview-strip {
          position: relative;
          overflow: hidden;
        }
        .project-preview-strip > div {
          opacity: 0;
          transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .project-preview-strip.is-ready > div {
          opacity: 1;
        }
        .project-preview-strip:not(.is-ready)::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.06) 50%, transparent 70%);
          animation: projectPreviewShimmer 1.4s ease-in-out infinite;
        }
        @keyframes projectPreviewShimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .project-grid-card,
          .project-grid-card .project-credit-bar,
          .project-preview-strip::after {
            animation: none !important;
          }
          .project-preview-strip > div {
            transition: none;
          }
        }

        @keyframes projectCardIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default ProjectGridView;
