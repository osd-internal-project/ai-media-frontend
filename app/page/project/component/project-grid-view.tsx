import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tooltip,
  Badge,
  Dropdown,
  Button,
  Avatar,
} from "antd";
import { CalendarOutlined, MoreOutlined } from "@ant-design/icons";
import { IProject } from "@/app/common/project.type";
import { formatNumber } from "@/app/utils/format";
import useResponsive from "@/app/hooks/useResponsive";

export type ProjectPreview = { id: string; url: string; isVideo: boolean };

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
const ProjectPreviewStrip: React.FC<{ items?: ProjectPreview[]; semantic: any }> = ({ items, semantic }) => {
  const shown = (items ?? []).slice(0, 3);
  // Loaded and empty: the brand mark on a tinted plate, so the card reads as new, not broken.
  if (items && shown.length === 0) {
    return (
      <div
        aria-hidden
        // A light primary tint over the panel: soft lavender in light, quiet indigo in dark (the raw primaryBg is loud in dark).
        style={{
          height: 132,
          display: "grid",
          placeItems: "center",
          background: `color-mix(in srgb, ${semantic.colorPrimary} 14%, ${semantic.colorBgContainer})`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-mark.png" alt="" style={{ height: 44, width: 44, opacity: 0.9 }} />
      </div>
    );
  }
  const media = (p: ProjectPreview) =>
    p.isVideo ? (
      <video src={p.url} muted playsInline preload="metadata" style={tileMediaStyle} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.url}
        alt=""
        loading="lazy"
        decoding="async"
        style={tileMediaStyle}
        // An expired link leaves the grey tile instead of a broken-image icon.
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
    );
  return (
    <div
      aria-hidden
      style={{
        height: 132,
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
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  return (
    <>
      <Row
        className="project-grid-shell"
        gutter={[isMobile ? 10 : 12, isMobile ? 10 : 12]}
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
                <ProjectPreviewStrip items={previews[project.id]} semantic={semantic} />
                <div style={{ padding: isMobile ? 12 : 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Tooltip title={project.name} placement="top" mouseEnterDelay={0.5}>
                        <Typography.Title
                          level={2}
                          ellipsis
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 600,
                            lineHeight: 1.4,
                            color: semantic.colorTextBase,
                          }}
                        >
                          {project.name}
                        </Typography.Title>
                      </Tooltip>
                      <span style={{ fontSize: 12, color: semantic.colorTextSecondary }}>
                        <Badge
                          color={project.status === "deleted" ? semantic.colorError : semantic.colorSuccess}
                          style={{ marginRight: 6 }}
                        />
                        {project.status === "deleted" ? "Deleted" : "Active"}
                      </span>
                    </div>
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
                          style={{ color: semantic.colorTextSecondary, borderRadius: 8 }}
                        />
                      </Dropdown>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontVariantNumeric: "tabular-nums" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      {creditTotal > 0 ? (
                        <>
                          {/* Left label sits over the grey (used) part, right label over the coloured (left) part. */}
                          <span style={{ fontSize: 16, fontWeight: 600, color: semantic.colorTextBase, whiteSpace: "nowrap" }}>
                            {formatNumber(creditUsed ?? 0)}
                            <span style={{ fontSize: 12, fontWeight: 400, color: semantic.colorTextSecondary }}>
                              {" "}/ {formatNumber(creditTotal)} used
                            </span>
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              whiteSpace: "nowrap",
                              fontWeight: lowCredit ? 600 : 400,
                              color: lowCredit ? semantic.colorWarningText : semantic.colorTextSecondary,
                            }}
                          >
                            {lowCredit ? "Low · " : ""}
                            {formatNumber(creditLeft)} left
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 13, color: semantic.colorTextSecondary }}>No credit assigned</span>
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
                      size={24}
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
                                background: semantic.colorFillSecondary,
                                color: semantic.colorTextBase,
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
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: semantic.colorTextSecondary }}>
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

        @media (prefers-reduced-motion: reduce) {
          .project-grid-card,
          .project-grid-card .project-credit-bar {
            animation: none !important;
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
